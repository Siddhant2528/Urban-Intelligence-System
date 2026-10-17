"""
Area API Endpoints.
Provides ward listing, single ward details with GeoJSON polygons,
facility spatial listings, accessibility metrics, Area UIS calculation,
comparative analysis, AI narratives, and historical timelines.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from geoalchemy2.elements import WKTElement
import shapely.wkt
import shapely.geometry

from app.api.deps import get_db, get_current_government_user
from app.services import area_service
from app.repositories import area_repo, uis_repo, indicator_repo
from app.models.area import Area
from app.models.facility import Facility
from app.models.history import AreaScoreHistory
from app.models.uis import AIInsight, DevelopmentProfile
from app.schemas.area import AreaCreate
from app.ai.insight_generator import generate_area_narrative, generate_comparative_narrative
from app.gis.spatial_utils import geometry_to_geojson, to_shapely_geometry
from app.gis.accessibility import calculate_coverage_percentage
from app.core.exceptions import EntityNotFoundException, CalculationException, UISBaseException

router = APIRouter(prefix="/areas", tags=["Areas"])


@router.get("/")
def list_areas(db: Session = Depends(get_db)):
    """Get all municipal wards with boundary GeoJSON and demographics."""
    areas = area_repo.get_all_areas(db)
    results = []
    for a in areas:
        results.append({
            "id": a.id,
            "name": a.name,
            "population": a.population,
            "population_source": a.population_source,
            "geometry": geometry_to_geojson(a.geometry),
            "created_at": a.created_at,
        })
    return {"areas": results, "total": len(results)}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_area(
    area_in: AreaCreate,
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),
):
    """
    Register a new municipal area/ward with PostGIS Polygon geometry.
    Accepts polygon_wkt or geojson coordinates. Requires government privileges.
    """
    existing = area_repo.get_area_by_name(db, area_in.name)
    if existing:
        raise UISBaseException(
            message=f"An area named '{area_in.name}' already exists.",
            status_code=status.HTTP_409_CONFLICT,
            error_code="AREA_ALREADY_EXISTS"
        )

    wkt_str = area_in.polygon_wkt
    if not wkt_str and area_in.geojson:
        shape = shapely.geometry.shape(area_in.geojson)
        wkt_str = shape.wkt

    if not wkt_str:
        raise CalculationException("Either 'polygon_wkt' or 'geojson' polygon must be provided.")

    new_area = Area(
        name=area_in.name,
        population=area_in.population,
        population_source=area_in.population_source,
        geometry=WKTElement(wkt_str, srid=4326),
    )
    db.add(new_area)
    db.commit()
    db.refresh(new_area)

    return {
        "status": "success",
        "id": new_area.id,
        "name": new_area.name,
        "population": new_area.population,
        "geometry": geometry_to_geojson(new_area.geometry),
    }


@router.get("/compare")
async def compare_areas(
    area_ids: str = Query(..., description="Comma-separated IDs of areas to compare (e.g. '1,2')"),
    db: Session = Depends(get_db),
):
    """
    Compare 2 or more areas side-by-side on overall UIS and indicator categories.
    Includes an AI/rule-based comparative narrative explaining the equity gap.
    """
    try:
        parsed_ids = [int(i.strip()) for i in area_ids.split(",") if i.strip()]
    except ValueError:
        raise CalculationException("area_ids parameter must be comma-separated integers.")

    if len(parsed_ids) < 2:
        raise CalculationException("At least 2 area IDs are required for comparative analysis.")

    comparison_data = []
    for aid in parsed_ids:
        area = area_repo.get_area_by_id(db, aid)
        if not area:
            raise EntityNotFoundException("Area", aid)

        uis = uis_repo.get_latest_area_uis(db, aid)
        scores_raw = indicator_repo.get_indicator_scores_for_area(db, aid)
        weights = indicator_repo.get_latest_weights(db, aid)

        comparison_data.append({
            "area_id": area.id,
            "area_name": area.name,
            "population": area.population,
            "area_uis": uis.score if uis else 0.0,
            "indicator_scores": {
                s.category.lower(): {"score": s.score, "raw_metric": s.raw_metric, "unit": getattr(s, "unit", "")}
                for s in scores_raw
            },
            "weights": weights,
        })

    # Compute category differences between first two areas for the narrative
    a1, a2 = comparison_data[0], comparison_data[1]
    all_cats = set(a1["indicator_scores"].keys()).union(set(a2["indicator_scores"].keys()))
    diff_list = []
    for cat in all_cats:
        s1 = a1["indicator_scores"].get(cat, {}).get("score", 0.0)
        s2 = a2["indicator_scores"].get(cat, {}).get("score", 0.0)
        diff_list.append({
            "category": cat.capitalize(),
            "score_a": s1,
            "score_b": s2,
            "diff": round(s1 - s2, 2),
        })

    narrative = await generate_comparative_narrative(
        area_a_name=a1["area_name"],
        score_a=a1["area_uis"],
        area_b_name=a2["area_name"],
        score_b=a2["area_uis"],
        differences=diff_list,
    )

    return {
        "compared_areas": comparison_data,
        "category_differences": diff_list,
        "comparative_analysis": narrative,
    }


@router.get("/{area_id}")
def get_area(area_id: int, db: Session = Depends(get_db)):
    """Get single ward details including boundary GeoJSON."""
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)
    return {
        "id": area.id,
        "name": area.name,
        "population": area.population,
        "population_source": area.population_source,
        "geometry": geometry_to_geojson(area.geometry),
        "created_at": area.created_at,
    }


@router.get("/{area_id}/facilities")
def get_area_facilities(
    area_id: int,
    facility_type: Optional[str] = Query(None, description="Filter: hospital, school, police, transit_stop"),
    db: Session = Depends(get_db),
):
    """
    Get all physical facilities (POIs) spatially situated within this ward.
    Formats coordinates as {lat, lng} for direct map rendering in the frontend.
    """
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    facilities = area_repo.get_facilities_in_area(db, area_id, facility_type=facility_type)

    results = []
    for f in facilities:
        point_shape = to_shapely_geometry(f.geometry)
        results.append({
            "id": f.id,
            "osm_id": f.osm_id,
            "area_id": f.area_id,
            "area_name": area.name,
            "name": f.name,
            "facility_type": f.facility_type,
            "category": f.facility_type.capitalize(),
            "coordinates": {
                "lat": round(point_shape.y, 6),
                "lng": round(point_shape.x, 6),
            },
            "collected_at": f.collected_at,
        })

    return {
        "area_id": area_id,
        "area_name": area.name,
        "total_facilities": len(results),
        "facilities": results,
    }


@router.get("/{area_id}/accessibility")
def get_area_accessibility(area_id: int, db: Session = Depends(get_db)):
    """
    Get spatial accessibility coverage percentages for this ward across categories
    (Healthcare, Education, Transport, Safety) using 2 km radius buffer analysis.
    """
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    poly_shape = to_shapely_geometry(area.geometry)
    centroid = poly_shape.centroid

    # Sample centroid population point
    pop_points = [{"lat": centroid.y, "lon": centroid.x, "weight": area.population or 10000}]

    categories = ["hospital", "school", "transit_stop", "police"]
    accessibility_metrics = []

    for cat in categories:
        facilities = db.query(Facility).filter(Facility.facility_type == cat).all()
        fac_coords = []
        for f in facilities:
            pt = to_shapely_geometry(f.geometry)
            fac_coords.append({"lat": pt.y, "lon": pt.x})

        threshold_km = 2.0 if cat in ["hospital", "school"] else 1.0
        coverage = calculate_coverage_percentage(pop_points, fac_coords, threshold_km=threshold_km)

        accessibility_metrics.append({
            "category": cat.capitalize(),
            "coverage_percentage": coverage["coverage_percentage"],
            "threshold_km": threshold_km,
            "facilities_in_range": coverage.get("facilities_count", 0),
        })

    return {
        "area_id": area_id,
        "area_name": area.name,
        "accessibility_metrics": accessibility_metrics,
    }


@router.get("/{area_id}/uis")
def get_area_uis(area_id: int, db: Session = Depends(get_db)):
    """Get latest Area UIS calculation score."""
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    uis = uis_repo.get_latest_area_uis(db, area_id)
    if not uis:
        raise EntityNotFoundException("AreaUIS Score", f"Area {area_id}")

    return {
        "area_id": uis.area_id,
        "area_name": area.name,
        "score": uis.score,
        "methodology_version": uis.methodology_version,
        "snapshot_id": uis.snapshot_id,
        "calculated_at": uis.calculated_at,
    }


@router.post("/{area_id}/calculate")
async def trigger_area_calculation(area_id: int, db: Session = Depends(get_db)):
    """Trigger the complete Area UIS calculation pipeline."""
    result = await area_service.calculate_full_area_uis(db, area_id)
    return {"status": "success", "result": result}


@router.get("/{area_id}/profile")
def get_development_profile(area_id: int, db: Session = Depends(get_db)):
    """Get the latest AI-generated development profile for an area."""
    profile = (
        db.query(DevelopmentProfile)
        .filter(DevelopmentProfile.area_id == area_id)
        .order_by(DevelopmentProfile.generated_at.desc())
        .first()
    )
    if not profile:
        raise EntityNotFoundException("DevelopmentProfile", f"Area {area_id}")
    return profile.profile_json


@router.get("/{area_id}/priority")
def get_area_priority(area_id: int, db: Session = Depends(get_db)):
    """Get priority intervention scores for all indicators in an area."""
    priorities = uis_repo.get_priority_scores(db, area_id)
    if not priorities:
        raise EntityNotFoundException("PriorityScores", f"Area {area_id}")
    return priorities


@router.get("/{area_id}/insights")
async def get_area_insights(area_id: int, db: Session = Depends(get_db)):
    """
    Get or generate an executive qualitative narrative explaining ward performance.
    """
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    uis = uis_repo.get_latest_area_uis(db, area_id)
    if not uis:
        raise EntityNotFoundException("AreaUIS Score", f"Area {area_id}. Calculate first.")

    existing = (
        db.query(AIInsight)
        .filter(AIInsight.area_id == area_id, AIInsight.insight_type == "explanation")
        .order_by(AIInsight.generated_at.desc())
        .first()
    )
    if existing:
        return {
            "area_id": area_id,
            "area_name": area.name,
            "narrative": existing.content,
            "model_used": existing.model_used,
            "generated_at": existing.generated_at,
        }

    scores_raw = indicator_repo.get_indicator_scores_for_area(db, area_id)
    scores_data = [{"category": s.category, "score": s.score} for s in scores_raw]
    profile = (
        db.query(DevelopmentProfile)
        .filter(DevelopmentProfile.area_id == area_id)
        .order_by(DevelopmentProfile.generated_at.desc())
        .first()
    )
    constraints = profile.profile_json.get("constraints", []) if profile else []

    narrative_text = await generate_area_narrative(
        db, area_id=area_id, area_name=area.name,
        area_uis=uis.score, indicator_scores=scores_data,
        constraints=constraints,
    )

    return {
        "area_id": area_id,
        "area_name": area.name,
        "narrative": narrative_text,
        "model_used": "gemini-1.5-flash",
    }


@router.get("/{area_id}/history")
def get_area_history(area_id: int, db: Session = Depends(get_db)):
    """
    Retrieve historical timeline of Area UIS scores for longitudinal trend charts.
    """
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    records = (
        db.query(AreaScoreHistory)
        .filter(AreaScoreHistory.area_id == area_id)
        .order_by(AreaScoreHistory.recorded_at.asc())
        .all()
    )

    return {
        "area_id": area_id,
        "area_name": area.name,
        "total_historical_snapshots": len(records),
        "timeline": [
            {
                "id": r.id,
                "evaluation_period": r.evaluation_period,
                "score": r.score,
                "indicators_breakdown": r.indicators_breakdown,
                "weights_breakdown": r.weights_breakdown,
                "recorded_at": r.recorded_at,
            }
            for r in records
        ],
    }
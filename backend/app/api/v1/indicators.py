"""
Indicator API Router.
Exposes indicator definitions, benchmark ranges, category groupings,
indicator detail pages, and ward-level standardized scores.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_government_user
from app.repositories import indicator_repo, area_repo
from app.services.indicator_service import calculate_and_save_area_indicators
from app.models.indicator import IndicatorDefinition, IndicatorScore
from app.models.data_source import DataSource
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/indicators", tags=["Indicators"])


@router.get("/")
def list_indicator_definitions(db: Session = Depends(get_db)):
    """Retrieve all approved indicator definitions with benchmarks and planning sources."""
    definitions = indicator_repo.get_all_indicator_definitions(db, active_only=True)
    return {
        "total": len(definitions),
        "indicators": [
            {
                "id": d.id,
                "name": d.name,
                "category": d.category,
                "unit": d.unit,
                "direction": d.direction.value,
                "benchmark_min": d.benchmark_min,
                "benchmark_max": d.benchmark_max,
                "benchmark_source": d.benchmark_source,
                "methodology_version": d.methodology_version,
            }
            for d in definitions
        ],
    }


@router.get("/{indicator_id}")
def get_indicator_detail(indicator_id: int, db: Session = Depends(get_db)):
    """
    Get in-depth specification for a specific indicator.
    Includes benchmark parameters, direction formula, citywide average, and data provenance.
    """
    d = indicator_repo.get_indicator_definition_by_id(db, indicator_id)
    if not d:
        raise EntityNotFoundException("IndicatorDefinition", indicator_id)

    # Calculate citywide average score
    avg_score = (
        db.query(func.avg(IndicatorScore.score))
        .filter(IndicatorScore.indicator_id == indicator_id)
        .scalar()
    ) or 0.0

    scores_count = (
        db.query(func.count(IndicatorScore.id))
        .filter(IndicatorScore.indicator_id == indicator_id)
        .scalar()
    ) or 0

    # Look up matching data source
    source = db.query(DataSource).filter(DataSource.category.ilike(f"%{d.category}%")).first()

    return {
        "id": d.id,
        "name": d.name,
        "category": d.category,
        "unit": d.unit,
        "direction": d.direction.value,
        "formula": (
            f"100 * (x - {d.benchmark_min}) / ({d.benchmark_max} - {d.benchmark_min})"
            if d.direction.value == "positive"
            else f"100 * ({d.benchmark_max} - x) / ({d.benchmark_max} - {d.benchmark_min})"
        ),
        "benchmark_min": d.benchmark_min,
        "benchmark_max": d.benchmark_max,
        "benchmark_source": d.benchmark_source,
        "methodology_version": d.methodology_version,
        "citywide_average_score": round(float(avg_score), 2),
        "total_wards_evaluated": scores_count,
        "data_provenance": {
            "source_name": source.name if source else "Municipal Official Registry",
            "update_frequency": source.update_frequency if source else "Monthly",
            "quality_flag": source.quality_flag if source else "verified",
        },
    }


@router.get("/areas/{area_id}")
def get_area_indicator_scores(area_id: str, db: Session = Depends(get_db)):
    """Retrieve the latest calculated indicator scores for an area by ID or name slug."""
    area = area_repo.resolve_area(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    scores = indicator_repo.get_indicator_scores_for_area(db, area.id)
    return {
        "area_id": area.id,
        "area_name": area.name,
        "indicators_count": len(scores),
        "scores": [
            {
                "indicator_id": s.indicator_id,
                "name": getattr(s, "name", f"indicator_{s.indicator_id}"),
                "category": getattr(s, "category", "General"),
                "score": s.score,
                "raw_metric": s.raw_metric,
                "unit": getattr(s, "unit", ""),
                "direction": getattr(s, "direction", "positive"),
                "benchmark_min_used": s.benchmark_min_used,
                "benchmark_max_used": s.benchmark_max_used,
                "calculated_at": s.calculated_at,
            }
            for s in scores
        ],
    }


@router.post("/areas/{area_id}/compute")
def compute_area_indicators(
    area_id: str,
    db: Session = Depends(get_db),
    _user=Depends(get_current_government_user),
):
    """
    Compute and standardize all indicators for an area from database facilities and demographics.
    Accepts area ID or name slug.
    """
    area = area_repo.resolve_area(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    results = calculate_and_save_area_indicators(db, area.id)
    return {
        "status": "success",
        "area_id": area.id,
        "computed_indicators": results,
    }

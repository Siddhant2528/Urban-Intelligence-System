"""
Facilities API Router.
Provides citywide physical infrastructure asset queries (hospitals, schools, transit stops, parks)
with coordinates for geospatial map layers.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from geoalchemy2.elements import WKTElement
from pydantic import BaseModel

from app.api.deps import get_db, get_current_government_user
from app.repositories import area_repo
from app.models.facility import Facility
from app.models.area import Area
from app.gis.spatial_utils import to_shapely_geometry
from app.core.exceptions import EntityNotFoundException, CalculationException

router = APIRouter(prefix="/facilities", tags=["Facilities"])


class FacilityCreate(BaseModel):
    name: str
    facility_type: str  # "hospital", "school", "transit_stop", "police", "park"
    lat: float
    lng: float
    area_id: Optional[int] = None
    osm_id: Optional[str] = None


@router.get("/")
def list_facilities(
    area_id: Optional[str] = Query(None, description="Filter by area ID or name slug"),
    facility_type: Optional[str] = Query(None, description="Filter by type (hospital, school, police, transit_stop)"),
    limit: int = Query(200, ge=1, le=1000, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """
    List facilities across the city with coordinates formatted as {lat, lng} for Mapbox/Leaflet pins.
    Supports filtering by area ID or name slug.
    """
    query = db.query(Facility)
    if area_id:
        resolved = area_repo.resolve_area(db, area_id)
        if resolved:
            query = query.filter(Facility.area_id == resolved.id)
        else:
            return {"total": 0, "facilities": []}
    if facility_type:
        query = query.filter(Facility.facility_type == facility_type.lower())

    records = query.limit(limit).all()

    results = []
    for f in records:
        shape = to_shapely_geometry(f.geometry)
        results.append({
            "id": f.id,
            "osm_id": f.osm_id,
            "area_id": f.area_id,
            "name": f.name,
            "facility_type": f.facility_type,
            "category": f.facility_type.capitalize(),
            "coordinates": {
                "lat": round(shape.y, 6),
                "lng": round(shape.x, 6),
            },
            "collected_at": f.collected_at,
        })

    return {
        "total": len(results),
        "total_returned": len(results),
        "facilities": results,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_facility(
    fac_in: FacilityCreate,
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),
):
    """
    Register a new physical facility with latitude and longitude coordinates.
    Requires government privileges.
    """
    if fac_in.area_id:
        area = db.query(Area).filter(Area.id == fac_in.area_id).first()
        if not area:
            raise EntityNotFoundException("Area", fac_in.area_id)

    point_wkt = f"POINT({fac_in.lng} {fac_in.lat})"
    fac = Facility(
        osm_id=fac_in.osm_id,
        facility_type=fac_in.facility_type.lower(),
        name=fac_in.name,
        geometry=WKTElement(point_wkt, srid=4326),
        area_id=fac_in.area_id,
    )
    db.add(fac)
    db.commit()
    db.refresh(fac)

    shape = to_shapely_geometry(fac.geometry)
    return {
        "status": "success",
        "id": fac.id,
        "name": fac.name,
        "facility_type": fac.facility_type,
        "coordinates": {"lat": shape.y, "lng": shape.x},
    }

"""
Ingestion API Endpoints.
Allows government officials to trigger and monitor OpenStreetMap POI ingestions.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_government_user
from app.services.ingestion_service import ingest_osm_facilities_for_city
from app.models.facility import Facility
from app.models.data_source import DataSource

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion"])


@router.post("/trigger", status_code=status.HTTP_200_OK)
async def trigger_ingestion(
    city: str = Query("Nashik", description="Target city for OSM amenity ingestion"),
    use_cache: bool = Query(True, description="Whether to read cached OSM responses"),
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),  # Protected: Government role required
):
    """
    Trigger the OpenStreetMap POI ingestion and spatial assignment pipeline.
    Requires 'government' role authorization.
    """
    result = await ingest_osm_facilities_for_city(db, city_name=city, use_cache=use_cache)
    return {
        "status": "success",
        "message": f"OSM ingestion completed for {city}",
        "data": result,
    }


@router.get("/status")
def get_ingestion_status(db: Session = Depends(get_db)):
    """
    Get current summary of ingested facilities and data sources status.
    Available to citizens and government users.
    """
    total_facilities = db.query(func.count(Facility.id)).scalar()
    assigned_facilities = db.query(func.count(Facility.id)).filter(Facility.area_id.isnot(None)).scalar()
    
    facility_breakdown = (
        db.query(Facility.facility_type, func.count(Facility.id))
        .group_by(Facility.facility_type)
        .all()
    )

    data_sources = db.query(DataSource).all()

    return {
        "total_facilities": total_facilities,
        "assigned_to_wards": assigned_facilities,
        "unassigned": total_facilities - assigned_facilities,
        "facility_type_breakdown": {f_type: count for f_type, count in facility_breakdown},
        "data_sources": [
            {
                "id": ds.id,
                "name": ds.name,
                "category": ds.category,
                "status": ds.status,
                "records_count": ds.records_count,
                "last_synced_at": ds.last_synced_at,
            }
            for ds in data_sources
        ],
    }

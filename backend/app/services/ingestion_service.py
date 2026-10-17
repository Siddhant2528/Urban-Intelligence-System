"""
Ingestion Service.
Coordinates the OpenStreetMap -> PostGIS data pipeline:
1. Queries Overpass API for urban amenities (hospitals, schools, etc.)
2. Inserts Point geometries into PostgreSQL/PostGIS facilities table
3. Triggers PostGIS ST_Contains spatial join to map facilities to area wards
4. Updates DataSource metadata and metrics
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.elements import WKTElement

from app.gis.overpass_client import overpass_query, build_facility_query, parse_facilities
from app.models.facility import Facility
from app.models.data_source import DataSource
from app.repositories import area_repo


AMENITY_MAPPING = {
    "hospital": "hospital",
    "clinic": "hospital",
    "school": "school",
    "college": "school",
    "police": "police",
    "bus_station": "transit_stop",
}


async def ingest_osm_facilities_for_city(
    db: Session,
    city_name: str = "Bengaluru",
    use_cache: bool = True
) -> dict:
    """
    Ingest facilities from OpenStreetMap for a target city and link them to municipal wards.
    """
    total_added = 0
    breakdown = {}

    for amenity, facility_type in AMENITY_MAPPING.items():
        query_str = build_facility_query(city=city_name, amenity_type=amenity)
        
        try:
            osm_data = await overpass_query(query_str, use_cache=use_cache)
            parsed_items = parse_facilities(osm_data, facility_type=facility_type)
        except Exception as e:
            breakdown[amenity] = {"status": "failed", "error": str(e), "count": 0}
            continue

        added_for_amenity = 0
        for item in parsed_items:
            # Check if already present by osm_id
            existing = db.query(Facility).filter(Facility.osm_id == item["osm_id"]).first()
            if not existing:
                point_wkt = f"POINT({item['lon']} {item['lat']})"
                fac = Facility(
                    osm_id=item["osm_id"],
                    facility_type=facility_type,
                    name=item.get("name") or f"{facility_type.capitalize()} ({item['osm_id']})",
                    geometry=WKTElement(point_wkt, srid=4326),
                )
                db.add(fac)
                added_for_amenity += 1

        db.commit()
        total_added += added_for_amenity
        breakdown[amenity] = {"status": "success", "count": added_for_amenity}

    # Execute spatial containment assignment using PostGIS ST_Contains
    assigned_count = area_repo.assign_facilities_to_areas(db)

    # Update Data Source status
    ds = db.query(DataSource).filter(DataSource.name == "OpenStreetMap Overpass API").first()
    if ds:
        total_in_db = db.query(func.count(Facility.id)).scalar()
        ds.records_count = total_in_db
        ds.last_synced_at = datetime.now(timezone.utc)
        ds.status = "active"
        db.commit()

    return {
        "city": city_name,
        "new_facilities_added": total_added,
        "facilities_spatially_assigned_to_wards": assigned_count,
        "breakdown": breakdown,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

"""
Area Repository
All database queries related to areas.
Services call these functions — they never write raw SQL directly.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.area import Area
from typing import Optional


def get_all_areas(db: Session) -> list[Area]:
    return db.query(Area).order_by(Area.name).all()


def get_area_by_id(db: Session, area_id: int) -> Optional[Area]:
    return db.query(Area).filter(Area.id == area_id).first()


def get_area_by_name(db: Session, name: str) -> Optional[Area]:
    return db.query(Area).filter(Area.name == name).first()


def get_facilities_in_area(db: Session, area_id: int, facility_type: str = None) -> list:
    """Use PostGIS to find facilities within an area's boundary."""
    from app.models.facility import Facility
    query = db.query(Facility).filter(Facility.area_id == area_id)
    if facility_type:
        query = query.filter(Facility.facility_type == facility_type)
    return query.all()


def assign_facilities_to_areas(db: Session) -> int:
    """
    Use PostGIS ST_Contains to assign facilities to areas based on geometry.
    Returns the number of facilities assigned.
    """
    result = db.execute(text("""
        UPDATE facilities f
        SET area_id = a.id
        FROM areas a
        WHERE ST_Contains(a.geometry, f.geometry)
          AND f.area_id IS NULL
    """))
    db.commit()
    return result.rowcount
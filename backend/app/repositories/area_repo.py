"""
Area Repository
All database queries related to areas.
Services call these functions — they never write raw SQL directly.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.area import Area
from typing import Optional

CITY_POPULATION_SOURCE = "Nashik Municipal Corporation"


def get_all_areas(db: Session) -> list[Area]:
    return db.query(Area).order_by(Area.name).all()


def get_city_areas(db: Session) -> list[Area]:
    """Return wards belonging to the city modeled by this Nashik UIS instance."""
    return (
        db.query(Area)
        .filter(Area.population_source == CITY_POPULATION_SOURCE)
        .order_by(Area.name)
        .all()
    )


def is_city_area(area: Optional[Area]) -> bool:
    return area is not None and area.population_source == CITY_POPULATION_SOURCE


def get_area_by_id(db: Session, area_id: int) -> Optional[Area]:
    return db.query(Area).filter(Area.id == area_id).first()


def get_area_by_name(db: Session, name: str) -> Optional[Area]:
    return db.query(Area).filter(Area.name == name).first()


def resolve_area(db: Session, identifier: int | str) -> Optional[Area]:
    """
    Resolve an Area by integer ID, string digit ID, exact name, or slug name.
    Eliminates ID type mismatch between frontend slugs and backend integers.
    """
    if identifier is None:
        return None
    if isinstance(identifier, int):
        return get_area_by_id(db, identifier)

    identifier_str = str(identifier).strip()
    if identifier_str.isdigit():
        return get_area_by_id(db, int(identifier_str))

    # Exact name match
    area = get_area_by_name(db, identifier_str)
    if area:
        return area

    # Slug or case-insensitive name match (e.g. "cidco" -> "CIDCO", "gangapur-road" -> "Gangapur Road")
    target_clean = identifier_str.lower().replace("-", " ")
    all_areas = get_all_areas(db)
    for a in all_areas:
        a_clean = a.name.lower().replace("-", " ")
        if a_clean == target_clean:
            return a

    # Substring / prefix fallback if unique
    matches = [a for a in all_areas if target_clean in a.name.lower()]
    if len(matches) == 1:
        return matches[0]

    return None


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

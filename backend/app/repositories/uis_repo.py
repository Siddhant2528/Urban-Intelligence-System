from sqlalchemy.orm import Session
from app.models.uis import AreaUIS, CityUIS, PriorityScore, DevelopmentProfile, AdaptiveWeight
from typing import Optional


def get_latest_area_uis(db: Session, area_id: int) -> Optional[AreaUIS]:
    return (
        db.query(AreaUIS)
        .filter(AreaUIS.area_id == area_id)
        .order_by(AreaUIS.calculated_at.desc())
        .first()
    )


def get_all_area_uis(db: Session) -> list[AreaUIS]:
    """Get the latest UIS score for each area."""
    # Subquery to get latest score per area
    from sqlalchemy import func
    latest = (
        db.query(AreaUIS.area_id, func.max(AreaUIS.calculated_at).label("max_at"))
        .group_by(AreaUIS.area_id)
        .subquery()
    )
    return (
        db.query(AreaUIS)
        .join(latest, (AreaUIS.area_id == latest.c.area_id) & 
                      (AreaUIS.calculated_at == latest.c.max_at))
        .all()
    )


def save_area_uis(db: Session, area_id: int, score: float, 
                  methodology_version: str, snapshot_id: str) -> AreaUIS:
    uis = AreaUIS(
        area_id=area_id,
        score=score,
        methodology_version=methodology_version,
        snapshot_id=snapshot_id,
    )
    db.add(uis)
    db.commit()
    db.refresh(uis)
    return uis


def get_latest_city_uis(db: Session) -> Optional[CityUIS]:
    return db.query(CityUIS).order_by(CityUIS.calculated_at.desc()).first()


def save_city_uis(db: Session, score: float, methodology_version: str, 
                  area_snapshot: dict) -> CityUIS:
    city = CityUIS(
        score=score,
        methodology_version=methodology_version,
        area_snapshot_json=area_snapshot,
    )
    db.add(city)
    db.commit()
    db.refresh(city)
    return city


def get_priority_scores(db: Session, area_id: int) -> list[PriorityScore]:
    return (
        db.query(PriorityScore)
        .filter(PriorityScore.area_id == area_id)
        .order_by(PriorityScore.priority.desc())
        .all()
    )


def save_development_profile(db: Session, area_id: int, profile_json: dict,
                               model_used: str, prompt_version: str) -> DevelopmentProfile:
    profile = DevelopmentProfile(
        area_id=area_id,
        profile_json=profile_json,
        model_used=model_used,
        prompt_version=prompt_version,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
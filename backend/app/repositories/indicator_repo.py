"""
Indicator Repository
Encapsulates all database operations for indicator definitions,
raw values, standardized scores, and adaptive weights.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.models.indicator import IndicatorDefinition, IndicatorValue, IndicatorScore
from app.models.uis import AdaptiveWeight


def get_all_indicator_definitions(db: Session, active_only: bool = True) -> list[IndicatorDefinition]:
    """Retrieve all indicator definitions (benchmarks, units, directions)."""
    query = db.query(IndicatorDefinition)
    if active_only:
        query = query.filter(IndicatorDefinition.active == True)
    return query.order_by(IndicatorDefinition.category, IndicatorDefinition.name).all()


def get_indicator_definition_by_id(db: Session, indicator_id: int) -> Optional[IndicatorDefinition]:
    """Retrieve an indicator definition by primary key."""
    return db.query(IndicatorDefinition).filter(IndicatorDefinition.id == indicator_id).first()


def get_indicator_definition_by_name(db: Session, name: str) -> Optional[IndicatorDefinition]:
    """Retrieve an indicator definition by unique identifier name."""
    return db.query(IndicatorDefinition).filter(IndicatorDefinition.name == name).first()


def get_indicator_scores_for_area(db: Session, area_id: int) -> list[IndicatorScore]:
    """
    Get the latest calculated indicator score for each indicator in a given area.
    Attaches the indicator category and name dynamically if needed.
    """
    # Subquery for latest calculated timestamp per indicator in this area
    latest_sub = (
        db.query(
            IndicatorScore.indicator_id,
            func.max(IndicatorScore.calculated_at).label("max_calculated")
        )
        .filter(IndicatorScore.area_id == area_id)
        .group_by(IndicatorScore.indicator_id)
        .subquery()
    )

    scores = (
        db.query(IndicatorScore)
        .join(
            latest_sub,
            (IndicatorScore.indicator_id == latest_sub.c.indicator_id)
            & (IndicatorScore.calculated_at == latest_sub.c.max_calculated)
        )
        .filter(IndicatorScore.area_id == area_id)
        .all()
    )

    # Attach definition metadata (category, name) to each score object for easy serialization
    for s in scores:
        definition = get_indicator_definition_by_id(db, s.indicator_id)
        if definition:
            setattr(s, "category", definition.category)
            setattr(s, "name", definition.name)
            setattr(s, "unit", definition.unit)
            setattr(s, "direction", definition.direction)

    return scores


def get_latest_weights(db: Session, area_id: int) -> dict[str, float]:
    """
    Get the latest validated adaptive weights for an area.
    Returns a dict mapping indicator category/name to float weight.
    """
    latest_sub = (
        db.query(
            AdaptiveWeight.indicator_id,
            func.max(AdaptiveWeight.generated_at).label("max_generated")
        )
        .filter(AdaptiveWeight.area_id == area_id)
        .group_by(AdaptiveWeight.indicator_id)
        .subquery()
    )

    weights = (
        db.query(AdaptiveWeight)
        .join(
            latest_sub,
            (AdaptiveWeight.indicator_id == latest_sub.c.indicator_id)
            & (AdaptiveWeight.generated_at == latest_sub.c.max_generated)
        )
        .filter(AdaptiveWeight.area_id == area_id)
        .all()
    )

    result = {}
    for w in weights:
        definition = get_indicator_definition_by_id(db, w.indicator_id)
        if definition:
            result[definition.category.lower()] = w.weight
            result[definition.name.lower()] = w.weight

    return result


def save_indicator_score(
    db: Session,
    area_id: int,
    indicator_id: int,
    raw_metric: float,
    score: float,
    benchmark_min: float,
    benchmark_max: float,
    direction: str,
    snapshot_id: Optional[str] = None,
) -> IndicatorScore:
    """Save an individual standardized indicator score."""
    record = IndicatorScore(
        area_id=area_id,
        indicator_id=indicator_id,
        raw_metric=raw_metric,
        score=score,
        benchmark_min_used=benchmark_min,
        benchmark_max_used=benchmark_max,
        direction_used=direction,
        snapshot_id=snapshot_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def save_adaptive_weight(
    db: Session,
    area_id: int,
    indicator_id: int,
    weight: float,
    rationale: str,
    methodology_version: str = "v1.0",
    profile_id: Optional[int] = None,
) -> AdaptiveWeight:
    """Save a contextual adaptive weight record."""
    aw = AdaptiveWeight(
        area_id=area_id,
        indicator_id=indicator_id,
        weight=weight,
        rationale=rationale,
        methodology_version=methodology_version,
        profile_id=profile_id,
    )
    db.add(aw)
    db.commit()
    db.refresh(aw)
    return aw

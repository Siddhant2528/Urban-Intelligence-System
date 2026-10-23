"""
Area Service
Orchestrates the complete Area UIS calculation pipeline.
This is the "conductor" — it calls engines, AI, repositories in the right order.
"""
import uuid
from sqlalchemy.orm import Session
from app.repositories import area_repo, uis_repo
from app.repositories.indicator_repo import get_indicator_scores_for_area
from app.engines.uis_calculator import calculate_area_uis, calculate_city_uis
from app.engines.priority_engine import calculate_priority
from app.engines.adaptive_weights import generate_contextual_weights
from app.ai.profile_generator import generate_development_profile
from app.services.indicator_service import calculate_and_save_area_indicators
from app.core.exceptions import CalculationException, EntityNotFoundException


def build_indicator_contributions(indicator_scores: list, weights: dict[str, float]) -> list[dict]:
    """Scale available category weights to the indicators used in this score."""
    if not indicator_scores:
        raise CalculationException("Cannot calculate an area UIS without indicator scores.")

    category_counts = {}
    for score in indicator_scores:
        category = score.category.strip().lower()
        category_counts[category] = category_counts.get(category, 0) + 1

    category_weights = {
        category: weights.get(category, 1.0)
        for category in category_counts
    }
    available_weight_total = sum(category_weights.values())
    if available_weight_total <= 0:
        raise CalculationException("Available indicator weights must have a positive total.")

    return [
        {
            "name": score.category,
            "score": score.score,
            "weight": (
                category_weights[score.category.strip().lower()]
                / category_counts[score.category.strip().lower()]
                / available_weight_total
            ),
        }
        for score in indicator_scores
    ]


async def calculate_full_area_uis(db: Session, area_id: int) -> dict:
    """
    Run the complete Area UIS pipeline for one area:
    1. Fetch indicator scores from DB
    2. Generate AI development profile
    3. Generate adaptive weights
    4. Calculate Area UIS
    5. Calculate priority scores
    6. Store everything
    
    Returns: Complete calculation result
    """
    # 1. Get area info
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)
    
    # 2. Use existing indicator scores, or compute them on the first request.
    indicator_scores = get_indicator_scores_for_area(db, area_id)
    if not indicator_scores:
        calculate_and_save_area_indicators(db, area_id)
        indicator_scores = get_indicator_scores_for_area(db, area_id)
    if not indicator_scores:
        raise CalculationException(
            f"No indicator scores could be produced for area {area_id}. "
            "Check that active indicator definitions are configured."
        )
    
    # 3. Generate AI development profile
    indicator_data_for_ai = [
        {"category": s.category, "score": s.score, "raw_metric": str(s.raw_metric)}
        for s in indicator_scores
    ]
    
    profile_result = await generate_development_profile(area.name, indicator_data_for_ai)
    profile_record = uis_repo.save_development_profile(
        db, area_id,
        profile_json=profile_result["profile"],
        model_used=profile_result["model_used"],
        prompt_version=profile_result["prompt_version"],
    )
    
    # 4. Generate adaptive weights from profile constraints
    constraints = profile_result["profile"].get("constraints", [])
    weight_result = generate_contextual_weights(constraints)
    
    # 5. Calculate Area UIS
    # The weight engine knows the full seven-category methodology, while an
    # area's available indicators may cover only a subset. Re-scale the
    # weights for categories represented by current scores so the calculator
    # receives a complete distribution that sums to one.
    contributions = build_indicator_contributions(
        indicator_scores,
        weight_result["weights"],
    )
    
    area_uis_result = calculate_area_uis(contributions)
    
    # 6. Store Area UIS
    snapshot_id = str(uuid.uuid4())
    uis_record = uis_repo.save_area_uis(
        db, area_id,
        score=area_uis_result["area_uis"],
        methodology_version="v1.0",
        snapshot_id=snapshot_id,
    )

    # Persist the effective weights and current intervention priorities so
    # the government matrix and simulation endpoints use this calculation.
    total_city_population = sum(
        candidate.population or 0 for candidate in area_repo.get_city_areas(db)
    )
    priority_records = []
    weight_records = []
    for score, contribution in zip(indicator_scores, contributions):
        priority = calculate_priority(
            current_score=score.score,
            target_score=80.0,
            population=area.population or 0,
            total_city_population=total_city_population,
        )
        priority_records.append({
            "indicator_id": score.indicator_id,
            "current_score": score.score,
            "target_score": 80.0,
            "gap": priority["gap"],
            "severity": priority["severity"],
            "population_impact": priority["population_impact"],
            "contextual_factor": priority["contextual_factor"],
            "priority": priority["priority"],
        })
        weight_records.append({
            "indicator_id": score.indicator_id,
            "weight": contribution["weight"],
        })

    uis_repo.save_area_calculation_details(
        db,
        area_id=area_id,
        profile_id=profile_record.id,
        methodology_version=weight_result["methodology_version"],
        rationale=weight_result["rationale"],
        weights=weight_records,
        priorities=priority_records,
    )

    effective_weights = {}
    for contribution in contributions:
        category = contribution["name"].strip().lower()
        effective_weights[category] = (
            effective_weights.get(category, 0.0) + contribution["weight"]
        )
    
    return {
        "area_id": area_id,
        "area_name": area.name,
        "area_uis": area_uis_result["area_uis"],
        "development_profile": profile_result["profile"],
        "weights": effective_weights,
        "priorities": priority_records,
        "contributions": area_uis_result["contributions"],
        "snapshot_id": snapshot_id,
    }


async def calculate_full_city_uis(db: Session) -> dict:
    """Calculate Nashik City UIS from its municipal wards only."""
    all_area_uis = uis_repo.get_all_area_uis(db)
    
    area_scores = []
    for uis in all_area_uis:
        area = area_repo.get_area_by_id(db, uis.area_id)
        if area_repo.is_city_area(area) and (area.population or 0) > 0:
            area_scores.append({
                "area_name": area.name,
                "area_uis": uis.score,
                "population": area.population,
            })
    
    if not area_scores:
        raise CalculationException(
            "Cannot calculate City UIS until at least one area has a UIS score and positive population."
        )

    city_result = calculate_city_uis(area_scores)
    
    # Store
    uis_repo.save_city_uis(
        db,
        score=city_result["city_uis"],
        methodology_version="v1.0",
        area_snapshot=city_result["area_breakdown"],
    )
    
    return city_result

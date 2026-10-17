"""
Area Service
Orchestrates the complete Area UIS calculation pipeline.
This is the "conductor" — it calls engines, AI, repositories in the right order.
"""
import uuid
from sqlalchemy.orm import Session
from app.repositories import area_repo, uis_repo
from app.repositories.indicator_repo import get_indicator_scores_for_area
from app.engines.standardization import standardize
from app.engines.uis_calculator import calculate_area_uis, calculate_city_uis
from app.engines.priority_engine import calculate_priority
from app.engines.adaptive_weights import generate_contextual_weights
from app.ai.profile_generator import generate_development_profile


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
        raise ValueError(f"Area {area_id} not found")
    
    # 2. Get indicator scores (already calculated and stored)
    indicator_scores = get_indicator_scores_for_area(db, area_id)
    if not indicator_scores:
        raise ValueError(f"No indicator scores found for area {area_id}")
    
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
    contributions = [
        {
            "name": s.category,
            "score": s.score,
            "weight": weight_result["weights"].get(s.category.lower(), 1/len(indicator_scores))
        }
        for s in indicator_scores
    ]
    
    area_uis_result = calculate_area_uis(contributions)
    
    # 6. Store Area UIS
    snapshot_id = str(uuid.uuid4())
    uis_record = uis_repo.save_area_uis(
        db, area_id,
        score=area_uis_result["area_uis"],
        methodology_version="v1.0",
        snapshot_id=snapshot_id,
    )
    
    return {
        "area_id": area_id,
        "area_name": area.name,
        "area_uis": area_uis_result["area_uis"],
        "development_profile": profile_result["profile"],
        "weights": weight_result["weights"],
        "contributions": area_uis_result["contributions"],
        "snapshot_id": snapshot_id,
    }


async def calculate_full_city_uis(db: Session) -> dict:
    """Calculate City UIS from all area UIS scores."""
    all_area_uis = uis_repo.get_all_area_uis(db)
    
    area_scores = []
    for uis in all_area_uis:
        area = area_repo.get_area_by_id(db, uis.area_id)
        if area and area.population:
            area_scores.append({
                "area_name": area.name,
                "area_uis": uis.score,
                "population": area.population,
            })
    
    city_result = calculate_city_uis(area_scores)
    
    # Store
    uis_repo.save_city_uis(
        db,
        score=city_result["city_uis"],
        methodology_version="v1.0",
        area_snapshot=city_result["area_breakdown"],
    )
    
    return city_result
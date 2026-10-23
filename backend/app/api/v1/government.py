"""
Government Dashboard API Routes.
Provides high-level municipal decision-support tools:
1. Citywide Priority Intervention Matrix
2. Budget Allocation Optimization Engine
3. Ward Performance Rankings & Equity Index
Protected by 'government' role-based authorization.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_government_user
from app.models.area import Area
from app.models.uis import AreaUIS, PriorityScore, DevelopmentProfile
from app.repositories import area_repo, uis_repo

router = APIRouter(prefix="/government", tags=["Government Dashboard"])


@router.get("/priority-matrix")
def get_citywide_priority_matrix(
    severity: str = Query(None, description="Filter by severity: critical, high, medium, low"),
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),
):
    """
    Retrieve all indicator-level development priorities across all city wards.
    Helps planners immediately spot where intervention is most urgent.
    """
    query = (
        db.query(PriorityScore)
        .join(Area, PriorityScore.area_id == Area.id)
        .filter(Area.population_source == area_repo.CITY_POPULATION_SOURCE)
    )
    if severity:
        query = query.filter(PriorityScore.severity == severity.lower())
    
    priorities = query.order_by(PriorityScore.priority.desc()).all()

    results = []
    for p in priorities:
        area = area_repo.get_area_by_id(db, p.area_id)
        results.append({
            "priority_id": p.id,
            "area_id": p.area_id,
            "area_name": area.name if area else f"Area {p.area_id}",
            "indicator_id": p.indicator_id,
            "current_score": p.current_score,
            "target_score": p.target_score,
            "gap": p.gap,
            "severity": p.severity,
            "population_impact": p.population_impact,
            "priority_score": p.priority,
            "calculated_at": p.calculated_at,
        })

    return {
        "total_priorities_found": len(results),
        "priorities": results,
    }


@router.get("/ward-rankings")
def get_ward_rankings(
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),
):
    """
    Get all municipal wards ranked by their latest Area UIS score.
    Includes population and primary constraint profile for each ward.
    """
    areas = area_repo.get_city_areas(db)
    ranked = []

    for a in areas:
        latest_uis = uis_repo.get_latest_area_uis(db, a.id)
        latest_profile = (
            db.query(DevelopmentProfile)
            .filter(DevelopmentProfile.area_id == a.id)
            .order_by(DevelopmentProfile.generated_at.desc())
            .first()
        )

        score = latest_uis.score if latest_uis else 0.0
        constraints = latest_profile.profile_json.get("constraints", []) if latest_profile else []

        ranked.append({
            "area_id": a.id,
            "area_name": a.name,
            "population": a.population,
            "area_uis": score,
            "has_calculation": latest_uis is not None,
            "constraints": constraints,
        })

    # Sort descending (highest UIS first)
    ranked.sort(key=lambda x: x["area_uis"], reverse=True)

    # Assign rank
    for idx, item in enumerate(ranked, 1):
        item["rank"] = idx

    return {
        "total_wards": len(ranked),
        "rankings": ranked,
    }


@router.get("/budget-allocation")
def optimize_budget_allocation(
    total_budget: float = Query(100000000.0, description="Total budget in currency units (e.g. 10 Cr INR)"),
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),
):
    """
    Recommends proportional budget distribution across wards based on:
    Normalized Benchmark Gap * Population Impact Weight.
    Ensures funding flows where needs and population footprints are greatest.
    """
    areas = area_repo.get_city_areas(db)
    if not areas:
        return {"total_budget": total_budget, "allocations": []}

    need_weights = {}
    total_need_weight = 0.0

    for a in areas:
        latest_uis = uis_repo.get_latest_area_uis(db, a.id)
        # Gap = 100 - Area UIS (or deficit from benchmark 80)
        score = latest_uis.score if latest_uis else 50.0
        gap = max(5.0, 80.0 - score)
        pop = a.population or 10000

        # Need factor is proportional to Gap * Population
        factor = gap * pop
        need_weights[a.id] = factor
        total_need_weight += factor

    allocations = []
    for a in areas:
        fraction = (need_weights[a.id] / total_need_weight) if total_need_weight > 0 else (1.0 / len(areas))
        allocated_amount = round(total_budget * fraction, 2)
        allocations.append({
            "area_id": a.id,
            "area_name": a.name,
            "population": a.population,
            "need_share_percentage": round(fraction * 100, 2),
            "allocated_budget": allocated_amount,
        })

    # Sort descending by allocated budget
    allocations.sort(key=lambda x: x["allocated_budget"], reverse=True)

    return {
        "total_budget": total_budget,
        "methodology": "Proportional gap-population allocation: Factor = (80 - UIS) * Population",
        "allocations": allocations,
    }

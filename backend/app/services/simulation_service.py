"""
Simulation Service.
Provides budget-aware "what-if" urban planning simulations.
Models capital interventions, estimates costs, projects score shifts, and computes ROI.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.engines.simulation_engine import simulate_intervention, INTERVENTION_ASSUMPTIONS
from app.models.uis import Simulation
from app.repositories import area_repo, uis_repo, indicator_repo
from app.core.exceptions import EntityNotFoundException, CalculationException


# Indicative unit costs (in local currency, e.g. INR)
UNIT_COSTS = {
    "add_hospital": 25000000.0,   # 2.5 Crore INR per urban primary health center
    "add_school": 10000000.0,     # 1 Crore INR per primary/middle school
    "improve_roads": 5000000.0,   # 50 Lakhs INR per km² of road network enhancement
}


def run_budget_simulation(
    db: Session,
    area_id: int,
    intervention_type: str,
    intervention_value: float,
    budget: Optional[float] = None,
) -> dict:
    """
    Simulate an infrastructure intervention under optional municipal budget constraints.
    """
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise EntityNotFoundException("Area", area_id)

    if intervention_type not in INTERVENTION_ASSUMPTIONS:
        raise CalculationException(
            f"Unsupported intervention '{intervention_type}'. "
            f"Allowed types: {list(INTERVENTION_ASSUMPTIONS.keys())}"
        )

    # 1. Fetch current Area UIS and weights
    current_uis_record = uis_repo.get_latest_area_uis(db, area_id)
    if not current_uis_record:
        raise CalculationException(f"No existing UIS score found for area {area_id}. Run calculation first.")

    # 2. Fetch current indicator scores and weights
    indicator_scores_raw = indicator_repo.get_indicator_scores_for_area(db, area_id)
    if not indicator_scores_raw:
        raise CalculationException(f"No indicator scores found for area {area_id}.")

    current_scores = {s.category.lower(): s.score for s in indicator_scores_raw}
    current_weights = indicator_repo.get_latest_weights(db, area_id)
    if not current_weights:
        # Default equal weights fallback if not generated yet
        current_weights = {s.category.lower(): 1.0 / len(current_scores) for s in indicator_scores_raw}

    # 3. Budget feasibility analysis
    unit_cost = UNIT_COSTS.get(intervention_type, 10000000.0)
    estimated_total_cost = unit_cost * intervention_value
    budget_feasible = True
    max_units_possible = intervention_value

    if budget is not None:
        if estimated_total_cost > budget:
            budget_feasible = False
            max_units_possible = round(budget / unit_cost, 2)

    # 4. Run deterministic simulation engine
    sim_result = simulate_intervention(
        intervention_type=intervention_type,
        intervention_value=intervention_value,
        current_indicator_scores=current_scores,
        current_area_uis=current_uis_record.score,
        current_weights=current_weights,
    )

    # 5. Calculate Return on Investment (Score Improvement per Million invested)
    cost_in_millions = estimated_total_cost / 1000000.0
    uis_roi = round(sim_result["uis_change"] / cost_in_millions, 4) if cost_in_millions > 0 else 0.0

    output_payload = {
        **sim_result,
        "area_id": area_id,
        "area_name": area.name,
        "estimated_cost": estimated_total_cost,
        "budget_provided": budget,
        "budget_feasible": budget_feasible,
        "max_units_within_budget": max_units_possible,
        "cost_efficiency_roi": uis_roi,
    }

    # 6. Persist simulation record
    sim_record = Simulation(
        area_id=area_id,
        intervention_type=intervention_type,
        input_json={
            "intervention_value": intervention_value,
            "budget": budget,
        },
        assumption_json={
            "assumptions": sim_result["assumptions"],
            "unit_cost": unit_cost,
        },
        output_json=output_payload,
    )
    db.add(sim_record)
    db.commit()

    return output_payload

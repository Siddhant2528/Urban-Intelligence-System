"""
Simulation API Router.
Exposes budget-aware what-if intervention modeling, model assumptions, and history.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.uis import SimulationRequest, SimulationResponse
from app.services.simulation_service import run_budget_simulation, UNIT_COSTS
from app.engines.simulation_engine import INTERVENTION_ASSUMPTIONS
from app.models.uis import Simulation
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.get("/assumptions")
def get_simulation_assumptions():
    """
    Get all supported intervention types, their unit costs, affected indicators,
    and planning assumptions for frontend simulation forms.
    """
    interventions = []
    for key, val in INTERVENTION_ASSUMPTIONS.items():
        interventions.append({
            "intervention_type": key,
            "label": key.replace("_", " ").title(),
            "affects_categories": val["affects"],
            "unit_cost": UNIT_COSTS.get(key, 10000000.0),
            "score_improvement_per_unit": val["score_improvement_per_unit"],
            "assumptions": val["assumptions"],
            "limitations": val["limitations"],
        })

    return {
        "total_supported_interventions": len(interventions),
        "interventions": interventions,
    }


@router.post("/", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    """
    Run a what-if intervention simulation.
    Models capital investment, score shifts, budget feasibility, and ROI.
    """
    result = run_budget_simulation(
        db=db,
        area_id=request.area_id,
        intervention_type=request.intervention_type,
        intervention_value=request.intervention_value,
        budget=request.budget,
    )
    return result


@router.get("/history/{area_id}")
def get_simulation_history(area_id: int, db: Session = Depends(get_db)):
    """
    Retrieve past simulations executed for a given ward.
    """
    sims = (
        db.query(Simulation)
        .filter(Simulation.area_id == area_id)
        .order_by(Simulation.created_at.desc())
        .all()
    )
    return {
        "area_id": area_id,
        "total_simulations": len(sims),
        "simulations": [
            {
                "id": s.id,
                "intervention_type": s.intervention_type,
                "input": s.input_json,
                "output": s.output_json,
                "created_at": s.created_at,
            }
            for s in sims
        ],
    }
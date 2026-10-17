"""
Unit tests for Simulation Engine.
Verifies intervention effects, clamping at 100, and explicit assumption reporting.
"""
import pytest
from app.engines.simulation_engine import simulate_intervention, INTERVENTION_ASSUMPTIONS


def test_simulate_hospital_addition():
    current_scores = {
        "healthcare": 42.2,
        "education": 78.0,
        "transport": 64.0,
    }
    weights = {
        "healthcare": 0.40,
        "education": 0.30,
        "transport": 0.30,
    }
    current_uis = 42.2 * 0.40 + 78.0 * 0.30 + 64.0 * 0.30  # 16.88 + 23.4 + 19.2 = 59.48

    result = simulate_intervention(
        intervention_type="add_hospital",
        intervention_value=2.0,
        current_indicator_scores=current_scores,
        current_area_uis=current_uis,
        current_weights=weights,
    )

    assert result["intervention_type"] == "add_hospital"
    assert result["after_uis"] > result["before_uis"]
    assert result["uis_change"] > 0.0
    assert len(result["assumptions"]) > 0
    assert len(result["limitations"]) > 0


def test_simulate_intervention_clamped_at_100():
    current_scores = {"healthcare": 98.0}
    weights = {"healthcare": 1.0}

    result = simulate_intervention(
        intervention_type="add_hospital",
        intervention_value=5.0,  # +25 points
        current_indicator_scores=current_scores,
        current_area_uis=98.0,
        current_weights=weights,
    )
    # 98 + 25 = 123 -> clamped to 100
    assert result["after_uis"] == 100.0


def test_invalid_intervention_raises():
    with pytest.raises(ValueError):
        simulate_intervention(
            intervention_type="unsupported_type",
            intervention_value=1.0,
            current_indicator_scores={},
            current_area_uis=50.0,
            current_weights={},
        )

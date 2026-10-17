import pytest
from app.engines.adaptive_weights import generate_contextual_weights, validate_weights

def test_default_weights_sum_to_one():
    result = generate_contextual_weights(constraints=[])
    total = sum(result["weights"].values())
    assert abs(total - 1.0) < 0.001

def test_weights_with_healthcare_constraint():
    result = generate_contextual_weights(constraints=["healthcare_constraint"])
    # Healthcare weight should be higher than default
    assert result["weights"]["healthcare"] > 0.16  # default is 0.16
    # Total still sums to 1
    assert abs(sum(result["weights"].values()) - 1.0) < 0.001

def test_bounds_are_respected():
    result = generate_contextual_weights(
        constraints=["healthcare_constraint", "infrastructure_constraint"]
    )
    validate_weights(result["weights"])  # Should not raise

def test_rationale_is_stored():
    result = generate_contextual_weights(constraints=["transport_constraint"])
    assert "rationale" in result
    assert len(result["rationale"]) > 10
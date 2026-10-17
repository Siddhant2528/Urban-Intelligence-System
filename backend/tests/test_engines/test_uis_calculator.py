import pytest
from app.engines.uis_calculator import calculate_area_uis, calculate_city_uis

def test_area_uis_worked_example():
    """Test against the worked example from the project PDF."""
    contributions = [
        {"name": "environment", "score": 62, "weight": 0.15},
        {"name": "healthcare", "score": 42.20, "weight": 0.20},
        {"name": "education", "score": 78, "weight": 0.12},
        {"name": "safety", "score": 76, "weight": 0.10},
        {"name": "transport", "score": 64, "weight": 0.16},
        {"name": "infrastructure", "score": 48, "weight": 0.17},
        {"name": "accessibility", "score": 69, "weight": 0.10},
    ]
    result = calculate_area_uis(contributions)
    assert result["area_uis"] == pytest.approx(59.99, abs=0.1)

def test_city_uis_worked_example():
    """Test against the 3-area city example from the project PDF."""
    areas = [
        {"area_name": "Area A", "area_uis": 59.99, "population": 50000},
        {"area_name": "Area B", "area_uis": 72.00, "population": 30000},
        {"area_name": "Area C", "area_uis": 81.00, "population": 20000},
    ]
    result = calculate_city_uis(areas)
    assert result["city_uis"] == pytest.approx(67.80, abs=0.1)
    assert result["total_population"] == 100000

def test_weights_must_sum_to_one():
    contributions = [
        {"name": "a", "score": 50, "weight": 0.4},
        {"name": "b", "score": 50, "weight": 0.4},  # sum = 0.8, not 1.0
    ]
    with pytest.raises(ValueError, match="sum to 1.0"):
        calculate_area_uis(contributions)
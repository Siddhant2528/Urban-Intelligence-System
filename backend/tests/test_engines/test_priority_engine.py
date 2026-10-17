"""
Unit tests for Priority Engine.
Verifies gap calculation, severity brackets, and population impact priority formulas.
"""
import pytest
from app.engines.priority_engine import calculate_gap, classify_severity, calculate_priority


def test_calculate_gap():
    assert calculate_gap(current_score=48.0, target_score=80.0) == 32.0
    assert calculate_gap(current_score=85.0, target_score=80.0) == 0.0  # Cannot have negative gap


def test_classify_severity():
    # Gap >= 50 -> critical
    sev_label, sev_weight = classify_severity(55.0)
    assert sev_label == "critical"
    assert sev_weight == 1.0

    # Gap >= 30 -> high
    sev_label, sev_weight = classify_severity(32.0)
    assert sev_label == "high"
    assert sev_weight == 0.75

    # Gap >= 15 -> medium
    sev_label, sev_weight = classify_severity(20.0)
    assert sev_label == "medium"
    assert sev_weight == 0.50

    # Gap < 15 -> low
    sev_label, sev_weight = classify_severity(5.0)
    assert sev_label == "low"
    assert sev_weight == 0.25


def test_calculate_priority_score_bounds():
    result = calculate_priority(
        current_score=48.0,
        target_score=80.0,
        population=50000,
        total_city_population=100000,
        contextual_factor=1.2,
    )
    assert "priority" in result
    assert 0.0 <= result["priority"] <= 100.0
    assert result["gap"] == 32.0
    assert result["severity"] == "high"
    assert result["population_impact"] == 0.5

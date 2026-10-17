import pytest
from app.engines.standardization import standardize

def test_positive_indicator_midpoint():
    """Midpoint of range should give score 50."""
    score = standardize(raw_metric=10, benchmark_min=0, benchmark_max=20, direction="positive")
    assert score == 50.0

def test_positive_indicator_minimum():
    """At benchmark min, score should be 0."""
    score = standardize(raw_metric=0, benchmark_min=0, benchmark_max=20, direction="positive")
    assert score == 0.0

def test_positive_indicator_maximum():
    """At benchmark max, score should be 100."""
    score = standardize(raw_metric=20, benchmark_min=0, benchmark_max=20, direction="positive")
    assert score == 100.0

def test_positive_indicator_clamp_above():
    """Values above max should clamp to 100."""
    score = standardize(raw_metric=25, benchmark_min=0, benchmark_max=20, direction="positive")
    assert score == 100.0

def test_negative_indicator():
    """For negative indicators, lower raw value = higher score."""
    # AQI = 85, range 0-200. Lower AQI is better.
    score = standardize(raw_metric=85, benchmark_min=0, benchmark_max=200, direction="negative")
    assert score == pytest.approx(57.5)

def test_hospital_density_example():
    """Worked example from project PDF: 1.6 hospitals/10k, range 0-20 → score 8."""
    score = standardize(raw_metric=1.6, benchmark_min=0, benchmark_max=20, direction="positive")
    assert score == pytest.approx(8.0)

def test_invalid_direction():
    with pytest.raises(ValueError, match="direction must be"):
        standardize(1.0, 0, 10, "sideways")

def test_equal_benchmarks_raises():
    with pytest.raises(ValueError, match="cannot be equal"):
        standardize(5.0, 10, 10, "positive")
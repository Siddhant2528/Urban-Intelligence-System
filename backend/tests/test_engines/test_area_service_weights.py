from types import SimpleNamespace

import pytest

from app.services.area_service import build_indicator_contributions


def test_available_indicator_weights_are_normalized():
    categories = [
        ("Healthcare", 42.2, 0.16),
        ("Education", 78.0, 0.14),
        ("Transport", 64.0, 0.15),
        ("Environment", 68.0, 0.13),
        ("Safety", 76.0, 0.12),
    ]
    scores = [SimpleNamespace(category=name, score=score) for name, score, _ in categories]
    weights = {name.lower(): weight for name, _, weight in categories}

    contributions = build_indicator_contributions(scores, weights)

    assert sum(item["weight"] for item in contributions) == pytest.approx(1.0)
    assert contributions[0]["weight"] == pytest.approx(0.16 / 0.70)


def test_multiple_indicators_in_one_category_split_that_category_weight():
    scores = [
        SimpleNamespace(category="Healthcare", score=60.0),
        SimpleNamespace(category="Healthcare", score=80.0),
        SimpleNamespace(category="Education", score=50.0),
    ]

    contributions = build_indicator_contributions(
        scores,
        {"healthcare": 0.4, "education": 0.2},
    )

    assert sum(item["weight"] for item in contributions) == pytest.approx(1.0)
    assert contributions[0]["weight"] == pytest.approx(1 / 3)
    assert contributions[1]["weight"] == pytest.approx(1 / 3)
    assert contributions[2]["weight"] == pytest.approx(1 / 3)

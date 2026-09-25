"""
Priority Engine
Calculates issue-level development priority.

Priority is NOT simply the inverse of a score.
It considers: benchmark gap, severity, population impact, contextual importance.

Priority = f(normalized_gap, severity_weight, population_impact, contextual_factor)
"""


def calculate_gap(current_score: float, target_score: float) -> float:
    """Gap = how far the indicator is from the target. Always >= 0."""
    return max(0.0, target_score - current_score)


def classify_severity(gap: float) -> tuple[str, float]:
    """
    Convert a gap into a severity label and numeric weight.
    
    Returns:
        (severity_label, severity_weight)
    """
    if gap >= 50:
        return "critical", 1.0
    elif gap >= 30:
        return "high", 0.75
    elif gap >= 15:
        return "medium", 0.50
    else:
        return "low", 0.25


def calculate_priority(
    current_score: float,
    target_score: float,
    population: int,
    total_city_population: int,
    contextual_factor: float = 1.0,  # from development profile, range [0.5, 2.0]
) -> dict:
    """
    Calculate a single indicator's priority for an area.
    
    Args:
        current_score: Current 0-100 indicator score
        target_score: The benchmark/target score (e.g., 80)
        population: Population of the area
        total_city_population: Total city population (for relative impact)
        contextual_factor: Weight multiplier from the development profile (1.0 = neutral)
    
    Returns:
        dict with gap, severity, population_impact, priority score
    """
    gap = calculate_gap(current_score, target_score)
    severity_label, severity_weight = classify_severity(gap)
    
    # Normalize gap to 0-1
    normalized_gap = gap / 100.0
    
    # Population impact: what fraction of city population lives in this area?
    population_impact = population / total_city_population if total_city_population > 0 else 0
    
    # Priority formula (documented, versioned, not hidden in AI)
    # Clamp contextual_factor to approved range
    contextual_factor = max(0.5, min(2.0, contextual_factor))
    
    priority = (
        (normalized_gap * 0.40) +
        (severity_weight * 0.30) +
        (population_impact * 0.20) +
        (min(contextual_factor / 2.0, 0.10))  # contextual adds up to 10%
    ) * 100  # scale to 0-100
    
    return {
        "gap": round(gap, 2),
        "normalized_gap": round(normalized_gap, 4),
        "severity": severity_label,
        "severity_weight": severity_weight,
        "population_impact": round(population_impact, 4),
        "contextual_factor": contextual_factor,
        "priority": round(min(100.0, priority), 2),
    }
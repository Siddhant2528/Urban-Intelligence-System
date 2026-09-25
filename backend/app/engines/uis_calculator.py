"""
UIS Calculator Engine
Calculates Area UIS and City UIS from validated inputs.

Area UIS = Σ(indicator_score_i × validated_weight_i)
City UIS = Σ(Area_UIS_i × Population_i) / Σ(Population_i)
"""


def calculate_area_uis(
    indicator_contributions: list[dict],  # [{"score": float, "weight": float, "name": str}, ...]
) -> dict:
    """
    Calculate Area UIS from indicator scores and their validated weights.
    
    Args:
        indicator_contributions: List of dicts with 'score', 'weight', 'name'
    
    Returns:
        dict with 'area_uis', 'contributions', and 'total_weight'
    
    Raises:
        ValueError: If weights don't sum to 1 or inputs are empty
    """
    if not indicator_contributions:
        raise ValueError("Cannot calculate Area UIS with no indicators")
    
    total_weight = sum(c["weight"] for c in indicator_contributions)
    if not (0.99 <= total_weight <= 1.01):
        raise ValueError(
            f"Indicator weights must sum to 1.0 for a valid Area UIS. "
            f"Got {total_weight:.4f}"
        )
    
    contributions = []
    for c in indicator_contributions:
        contribution = c["score"] * c["weight"]
        contributions.append({
            "name": c["name"],
            "score": c["score"],
            "weight": c["weight"],
            "weighted_contribution": round(contribution, 4),
        })
    
    area_uis = sum(c["weighted_contribution"] for c in contributions)
    
    return {
        "area_uis": round(area_uis, 2),
        "contributions": contributions,
        "total_weight": round(total_weight, 4),
    }


def calculate_city_uis(
    area_scores: list[dict],  # [{"area_uis": float, "population": int, "area_name": str}, ...]
) -> dict:
    """
    Calculate population-weighted City UIS.
    
    City UIS = Σ(Area_UIS_i × Population_i) / Σ(Population_i)
    
    Args:
        area_scores: List of dicts with 'area_uis', 'population', 'area_name'
    
    Returns:
        dict with 'city_uis', 'total_population', 'area_breakdown'
    """
    if not area_scores:
        raise ValueError("Cannot calculate City UIS with no areas")
    
    total_population = sum(a["population"] for a in area_scores)
    if total_population == 0:
        raise ValueError("Total population cannot be zero")
    
    weighted_sum = sum(a["area_uis"] * a["population"] for a in area_scores)
    city_uis = weighted_sum / total_population
    
    return {
        "city_uis": round(city_uis, 2),
        "total_population": total_population,
        "area_breakdown": [
            {
                "area_name": a["area_name"],
                "area_uis": a["area_uis"],
                "population": a["population"],
                "weighted_contribution": round(a["area_uis"] * a["population"] / total_population, 4),
            }
            for a in area_scores
        ],
    }
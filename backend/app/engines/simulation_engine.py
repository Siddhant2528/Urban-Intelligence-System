"""
Simulation Engine
Models the effect of an intervention on indicator scores.

This is a model-based ESTIMATE, not a guarantee.
All assumptions must be explicit and stored.
"""

# Intervention impact assumptions
# Each intervention type maps to affected indicators and expected score improvement per unit
INTERVENTION_ASSUMPTIONS = {
    "add_hospital": {
        "affects": ["healthcare"],
        "score_improvement_per_unit": 5.0,  # per additional hospital per 10k people
        "assumptions": [
            "Each additional hospital per 10k population adds ~5 points to hospital density score",
            "Accessibility improvement modeled as proportional to new facility coverage",
            "Population distribution assumed uniform within area"
        ],
        "limitations": [
            "Model does not account for hospital capacity or quality",
            "Geographic accessibility improvement is estimated, not GIS-computed"
        ]
    },
    "improve_roads": {
        "affects": ["transport", "accessibility"],
        "score_improvement_per_unit": 3.0,  # per km² road density increase
        "assumptions": [
            "Road density increase modeled as proportional to transport score",
            "Accessibility improvement estimated at 60% of transport improvement"
        ],
        "limitations": [
            "Road quality not modeled",
            "Traffic flow impact not included"
        ]
    },
    "add_school": {
        "affects": ["education"],
        "score_improvement_per_unit": 4.0,
        "assumptions": ["Each additional school per 10k population adds ~4 points to education score"],
        "limitations": ["Teacher quality and curriculum not modeled"]
    },
}


def simulate_intervention(
    intervention_type: str,
    intervention_value: float,
    current_indicator_scores: dict[str, float],  # {"healthcare": 42.2, "education": 78, ...}
    current_area_uis: float,
    current_weights: dict[str, float],
) -> dict:
    """
    Model the effect of an intervention on Area UIS.
    
    Args:
        intervention_type: Type of intervention (must be in INTERVENTION_ASSUMPTIONS)
        intervention_value: Magnitude (e.g., number of hospitals to add)
        current_indicator_scores: Current 0-100 scores per category
        current_area_uis: Current Area UIS score
        current_weights: Current adaptive weights
    
    Returns:
        dict with before/after comparison and assumptions
    """
    if intervention_type not in INTERVENTION_ASSUMPTIONS:
        raise ValueError(
            f"Unknown intervention type: {intervention_type}. "
            f"Supported: {list(INTERVENTION_ASSUMPTIONS.keys())}"
        )
    
    config = INTERVENTION_ASSUMPTIONS[intervention_type]
    
    # Apply improvement to affected indicators
    updated_scores = dict(current_indicator_scores)
    affected = []
    
    for indicator_cat in config["affects"]:
        if indicator_cat in updated_scores:
            improvement = config["score_improvement_per_unit"] * intervention_value
            old_score = updated_scores[indicator_cat]
            new_score = min(100.0, old_score + improvement)
            updated_scores[indicator_cat] = new_score
            affected.append({
                "indicator": indicator_cat,
                "before": round(old_score, 2),
                "after": round(new_score, 2),
                "change": round(new_score - old_score, 2),
            })
    
    # Recalculate Area UIS with updated scores
    new_area_uis = sum(
        updated_scores.get(cat, 0) * weight
        for cat, weight in current_weights.items()
    )
    
    return {
        "intervention_type": intervention_type,
        "intervention_value": intervention_value,
        "before_uis": round(current_area_uis, 2),
        "after_uis": round(new_area_uis, 2),
        "uis_change": round(new_area_uis - current_area_uis, 2),
        "affected_indicators": affected,
        "assumptions": config["assumptions"],
        "limitations": config["limitations"],
        "model_note": "This is a model-based estimate, not a guaranteed real-world outcome.",
    }
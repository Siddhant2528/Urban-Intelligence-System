"""
Adaptive Weight Engine
Produces validated contextual weights from a development profile.

CRITICAL DESIGN RULE:
- AI produces a profile (e.g., "healthcare constraint area")
- This engine translates that profile into weight adjustments
- Weights are ALWAYS deterministic — AI never directly outputs final weights
- All weights must sum to 1.0
- Each weight must stay within approved min/max bounds
"""

# These are the baseline weights (equal if no profile context)
# In production, define per indicator in config
DEFAULT_WEIGHTS = {
    "environment": 0.13,
    "healthcare": 0.16,
    "education": 0.14,
    "safety": 0.12,
    "transport": 0.15,
    "infrastructure": 0.15,
    "accessibility": 0.15,
}

# Min/max bounds per indicator — AI cannot push weights outside these
WEIGHT_BOUNDS = {
    "environment":    (0.05, 0.25),
    "healthcare":     (0.08, 0.28),
    "education":      (0.06, 0.24),
    "safety":         (0.05, 0.22),
    "transport":      (0.07, 0.25),
    "infrastructure": (0.07, 0.25),
    "accessibility":  (0.06, 0.24),
}

# Profile-to-weight adjustment mapping
# Each profile constraint maps to a list of (category, adjustment) tuples
PROFILE_ADJUSTMENTS = {
    "healthcare_constraint":     [("healthcare", +0.06), ("infrastructure", -0.03), ("accessibility", -0.03)],
    "infrastructure_constraint": [("infrastructure", +0.06), ("transport", +0.03), ("environment", -0.05), ("education", -0.04)],
    "transport_constraint":      [("transport", +0.06), ("accessibility", +0.04), ("environment", -0.05), ("safety", -0.05)],
    "education_constraint":      [("education", +0.06), ("safety", +0.02), ("environment", -0.04), ("accessibility", -0.04)],
    "environment_pressure":      [("environment", +0.07), ("healthcare", +0.03), ("transport", -0.05), ("education", -0.05)],
}


def apply_profile_adjustments(
    base_weights: dict[str, float],
    constraints: list[str],  # from AI profile, e.g. ["healthcare_constraint"]
) -> dict[str, float]:
    """Apply profile-based adjustments within bounds."""
    weights = dict(base_weights)
    
    for constraint in constraints:
        if constraint in PROFILE_ADJUSTMENTS:
            for category, adjustment in PROFILE_ADJUSTMENTS[constraint]:
                if category in weights:
                    weights[category] = weights[category] + adjustment
    
    return weights


def enforce_bounds(weights: dict[str, float]) -> dict[str, float]:
    """Clamp each weight to its approved min/max."""
    bounded = {}
    for category, weight in weights.items():
        if category in WEIGHT_BOUNDS:
            min_w, max_w = WEIGHT_BOUNDS[category]
            bounded[category] = max(min_w, min(max_w, weight))
        else:
            bounded[category] = weight
    return bounded


def normalize_to_sum_one(weights: dict[str, float]) -> dict[str, float]:
    """Ensure weights sum exactly to 1.0."""
    total = sum(weights.values())
    if total == 0:
        raise ValueError("Weights sum to zero — cannot normalize")
    return {k: round(v / total, 6) for k, v in weights.items()}


def validate_weights(weights: dict[str, float]) -> None:
    """Run all validation checks. Raises ValueError on failure."""
    # Check sum
    total = sum(weights.values())
    if not (0.999 <= total <= 1.001):
        raise ValueError(f"Weights must sum to 1.0, got {total}")
    
    # Check bounds
    for category, weight in weights.items():
        if category in WEIGHT_BOUNDS:
            min_w, max_w = WEIGHT_BOUNDS[category]
            if not (min_w <= weight <= max_w):
                raise ValueError(
                    f"Weight for '{category}' ({weight}) is outside bounds [{min_w}, {max_w}]"
                )
    
    # Check all categories present
    for required in DEFAULT_WEIGHTS:
        if required not in weights:
            raise ValueError(f"Missing weight for indicator category: {required}")


def generate_contextual_weights(
    constraints: list[str],
    methodology_version: str = "v1.0",
) -> dict:
    """
    Full weight generation pipeline.
    
    Args:
        constraints: List of constraint strings from the AI profile
                     (e.g., ["healthcare_constraint", "infrastructure_constraint"])
        methodology_version: Version tag for reproducibility
    
    Returns:
        dict with 'weights', 'rationale', 'methodology_version'
    """
    # 1. Start with defaults
    weights = dict(DEFAULT_WEIGHTS)
    
    # 2. Apply profile adjustments
    weights = apply_profile_adjustments(weights, constraints)
    
    # 3. Enforce bounds
    weights = enforce_bounds(weights)
    
    # 4. Normalize to exactly 1.0
    weights = normalize_to_sum_one(weights)
    
    # 5. Validate
    validate_weights(weights)
    
    # 6. Build rationale
    applied = [c for c in constraints if c in PROFILE_ADJUSTMENTS]
    rationale = (
        f"Base weights adjusted for constraints: {applied}. "
        f"Bounds enforced per methodology {methodology_version}. "
        f"Normalized to sum=1.0."
    ) if applied else f"Default weights used. Methodology version {methodology_version}."
    
    return {
        "weights": weights,
        "rationale": rationale,
        "methodology_version": methodology_version,
        "constraints_applied": applied,
    }
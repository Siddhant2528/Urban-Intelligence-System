"""
Standardization Engine
Converts a raw metric into a 0-100 indicator score.

Formula:
- Positive (higher is better): Score = 100 * (x - min) / (max - min)
- Negative (lower is better): Score = 100 * (max - x) / (max - min)

The result is always clamped to [0, 100].
"""

def standardize(
    raw_metric: float,
    benchmark_min: float,
    benchmark_max: float,
    direction: str,  # "positive" or "negative"
) -> float:
    """
    Convert a raw metric to a 0-100 score.
    
    Args:
        raw_metric: The actual measured value (e.g., 1.6 hospitals per 10,000)
        benchmark_min: The reference minimum (e.g., 0)
        benchmark_max: The reference maximum (e.g., 20)
        direction: "positive" if higher is better, "negative" if lower is better
    
    Returns:
        A float between 0 and 100 (inclusive)
    
    Raises:
        ValueError: If benchmark_min == benchmark_max (division by zero)
    """
    if benchmark_max == benchmark_min:
        raise ValueError(
            f"benchmark_min and benchmark_max cannot be equal. "
            f"Got min={benchmark_min}, max={benchmark_max}"
        )
    
    if direction == "positive":
        score = 100.0 * (raw_metric - benchmark_min) / (benchmark_max - benchmark_min)
    elif direction == "negative":
        score = 100.0 * (benchmark_max - raw_metric) / (benchmark_max - benchmark_min)
    else:
        raise ValueError(f"direction must be 'positive' or 'negative', got '{direction}'")
    
    # Clamp to 0-100
    return max(0.0, min(100.0, score))


def standardize_with_sub_indicators(
    sub_indicators: list[dict],  # [{"score": float, "weight": float}, ...]
) -> float:
    """
    Combine multiple sub-indicators into a single category score.
    Used when one category (e.g. Healthcare) has multiple sub-indicators.
    
    Example:
        [{"score": 8, "weight": 0.40}, {"score": 65, "weight": 0.60}]
        → (8 * 0.40) + (65 * 0.60) = 42.20
    
    Validates that weights sum to approximately 1.0.
    """
    total_weight = sum(s["weight"] for s in sub_indicators)
    if not (0.99 <= total_weight <= 1.01):
        raise ValueError(f"Sub-indicator weights must sum to 1.0, got {total_weight}")
    
    return sum(s["score"] * s["weight"] for s in sub_indicators)
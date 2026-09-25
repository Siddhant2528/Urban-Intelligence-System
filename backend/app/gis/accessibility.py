"""
Accessibility Analysis
Calculates what percentage of an area's population is within
acceptable distance of a facility type.

This uses a simplified coverage model (radius-based) since
full network routing requires OSRM or pgRouting setup.
For a prototype, radius-based coverage is documented and defensible.
"""
from math import radians, cos, sin, asin, sqrt


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate great-circle distance between two points in kilometers.
    Used for accessibility radius calculations.
    """
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))


def calculate_coverage_percentage(
    population_points: list[dict],   # [{"lat": float, "lon": float, "weight": float}, ...]
    facilities: list[dict],           # [{"lat": float, "lon": float}, ...]
    threshold_km: float = 2.0,        # accessibility threshold distance
) -> dict:
    """
    Calculate what fraction of the population is within threshold_km of any facility.
    
    This is a simplified model. For production, use PostGIS or OSRM.
    
    Args:
        population_points: Sample points representing population distribution
        facilities: Facility locations
        threshold_km: Max distance for "accessible" (e.g., 2km for a hospital)
    
    Returns:
        dict with coverage_percentage and methodology note
    """
    if not population_points or not facilities:
        return {
            "coverage_percentage": 0.0,
            "methodology": "No data available",
            "threshold_km": threshold_km
        }
    
    covered_weight = 0.0
    total_weight = sum(p["weight"] for p in population_points)
    
    for point in population_points:
        for facility in facilities:
            dist = haversine_distance_km(
                point["lat"], point["lon"],
                facility["lat"], facility["lon"]
            )
            if dist <= threshold_km:
                covered_weight += point["weight"]
                break  # This point is covered — no need to check other facilities
    
    coverage_pct = (covered_weight / total_weight * 100) if total_weight > 0 else 0.0
    
    return {
        "coverage_percentage": round(coverage_pct, 2),
        "methodology": f"Radius-based coverage within {threshold_km}km. Simplified model.",
        "threshold_km": threshold_km,
        "facilities_count": len(facilities),
    }
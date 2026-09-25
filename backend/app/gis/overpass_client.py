"""
Overpass API Client
Fetches facility data from OpenStreetMap.
Includes caching to avoid hammering the public API.
"""
import httpx
import json
import hashlib
from pathlib import Path
from app.core.config import settings

CACHE_DIR = Path("data/osm_cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _cache_key(query: str) -> str:
    return hashlib.md5(query.encode()).hexdigest()


def _read_cache(key: str) -> dict | None:
    path = CACHE_DIR / f"{key}.json"
    if path.exists():
        return json.loads(path.read_text())
    return None


def _write_cache(key: str, data: dict) -> None:
    path = CACHE_DIR / f"{key}.json"
    path.write_text(json.dumps(data))


async def overpass_query(query: str, use_cache: bool = True) -> dict:
    """
    Execute an Overpass QL query and return the JSON response.
    Caches results to avoid repeated calls to public servers.
    
    Args:
        query: Overpass QL query string
        use_cache: Whether to use cached results (True by default)
    
    Returns:
        Parsed JSON response from Overpass
    """
    key = _cache_key(query)
    
    if use_cache:
        cached = _read_cache(key)
        if cached:
            return cached
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            settings.OVERPASS_API_URL,
            data={"data": query},
        )
        response.raise_for_status()
        data = response.json()
    
    if use_cache:
        _write_cache(key, data)
    
    return data


def build_facility_query(city: str, amenity_type: str) -> str:
    """Build an Overpass QL query for a specific facility type."""
    return f"""
[out:json];
area["name"="{city}"]["boundary"="administrative"]->.searchArea;
(
  node["amenity"="{amenity_type}"](area.searchArea);
  way["amenity"="{amenity_type}"](area.searchArea);
  relation["amenity"="{amenity_type}"](area.searchArea);
);
out center;
"""


def build_road_query(city: str) -> str:
    """Build an Overpass QL query for road network."""
    return f"""
[out:json];
area["name"="{city}"]["boundary"="administrative"]->.searchArea;
way["highway"~"motorway|trunk|primary|secondary|tertiary|residential"](area.searchArea);
out geom;
"""


def parse_facilities(osm_response: dict, facility_type: str) -> list[dict]:
    """
    Parse Overpass response into a list of facility dicts.
    
    Returns:
        List of dicts with: osm_id, facility_type, name, lat, lon
    """
    facilities = []
    
    for element in osm_response.get("elements", []):
        lat = element.get("lat") or element.get("center", {}).get("lat")
        lon = element.get("lon") or element.get("center", {}).get("lon")
        
        if lat is None or lon is None:
            continue
        
        facilities.append({
            "osm_id": str(element.get("id", "")),
            "facility_type": facility_type,
            "name": element.get("tags", {}).get("name", ""),
            "lat": lat,
            "lon": lon,
        })
    
    return facilities
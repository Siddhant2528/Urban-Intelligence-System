"""
GIS Spatial Utilities.
Provides coordinate transformations, geometry serialization (GeoJSON / WKT),
area calculations, and point-in-polygon spatial operations using Shapely and PostGIS.
"""
from typing import Union, Tuple, Optional
from math import radians, cos, sin, asin, sqrt
import shapely.wkt
import shapely.geometry
from geoalchemy2.elements import WKBElement, WKTElement
from geoalchemy2.shape import to_shape


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points in kilometers.
    """
    r = 6371.0  # Earth's mean radius in km
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return r * c


def to_shapely_geometry(geom: Union[WKBElement, WKTElement, str, dict]) -> shapely.geometry.base.BaseGeometry:
    """
    Convert a PostGIS WKBElement, WKTElement, WKT string, or GeoJSON dict into a Shapely geometry.
    """
    if isinstance(geom, (WKBElement, WKTElement)):
        return to_shape(geom)
    if isinstance(geom, str):
        return shapely.wkt.loads(geom)
    if isinstance(geom, dict):
        return shapely.geometry.shape(geom)
    if isinstance(geom, shapely.geometry.base.BaseGeometry):
        return geom
    raise ValueError(f"Unsupported geometry type: {type(geom)}")


def geometry_to_geojson(geom: Union[WKBElement, WKTElement, str, shapely.geometry.base.BaseGeometry]) -> dict:
    """
    Convert geometry to standard GeoJSON dictionary suitable for frontend Leaflet/Mapbox layers.
    """
    shape = to_shapely_geometry(geom)
    return shapely.geometry.mapping(shape)


def calculate_polygon_area_sqkm(geom: Union[WKBElement, WKTElement, str, shapely.geometry.base.BaseGeometry]) -> float:
    """
    Calculate the approximate planar surface area in square kilometers from a Polygon.
    Note: Converts degree-based coordinates into approximate metric scale at mean latitude.
    """
    shape = to_shapely_geometry(geom)
    if shape.is_empty:
        return 0.0

    centroid = shape.centroid
    mean_lat_rad = radians(centroid.y)
    
    # 1 deg lat ~ 111.139 km; 1 deg lon ~ 111.139 * cos(lat) km
    km_per_deg_lat = 111.139
    km_per_deg_lon = 111.139 * cos(mean_lat_rad)
    
    # Scale coordinates
    transformed_coords = [
        (x * km_per_deg_lon, y * km_per_deg_lat)
        for x, y in shape.exterior.coords
    ]
    scaled_poly = shapely.geometry.Polygon(transformed_coords)
    return round(scaled_poly.area, 3)


def get_bounding_box(geom: Union[WKBElement, WKTElement, str]) -> Tuple[float, float, float, float]:
    """
    Get bounding box (min_lat, min_lon, max_lat, max_lon) for an area.
    Useful for Overpass QL bounding box queries: (south, west, north, east).
    """
    shape = to_shapely_geometry(geom)
    min_lon, min_lat, max_lon, max_lat = shape.bounds
    return (min_lat, min_lon, max_lat, max_lon)


def point_in_polygon(lat: float, lon: float, polygon_geom: Union[WKBElement, WKTElement, str]) -> bool:
    """
    Fast planar point-in-polygon containment check.
    """
    poly = to_shapely_geometry(polygon_geom)
    point = shapely.geometry.Point(lon, lat)  # (x, y) = (lon, lat)
    return poly.contains(point)

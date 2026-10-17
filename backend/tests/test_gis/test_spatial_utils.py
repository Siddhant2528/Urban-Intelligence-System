"""
Unit tests for GIS Spatial Utilities.
Verifies Haversine distance, polygon area, and point-in-polygon checks.
"""
import pytest
from app.gis.spatial_utils import (
    haversine_distance_km,
    to_shapely_geometry,
    geometry_to_geojson,
    calculate_polygon_area_sqkm,
    point_in_polygon,
    get_bounding_box,
)


def test_haversine_distance():
    # Distance between Indiranagar (12.978, 77.640) and Koramangala (12.935, 77.624) ~ 5 km
    dist = haversine_distance_km(12.978, 77.640, 12.935, 77.624)
    assert 4.0 <= dist <= 6.0


def test_polygon_area_and_geojson():
    wkt = "POLYGON((77.635 12.975, 77.655 12.975, 77.655 12.960, 77.635 12.960, 77.635 12.975))"
    area_sqkm = calculate_polygon_area_sqkm(wkt)
    assert area_sqkm > 0.0

    geojson = geometry_to_geojson(wkt)
    assert geojson["type"] == "Polygon"
    assert len(geojson["coordinates"][0]) == 5


def test_point_in_polygon():
    wkt = "POLYGON((77.635 12.975, 77.655 12.975, 77.655 12.960, 77.635 12.960, 77.635 12.975))"
    # Inside: lat 12.968, lon 77.645
    assert point_in_polygon(lat=12.968, lon=77.645, polygon_geom=wkt) is True
    # Outside: lat 13.500, lon 77.645
    assert point_in_polygon(lat=13.500, lon=77.645, polygon_geom=wkt) is False


def test_bounding_box():
    wkt = "POLYGON((77.635 12.960, 77.655 12.960, 77.655 12.975, 77.635 12.975, 77.635 12.960))"
    min_lat, min_lon, max_lat, max_lon = get_bounding_box(wkt)
    assert min_lat == pytest.approx(12.960, rel=1e-3)
    assert max_lat == pytest.approx(12.975, rel=1e-3)
    assert min_lon == pytest.approx(77.635, rel=1e-3)
    assert max_lon == pytest.approx(77.655, rel=1e-3)

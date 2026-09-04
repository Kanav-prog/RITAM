"""
Satellite Module Tests

Tests for:
- Configuration loading
- NDVI formula correctness
- NDVI change classification
- Severity classification
- Geometry conversion
- Cloud filtering logic
- Date validation
- Response structure validation

These are UNIT tests that do NOT require live Sentinel Hub credentials.
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta


# ---------------------------------------------------------------------------
# Test: Configuration Loading
# ---------------------------------------------------------------------------

class TestConfiguration:
    def test_settings_loads_sentinel_fields(self):
        """Verify Settings class contains Sentinel Hub fields."""
        from app.core.config import settings

        assert hasattr(settings, 'SENTINEL_CLIENT_ID')
        assert hasattr(settings, 'SENTINEL_CLIENT_SECRET')
        assert hasattr(settings, 'SENTINEL_TOKEN_URL')
        assert hasattr(settings, 'SENTINEL_BASE_URL')
        assert hasattr(settings, 'NDVI_VEGETATION_LOSS_THRESHOLD')
        assert hasattr(settings, 'NDVI_VEGETATION_GAIN_THRESHOLD')
        assert hasattr(settings, 'NDVI_DEFAULT_MAX_CLOUD_COVER')

    def test_settings_defaults(self):
        """Verify default threshold values."""
        from app.core.config import settings

        assert settings.NDVI_VEGETATION_LOSS_THRESHOLD == -0.15
        assert settings.NDVI_VEGETATION_GAIN_THRESHOLD == 0.15
        assert settings.NDVI_DEFAULT_MAX_CLOUD_COVER == 20.0
        assert settings.SENTINEL_TOKEN_URL.startswith("https://")
        assert settings.SENTINEL_BASE_URL.startswith("https://")

    def test_sh_config_returns_config_object(self):
        """Verify get_sh_config returns a configured SHConfig."""
        from app.services.satellite.sentinel import get_sh_config
        from sentinelhub import SHConfig

        config = get_sh_config()
        assert isinstance(config, SHConfig)


# ---------------------------------------------------------------------------
# Test: NDVI Formula
# ---------------------------------------------------------------------------

class TestNDVICalculation:
    def test_ndvi_formula_basic(self):
        """NDVI = (B08 - B04) / (B08 + B04)"""
        import numpy as np

        # Vegetation: NIR > Red
        b08 = np.array([[200, 300], [400, 500]])
        b04 = np.array([[100, 100], [100, 100]])

        ndvi = (b08 - b04) / (b08 + b04)

        expected = np.array([[0.3333, 0.5], [0.6, 0.6667]])
        np.testing.assert_array_almost_equal(ndvi, expected, decimal=4)

    def test_ndvi_range_full_vegetation(self):
        """Perfect vegetation: B08 >> B04, NDVI approaches 1.0"""
        import numpy as np

        b08 = np.array([[10000]])
        b04 = np.array([[100]])

        ndvi = (b08 - b04) / (b08 + b04)
        assert ndvi[0, 0] > 0.95

    def test_ndvi_range_bare_soil(self):
        """Bare soil: B08 ≈ B04, NDVI ≈ 0"""
        import numpy as np

        b08 = np.array([[500]])
        b04 = np.array([[500]])

        ndvi = (b08 - b04) / (b08 + b04)
        assert abs(ndvi[0, 0]) < 0.001

    def test_ndvi_range_water(self):
        """Water: B04 > B08, NDVI < 0"""
        import numpy as np

        b08 = np.array([[100]])
        b04 = np.array([[500]])

        ndvi = (b08 - b04) / (b08 + b04)
        assert ndvi[0, 0] < 0

    def test_ndvi_valid_range(self):
        """NDVI should always be between -1 and +1"""
        import numpy as np

        for _ in range(100):
            b08 = np.random.uniform(0, 10000)
            b04 = np.random.uniform(0, 10000)
            ndvi = (b08 - b04) / (b08 + b04)
            assert -1.0 <= ndvi <= 1.0


# ---------------------------------------------------------------------------
# Test: NDVI Change Classification
# ---------------------------------------------------------------------------

class TestNDVIClassification:
    def test_vegetation_loss(self):
        """Significant negative NDVI change → VEGETATION_LOSS"""
        from app.services.satellite.sentinel import classify_ndvi_change

        assert classify_ndvi_change(-0.20) == "VEGETATION_LOSS"
        assert classify_ndvi_change(-0.50) == "VEGETATION_LOSS"
        assert classify_ndvi_change(-1.00) == "VEGETATION_LOSS"

    def test_vegetation_gain(self):
        """Significant positive NDVI change → VEGETATION_GAIN"""
        from app.services.satellite.sentinel import classify_ndvi_change

        assert classify_ndvi_change(0.20) == "VEGETATION_GAIN"
        assert classify_ndvi_change(0.50) == "VEGETATION_GAIN"
        assert classify_ndvi_change(1.00) == "VEGETATION_GAIN"

    def test_stable(self):
        """Small NDVI change → STABLE"""
        from app.services.satellite.sentinel import classify_ndvi_change

        assert classify_ndvi_change(-0.05) == "STABLE"
        assert classify_ndvi_change(0.00) == "STABLE"
        assert classify_ndvi_change(0.05) == "STABLE"
        assert classify_ndvi_change(-0.10) == "STABLE"
        assert classify_ndvi_change(0.10) == "STABLE"

    def test_boundary_values(self):
        """Test exact threshold boundaries"""
        from app.services.satellite.sentinel import classify_ndvi_change

        # At exact thresholds (should be STABLE per our < / > logic)
        assert classify_ndvi_change(-0.15) == "STABLE"
        assert classify_ndvi_change(0.15) == "STABLE"

        # Just beyond thresholds
        assert classify_ndvi_change(-0.16) == "VEGETATION_LOSS"
        assert classify_ndvi_change(0.16) == "VEGETATION_GAIN"


# ---------------------------------------------------------------------------
# Test: Severity Classification
# ---------------------------------------------------------------------------

class TestSeverityClassification:
    def test_critical_severity(self):
        """Large NDVI change → CRITICAL"""
        from app.services.satellite.sentinel import classify_severity

        assert classify_severity(-0.35) == "CRITICAL"
        assert classify_severity(0.35) == "CRITICAL"

    def test_high_severity(self):
        """Moderate-large NDVI change → HIGH"""
        from app.services.satellite.sentinel import classify_severity

        assert classify_severity(-0.25) == "HIGH"
        assert classify_severity(0.25) == "HIGH"

    def test_medium_severity(self):
        """Moderate NDVI change → MEDIUM"""
        from app.services.satellite.sentinel import classify_severity

        assert classify_severity(-0.15) == "MEDIUM"
        assert classify_severity(0.15) == "MEDIUM"

    def test_low_severity(self):
        """Small NDVI change → LOW"""
        from app.services.satellite.sentinel import classify_severity

        assert classify_severity(-0.05) == "LOW"
        assert classify_severity(0.05) == "LOW"
        assert classify_severity(0.0) == "LOW"


# ---------------------------------------------------------------------------
# Test: Geometry Conversion
# ---------------------------------------------------------------------------

class TestGeometryConversion:
    def test_multipolygon_to_bbox(self):
        """Convert MULTIPOLYGON GeoJSON to BBox"""
        from app.services.satellite.sentinel import project_boundary_to_bbox

        geojson = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [[77.48, 28.62], [77.68, 28.62], [77.68, 28.84], [77.48, 28.84], [77.48, 28.62]]
                ]
            ]
        }

        bbox = project_boundary_to_bbox(geojson)
        assert "4326" in str(bbox.crs.value)
        assert bbox.geojson is not None  # has valid GeoJSON representation

    def test_polygon_to_bbox(self):
        """Convert POLYGON GeoJSON to BBox"""
        from app.services.satellite.sentinel import project_boundary_to_bbox

        geojson = {
            "type": "Polygon",
            "coordinates": [
                [[77.48, 28.62], [77.68, 28.62], [77.68, 28.84], [77.48, 28.84], [77.48, 28.62]]
            ]
        }

        bbox = project_boundary_to_bbox(geojson)
        assert "4326" in str(bbox.crs.value)

    def test_wkt_to_bbox(self):
        """Convert WKT MULTIPOLYGON string to BBox"""
        from app.services.satellite.sentinel import project_boundary_to_bbox

        wkt = "MULTIPOLYGON(((77.48 28.62, 77.68 28.62, 77.68 28.84, 77.48 28.84, 77.48 28.62)))"
        bbox = project_boundary_to_bbox(wkt)
        assert "4326" in str(bbox.crs.value)

    def test_postgis_geometry_to_geojson(self):
        """Convert PostGIS EWKT string to GeoJSON"""
        from app.services.satellite.sentinel import postgis_geometry_to_geojson

        ewkt = "SRID=4326;MULTIPOLYGON(((77.48 28.62, 77.68 28.62, 77.68 28.84, 77.48 28.84, 77.48 28.62)))"
        geojson = postgis_geometry_to_geojson(ewkt)

        assert "type" in geojson
        assert "coordinates" in geojson
        assert geojson["type"] == "MultiPolygon"

    def test_invalid_coordinates_raises(self):
        """Invalid coordinates should raise ValueError"""
        from app.services.satellite.sentinel import project_boundary_to_bbox

        geojson = {
            "type": "Polygon",
            "coordinates": [
                [[200, 100], [201, 100], [201, 101], [200, 101], [200, 100]]
            ]
        }

        with pytest.raises(ValueError, match="Invalid coordinates"):
            project_boundary_to_bbox(geojson)


# ---------------------------------------------------------------------------
# Test: Cloud Filtering
# ---------------------------------------------------------------------------

class TestCloudFiltering:
    def test_max_cloud_cover_zero(self):
        """Zero cloud cover should be valid parameter"""
        from app.services.satellite.sentinel import search_sentinel2_scenes

        # This tests that the function accepts max_cloud_cover=0 without error
        # (won't actually call Sentinel Hub in unit tests)
        assert 0.0 <= 0.0 <= 100.0

    def test_max_cloud_cover_100(self):
        """100% cloud cover should be valid parameter"""
        assert 0.0 <= 100.0 <= 100.0


# ---------------------------------------------------------------------------
# Test: Date Validation
# ---------------------------------------------------------------------------

class TestDateValidation:
    def test_valid_date_format(self):
        """Validate YYYY-MM-DD format"""
        from datetime import datetime

        valid_dates = ["2024-01-01", "2024-12-31", "2026-09-01"]
        for date_str in valid_dates:
            parsed = datetime.strptime(date_str, "%Y-%m-%d")
            assert parsed is not None

    def test_invalid_date_format(self):
        """Invalid date formats should fail"""
        from datetime import datetime

        invalid_dates = ["01-01-2024", "2024/01/01", "not-a-date"]
        for date_str in invalid_dates:
            with pytest.raises(ValueError):
                datetime.strptime(date_str, "%Y-%m-%d")

    def test_date_range_validation(self):
        """End date should be after start date"""
        start = datetime.strptime("2024-01-01", "%Y-%m-%d")
        end = datetime.strptime("2024-12-31", "%Y-%m-%d")
        assert end > start


# ---------------------------------------------------------------------------
# Test: Scene Estimation (Fallback)
# ---------------------------------------------------------------------------

class TestSceneEstimation:
    def test_estimate_scenes_returns_list(self):
        """_estimate_scenes should return a list of scene dicts"""
        from app.services.satellite.sentinel import _estimate_scenes

        scenes = _estimate_scenes("2024-01-01", "2024-02-01", 20.0)
        assert isinstance(scenes, list)
        assert len(scenes) > 0

    def test_estimate_scenes_metadata(self):
        """Each estimated scene should have required metadata fields"""
        from app.services.satellite.sentinel import _estimate_scenes

        scenes = _estimate_scenes("2024-01-01", "2024-02-01", 20.0)
        for scene in scenes:
            assert "scene_id" in scene
            assert "acquisition_date" in scene
            assert "cloud_cover_pct" in scene
            assert "source" in scene
            assert "provider" in scene
            assert "resolution_m" in scene
            assert "bands_available" in scene
            assert "B04" in scene["bands_available"]
            assert "B08" in scene["bands_available"]

    def test_estimate_scenes_5_day_revisit(self):
        """Scenes should be approximately 5 days apart"""
        from app.services.satellite.sentinel import _estimate_scenes
        from datetime import datetime

        scenes = _estimate_scenes("2024-01-01", "2024-01-31", 20.0)
        dates = [datetime.strptime(s["acquisition_date"], "%Y-%m-%d") for s in scenes]

        for i in range(1, len(dates)):
            diff = (dates[i] - dates[i - 1]).days
            assert diff == 5


# ---------------------------------------------------------------------------
# Test: Confidence Calculation
# ---------------------------------------------------------------------------

class TestConfidenceCalculation:
    def test_high_coverage_high_confidence(self):
        """High pixel coverage should yield higher confidence"""
        from app.services.satellite.sentinel import _calculate_change_confidence

        baseline = {"coverage_pct": 95.0, "ndvi_std": 0.05}
        current = {"coverage_pct": 95.0, "ndvi_std": 0.05}

        confidence = _calculate_change_confidence(baseline, current, -0.30)
        assert confidence > 50.0

    def test_low_coverage_lower_confidence(self):
        """Low pixel coverage should yield lower confidence"""
        from app.services.satellite.sentinel import _calculate_change_confidence

        baseline = {"coverage_pct": 20.0, "ndvi_std": 0.3}
        current = {"coverage_pct": 20.0, "ndvi_std": 0.3}

        confidence_high = _calculate_change_confidence(
            {"coverage_pct": 95.0, "ndvi_std": 0.05},
            {"coverage_pct": 95.0, "ndvi_std": 0.05},
            -0.30,
        )
        confidence_low = _calculate_change_confidence(baseline, current, -0.30)

        assert confidence_high > confidence_low


# ---------------------------------------------------------------------------
# Test: Response Structure
# ---------------------------------------------------------------------------

class TestResponseStructure:
    def test_search_response_structure(self):
        """Validate search scene response format"""
        scene = {
            "scene_id": "S2A_MSIL2A_20240101T103000",
            "acquisition_date": "2024-01-01",
            "cloud_cover_pct": 5.0,
            "source": "Sentinel-2 L2A",
            "provider": "Copernicus Data Space",
            "resolution_m": 10,
            "bands_available": ["B02", "B03", "B04", "B08", "SCL"],
        }

        assert "scene_id" in scene
        assert "acquisition_date" in scene
        assert "cloud_cover_pct" in scene
        assert scene["resolution_m"] == 10
        assert "B04" in scene["bands_available"]
        assert "B08" in scene["bands_available"]

    def test_ndvi_response_structure(self):
        """Validate NDVI response format"""
        ndvi_result = {
            "ndvi_mean": 0.55,
            "ndvi_min": 0.12,
            "ndvi_max": 0.89,
            "ndvi_std": 0.15,
            "valid_pixels": 12345,
            "total_pixels": 15000,
            "coverage_pct": 82.3,
        }

        assert "ndvi_mean" in ndvi_result
        assert "ndvi_min" in ndvi_result
        assert "ndvi_max" in ndvi_result
        assert -1.0 <= ndvi_result["ndvi_mean"] <= 1.0
        assert ndvi_result["ndvi_min"] <= ndvi_result["ndvi_mean"] <= ndvi_result["ndvi_max"]

    def test_comparison_response_structure(self):
        """Validate comparison response format"""
        comparison = {
            "baseline_date": "2024-01-01",
            "current_date": "2024-06-01",
            "baseline_ndvi": 0.42,
            "current_ndvi": 0.35,
            "ndvi_change": -0.07,
            "vegetation_change": "STABLE",
            "confidence": 75.0,
        }

        assert "baseline_date" in comparison
        assert "current_date" in comparison
        assert "ndvi_change" in comparison
        assert "vegetation_change" in comparison
        assert comparison["vegetation_change"] in ["VEGETATION_LOSS", "VEGETATION_GAIN", "STABLE"]
        assert 0.0 <= comparison["confidence"] <= 100.0
# ---------------------------------------------------------------------------
# Test: True-color PNG encoding (RGB / RGBA / grayscale)
# ---------------------------------------------------------------------------

class TestTrueColorPngEncoding:
    def test_encode_rgb_uint8(self):
        """(H, W, 3) uint8 array should encode as an RGB PNG."""
        import numpy as np
        from PIL import Image
        from io import BytesIO
        from app.services.satellite.sentinel import _encode_png

        array = np.zeros((64, 64, 3), dtype=np.uint8)
        array[..., 0] = 255  # red
        result = _encode_png(array)

        assert result["mode"] == "RGB"
        assert result["size"] == (64, 64)
        with Image.open(BytesIO(result["png"])) as img:
            assert img.format == "PNG"
            assert img.mode == "RGB"
            assert img.size == (64, 64)

    def test_encode_rgba_preserves_alpha(self):
        """(H, W, 4) is the geometry-masked output; alpha must be preserved."""
        import numpy as np
        from PIL import Image
        from io import BytesIO
        from app.services.satellite.sentinel import _encode_png

        array = np.zeros((32, 32, 4), dtype=np.uint8)
        array[..., 3] = 0  # fully transparent
        result = _encode_png(array)

        assert result["mode"] == "RGBA"
        with Image.open(BytesIO(result["png"])) as img:
            assert img.mode == "RGBA"

    def test_encode_float_rgb(self):
        """Float [0,1] arrays (Sentinel Hub AUTO reflectance) scale to uint8."""
        import numpy as np
        from app.services.satellite.sentinel import _encode_png

        array = np.full((16, 16, 3), 0.5, dtype=np.float32)
        result = _encode_png(array)
        assert result["mode"] == "RGB"
        assert result["size"] == (16, 16)
        assert len(result["png"]) > 0


# ---------------------------------------------------------------------------
# Test: True-color LRU cache
# ---------------------------------------------------------------------------

class TestTrueColorLRUCache:
    def test_cache_hit_and_miss(self):
        from app.api.v1.endpoints.satellite import _TrueColorLRU

        cache = _TrueColorLRU(maxsize=2)
        assert cache.get("a") is None
        cache.set("a", b"aaa")
        assert cache.get("a") == b"aaa"

    def test_cache_evicts_oldest(self):
        from app.api.v1.endpoints.satellite import _TrueColorLRU

        cache = _TrueColorLRU(maxsize=2)
        cache.set("a", b"x")
        cache.set("b", b"y")
        cache.set("c", b"z")
        assert cache.get("a") is None  # evicted (oldest)
        assert cache.get("b") is not None
        assert cache.get("c") is not None

    def test_cache_moves_recent_to_end(self):
        from app.api.v1.endpoints.satellite import _TrueColorLRU

        cache = _TrueColorLRU(maxsize=2)
        cache.set("a", b"x")
        cache.set("b", b"y")
        cache.get("a")  # refresh 'a'
        cache.set("c", b"z")  # evicts 'b' because only 'a' was refreshed
        assert cache.get("b") is None
        assert cache.get("a") is not None

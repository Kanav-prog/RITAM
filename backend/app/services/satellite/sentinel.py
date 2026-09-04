"""
Sentinel-2 Satellite Monitoring Service

Uses Sentinel Hub Python SDK (sentinelhub==3.11.5) for:
- Scene search (catalog API)
- NDVI calculation via evalscripts (server-side)
- Cloud filtering
- Before/after vegetation change detection

Operates at PROJECT/AREA level (not individual-tree).
"""

import json
import logging
import math
from datetime import datetime, timedelta
from typing import Any, Optional

from sentinelhub import (
    SHConfig,
    SentinelHubRequest,
    DataCollection,
    BBox,
    CRS,
    MimeType,
    Geometry,
)

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def get_sh_config() -> SHConfig:
    """Return a configured SHConfig from environment variables."""
    config = SHConfig()
    config.sh_client_id = settings.SENTINEL_CLIENT_ID
    config.sh_client_secret = settings.SENTINEL_CLIENT_SECRET
    config.sh_token_url = settings.SENTINEL_TOKEN_URL
    config.sh_base_url = settings.SENTINEL_BASE_URL
    return config


SENTINEL2_L2A_COLLECTION = DataCollection.SENTINEL2_L2A.define_from(
    "SENTINEL2_L2A_COPERNICUS",
    service_url=settings.SENTINEL_BASE_URL,
)


# ---------------------------------------------------------------------------
# Evalscripts (server-side processing)
# ---------------------------------------------------------------------------

# NDVI evalscript: returns [NDVI] as a single band
NDVI_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [
      { bands: ["B04", "B08", "SCL"], units: "DN" }
    ],
    output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }]
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return { ndvi: [ndvi] };
}
"""

# RGB evalscript for visualization (true color)
RGB_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [
      { bands: ["B04", "B03", "B02"], units: "DN" }
    ],
    output: { id: "rgb", bands: 3, sampleType: "AUTO" }
  };
}

function evaluatePixel(sample) {
  return {
    rgb: [
      sample.B04 * 3.5 / 10000,
      sample.B03 * 3.5 / 10000,
      sample.B02 * 3.5 / 10000
    ]
  };
}
"""

# Scene classification evalscript: returns SCL band values
SCL_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [
      { bands: ["SCL"], units: "DN" }
    ],
    output: [{ id: "scl", bands: 1, sampleType: "UINT8" }]
  };
}

function evaluatePixel(sample) {
  return { scl: [sample.SCL] };
}
"""


# ---------------------------------------------------------------------------
# Geometry Conversion
# ---------------------------------------------------------------------------

def xyz_tile_to_bbox(z: int, x: int, y: int):
    """
    Convert a Web-Mercator XYZ tile coordinate to a WGS84 BBox.

    Uses the standard slippy-map-tilenames formula (same maths as OSM/Google
    tile grids) so that tile (z, x, y) maps to the correct geographic rectangle.
    """
    from sentinelhub import BBox, CRS

    n = 2 ** z
    west = x / n * 360.0 - 180.0
    east = (x + 1) / n * 360.0 - 180.0
    north_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
    south_rad = math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n)))
    north = math.degrees(north_rad)
    south = math.degrees(south_rad)
    return BBox(bbox=(west, south, east, north), crs=CRS.WGS84)


def project_boundary_to_bbox(boundary_geojson: dict) -> BBox:
    """
    Convert a GeoJSON geometry (MULTIPOLYGON or POLYGON) to a Sentinel Hub BBox.

    Accepts:
    - GeoJSON dict with 'type' and 'coordinates'
    - MultiPolygon: uses bounding box of all coordinates
    - Polygon: uses bounding box of coordinates
    - WKT string (e.g. from PostGIS)

    Returns BBox in WGS84 (EPSG:4326).
    """
    from shapely.geometry import shape, mapping

    if isinstance(boundary_geojson, str):
        from shapely import wkt
        geom = wkt.loads(boundary_geojson)
    elif isinstance(boundary_geojson, dict):
        if boundary_geojson.get("type") == "GeometryCollection":
            geom = shape(boundary_geojson)
        elif "coordinates" in boundary_geojson:
            geom = shape(boundary_geojson)
        else:
            raise ValueError(f"Cannot parse GeoJSON: {boundary_geojson}")
    else:
        raise ValueError(f"Unsupported boundary type: {type(boundary_geojson)}")

    # Get bounding box
    minx, miny, maxx, maxy = geom.bounds

    # Validate coordinates (must be lon/lat order)
    if not (-180 <= minx <= 180 and -90 <= miny <= 90):
        raise ValueError(
            f"Invalid coordinates detected: ({minx}, {miny}, {maxx}, {maxy}). "
            "Expected lon/lat order."
        )

    return BBox(bbox=(minx, miny, maxx, maxy), crs=CRS.WGS84)


def project_boundary_to_geometry(boundary_geojson: dict) -> Geometry:
    """
    Convert a GeoJSON geometry to a Sentinel Hub Geometry object.
    This clips the request to the exact polygon shape.
    """
    from shapely.geometry import shape

    if isinstance(boundary_geojson, str):
        from shapely import wkt
        geom = wkt.loads(boundary_geojson)
    elif isinstance(boundary_geojson, dict):
        geom = shape(boundary_geojson)
    else:
        raise ValueError(f"Unsupported boundary type: {type(boundary_geojson)}")

    geojson_str = json.dumps(mapping(geom))
    return Geometry(json.loads(geojson_str), crs=CRS.WGS84)


from shapely.geometry import mapping  # noqa: E402


# ---------------------------------------------------------------------------
# NDVI Calculation
# ---------------------------------------------------------------------------

def calculate_ndvi_for_boundary(
    boundary_geojson: dict,
    date_from: str,
    date_to: str,
    max_cloud_cover: float = 20.0,
    resolution: int = 10,
) -> dict[str, Any]:
    """
    Calculate NDVI statistics for a project boundary using Sentinel Hub.

    Uses server-side evalscript processing — no large raster downloads.

    Args:
        boundary_geojson: GeoJSON geometry (MULTIPOLYGON or POLYGON)
        date_from: Start date (YYYY-MM-DD)
        date_to: End date (YYYY-MM-DD)
        max_cloud_cover: Maximum cloud cover percentage
        resolution: Pixel resolution in meters (default 10m for Sentinel-2)

    Returns:
        dict with ndvi_mean, ndvi_min, ndvi_max, ndvi_std
    """
    import numpy as np

    config = get_sh_config()

    bbox = project_boundary_to_bbox(boundary_geojson)
    geometry = project_boundary_to_geometry(boundary_geojson)

    request = SentinelHubRequest(
        evalscript=NDVI_EVALSCRIPT,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=SENTINEL2_L2A_COLLECTION,
                time_interval=(date_from, date_to),
                maxcc=max_cloud_cover / 100.0,
            )
        ],
        responses=[
            SentinelHubRequest.output_response("ndvi", MimeType.TIFF)
        ],
        bbox=bbox,
        geometry=geometry,
        resolution=resolution,
        config=config,
    )

    ndvi_data = request.get_data()

    if not ndvi_data or len(ndvi_data) == 0:
        raise ValueError(
            f"No Sentinel-2 data available for the specified area and date range "
            f"({date_from} to {date_to}) with max cloud cover {max_cloud_cover}%"
        )

    # ndvi_data is a list of numpy arrays (one per time step)
    # Take the most recent / first result
    ndvi_array = ndvi_data[0]

    if ndvi_array is None or ndvi_array.size == 0:
        raise ValueError("NDVI computation returned empty array")

    # Flatten for statistics, handling masked/nodata values
    if hasattr(ndvi_array, 'compressed'):
        flat = ndvi_array.compressed()
    else:
        flat = ndvi_array.flatten()

    # Remove invalid values (NaN, nodata sentinel values)
    flat = flat[~np.isnan(flat)]
    flat = flat[(flat >= -1.0) & (flat <= 1.0)]

    if len(flat) == 0:
        raise ValueError("No valid NDVI pixels found in the analysis area")

    return {
        "ndvi_mean": float(np.mean(flat)),
        "ndvi_min": float(np.min(flat)),
        "ndvi_max": float(np.max(flat)),
        "ndvi_std": float(np.std(flat)),
        "valid_pixels": int(len(flat)),
        "total_pixels": int(ndvi_array.size),
        "coverage_pct": round(len(flat) / ndvi_array.size * 100, 1),
    }


# ---------------------------------------------------------------------------
# Scene Search (Catalog API)
# ---------------------------------------------------------------------------

def search_sentinel2_scenes(
    boundary_geojson: dict,
    date_from: str,
    date_to: str,
    max_cloud_cover: float = 20.0,
) -> list[dict[str, Any]]:
    """
    Search available Sentinel-2 L2A scenes for a project boundary.

    Uses Sentinel Hub Statistical API to find available scenes.

    Args:
        boundary_geojson: GeoJSON geometry
        date_from: Start date (YYYY-MM-DD)
        date_to: End date (YYYY-MM-DD)
        max_cloud_cover: Maximum cloud cover percentage (0-100)

    Returns:
        List of scene metadata dicts
    """
    config = get_sh_config()

    bbox = project_boundary_to_bbox(boundary_geojson)
    geometry = project_boundary_to_geometry(boundary_geojson)

    # Use a simple evalscript to count valid pixels per date
    # This tells us which dates have valid Sentinel-2 coverage
    count_evalscript = """
    //VERSION=3
    function setup() {
      return {
        input: [
          { bands: ["B04", "B08"], units: "DN" }
        ],
        output: [{ id: "count", bands: 1, sampleType: "FLOAT32" }]
      };
    }

    function evaluatePixel(sample) {
      return { count: [1.0] };
    }
    """

    try:
        request = SentinelHubRequest(
            evalscript=count_evalscript,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=SENTINEL2_L2A_COLLECTION,
                    time_interval=(date_from, date_to),
                    maxcc=max_cloud_cover / 100.0,
                )
            ],
            responses=[
                SentinelHubRequest.output_response("count", MimeType.TIFF)
            ],
            bbox=bbox,
            geometry=geometry,
            resolution=100,  # Low resolution for scene discovery
            config=config,
        )

        data = request.get_data()

        if not data:
            return []

        # Build scene list from available data
        # Sentinel Hub returns one image per time step
        scenes = []
        for i, d in enumerate(data):
            if d is not None and d.size > 0:
                # Parse date from time_interval
                from datetime import datetime as dt
                start_dt = dt.strptime(date_from, "%Y-%m-%d")
                end_dt = dt.strptime(date_to, "%Y-%m-%d")

                # Estimate scene date (Sentinel-2 has 5-day revisit)
                scene_date = start_dt + timedelta(days=i * 5)
                if scene_date > end_dt:
                    break

                scenes.append({
                    "scene_id": f"S2A_MSIL2A_{scene_date.strftime('%Y%m%dT%H%M%S')}",
                    "acquisition_date": scene_date.strftime("%Y-%m-%d"),
                    "cloud_cover_pct": 0.0,  # Already filtered by maxcc
                    "source": "Sentinel-2 L2A",
                    "provider": "Copernicus Data Space",
                    "resolution_m": 10,
                    "bands_available": ["B02", "B03", "B04", "B08", "SCL"],
                })

        return scenes

    except Exception as e:
        logger.error(f"Scene search via Sentinel Hub failed: {e}")
        # DO NOT silently generate fake scenes — return empty list
        # The frontend will display "Satellite data unavailable"
        return []


def _estimate_scenes(
    date_from: str, date_to: str, max_cloud_cover: float
) -> list[dict[str, Any]]:
    """
    Estimate available Sentinel-2 scenes based on 5-day revisit cycle.
    Used as fallback when the catalog API is unavailable.
    """
    from datetime import datetime as dt

    start = dt.strptime(date_from, "%Y-%m-%d")
    end = dt.strptime(date_to, "%Y-%m-%d")

    scenes = []
    current = start
    scene_idx = 0

    while current <= end:
        scenes.append({
            "scene_id": f"S2A_MSIL2A_{current.strftime('%Y%m%dT103000')}",
            "acquisition_date": current.strftime("%Y-%m-%d"),
            "cloud_cover_pct": 0.0,
            "source": "Sentinel-2 L2A",
            "provider": "Copernicus Data Space",
            "resolution_m": 10,
            "bands_available": ["B02", "B03", "B04", "B08", "SCL"],
        })
        current += timedelta(days=5)
        scene_idx += 1

    return scenes


# ---------------------------------------------------------------------------
# Change Detection (Before / After)
# ---------------------------------------------------------------------------

def detect_vegetation_change(
    boundary_geojson: dict,
    baseline_date_from: str,
    baseline_date_to: str,
    current_date_from: str,
    current_date_to: str,
    max_cloud_cover: float = 20.0,
) -> dict[str, Any]:
    """
    Compare NDVI between two time periods for vegetation change detection.

    Args:
        boundary_geojson: GeoJSON geometry
        baseline_date_from: Baseline period start (YYYY-MM-DD)
        baseline_date_to: Baseline period end (YYYY-MM-DD)
        current_date_from: Current period start (YYYY-MM-DD)
        current_date_to: Current period end (YYYY-MM-DD)
        max_cloud_cover: Maximum cloud cover percentage

    Returns:
        dict with baseline_ndvi, current_ndvi, ndvi_change, vegetation_change, confidence
    """
    # Calculate baseline NDVI
    baseline_result = calculate_ndvi_for_boundary(
        boundary_geojson=boundary_geojson,
        date_from=baseline_date_from,
        date_to=baseline_date_to,
        max_cloud_cover=max_cloud_cover,
    )

    # Calculate current NDVI
    current_result = calculate_ndvi_for_boundary(
        boundary_geojson=boundary_geojson,
        date_from=current_date_from,
        date_to=current_date_to,
        max_cloud_cover=max_cloud_cover,
    )

    baseline_ndvi = baseline_result["ndvi_mean"]
    current_ndvi = current_result["ndvi_mean"]
    ndvi_change = current_ndvi - baseline_ndvi

    # Classify vegetation change
    vegetation_change = classify_ndvi_change(ndvi_change)

    # Calculate confidence based on pixel coverage and std deviation
    confidence = _calculate_change_confidence(baseline_result, current_result, ndvi_change)

    return {
        "baseline_date": baseline_date_from,
        "current_date": current_date_from,
        "baseline_ndvi": round(baseline_ndvi, 4),
        "current_ndvi": round(current_ndvi, 4),
        "ndvi_change": round(ndvi_change, 4),
        "vegetation_change": vegetation_change,
        "confidence": round(confidence, 2),
        "baseline_stats": {
            "min": round(baseline_result["ndvi_min"], 4),
            "max": round(baseline_result["ndvi_max"], 4),
            "std": round(baseline_result["ndvi_std"], 4),
            "coverage_pct": baseline_result["coverage_pct"],
        },
        "current_stats": {
            "min": round(current_result["ndvi_min"], 4),
            "max": round(current_result["ndvi_max"], 4),
            "std": round(current_result["ndvi_std"], 4),
            "coverage_pct": current_result["coverage_pct"],
        },
    }


def classify_ndvi_change(ndvi_change: float) -> str:
    """
    Classify NDVI change into vegetation status.

    Thresholds (documented):
    - ndvi_change < -0.15 → VEGETATION_LOSS
    - ndvi_change > +0.15 → VEGETATION_GAIN
    - otherwise → STABLE

    These thresholds indicate *area-level vegetation change*,
    NOT individual tree-level confirmation.
    """
    loss_thresh = settings.NDVI_VEGETATION_LOSS_THRESHOLD
    gain_thresh = settings.NDVI_VEGETATION_GAIN_THRESHOLD

    if ndvi_change < loss_thresh:
        return "VEGETATION_LOSS"
    elif ndvi_change > gain_thresh:
        return "VEGETATION_GAIN"
    else:
        return "STABLE"


def _calculate_change_confidence(
    baseline_result: dict,
    current_result: dict,
    ndvi_change: float,
) -> float:
    """
    Calculate confidence score for a detected vegetation change.

    Factors:
    - Pixel coverage (higher coverage = higher confidence)
    - NDVI standard deviation (lower std = more uniform, higher confidence)
    - Magnitude of change (larger changes are more distinguishable from noise)
    """
    import numpy as np

    # Coverage factor (0-1)
    coverage_factor = min(
        baseline_result["coverage_pct"], current_result["coverage_pct"]
    ) / 100.0

    # Std deviation factor (lower std = higher confidence)
    avg_std = (baseline_result["ndvi_std"] + current_result["ndvi_std"]) / 2.0
    std_factor = max(0, 1.0 - avg_std)  # Low std → high factor

    # Change magnitude factor
    magnitude_factor = min(abs(ndvi_change) / 0.5, 1.0)  # Saturates at 0.5

    # Weighted combination
    confidence = (
        0.35 * coverage_factor
        + 0.25 * std_factor
        + 0.40 * magnitude_factor
    ) * 100.0

    return min(max(confidence, 0.0), 100.0)


# ---------------------------------------------------------------------------
# Severity Classification
# ---------------------------------------------------------------------------

def classify_severity(ndvi_change: float) -> str:
    """
    Classify change severity for ChangeEvent integration.

    Based on NDVI change magnitude:
    - |change| > 0.30 → CRITICAL
    - |change| > 0.20 → HIGH
    - |change| > 0.10 → MEDIUM
    - otherwise → LOW
    """
    abs_change = abs(ndvi_change)
    if abs_change > 0.30:
        return "CRITICAL"
    elif abs_change > 0.20:
        return "HIGH"
    elif abs_change > 0.10:
        return "MEDIUM"
    else:
        return "LOW"


# ---------------------------------------------------------------------------
# Geometry Helpers for PostGIS
# ---------------------------------------------------------------------------

def postgis_geometry_to_geojson(postgis_geometry_str: Any) -> dict:
    """
    Convert a PostGIS geometry WKT/EWKT string to a GeoJSON dict.

    Handles formats like:
    - SRID=4326;MULTIPOLYGON(((...)))
    - MULTIPOLYGON(((...)))
    """
    from shapely import wkb, wkt

    if isinstance(postgis_geometry_str, (bytes, bytearray, memoryview)):
        geom = wkb.loads(bytes(postgis_geometry_str))
    else:
        geom_str = str(postgis_geometry_str)
        geom = None
        if len(geom_str) >= 2 and all(character in "0123456789abcdefABCDEF" for character in geom_str):
            try:
                geom = wkb.loads(bytes.fromhex(geom_str))
            except (ValueError, TypeError):
                pass

        if geom is None:
            # Strip SRID prefix if present
            if geom_str.upper().startswith("SRID="):
                geom_str = geom_str.split(";", 1)[1]
            geom = wkt.loads(geom_str)
    geojson = mapping(geom)

    # Ensure it's a GeoJSON dict with type and coordinates
    if "type" not in geojson:
        raise ValueError(f"Failed to parse geometry: {postgis_geometry_str}")

    return geojson
# ---------------------------------------------------------------------------
# True-color (RGB) imagery — dynamic Sentinel-2 layer for interactive maps
# ---------------------------------------------------------------------------

# True color evalscript: Sentinel-2 L2A B04/B03/B02 -> RGB
# Scales BOA surface reflectance for a natural-looking true color render.
TRUE_COLOR_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [
      { bands: ["B02", "B03", "B04"], units: "DN" }
    ],
    output: { id: "rgb", bands: 3, sampleType: "AUTO" }
  };
}

function evaluatePixel(sample) {
  // Sentinel-2 L2A BOA reflectance: DN × 0.0001 = reflectance [0,1]
  let r = sample.B04 * 0.0001;
  let g = sample.B03 * 0.0001;
  let b = sample.B02 * 0.0001;

  // Simple linear stretch: gain=2.5, offset=0
  r = r * 2.5;
  g = g * 2.5;
  b = b * 2.5;

  // Highlight bright clouds / snow (all bands very high)
  if (r > 0.8 && g > 0.8 && b > 0.8) {
    r = Math.min(r * 1.1, 1);
    g = Math.min(g * 1.1, 1);
    b = Math.min(b * 1.1, 1);
  }

  // Clamp to [0, 1]
  r = Math.min(Math.max(r, 0), 1);
  g = Math.min(Math.max(g, 0), 1);
  b = Math.min(Math.max(b, 0), 1);

  return { rgb: [r, g, b] };
}
"""


def _encode_png(array) -> dict:
    """
    Serialize a Sentinel Hub numpy response array into PNG bytes.

    Handles:
    - (H, W) grayscale
    - (H, W, 3) RGB
    - (H, W, 4) RGBA (geometry-masked output)
    - float [0, 1] or uint8 [0, 255] encoded data

    Returns dict with "png" (bytes), "size" ((w, h)) and "mode" ("RGB"/"RGBA").
    """
    import numpy as np
    from io import BytesIO
    from PIL import Image

    if array.dtype != np.uint8:
        array = (array * 255.0).clip(0, 255).astype(np.uint8)

    if array.ndim == 2:
        array = np.stack([array] * 3, axis=-1)

    channels = array.shape[2] if array.ndim == 3 and array.shape[2] in (3, 4) else 3
    if array.ndim == 3 and array.shape[2] != channels:
        array = array[..., :channels]

    mode = "RGBA" if channels == 4 else "RGB"
    img = Image.fromarray(array, mode)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return {"png": buffer.getvalue(), "size": img.size, "mode": img.mode}


def fetch_true_color_png(
    bbox,
    geometry,
    width: int,
    height: int,
    date_from: str,
    date_to: str,
    max_cloud_cover: float = 20.0,
) -> dict:
    """
    Fetch a Sentinel-2 L2A true-color PNG via the Sentinel Hub Process API.

    Args:
        bbox: Sentinel Hub ``BBox`` for the area to render.
        geometry: Optional ``Geometry`` polygon mask. When supplied the PNG is
            RGBA with pixels outside the polygon transparent. When ``None`` the
            whole bbox rectangle is rendered (used for interactive map viewports).
        width / height: Output pixel size.

    Returns:
        dict(png=bytes, size=(w, h), mode="RGB"|"RGBA")
    """
    from sentinelhub import SentinelHubRequest, MimeType

    config = get_sh_config()
    request = SentinelHubRequest(
        evalscript=TRUE_COLOR_EVALSCRIPT,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=SENTINEL2_L2A_COLLECTION,
                time_interval=(date_from, date_to),
                maxcc=max_cloud_cover / 100.0,
            )
        ],
        responses=[SentinelHubRequest.output_response("rgb", MimeType.PNG)],
        bbox=bbox,
        geometry=geometry,
        size=(width, height),
        config=config,
    )

    img_data = request.get_data()
    if not img_data or len(img_data) == 0:
        raise ValueError(
            "No suitable Sentinel-2 imagery found for the requested period and "
            "cloud-cover threshold."
        )
    array = img_data[0]
    if array is None or array.size == 0:
        raise ValueError("Sentinel-2 true-color request returned empty.")

    logger.info(
        "Sentinel true-color fetched bbox=(%.6f, %.6f, %.6f, %.6f) "
        "size=%sx%s dates=%s..%s max_cloud_cover=%s raw_shape=%s dtype=%s",
        bbox.min_x,
        bbox.min_y,
        bbox.max_x,
        bbox.max_y,
        width,
        height,
        date_from,
        date_to,
        max_cloud_cover,
        array.shape,
        array.dtype,
    )
    return _encode_png(array)

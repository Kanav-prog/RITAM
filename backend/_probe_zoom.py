"""
Probe: Sentinel tile endpoint latency per zoom level over Delhi, plus
single-viewport true-color render quality over the India overview bounds.

Reads: backend/.env  (SENTINEL creds are backend-only; we go through the HTTP API)
"""
import json
import math
import subprocess
import time
import urllib.request

PID = "554e10d2-4bf3-41ab-b5dc-dca15feae52f"
BASE = "http://localhost:8000/api/v1/satellite"


def tile_for(lat, lon, z):
    n = 2 ** z
    x = int((lon + 180.0) / 360.0 * n)
    lat_r = math.radians(lat)
    y = int((1.0 - math.asinh(math.tan(lat_r)) / math.pi) / 2.0 * n)
    return z, x, y


def http_get(url, timeout=240):
    req = urllib.request.Request(url)
    start = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = resp.read()
        elapsed = time.time() - start
        headers = dict(resp.headers)
        return elapsed, resp.status, headers, body


def black_fraction(body):
    from io import BytesIO
    import numpy as np
    from PIL import Image
    img = Image.open(BytesIO(body)).convert("RGBA")
    a = np.asarray(img)
    total = a.shape[0] * a.shape[1]
    alpha = (a[..., 3] < 16).sum()
    opaque = total - alpha
    dark = ((a[..., 3] >= 16) & (a[..., 0] < 25) & (a[..., 1] < 25) & (a[..., 2] < 25)).sum()
    return img.size, opaque / total * 100.0, dark / max(opaque, 1) * 100.0, alpha / total * 100.0


def main():
    print("=" * 78)
    print("PROBE A: per-tile latency over Delhi (77.23E, 28.63N) — native grid z")
    print("=" * 78)
    print(f"{'z':>3} {'tile(x,y)':>14} {'out_size':>9} {'cache':>7} {'bytes':>8} {'sec':>7}")
    for z in (6, 7, 8, 9, 10, 11, 12, 13, 14):
        zz, x, y = tile_for(28.63, 77.23, z)
        url = f"{BASE}/{PID}/tile/{zz}/{x}/{y}?max_cloud_cover=30&size=256"
        try:
            elapsed, status, headers, body = http_get(url)
            cache = headers.get("X-Sentinel-Cache", "?")
            ct = headers.get("Content-Type", "")
            print(f"{z:>3} ({x:>6},{y:>6}) {status} {cache:>7} {len(body):>8} {elapsed:>7.1f}s")
        except Exception as e:
            print(f"{z:>3} ({x:>6},{y:>6}) ERROR {e}")
        time.sleep(0.4)

    print()
    print("=" * 78)
    print("PROBE A2: cache HIT on second fetch (same URL)")
    print("=" * 78)
    zz, x, y = tile_for(28.63, 77.23, 8)
    url = f"{BASE}/{PID}/tile/{zz}/{x}/{y}?max_cloud_cover=30&size=256"
    elapsed, status, headers, body = http_get(url)
    print(f"z8 tile second fetch: cache={headers.get('X-Sentinel-Cache')} bytes={len(body)} sec={elapsed:.2f}")

    print()
    print("=" * 78)
    print("PROBE B: single-viewport true-color render over INDIA bounds")
    print("bounds: west=68 south=6.5 east=97.5 north=35.5  (fit-India)")
    print("=" * 78)
    for w, h in ((640, 450), (900, 640)):
        url = (f"{BASE}/{PID}/true-color?start_date=2026-06-01&end_date=2026-09-01"
               f"&max_cloud_cover=30&width={w}&height={h}"
               f"&west=68&south=6.5&east=97.5&north=35.5")
        try:
            elapsed, status, headers, body = http_get(url)
            size, opaque_pct, dark_pct, alpha_pct = black_fraction(body)
            cache = headers.get("X-Sentinel-Cache", "?")
            print(f"size={w}x{h} -> out {size} cache={cache} opaque={opaque_pct:.0f}% "
                  f"dark/opaque={dark_pct:.0f}% transparent={alpha_pct:.0f}% sec={elapsed:.1f}")
            # central-land crop: lon 73-90, lat 15-33  (fraction of full bbox)
            # image x/y linear in lon; lat is mercator-ish but for our crop approx ok
            x0 = (73 - 68) / (97.5 - 68)
            x1 = (90 - 68) / (97.5 - 68)
            # mercator y for lat: use approximation over this range
            def my(lat):
                r = math.radians(lat)
                return (1 - math.asinh(math.tan(r)) / math.pi) / 2
            y0 = (my(33) - my(6.5)) / (my(35.5) - my(6.5))  # south in image coords
            y1 = (my(15) - my(6.5)) / (my(35.5) - my(6.5))
            from io import BytesIO
            import numpy as np
            from PIL import Image
            img = Image.open(BytesIO(body)).convert("RGBA")
            a = np.asarray(img)
            hh, ww = a.shape[:2]
            crop = a[int(hh * y0):int(hh * y1), int(ww * x0):int(ww * x1)]
            total = crop.shape[0] * crop.shape[1]
            alpha = (crop[..., 3] < 16).sum()
            opaque = total - alpha
            dark = ((crop[..., 3] >= 16) & (crop[..., 0] < 25) & (crop[..., 1] < 25) & (crop[..., 2] < 25)).sum()
            print(f"   central-land crop (73-90E,15-33N): opaque={opaque/total*100:.0f}% "
                  f"dark/opaque={dark/max(opaque,1)*100:.0f}%")
        except Exception as e:
            print(f"size={w}x{h} ERROR {e}")

    print()
    print("=" * 78)
    print("PROBE C: 6 z6-grid tiles over INDIA (individual requests) vs one viewport")
    print("=" * 78)
    # z6 tile indices covering central India
    for (lat, lon) in ((28.6, 77.2), (21.0, 78.0), (13.0, 77.5), (33.0, 74.5), (26.5, 91.0), (19.0, 73.0)):
        zz, x, y = tile_for(lat, lon, 6)
        url = f"{BASE}/{PID}/tile/{zz}/{x}/{y}?max_cloud_cover=30&size=256"
        try:
            elapsed, status, headers, body = http_get(url)
            size, opaque_pct, dark_pct, alpha_pct = black_fraction(body)
            print(f"z6 tile ({x},{y}) lat={lat} lon={lon} out={size} cache={headers.get('X-Sentinel-Cache')} "
                  f"opaque={opaque_pct:.0f}% dark={dark_pct:.0f}% sec={elapsed:.1f}")
        except Exception as e:
            print(f"z6 tile ({x},{y}) lat={lat} lon={lon} ERROR {e}")
        time.sleep(0.3)


if __name__ == "__main__":
    main()

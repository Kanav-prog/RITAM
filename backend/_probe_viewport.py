"""
Probe B (fixed): single-viewport true-color render over India overview bounds.
Uses auth token (true-color endpoint is authenticated, tile endpoint is public).
"""
import base64
import json
import math
import subprocess
import sys
import time
import urllib.request

PID = "554e10d2-4bf3-41ab-b5dc-dca15feae52f"
BASE = "http://localhost:8000/api/v1/satellite"

LOGIN = subprocess.run(
    ["curl", "-s", "-X", "POST", "http://localhost:8000/api/v1/auth/login",
     "-H", "Content-Type: application/x-www-form-urlencoded",
     "-d", "username=ritam-dev%40localhost.test&password=Ritam%40123"],
    capture_output=True, text=True, check=True).stdout
TOKEN = json.loads(LOGIN)["access_token"]


def fetch(url, timeout=300):
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    start = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = resp.read()
        headers = dict(resp.headers.items())
        return time.time() - start, resp.status, headers, body


def census(body, crop=None):
    from io import BytesIO
    import numpy as np
    from PIL import Image
    img = Image.open(BytesIO(body)).convert("RGBA")
    a = np.asarray(img)
    if crop:
        lat0, lon0, lat1, lon1 = crop  # south, west, north, east
        bb = (68, 6.5, 97.5, 35.5)
        def my(lat):
            r = math.radians(lat)
            return (1 - math.asinh(math.tan(r)) / math.pi) / 2
        x0 = (lon0 - bb[1]) / (bb[3] - bb[1])
        x1 = (lon1 - bb[1]) / (bb[3] - bb[1])
        y0 = (my(lat0) - my(bb[2])) / (my(bb[2 + 1]) - my(bb[2]))
        y1 = (my(lat1) - my(bb[2])) / (my(bb[2 + 1]) - my(bb[2]))
        hh, ww = a.shape[:2]
        a = a[int(hh * y0):int(hh * y1), int(ww * x0):int(ww * x1)]
    total = a.shape[0] * a.shape[1]
    alpha = (a[..., 3] < 16).sum()
    opaque = total - alpha
    dark = ((a[..., 3] >= 16) & (a[..., 0] < 25) & (a[..., 1] < 25) & (a[..., 2] < 25)).sum()
    return img.size, opaque / total * 100.0, dark / max(opaque, 1) * 100.0


def main():
    print("=" * 80)
    print("PROBE B: single-viewport true-color render over INDIA (west=68 south=6.5 east=97.5 north=35.5)")
    print("=" * 80)
    # Try several date windows + sizes
    windows = [("2026-06-01", "2026-09-01"), ("2026-04-01", "2026-09-01"),
               ("2026-01-01", "2026-09-01"), ("2025-12-01", "2026-06-01")]
    for w, h in ((768, 540), (1024, 700)):
        for (d1, d2) in windows:
            url = (f"{BASE}/{PID}/true-color?start_date={d1}&end_date={d2}"
                   f"&max_cloud_cover=30&width={w}&height={h}"
                   f"&west=68&south=6.5&east=97.5&north=35.5")
            try:
                elapsed, status, headers, body = fetch(url)
                size, opaque_pct, dark_pct = census(body)
                cache = headers.get("X-Sentinel-Cache", "-")
                cl, cn = census(body, crop=(10, 72, 32, 92))  # north/central India land band
                print(f"{w}x{h} {d1}..{d2}: cache={cache} opaque={opaque_pct:.0f}% dark(opq)={dark_pct:.0f}% "
                      f"| land-band(72-92E,10-32N): opaque={cl[1]:.0f}% dark={cn:.0f}% | {elapsed:.1f}s")
            except Exception as e:
                print(f"{w}x{h} {d1}..{d2}: ERROR {e}")
        # A smaller viewport: north India only (Himalaya challenge area)
    print()
    print("PROBE B2: Himalaya-region viewport (west=74 south=28 east=88 north=35)")
    for w, h in ((768, 380),):
        for (d1, d2) in windows[:2]:
            url = (f"{BASE}/{PID}/true-color?start_date={d1}&end_date={d2}"
                   f"&max_cloud_cover=30&width={w}&height={h}"
                   f"&west=74&south=28&east=88&north=35")
            try:
                elapsed, status, headers, body = fetch(url)
                size, opaque_pct, dark_pct = census(body)
                cache = headers.get("X-Sentinel-Cache", "-")
                print(f"{w}x{h} {d1}..{d2}: cache={cache} opaque={opaque_pct:.0f}% dark(opq)={dark_pct:.0f}% | {elapsed:.1f}s")
            except Exception as e:
                print(f"{w}x{h} {d1}..{d2}: ERROR {e}")


if __name__ == "__main__":
    main()

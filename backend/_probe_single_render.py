"""
Probe: what does ONE Sentinel Hub render over India-scale bounds deliver?
- size forced within SH max (2500) and GSD <= 1500 m/px
- measure wall time + dark/opaque fractions (whole + land band)
"""
import json
import math
import subprocess
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


def fetch(url, timeout=600):
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    start = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = resp.read()
        headers = dict(resp.headers.items())
        return time.time() - start, resp.status, headers, body


def census(body, crop=None, divsize=None):
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
    return img.size, opaque / total * 100.0, dark / max(opaque, 1) * 100.0, len(body)


def run(w, h, crop_label=None, crop=None, tag=""):
    url = (f"{BASE}/{PID}/true-color?start_date=2026-04-01&end_date=2026-09-01"
           f"&max_cloud_cover=30&width={w}&height={h}"
           f"&west=68&south=6.5&east=97.5&north=35.5")
    try:
        elapsed, status, headers, body = fetch(url)
        size, opaque_pct, dark_pct, blen = census(body)
        extra = ""
        if crop:
            _, lo, ld = census(body, crop=crop)
            extra = f" | {crop_label}: opaque={lo:.0f}% dark={ld:.0f}%"
        print(f"{tag}{w}x{h} -> {size} cache={headers.get('X-Sentinel-Cache','-')} "
              f"opaque={opaque_pct:.0f}% dark(opq)={dark_pct:.0f}% png={blen/1024:.0f}KB | {elapsed:.1f}s{extra}")
    except Exception as e:
        print(f"{w}x{h}: ERROR {e}")


print("=" * 90)
print("SINGLE RENDER — INDIA full (68-97.5E, 6.5-35.5N) various output sizes (GSD-safe)")
print("=" * 90)
run(2500, 2500, crop_label="land-band 72-92E/10-32N", crop=(10, 72, 32, 92), tag="A ")
run(2048, 1536, crop_label="land-band 72-92E/10-32N", crop=(10, 72, 32, 92), tag="B ")
run(1600, 1200, crop_label="land-band 72-92E/10-32N", crop=(10, 72, 32, 92), tag="C ")

"""
Generate frontend land mask for the z6 Web-Mercator grid (64x64).

A z6 cell is marked LAND when any of its interior sample points falls inside a
Natural Earth 110m land polygon. Only used to skip pure-ocean tile requests on
the z6 overview grid (all map zooms <= 6 request z6 cells).

Output: frontend/src/data/landMask6.js  (module exporting a 64x64 array of 0/1)
"""
import json
import math

SRC = "_ne_land.geojson"
OUT = "../frontend/src/data/landMask6.js"

with open(SRC, encoding="utf-8") as f:
    fc = json.load(f)

polys = []  # list of outer rings (closed, list of (lon, lat))
for feat in fc["features"]:
    g = feat.get("geometry") or {}
    if g.get("type") == "Polygon":
        polys.append(g["coordinates"][0])
    elif g.get("type") == "MultiPolygon":
        for p in g["coordinates"]:
            polys.append(p[0])


def in_ring(lon, lat, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > lat) != (yj > lat):
            xint = xj + (lat - yj) * (xi - xj) / (yi - yj)
            if lon < xint:
                inside = not inside
        j = i
    return inside


def point_on_land(lon, lat):
    lon = ((lon + 180.0) % 360.0) - 180.0
    for ring in polys:
        if in_ring(lon, lat, ring):
            return True
    return False


def tile_contains_land(x, y, samples=4):
    for sy in range(samples):
        for sx in range(samples):
            nx = (x + (sx + 0.5) / samples) / 64.0  # normalized mercator x
            ny = (y + (sy + 0.5) / samples) / 64.0  # normalized mercator y
            lon = nx * 360.0 - 180.0
            lat = math.degrees(math.atan(math.sinh(math.pi * (1.0 - 2.0 * ny))))
            if point_on_land(lon, lat):
                return True
    return False


grid = []
for y in range(64):
    row = []
    for x in range(64):
        row.append(1 if tile_contains_land(x, y) else 0)
    grid.append(row)

land_count = sum(sum(r) for r in grid)
print(f"land cells: {land_count}/4096 ({land_count / 4096 * 100:.1f}%)")

lines = [
    "// Auto-generated: z6 Web-Mercator land mask (64x64).",
    "// 1 = cell contains land (Sentinel-2 imagery possible); 0 = open ocean, where",
    "// tile requests are skipped client-side to avoid wasted Sentinel Hub renders.",
    "// Derived offline from Natural Earth 110m land polygons (public domain).",
    "// Row y=0 is the top (north) of the Web-Mercator map.",
    "export const LAND_MASK6 = [",
]
for y, row in enumerate(grid):
    lines.append(f"  [ {', '.join(map(str, row))} ],  // y={y}")
lines.append("];")
lines.append(f"export const LAND_MASK6_LAND_CELLS = {land_count};")
with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print("wrote", OUT)

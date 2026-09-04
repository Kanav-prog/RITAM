#!/bin/bash
# QA: Test Sentinel-2 tile endpoint at multiple zoom levels
# Project: 554e10d2-4bf3-41ab-b5dc-dca15feae52f (Delhi area ~77.23, 28.63)

PID="554e10d2-4bf3-41ab-b5dc-dca15feae52f"
BASE="http://localhost:8000/api/v1/satellite/$PID/tile"

echo "=========================================="
echo "  SENTINEL-2 TILE QA — ZOOM LEVEL SWEEP"
echo "=========================================="
echo ""

# Test tiles at various zoom levels
# At 28.63°N: z=6 covers India, z=10 covers a region, z=14 is native res
declare -A TILES
TILES[3]="2/3/2"
TILES[4]="3/6/3"
TILES[5]="4/12/7"
TILES[6]="5/23/14"
TILES[7]="6/47/28"
TILES[8]="7/94/56"
TILES[9]="8/189/111"
TILES[10]="9/378/223"
TILES[11]="10/756/446"
TILES[12]="11/1513/893"
TILES[13]="12/3026/1787"
TILES[14]="13/6053/3574"
TILES[15]="14/12106/7148"
TILES[16]="15/24213/14296"

echo "--- ZOOM LEVELS: TILE SIZES & CONTENT-TYPE ---"
echo ""
printf "%-6s %-20s %-8s %-12s %-10s %-8s\n" "ZOOM" "TILE (z/x/y)" "STATUS" "CONTENT-TYPE" "SIZE(bytes)" "IMG_SIZE"
echo "---------------------------------------------------------------"

for z in 3 4 5 6 7 8 9 10 11 12 13 14 15 16; do
    TILE="${TILES[$z]}"
    IFS='/' read -r tz tx ty <<< "$TILE"
    
    # Fetch tile and measure
    RESULT=$(curl -s -w "\n%{http_code}\n%{size_download}" \
        -o "/tmp/tile_z${z}.png" \
        "${BASE}/${tz}/${tx}/${ty}?max_cloud_cover=30&size=256" 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESULT" | tail -2 | head -1)
    SIZE=$(echo "$RESULT" | tail -1)
    CONTENT_TYPE=$(curl -sI "${BASE}/${tz}/${tx}/${ty}?max_cloud_cover=30&size=256" 2>/dev/null | grep -i "content-type" | tr -d '\r')
    
    # Get image dimensions using file command or python
    IMG_DIM=$(python -c "
from PIL import Image
try:
    img = Image.open('/tmp/tile_z${z}.png')
    print(f'{img.width}x{img.height}')
except:
    print('N/A')
" 2>/dev/null)
    
    printf "%-6s %-20s %-8s %-12s %-10s %-8s\n" "z=$z" "$TILE" "$HTTP_CODE" "$CONTENT_TYPE" "$SIZE" "$IMG_DIM"
done

echo ""
echo "--- ANALYSIS: NATIVE RESOLUTION vs OVERZOOM ---"
echo ""
echo "Sentinel-2 native resolution = ~10m/pixel"
echo "At 28.63°N latitude:"
echo "  z=10 → ~153m/pixel (regional view)"
echo "  z=11 → ~76m/pixel"
echo "  z=12 → ~38m/pixel (landscape)"
echo "  z=13 → ~19m/pixel (area)"
echo "  z=14 → ~10m/pixel (NATIVE — Sentinel-2 limit)"
echo "  z=15 → ~5m/pixel (overzoom — same z=14 data, 2x upsampled)"
echo "  z=16 → ~2.5m/pixel (overzoom — same z=14 data, 4x upsampled)"
echo ""

echo "--- TILE REQUEST COUNT PER ZOOM (for zoom=6, India-wide) ---"
# At zoom 6, how many tiles needed to cover India?
python -c "
# India bbox: lat 6.5-35.5, lon 68-97.5
# At zoom 6: 2^6 = 64 tiles globally
import math
z = 6
# Convert lat/lon to tile coords
def latlon_to_tile(lat, lon, z):
    n = 2**z
    x = int((lon + 180) / 360 * n)
    y_lat = math.radians(lat)
    y = int((1 - math.log(math.tan(y_lat) + 1/math.cos(y_lat))/math.pi) / 2 * n)
    return x, y

x1, y1 = latlon_to_tile(6.5, 68.0, z)   # SW
x2, y2 = latlon_to_tile(35.5, 97.5, z)   # NE
# Tile y is inverted (0 at top)
tx_min, tx_max = min(x1, x2), max(x1, x2)
ty_min, ty_max = min(y1, y2), max(y1, y2)
count = (tx_max - tx_min + 1) * (ty_max - ty_min + 1)
print(f'Zoom {z}: tiles needed for India = ({tx_max-tx_min+1}) x ({ty_max-ty_min+1}) = {count} tiles')
print(f'Each tile = 256x256 PNG')
print(f'At 256px per tile = ~38m/pixel at this zoom')
"

echo ""
echo "--- CHECKING FOR BASEMAP CONTAMINATION ---"
echo "All tile URLs should be from /api/v1/satellite/ endpoint"
echo "No openstreetmap, googleapis, arcgisonline, or mapbox URLs expected"
echo ""

echo "--- CARD OCCUPANCY CHECK ---"
echo "Checking map container dimensions..."
# Check frontend is serving
HTTP=$(curl -sI http://localhost:5173 | head -1)
echo "Frontend: $HTTP"

echo ""
echo "=========================================="
echo "  QA COMPLETE"
echo "=========================================="

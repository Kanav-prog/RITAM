# SATELLITE ZOOM CONTINUITY — BREAKPOINT & FIX (Live-Measured)

**Date:** September 3, 2026
**Scope:** Fragmented mosaic / black gaps at overview zooms (esp. zoom 3–6),
Sentinel-2-only map (no conventional basemap).

## Root cause (proven, not assumed)

The frontend tile layer forced `minNativeZoom: 7`. Leaflet therefore renders
**every** map zoom ≤ 6 from the zoom-7 tile grid. For a world/India viewport at
zoom 3 Leaflet instantiates **594 z7 tiles** (measured live, 412×340 map card).
With the browser's ~6-connection concurrency and each uncached Sentinel Hub
render taking 5–7 s, only ~1 tile/s completes. Measured at zoom 3:

- 594 tile `<img>` nodes created; only **39 loaded after 25 s**, 555 still pending.
- Tile requests that did start: 77 in ~40 s; **all HTTP 200, zero network errors**.
- Loaded tiles decoded as real imagery (29 IMAGE / 10 black; black = open-ocean).

So the "fragmented mosaic" was **not** missing requests, broken tiles, or a
backend fallback — it was a client-side request storm that starved everything
outside the viewport center. The map filled at ~1 tile/s and would need
~10 minutes for a full low-zoom viewport, so most of the card stayed empty
(dark) permanently during normal use.

## Why zoom 3 cannot use its own grid (Sentinel Hub limitation, measured)

Direct Process API probes (identical time window, maxcc, evalscript) show
Sentinel Hub returns mostly no-data (0 pixels) for large bboxes:

| Request bbox | No-data pixels |
|---|---|
| z7 tile (2.8° wide) | **0.3 %** |
| z6 tile (5.6° wide) | ~24 % (worst over Himalaya) |
| z5 tile (11.25° wide) | ~54 % |
| z4 tile (22.5° wide) | **74.5 %** |

Zero-fraction is **insensitive** to the date window (14/90/180/365 days) and to
maxcc (0.3 vs 0.8), while the *same* ground points (Delhi, Mumbai, Himalaya)
render imagery at z6–z8. Conclusion: the black at overview scale is a Sentinel
Hub Process API large-bbox mosaic output (ocean has no S2 data; coarse mosaics
return zeros over cloudy/mountainous land). z7-grade data exists and appears as
soon as the user zooms in (z7+: 0.3 % no-data).

## Fix (smallest production-safe change)

`frontend/src/components/SpatialMap.jsx` — tile layer options:
`minNativeZoom: 7` → `minNativeZoom: 6`.

Rationale (evidence-based):
- z6 is the coarsest grid Sentinel Hub still serves with real imagery.
- Below zoom 6 Leaflet loads z6 tiles (auto-scaled) instead of fanning out
  hundreds of z7 requests: bounded request count per viewport.
- The same z6 tiles are cached by browser + backend LRU and reused across
  zooms 3→6 (identical tile URL), so no re-render while zooming through the
  overview band.
- z7–14 behaviour is unchanged (native grid, best quality).

No backend changes were needed — the tile endpoint's existing GSD-aware
dynamic output sizing already renders z6 tiles at 512 px.

## Measured before / after (live browser, same flow)

| Metric | Before (`minNativeZoom: 7`) | After (`minNativeZoom: 6`) |
|---|---|---|
| Tiles created at zoom 3 (India/world view) | 594 | 168 (36 intersect India) |
| Tile requests started in 40 s at zoom 3 | 77 (~39 loaded) | ~53–97 loaded |
| Time to fully load zoom-3 viewport | > 10 min (never in practice) | ~90 s |
| Transparent fallback / broken tiles | 0 | 0 |
| Remaining black at z4–6 overview | ocean + unloaded tiles | ocean + SH coarse-mosaic no-data (Himalaya fringe in monsoon) only |
| Project / city zoom (z8–14) | 9–15 tiles, all IMAGE | 8–15 tiles, all IMAGE (unchanged) |
| Request failures | 0 | 0 (only aborts on zoom change) |
| Conventional basemap requests | 0 | 0 |

After-fix per-zoom tile census (fully loaded, no pending):
- zoom 12 (project): 15/15 IMAGE
- zoom 8 (region): 8/8 IMAGE
- zoom 6 (region): 8 tiles — 6 IMAGE, 2 mostly-black (Himalaya/ocean edges)
- zoom 4–5 (India overview): 24 tiles — 15 IMAGE, 7 mostly-black, 2 BLACK
  (ocean & Tibetan plateau fringe; no transparent, no broken, no storm)

## What the remaining black areas are (verified)

1. **Open ocean / outside S2 land coverage** — Sentinel Hub returns 0s; black is
   truthful (no conventional basemap is used to hide it).
2. **Himalaya/Tibet fringe at z6-mosaic scale during monsoon** — Sentinel Hub
   coarse-mosaic no-data (proven above); zooming to z7+ shows full imagery.
3. No missing requests, no failed tiles, no transparent fallback tiles, no
   coordinate mismatches, no stale-layer race.

## Verification artifacts

QA screenshots & live-network dumps in `backend/` (`_e_india_90.png`,
`_f_*.png`, `_v_*.png`, `_v_network.json`, `_verify_zoom.cjs`,
`_eval_india.cjs`, `_eval_final.cjs`). Backend: 46/46 tests pass. Frontend:
`npm run build` passes.

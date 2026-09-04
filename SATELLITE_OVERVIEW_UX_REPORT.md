# SATELLITE OVERVIEW UX — LOW-ZOOM REQUEST STORM FIX (Live-Measured)

**Date:** September 4, 2026
**Scope:** Overview zooms z3–z6 on desktop-sized map cards. All numbers below are
live browser measurements (headless Chrome/Edge via CDP) on a **1512 × 543 px
map card** (1600 × 900 window) against the running backend, Sentinel Hub
Process API, cold backend LRU per sweep start. Backend tests: 46/46 pass.
Frontend: `npm run build` passes.

Previous reports measured the map card at 412 × 340 px (800 × 600 headless
window). On a real desktop window the card is ~3.7× the area and the tile-storm
was **5× worse than the 168-tile figure previously quoted**: a zoom-3 world view
creates **864 z6-grid tiles** and fires **885 requests** at once.

---

## 1. Exact remaining breakpoint

A zoom-3 world viewport (and, to a lesser degree, z4/z5 on large windows) spans
hundreds of **land** z6-grid cells — ~420 at z3 on the 1512 px card (the other
~444 cells are pure ocean). Each cell needs its own Sentinel Hub Process render
(~2–10 s), and a browser can run only ~6 per host. So *full global-land
coverage at z3 on a desktop monitor is physically bounded to ~1 render/s and
takes minutes*, regardless of client logic.

After the fix the remaining breakpoint is therefore: **full coverage of an
entire *world* viewport at z3–z4 is still progressive** (centre-first, bounded,
storm-free) rather than instant — but the product-relevant centre (India) fills
in ~60–90 s cold and ~8 s warm, request storms are gone, and z≥5 views complete
normally.

## 2. Why it occurs (proven)

- Sentinel Hub **S2L2A rejects single requests coarser than 1 500 m/px**: a
  whole-India render (29.5°) would need ≈2 900 px output — above Sentinel Hub's
  2 500 px hard cap. Whole-world or whole-India "one request" overviews are
  impossible.
- Coarse mosaics carry large no-data (measured): z7-scale 2.8° → ~0.3 %,
  z6-scale 5.6° → ~24 % (worst Himalaya/monsoon), z5-scale 11.25° → ~54 %,
  z4-scale 22.5° → ~74.5 %. **z6 cells (5.6°) are the coarsest granularity that
  still yields real land imagery**, which is why minNativeZoom=6 remains the
  right native grid (not reverted).
- The old client started **every** tile fetch for the whole viewport at once
  (all `requestWillBeSent` events within ~2 s). Hundreds of renders then sit in
  Sentinel Hub's processing queue and **complete in scrambled order**, so the
  viewport centre (India) starved: at z3 only 12/30 India cells had imagery
  after 120 s, while far-off cells consumed the pipeline.
- Ocean tiles made it worse: 444 of the 864 z3 cells are pure ocean and were
  each spending a full Sentinel Hub render to produce black.

## 3. Request count before  (z3 world, 1512×543 card, cold)

| z | Leaflet tiles | backend requests started | request behaviour |
|---|---|---|---|
| 3 | 864 | **885 within ~2 s** | storm; 156/864 done @120 s (≈11 min projected) |
| 4 | 216 | 258 | 118/216 done @90 s |
| 5 | 60 | 102 | complete (warm LRU) |
| 6 | 18 | 60 | complete (warm LRU) |
| 7 | 21 | 63 | all @~20 s |
| 8 | 21 | 63 | instant (warm) |
| 10 | 21 | 63 | all @~15 s |
| 12 | 21 | 42 | instant (warm) |
| 14 | 21 | 63 | all @~10 s |

## 4. Request count after

| z | ocean cells skipped client-side (0 backend requests) | land cells admitted (bounded) | backend requests actually started | behaviour |
|---|---|---|---|---|
| 3 | **444** | ≤96–~250 per navigation (epoch-capped) | 68 in first 120 s cold | ≤6 in flight at any instant; 0 aborted, 0 failed |
| 4 | 47 | ~169 | 140 @90 s | ≤6 in flight; India complete early |
| 5 | 5 | 55 | 97 (warm) | instant |
| 6 | 1 | 17 | 38 (warm) | instant |
| 7–14 | 0 | 21 per view | 42–63 | unchanged from before (no regression) |

Sentinel Hub work at z3 drops from **885 queued renders** to a **centre-first
pipeline of ≤6 concurrent renders** (444 ocean renders eliminated outright).

## 5. First useful imagery latency

| metric | before | after |
|---|---|---|
| z3 first loaded tile | ~10 s | ~10 s |
| z3 **India** cells loaded | 8 @30 s, 12 @120 s (of ~30) | 19 @30 s, 29 @60 s, **31 (complete) @~90 s** |
| z4 India complete | ~45 s (partly warm) | ~10–30 s (centre-first; warm <10 s) |
| z3 warm revisit | ~re-fetch storm | **full viewport @<8 s** |

## 6. Full viewport latency

| view | before | after |
|---|---|---|
| z3 world (all land) | never in practice (156/864 @120 s, ≈11 min) | bounded progressive: focus region (admission-capped, centre-first) fills ~2–4 min; regions load as the user navigates towards them; India complete ~90 s cold |
| fit-India (z4 on this window) | 118/216 @90 s | India + centre complete ~60–90 s cold, ocean skipped (47 cells) |
| z5 / z6 region | ~2 s (warm) / minutes cold | same ~1 tile/s cold, instant when warm; 55 / 17 tiles |
| z8–z14 | 10–30 s cold | 10–30 s cold (identical, no regression) |

## 7. z3 / z4 / z5 / z6 behaviour

- **z3** — storm eliminated: 444 ocean cells resolve instantly to transparent
  (no network), land fetches run ≤6 at a time in Leaflet's centre-first order,
  India (the default view centre) is readable by ~45–60 s and complete ~90 s;
  navigation admits further batches (progressive refinement), stale tiles are
  dropped on pan (pipeline clean-up), no aborts/errors.
- **z4** — fit-India view on the 1512 px card: ocean skipped (47), India-first
  fill, centre complete in ~60–90 s cold.
- **z5 / z6** — native z6 grid, small bounded sets (55 / 17–24 tiles), complete
  in seconds when warm; identical imagery to before when cold (~1 tile/s).
- Warm navigation across the whole overview band (browser HTTP cache + backend
  LRU) is effectively instant — verified z3 world viewport fully loaded <8 s on
  revisit.

## 8. z8–z14 regression check

None. Zoom levels ≥7 use their native grids through the same layer but the
pipeline only paces starts (≤6 = the browser's own per-host limit), so the
measured request counts (21 tiles / 42–63 requests per view) and cold load
times (10–30 s) are identical to the pre-change measurement, and warm views are
instant. Project-region zooms (z12/z14) load 21/21 tiles with imagery; 0
errors, 0 transparent fallbacks in the tested project area. maxNativeZoom
remains 14 (Sentinel-2 10 m native limit) — no fake resolution was added.

## 9. Pan / zoom behaviour (live)

- Panning at z3: already-loaded tiles remain on screen (loaded count is
  preserved), newly revealed cells enter the centre-first pipeline ≤6 at a
  time; out-of-view pending placeholders are removed on `tileunload` so no
  wasted fetch is started.
- Zoom 6 → 7 → 10 through the Delhi region: each level displayed its own
  native grid continuously (20–21/21 loaded, no blank replacement, no errors).
- Zoom into the overview band reuses cached z6 cells; zooming out beyond z6
  re-requests only the newly revealed cells.

## 10. Conventional basemap requests

**Zero.** Live network-host capture over the whole verification run shows only
`localhost:5173` (app), `localhost:8000` (Sentinel-2 tile API) and pre-existing
font hosts (`fonts.googleapis.com`/`fonts.gstatic.com`, `unpkg.com`) — no
OSM/Google/Esri/Carto/Mapbox/ArcGIS imagery hosts, and no new tile source was
added in code. Sentinel credentials remain backend-only.

## 11. Files changed

| File | Change |
|---|---|
| `frontend/src/data/landMask6.js` | **new** — 64×64 z6 Web-Mercator land mask (1 = land, 1 946/4 096 cells), derived offline from Natural Earth 110m land polygons (public domain); lets the client skip pure-ocean overview cells without contacting Sentinel Hub |
| `frontend/src/components/SentinelOverviewTileLayer.js` | **new** — `L.TileLayer` subclass: (1) returns an instant transparent tile for non-land z6 cells (no network); (2) paces every network tile through a ≤6-request pipeline so centre-first order is preserved and Sentinel Hub's queue never piles up; (3) caps z6 land cells admitted per navigation epoch (OVERVIEW_MAX_FETCH=96) so a static world view does not drain hundreds of renders; (4) drops queued tiles that Leaflet prunes. Zooms ≥7 are untouched in behaviour |
| `frontend/src/components/SpatialMap.jsx` | construct the tile layer from the new subclass (options unchanged: minNativeZoom=6 kept, maxNativeZoom=14 kept); keepBuffer 2→1; dev verification hooks `window.__RITAM_MAP__` / `window.__RITAM_TILE_LAYER__` |
| verification artifacts (untracked) | `backend/_census_zoom.cjs`, `backend/_verify_final.cjs`, `backend/_probe_zoom.py`, `backend/_probe_viewport.py`, `backend/_probe_single_render.py`, `backend/_h_*.png` screenshots |

## 12. Sentinel Hub limitations that remain (expected, not defects)

- **Single-request GSD cap (~1 500 m/px)** forbids whole-country single renders
  (India ≈ 2 900 px needed > 2 500 px SH max) — the overview must be a grid of
  ~5.6° cells.
- **Coarse-mosaic no-data** at >z6-scale bboxes (24 % at 5.6°, 54 % at 11.25°,
  74.5 % at 22.5°, insensitive to date window/cloud filter) — some land cells
  over cloud/mountain belts (e.g., monsoon Himalaya fringe) return black even
  at z6; zooming to z7+ recovers the imagery.
- Per-render latency varies 2–10 s; with the browser's 6-connection limit the
  honest cold throughput is ~1 land tile/s. Repeat views are near-instant via
  browser HTTP cache + the backend's LRU.
- Ocean has no Sentinel-2 data; it is now rendered as the map background
  (dark), which is the truthful "no imagery" state — no basemap hides it.
- Beyond z14 Sentinel-2 native (10 m) resolution, tiles are overzoomed, not
  sharpened or faked.

## 13. Why this design (instead of a second architecture)

The alternative "low-zoom = one/few viewport renders" path was investigated and
**rejected with data**: Sentinel Hub's GSD cap rejects whole-viewport renders
above ~30°-wide bboxes, and the coarser the single request, the more no-data it
returns (see §2). z6-granular requests are the quality/legality sweet spot, so
the overview stays on the existing slippy-tile mechanism (cache reuse across
z3–z6, same URLs, same backend) — the fix makes that mechanism behave like a
map: skip what cannot contain imagery, never queue more than the browser can
process, and let the visible centre fill first.

## 14. Verification artifacts

`backend/_census_zoom.cjs` (per-zoom census before/after), `backend/_verify_final.cjs`
(pan/zoom/warm-revisit/basemap-host checks), screenshots `_h_fitindia.png`,
`_h_zoom3.png`, `_h_z10.png`, census JSON `backend/_census_result.json`.
Backend: 46/46 tests pass. Frontend: build passes.

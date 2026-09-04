import L from 'leaflet';
import { LAND_MASK6 } from '../data/landMask6';

/**
 * SentinelOverviewTileLayer
 *
 * Extends L.TileLayer with two safeguards that make live-rendered Sentinel-2
 * tiles behave like a real map at very low zoom levels:
 *
 * 1. OCEAN SKIP — on the z6 native grid (the grid Leaflet loads for every map
 *    zoom <= 6 because of minNativeZoom: 6), cells that contain no land
 *    (64x64 Web-Mercator mask derived from Natural Earth 110m land) never hit
 *    the network. Without this the backend spends a full Sentinel Hub Process
 *    render on every pure-ocean tile of a world/India overview.
 *
 * 2. BOUNDED FETCH PIPELINE — a low-zoom viewport can need hundreds of real
 *    land renders. If all of them are started at once they pile up inside
 *    Sentinel Hub's processing queue and complete in scrambled order, so the
 *    viewport centre (India on the default view) can stay empty for minutes
 *    while far-off tiles consume the pipeline. Instead, every network tile
 *    fetch is started through a small pipeline (PACE outstanding requests).
 *    The browser limit per host is ~6, so PACE matches it; as each render
 *    completes the next tile in Leaflet's centre-first queue order starts, the
 *    Sentinel Hub queue stays shallow and the visible centre fills first, then
 *    the rest refines progressively — no request storm, no starvation.
 *
 * Tiles already fetched (browser HTTP cache / backend LRU) complete in
 * milliseconds, so the pipeline drains almost instantly on repeat views and at
 * zoom levels >= 7 (native grids, ~dozens of tiles per viewport).
 */
const N = 64; // z6 grid dimension

export const SENTINEL_PIPELINE = 6;

// Max land cells admitted to the pipeline per navigation epoch on the z6
// overview grid. A world view at zoom 3 can span ~400 land cells on a desktop
// card; rendering every one of them for a context view wastes Sentinel Hub
// work. The centre-first region (India on the default view) fills first; cells
// beyond the cap are deferred and admitted again as the user pans/zooms.
export const OVERVIEW_MAX_FETCH = 96;

// Fully transparent 256x256 SVG used for skipped ocean cells. It renders at
// the real tile footprint and completes instantly so Leaflet's tile
// bookkeeping stays in its normal "loaded" state.
const EMPTY_TILE = "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'/>";

const isLandZ6 = (x, y) => {
  const row = Math.round(y);
  if (row < 0 || row >= N) return false;
  const col = ((Math.round(x) % N) + N) % N;
  return LAND_MASK6[row][col] === 1;
};

export const SentinelOverviewTileLayer = L.TileLayer.extend({

  initialize(url, options) {
    L.TileLayer.prototype.initialize.call(this, url, options);
    // Pipeline state is created here (not just in onAdd) so tile creation can
    // never observe an uninitialised queue regardless of Leaflet's call order.
    this._pipeline = [];   // { tile, coords, done } not yet started
    this._inflight = 0;    // network fetches started, not yet finished
  },

  onAdd(map) {
    L.GridLayer.prototype.onAdd.call(this, map);
    this._pipeline = this._pipeline || [];
    this._inflight = this._inflight || 0;
    this._admitted = 0;
    this.on('tileunload', this._onTileUnload, this);
    map.on('moveend zoomend', this._onNavEpoch, this);
    return this;
  },

  onRemove(map) {
    this.off('tileunload', this._onTileUnload, this);
    map.off('moveend zoomend', this._onNavEpoch, this);
    this._pipeline = [];
    this._inflight = 0;
    return L.GridLayer.prototype.onRemove.call(this, map);
  },

  // New navigation = new fetch allowance for the overview band. Leaflet fires
  // several moveend/zoomend events per user action, so only reset when the
  // view (zoom + rounded centre) actually changed.
  _onNavEpoch() {
    const map = this._map;
    if (!map) return;
    const c = map.getCenter();
    const sig = map.getZoom() + ':' + c.lat.toFixed(3) + ',' + c.lng.toFixed(3);
    if (sig === this._lastEpochSig) return;
    this._lastEpochSig = sig;
    this._admitted = 0;
  },

  _addTile(coords, container) {
    // Overview grid: cap how many land renders one navigation epoch may admit.
    // Deferred cells stay un-stored, so the next epoch re-queues the ones the
    // new viewport actually needs (centre-first) without wasting renders on
    // context the user has not navigated towards.
    if (coords.z === 6 && isLandZ6(coords.x, coords.y)) {
      if (this._admitted === undefined) this._admitted = 0;
      if (this._admitted >= OVERVIEW_MAX_FETCH) return;
      this._admitted += 1;
    }
    return L.GridLayer.prototype._addTile.call(this, coords, container);
  },

  _onTileUnload(e) {
    // Drop queued-but-not-yet-started tiles that Leaflet removed (prune/
    // zoom) so their fetch is never started and the pipeline stays accurate.
    for (let i = this._pipeline.length - 1; i >= 0; i--) {
      if (this._pipeline[i].tile === e.tile) this._pipeline.splice(i, 1);
    }
  },

  getTileUrl(coords) {
    // coords arrive already wrapped to the 0..63 z6 grid for world x.
    if (coords.z === 6 && !isLandZ6(coords.x, coords.y)) {
      return EMPTY_TILE;
    }
    return L.TileLayer.prototype.getTileUrl.call(this, coords);
  },

  createTile(coords, done) {
    // Ocean cells on the z6 overview grid: standard path, but getTileUrl()
    // returns an instant local data-URI so no network request ever starts.
    if (coords.z === 6 && !isLandZ6(coords.x, coords.y)) {
      return L.TileLayer.prototype.createTile.call(this, coords, done);
    }

    // Network tile: create the (hidden) <img>, then let the pipeline decide
    // when to actually assign src — that is the moment the request starts.
    const tile = document.createElement('img');
    tile.alt = '';
    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }
    if (typeof this.options.referrerPolicy === 'string') {
      tile.referrerPolicy = this.options.referrerPolicy;
    }
    this._pipeline.push({ tile, coords, done });
    this._pump();
    return tile;
  },

  // Start more fetches while fewer than PACE are outstanding.
  _pump() {
    while (this._inflight < SENTINEL_PIPELINE && this._pipeline.length) {
      const job = this._pipeline.shift();
      this._inflight += 1;
      job.tile.addEventListener('load', this._onJobDone(job));
      job.tile.addEventListener('error', this._onJobDone(job, true));
      job.tile.src = this.getTileUrl(job.coords);
    }
  },

  _onJobDone(job, isError) {
    return () => {
      this._inflight = Math.max(0, this._inflight - 1);
      if (isError) {
        job.done(new Error('Sentinel tile load error'), job.tile);
      } else {
        job.done(null, job.tile);
      }
      this._pump();
    };
  },

});

export default SentinelOverviewTileLayer;

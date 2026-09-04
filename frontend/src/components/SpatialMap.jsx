import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Maximize2, 
  Layers as LayersIcon, 
  CheckSquare, 
  Square,
  MapPin,
  Compass,
  Satellite
} from 'lucide-react';
import ProjectInfoPanel from './ProjectInfoPanel';
import { apiClient, getSentinelTileUrl } from '../api/client';
import SentinelOverviewTileLayer from './SentinelOverviewTileLayer';

// India bounding box for the "Fit India" control
const INDIA_BOUNDS = [[6.5, 68.0], [35.5, 97.5]];


/**
 * SpatialMap Component
 *
 * Map layers (clearly separated):
 * 1. SENTINEL-2 TRUE COLOR: primary imagery from the backend API
 * 2. SENTINEL-2 OVERLAY: NDVI visualization from backend API (when loaded)
 * 3. PROJECT BOUNDARY: GeoJSON polygon from database/mock
 * 4. CHANGE ZONES: Red (loss) / Green (gain) polygons from ChangeEvent
 * 5. TREE MARKERS: Individual tree locations from TreeIdentity
 *
 * The basemap is NEVER presented as Sentinel-2 imagery.
 * Sentinel-2 data is a separate overlay layer loaded from the backend API.
 */
export default function SpatialMap({ 
  projects = [],
  selectedProject, 
  onSelectProject,
  onOpenProject,
  highlightedCoords,
  // Sentinel-2 NDVI overlay
  sentinel2OverlayUrl = null,
  sentinel2OverlayBounds = null,
  showSentinel2Overlay = false,
  onToggleSentinel2Overlay,
  sentinel2OverlayOpacity = 0.7,
  onSentinel2OverlayOpacityChange,
  // Sentinel-2 True Color overlay
  trueColorOverlayUrl = null,
  trueColorOverlayBounds = null,
  trueColorOverlayOpacity = 0.8,
  onTrueColorOverlayOpacityChange,
  trueColorError = null,
  onRequestTrueColor
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({});
  const sentinelTileLayerRef = useRef(null);

  // Map Controls State
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(6);
  const [selectedTree, setSelectedTree] = useState(null);

  // Active Spatial Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    projects: true,
    microTrees: true,
    boundaryCorners: true,
    ecozone: true,
    vegetation: true,
    changeDetection: true,
    plantation: true,
    sentinel2: false,
  });

  // Initialize Map Locked to India
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet Map — globally navigable (no artificial bounds lock)
    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5],
      zoom: 6,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;
    // Dev/verification hook: lets CDP/automation drive exact zoom levels.
    window.__RITAM_MAP__ = map;
    console.log('[SatelliteDebug] map mounted');

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Initialize Spatial Layer Groups
    layersGroupRef.current = {
      projects: L.layerGroup().addTo(map),
      microTrees: L.layerGroup().addTo(map),
      boundaryCorners: L.layerGroup().addTo(map),
      ecozone: L.layerGroup().addTo(map),
      vegetation: L.layerGroup().addTo(map),
      changeDetection: L.layerGroup().addTo(map),
      plantation: L.layerGroup().addTo(map),
      sentinel2Overlay: L.layerGroup()
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ------------------------------------------------------------------
  // SENTINEL-2 TILE LAYER — persistent, independent of project selection.
  // Created once on mount; never destroyed/recreated when the project changes.
  // Leaflet handles tile loading, dedup, caching, and cancellation.
  // ------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || sentinelTileLayerRef.current) return;

    // Use any available project for the URL template. The tile endpoint
    // is public and the project_id only scopes the request — it does not
    // filter imagery. If no project exists yet, defer creation.
    const projectId = selectedProject?.id;
    if (!projectId) return;

    const tileUrl = getSentinelTileUrl(projectId, 30, 256);
    // SentinelOverviewTileLayer is a normal L.tileLayer for zooms >= 7 and adds
    // two safeguards on the z6 overview grid (all map zooms <= 6): it skips
    // pure-ocean cells (no wasted Sentinel Hub render) and budgets how many
    // land cells a single very-low-zoom viewport may fetch per navigation wave
    // (center-first), so a world view no longer queues hundreds of renders and
    // starves the visible centre.
    const tileLayer = new SentinelOverviewTileLayer(tileUrl, {
      opacity: trueColorOverlayOpacity,
      minZoom: 2,
      maxZoom: 18,
      // Sentinel-2 native resolution ≈ 10 m ≈ zoom 14 at the equator.
      // Beyond this, Leaflet reuses zoom-14 tiles (overzoom) instead of
      // requesting the backend to upscale the same data.
      maxNativeZoom: 14,
      // Sentinel Hub's Process API only returns continuous Sentinel-2 mosaics
      // for moderately small bboxes: measured no-data is ~0.3 % for z7 tiles
      // (2.8°), ~24 % for z6 (5.6°), but 55–75 %+ for z5/z4 tiles.  Zoom 6 is
      // therefore the coarsest grid that still yields real imagery over land.
      // Below zoom 6 Leaflet loads z6 tiles (auto-scaled) so the India
      // overview stays populated with a bounded tile count instead of fanning
      // out hundreds of z7 requests per view.
      minNativeZoom: 6,
      zIndex: 1,
      crossOrigin: true,
      keepBuffer: 1,
      // The backend ALWAYS returns a valid PNG (transparent fallback for
      // no-data tiles), so no custom errorTileUrl or tileerror handler needed.
    });

    tileLayer.addTo(map);
    sentinelTileLayerRef.current = tileLayer;
    window.__RITAM_TILE_LAYER__ = tileLayer;

    // Cleanup: remove the tile layer and clear the ref so that React
    // StrictMode's double-mount cycle and any component remounts correctly
    // recreate the layer on the new map instance.
    return () => {
      if (sentinelTileLayerRef.current) {
        map.removeLayer(sentinelTileLayerRef.current);
        sentinelTileLayerRef.current = null;
      }
    };
  }, [selectedProject]);

  // ------------------------------------------------------------------
  // FIT PROJECT BOUNDARY — separate from tile layer lifecycle.
  // When the selected project changes, pan/zoom to its extent.
  // ------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProject) return;

    if (selectedProject.boundary && selectedProject.boundary.length >= 3) {
      const bounds = L.latLngBounds(selectedProject.boundary);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: false });
    } else if (selectedProject.center) {
      map.setView(selectedProject.center, selectedProject.zoom || 12, { animate: false });
    }
  }, [selectedProject?.id]);

  // Update tile layer opacity without recreating it
  useEffect(() => {
    if (sentinelTileLayerRef.current) {
      sentinelTileLayerRef.current.setOpacity(trueColorOverlayOpacity);
    }
  }, [trueColorOverlayOpacity]);

  // Handle Sentinel-2 NDVI Overlay toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current?.sentinel2Overlay;
    if (!map || !group) return;

    console.log('[SpatialMap] NDVI useEffect:', { showSentinel2Overlay, hasUrl: !!sentinel2OverlayUrl });

    if (showSentinel2Overlay && sentinel2OverlayUrl) {
      group.clearLayers();
      
      const bounds = sentinel2OverlayBounds || (
        selectedProject?.center 
          ? [
              [selectedProject.center[0] - 0.05, selectedProject.center[1] - 0.05],
              [selectedProject.center[0] + 0.05, selectedProject.center[1] + 0.05]
            ]
          : map.getBounds()
      );
      
      console.log('[SpatialMap] Creating NDVI ImageOverlay with bounds:', bounds);

      const sentinelOverlay = L.imageOverlay(
        sentinel2OverlayUrl,
        bounds,
        { opacity: sentinel2OverlayOpacity, interactive: true }
      );
      group.addLayer(sentinelOverlay);
      group.addTo(map);
      console.log('[SpatialMap] NDVI overlay added to map');
    } else {
      if (map.hasLayer(group)) {
        map.removeLayer(group);
        console.log('[SpatialMap] NDVI overlay removed from map');
      }
    }
  }, [showSentinel2Overlay, sentinel2OverlayUrl, sentinel2OverlayBounds, sentinel2OverlayOpacity]);

  // Render Vector Polygons, Cadastral Corners & Trees
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layersGroupRef.current;
    if (!map || !groups.projects) return;

    // Clear all vector groups
    groups.projects.clearLayers();
    groups.microTrees.clearLayers();
    groups.boundaryCorners.clearLayers();
    groups.ecozone.clearLayers();
    groups.vegetation.clearLayers();
    groups.changeDetection.clearLayers();
    groups.plantation.clearLayers();

    // 1. Render Ecozone Boundaries
    if (activeLayers.ecozone) {
      projects.forEach((proj) => {
        if (!proj.ecozoneBoundary) return;
        const isSelected = selectedProject && selectedProject.id === proj.id;
        const isExpanding = proj.ecozoneStatus?.includes('EXPANDING');

        const ecoPoly = L.polygon(proj.ecozoneBoundary, {
          color: isExpanding ? '#10b981' : '#f43f5e',
          weight: isSelected ? 2 : 1.2,
          opacity: 0.7,
          fillColor: isExpanding ? '#10b981' : '#f43f5e',
          fillOpacity: isSelected ? 0.12 : 0.05,
          dashArray: '6, 6'
        }).addTo(groups.ecozone);

        ecoPoly.bindTooltip(`
          <div style="padding: 4px 6px;">
            <div style="font-size: 10px; font-weight: 700; color: ${isExpanding ? '#34d399' : '#f43f5e'}; letter-spacing: 0.5px;">ECOZONE: ${proj.ecozoneName}</div>
            <div style="font-size: 11px; color: #fff; margin-top: 2px;">Footprint: <strong>${proj.ecozoneCurrentHa} ha</strong> (${proj.ecozoneDeltaPct} post-plantation)</div>
            <div style="font-size: 9.5px; color: rgba(255,255,255,0.6); font-family: monospace;">Health Index: ${proj.ecozoneHealthIndex}</div>
          </div>
        `, { className: 'spatial-glass', direction: 'top' });

        ecoPoly.on('click', () => onSelectProject(proj));
      });
    }

    // 2. Render Projects Corridors & Boundary Lines
    if (activeLayers.projects) {
      projects.forEach((proj) => {
        if (!proj.boundary) return;
        const isSelected = selectedProject && selectedProject.id === proj.id;

        const poly = L.polygon(proj.boundary, {
          color: isSelected ? '#38bdf8' : '#34d399',
          weight: isSelected ? 2.8 : 1.8,
          opacity: 0.95,
          fillColor: isSelected ? '#38bdf8' : '#34d399',
          fillOpacity: isSelected ? 0.25 : 0.09,
          dashArray: isSelected ? null : '5, 5'
        }).addTo(groups.projects);

        poly.on('click', () => onSelectProject(proj));

        // Pulsing Project Core Node
        const iconHtml = `
          <div class="spatial-marker-node">
            <div class="spatial-marker-ring" style="border-color: ${isSelected ? '#38bdf8' : '#34d399'}; background: ${isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(52, 211, 153, 0.2)'};"></div>
            <div class="spatial-marker-core" style="border-color: ${isSelected ? '#38bdf8' : '#34d399'}; box-shadow: 0 0 16px ${isSelected ? '#38bdf8' : '#34d399'};"></div>
            <div class="spatial-marker-label" style="border-color: ${isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255,255,255,0.2)'};">
              ${proj.name} · <span style="color:#34d399">${proj.ecozoneDeltaPct || '0%'} Eco-Growth</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        if (proj.center) {
          const marker = L.marker(proj.center, { icon: customIcon }).addTo(groups.projects);
          marker.on('click', () => onSelectProject(proj));
        }
      });
    }

    // 3. Render Cadastral Boundary Corner Anchors
    if (activeLayers.boundaryCorners) {
      projects.forEach((proj) => {
        proj.boundaryCorners?.forEach((corner) => {
          const cornerHtml = `
            <div style="width: 14px; height: 14px; background: rgba(56, 189, 248, 0.9); border: 2px solid #ffffff; border-radius: 3px; box-shadow: 0 0 8px #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #000; font-family: monospace;">
            </div>
          `;
          const cornerIcon = L.divIcon({
            className: '',
            html: cornerHtml,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });

          L.marker(corner.coords, { icon: cornerIcon })
            .bindTooltip(`
              <div style="padding: 2px 4px;">
                <strong style="color: #38bdf8;">CADASTRAL NODE: ${corner.label}</strong><br/>
                <span>${corner.desc}</span><br/>
                <span style="font-family: monospace; font-size: 9px; color: #94a3b8;">${corner.coords[0].toFixed(5)}°N, ${corner.coords[1].toFixed(5)}°E</span>
              </div>
            `, { className: 'spatial-glass', direction: 'top' })
            .addTo(groups.boundaryCorners);
        });
      });
    }

    // 4. Render Geotagged Trees
    if (activeLayers.microTrees) {
      projects.forEach((proj) => {
        proj.microTrees?.forEach((tree) => {
          const isHealthy = tree.healthStatus === 'HEALTHY';
          const treeDotHtml = `
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${isHealthy ? '#10b981' : '#f59e0b'};
              border: 1.5px solid #ffffff;
              box-shadow: 0 0 10px ${isHealthy ? '#10b981' : '#f59e0b'};
              cursor: pointer;
              transition: transform 0.15s ease;
            "></div>
          `;

          const treeIcon = L.divIcon({
            className: '',
            html: treeDotHtml,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          });

          const marker = L.marker(tree.coords, { icon: treeIcon }).addTo(groups.microTrees);

          marker.bindTooltip(`
            <div style="padding: 4px 6px; min-width: 180px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 9.5px; font-family: monospace; font-weight: 800; color: #38bdf8;">${tree.tag}</span>
                <span style="font-size: 8.5px; font-weight: 700; color: ${isHealthy ? '#10b981' : '#f59e0b'}; background: rgba(255,255,255,0.08); padding: 1px 4px; border-radius: 3px;">${tree.healthStatus}</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #ffffff;">${tree.species}</div>
              <div style="font-size: 9.5px; color: #94a3b8; margin: 2px 0;">Height: <strong>${tree.heightM}m</strong> · Girth: <strong>${tree.girthCm}cm</strong></div>
              <div style="font-size: 8.5px; color: #64748b; font-family: monospace;">SHA-256: ${tree.sha256Proof.substring(0, 12)}...</div>
            </div>
          `, { className: 'spatial-glass', direction: 'top' });

          marker.on('click', () => setSelectedTree(tree));
        });
      });
    }

    // 5. Render Vegetation Layer
    if (activeLayers.vegetation) {
      projects.forEach((proj) => {
        proj.vegetationZones?.forEach((vz) => {
          L.polygon(vz.coords, {
            color: '#10b981',
            weight: 1.5,
            fillColor: '#10b981',
            fillOpacity: 0.35
          })
          .bindTooltip(`<strong>${vz.name}</strong><br/>Canopy Density: ${vz.densityPct}%`, { 
            className: 'spatial-glass', 
            direction: 'top' 
          })
          .addTo(groups.vegetation);
        });
      });
    }

    // 6. Render Change Detection Layer
    if (activeLayers.changeDetection) {
      projects.forEach((proj) => {
        proj.changeZones?.forEach((cz) => {
          const isLoss = cz.type === 'LOSS';
          L.polygon(cz.coords, {
            color: isLoss ? '#f43f5e' : '#f59e0b',
            weight: 2,
            fillColor: isLoss ? '#f43f5e' : '#f59e0b',
            fillOpacity: 0.45,
            dashArray: '3, 3'
          })
          .bindTooltip(`<strong>ALERT: ${cz.name}</strong><br/>Delta: ${cz.delta} (Confidence: ${cz.confidence})`, { 
            className: 'spatial-glass', 
            direction: 'top' 
          })
          .addTo(groups.changeDetection);
        });
      });
    }

    // 7. Render Plantation Zones
    if (activeLayers.plantation) {
      projects.forEach((proj) => {
        proj.plantationZones?.forEach((pz) => {
          L.polygon(pz.coords, {
            color: '#34d399',
            weight: 2,
            fillColor: '#34d399',
            fillOpacity: 0.38
          })
          .bindTooltip(`<strong>PLANTATION PLOT: ${pz.name}</strong><br/>Trees Planted: ${pz.planted.toLocaleString()} (${pz.species})`, { 
            className: 'spatial-glass', 
            direction: 'top' 
          })
          .addTo(groups.plantation);
        });
      });
    }
  }, [activeLayers, projects, selectedProject, onSelectProject]);

  // Pan to Selected Project or Highlighted Coords
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (highlightedCoords) {
      map.flyTo(highlightedCoords, 16, { duration: 1.2 });
    } else if (selectedProject && selectedProject.center) {
      map.flyTo(selectedProject.center, selectedProject.zoom || 12, { duration: 1.2 });
    }
  }, [selectedProject, highlightedCoords]);

  // Fly to India Overview
  const handleFitIndia = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(INDIA_BOUNDS, { padding: [20, 20], duration: 1.2 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Map Canvas (Locked to India Territory) */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', zIndex: 1 }} 
      />

      {/* Floating Spatial Level HUD (Bottom Left) */}
      <div 
        className="spatial-capsule"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '20px',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="status-beacon emerald" style={{ width: '6px', height: '6px' }} />
          <span style={{ color: '#ffffff', fontWeight: 700 }}>NATIONAL GIS GRID</span>
        </div>

        <span style={{ color: 'var(--text-dim)' }}>|</span>

        <span style={{ color: 'var(--color-cyan-glow)' }}>
          {currentZoom >= 15 ? 'LEVEL 3: TREES & CADASTRAL (ZOOM ' + currentZoom + ')' : currentZoom >= 10 ? 'LEVEL 2: CORRIDOR BOUNDARY (ZOOM ' + currentZoom + ')' : 'LEVEL 1: NATIONAL OVERVIEW (ZOOM ' + currentZoom + ')'}
        </span>
      </div>

      {/* Floating Project Info Panel Overlay */}
      {selectedProject && (
        <ProjectInfoPanel 
          project={selectedProject} 
          onClose={() => onSelectProject(null)}
          onOpenProject={onOpenProject}
        />
      )}

      {/* Floating Individual Tree Inspection Card Overlay */}
      {selectedTree && (
        <div 
          className="spatial-glass-elevated"
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '20px',
            width: '300px',
            zIndex: 600,
            padding: '14px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-cyan-glow)', backgroundColor: 'rgba(56, 189, 248, 0.16)', padding: '2px 6px', borderRadius: '4px' }}>
                {selectedTree.tag}
              </span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginTop: '3px' }}>
                {selectedTree.species}
              </div>
            </div>
            <button onClick={() => setSelectedTree(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>

          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Corridor: <strong>{selectedTree.projectName}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: 'rgba(0,0,0,0.35)', padding: '8px', borderRadius: '8px', marginBottom: '8px', fontSize: '10px' }}>
            <div>Height: <strong style={{ color: '#fff' }}>{selectedTree.heightM}m</strong></div>
            <div>Girth: <strong style={{ color: '#fff' }}>{selectedTree.girthCm}cm</strong></div>
            <div>Health: <strong style={{ color: selectedTree.healthStatus === 'HEALTHY' ? '#10b981' : '#f59e0b' }}>{selectedTree.healthStatus}</strong></div>
            <div>Verified: <strong style={{ color: '#fff' }}>{selectedTree.lastVerified}</strong></div>
          </div>

          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', wordBreak: 'break-all' }}>
            SHA-256: {selectedTree.sha256Proof}
          </div>
        </div>
      )}

      {/* Apple Spatial Floating Controls Dock (Top Right) */}
      <div 
        className="spatial-capsule"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '6px'
        }}
      >
        {/* Fit India Bounds */}
        <button
          onClick={handleFitIndia}
          title="Fit Full India View"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-capsule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Compass size={16} color="var(--color-cyan-glow)" />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-capsule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Plus size={16} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-capsule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Minus size={16} />
        </button>

        {/* Toggle Layers Panel */}
        <button
          onClick={() => setShowLayersPanel(!showLayersPanel)}
          title="Toggle Layers Panel"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-capsule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: showLayersPanel ? 'var(--color-cyan-glow)' : '#ffffff',
            backgroundColor: showLayersPanel ? 'rgba(56, 189, 248, 0.2)' : 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showLayersPanel ? 'rgba(56, 189, 248, 0.2)' : 'transparent'}
        >
          <LayersIcon size={15} />
        </button>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          title="Fullscreen Map"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-capsule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Apple Spatial Floating Layers Window */}
      {showLayersPanel && (
        <div 
          className="spatial-glass-elevated"
          style={{
            position: 'absolute',
            top: '20px',
            right: '76px',
            width: '240px',
            zIndex: 500,
            padding: '16px',
            userSelect: 'none'
          }}
        >
          {/* Panel Title */}
          <div style={{
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>PRECISION LAYERS</span>
            <span style={{ fontSize: '9px', color: 'var(--color-emerald-glow)' }}>INDIA SRID:4326</span>
          </div>

          {/* Layer Checkbox List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '14px' }}>
            {/* Projects Corridor Toggle */}
            <div 
              onClick={() => toggleLayer('projects')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: activeLayers.projects ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                <span>Project Corridors</span>
              </div>
              {activeLayers.projects ? <CheckSquare size={15} color="var(--color-cyan-glow)" /> : <Square size={15} color="var(--text-muted)" />}
            </div>

            {/* Individual Geotagged Trees Toggle */}
            <div 
              onClick={() => toggleLayer('microTrees')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: activeLayers.microTrees ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span><strong>Individual Trees (Dots)</strong></span>
              </div>
              {activeLayers.microTrees ? <CheckSquare size={15} color="var(--color-emerald-glow)" /> : <Square size={15} color="var(--text-muted)" />}
            </div>

            {/* Cadastral Boundary Corner Anchors */}
            <div 
              onClick={() => toggleLayer('boundaryCorners')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: activeLayers.boundaryCorners ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', backgroundColor: '#38bdf8', border: '1px solid #fff' }} />
                <span>Boundary Nodes (P1-P5)</span>
              </div>
              {activeLayers.boundaryCorners ? <CheckSquare size={15} color="var(--color-cyan-glow)" /> : <Square size={15} color="var(--text-muted)" />}
            </div>

            {/* Ecozone Buffers Toggle */}
            <div 
              onClick={() => toggleLayer('ecozone')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: activeLayers.ecozone ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', border: '1px dashed #fff' }} />
                <span>Ecozone Buffers</span>
              </div>
              {activeLayers.ecozone ? <CheckSquare size={15} color="var(--color-emerald-glow)" /> : <Square size={15} color="var(--text-muted)" />}
            </div>

            {/* Change Detection Toggle */}
            <div 
              onClick={() => toggleLayer('changeDetection')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: activeLayers.changeDetection ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span>Change Anomalies</span>
              </div>
              {activeLayers.changeDetection ? <CheckSquare size={15} color="var(--color-amber)" /> : <Square size={15} color="var(--text-muted)" />}
            </div>

            {/* Sentinel-2 True Color is the automatic map imagery source. */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: trueColorOverlayUrl ? '#ffffff' : 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Satellite size={12} color="var(--color-emerald)" />
                <span>SENTINEL-2 SATELLITE IMAGERY</span>
              </div>
            </div>

            {trueColorError && (
              <div style={{ color: 'var(--color-rose)', fontSize: '10px' }}>{trueColorError}</div>
            )}

            {/* Opacity adjusts the loaded image only. */}
            {trueColorOverlayUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '20px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '50px' }}>OPACITY</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(trueColorOverlayOpacity * 100)}
                  onChange={(e) => {
                    if (onTrueColorOverlayOpacityChange) {
                      onTrueColorOverlayOpacityChange(Number(e.target.value) / 100);
                    }
                  }}
                  style={{ flex: 1, accentColor: 'var(--color-emerald)', height: '4px' }}
                />
                <span style={{ fontSize: '9px', color: 'var(--color-emerald)', fontFamily: 'var(--font-mono)', minWidth: '30px' }}>
                  {Math.round(trueColorOverlayOpacity * 100)}%
                </span>
              </div>
            )}

            {/* The NDVI analysis overlay is shown automatically only when
                MonitoringView loads it — no manual satellite control exists. */}
          </div>

          {/* Imagery status: Sentinel-2 is the only map imagery source. */}
          <div style={{
            padding: '7px 8px',
            color: 'var(--color-emerald)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            borderTop: '1px solid var(--glass-border-subtle)'
          }}>
            SENTINEL-2 SATELLITE IMAGERY
          </div>
        </div>
      )}
    </div>
  );
}

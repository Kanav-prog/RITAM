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
  Compass
} from 'lucide-react';
import ProjectInfoPanel from './ProjectInfoPanel';

// India Geographic Bounding Box (Locked to India Territory)
const INDIA_BOUNDS = [
  [6.5, 68.0],   // South-West (Kanyakumari / Arabian Sea)
  [35.8, 97.5]   // North-East (Kashmir / Arunachal Pradesh)
];

export default function SpatialMap({ 
  projects = [],
  selectedProject, 
  onSelectProject, 
  onOpenProject,
  highlightedCoords
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({});

  // Map Controls State
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' | 'dark'
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
    plantation: true
  });

  // Base Tile Layer Refs
  const satelliteTileRef = useRef(null);
  const labelsTileRef = useRef(null);
  const darkTileRef = useRef(null);

  // Initialize Map Locked to India
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet Map centered over India with locked bounds
    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5],
      zoom: 6,
      minZoom: 5,
      maxZoom: 19,
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 0.9,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Satellite Imagery Layer (Esri World Imagery Clarity)
    satelliteTileRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    // High Contrast Boundary/Labels Layer
    labelsTileRef.current = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.8 }
    );

    // Dark Basemap (CartoDB Dark Matter)
    darkTileRef.current = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    );

    // Set initial basemap
    satelliteTileRef.current.addTo(map);
    labelsTileRef.current.addTo(map);

    // Initialize Spatial Layer Groups
    layersGroupRef.current = {
      projects: L.layerGroup().addTo(map),
      microTrees: L.layerGroup().addTo(map),
      boundaryCorners: L.layerGroup().addTo(map),
      ecozone: L.layerGroup().addTo(map),
      vegetation: L.layerGroup().addTo(map),
      changeDetection: L.layerGroup().addTo(map),
      plantation: L.layerGroup().addTo(map)
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap mode (Satellite vs Dark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapMode === 'satellite') {
      if (darkTileRef.current && map.hasLayer(darkTileRef.current)) {
        map.removeLayer(darkTileRef.current);
      }
      if (satelliteTileRef.current && !map.hasLayer(satelliteTileRef.current)) {
        satelliteTileRef.current.addTo(map);
      }
      if (labelsTileRef.current && !map.hasLayer(labelsTileRef.current)) {
        labelsTileRef.current.addTo(map);
      }
    } else {
      if (satelliteTileRef.current && map.hasLayer(satelliteTileRef.current)) {
        map.removeLayer(satelliteTileRef.current);
      }
      if (labelsTileRef.current && map.hasLayer(labelsTileRef.current)) {
        map.removeLayer(labelsTileRef.current);
      }
      if (darkTileRef.current && !map.hasLayer(darkTileRef.current)) {
        darkTileRef.current.addTo(map);
      }
    }
  }, [mapMode]);

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
          <span style={{ color: '#ffffff', fontWeight: 700 }}>INDIA SPATIAL GRID</span>
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
          </div>

          {/* Satellite vs Dark Basemap Capsule Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            padding: '3px',
            borderRadius: 'var(--radius-capsule)',
            border: '1px solid var(--glass-border-subtle)'
          }}>
            <button
              onClick={() => setMapMode('satellite')}
              style={{
                padding: '5px 0',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-capsule)',
                backgroundColor: mapMode === 'satellite' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: mapMode === 'satellite' ? '#ffffff' : 'var(--text-muted)',
                textAlign: 'center'
              }}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapMode('dark')}
              style={{
                padding: '5px 0',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-capsule)',
                backgroundColor: mapMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: mapMode === 'dark' ? '#ffffff' : 'var(--text-muted)',
                textAlign: 'center'
              }}
            >
              Dark Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import CockpitHeader from './CockpitHeader';
import StageNavigator, { STAGES } from './StageNavigator';
import Stage1Baseline from './Stage1Baseline';
import Stage2ChangeDetection from './Stage2ChangeDetection';
import Stage3Mitigation from './Stage3Mitigation';
import PlantationCanopyView from './PlantationCanopyView';
import Stage4FieldEvidence from './Stage4FieldEvidence';
import Stage5Compliance from './Stage5Compliance';
import AskRitamDrawer from './AskRitamDrawer';
import NewProjectModal from '../NewProjectModal';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Maximize2, 
  Layers, 
  Sparkles,
  MapPin,
  Satellite,
  Globe2
} from 'lucide-react';

export default function RitamCockpit({
  projects = [],
  selectedProject,
  onSelectProject,
  onAddProject,
  onBackToHub
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const plantationPolygonRef = useRef(null);
  const markersGroupRef = useRef(null);
  const canopyPointsGroupRef = useRef(null);

  // Active Stage State
  const [activeStage, setActiveStage] = useState('baseline');

  // Basemap & Layer Controls
  const [basemapType, setBasemapType] = useState('satellite'); // 'satellite' | 'dark'
  const [activeLayer, setActiveLayer] = useState('satellite-truecolor');
  const [layerOpacity, setLayerOpacity] = useState(0.85);
  const [isLoadingSatellite, setIsLoadingSatellite] = useState(false);

  // Micro-level Tree Filter & Selected Tree
  const [filterHealth, setFilterHealth] = useState('ALL'); // 'ALL' | 'LIVING' | 'DEAD' | 'STRESSED' | 'BLANK'
  const [selectedMicroTree, setSelectedMicroTree] = useState(null);

  // Modals & AI Drawer
  const [isAskRitamOpen, setIsAskRitamOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Current Coordinates Readout
  const [mouseCoords, setMouseCoords] = useState({ lat: 20.9500, lng: 85.2167 });
  const [currentZoom, setCurrentZoom] = useState(14);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = selectedProject?.compartment?.center || selectedProject?.center || [20.9500, 85.2167];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      minZoom: 3,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;
    window.__RITAM_MAP__ = map;

    // High-Resolution World Imagery Satellite Base Layer (Like Spectator Earth reference)
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 1.0
    }).addTo(map);

    baseTileLayerRef.current = satLayer;
    markersGroupRef.current = L.layerGroup().addTo(map);
    canopyPointsGroupRef.current = L.layerGroup().addTo(map);

    map.on('mousemove', (e) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    if (basemapType === 'satellite') {
      baseTileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 1.0
      }).addTo(map);
    } else {
      baseTileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        opacity: 0.95
      }).addTo(map);
    }
  }, [basemapType]);

  // 3. Render Project Boundary Polygon
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (selectedProject?.boundary && selectedProject.boundary.length > 2) {
      const polygon = L.polygon(selectedProject.boundary, {
        color: '#06b6d4',
        weight: 2.5,
        opacity: 0.95,
        fillColor: '#10b981',
        fillOpacity: 0.12,
        dashArray: '5, 8'
      }).addTo(map);

      polygonLayerRef.current = polygon;
      const compCenter = selectedProject?.compartment?.center || selectedProject?.center;
      if (compCenter) {
        map.setView(compCenter, 14);
      } else {
        map.fitBounds(polygon.getBounds(), { padding: [60, 60], maxZoom: 16 });
      }
    }
  }, [selectedProject?.id]);

  // 4. Render Stage-Specific Micro-Canopy AI Detections & Micro-Tree Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const canopyGroup = canopyPointsGroupRef.current;
    if (!map || !markersGroup || !canopyGroup) return;

    markersGroup.clearLayers();
    canopyGroup.clearLayers();

    if (activeStage === 'plantation') {
      const center = selectedProject?.compartment?.center || selectedProject?.center || [20.9512, 85.2185];
      
      // Plantation Compartment Polygon Boundary (7.3 ha)
      const compartmentBounds = [
        [center[0] + 0.005, center[1] - 0.004],
        [center[0] + 0.007, center[1] + 0.003],
        [center[0] - 0.004, center[1] + 0.005],
        [center[0] - 0.006, center[1] - 0.002],
        [center[0] + 0.005, center[1] - 0.004]
      ];

      const compPoly = L.polygon(compartmentBounds, {
        color: '#ef4444',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.12
      }).addTo(canopyGroup);

      plantationPolygonRef.current = compPoly;

      // Render Micro-Tree Points with exact coordinates
      const rows = 14;
      const cols = 18;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lat = center[0] - 0.004 + r * 0.0006 + (Math.sin(r + c) * 0.00008);
          const lng = center[1] - 0.003 + c * 0.0004 + (Math.cos(r + c) * 0.00008);
          const rand = (r * 13 + c * 19) % 100;

          let type = 'LIVING';
          let color = '#10b981';
          let statusText = 'Living Tree (Healthy)';
          if (rand < 14) {
            type = 'DEAD';
            color = '#ef4444';
            statusText = 'Dead Tree (Mortality)';
          } else if (rand < 24) {
            type = 'STRESSED';
            color = '#f59e0b';
            statusText = 'Stressed Tree';
          } else if (rand < 36) {
            type = 'BLANK';
            color = '#94a3b8';
            statusText = 'Blank Planting Space';
          }

          const isVisible = filterHealth === 'ALL' || filterHealth === type;
          const opacity = isVisible ? 0.9 : 0.12;
          const radius = type === 'BLANK' ? 2.5 : 4;

          const treeTag = `RTM-TREE-${String(r * 20 + c + 400).padStart(5, '0')}`;

          const treeMarker = L.circleMarker([lat, lng], {
            radius,
            fillColor: color,
            color: color === '#ef4444' ? '#ffffff' : color,
            weight: 0.8,
            opacity: isVisible ? 1 : 0.15,
            fillOpacity: opacity
          }).addTo(canopyGroup);

          const treeObj = {
            tag: treeTag,
            species: type === 'BLANK' ? 'Vacant Pit' : (r % 2 === 0 ? 'Sal (Shorea robusta)' : 'Teak (Tectona grandis)'),
            health: type,
            coords: [lat, lng],
            heightCm: type === 'DEAD' || type === 'BLANK' ? 0 : 130 + (r * 4 + c * 3) % 40,
            crownDiamM: type === 'DEAD' || type === 'BLANK' ? 0 : (1.4 + ((r + c) % 10) * 0.1).toFixed(2),
            ndvi: type === 'LIVING' ? 0.76 : (type === 'STRESSED' ? 0.42 : 0.14),
            photoSha256: `e3b0c44298fc1c14${r}${c}996fb92427ae41e4649b934ca495991b7852b855`,
            inspector: 'Drone Ortho Sensor + Field Agent',
            issue: type === 'DEAD' ? 'Termite root attack / moisture depletion' : (type === 'STRESSED' ? 'Low canopy density' : 'Healthy growth')
          };

          treeMarker.on('click', () => {
            setSelectedMicroTree(treeObj);
            map.flyTo([lat, lng], 18, { duration: 0.8 });
          });

          treeMarker.bindPopup(`
            <div style="font-size:11px; color:#ffffff;">
              <strong style="color:${color}">${statusText}</strong><br/>
              <span style="font-family:monospace; color:#38bdf8;">${treeTag}</span><br/>
              <span>Coords: ${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E</span><br/>
              <span style="font-size:10px; color:#94a3b8;">Click to inspect SHA-256 proof</span>
            </div>
          `);
        }
      }
    } else if (activeStage === 'changes') {
      const anomalies = selectedProject?.changeEvents || [
        { coords: selectedProject?.center || [20.9550, 85.2200], sector: 'Anomaly Zone', magnitudePct: -34.8, severity: 'CRITICAL' }
      ];

      anomalies.forEach((a) => {
        const isCritical = a.severity === 'CRITICAL';
        const color = isCritical ? '#ef4444' : '#f59e0b';
        const marker = L.circleMarker(a.coords, {
          radius: 10,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.88
        }).addTo(markersGroup);

        marker.bindPopup(`
          <div style="font-size:11px; color:#ffffff;">
            <strong style="color:${color}">${a.sector}</strong><br/>
            <span style="font-weight:700; color:${color}">Canopy Loss: ${a.magnitudePct}%</span><br/>
            <span>Area Affected: ${a.lossAreaHa} ha (${a.date})</span><br/>
            <span style="color:#38bdf8;">Status: ${a.status}</span>
          </div>
        `);
      });
    } else if (activeStage === 'evidence') {
      const trees = selectedProject?.fieldEvidence || [
        { coords: selectedProject?.center || [20.9512, 85.2185], tag: 'RTM-SAMPLE-01', species: 'Indigenous Species', health: 'HEALTHY', photoSha256: 'e3b0c442...' }
      ];

      trees.forEach((t) => {
        const isHealthy = t.health === 'HEALTHY';
        const color = isHealthy ? '#10b981' : '#f59e0b';

        const marker = L.circleMarker(t.coords, {
          radius: 8,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.92
        }).addTo(markersGroup);

        marker.bindPopup(`
          <div style="font-size:11px; color:#ffffff;">
            <strong style="color:${color}">${t.tag}</strong><br/>
            <span>${t.species} (${t.heightCm || 140} cm)</span><br/>
            <span style="color:#38bdf8;">Inspector: ${t.inspector || 'Forest Range Officer'}</span><br/>
            <span style="font-size:9.5px; font-family:monospace; color:#34d399;">SHA-256: ${t.photoSha256?.slice(0, 16)}...</span>
          </div>
        `);
      });
    }
  }, [activeStage, selectedProject?.id, filterHealth]);

  const handlePanToCoords = useCallback((coords) => {
    if (!mapInstanceRef.current || !coords) return;
    mapInstanceRef.current.flyTo(coords, 18, { duration: 1.2 });
  }, []);

  const handleNextStage = () => {
    const stageIds = STAGES.map((s) => s.id);
    const currentIndex = stageIds.indexOf(activeStage);
    if (currentIndex < stageIds.length - 1) {
      setActiveStage(stageIds[currentIndex + 1]);
    }
  };

  // Automated Scene Application for 5-Min Video Recording Flow
  const handleApplyScene = (scene) => {
    if (!scene) return;
    setActiveStage(scene.targetStage);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (scene.targetStage === 'plantation') {
      const compCenter = selectedProject?.compartment?.center || [20.9512, 85.2185];
      map.flyTo(compCenter, scene.zoomLevel || 18, { duration: 1.4 });
    } else if (scene.targetStage === 'changes' && selectedProject?.changeEvents?.[0]) {
      map.flyTo(selectedProject.changeEvents[0].coords, scene.zoomLevel || 16, { duration: 1.4 });
    } else {
      const center = selectedProject?.center || [20.9500, 85.2167];
      map.flyTo(center, scene.zoomLevel || 14, { duration: 1.2 });
    }
  };

  const handleExportComplianceCertificate = () => {
    alert(`RITAM Cryptographic Audit Certificate generated for project: "${selectedProject?.name || 'Boundary AOI'}". Integrity Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (Status: 100% Compliant)`);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-space)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 1. Top Cockpit Telemetry Header */}
      <CockpitHeader 
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenAskRitam={() => setIsAskRitamOpen(!isAskRitamOpen)}
        isAskRitamOpen={isAskRitamOpen}
        onExportComplianceCertificate={handleExportComplianceCertificate}
        onBackToHub={onBackToHub}
      />

      {/* 2. Main Spatial Canvas Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Centered Floating 5-Stage Lifecycle Dock */}
        <StageNavigator 
          activeStage={activeStage}
          onSelectStage={setActiveStage}
        />

        {/* Full-Bleed Interactive Leaflet GIS Map Container */}
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
        />

        {/* Satellite Watermark & Acquisition Stamp */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: 'rgba(8, 14, 28, 0.85)',
          backdropFilter: 'var(--spatial-blur)',
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px'
        }}>
          <Satellite size={14} style={{ color: 'var(--color-cyan-glow)' }} />
          <span style={{ fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>RITAM • EARTH OBSERVATION</span>
          <span style={{ color: 'var(--text-muted)' }}>| PASS: 2026.09.04</span>
        </div>

        {/* Floating Stage Contextual HUD View */}
        {activeStage === 'baseline' && (
          <Stage1Baseline 
            project={selectedProject}
            onNextStage={handleNextStage}
            activeLayer={activeLayer}
            onSelectLayer={setActiveLayer}
            layerOpacity={layerOpacity}
            onChangeOpacity={setLayerOpacity}
            isLoadingSatellite={isLoadingSatellite}
          />
        )}

        {activeStage === 'changes' && (
          <Stage2ChangeDetection 
            project={selectedProject}
            onNextStage={handleNextStage}
            onPanToCoords={handlePanToCoords}
            onEscalateToMitigation={() => setActiveStage('mitigation')}
          />
        )}

        {activeStage === 'mitigation' && (
          <Stage3Mitigation 
            project={selectedProject}
            onNextStage={handleNextStage}
          />
        )}

        {activeStage === 'plantation' && (
          <PlantationCanopyView 
            project={selectedProject}
            selectedMicroTree={selectedMicroTree}
            onSelectMicroTree={setSelectedMicroTree}
            onPanToCoords={handlePanToCoords}
            onNextStage={handleNextStage}
            filterHealth={filterHealth}
            onFilterHealthChange={setFilterHealth}
          />
        )}

        {activeStage === 'evidence' && (
          <Stage4FieldEvidence 
            project={selectedProject}
            onNextStage={handleNextStage}
            onPanToCoords={handlePanToCoords}
          />
        )}

        {activeStage === 'compliance' && (
          <Stage5Compliance 
            project={selectedProject}
            onExportComplianceCertificate={handleExportComplianceCertificate}
          />
        )}

        {/* Map Viewport Controls & Basemap Switcher */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 800,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Basemap Switcher Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(8, 14, 28, 0.92)',
            backdropFilter: 'var(--spatial-blur)',
            border: '1px solid var(--glass-border-highlight)',
            borderRadius: 'var(--radius-control)',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              onClick={() => setBasemapType('satellite')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: basemapType === 'satellite' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                border: basemapType === 'satellite' ? '1px solid var(--glass-border-cyan)' : 'none',
                color: basemapType === 'satellite' ? 'var(--color-cyan-glow)' : 'var(--text-muted)',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Satellite size={12} /> TrueColor Sat
            </button>
            <button
              onClick={() => setBasemapType('dark')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: basemapType === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                border: basemapType === 'dark' ? '1px solid var(--glass-border-highlight)' : 'none',
                color: basemapType === 'dark' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Globe2 size={12} /> Dark GIS
            </button>
          </div>

          {/* Coordinates Telemetry Readout Pill */}
          <div className="telemetry-pill" style={{ backgroundColor: 'rgba(8, 14, 28, 0.92)' }}>
            <Crosshair size={12} style={{ color: 'var(--color-cyan-glow)' }} />
            <span style={{ color: '#ffffff' }}>
              {mouseCoords.lat.toFixed(6)}°N, {mouseCoords.lng.toFixed(6)}°E
            </span>
            <span style={{ color: 'var(--text-muted)' }}>| Z: {currentZoom}</span>
          </div>

          {/* Zoom Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(8, 14, 28, 0.92)',
            backdropFilter: 'var(--spatial-blur)',
            border: '1px solid var(--glass-border-highlight)',
            borderRadius: 'var(--radius-control)',
            overflow: 'hidden',
            boxShadow: 'var(--spatial-shadow)'
          }}>
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              title="Zoom In"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--glass-border-subtle)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              title="Zoom Out"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Minus size={16} />
            </button>
          </div>
        </div>

        {/* Slide-over Ask RITAM AI Copilot Drawer */}
        <AskRitamDrawer 
          isOpen={isAskRitamOpen}
          onClose={() => setIsAskRitamOpen(false)}
          project={selectedProject}
          onNavigateStage={setActiveStage}
        />
      </div>

      {/* New Project Ingestion Modal */}
      {isNewProjectModalOpen && (
        <NewProjectModal 
          onClose={() => setIsNewProjectModalOpen(false)}
          onProjectCreated={(newProj) => {
            onAddProject(newProj);
            setIsNewProjectModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopCommandBar from './components/TopCommandBar';
import CommandCenter from './components/CommandCenter';
import ProjectsView from './components/ProjectsView';
import MonitoringView from './components/MonitoringView';
import EcozonesView from './components/EcozonesView';
import CompensationView from './components/CompensationView';
import AnalyticsView from './components/AnalyticsView';
import EvidenceView from './components/EvidenceView';
import AskRitamView from './components/AskRitamView';
import LoginView from './components/LoginView';
import ProjectDetailModal from './components/ProjectDetailModal';
import { apiClient } from './api/client';

function toMapProject(project) {
  const geometry = project.boundary;
  const coordinates = geometry?.type === 'MultiPolygon'
    ? geometry.coordinates?.[0]?.[0]
    : geometry?.type === 'Polygon'
      ? geometry.coordinates?.[0]
      : [];
  const boundary = coordinates.map(([longitude, latitude]) => [latitude, longitude]);
  const center = boundary.length
    ? boundary.reduce((sum, coordinate) => [sum[0] + coordinate[0] / boundary.length, sum[1] + coordinate[1] / boundary.length], [0, 0])
    : null;

  return {
    ...project,
    status: project.status || 'MONITORING ACTIVE',
    location: 'Backend project',
    type: 'Environmental project',
    area: project.area_hectares ? `${project.area_hectares} ha` : 'Area unavailable',
    areaNum: project.area_hectares || 0,
    boundary,
    center,
    zoom: 12,
    vegChangeNum: 0,
    vegetationChange: 'Unavailable',
    survivalRate: '0%',
    statusVariant: 'emerald',
    ecozoneName: 'Project boundary',
    ecozoneDeltaPct: 'N/A',
    ecozoneCurrentHa: project.area_hectares || 0,
    ecozoneHealthIndex: 'N/A',
  };
}

export default function App() {
  // Navigation State
  const [activeNav, setActiveNav] = useState('command-center');
  const [searchQuery, setSearchQuery] = useState('');

  // Master Projects List State (Allows Ingestion of New Projects)
  const [projectsList, setProjectsList] = useState([]);
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem('ritam_token'));
  const [loadingProjects, setLoadingProjects] = useState(() => !!localStorage.getItem('ritam_token'));
  const [projectLoadError, setProjectLoadError] = useState(null);
  
  // Selected Project & Focused Coords
  const [selectedProject, setSelectedProject] = useState(null);
  const [highlightedCoords, setHighlightedCoords] = useState(null);
  
  // Full Detail Modal
  const [detailProject, setDetailProject] = useState(null);

  // Sentinel-2 NDVI Overlay for Map
  const [sentinel2OverlayUrl, setSentinel2OverlayUrl] = useState(null);
  const [showSentinel2Overlay, setShowSentinel2Overlay] = useState(false);
  const [sentinel2OverlayOpacity, setSentinel2OverlayOpacity] = useState(0.7);

  // Sentinel-2 True Color Overlay for Map
  const [trueColorOverlayUrl, setTrueColorOverlayUrl] = useState(null);
  const [trueColorOverlayBounds, setTrueColorOverlayBounds] = useState(null);
  const [trueColorOverlayOpacity, setTrueColorOverlayOpacity] = useState(0.8);
  const [trueColorError, setTrueColorError] = useState(null);
  const trueColorRequestRef = useRef({ key: null, controller: null });
  // LRU cache of recent Sentinel-2 blobs keyed by viewport key (avoids
  // re-fetching the same viewport when the user pans/zooms back).
  const trueColorCacheRef = useRef(new Map());
  // Latest selected project, readable from the stable useCallback below.
  const selectedProjectRef = useRef(null);
  selectedProjectRef.current = selectedProject;

  const loadBackendProjects = async () => {
    setLoadingProjects(true);
    setProjectLoadError(null);
    try {
      const projects = (await apiClient.getProjects()).map(toMapProject);
      setProjectsList(projects);
      setSelectedProject((current) => current && projects.some((project) => project.id === current.id) ? current : projects[0] || null);
    } catch (err) {
      setProjectLoadError(err.message);
      setProjectsList([]);
      setSelectedProject(null);
    } finally {
      setLoadingProjects(false);
    }
  };

  React.useEffect(() => {
    if (authenticated) loadBackendProjects();
  }, [authenticated]);

  const requestTrueColor = useCallback(({ bounds, width, height }) => {
    const project = selectedProjectRef.current;
    const projectId = project?.id;
    if (!authenticated || !projectId || !project?.boundary || !bounds) return;

    const key = `${projectId}:${bounds.flat().map((value) => value.toFixed(4)).join(',')}:${width}x${height}`;

    // Deduplicate an identical in-flight request.
    if (trueColorRequestRef.current.key === key) return;

    const cache = trueColorCacheRef.current;
    const cachedBlob = cache.get(key);
    if (cachedBlob) {
      // Reuse a recent response without hitting the backend.
      cache.delete(key);
      cache.set(key, cachedBlob);
      setTrueColorOverlayUrl(URL.createObjectURL(cachedBlob));
      setTrueColorOverlayBounds(bounds);
      setTrueColorError(null);
      return;
    }

    // Cancel any older in-flight request for a stale viewport.
    trueColorRequestRef.current.controller?.abort();
    const controller = new AbortController();
    trueColorRequestRef.current = { key, controller };
    setTrueColorError(null);

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log('[SatelliteDebug] project ID', projectId);
    console.log('[SatelliteDebug] request started', { bounds, width, height });

    apiClient.fetchTrueColorOverlay(projectId, startDate, endDate, 30, width, height, { bounds, signal: controller.signal })
      .then(({ blobUrl, blob }) => {
        // A newer request must never be overwritten by an older response.
        if (trueColorRequestRef.current.key !== key) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        // Keep a small LRU of the most recent blobs.
        if (cache.has(key)) cache.delete(key);
        cache.set(key, blob);
        while (cache.size > 6) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }
        setTrueColorOverlayUrl(blobUrl);
        setTrueColorOverlayBounds(bounds);
      })
      .catch((err) => {
        if (err.name === 'AbortError' || trueColorRequestRef.current.key !== key) return;
        console.error('[SatelliteDebug] request failed', err.message);
        setTrueColorError(`Sentinel-2 imagery unavailable: ${err.message}`);
      });
  }, [authenticated]);

  useEffect(() => {
    setTrueColorOverlayUrl(null);
    setTrueColorOverlayBounds(null);
    trueColorRequestRef.current.controller?.abort();
    trueColorRequestRef.current = { key: null, controller: null };
    trueColorCacheRef.current.clear();
  }, [selectedProject?.id]);

  useEffect(() => {
    return () => {
      trueColorRequestRef.current.controller?.abort();
      if (trueColorOverlayUrl) URL.revokeObjectURL(trueColorOverlayUrl);
    };
  }, [trueColorOverlayUrl]);

  // Add Project Handler
  const handleAddProject = (newProj) => {
    setProjectsList((prev) => [newProj, ...prev]);
    setSelectedProject(newProj);
    setActiveNav('projects');
  };

  if (!authenticated) {
    return <LoginView onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (loadingProjects) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>Loading projects...</main>;
  }

  if (projectLoadError) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-deep)', color: 'var(--color-rose)' }}>{projectLoadError}</main>;
  }

  const handleSelectProjectAndSwitch = (proj) => {
    setSelectedProject(proj);
    setHighlightedCoords(null);
    setActiveNav('command-center');
  };

  const handlePanToCoordsAndSwitch = (coords) => {
    setHighlightedCoords(coords);
    setActiveNav('command-center');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      backgroundColor: 'var(--bg-deep)',
      overflow: 'hidden'
    }}>
      {/* 1. Left Fixed Narrow Sidebar (RITAM Navigation) */}
      <Sidebar 
        activeNav={activeNav} 
        onSelectNav={setActiveNav} 
      />

      {/* 2. Main Spatial Intelligence Workspace */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        position: 'relative'
      }}>
        {/* Top Command Bar */}
        <TopCommandBar 
          activeNav={activeNav}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => alert('RITAM Spatial PostGIS 16 & Sentinel-2 Constellation pipeline status: ONLINE.')}
        />

        {/* Dynamic Screen View Router */}
        <main style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeNav === 'command-center' && (
            <CommandCenter 
              projects={projectsList}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              onOpenProject={setDetailProject}
              highlightedCoords={highlightedCoords}
              onPanToCoords={setHighlightedCoords}
              sentinel2OverlayUrl={sentinel2OverlayUrl}
              sentinel2OverlayBounds={null}
              showSentinel2Overlay={showSentinel2Overlay}
              onToggleSentinel2Overlay={setShowSentinel2Overlay}
              sentinel2OverlayOpacity={sentinel2OverlayOpacity}
              onSentinel2OverlayOpacityChange={setSentinel2OverlayOpacity}
              trueColorOverlayUrl={trueColorOverlayUrl}
              trueColorOverlayBounds={trueColorOverlayBounds}
              trueColorOverlayOpacity={trueColorOverlayOpacity}
              onTrueColorOverlayOpacityChange={setTrueColorOverlayOpacity}
              trueColorError={trueColorError}
              onRequestTrueColor={requestTrueColor}
            />
          )}

          {activeNav === 'projects' && (
            <ProjectsView 
              projects={projectsList}
              onSelectProject={handleSelectProjectAndSwitch}
              onOpenProject={setDetailProject}
              onAddProject={handleAddProject}
            />
          )}

          {activeNav === 'monitoring' && (
        <MonitoringView 
          selectedProject={selectedProject}
          onSelectChange={(change) => handleSelectProjectAndSwitch(projectsList.find(p => p.id === change.projectId))}
          onPanToLocation={handlePanToCoordsAndSwitch}
          onNdviOverlayLoaded={(url) => {
            setSentinel2OverlayUrl(url);
            setShowSentinel2Overlay(true);
          }}
        />
          )}

          {activeNav === 'environment' && (
            <EcozonesView 
              onSelectProject={handleSelectProjectAndSwitch}
            />
          )}

          {activeNav === 'compensation' && (
            <CompensationView />
          )}

          {activeNav === 'analytics' && (
            <AnalyticsView />
          )}

          {activeNav === 'evidence' && (
            <EvidenceView />
          )}

          {activeNav === 'ask-ritam' && (
            <AskRitamView 
              onSelectProject={handleSelectProjectAndSwitch}
            />
          )}
        </main>
      </div>

      {/* Full Detail Modal */}
      {detailProject && (
        <ProjectDetailModal 
          project={detailProject}
          onClose={() => setDetailProject(null)}
        />
      )}
    </div>
  );
}

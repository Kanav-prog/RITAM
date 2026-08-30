import React, { useState } from 'react';
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
import ProjectDetailModal from './components/ProjectDetailModal';
import { PROJECTS as INITIAL_PROJECTS } from './data/mockData';

export default function App() {
  // Navigation State
  const [activeNav, setActiveNav] = useState('command-center');
  const [searchQuery, setSearchQuery] = useState('');

  // Master Projects List State (Allows Ingestion of New Projects)
  const [projectsList, setProjectsList] = useState(INITIAL_PROJECTS);
  
  // Selected Project & Focused Coords
  const [selectedProject, setSelectedProject] = useState(INITIAL_PROJECTS[0]);
  const [highlightedCoords, setHighlightedCoords] = useState(null);
  
  // Full Detail Modal
  const [detailProject, setDetailProject] = useState(null);

  // Add Project Handler
  const handleAddProject = (newProj) => {
    setProjectsList((prev) => [newProj, ...prev]);
    setSelectedProject(newProj);
    setActiveNav('projects');
  };

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
              onSelectChange={(change) => handleSelectProjectAndSwitch(projectsList.find(p => p.id === change.projectId))}
              onPanToLocation={handlePanToCoordsAndSwitch}
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

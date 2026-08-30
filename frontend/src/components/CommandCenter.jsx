import React, { useState } from 'react';
import SpatialMap from './SpatialMap';
import OverviewStats from './OverviewStats';
import ProjectList from './ProjectList';
import EnvironmentalChanges from './EnvironmentalChanges';
import EvidenceDetailModal from './EvidenceDetailModal';
import ProjectDetailModal from './ProjectDetailModal';

export default function CommandCenter({ 
  projects,
  selectedProject, 
  onSelectProject, 
  onOpenProject,
  highlightedCoords,
  onPanToCoords
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDetailProject, setOpenDetailProject] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onPanToCoords(event.coords);
    const match = projects.find((p) => p.id === event.projectId);
    if (match) {
      onSelectProject(match);
    }
  };

  const handleOpenDetail = (proj) => {
    setOpenDetailProject(proj || selectedProject);
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* 1. Main Hero Spatial Map (~65% Viewport) */}
      <div style={{
        flex: '0 0 65%',
        position: 'relative',
        minHeight: '340px'
      }}>
        <SpatialMap 
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
          onOpenProject={handleOpenDetail}
          highlightedCoords={highlightedCoords}
        />
      </div>

      {/* 2. Bottom Environmental Intelligence Panel (~35% Viewport) */}
      <div style={{
        flex: '0 0 35%',
        minHeight: 0,
        backgroundColor: 'var(--bg-deep)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflow: 'hidden'
      }}>
        {/* Environmental Overview Metrics Row */}
        <div style={{ height: '56px', minHeight: '56px' }}>
          <OverviewStats />
        </div>

        {/* Split Columns: Projects List (50%) & Chronological Changes (50%) */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '10px',
          minHeight: 0
        }}>
          {/* Projects Needing Review */}
          <ProjectList 
            selectedProject={selectedProject}
            onSelectProject={onSelectProject}
            onOpenProject={handleOpenDetail}
          />

          {/* Chronological Environmental Changes */}
          <EnvironmentalChanges 
            onSelectEvent={handleSelectEvent}
            selectedEventId={selectedEvent?.id}
          />
        </div>
      </div>

      {/* Modals & Overlays */}
      {selectedEvent && (
        <EvidenceDetailModal 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onPanToLocation={(coords) => onPanToCoords(coords)}
        />
      )}

      {openDetailProject && (
        <ProjectDetailModal 
          project={openDetailProject}
          onClose={() => setOpenDetailProject(null)}
        />
      )}
    </div>
  );
}

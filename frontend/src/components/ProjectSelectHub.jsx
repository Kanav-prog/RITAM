import React, { useState } from 'react';
import { 
  Trees, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  Satellite, 
  ArrowRight, 
  Building2, 
  Layers, 
  LogOut, 
  Award 
} from 'lucide-react';
import NewProjectModal from './NewProjectModal';

export default function ProjectSelectHub({
  projects = [],
  onSelectProject,
  onAddProject,
  onLogout
}) {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.authority && p.authority.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.state && p.state.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalArea = projects.reduce((sum, p) => sum + (p.area_hectares || parseFloat(p.area) || 0), 0);
  const totalTrees = projects.reduce((sum, p) => sum + (p.plantedTrees || 35000), 0);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#090e17',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      userSelect: 'none'
    }}>
      {/* Top Hub Navigation Bar */}
      <header style={{
        height: '64px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Trees size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1px', color: '#ffffff' }}>
              RITAM
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Environmental Intelligence & Compliance Platform
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Plus size={15} />
            <span>Register New Project</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              padding: '7px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 600
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Overview Banner */}
        <div style={{ padding: '24px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="status-beacon emerald" />
                <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>
                  CENTRAL AUTHORITY COMMAND DESK
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                Monitored Projects & Areas of Interest (AOI)
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                Select a project to enter its dashboard and monitor baseline, change detection, and plantation survival.
              </p>
            </div>

            <div className="telemetry-pill">
              <Satellite size={13} style={{ color: '#0ea5e9' }} />
              <span>SENTINEL-2 ONLINE</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #1e293b'
          }}>
            <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>ACTIVE PROJECTS</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
                {projects.length} Projects
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>MONITORED AREA</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                {totalArea.toFixed(1)} ha
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>PLANTED TREES</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                {totalTrees.toLocaleString()} Trees
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>AVERAGE COMPLIANCE</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                94.6%
              </div>
            </div>
          </div>
        </div>

        {/* Search & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={17} style={{ color: '#0ea5e9' }} />
            <span>Active Environmental Projects ({filteredProjects.length})</span>
          </div>

          <input
            type="text"
            placeholder="Search by project name, state, or authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '320px',
              padding: '8px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>

        {/* Projects Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {filteredProjects.map((proj) => {
            return (
              <div
                key={proj.id}
                style={{
                  padding: '18px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onClick={() => onSelectProject(proj)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                      fontWeight: 600
                    }}>
                      {proj.category || 'Environmental AOI'}
                    </span>

                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      fontWeight: 700
                    }}>
                      {proj.complianceScore || 92.4}% COMPLIANT
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: '1.35', marginBottom: '6px' }}>
                    {proj.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Building2 size={12} style={{ color: '#0ea5e9' }} />
                      <span style={{ color: '#cbd5e1' }}>{proj.authority || 'State Forest Department'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} style={{ color: '#10b981' }} />
                      <span>{proj.district ? `${proj.district}, ${proj.state}` : 'India'}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
                    {proj.description || 'Continuous satellite change detection, compensatory tree survival monitoring, and field verification.'}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    padding: '8px',
                    backgroundColor: '#1e293b',
                    borderRadius: '6px',
                    border: '1px solid #334155'
                  }}>
                    <div>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>AREA</span>
                      <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>
                        {proj.area_hectares ? `${proj.area_hectares} ha` : proj.area}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>SURVIVAL</span>
                      <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#10b981' }}>
                        {proj.survivalRateOverall || 88.4}%
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>PLANTED</span>
                      <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#ffffff' }}>
                        {(proj.plantedTrees || 38420).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(proj);
                  }}
                >
                  <span>Open Project Dashboard</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}

          {/* Register Card */}
          <div
            onClick={() => setIsNewProjectModalOpen(true)}
            style={{
              padding: '24px',
              border: '2px dashed #334155',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '10px',
              cursor: 'pointer',
              minHeight: '260px',
              backgroundColor: '#0f172a'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0ea5e9'
            }}>
              <Plus size={20} />
            </div>

            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Register New Project
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', maxWidth: '220px' }}>
                Add project boundary, baseline data, and start satellite tracking.
              </p>
            </div>

            <button
              className="btn-secondary"
              style={{ marginTop: '4px' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsNewProjectModalOpen(true);
              }}
            >
              <Plus size={13} /> Add Project
            </button>
          </div>
        </div>
      </main>

      {/* New Project Modal */}
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

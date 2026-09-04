import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  MapPin, 
  Trees, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';
import NewProjectModal from './NewProjectModal';

export default function ProjectsView({ projects, onSelectProject, onOpenProject, onAddProject }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = projects.filter((p) => {
    const matchStatus = filterStatus === 'ALL' || p.status.includes(filterStatus);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.location.toLowerCase().includes(search.toLowerCase()) ||
                        p.agency?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div style={{
      padding: '20px 28px',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Top Banner & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="status-beacon emerald" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Project Corridors & Ecological Baselines
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Comprehensive directory of monitored linear infrastructure, energy zones, and ecological mitigation sites.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-emerald)',
            color: '#06090e',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34d399'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-emerald)'}
        >
          <Plus size={15} />
          <span>Register New Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        gap: '12px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '340px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, agency, or state..."
            style={{
              width: '100%',
              height: '32px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '0 10px 0 32px',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['ALL', 'ACTIVE', 'BASELINE', 'ACTION'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: filterStatus === st ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: filterStatus === st ? 'var(--color-cyan)' : 'var(--text-secondary)',
                border: filterStatus === st ? '1px solid var(--border-accent)' : '1px solid transparent'
              }}
            >
              {st === 'ALL' ? 'All Projects' : st === 'ACTIVE' ? 'Active Monitoring' : st === 'BASELINE' ? 'Baseline Approved' : 'Action Required'}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '14px',
        paddingBottom: '20px'
      }}>
        {filtered.map((proj) => {
          const isLoss = proj.vegChangeNum < 0;
          const isEcoExpanding = proj.ecozoneStatus?.includes('EXPANDING');

          return (
            <div
              key={proj.id}
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.18s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--color-cyan)',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    {proj.id.toUpperCase()}
                  </span>

                  <div style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: proj.statusVariant === 'amber' ? 'var(--color-amber-bg)' : 'var(--color-emerald-bg)',
                    color: proj.statusVariant === 'amber' ? 'var(--color-amber)' : 'var(--color-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {proj.statusVariant === 'amber' ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                    <span>{proj.status}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {proj.name}
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {proj.location} · <strong style={{ color: 'var(--text-secondary)' }}>{proj.agency || proj.type}</strong>
                </div>

                {/* 3 Metric Badges */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>AREA</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {proj.area}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>VEG DELTA</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)' }}>
                      {proj.vegetationChange}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SURVIVAL</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)' }}>
                      {proj.survivalRate}
                    </div>
                  </div>
                </div>

                {/* Ecozone Expansion Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: isEcoExpanding ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                  border: `1px solid ${isEcoExpanding ? 'var(--border-emerald)' : 'var(--border-rose)'}`,
                  fontSize: '10.5px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isEcoExpanding ? 'var(--color-emerald)' : 'var(--color-rose)', fontWeight: 600 }}>
                    <Globe size={12} />
                    <span>Ecozone Growth</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isEcoExpanding ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                    {proj.ecozoneDeltaPct} ({proj.ecozoneCurrentHa} ha)
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <button
                  onClick={() => onSelectProject(proj)}
                  style={{
                    flex: 1,
                    height: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
                    e.currentTarget.style.color = 'var(--color-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <MapPin size={12} />
                  <span>Inspect on Map</span>
                </button>

                <button
                  onClick={() => onOpenProject(proj)}
                  style={{
                    flex: 1,
                    height: '30px',
                    backgroundColor: 'var(--color-emerald)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#06090e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34d399'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-emerald)'}
                >
                  <span>Full Profile</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <NewProjectModal 
          onClose={() => setShowNewModal(false)}
          onAddProject={onAddProject}
        />
      )}
    </div>
  );
}

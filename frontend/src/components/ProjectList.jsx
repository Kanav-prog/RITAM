import React from 'react';
import { Layers, ArrowUpRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { PROJECTS } from '../data/mockData';

export default function ProjectList({ selectedProject, onSelectProject, onOpenProject }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={14} color="var(--color-cyan)" />
          <h2 style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.2px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)'
          }}>
            Projects Needing Review
          </h2>
        </div>
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}>
          {PROJECTS.length} ACTIVE
        </span>
      </div>

      {/* Projects Items List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '6px'
      }}>
        {PROJECTS.map((proj) => {
          const isSelected = selectedProject && selectedProject.id === proj.id;
          const isLoss = proj.vegChangeNum < 0;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '4px',
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                transition: 'all 0.14s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Project Info */}
              <div>
                <div style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: isSelected ? 'var(--color-cyan)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{proj.name}</span>
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)'
                  }}>
                    {proj.vegetationChange}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {proj.state} · <span style={{ fontFamily: 'var(--font-mono)' }}>{proj.area}</span>
                </div>
              </div>

              {/* Status Pill & Open CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: proj.statusVariant === 'amber' ? 'var(--color-amber-bg)' : 'var(--color-emerald-bg)',
                  color: proj.statusVariant === 'amber' ? 'var(--color-amber)' : 'var(--color-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {proj.statusVariant === 'amber' ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                  <span>{proj.status.replace('MONITORING ', '')}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProject(proj);
                  }}
                  title="Open Project View"
                  style={{
                    padding: '3px',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { X, ArrowRight, Shield, Trees, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Globe } from 'lucide-react';

export default function ProjectInfoPanel({ project, onClose, onOpenProject }) {
  if (!project) return null;

  const isLoss = project.vegChangeNum < 0;
  const isEcoExpanding = project.ecozoneStatus?.includes('EXPANDING');

  return (
    <div 
      className="spatial-glass-elevated"
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '340px',
        zIndex: 600,
        padding: '18px',
        animation: 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top Window Grab Sheen Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{
              fontSize: '9.5px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-cyan-glow)',
              backgroundColor: 'rgba(56, 189, 248, 0.16)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-capsule)',
              letterSpacing: '0.5px'
            }}>
              {project.id.toUpperCase()}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {project.location}
            </span>
          </div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            fontFamily: 'var(--font-display)'
          }}>
            {project.name}
          </h2>
        </div>

        <button 
          onClick={onClose}
          className="spatial-capsule"
          style={{
            width: '28px',
            height: '28px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'var(--glass-bg-capsule)';
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Spatial Metadata Pill Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--glass-border-subtle)',
        marginBottom: '12px',
        fontSize: '11px'
      }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>INFRASTRUCTURE</div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{project.type}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '9px' }}>MONITORED AREA</div>
          <div style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            {project.area}
          </div>
        </div>
      </div>

      {/* ECOZONE EXPANSION VERIFICATION CARD */}
      <div style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: isEcoExpanding ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
        border: `1px solid ${isEcoExpanding ? 'var(--glass-border-emerald)' : 'var(--glass-border-rose)'}`,
        marginBottom: '12px',
        boxShadow: isEcoExpanding ? '0 4px 20px rgba(16, 185, 129, 0.15)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 700, color: isEcoExpanding ? 'var(--color-emerald-glow)' : 'var(--color-rose)' }}>
            <Globe size={13} />
            <span>ECOZONE INTEGRITY</span>
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: isEcoExpanding ? 'var(--color-emerald-glow)' : 'var(--color-rose)',
            backgroundColor: isEcoExpanding ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-capsule)'
          }}>
            {project.ecozoneDeltaPct}
          </span>
        </div>
        <div style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 600, marginBottom: '2px' }}>
          {project.ecozoneName}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Footprint: <strong style={{ color: '#fff' }}>{project.ecozoneCurrentHa} ha</strong></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>EHI: {project.ecozoneHealthIndex.split(' ')[0]}</span>
        </div>
      </div>

      {/* Status & Vegetation Delta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {/* Status Badge */}
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: project.statusVariant === 'amber' ? 'var(--color-amber-bg)' : 'var(--color-emerald-bg)',
          border: `1px solid ${project.statusVariant === 'amber' ? 'var(--glass-border-amber)' : 'var(--glass-border-emerald)'}`
        }}>
          <div style={{ 
            fontSize: '9px', 
            fontFamily: 'var(--font-mono)', 
            color: project.statusVariant === 'amber' ? 'var(--color-amber)' : 'var(--color-emerald-glow)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '2px'
          }}>
            {project.statusVariant === 'amber' ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
            STATUS
          </div>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {project.status}
          </div>
        </div>

        {/* Vegetation Change */}
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: isLoss ? 'var(--color-rose-bg)' : 'var(--color-emerald-bg)',
          border: `1px solid ${isLoss ? 'var(--glass-border-rose)' : 'var(--glass-border-emerald)'}`
        }}>
          <div style={{ 
            fontSize: '9px', 
            fontFamily: 'var(--font-mono)', 
            color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald-glow)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '2px'
          }}>
            {isLoss ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
            VEG DELTA
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontFamily: 'var(--font-mono)', 
            fontWeight: 800, 
            color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald-glow)'
          }}>
            {project.vegetationChange}
          </div>
        </div>
      </div>

      {/* Mini Progress: Survival & Verification */}
      <div style={{
        marginBottom: '14px',
        padding: '8px 10px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--glass-border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Plantation Survival</span>
          <span style={{ color: 'var(--color-emerald-glow)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            {project.survivalRate}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-capsule)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: project.survivalRate,
            height: '100%',
            backgroundColor: 'var(--color-emerald-glow)',
            borderRadius: 'var(--radius-capsule)',
            boxShadow: '0 0 8px var(--color-emerald-glow)'
          }} />
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onOpenProject(project)}
        className="gaze-target"
        style={{
          width: '100%',
          height: '36px',
          backgroundColor: 'var(--color-emerald)',
          color: '#03070d',
          borderRadius: 'var(--radius-capsule)',
          fontSize: '12px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34d399'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-emerald)'}
      >
        <span>Open Project & Ecozone View</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

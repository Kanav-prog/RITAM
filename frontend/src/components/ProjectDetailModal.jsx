import React from 'react';
import { X, Trees, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Activity, Globe, Sprout, Wind } from 'lucide-react';

export default function ProjectDetailModal({ project, onClose }) {
  if (!project) return null;

  const isLoss = project.vegChangeNum < 0;
  const isEcoExpanding = project.ecozoneStatus?.includes('EXPANDING');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '24px'
    }}>
      <div 
        className="glass-panel-elevated"
        style={{
          width: '780px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-muted)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.35)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-cyan)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)'
              }}>
                {project.id.toUpperCase()}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {project.location} · {project.type}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {project.name}
            </h2>
          </div>

          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: 'var(--radius-xs)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top 4 KPI Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>MONITORED AREA</div>
              <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {project.area}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>VEG DELTA</div>
              <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)' }}>
                {project.vegetationChange}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>TREE SURVIVAL</div>
              <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)' }}>
                {project.survivalRate}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>COMPLIANCE</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-cyan)', marginTop: '2px' }}>
                {project.complianceScore}
              </div>
            </div>
          </div>

          {/* DEDICATED ECOZONE & POST-PLANTATION GROWTH VERIFICATION */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isEcoExpanding ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            border: `1px solid ${isEcoExpanding ? 'var(--border-emerald)' : 'var(--border-rose)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: isEcoExpanding ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                <Globe size={16} />
                <span>Ecozone Integrity & Post-Plantation Expansion Verification</span>
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: isEcoExpanding ? 'var(--color-emerald)' : 'var(--color-rose)',
                backgroundColor: isEcoExpanding ? 'var(--color-emerald-bg)' : 'var(--color-rose-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)'
              }}>
                {project.ecozoneStatus} ({project.ecozoneDeltaPct})
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Ecosystem: <strong style={{ color: '#fff' }}>{project.ecozoneName}</strong>
            </div>

            {/* 3-Column Ecozone Expansion Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px', marginBottom: '8px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>Baseline Ecozone Area</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {project.ecozoneBaselineHa} ha
                </div>
              </div>

              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>Post-Plantation Verified Area</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-emerald)' }}>
                  {project.ecozoneCurrentHa} ha <span style={{ fontSize: '10px', color: 'var(--color-cyan)' }}>({project.ecozoneDeltaHa})</span>
                </div>
              </div>

              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>Ecozone Health Index (EHI)</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                  {project.ecozoneHealthIndex}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} color="var(--color-emerald)" />
              <span>Connectivity: <strong style={{ color: 'var(--text-secondary)' }}>{project.biodiversityConnectivity}</strong></span>
            </div>
          </div>

          {/* Plantation & Afforestation Progress */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                <Trees size={15} color="var(--color-emerald)" />
                <span>Compensatory Afforestation Balance</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>
                Target: {project.targetTrees.toLocaleString()} trees
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Planted</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {project.plantedTrees.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Field Verified</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-emerald)' }}>
                  {project.verifiedTrees.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Surviving Healthy</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                  {project.survivingTrees.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (project.plantedTrees / project.targetTrees) * 100)}%`,
                height: '100%',
                backgroundColor: 'var(--color-emerald)',
                borderRadius: '3px'
              }} />
            </div>
          </div>

          {/* Environmental Timeline Sequence */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
              <Activity size={14} color="var(--color-cyan)" />
              <span>Project & Ecozone Observation Narrative</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-emerald)' }} />
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '70px' }}>Aug 2026</span>
                <span style={{ color: 'var(--text-primary)' }}>Post-plantation ecozone expansion confirmed (+6.4 ha natural canopy growth into adjacent buffer)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-rose)' }} />
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '70px' }}>Aug 2026</span>
                <span style={{ color: 'var(--text-primary)' }}>Tree clearance along Right-of-Way km 34 recorded (-2.1 ha)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)' }} />
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '70px' }}>Jan 2026</span>
                <span style={{ color: 'var(--text-primary)' }}>Immutable Ecozone Baseline Approved ({project.ecozoneBaselineHa} ha footprint locked)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.35)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-emerald)',
              color: '#06090e',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}

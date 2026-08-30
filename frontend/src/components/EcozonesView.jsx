import React, { useState } from 'react';
import { Globe, Trees, TrendingUp, TrendingDown, ShieldCheck, Compass, Activity, ArrowUpRight } from 'lucide-react';
import { PROJECTS, STATS } from '../data/mockData';

export default function EcozonesView({ onSelectProject }) {
  const [selectedEcozone, setSelectedEcozone] = useState(PROJECTS[0]);

  return (
    <div style={{
      padding: '20px 28px',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="status-beacon emerald" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Macro Ecological Zones & Buffer Integrity (EHI)
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Post-plantation macro-ecological verification: Ensuring reforestation actively expands contiguous wildlife and riparian buffer zones.
          </p>
        </div>

        {/* Global Ecozone Footprint Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid var(--border-emerald)'
        }}>
          <div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>NET ECOZONE EXPANSION</div>
            <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-emerald)' }}>
              {STATS.netEcozoneExpansionHa} ha ({STATS.ecozoneGrowthPct})
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Ecozone Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>TOTAL BUFFER AREA</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {STATS.totalEcozoneHa} ha
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-cyan)', marginTop: '2px' }}>
            8 Monitored Bio-Corridors
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>AVG ECOZONE HEALTH (EHI)</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)' }}>
            0.86 / 1.0
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-emerald)', marginTop: '2px' }}>
            +8.2% vs Baseline
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>REGENERATING CORRIDORS</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
            3 / 4 Corridors
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Active Canopy Infill
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>AT-RISK FRAGMENTATION</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-rose)' }}>
            1 Corridor
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-rose)', marginTop: '2px' }}>
            NH-46 Vindhya Cutoff
          </div>
        </div>
      </div>

      {/* Main Grid: Ecozone Profiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '14px'
      }}>
        {PROJECTS.map((proj) => {
          const isExpanding = proj.ecozoneStatus?.includes('EXPANDING');

          return (
            <div
              key={proj.id}
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isExpanding ? 'var(--border-emerald)' : 'var(--border-rose)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} color={isExpanding ? 'var(--color-emerald)' : 'var(--color-rose)'} />
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                      ECO-ZONE #0{proj.id.replace('proj-', '')}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isExpanding ? 'var(--color-emerald-bg)' : 'var(--color-rose-bg)',
                    color: isExpanding ? 'var(--color-emerald)' : 'var(--color-rose)'
                  }}>
                    {proj.ecozoneStatus}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {proj.ecozoneName}
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Linked Corridor: <strong style={{ color: 'var(--text-secondary)' }}>{proj.name}</strong>
                </div>

                {/* Footprint Comparison Box */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>BASELINE</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {proj.ecozoneBaselineHa} ha
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CURRENT</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isExpanding ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                      {proj.ecozoneCurrentHa} ha
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>NET EXPANSION</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isExpanding ? '#34d399' : 'var(--color-rose)' }}>
                      {proj.ecozoneDeltaPct}
                    </div>
                  </div>
                </div>

                {/* Connectivity & Health */}
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ecozone Health Index (EHI):</span>
                    <strong style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>{proj.ecozoneHealthIndex}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Biodiversity Link:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{proj.biodiversityConnectivity}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectProject(proj)}
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--border-emerald)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <span>Focus Ecozone on Map</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

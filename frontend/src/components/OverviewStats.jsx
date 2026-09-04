import React from 'react';
import { Layers, Compass, TrendingDown, Sprout, Globe } from 'lucide-react';
import { STATS } from '../data/mockData';

export default function OverviewStats() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      height: '100%'
    }}>
      {/* Metric 1: Total Projects */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ACTIVE PROJECTS
          </span>
          <Layers size={13} color="var(--color-cyan)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            0{STATS.totalProjects}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            {STATS.activeProjects} active monitoring
          </span>
        </div>
      </div>

      {/* Metric 2: Monitored Land Area */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            PROJECT CORRIDORS
          </span>
          <Compass size={13} color="var(--color-cyan)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
            {STATS.monitoredAreaHa}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ha</span>
        </div>
      </div>

      {/* Metric 3: Ecozone Verification & Net Expansion */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-emerald)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-emerald)', fontFamily: 'var(--font-mono)' }}>
            ECOZONE EXPANSION
          </span>
          <Globe size={13} color="var(--color-emerald)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-mono)' }}>
            {STATS.netEcozoneExpansionHa} ha
          </span>
          <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            ({STATS.ecozoneGrowthPct} post-planting)
          </span>
        </div>
      </div>

      {/* Metric 4: Survival & Restoration */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            PLANTATION SURVIVAL
          </span>
          <Sprout size={13} color="#34d399" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            {STATS.avgSurvivalRate}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            +{STATS.restorationHa} ha
          </span>
        </div>
      </div>
    </div>
  );
}

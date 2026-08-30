import React from 'react';
import { Search, SlidersHorizontal, Globe2, ShieldCheck } from 'lucide-react';
import { STATS } from '../data/mockData';

export default function TopCommandBar({ activeNav, searchQuery, onSearchChange, onOpenSettings }) {
  const getNavTitle = () => {
    switch (activeNav) {
      case 'projects': return 'Project Corridors & Baselines';
      case 'monitoring': return 'Satellite Monitoring & Spectral Triage';
      case 'environment': return 'Ecozone Integrity & Biodiversity Buffers';
      case 'compensation': return 'Compensatory Afforestation & Tree Registry';
      case 'analytics': return 'Environmental Analytics & Net Accretion';
      case 'evidence': return 'Cryptographic Evidence Vault & Audit Trail';
      case 'ask-ritam': return 'Ask RITAM — Spatial Environmental Copilot';
      default: return 'Environmental Intelligence';
    }
  };

  return (
    <header style={{
      height: '52px',
      minHeight: '52px',
      margin: '12px 12px 0 12px',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'var(--spatial-blur)',
      WebkitBackdropFilter: 'var(--spatial-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-window)',
      boxShadow: 'var(--spatial-shadow)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 500,
      userSelect: 'none'
    }}>
      {/* Left: Dynamic Screen Title & Monitored Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-beacon emerald" />
          <h1 style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            letterSpacing: '-0.2px', 
            color: '#ffffff',
            fontFamily: 'var(--font-display)'
          }}>
            {getNavTitle()}
          </h1>
        </div>

        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--glass-border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            <strong style={{ color: '#ffffff', fontWeight: 700 }}>{STATS.totalProjects}</strong> Projects
          </span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span style={{ color: 'var(--color-cyan-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {STATS.monitoredAreaHa} ha
          </span>
          <span style={{ color: 'var(--text-muted)' }}>monitored</span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span style={{ color: 'var(--color-emerald-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {STATS.netEcozoneExpansionHa} ha
          </span>
          <span style={{ color: 'var(--text-muted)' }}>ecozone growth</span>
        </div>
      </div>

      {/* Middle: Apple Frosted Search Capsule */}
      <div style={{
        position: 'relative',
        width: '320px',
        maxWidth: '35%'
      }}>
        <Search 
          size={14} 
          color="var(--text-muted)" 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
        />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter projects, coordinates or species..."
          style={{
            width: '100%',
            height: '32px',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--glass-border-subtle)',
            borderRadius: 'var(--radius-capsule)',
            padding: '0 12px 0 34px',
            color: '#ffffff',
            fontSize: '11.5px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--glass-border-accent)';
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--glass-border-subtle)';
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
          }}
        />
      </div>

      {/* Right: Last Updated & System Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          fontSize: '11px', 
          color: 'var(--text-muted)', 
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>Updated</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>· {STATS.lastUpdated}</span>
        </div>

        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--glass-border-subtle)' }} />

        {/* Global Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            title="Active Sentinel-2 L2A & PlanetScope 3m Constellation"
            className="spatial-capsule"
            style={{
              width: '32px',
              height: '32px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Globe2 size={14} />
          </button>

          <button 
            onClick={onOpenSettings}
            title="RITAM Spatial PostGIS Settings"
            className="spatial-capsule"
            style={{
              width: '32px',
              height: '32px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SlidersHorizontal size={14} />
          </button>

          <div 
            className="spatial-capsule"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 12px',
              height: '32px',
              borderColor: 'var(--glass-border-emerald)',
              color: 'var(--color-emerald-glow)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}
          >
            <ShieldCheck size={13} />
            <span>AUTHORITY</span>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Shield, Leaf, Sprout, PieChart } from 'lucide-react';
import { STATS, PROJECTS } from '../data/mockData';

export default function AnalyticsView() {
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
              Environmental Analytics & Net Accretion Models
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Longitudinal vegetation time-series, biomass accretion forecasting, and compliance rating matrices.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid var(--border-accent)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-cyan)',
          fontWeight: 700
        }}>
          <span>NET CANOPY ACCRETION: +148 ha</span>
        </div>
      </div>

      {/* Main Visuals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
        {/* Time-Series Net Canopy Balance (SVG Area Graph) */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                <TrendingUp size={15} color="var(--color-emerald)" />
                <span>2024–2026 Net Canopy Gain vs Loss (Hectares)</span>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MONTHLY AGGREGATE</span>
            </div>

            {/* Custom SVG Area Graph */}
            <div style={{ width: '100%', height: '190px', position: 'relative', marginTop: '10px' }}>
              <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="restorationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                {/* Restoration Area Path (Green) */}
                <path 
                  d="M 0 130 Q 80 110, 160 90 T 320 50 T 500 20 L 500 160 L 0 160 Z" 
                  fill="url(#restorationGrad)" 
                />
                <path 
                  d="M 0 130 Q 80 110, 160 90 T 320 50 T 500 20" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                />

                {/* Loss Area Path (Red) */}
                <path 
                  d="M 0 150 Q 100 130, 220 120 T 380 110 T 500 95 L 500 160 L 0 160 Z" 
                  fill="url(#lossGrad)" 
                />
                <path 
                  d="M 0 150 Q 100 130, 220 120 T 380 110 T 500 95" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                />

                {/* Points */}
                <circle cx="500" cy="20" r="4" fill="#34d399" />
                <circle cx="500" cy="95" r="4" fill="#ef4444" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Restoration (+512 ha)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Deforestation Loss (−364 ha)</span>
            </div>
            <span style={{ color: 'var(--color-cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              Net Balance: +148 ha
            </span>
          </div>
        </div>

        {/* Species Survival Rates (Bar Chart) */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                <Sprout size={15} color="var(--color-cyan)" />
                <span>Species Survival Distribution</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>POSTGIS VERIFIED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Azadirachta indica (Neem)', rate: 94, count: '38,400 trees', color: '#10b981' },
                { name: 'Tectona grandis (Teak)', rate: 92, count: '28,100 trees', color: '#34d399' },
                { name: 'Ficus religiosa (Peepal)', rate: 90, count: '22,400 trees', color: '#059669' },
                { name: 'Prosopis cineraria (Khejri)', rate: 88, count: '18,200 trees', color: '#38bdf8' },
                { name: 'Dalbergia sissoo (Shisham)', rate: 76, count: '16,100 trees', color: '#f59e0b' }
              ].map((sp) => (
                <div key={sp.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sp.name}</span>
                    <span style={{ color: sp.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{sp.rate}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${sp.rate}%`, height: '100%', backgroundColor: sp.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            Multi-species biodiversity index: <strong style={{ color: 'var(--text-secondary)' }}>0.89 Shannon-Wiener (Optimal)</strong>
          </div>
        </div>
      </div>

      {/* Compliance State Machine Matrix */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={15} color="var(--color-emerald)" />
          <span>Statutory Compliance State Machine Matrix (MoEFCC Framework)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {PROJECTS.map((proj) => (
            <div 
              key={proj.id}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                {proj.id.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {proj.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 700, marginBottom: '4px' }}>
                {proj.complianceScore}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Survival: <strong style={{ color: 'var(--color-emerald)' }}>{proj.survivalRate}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

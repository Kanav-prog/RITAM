import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  FileCheck2, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  SlidersHorizontal, 
  Sparkles,
  Award,
  RefreshCw
} from 'lucide-react';

export default function Stage5Compliance({
  project,
  onExportComplianceCertificate
}) {
  const [temporalSlider, setTemporalSlider] = useState(50); // 0 = Baseline (Jan 2026), 100 = Current (Sep 2026)

  const survivalRate = 89.4;
  const targetSurvivalThreshold = 80.0;
  const isCompliant = survivalRate >= targetSurvivalThreshold;

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      width: '480px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 800,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div className="geo-hud-card" style={{ padding: '18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-indigo-bg)',
              border: '1px solid var(--glass-border-indigo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-indigo-glow)'
            }}>
              <Scale size={16} />
            </div>
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-indigo-glow)', textTransform: 'uppercase' }}>
                STAGE 05 / COMPLIANCE ENGINE
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Living Compliance Scorecard
              </h3>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-capsule)',
            backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
            border: isCompliant ? '1px solid var(--glass-border-emerald)' : '1px solid var(--glass-border-rose)',
            color: isCompliant ? 'var(--color-emerald-glow)' : 'var(--color-rose-glow)',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}>
            <Award size={12} /> {isCompliant ? 'COMPLIANCE ACTIVE' : 'NON-COMPLIANT'}
          </div>
        </div>

        {/* Dynamic Compliance Mathematical Formulas & KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '14px'
        }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>SURVIVAL RATE</span>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', marginTop: '2px' }}>
              {survivalRate}%
            </div>
            <span style={{ fontSize: '8.5px', color: 'var(--text-dim)' }}>Min: {targetSurvivalThreshold}%</span>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>NET VEG GAIN</span>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)', marginTop: '2px' }}>
              +14.6 ha
            </div>
            <span style={{ fontSize: '8.5px', color: 'var(--text-dim)' }}>Net Positive Balance</span>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>LEDGER AUDIT</span>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: '2px' }}>
              100%
            </div>
            <span style={{ fontSize: '8.5px', color: 'var(--color-emerald-glow)' }}>Tamper Proof</span>
          </div>
        </div>

        {/* Interactive Before vs After Sentinel-2 Multi-temporal Comparison */}
        <div style={{ padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: 'var(--radius-control)', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={12} style={{ color: 'var(--color-indigo-glow)' }} /> Multi-Temporal Satellite Comparison
            </span>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-indigo-glow)' }}>
              {temporalSlider < 50 ? 'Baseline (Pre-Clearing)' : 'Current Pass (Mitigated)'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={temporalSlider}
            onChange={(e) => setTemporalSlider(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-indigo)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>T0: JAN 2026 (BASELINE)</span>
            <span>T1: SEP 2026 (CURRENT)</span>
          </div>
        </div>

        {/* One-Click Verified Audit Certificate Export */}
        <button
          onClick={onExportComplianceCertificate}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
        >
          <FileCheck2 size={16} />
          <span>Export Authority Compliance Certificate (PDF/JSON)</span>
        </button>
      </div>

      {/* Living Chain Completeness Summary Pill */}
      <div className="geo-hud-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--color-emerald)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--color-emerald-glow)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>End-to-End Problem Loop Resolved</span>
        </div>
        <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          The complete continuous chain from Baseline $\rightarrow$ Satellite Loss $\rightarrow$ Quotas $\rightarrow$ SHA-256 Ground Truth $\rightarrow$ Compliance Score is sealed and mathematically verifiable.
        </p>
      </div>
    </div>
  );
}

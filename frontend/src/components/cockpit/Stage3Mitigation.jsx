import React, { useState } from 'react';
import { 
  Trees, 
  Target, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  Percent,
  Plus
} from 'lucide-react';

const MOCK_SPECIES = [
  { name: 'Neem (Azadirachta indica)', target: 8000, planted: 7200, survivalPct: 91 },
  { name: 'Teak (Tectona grandis)', target: 6500, planted: 6100, survivalPct: 88 },
  { name: 'Sal (Shorea robusta)', target: 5000, planted: 4200, survivalPct: 85 },
  { name: 'Bamboo (Dendrocalamus strictus)', target: 4500, planted: 4500, survivalPct: 94 }
];

export default function Stage3Mitigation({
  project,
  onNextStage,
  onOpenFieldVerification
}) {
  const totalTarget = MOCK_SPECIES.reduce((sum, s) => sum + s.target, 0);
  const totalPlanted = MOCK_SPECIES.reduce((sum, s) => sum + s.planted, 0);
  const totalPlantingPct = Math.round((totalPlanted / totalTarget) * 100);
  const avgSurvivalPct = Math.round(
    MOCK_SPECIES.reduce((sum, s) => sum + s.survivalPct * s.planted, 0) / totalPlanted
  );

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      width: '460px',
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
              backgroundColor: 'var(--color-amber-bg)',
              border: '1px solid var(--glass-border-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-amber-glow)'
            }}>
              <Trees size={16} />
            </div>
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-amber-glow)', textTransform: 'uppercase' }}>
                STAGE 03 / COMMITMENTS
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Compensatory Afforestation
              </h3>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-capsule)',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid var(--glass-border-amber)',
            color: 'var(--color-amber-glow)',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <Target size={11} /> SLA ON TRACK
          </div>
        </div>

        {/* Global Progress Bar */}
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Total Planting Quota</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', fontWeight: 700 }}>
              {totalPlanted.toLocaleString()} / {totalTarget.toLocaleString()} ({totalPlantingPct}%)
            </span>
          </div>
          
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${totalPlantingPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>Contractor: EcoGreen Forestry Ltd.</span>
            <span style={{ color: 'var(--color-amber-glow)', fontFamily: 'var(--font-mono)' }}>Milestone: Q2 2026</span>
          </div>
        </div>

        {/* Species Breakdown */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Species-Specific Targets & Survival
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MOCK_SPECIES.map((spec) => (
              <div
                key={spec.name}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--glass-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#ffffff' }}>{spec.name}</span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', fontWeight: 700 }}>
                    {spec.survivalPct}% Survival
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>Planted: {spec.planted.toLocaleString()} / {spec.target.toLocaleString()}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round((spec.planted / spec.target) * 100)}% Fulfilled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onNextStage}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>Inspect Stage 4: Ground Truth Tree Registry</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

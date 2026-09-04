import React from 'react';
import { 
  MapPin, 
  Activity, 
  Target, 
  Trees, 
  Scale, 
  ChevronRight
} from 'lucide-react';

export const STAGES = [
  {
    id: 'baseline',
    number: '01',
    label: 'Baseline AOI',
    tagline: 'Pre-Project Green Cover',
    icon: MapPin,
    accentColor: 'var(--color-cyan)',
    accentGlow: 'var(--color-cyan-glow)'
  },
  {
    id: 'changes',
    number: '02',
    label: 'Change Detection',
    tagline: 'Satellite Loss Radar',
    icon: Activity,
    accentColor: 'var(--color-rose)',
    accentGlow: 'var(--color-rose-glow)'
  },
  {
    id: 'mitigation',
    number: '03',
    label: 'Mitigation Action',
    tagline: 'Afforestation Mandates',
    icon: Target,
    accentColor: 'var(--color-amber)',
    accentGlow: 'var(--color-amber-glow)'
  },
  {
    id: 'plantation',
    number: '04',
    label: 'Field Verification',
    tagline: 'AI Tree Census & SHA-256',
    icon: Trees,
    accentColor: 'var(--color-emerald)',
    accentGlow: 'var(--color-emerald-glow)'
  },
  {
    id: 'compliance',
    number: '05',
    label: 'Compliance Engine',
    tagline: 'Mathematical Scorecard',
    icon: Scale,
    accentColor: 'var(--color-indigo)',
    accentGlow: 'var(--color-indigo-glow)'
  }
];

export default function StageNavigator({ activeStage, onSelectStage }) {
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 900,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 8px',
      backgroundColor: 'rgba(8, 14, 28, 0.88)',
      backdropFilter: 'var(--spatial-blur)',
      WebkitBackdropFilter: 'var(--spatial-blur)',
      border: '1px solid var(--glass-border-highlight)',
      borderRadius: 'var(--radius-capsule)',
      boxShadow: 'var(--spatial-shadow-elevated)',
      userSelect: 'none'
    }}>
      {STAGES.map((stage, idx) => {
        const Icon = stage.icon;
        const isActive = activeStage === stage.id;

        return (
          <React.Fragment key={stage.id}>
            <button
              onClick={() => onSelectStage(stage.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-capsule)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                border: isActive ? `1px solid ${stage.accentGlow}` : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 16px ${stage.accentColor}44, inset 0 1px 1px rgba(255, 255, 255, 0.2)` : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: isActive ? stage.accentColor : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                {stage.number}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)'
                }}>
                  {stage.label}
                </span>
              </div>
            </button>

            {idx < STAGES.length - 1 && (
              <ChevronRight size={12} style={{ color: 'rgba(255, 255, 255, 0.2)', margin: '0 -2px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Satellite, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  Sliders, 
  Globe2, 
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';

export default function Stage1Baseline({
  project,
  onNextStage,
  activeLayer,
  onSelectLayer,
  layerOpacity,
  onChangeOpacity,
  isLoadingSatellite
}) {
  const [lockedBaseline, setLockedBaseline] = useState(true);

  if (!project) {
    return (
      <div className="geo-hud-card" style={{ padding: '24px', maxWidth: '420px', margin: 'auto', textAlign: 'center' }}>
        <MapPin size={32} style={{ color: 'var(--color-cyan-glow)', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '8px' }}>No AOI Boundary Selected</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Please select a monitored boundary from the top command bar to inspect pre-project baseline imagery.
        </p>
      </div>
    );
  }

  const baselineDate = project.created_at ? new Date(project.created_at).toLocaleDateString() : '01 Jan 2026';
  const baselineNDVI = 0.68;
  const initialGreenCover = 84.5;

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      width: '420px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 800,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Primary Baseline Card */}
      <div className="geo-hud-card" style={{ padding: '18px' }}>
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-cyan-bg)',
              border: '1px solid var(--glass-border-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cyan-glow)'
            }}>
              <MapPin size={16} />
            </div>
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)', textTransform: 'uppercase' }}>
                STAGE 01 / LIVING RECORD
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                AOI Boundary & Baseline
              </h3>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-capsule)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--glass-border-emerald)',
            color: 'var(--color-emerald-glow)',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <Lock size={11} /> BASELINE SEALED
          </div>
        </div>

        {/* Project Meta Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MONITORED AREA</span>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)', marginTop: '2px' }}>
              {project.area_hectares ? `${project.area_hectares} ha` : project.area || '312.4 ha'}
            </div>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PRE-PROJECT CANOPY</span>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', marginTop: '2px' }}>
              {initialGreenCover}% (Dense)
            </div>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BASELINE NDVI</span>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: '2px' }}>
              {baselineNDVI} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>± 0.04</span>
            </div>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TIMESTAMP</span>
            <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: '4px' }}>
              {baselineDate}
            </div>
          </div>
        </div>

        {/* Sentinel-2 Layer Switcher Controls */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} style={{ color: 'var(--color-cyan-glow)' }} /> Raster Overlay Layer
            </span>
            {isLoadingSatellite && (
              <span style={{ fontSize: '10px', color: 'var(--color-cyan-glow)', fontFamily: 'var(--font-mono)' }}>
                Streaming Tiles...
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { id: 'satellite-truecolor', label: 'TrueColor (RGB)' },
              { id: 'ndvi-raster', label: 'NDVI Index' },
              { id: 'vector-only', label: 'Vector Only' }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: activeLayer === layer.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: activeLayer === layer.id ? '1px solid var(--glass-border-cyan)' : '1px solid var(--glass-border-subtle)',
                  color: activeLayer === layer.id ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: activeLayer === layer.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        {activeLayer !== 'vector-only' && (
          <div style={{ padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-control)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sliders size={12} /> Layer Opacity
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)' }}>
                {Math.round(layerOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
            />
          </div>
        )}

        {/* Next Stage Action Trigger */}
        <button
          onClick={onNextStage}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>Proceed to Stage 2: Change Detection</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Sealed Baseline Attestation Box */}
      <div className="geo-hud-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--color-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--color-cyan-glow)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>Cryptographic Environmental Baseline</span>
        </div>
        <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Pre-disturbance vegetation metrics are locked with PostGIS 16 spatial hash. Any subsequent loss detected by Sentinel-2 passes triggers automated mitigation quotas.
        </p>
      </div>
    </div>
  );
}

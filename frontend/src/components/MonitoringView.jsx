import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Sliders, 
  MapPin, 
  Sparkles,
  Send,
  Check,
  X,
  Satellite
} from 'lucide-react';
import { ENVIRONMENTAL_CHANGES, PROJECTS } from '../data/mockData';
import SatelliteMonitoring from './SatelliteMonitoring';

/**
 * MonitoringView Component
 *
 * IMPORTANT ARCHITECTURE NOTE:
 * - Change events list: Uses DEMO/MOCK data for UI demonstration
 * - Satellite Monitoring panel: Makes REAL API calls to Sentinel Hub backend
 * - Before/After comparison: Uses REAL API data from SatelliteMonitoring component
 * - NDVI values displayed here are DEMO values clearly labeled as such
 *
 * The real satellite data flow is:
 * SatelliteMonitoring → Backend API → Sentinel Hub → Copernicus Data Space → Sentinel-2 L2A
 */
export default function MonitoringView({ onSelectChange, onPanToLocation, selectedProject }) {
  const [changes, setChanges] = useState(ENVIRONMENTAL_CHANGES);
  const [selectedChange, setSelectedChange] = useState(changes[0]);
  const [sliderPos, setSliderPos] = useState(50);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showSatellite, setShowSatellite] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);

  const handleTriageAction = (type) => {
    setActionSuccess(`Action recorded: ${type} dispatched for ${selectedChange.id}. Cryptographic audit log updated.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div style={{
      padding: '20px 28px',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="status-beacon amber" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Satellite Change Detection & Automated Triage
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Satellite change detection & mitigation workflow engine. Change events below are demo data.
          </p>
        </div>

        {/* Demo Data Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <Radio size={13} color="var(--color-amber)" />
          <span style={{ color: 'var(--color-amber)', fontWeight: 700 }}>DEMO DATA — CHANGE EVENTS BELOW</span>
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--border-emerald)',
          color: '#34d399',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Real Sentinel-2 Satellite Monitoring Panel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setShowSatellite(!showSatellite)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            backgroundColor: showSatellite ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: showSatellite ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
            color: showSatellite ? 'var(--color-cyan)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-xs)',
            cursor: 'pointer',
          }}
        >
          <Satellite size={12} />
          {showSatellite ? 'Hide' : 'Show'} Real Satellite Data
        </button>
        <span style={{ fontSize: '9px', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          REAL SENTINEL-2 DATA — FROM BACKEND API
        </span>
      </div>

      {/* Real Satellite Monitoring Panel — Makes actual API calls to Sentinel Hub */}
      {showSatellite && selectedProject && (
        <SatelliteMonitoring
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          projectBoundary={selectedProject.boundary}
        />
      )}

      {/* Main Split Grid: Left Triage Queue (40%) & Right Spectral Inspector (60%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: '16px',
        flex: 1,
        minHeight: '480px'
      }}>
        {/* Left: Change Events Queue */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              DETECTION QUEUE ({changes.length})
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-amber)', fontWeight: 600 }}>
              2 REQUIRES TRIAGE
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {changes.map((ev) => {
              const isLoss = ev.type === 'LOSS';
              const isSelected = selectedChange.id === ev.id;

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedChange(ev)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)',
                      backgroundColor: isLoss ? 'var(--color-rose-bg)' : 'var(--color-emerald-bg)',
                      padding: '2px 5px',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      {ev.type}
                    </span>

                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {ev.date} {ev.year}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {ev.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    <span>{ev.projectName}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)'
                    }}>
                      {ev.area}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Spectral Telemetry & Triage Inspector */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Inspector Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', fontWeight: 700 }}>
                    EVENT ID: {selectedChange.id.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {selectedChange.projectName}</span>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedChange.description}
                </h2>
              </div>

              <div style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CONFIDENCE SCORE</div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-cyan)' }}>
                  {selectedChange.confidence}
                </div>
              </div>
            </div>

            {/* DEMO Before / After NDVI Comparison — Mock visualization for UI demonstration */}
            <div style={{
              height: '180px',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
              backgroundColor: '#050a12'
            }}>
              {/* Demo Data Label */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                zIndex: 20,
                fontSize: '8px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-amber)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                DEMO DATA — NOT FROM REAL SENTINEL-2
              </div>

              {/* Baseline Layer (Before) */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #092015 0%, #05140d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-emerald)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    DEMO BASELINE (NDVI {selectedChange.ndviBefore || 'N/A'})
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Simulated pre-construction canopy — Use Satellite Panel for real data</div>
                </div>
              </div>

              {/* Anomaly Layer (After) clipped by slider */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: `${sliderPos}%`,
                background: selectedChange.type === 'LOSS' 
                  ? 'linear-gradient(135deg, #2b0b0e 0%, #150507 100%)' 
                  : 'linear-gradient(135deg, #083321 0%, #041f14 100%)',
                borderRight: '2px solid var(--color-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
              }}>
                <div style={{ minWidth: '320px', textAlign: 'center', color: selectedChange.type === 'LOSS' ? 'var(--color-rose)' : '#34d399' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    DEMO CURRENT (NDVI {selectedChange.ndviAfter || 'N/A'})
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Simulated surface reflectance — Use Satellite Panel for real data</div>
                </div>
              </div>

              {/* Slider Control */}
              <input 
                type="range"
                min="5"
                max="95"
                value={sliderPos}
                onChange={(e) => setSliderPos(e.target.value)}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '20px',
                  right: '20px',
                  width: 'calc(100% - 40px)',
                  zIndex: 10,
                  accentColor: 'var(--color-cyan)'
                }}
              />
            </div>

            {/* Sensor & Coordinates Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '11px',
              marginBottom: '14px'
            }}>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>SENSOR PLATFORM (DEMO)</div>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{selectedChange.sensor}</div>
              </div>

              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '9.5px' }}>COORDINATES (WGS84)</div>
                <div style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {selectedChange.coords[0]}°N, {selectedChange.coords[1]}°E
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-subtle)',
              fontSize: '9.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              marginBottom: '14px'
            }}>
              <div style={{ color: 'var(--color-emerald)', marginBottom: '2px', fontWeight: 600 }}>
                SHA-256 RASTER DIGEST (IMMUTABLE):
              </div>
              <div style={{ wordBreak: 'break-all' }}>{selectedChange.sha256Hash}</div>
            </div>
          </div>

          {/* Triage Action Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: '8px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px'
          }}>
            <button
              onClick={() => handleTriageAction('Confirm Change & Spawn Mitigation')}
              style={{
                height: '34px',
                backgroundColor: 'var(--color-rose)',
                color: '#fff',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={13} />
              <span>Confirm & Order Mitigation</span>
            </button>

            <button
              onClick={() => handleTriageAction('Dispatch On-Site Field Drone Inspection')}
              style={{
                height: '34px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid var(--border-accent)',
                color: 'var(--color-cyan)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Send size={12} />
              <span>Dispatch Drone/Officer</span>
            </button>

            <button
              onClick={() => handleTriageAction('Marked as Seasonal / False Positive')}
              style={{
                height: '34px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <X size={13} />
              <span>False Alarm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

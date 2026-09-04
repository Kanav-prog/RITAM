import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  TrendingDown, 
  MapPin, 
  ShieldAlert, 
  Filter, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  Flame,
  Layers,
  Crosshair
} from 'lucide-react';

export default function Stage2ChangeDetection({
  project,
  onNextStage,
  onPanToCoords,
  onEscalateToMitigation
}) {
  const events = project?.changeEvents || [
    {
      id: 'default-chg-01',
      sector: 'North Corridor Disturbance Zone',
      date: '14 Feb 2026',
      magnitudePct: -34.8,
      lossAreaHa: 14.2,
      confidence: 96.4,
      severity: 'CRITICAL',
      type: 'Canopy Loss / Clearing',
      coords: project?.center || [20.9550, 85.2200],
      status: 'ACTION_REQUIRED',
      mandateRatio: '1:3 REPLACEMENT RATIO',
      mandateSaplings: 17750,
      notes: 'Active clearing detected by Sentinel-2 band 8/4 diff.'
    }
  ];

  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredEvents = events.filter(
    (ev) => filterSeverity === 'ALL' || ev.severity === filterSeverity
  );

  const totalLossHa = events.reduce((sum, e) => sum + e.lossAreaHa, 0);
  const maxCanopyDrop = Math.min(...events.map((e) => e.magnitudePct));
  const avgConfidence = (events.reduce((sum, e) => sum + e.confidence, 0) / events.length).toFixed(1);

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      width: '490px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 850,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Change Detection Overview Card */}
      <div className="geo-hud-card" style={{ padding: '18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-rose-bg)',
              border: '1px solid var(--glass-border-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-rose-glow)'
            }}>
              <Activity size={16} />
            </div>
            <div>
              <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-rose-glow)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                STAGE 02 / SATELLITE RADAR • {project?.name?.slice(0, 24)}...
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Vegetation Loss & Disturbance Radar
              </h3>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-capsule)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--glass-border-rose)',
            color: 'var(--color-rose-glow)',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <Flame size={11} /> {events.length} ANOMALIES DETECTED
          </div>
        </div>

        {/* Project Context Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--glass-border-subtle)',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>
              {project?.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Authority: {project?.authority || 'State Forest Department'} • Area: {project?.area_hectares || project?.area}
            </div>
          </div>
        </div>

        {/* Aggregate Loss Metrics for this Specific Project */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '14px'
        }}>
          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PROJECT TOTAL LOSS</span>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-rose-glow)', marginTop: '2px' }}>
              {totalLossHa.toFixed(1)} ha
            </div>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PEAK CANOPY DROP</span>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-rose-glow)', marginTop: '2px' }}>
              {maxCanopyDrop}%
            </div>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-control)', border: '1px solid var(--glass-border-subtle)' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE AVG</span>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)', marginTop: '2px' }}>
              {avgConfidence}%
            </div>
          </div>
        </div>

        {/* Change Events Feed */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Project Specific Anomalies ({filteredEvents.length})
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'CRITICAL', 'MODERATE', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: filterSeverity === sev ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: '1px solid var(--glass-border-subtle)',
                    color: filterSeverity === sev ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '9.5px',
                    cursor: 'pointer'
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.id === ev.id;
              const isCritical = ev.severity === 'CRITICAL';
              const isModerate = ev.severity === 'MODERATE';

              let beaconColor = 'emerald';
              let badgeColor = 'var(--color-cyan-glow)';
              if (isCritical) {
                beaconColor = 'rose';
                badgeColor = 'var(--color-rose-glow)';
              } else if (isModerate) {
                beaconColor = 'amber';
                badgeColor = 'var(--color-amber-glow)';
              }

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    onPanToCoords?.(ev.coords);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--glass-border-rose)' : '1px solid var(--glass-border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`status-beacon ${beaconColor}`} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{ev.sector}</span>
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: badgeColor
                    }}>
                      {ev.magnitudePct}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>{ev.type} • {ev.lossAreaHa} ha ({ev.date})</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)' }}>
                      {ev.coords[0].toFixed(4)}°N, {ev.coords[1].toFixed(4)}°E
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Action & Mandate */}
        {selectedEvent && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--glass-border-rose)',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                {selectedEvent.sector}
              </span>
              <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-amber-glow)', fontWeight: 700 }}>
                {selectedEvent.mandateRatio}
              </span>
            </div>

            <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
              {selectedEvent.notes}
            </p>

            {selectedEvent.mandateSaplings > 0 && (
              <div style={{ fontSize: '10.5px', color: 'var(--color-amber-glow)', marginBottom: '8px', fontWeight: 600 }}>
                Mandatory Allocation: <strong>{selectedEvent.mandateSaplings.toLocaleString()} saplings</strong> under State Forest Conservation Guidelines.
              </div>
            )}

            <button
              onClick={() => onEscalateToMitigation?.(selectedEvent)}
              className="btn-primary"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                justifyContent: 'center',
                fontSize: '11px'
              }}
            >
              <span>Escalate Anomaly to Stage 3 Plantation Plan</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Next Stage Button */}
        <button
          onClick={onNextStage}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>View Plantation Census for this Project</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { X, ShieldCheck, MapPin, Radio, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function EvidenceDetailModal({ event, onClose, onPanToLocation }) {
  if (!event) return null;

  const isLoss = event.type === 'LOSS';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div 
        className="glass-panel-elevated"
        style={{
          width: '560px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-muted)',
          animation: 'scaleUp 0.18s ease-out'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)',
              backgroundColor: isLoss ? 'var(--color-rose-bg)' : 'var(--color-emerald-bg)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)'
            }}>
              {event.type}
            </span>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Environmental Change Evidence Record
            </h3>
          </div>

          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '4px', borderRadius: 'var(--radius-xs)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Main Headline */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
              {event.projectName} · {event.date} {event.year}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {event.description}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>AREA DELTA</div>
              <div style={{
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: isLoss ? 'var(--color-rose)' : 'var(--color-emerald)'
              }}>
                {event.area}
              </div>
            </div>

            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>MODEL CONFIDENCE</div>
              <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>
                {event.confidence}
              </div>
            </div>

            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>FIELD STATUS</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: event.verified ? 'var(--color-emerald)' : 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                {event.verified ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                <span>{event.verified ? 'VERIFIED' : 'PENDING'}</span>
              </div>
            </div>
          </div>

          {/* Sensor & Location Info */}
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Observation Sensor:</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{event.sensor}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coordinates (WGS84):</span>
              <span style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                {event.coords[0].toFixed(4)}°N, {event.coords[1].toFixed(4)}°E
              </span>
            </div>
          </div>

          {/* Cryptographic Proof */}
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid var(--border-emerald)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: 'var(--color-emerald)', fontWeight: 600 }}>
              <ShieldCheck size={13} />
              <span>Cryptographic SHA-256 Non-Repudiation Hash</span>
            </div>
            <div style={{
              fontSize: '9.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              wordBreak: 'break-all'
            }}>
              {event.sha256Hash}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}>
          <button
            onClick={() => {
              onPanToLocation(event.coords);
              onClose();
            }}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
          >
            <MapPin size={13} color="var(--color-cyan)" />
            <span>Focus on Map</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-emerald)',
              color: '#06090e',
              fontSize: '11.5px',
              fontWeight: 700
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34d399'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-emerald)'}
          >
            Acknowledge Evidence
          </button>
        </div>
      </div>
    </div>
  );
}

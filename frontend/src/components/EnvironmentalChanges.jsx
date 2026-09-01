import React from 'react';
import { TrendingDown, TrendingUp, AlertCircle, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { ENVIRONMENTAL_CHANGES } from '../data/mockData';

export default function EnvironmentalChanges({ onSelectEvent, selectedEventId }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={14} color="var(--color-amber)" />
          <h2 style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.2px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)'
          }}>
            Environmental Changes
          </h2>
        </div>
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}>
          {ENVIRONMENTAL_CHANGES.length} DETECTIONS
        </span>
      </div>

      {/* Events List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '6px'
      }}>
        {ENVIRONMENTAL_CHANGES.map((ev) => {
          const isLoss = ev.type === 'LOSS';
          const isRestoration = ev.type === 'RESTORATION' || ev.type === 'RECOVERY';
          const isSelected = selectedEventId === ev.id;

          let badgeColor = 'var(--text-muted)';
          let badgeBg = 'rgba(255, 255, 255, 0.05)';
          let Icon = AlertCircle;

          if (isLoss) {
            badgeColor = 'var(--color-rose)';
            badgeBg = 'var(--color-rose-bg)';
            Icon = TrendingDown;
          } else if (isRestoration) {
            badgeColor = 'var(--color-emerald)';
            badgeBg = 'var(--color-emerald-bg)';
            Icon = TrendingUp;
          }

          return (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '4px',
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                border: isSelected ? '1px solid var(--border-accent)' : '1px solid transparent',
                transition: 'all 0.14s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Date & Description */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  minWidth: '46px',
                  paddingTop: '2px'
                }}>
                  {ev.date}
                </div>

                <div>
                  <div style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '1px'
                  }}>
                    {ev.description}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {ev.projectName} · <span style={{ fontFamily: 'var(--font-mono)' }}>{ev.sensor}</span>
                  </div>
                </div>
              </div>

              {/* Delta Tag & Action Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  <Icon size={12} />
                  <span>{ev.area}</span>
                </div>
                <ChevronRight size={13} color="var(--text-muted)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

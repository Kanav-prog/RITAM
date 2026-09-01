import React from 'react';
import { 
  Radar, 
  Layers, 
  Activity, 
  Trees, 
  Scale, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  Radio
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: Radar },
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'environment', label: 'Ecozones', icon: Trees },
  { id: 'compensation', label: 'Compensation', icon: Scale },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'evidence', label: 'Evidence', icon: ShieldCheck },
  { id: 'ask-ritam', label: 'Ask RITAM', icon: Sparkles, highlight: true }
];

export default function Sidebar({ activeNav, onSelectNav }) {
  return (
    <aside style={{
      width: '76px',
      minWidth: '76px',
      height: 'calc(100vh - 24px)',
      margin: '12px 0 12px 12px',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'var(--spatial-blur)',
      WebkitBackdropFilter: 'var(--spatial-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-window)',
      boxShadow: 'var(--spatial-shadow)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      zIndex: 1000,
      userSelect: 'none'
    }}>
      {/* Top Apple Spatial Brand Capsule */}
      <div 
        onClick={() => onSelectNav('command-center')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'rgba(16, 185, 129, 0.16)',
          border: '1px solid var(--glass-border-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-emerald-glow)',
          boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
        }}>
          <Radar size={22} className="spatial-spin" />
        </div>
        <span style={{ 
          fontSize: '10.5px', 
          fontWeight: 800, 
          letterSpacing: '2.5px', 
          color: '#ffffff',
          fontFamily: 'var(--font-mono)'
        }}>
          RITAM
        </span>
      </div>

      {/* Nav Capsule List */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        padding: '0 8px'
      }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectNav(item.id)}
              title={item.label}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: 'var(--radius-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                border: isActive ? '1px solid var(--glass-border-highlight)' : '1px solid transparent',
                boxShadow: isActive ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)' : 'none',
                color: isActive 
                  ? (item.highlight ? 'var(--color-cyan-glow)' : 'var(--color-emerald-glow)') 
                  : 'var(--text-secondary)',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'scale(1.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'scale(1.0)';
                }
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              <span style={{ 
                fontSize: '8.5px', 
                fontWeight: 600, 
                marginTop: '3px',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                letterSpacing: '-0.2px',
                textAlign: 'center',
                maxWidth: '56px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Floating System Pill */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '6px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--glass-border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="status-beacon emerald" style={{ width: '6px', height: '6px' }} />
          <Radio size={11} color="var(--color-emerald-glow)" />
        </div>
        <span style={{ fontSize: '7.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
          VISION-OS
        </span>
      </div>
    </aside>
  );
}

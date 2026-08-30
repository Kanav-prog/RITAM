import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight, ShieldCheck, MapPin, Compass } from 'lucide-react';
import { AI_SUGGESTIONS, PROJECTS, STATS } from '../data/mockData';

export default function AskRitamView({ onSelectProject }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am **RITAM Earth Observation Copilot**. I have real-time access to the PostGIS spatial engine, Sentinel-2 spectral rasters, and digital tree registries. How can I assist with environmental compliance or ecozone intelligence today?",
      suggestions: AI_SUGGESTIONS
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = (textToSend) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      let aiResponseText = '';
      let actionProject = null;

      if (q.toLowerCase().includes('ecozone') || q.toLowerCase().includes('expansion')) {
        aiResponseText = `Based on Sentinel-2 multispectral analysis as of **30 Aug 2026**:
- **Sharavathi River Basin (Western Ghats)**: +30.0% Ecozone Growth (+156 ha) with an Ecozone Health Index (EHI) of **0.94**.
- **Upper Hindon Riparian Corridor (Delhi-Meerut)**: +6.5% Ecozone Growth (+92 ha), EHI **0.86**.
- **Thar Desert Fringe (Rajasthan Solar)**: +5.2% Ecozone Growth (+38 ha), EHI **0.78**.

**Net Post-Plantation Ecozone Accretion** across monitored sites stands at **+248 ha (+5.4%)**.`;
        actionProject = PROJECTS[0];
      } else if (q.toLowerCase().includes('survival') || q.toLowerCase().includes('delhi')) {
        aiResponseText = `For the **Delhi–Meerut RRTS Corridor**:
- **Statutory Target**: 42,000 trees
- **Planted on-site**: 38,400 trees
- **Field Verified**: 36,120 trees
- **Surviving Healthy**: 32,800 trees
- **Calculated Survival Rate**: **90.8%** (Compliant · Grade A)
- **Dominant Species**: *Azadirachta indica (Neem)* (94% survival) and *Ficus religiosa (Peepal)* (90% survival).`;
        actionProject = PROJECTS[0];
      } else if (q.toLowerCase().includes('loss') || q.toLowerCase().includes('alert')) {
        aiResponseText = `⚠️ **Active Vegetation Loss Alerts Detected**:
1. **Right-of-Way km 34** (Delhi–Meerut): −2.1 ha tree clearance detected via PlanetScope 3m Orthotile (NDVI Δ -0.42). Mitigation inspection pending.
2. **Forest Corridor km 118** (NH-46 MP): −3.8 ha deciduous canopy fragmentation. Status: **ACTION REQUIRED**.`;
        actionProject = PROJECTS[2];
      } else {
        aiResponseText = `Analysis complete across all **8 Monitored Projects (2,480 ha total corridor footprint)**:
- **Net Vegetation Balance**: +148 ha (512 ha restoration vs 364 ha loss)
- **Average Plantation Survival Rate**: **89.4%**
- **Overall Statutory Compliance**: **91.2% (Grade A)**. All datasets cryptographically sealed with SHA-256 digests.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText,
          projectAction: actionProject
        }
      ]);
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      padding: '20px 28px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="status-beacon emerald" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Ask RITAM — Geospatial Environmental Copilot
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Natural language queries across PostGIS boundaries, spectral rasters, and digital tree registries.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid var(--border-accent)',
          fontSize: '11px',
          color: 'var(--color-cyan)',
          fontFamily: 'var(--font-mono)'
        }}>
          <Sparkles size={13} />
          <span>RITAM LLM + POSTGIS 16 ONLINE</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '18px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {messages.map((m) => (
          <div 
            key={m.id}
            style={{
              display: 'flex',
              gap: '10px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {m.sender === 'ai' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--border-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-emerald)',
                flexShrink: 0
              }}>
                <Bot size={16} />
              </div>
            )}

            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: m.sender === 'user' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(18, 26, 40, 0.85)',
              border: `1px solid ${m.sender === 'user' ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              lineHeight: '1.5'
            }}>
              <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>

              {m.projectAction && (
                <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <button
                    onClick={() => onSelectProject(m.projectAction)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid var(--border-emerald)',
                      color: 'var(--color-emerald)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MapPin size={11} />
                    <span>View {m.projectAction.name} on Spatial Map</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              )}

              {m.suggestions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Environmental Inquiries:</span>
                  {m.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      style={{
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '11px',
                        color: 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
                        e.currentTarget.style.color = 'var(--color-cyan)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid var(--border-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-cyan)',
                flexShrink: 0
              }}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span className="status-beacon emerald" />
            <span>Querying PostGIS spatial boundary models and multispectral rasters...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--bg-surface)',
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask RITAM anything about ecozones, survival rates, or spatial compliance..."
          style={{
            flex: 1,
            height: '36px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0 12px',
            color: 'var(--text-primary)',
            fontSize: '12px'
          }}
        />

        <button
          onClick={() => handleSend()}
          style={{
            padding: '0 18px',
            backgroundColor: 'var(--color-emerald)',
            color: '#06090e',
            borderRadius: 'var(--radius-xs)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34d399'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-emerald)'}
        >
          <Send size={13} />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}

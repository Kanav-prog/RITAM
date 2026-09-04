import React, { useState } from 'react';
import { Trees, CheckCircle2, AlertTriangle, Search, Filter, ShieldCheck, MapPin, QrCode, FileText } from 'lucide-react';
import { STATS, GEOTAGGED_TREES, PROJECTS } from '../data/mockData';

export default function CompensationView() {
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState('ALL');

  const filteredTrees = GEOTAGGED_TREES.filter((t) => {
    const matchHealth = filterHealth === 'ALL' || t.healthStatus === filterHealth;
    const matchSearch = t.tag.toLowerCase().includes(search.toLowerCase()) ||
                        t.species.toLowerCase().includes(search.toLowerCase()) ||
                        t.projectName.toLowerCase().includes(search.toLowerCase());
    return matchHealth && matchSearch;
  });

  return (
    <div style={{
      padding: '20px 28px',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="status-beacon emerald" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Compensatory Afforestation & Digital Tree Registry
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Cryptographically signed field geotagging, on-site survival verification, and legal statutory compliance tracking.
          </p>
        </div>

        {/* Global Survival Rate Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid var(--border-emerald)'
        }}>
          <div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>COMPENSATORY SURVIVAL</div>
            <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-emerald)' }}>
              {STATS.avgSurvivalRate} ({STATS.survivingTrees} / {STATS.verifiedTrees})
            </div>
          </div>
        </div>
      </div>

      {/* 4 Afforestation Funnel Progress Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>STATUTORY TARGET</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {STATS.targetTrees}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Legally Mandated</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>PLANTED ON-SITE</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>
            {STATS.plantedTrees}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-cyan)', marginTop: '2px' }}>89.1% of Mandate</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>FIELD VERIFIED</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)' }}>
            {STATS.verifiedTrees}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-emerald)', marginTop: '2px' }}>93.3% Verification Rate</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>SURVIVING HEALTHY</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
            {STATS.survivingTrees}
          </div>
          <div style={{ fontSize: '10px', color: '#34d399', marginTop: '2px' }}>89.4% Survival Rate</div>
        </div>
      </div>

      {/* Geotagged Tree Registry Section */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Table Controls */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0,0,0,0.2)',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tree tag, species (e.g. Neem)..."
              style={{
                width: '100%',
                height: '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0 10px 0 32px',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['ALL', 'HEALTHY', 'AT_RISK'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterHealth(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  backgroundColor: filterHealth === st ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: filterHealth === st ? 'var(--color-emerald)' : 'var(--text-secondary)',
                  border: filterHealth === st ? '1px solid var(--border-emerald)' : '1px solid transparent'
                }}
              >
                {st === 'ALL' ? 'All Trees' : st === 'HEALTHY' ? 'Healthy' : 'At Risk'}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <th style={{ padding: '10px 14px' }}>DIGITAL TREE TAG</th>
                <th style={{ padding: '10px 14px' }}>BOTANICAL SPECIES</th>
                <th style={{ padding: '10px 14px' }}>CORRIDOR</th>
                <th style={{ padding: '10px 14px' }}>GPS COORDINATES</th>
                <th style={{ padding: '10px 14px' }}>HEALTH STATUS</th>
                <th style={{ padding: '10px 14px' }}>LAST VERIFIED</th>
                <th style={{ padding: '10px 14px' }}>SHA-256 PROOF</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrees.map((tree) => (
                <tr 
                  key={tree.tag}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.12s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                    {tree.tag}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tree.species}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {tree.projectName}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                    {tree.coords[0].toFixed(4)}°N, {tree.coords[1].toFixed(4)}°E
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: tree.healthStatus === 'HEALTHY' ? 'var(--color-emerald-bg)' : 'var(--color-amber-bg)',
                      color: tree.healthStatus === 'HEALTHY' ? 'var(--color-emerald)' : 'var(--color-amber)'
                    }}>
                      {tree.healthStatus}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                    {tree.lastVerified}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)', fontSize: '9px' }}>
                    {tree.sha256Evidence.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

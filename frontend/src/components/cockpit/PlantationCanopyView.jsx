import React, { useState } from 'react';
import { 
  Trees, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ZoomIn, 
  Eye, 
  Filter, 
  Layers, 
  ArrowRight,
  Sparkles,
  Search,
  Crosshair,
  MapPin,
  Camera,
  Fingerprint,
  RefreshCw,
  Send
} from 'lucide-react';

export default function PlantationCanopyView({
  project,
  selectedMicroTree,
  onSelectMicroTree,
  onPanToCoords,
  onNextStage,
  filterHealth,
  onFilterHealthChange
}) {
  const [showZoomInset, setShowZoomInset] = useState(true);
  const [treeSearch, setTreeSearch] = useState('');

  // Compartment Data from Real Project or Fallback
  const compartment = project?.compartment || {
    id: 'COMP-TAL-4A',
    name: 'Sector 4A Reclamation Ridge (7.3 ha)',
    speciesDominant: 'Sal (Shorea robusta) & Teak (Tectona grandis)',
    totalPits: 9759,
    livingCount: 6586,
    deadCount: 1206,
    stressedCount: 608,
    blankCount: 1359,
    survivalRate: 73.7,
    mortalityRate: 26.3,
    center: [20.9512, 85.2185]
  };

  const livingPct = ((compartment.livingCount / compartment.totalPits) * 100).toFixed(1);
  const deadPct = ((compartment.deadCount / compartment.totalPits) * 100).toFixed(1);
  const stressedPct = ((compartment.stressedCount / compartment.totalPits) * 100).toFixed(1);
  const blankPct = ((compartment.blankCount / compartment.totalPits) * 100).toFixed(1);

  // Micro Specimen List for Pinpoint Inspection
  const mockMicroTrees = [
    {
      tag: 'RTM-TREE-00412',
      species: 'Sal (Shorea robusta)',
      health: 'DEAD',
      coords: [compartment.center[0] + 0.0012, compartment.center[1] - 0.0008],
      heightCm: 0,
      crownDiamM: 0,
      ndvi: 0.12,
      photoSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      inspector: 'Drone Ortho Sensor + Field Agent R. Nayak',
      issue: 'Termite root infestation / drought stress'
    },
    {
      tag: 'RTM-TREE-00413',
      species: 'Sal (Shorea robusta)',
      health: 'LIVING',
      coords: [compartment.center[0] + 0.0014, compartment.center[1] - 0.0004],
      heightCm: 158,
      crownDiamM: 1.95,
      ndvi: 0.78,
      photoSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      inspector: 'Drone Ortho Sensor',
      issue: 'Optimal canopy development'
    },
    {
      tag: 'RTM-TREE-00414',
      species: 'Teak (Tectona grandis)',
      health: 'STRESSED',
      coords: [compartment.center[0] + 0.0016, compartment.center[1] + 0.0002],
      heightCm: 112,
      crownDiamM: 1.20,
      ndvi: 0.44,
      photoSha256: 'cbf529a4d5d497042d36780f4e064053f0a4d93a44394ac0bbe85adb3eca80f7',
      inspector: 'Drone Multispectral Scan',
      issue: 'Chlorophyll depletion / low moisture'
    },
    {
      tag: 'RTM-TREE-00415',
      species: 'Teak (Tectona grandis)',
      health: 'LIVING',
      coords: [compartment.center[0] + 0.0018, compartment.center[1] + 0.0007],
      heightCm: 164,
      crownDiamM: 2.10,
      ndvi: 0.82,
      photoSha256: 'd41d8cd98f00b204e9800998ecf8427e',
      inspector: 'Drone Ortho Sensor',
      issue: 'Vigorous growth'
    },
    {
      tag: 'RTM-TREE-00416',
      species: 'Vacant Pit #416',
      health: 'BLANK',
      coords: [compartment.center[0] + 0.0020, compartment.center[1] + 0.0011],
      heightCm: 0,
      crownDiamM: 0,
      ndvi: 0.15,
      photoSha256: 'f7ff9e8b7bb2e09b70935a5d785e0cc5d9d0abf0',
      inspector: 'Drone Ortho Sensor',
      issue: 'Unplanted pit / soil erosion'
    }
  ];

  const filteredTrees = mockMicroTrees.filter((t) => {
    const matchesFilter = filterHealth === 'ALL' || t.health === filterHealth;
    const matchesSearch = t.tag.toLowerCase().includes(treeSearch.toLowerCase()) || t.species.toLowerCase().includes(treeSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      width: '500px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 850,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Primary Tree Census HUD Card */}
      <div className="geo-hud-card" style={{ padding: '18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-emerald-bg)',
              border: '1px solid var(--glass-border-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-emerald-glow)'
            }}>
              <Trees size={16} />
            </div>
            <div>
              <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                STAGE 03 / MICRO-CANOPY CENSUS
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Plantation Tree-by-Tree Counting
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
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}>
            SURVIVAL: {compartment.survivalRate}%
          </div>
        </div>

        {/* Compartment Information Badge */}
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
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>{compartment.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{compartment.speciesDominant}</div>
          </div>
          <button
            onClick={() => onPanToCoords?.(compartment.center)}
            style={{
              padding: '4px 8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid var(--glass-border-cyan)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-cyan-glow)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Crosshair size={11} /> Focus Plot
          </button>
        </div>

        {/* Tree Counting Matrix Table (Identical to user reference screenshot) */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--glass-border)',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr',
            padding: '7px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderBottom: '1px solid var(--glass-border)',
            fontSize: '9.5px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase'
          }}>
            <span>Category / Health</span>
            <span style={{ textAlign: 'right' }}>Tree#</span>
            <span style={{ textAlign: 'right' }}>%</span>
          </div>

          {/* Living Trees */}
          <div 
            onClick={() => onFilterHealthChange?.(filterHealth === 'LIVING' ? 'ALL' : 'LIVING')}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1fr 1fr',
              padding: '7px 12px',
              borderBottom: '1px solid var(--glass-border-subtle)',
              fontSize: '11px',
              alignItems: 'center',
              backgroundColor: filterHealth === 'LIVING' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              Living Trees
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-emerald-glow)' }}>
              {compartment.livingCount.toLocaleString()}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)' }}>
              {livingPct}%
            </span>
          </div>

          {/* Dead Trees */}
          <div 
            onClick={() => onFilterHealthChange?.(filterHealth === 'DEAD' ? 'ALL' : 'DEAD')}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1fr 1fr',
              padding: '7px 12px',
              borderBottom: '1px solid var(--glass-border-subtle)',
              fontSize: '11px',
              alignItems: 'center',
              backgroundColor: filterHealth === 'DEAD' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              Dead Trees (Mortality)
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-rose-glow)' }}>
              {compartment.deadCount.toLocaleString()}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-rose-glow)' }}>
              {deadPct}%
            </span>
          </div>

          {/* Stressed Trees */}
          <div 
            onClick={() => onFilterHealthChange?.(filterHealth === 'STRESSED' ? 'ALL' : 'STRESSED')}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1fr 1fr',
              padding: '7px 12px',
              borderBottom: '1px solid var(--glass-border-subtle)',
              fontSize: '11px',
              alignItems: 'center',
              backgroundColor: filterHealth === 'STRESSED' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              Stressed Trees
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-amber-glow)' }}>
              {compartment.stressedCount.toLocaleString()}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-amber-glow)' }}>
              {stressedPct}%
            </span>
          </div>

          {/* Blank Spaces */}
          <div 
            onClick={() => onFilterHealthChange?.(filterHealth === 'BLANK' ? 'ALL' : 'BLANK')}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1fr 1fr',
              padding: '7px 12px',
              borderBottom: '1px solid var(--glass-border-subtle)',
              fontSize: '11px',
              alignItems: 'center',
              backgroundColor: filterHealth === 'BLANK' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
              Blank Spaces (Pits)
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
              {compartment.blankCount.toLocaleString()}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {blankPct}%
            </span>
          </div>

          {/* Total Tree Census */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            fontWeight: 800,
            alignItems: 'center'
          }}>
            <span style={{ color: '#ffffff' }}>Total Trees</span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {compartment.totalPits.toLocaleString()}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)' }}>
              100.0%
            </span>
          </div>
        </div>

        {/* Mortality Rate Callout Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 'var(--radius-control)',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--glass-border-rose)',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-rose-glow)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
              Mortality Rate: {compartment.mortalityRate}%
            </span>
          </div>
          <span style={{ fontSize: '9.5px', color: 'var(--color-rose-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {compartment.deadCount} REPLANTING MANDATES
          </span>
        </div>

        {/* Micro Tree Specimen Selector & Pinpointer */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Crosshair size={13} style={{ color: 'var(--color-cyan-glow)' }} />
              Pinpoint Micro Tree Specimen
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Click to Zoom In</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {filteredTrees.map((tree) => {
              const isSelected = selectedMicroTree?.tag === tree.tag;
              const isDead = tree.health === 'DEAD';
              const isStressed = tree.health === 'STRESSED';

              let badgeColor = 'var(--color-emerald-glow)';
              let badgeBg = 'rgba(16, 185, 129, 0.2)';
              if (isDead) {
                badgeColor = 'var(--color-rose-glow)';
                badgeBg = 'rgba(239, 68, 68, 0.2)';
              } else if (isStressed) {
                badgeColor = 'var(--color-amber-glow)';
                badgeBg = 'rgba(245, 158, 11, 0.2)';
              }

              return (
                <div
                  key={tree.tag}
                  onClick={() => {
                    onSelectMicroTree?.(tree);
                    onPanToCoords?.(tree.coords);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--glass-border-cyan)' : '1px solid var(--glass-border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      {tree.tag}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      fontWeight: 700
                    }}>
                      {tree.health}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>{tree.species} {tree.heightCm > 0 ? `(${tree.heightCm} cm)` : ''}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{tree.coords[0].toFixed(5)}, {tree.coords[1].toFixed(5)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Micro Tree Deep Inspector Card */}
        {selectedMicroTree && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--glass-border-cyan)',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-cyan-glow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fingerprint size={14} /> Micro Specimen Inspector
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                {selectedMicroTree.tag}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px', fontSize: '10px' }}>
              <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>CROWN DIAM</span>
                <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{selectedMicroTree.crownDiamM} m</span>
              </div>
              <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>HEIGHT</span>
                <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{selectedMicroTree.heightCm} cm</span>
              </div>
              <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>NDVI INDEX</span>
                <span style={{ fontWeight: 700, color: 'var(--color-emerald-glow)', fontFamily: 'var(--font-mono)' }}>{selectedMicroTree.ndvi}</span>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <strong>Issue Diagnosis:</strong> {selectedMicroTree.issue}
            </div>

            {selectedMicroTree.health === 'DEAD' && (
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                  justifyContent: 'center',
                  padding: '7px',
                  fontSize: '11px'
                }}
                onClick={() => alert(`Gap-filling replantation order issued for tag: ${selectedMicroTree.tag} at ${selectedMicroTree.coords.join(', ')}`)}
              >
                <Send size={12} /> Issue Automated Gap Replanting Order
              </button>
            )}
          </div>
        )}

        {/* Next Stage Button */}
        <button
          onClick={onNextStage}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>Inspect Field Verification & SHA-256 Ledger</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* High-Resolution Zoom Inset Lens (Callout Loupe like the second image) */}
      {showZoomInset && (
        <div className="geo-hud-card-elevated" style={{
          padding: '12px',
          border: '2px solid rgba(239, 68, 68, 0.65)',
          position: 'relative'
        }}>
          {/* Red Callout Indicator Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-rose-glow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Crosshair size={13} /> High-Resolution Orthophoto Patch (0.15m GSD)
            </span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Sub-plot: Sector 4A.3
            </span>
          </div>

          {/* Micro Tree Grid Canvas Mock Visualization */}
          <div style={{
            width: '100%',
            height: '140px',
            borderRadius: 'var(--radius-control)',
            overflow: 'hidden',
            position: 'relative',
            background: 'radial-gradient(ellipse at center, #1b3820 0%, #0d1e12 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Grid of Micro-Tree Crowns with Green/Red/Yellow Dots */}
            <svg width="100%" height="100%" viewBox="0 0 380 140" style={{ position: 'absolute', top: 0, left: 0 }}>
              {Array.from({ length: 8 }).map((_, rowIndex) =>
                Array.from({ length: 18 }).map((_, colIndex) => {
                  const x = 20 + colIndex * 19;
                  const y = 14 + rowIndex * 16;
                  const rand = (colIndex * 7 + rowIndex * 13) % 100;
                  let fillColor = '#10b981'; // Green living
                  let strokeColor = '#34d399';
                  if (rand < 14) {
                    fillColor = '#ef4444'; // Red dead
                    strokeColor = '#f87171';
                  } else if (rand < 22) {
                    fillColor = '#f59e0b'; // Yellow stressed
                    strokeColor = '#fbbf24';
                  } else if (rand < 34) {
                    fillColor = '#64748b'; // Blank space
                    strokeColor = '#94a3b8';
                  }

                  return (
                    <g key={`${rowIndex}-${colIndex}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r={fillColor === '#64748b' ? 3 : 5.5}
                        fill={fillColor}
                        opacity={fillColor === '#64748b' ? 0.4 : 0.85}
                        stroke={strokeColor}
                        strokeWidth={0.8}
                      />
                      <circle cx={x} cy={y} r={1.2} fill="#ffffff" />
                    </g>
                  );
                })
              )}
            </svg>

            {/* Inset Overlay Badge */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(8, 14, 28, 0.85)',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid var(--glass-border-subtle)',
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              color: '#ffffff'
            }}>
              Individual Canopy Delineation
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

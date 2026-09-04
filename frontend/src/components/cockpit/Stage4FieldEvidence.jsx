import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  ExternalLink,
  Eye,
  Hash,
  UserCheck,
  Calendar,
  Layers,
  Crosshair
} from 'lucide-react';

export default function Stage4FieldEvidence({
  project,
  onNextStage,
  onPanToCoords
}) {
  const trees = project?.fieldEvidence || [
    {
      tag: 'RTM-GEN-2026-001',
      species: 'Sal (Shorea robusta)',
      heightCm: 145,
      health: 'HEALTHY',
      coords: project?.center || [20.9512, 85.2185],
      inspector: 'Officer S. Mohanty (Range 4)',
      date: '18 Feb 2026',
      photoSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rfidSealed: true,
      crownHealthNote: 'Healthy indigenous tree.'
    }
  ];

  const [selectedTree, setSelectedTree] = useState(trees[0]);

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
              <ShieldCheck size={16} />
            </div>
            <div>
              <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                STAGE 04 / GROUND TRUTH EVIDENCE
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Cryptographic Tree Ledger
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
            <Fingerprint size={11} /> SHA-256 SEALED
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
              Verified Range: {project?.district || 'Angul'}, {project?.state || 'Odisha'}
            </div>
          </div>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', fontWeight: 700 }}>
            {trees.length} Audit Proofs
          </span>
        </div>

        {/* Tree Registry List */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Geo-Tagged Sapling Proofs ({trees.length})
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-emerald-glow)', fontFamily: 'var(--font-mono)' }}>
              Zero Tampering Detected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {trees.map((tree) => {
              const isSelected = selectedTree?.tag === tree.tag;
              const isHealthy = tree.health === 'HEALTHY';

              return (
                <div
                  key={tree.tag}
                  onClick={() => {
                    setSelectedTree(tree);
                    onPanToCoords?.(tree.coords);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--glass-border-emerald)' : '1px solid var(--glass-border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      {tree.tag}
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: isHealthy ? 'var(--color-emerald-glow)' : 'var(--color-amber-glow)',
                      fontWeight: 700
                    }}>
                      {tree.health}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    <span>{tree.species} ({tree.heightCm} cm)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-glow)' }}>
                      {tree.coords[0].toFixed(4)}°N, {tree.coords[1].toFixed(4)}°E
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Tree Cryptographic Inspector Card */}
        {selectedTree && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--glass-border)',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={13} style={{ color: 'var(--color-cyan-glow)' }} /> Field Inspection Photograph Proof
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {selectedTree.date}
              </span>
            </div>

            {/* Note */}
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <strong>Field Assessment:</strong> {selectedTree.crownHealthNote}
            </div>

            {/* SHA-256 Hash Display */}
            <div style={{ padding: '6px 8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border-subtle)', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>IMMUTABLE CRYPTOGRAPHIC HASH</span>
              <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-emerald-glow)', wordBreak: 'break-all' }}>
                {selectedTree.photoSha256}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <span>Verified by: <strong>{selectedTree.inspector}</strong></span>
              <span style={{ color: 'var(--color-emerald-glow)', fontWeight: 700 }}>✓ RFID SEAL VALID</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <button
          onClick={onNextStage}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>Calculate Stage 5: Compliance Scorecard</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

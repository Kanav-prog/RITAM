import React, { useState } from 'react';
import { ShieldCheck, Lock, Search, FileText, CheckCircle2, History, Copy, Check } from 'lucide-react';
import { AUDIT_LOGS, ENVIRONMENTAL_CHANGES, GEOTAGGED_TREES } from '../data/mockData';

export default function EvidenceView() {
  const [copiedHash, setCopiedHash] = useState(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerify = () => {
    if (!verifyInput.trim()) return;
    const matchAudit = AUDIT_LOGS.find(l => l.hash.toLowerCase() === verifyInput.toLowerCase().trim());
    const matchChange = ENVIRONMENTAL_CHANGES.find(c => c.sha256Hash.toLowerCase() === verifyInput.toLowerCase().trim());
    const matchTree = GEOTAGGED_TREES.find(t => t.sha256Evidence.toLowerCase() === verifyInput.toLowerCase().trim());

    if (matchAudit || matchChange || matchTree) {
      setVerifyResult({
        valid: true,
        entity: matchAudit ? matchAudit.entity : matchChange ? matchChange.projectName : matchTree.tag,
        timestamp: matchAudit ? matchAudit.timestamp : 'Aug 2026'
      });
    } else {
      setVerifyResult({ valid: false });
    }
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="status-beacon emerald" />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Cryptographic Evidence Vault & Audit Trail
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Tamper-proof SHA-256 digital digests ensuring non-repudiation for all field observations, satellite rasters, and regulatory baselines.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid var(--border-emerald)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-emerald)'
        }}>
          <Lock size={13} />
          <span>SHA-256 IMMUTABILITY ENFORCED</span>
        </div>
      </div>

      {/* Cryptographic Hash Verification Tool */}
      <div className="glass-panel" style={{ padding: '14px 18px', backgroundColor: 'rgba(11, 16, 25, 0.95)' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={15} />
          <span>Instant Non-Repudiation Hash Validator</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text"
            value={verifyInput}
            onChange={(e) => setVerifyInput(e.target.value)}
            placeholder="Paste 64-character SHA-256 hash to verify against blockchain/ledger..."
            style={{
              flex: 1,
              height: '34px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '0 12px',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            onClick={handleVerify}
            style={{
              padding: '0 16px',
              backgroundColor: 'var(--color-cyan)',
              color: '#06090e',
              fontSize: '11.5px',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)'
            }}
          >
            Verify Integrity
          </button>
        </div>

        {verifyResult && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: verifyResult.valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${verifyResult.valid ? 'var(--border-emerald)' : 'var(--border-rose)'}`,
            fontSize: '11px',
            color: verifyResult.valid ? 'var(--color-emerald)' : 'var(--color-rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={14} />
            <span>
              {verifyResult.valid 
                ? `Cryptographic match confirmed! Original record tied to: ${verifyResult.entity} (${verifyResult.timestamp}). Verified authentic.`
                : 'No match found in immutable ledger. Potential hash mismatch or tampered record.'}
            </span>
          </div>
        )}
      </div>

      {/* Immutable Audit Log Stream */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
            <History size={14} color="var(--color-cyan)" />
            <span>Immutable Audit Logs ({AUDIT_LOGS.length})</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            POSTGRESQL AUDIT TRIGGER LIVE
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <th style={{ padding: '10px 14px' }}>AUDIT ID</th>
                <th style={{ padding: '10px 14px' }}>TIMESTAMP (UTC)</th>
                <th style={{ padding: '10px 14px' }}>AUTHENTICATED ACTOR</th>
                <th style={{ padding: '10px 14px' }}>ACTION TYPE</th>
                <th style={{ padding: '10px 14px' }}>ENTITY AFFECTED</th>
                <th style={{ padding: '10px 14px' }}>DETAILS</th>
                <th style={{ padding: '10px 14px' }}>DIGEST HASH</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((log) => (
                <tr 
                  key={log.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.12s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                    {log.id}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '10.5px' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.actor}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--color-cyan)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {log.entity}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    {log.details}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleCopy(log.hash)}
                      title="Copy SHA-256 Digest"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        color: copiedHash === log.hash ? 'var(--color-emerald)' : 'var(--text-muted)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span>{log.hash.substring(0, 10)}...</span>
                      {copiedHash === log.hash ? <Check size={10} color="var(--color-emerald)" /> : <Copy size={10} />}
                    </button>
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

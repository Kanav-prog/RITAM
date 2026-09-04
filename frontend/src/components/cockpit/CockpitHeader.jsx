import React, { useState } from 'react';
import { 
  Trees, 
  Satellite, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  FileCheck2, 
  User, 
  ShieldCheck, 
  ArrowLeft
} from 'lucide-react';

export default function CockpitHeader({
  projects = [],
  selectedProject,
  onSelectProject,
  onOpenNewProject,
  onOpenAskRitam,
  isAskRitamOpen,
  onExportComplianceCertificate,
  onBackToHub
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      height: '60px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      position: 'relative',
      zIndex: 1000,
      userSelect: 'none'
    }}>
      {/* Left: Brand Identity, Back Button & Project Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Back to Projects Hub Button */}
        <button
          onClick={onBackToHub}
          style={{
            padding: '6px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            fontWeight: 600,
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={14} />
          <span>Projects Hub</span>
        </button>

        {/* Brand Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingRight: '14px',
          paddingLeft: '4px',
          borderRight: '1px solid #1e293b'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Trees size={17} />
          </div>
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 800, 
              letterSpacing: '1px', 
              color: '#ffffff'
            }}>
              RITAM
            </div>
            <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>
              Environmental Intelligence
            </div>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              maxWidth: '300px'
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProject?.name || 'Select Project...'}
            </span>
            <ChevronDown size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
          </button>

          {dropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '340px',
                padding: '6px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 2000,
                maxHeight: '340px',
                overflowY: 'auto'
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '6px 8px' }}>
                Monitored Projects ({projects.length})
              </div>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj);
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: selectedProject?.id === proj.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: selectedProject?.id === proj.id ? '1px solid #10b981' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px', color: '#ffffff', maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj.name}
                    </span>
                    <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#38bdf8' }}>
                      {proj.area_hectares ? `${proj.area_hectares} ha` : proj.area}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {proj.state || 'India'} • {proj.status || 'ACTIVE'}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenNewProject?.();
                }}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '7px',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  border: '1px dashed #0284c7',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={13} /> Register New Project AOI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Sentinel-2 Constellation Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="telemetry-pill">
          <span className="status-beacon emerald" />
          <Satellite size={13} style={{ color: '#10b981' }} />
          <span style={{ color: '#cbd5e1' }}>SENTINEL-2:</span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>SYNCHRONIZED (10m)</span>
        </div>
      </div>

      {/* Right: Quick Action Triggers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Export Compliance Certificate */}
        <button
          onClick={onExportComplianceCertificate}
          className="btn-secondary"
          title="Download verified compliance certificate"
          style={{ padding: '6px 12px', fontSize: '11.5px' }}
        >
          <FileCheck2 size={13} style={{ color: '#10b981' }} />
          <span>Audit Certificate</span>
        </button>

        {/* Ask RITAM AI Copilot */}
        <button
          onClick={onOpenAskRitam}
          style={{
            background: isAskRitamOpen ? '#4f46e5' : '#1e293b',
            color: '#ffffff',
            border: '1px solid #6366f1',
            borderRadius: '6px',
            padding: '6px 12px',
            fontWeight: 600,
            fontSize: '11.5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={13} style={{ color: '#818cf8' }} />
          <span>Ask RITAM</span>
        </button>

        {/* User / Tenant Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          backgroundColor: '#1e293b',
          borderRadius: '6px',
          border: '1px solid #334155'
        }}>
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Authority Desk</span>
        </div>
      </div>
    </header>
  );
}

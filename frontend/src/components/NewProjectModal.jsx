import React, { useState } from 'react';
import { X, Plus, MapPin, Globe, Trees, CheckCircle2, Shield } from 'lucide-react';

export default function NewProjectModal({ onClose, onAddProject }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    state: 'Uttar Pradesh',
    type: 'Linear Infrastructure',
    areaNum: 450,
    targetTrees: 15000,
    ecozoneName: 'Hindon-Ganga Ecological Buffer',
    agency: 'National Highways Authority of India (NHAI)',
    coordinates: '28.7500, 77.5800'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const [lat, lng] = formData.coordinates.split(',').map(n => parseFloat(n.trim()) || 28.75);

    const newProj = {
      id: `proj-0${Math.floor(Math.random() * 90) + 10}`,
      name: formData.name,
      location: formData.location || `${formData.state}, India`,
      state: formData.state,
      type: formData.type,
      area: `${formData.areaNum} ha`,
      areaNum: Number(formData.areaNum),
      status: 'BASELINE PENDING',
      statusVariant: 'cyan',
      vegetationChange: '0.0 ha',
      vegChangeNum: 0,
      center: [lat, lng],
      zoom: 12,
      baselineTrees: Math.floor(formData.targetTrees * 0.35),
      targetTrees: Number(formData.targetTrees),
      plantedTrees: 0,
      verifiedTrees: 0,
      survivingTrees: 0,
      survivalRate: '0.0%',
      complianceScore: 'PENDING BASELINE',
      agency: formData.agency,
      startDate: 'Aug 2026',
      completionTarget: 'Aug 2029',
      
      ecozoneName: formData.ecozoneName,
      ecozoneBaselineHa: Number(formData.areaNum) * 1.2,
      ecozoneCurrentHa: Number(formData.areaNum) * 1.2,
      ecozoneDeltaHa: '0.0 ha',
      ecozoneDeltaPct: '0.0%',
      ecozoneStatus: 'BASELINE INITIALIZING',
      ecozoneStatusVariant: 'cyan',
      ecozoneHealthIndex: '0.75 (Baseline)',
      biodiversityConnectivity: 'Establishing Baseline',
      ecozoneBoundary: [
        [lat + 0.05, lng - 0.05],
        [lat + 0.04, lng + 0.06],
        [lat - 0.05, lng + 0.05],
        [lat - 0.04, lng - 0.06]
      ],
      boundary: [
        [lat + 0.03, lng - 0.03],
        [lat + 0.02, lng + 0.04],
        [lat - 0.03, lng + 0.03],
        [lat - 0.02, lng - 0.04]
      ],
      vegetationZones: [],
      changeZones: [],
      plantationZones: []
    };

    onAddProject(newProj);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div 
        className="glass-panel-elevated"
        style={{
          width: '600px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-muted)',
          animation: 'scaleUp 0.18s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cyan)'
            }}>
              <Plus size={15} />
            </span>
            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Register New Project & Define Spatial Corridor
              </h3>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                PostGIS SRID 4326 GeoJSON Ingestion Pipeline
              </div>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Project Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Project Name / Corridor Title *
            </label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eastern Dedicated Freight Corridor (Sec 2)"
              style={{
                width: '100%',
                height: '34px',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 10px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          {/* 2-Col: State & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                State / Jurisdiction
              </label>
              <input 
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{
                  width: '100%',
                  height: '34px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Sector / Infrastructure Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  height: '34px',
                  backgroundColor: '#0c1322',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              >
                <option value="Linear Infrastructure">Linear Infrastructure (Rail/Road)</option>
                <option value="Renewable Energy">Renewable Energy (Solar/Wind)</option>
                <option value="Ecological Restoration">Ecological Restoration / Forestry</option>
                <option value="Mining & Mineral">Mining & Extraction</option>
                <option value="Urban Industrial">Smart City & Industrial Corridor</option>
              </select>
            </div>
          </div>

          {/* 2-Col: Monitored Area & Target Plantation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Total Area (Hectares) *
              </label>
              <input 
                type="number"
                required
                value={formData.areaNum}
                onChange={(e) => setFormData({ ...formData, areaNum: e.target.value })}
                style={{
                  width: '100%',
                  height: '34px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Compensatory Target (Trees)
              </label>
              <input 
                type="number"
                value={formData.targetTrees}
                onChange={(e) => setFormData({ ...formData, targetTrees: e.target.value })}
                style={{
                  width: '100%',
                  height: '34px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>

          {/* Center Coordinates & Ecozone Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Associated Ecozone Corridor Name
              </label>
              <input 
                type="text"
                value={formData.ecozoneName}
                onChange={(e) => setFormData({ ...formData, ecozoneName: e.target.value })}
                placeholder="e.g. Ganga-Yamuna Riparian Buffer"
                style={{
                  width: '100%',
                  height: '34px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Center Lat, Long (WGS84)
              </label>
              <input 
                type="text"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                placeholder="28.7500, 77.5800"
                style={{
                  width: '100%',
                  height: '34px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '14px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-emerald)',
                color: '#06090e',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={14} />
              <span>Initialize Project Baseline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

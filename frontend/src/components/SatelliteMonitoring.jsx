import React, { useState, useEffect } from 'react';
import {
  Satellite,
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  Cloud,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';
import { apiClient } from '../api/client';

/**
 * SatelliteMonitoring Component
 *
 * Displays real Sentinel-2 satellite data for a project:
 * - Scene search results
 * - NDVI statistics
 * - Before/after vegetation comparison
 * - Change detection alerts
 *
 * Clearly separates REAL satellite data from mock application data.
 */
export default function SatelliteMonitoring({ projectId, projectName, projectBoundary, onNdviOverlayLoaded }) {
  const [scenes, setScenes] = useState(null);
  const [ndviData, setNdviData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ndvi');

  // Date range state (default: last 30 days for current, 90 days before that for baseline)
  const today = new Date();
  const currentDateTo = today.toISOString().split('T')[0];
  const currentDateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const baselineDateTo = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const baselineDateFrom = new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(baselineDateFrom);
  const [endDate, setEndDate] = useState(currentDateTo);
  const [maxCloud, setMaxCloud] = useState(20);

  // Load satellite history on mount
  useEffect(() => {
    if (projectId) {
      loadHistory();
    }
  }, [projectId]);

  const loadHistory = async () => {
    const data = await apiClient.getSatelliteHistory(projectId);
    if (data && data.scenes) {
      setHistory(data);
    }
  };

  const handleSearchScenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.searchSatelliteScenes(projectId, startDate, endDate, maxCloud);
      if (data) {
        setScenes(data);
      } else {
        setError('Unable to connect to satellite service');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCalculateNDVI = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSatelliteNDVI(projectId, startDate, endDate, maxCloud);
      if (data) {
        setNdviData(data);
        // Fetch NDVI visualization image with authentication
        // This returns a blob URL that Leaflet can use as an ImageOverlay
        if (onNdviOverlayLoaded) {
          try {
            const blobUrl = await apiClient.fetchNdviOverlay(projectId, startDate, endDate, maxCloud);
            onNdviOverlayLoaded(blobUrl);
          } catch (imgErr) {
            // NDVI stats loaded but overlay image failed — show stats only
            console.warn('NDVI overlay image failed (stats still available):', imgErr.message);
            setError(`NDVI calculated but overlay unavailable: ${imgErr.message}`);
          }
        }
      } else {
        setError('Satellite data unavailable — Unable to calculate NDVI from Sentinel Hub');
      }
    } catch (err) {
      setError(`Satellite data unavailable: ${err.message}`);
    }
    setLoading(false);
  };

  const handleCompare = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.compareSatellitePeriods(
        projectId,
        baselineDateFrom,
        baselineDateTo,
        currentDateFrom,
        currentDateTo,
        maxCloud
      );
      if (data) {
        setComparison(data);
      } else {
        setError('Unable to perform comparison');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const getVegetationColor = (status) => {
    switch (status) {
      case 'VEGETATION_GAIN':
      case 'VEGETATION_LOSS':
        return status === 'VEGETATION_LOSS' ? 'var(--color-rose)' : 'var(--color-emerald)';
      case 'STABLE':
        return 'var(--color-amber)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getVegetationIcon = (status) => {
    switch (status) {
      case 'VEGETATION_LOSS':
        return <TrendingDown size={14} />;
      case 'VEGETATION_GAIN':
        return <TrendingUp size={14} />;
      default:
        return <Minus size={14} />;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Satellite size={16} color="var(--color-cyan)" />
          <div>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                margin: 0,
              }}
            >
              Sentinel-2 Satellite Monitoring
            </h3>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>
              Real-time NDVI analysis via Copernicus Data Space
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--color-cyan)',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          REAL SATELLITE DATA
        </span>
      </div>

      {/* Date Range Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 80px',
          gap: '8px',
          fontSize: '11px',
        }}
      >
        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: 600 }}>
            FROM
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: 600 }}>
            TO
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: 600 }}>
            CLOUD %
          </label>
          <input
            type="number"
            value={maxCloud}
            onChange={(e) => setMaxCloud(Number(e.target.value))}
            min={0}
            max={100}
            style={{
              width: '100%',
              padding: '5px 8px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        <button
          onClick={handleSearchScenes}
          disabled={loading}
          style={{
            padding: '7px 10px',
            fontSize: '10px',
            fontWeight: 600,
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid var(--border-accent)',
            color: 'var(--color-cyan)',
            borderRadius: 'var(--radius-xs)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
          Search Scenes
        </button>

        <button
          onClick={handleCalculateNDVI}
          disabled={loading}
          style={{
            padding: '7px 10px',
            fontSize: '10px',
            fontWeight: 600,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--border-emerald)',
            color: 'var(--color-emerald)',
            borderRadius: 'var(--radius-xs)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <BarChart3 size={12} />}
          Calculate NDVI
        </button>

        <button
          onClick={handleCompare}
          disabled={loading}
          style={{
            padding: '7px 10px',
            fontSize: '10px',
            fontWeight: 600,
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--color-amber)',
            borderRadius: 'var(--radius-xs)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Compare Periods
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--color-rose)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {['ndvi', 'scenes', 'comparison', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '5px 10px',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              backgroundColor:
                activeTab === tab ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: activeTab === tab ? '1px solid var(--border-accent)' : '1px solid transparent',
              color: activeTab === tab ? 'var(--color-cyan)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
            }}
          >
            {tab === 'ndvi' && <BarChart3 size={10} style={{ marginRight: '4px' }} />}
            {tab === 'scenes' && <Satellite size={10} style={{ marginRight: '4px' }} />}
            {tab === 'comparison' && <RefreshCw size={10} style={{ marginRight: '4px' }} />}
            {tab === 'history' && <Calendar size={10} style={{ marginRight: '4px' }} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '120px' }}>
        {/* NDVI Tab */}
        {activeTab === 'ndvi' && ndviData && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              {[
                { label: 'MEAN NDVI', value: ndviData.ndvi?.mean?.toFixed(4), color: 'var(--color-cyan)' },
                { label: 'MIN NDVI', value: ndviData.ndvi?.min?.toFixed(4), color: 'var(--color-amber)' },
                { label: 'MAX NDVI', value: ndviData.ndvi?.max?.toFixed(4), color: 'var(--color-emerald)' },
                { label: 'STD DEV', value: ndviData.ndvi?.std?.toFixed(4), color: 'var(--text-muted)' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '8px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: stat.color,
                    }}
                  >
                    {stat.value || '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Vegetation Status */}
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getVegetationIcon(ndviData.vegetation_status)}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: getVegetationColor(ndviData.vegetation_status),
                  }}
                >
                  {ndviData.vegetation_status}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Coverage: {ndviData.coverage?.coverage_pct}%
              </span>
            </div>
          </div>
        )}

        {activeTab === 'ndvi' && !ndviData && (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '11px',
            }}
          >
            <BarChart3 size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            Select a date range and click "Calculate NDVI" to view vegetation index data
          </div>
        )}

        {/* Scenes Tab */}
        {activeTab === 'scenes' && scenes && (
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {scenes.scene_count} Sentinel-2 L2A scenes found
            </div>
            {scenes.scenes?.slice(0, 5).map((scene, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '4px',
                  fontSize: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                    {scene.scene_id}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    {scene.acquisition_date} · {scene.source}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Cloud size={10} />
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-amber)' }}>
                      {scene.cloud_cover_pct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scenes' && !scenes && (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '11px',
            }}
          >
            <Satellite size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            Click "Search Scenes" to find available Sentinel-2 imagery
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && comparison && (
          <div>
            {/* Comparison Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              {/* Baseline */}
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  BASELINE NDVI
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: 'var(--color-emerald)',
                  }}
                >
                  {comparison.comparison?.baseline_ndvi?.toFixed(4)}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {comparison.comparison?.baseline_date}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>→</div>

              {/* Current */}
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  CURRENT NDVI
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: 'var(--color-cyan)',
                  }}
                >
                  {comparison.comparison?.current_ndvi?.toFixed(4)}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {comparison.comparison?.current_date}
                </div>
              </div>
            </div>

            {/* Change Summary */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getVegetationIcon(comparison.comparison?.vegetation_change)}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: getVegetationColor(comparison.comparison?.vegetation_change),
                    }}
                  >
                    {comparison.comparison?.vegetation_change}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>NDVI Δ</span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color:
                        comparison.comparison?.ndvi_change < 0
                          ? 'var(--color-rose)'
                          : 'var(--color-emerald)',
                    }}
                  >
                    {comparison.comparison?.ndvi_change > 0 ? '+' : ''}
                    {comparison.comparison?.ndvi_change?.toFixed(4)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  Confidence: {comparison.comparison?.confidence}%
                </span>
                {comparison.change_event_created && (
                  <span
                    style={{
                      color: 'var(--color-rose)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertTriangle size={10} />
                    ChangeEvent Created
                  </span>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                fontSize: '9px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
              }}
            >
              <Info size={12} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                This NDVI analysis indicates area-level vegetation change. It does NOT confirm
                individual tree-level activity or deforestation. Field verification is required
                for definitive conclusions.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && !comparison && (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '11px',
            }}
          >
            <RefreshCw size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            Click "Compare Periods" to analyze vegetation change between baseline and current dates
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            {history && history.scenes?.length > 0 ? (
              history.scenes.map((scene) => (
                <div
                  key={scene.id}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '4px',
                    fontSize: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                      {scene.scene_id}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{scene.source}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      NDVI: <strong style={{ color: 'var(--color-emerald)' }}>{scene.ndvi_mean?.toFixed(4)}</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Created: {scene.created_at?.split('T')[0]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                }}
              >
                <Calendar size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                No satellite history yet. Perform NDVI calculations to build history.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

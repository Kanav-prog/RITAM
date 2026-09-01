// RITAM Spatial Environmental Intelligence - Comprehensive Master Dataset with High-Precision Micro Trees

export const PLATFORM_INFO = {
  name: 'RITAM',
  fullName: 'Real-time Intelligence & Terrestrial Afforestation Monitoring',
  version: '2.4.0-PRO',
  constellation: 'Sentinel-2 L2A · PlanetScope 3m Ortho · High-Res Microplot Drone Array',
  engineStatus: 'ONLINE · EPSG:4326 WGS84 · SPATIAL POSTGIS 16',
  lastUpdated: '30 Aug 2026, 18:45 IST'
};

export const STATS = {
  totalProjects: 8,
  monitoredAreaHa: '2,480',
  totalEcozoneHa: '4,860',
  netEcozoneExpansionHa: '+248',
  ecozoneGrowthPct: '+5.4%',
  activeProjects: 7,
  vegetationLossHa: '364',
  restorationHa: '512',
  avgSurvivalRate: '89.4%',
  ecozoneHealthIndexAvg: '0.86 (Very High Regeneration)',
  targetTrees: '138,200',
  plantedTrees: '123,200',
  verifiedTrees: '114,940',
  survivingTrees: '102,750',
  complianceScoreAvg: '91.2% (Grade A)',
  activeAlertsCount: 3,
  lastUpdated: '30 Aug 2026',
  sensorStatus: 'NOMINAL · SENTINEL-2 & HIGH-RES SUB-METER ACTIVE'
};

// Generates high-density precision tree coordinates around a base coordinate
const generateTreeGrid = (baseLat, baseLng, count, speciesList, prefix, projectId, projectName) => {
  const trees = [];
  const spacing = 0.0008; // ~80 meters precision spacing
  const cols = 5;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const jitterLat = (Math.sin(i * 1.7) * 0.00015);
    const jitterLng = (Math.cos(i * 2.3) * 0.00015);
    const lat = baseLat + (row * spacing) + jitterLat;
    const lng = baseLng + (col * spacing) + jitterLng;
    const species = speciesList[i % speciesList.length];
    const isAtRisk = i % 8 === 0;

    trees.push({
      tag: `${prefix}-${7700 + i}`,
      projectId,
      projectName,
      species,
      coords: [Number(lat.toFixed(6)), Number(lng.toFixed(6))],
      heightM: (2.4 + (i % 5) * 0.5).toFixed(1),
      girthCm: (14 + (i % 6) * 3.2).toFixed(1),
      healthStatus: isAtRisk ? 'AT_RISK' : 'HEALTHY',
      healthVariant: isAtRisk ? 'amber' : 'emerald',
      lastVerified: '24 Aug 2026',
      plantedDate: '12 May 2025',
      sha256Proof: `${Math.abs(Math.sin(i * 100)).toString(16).substring(2, 10)}${Math.abs(Math.cos(i * 200)).toString(16).substring(2, 18)}fe79a029`
    });
  }
  return trees;
};

export const PROJECTS = [
  {
    id: 'proj-01',
    name: 'Delhi–Meerut RRTS Corridor',
    location: 'Uttar Pradesh',
    state: 'Uttar Pradesh',
    type: 'Linear Infrastructure',
    area: '1,240 ha',
    areaNum: 1240,
    status: 'MONITORING ACTIVE',
    statusVariant: 'emerald',
    vegetationChange: '-12.4 ha',
    vegChangeNum: -12.4,
    center: [28.75, 77.58],
    zoom: 12,
    microCenter: [28.665, 77.584],
    microZoom: 16,
    baselineTrees: 14200,
    targetTrees: 42000,
    plantedTrees: 38400,
    verifiedTrees: 36120,
    survivingTrees: 32800,
    survivalRate: '90.8%',
    complianceScore: 'A (Compliant)',
    agency: 'National Capital Region Transport Corp (NCRTC)',
    startDate: 'Jan 2024',
    completionTarget: 'Dec 2027',
    
    // Ecozone & Biodiversity Verification
    ecozoneName: 'Upper Hindon Riparian Eco-corridor',
    ecozoneBaselineHa: 1420,
    ecozoneCurrentHa: 1512,
    ecozoneDeltaHa: '+92 ha',
    ecozoneDeltaPct: '+6.5%',
    ecozoneStatus: 'EXPANDING',
    ecozoneStatusVariant: 'emerald',
    ecozoneHealthIndex: '0.86 (Very High)',
    biodiversityConnectivity: 'High (Continuous Canopy Link)',
    ecozoneBoundary: [
      [28.88, 77.42],
      [28.84, 77.68],
      [28.64, 77.74],
      [28.58, 77.50],
      [28.69, 77.38]
    ],

    // High Precision Survey Boundary
    boundary: [
      [28.84, 77.48],
      [28.79, 77.62],
      [28.68, 77.68],
      [28.62, 77.54],
      [28.71, 77.44]
    ],
    boundaryCorners: [
      { label: 'CP-01', coords: [28.84, 77.48], desc: 'Northern Cadastral Anchor' },
      { label: 'CP-02', coords: [28.79, 77.62], desc: 'Muradnagar Station Right-of-Way' },
      { label: 'CP-03', coords: [28.68, 77.68], desc: 'Modinagar Eco-Buffer Peg' },
      { label: 'CP-04', coords: [28.62, 77.54], desc: 'Duhai Depot Corner Peg' },
      { label: 'CP-05', coords: [28.71, 77.44], desc: 'Western Embankment Marker' }
    ],
    vegetationZones: [
      {
        name: 'Modinagar North Green Belt',
        coords: [[28.78, 77.55], [28.82, 77.58], [28.80, 77.62], [28.76, 77.59]],
        health: 'Dense Canopy',
        densityPct: 82
      }
    ],
    changeZones: [
      {
        id: 'cz-01',
        name: 'Right-of-Way km 34 Tree Clearance',
        coords: [[28.72, 77.52], [28.74, 77.54], [28.73, 77.56], [28.71, 77.54]],
        type: 'LOSS',
        delta: '-2.1 ha',
        confidence: '96.2%'
      }
    ],
    plantationZones: [
      {
        id: 'pz-01',
        name: 'Sector 4B Compensatory Strip (High Density)',
        coords: [[28.660, 77.580], [28.672, 77.580], [28.672, 77.592], [28.660, 77.592]],
        planted: 6400,
        species: 'Neem, Peepal, Shisham',
        delta: '+4.2 ha'
      }
    ],
    // 25 Exact Microplot Trees with Individual Geotags
    microTrees: generateTreeGrid(
      28.662, 
      77.582, 
      25, 
      ['Azadirachta indica (Neem)', 'Ficus religiosa (Peepal)', 'Dalbergia sissoo (Shisham)'],
      'RITAM-UP',
      'proj-01',
      'Delhi–Meerut RRTS Corridor'
    )
  },
  {
    id: 'proj-02',
    name: 'Bhadla Ultra Mega Solar Park',
    location: 'Bhadla, Rajasthan',
    state: 'Rajasthan',
    type: 'Renewable Energy',
    area: '680 ha',
    areaNum: 680,
    status: 'BASELINE APPROVED',
    statusVariant: 'cyan',
    vegetationChange: '+4.2 ha',
    vegChangeNum: 4.2,
    center: [27.53, 71.91],
    zoom: 12,
    microCenter: [27.514, 71.884],
    microZoom: 16,
    baselineTrees: 3400,
    targetTrees: 10200,
    plantedTrees: 8800,
    verifiedTrees: 8200,
    survivingTrees: 7650,
    survivalRate: '93.2%',
    complianceScore: 'A+ (Exceeding)',
    agency: 'Rajasthan Renewable Energy Corp (RRECL)',
    startDate: 'Mar 2024',
    completionTarget: 'Oct 2026',
    
    ecozoneName: 'Thar Desert Fringe Agro-Eco Buffer',
    ecozoneBaselineHa: 720,
    ecozoneCurrentHa: 758,
    ecozoneDeltaHa: '+38 ha',
    ecozoneDeltaPct: '+5.2%',
    ecozoneStatus: 'EXPANDING',
    ecozoneStatusVariant: 'emerald',
    ecozoneHealthIndex: '0.78 (Moderate)',
    biodiversityConnectivity: 'Medium (Windbreak Grid Active)',
    ecozoneBoundary: [
      [27.60, 71.82],
      [27.59, 72.02],
      [27.45, 71.99],
      [27.46, 71.83]
    ],

    boundary: [
      [27.57, 71.86],
      [27.56, 71.97],
      [27.49, 71.95],
      [27.50, 71.87]
    ],
    boundaryCorners: [
      { label: 'SP-01', coords: [27.57, 71.86], desc: 'North-West Solar Array Boundary' },
      { label: 'SP-02', coords: [27.56, 71.97], desc: 'North-East Substation Peg' },
      { label: 'SP-03', coords: [27.49, 71.95], desc: 'South-East Desert Buffer' },
      { label: 'SP-04', coords: [27.50, 71.87], desc: 'South-West Agro-Shelterbelt Anchor' }
    ],
    vegetationZones: [
      {
        name: 'Arid Shelterbelt Perimeter',
        coords: [[27.55, 71.88], [27.56, 71.94], [27.54, 71.95], [27.53, 71.89]],
        health: 'Shrubland / Native Acacia',
        densityPct: 48
      }
    ],
    changeZones: [],
    plantationZones: [
      {
        id: 'pz-02',
        name: 'Perimeter Windbreak Zone 1',
        coords: [[27.510, 71.880], [27.522, 71.880], [27.522, 71.892], [27.510, 71.892]],
        planted: 3200,
        species: 'Khejri, Rohida',
        delta: '+3.1 ha'
      }
    ],
    microTrees: generateTreeGrid(
      27.512, 
      71.882, 
      20, 
      ['Prosopis cineraria (Khejri)', 'Tecomella undulata (Rohida)'],
      'RITAM-RJ',
      'proj-02',
      'Bhadla Ultra Mega Solar Park'
    )
  },
  {
    id: 'proj-03',
    name: 'NH-46 Highway Corridor Expansion',
    location: 'Bhopal–Hoshangabad, MP',
    state: 'Madhya Pradesh',
    type: 'Highways & Transport',
    area: '560 ha',
    areaNum: 560,
    status: 'ACTION REQUIRED',
    statusVariant: 'amber',
    vegetationChange: '-2.1 ha',
    vegChangeNum: -2.1,
    center: [23.25, 77.41],
    zoom: 12,
    microCenter: [23.258, 77.412],
    microZoom: 16,
    baselineTrees: 8900,
    targetTrees: 26000,
    plantedTrees: 18000,
    verifiedTrees: 14200,
    survivingTrees: 9940,
    survivalRate: '70.0%',
    complianceScore: 'C (At Risk)',
    agency: 'National Highways Authority of India (NHAI)',
    startDate: 'Jul 2023',
    completionTarget: 'Jun 2026',
    
    ecozoneName: 'Vindhya Deciduous Wildlife Corridor',
    ecozoneBaselineHa: 680,
    ecozoneCurrentHa: 642,
    ecozoneDeltaHa: '-38 ha',
    ecozoneDeltaPct: '-5.6%',
    ecozoneStatus: 'FRAGMENTED / AT RISK',
    ecozoneStatusVariant: 'rose',
    ecozoneHealthIndex: '0.62 (Degrading)',
    biodiversityConnectivity: 'Severed at Km 118',
    ecozoneBoundary: [
      [23.35, 77.30],
      [23.33, 77.53],
      [23.16, 77.50],
      [23.18, 77.28]
    ],

    boundary: [
      [23.31, 77.35],
      [23.29, 77.48],
      [23.20, 77.46],
      [23.22, 77.33]
    ],
    boundaryCorners: [
      { label: 'HW-01', coords: [23.31, 77.35], desc: 'Km 110 Northern Highway Peg' },
      { label: 'HW-02', coords: [23.29, 77.48], desc: 'East Forest Underpass Marker' },
      { label: 'HW-03', coords: [23.20, 77.46], desc: 'Km 125 Toll Plaza Survey Node' },
      { label: 'HW-04', coords: [23.22, 77.33], desc: 'Wildlife Overpass Zone Anchor' }
    ],
    vegetationZones: [],
    changeZones: [
      {
        id: 'cz-03',
        name: 'Forest Corridor Km 118 Thinning',
        coords: [[23.26, 77.38], [23.28, 77.42], [23.27, 77.44], [23.25, 77.40]],
        type: 'LOSS',
        delta: '-2.1 ha',
        confidence: '91.8%'
      }
    ],
    plantationZones: [],
    microTrees: generateTreeGrid(
      23.254, 
      77.408, 
      15, 
      ['Dalbergia sissoo (Shisham)', 'Terminalia arjuna (Arjun)'],
      'RITAM-MP',
      'proj-03',
      'NH-46 Highway Corridor Expansion'
    )
  },
  {
    id: 'proj-04',
    name: 'Western Ghats Agro-Reforestation',
    location: 'Uttara Kannada, Karnataka',
    state: 'Karnataka',
    type: 'Ecological Restoration',
    area: '420 ha',
    areaNum: 420,
    status: 'MONITORING ACTIVE',
    statusVariant: 'emerald',
    vegetationChange: '+18.6 ha',
    vegChangeNum: 18.6,
    center: [14.15, 74.85],
    zoom: 12,
    microCenter: [14.152, 74.851],
    microZoom: 16,
    baselineTrees: 22000,
    targetTrees: 60000,
    plantedTrees: 58000,
    verifiedTrees: 56500,
    survivingTrees: 53100,
    survivalRate: '94.0%',
    complianceScore: 'A (Compliant)',
    agency: 'Karnataka Forest Ecosystem Management',
    startDate: 'Feb 2023',
    completionTarget: 'Dec 2028',
    
    ecozoneName: 'Sharavathi River Basin Evergreen Ecozone',
    ecozoneBaselineHa: 520,
    ecozoneCurrentHa: 676,
    ecozoneDeltaHa: '+156 ha',
    ecozoneDeltaPct: '+30.0%',
    ecozoneStatus: 'EXPANDING (REGENERATIVE)',
    ecozoneStatusVariant: 'emerald',
    ecozoneHealthIndex: '0.94 (Optimal)',
    biodiversityConnectivity: 'Pristine (Endemic Species Thriving)',
    ecozoneBoundary: [
      [14.25, 74.74],
      [14.23, 74.97],
      [14.05, 74.94],
      [14.07, 74.72]
    ],

    boundary: [
      [14.20, 74.80],
      [14.19, 74.91],
      [14.10, 74.89],
      [14.12, 74.79]
    ],
    boundaryCorners: [
      { label: 'WG-01', coords: [14.20, 74.80], desc: 'Ghat Ridge Survey Marker' },
      { label: 'WG-02', coords: [14.19, 74.91], desc: 'River Catchment Basin Anchor' },
      { label: 'WG-03', coords: [14.10, 74.89], desc: 'Evergreen Canopy Core Peg' },
      { label: 'WG-04', coords: [14.12, 74.79], desc: 'Western Buffer Demarcation' }
    ],
    vegetationZones: [
      {
        name: 'Riparian Buffer Zone',
        coords: [[14.16, 74.83], [14.18, 74.87], [14.15, 74.89], [14.13, 74.85]],
        health: 'Dense Evergreen',
        densityPct: 91
      }
    ],
    changeZones: [],
    plantationZones: [
      {
        id: 'pz-04',
        name: 'Native Canopy Infill Tier 2',
        coords: [[14.140, 74.820], [14.165, 74.820], [14.165, 74.845], [14.140, 74.845]],
        planted: 15400,
        species: 'Teak, Rosewood, Bamboo',
        delta: '+12.4 ha'
      }
    ],
    microTrees: generateTreeGrid(
      14.148, 
      74.830, 
      25, 
      ['Tectona grandis (Teak)', 'Dalbergia latifolia (Rosewood)', 'Bambusa tulda (Bamboo)'],
      'RITAM-KA',
      'proj-04',
      'Western Ghats Agro-Reforestation'
    )
  }
];

export const ALL_MICRO_TREES = PROJECTS.flatMap(p => p.microTrees || []);

export const ENVIRONMENTAL_CHANGES = [
  {
    id: 'ev-01',
    projectId: 'proj-01',
    projectName: 'Delhi–Meerut RRTS Corridor',
    date: '30 Aug',
    year: '2026',
    type: 'ECOZONE_EXPANSION',
    description: 'Post-plantation ecozone expansion verified: +6.4 ha natural canopy growth into adjacent buffer',
    area: '+6.4 ha',
    areaNum: 6.4,
    coords: [28.665, 77.584],
    confidence: '96.4%',
    sensor: 'Sentinel-2 Multispectral (NDVI Δ +0.34 · EHI 0.86)',
    sha256Hash: '9e8b2c41f77d853e34bca012ef84a199859f71c4c8e709a32c66d3a812fbb390',
    verified: true,
    actionNeeded: false,
    severity: 'LOW',
    ndviBefore: 0.42,
    ndviAfter: 0.76
  },
  {
    id: 'ev-02',
    projectId: 'proj-01',
    projectName: 'Delhi–Meerut RRTS Corridor',
    date: '28 Aug',
    year: '2026',
    type: 'LOSS',
    description: 'Vegetation loss detected along Right-of-Way km 34',
    area: '−2.1 ha',
    areaNum: -2.1,
    coords: [28.72, 77.52],
    confidence: '91.8%',
    sensor: 'PlanetScope 3m Orthotile (NDVI Δ -0.42)',
    sha256Hash: '43d567f8a1290e21bc56fa8340d9e81b671a938c0394747b0a8cd4851213ae42',
    verified: false,
    actionNeeded: true,
    severity: 'HIGH',
    ndviBefore: 0.78,
    ndviAfter: 0.36
  },
  {
    id: 'ev-03',
    projectId: 'proj-04',
    projectName: 'Western Ghats Agro-Reforestation',
    date: '25 Aug',
    year: '2026',
    type: 'ECOZONE_EXPANSION',
    description: 'Ecozone buffer accretion: Evergreen canopy connectivity expanded by +14.2 ha post-restoration',
    area: '+14.2 ha',
    areaNum: 14.2,
    coords: [14.152, 74.851],
    confidence: '98.2%',
    sensor: 'Sentinel-2 L2A BOA Reflectance (Canopy Closure 88%)',
    sha256Hash: 'ba839c011e9f4567acbd880912fa89b21319cd8274a12ecb830f1947291a4570',
    verified: true,
    actionNeeded: false,
    severity: 'LOW',
    ndviBefore: 0.61,
    ndviAfter: 0.89
  },
  {
    id: 'ev-04',
    projectId: 'proj-03',
    projectName: 'NH-46 Highway Corridor Expansion',
    date: '22 Aug',
    year: '2026',
    type: 'LOSS',
    description: 'Corridor fragmentation flagged: Deciduous canopy connection degraded in Wildlife Buffer',
    area: '−3.8 ha',
    areaNum: -3.8,
    coords: [23.26, 77.38],
    confidence: '88.5%',
    sensor: 'Sentinel-2 L2A (EVI Anomaly)',
    sha256Hash: '190ba32840cf98a23e8091da3c091f85023947192847aef9302bce014892c901',
    verified: false,
    actionNeeded: true,
    severity: 'CRITICAL',
    ndviBefore: 0.68,
    ndviAfter: 0.29
  },
  {
    id: 'ev-05',
    projectId: 'proj-02',
    projectName: 'Bhadla Ultra Mega Solar Park',
    date: '18 Aug',
    year: '2026',
    type: 'RESTORATION',
    description: 'Ecozone windbreak accretion confirmed (+3.1 ha micro-habitat growth)',
    area: '+3.1 ha',
    areaNum: 3.1,
    coords: [27.514, 71.884],
    confidence: '98.1%',
    sensor: 'PlanetScope + Field Drone Geotag Array',
    sha256Hash: 'c7401a9b402830f9485729183740201847193029481920394857102938471029',
    verified: true,
    actionNeeded: false,
    severity: 'LOW',
    ndviBefore: 0.24,
    ndviAfter: 0.58
  }
];

export const GEOTAGGED_TREES = ALL_MICRO_TREES.slice(0, 15);

export const AUDIT_LOGS = [
  {
    id: 'AUD-8821',
    timestamp: '30 Aug 2026 17:42:10 UTC',
    actor: 'Dr. S. Nair (Chief Ecological Auditor)',
    action: 'CONFIRM_ECOZONE_EXPANSION',
    entity: 'Ecozone Hindon (#01)',
    details: 'Verified +6.4 ha post-plantation buffer expansion using Sentinel-2 L2A BOA raster',
    hash: 'fa82910ba749102847cbe9102938471920394857102938471920394857102938'
  },
  {
    id: 'AUD-8820',
    timestamp: '28 Aug 2026 14:15:33 UTC',
    actor: 'System Sentinel Pipeline (Daemon)',
    action: 'FLAG_CHANGE_EVENT',
    entity: 'Project Delhi-Meerut (#01)',
    details: 'Detected NDVI drop -0.42 at km 34 Right-of-Way. Spawned mitigation inspection dispatch',
    hash: '43d567f8a1290e21bc56fa8340d9e81b671a938c0394747b0a8cd4851213ae42'
  },
  {
    id: 'AUD-8819',
    timestamp: '25 Aug 2026 09:20:01 UTC',
    actor: 'R. Sharma (Field Officer Lead)',
    action: 'BATCH_VERIFY_TREES',
    entity: 'Western Ghats Sector 2',
    details: 'Uploaded 420 geotagged tree health verification records with SHA-256 image hashes',
    hash: '9901827461928374019283740192837401928374019283740192837401928374'
  },
  {
    id: 'AUD-8818',
    timestamp: '15 Jan 2026 11:00:00 UTC',
    actor: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    action: 'LOCK_BASELINE_SNAPSHOT',
    entity: 'Project Delhi-Meerut (#01)',
    details: 'Immutable baseline locked at 14,200 initial trees and 1,420 ha ecozone footprint',
    hash: '0019283746102938475619283740192837401928374019283740192837401928'
  }
];

export const AI_SUGGESTIONS = [
  'Show all projects where post-plantation ecozone expansion is greater than +5%',
  'What is the current compensatory tree survival rate in Delhi–Meerut RRTS Corridor?',
  'List recent vegetation loss alerts requiring immediate field inspection',
  'Compare baseline canopy density vs current canopy for Western Ghats Afforestation'
];

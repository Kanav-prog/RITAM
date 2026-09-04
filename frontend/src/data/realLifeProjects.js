// Real-Life Indian Infrastructure & Mining Environmental Compliance Projects

export const REAL_LIFE_PROJECTS = [
  {
    id: 'proj-talcher-01',
    name: 'Talcher Coalfield & Buffer Forest Rehabilitation AOI',
    authority: 'Mahanadi Coalfields Ltd & Odisha State Forest Dept',
    state: 'Odisha',
    district: 'Angul',
    status: 'MONITORING ACTIVE',
    complianceScore: 92.4,
    area_hectares: 342.8,
    area: '342.8 ha',
    category: 'Mining & Forest Reclamation',
    center: [20.9500, 85.2167],
    zoom: 14,
    boundary: [
      [20.9620, 85.2050],
      [20.9650, 85.2300],
      [20.9400, 85.2350],
      [20.9350, 85.2100],
      [20.9620, 85.2050]
    ],
    // Project Specific Satellite Detected Change Events
    changeEvents: [
      {
        id: 'tal-chg-01',
        sector: 'North-West Quarry Overburden (Sector 4B)',
        date: '14 Feb 2026',
        magnitudePct: -34.8,
        lossAreaHa: 14.2,
        confidence: 96.4,
        severity: 'CRITICAL',
        type: 'Canopy Loss / Clearing',
        coords: [20.9550, 85.2200],
        status: 'ACTION_REQUIRED',
        mandateRatio: '1:3 REPLACEMENT RATIO',
        mandateSaplings: 17750,
        notes: 'Heavy earth-moving expansion breached northern buffer boundary; mandatory compensatory planting triggered.'
      },
      {
        id: 'tal-chg-02',
        sector: 'Brahmani River Eastern Buffer Belt (Sector 2)',
        date: '28 Jan 2026',
        magnitudePct: -18.2,
        lossAreaHa: 6.8,
        confidence: 91.0,
        severity: 'MODERATE',
        type: 'Vegetation Thinning',
        coords: [20.9480, 85.2280],
        status: 'UNDER_REVIEW',
        mandateRatio: '1:2 ENRICHMENT RATIO',
        mandateSaplings: 8500,
        notes: 'Sediment dust accumulation and water table depletion causing crown thinning in riparian buffer.'
      },
      {
        id: 'tal-chg-03',
        sector: 'South Haul Road Forest Edge (Sector 1A)',
        date: '12 Jan 2026',
        magnitudePct: -6.4,
        lossAreaHa: 2.1,
        confidence: 88.5,
        severity: 'LOW',
        type: 'Seasonal Fluctuation',
        coords: [20.9380, 85.2150],
        status: 'RESOLVED',
        mandateRatio: 'MONITORING ONLY',
        mandateSaplings: 0,
        notes: 'Natural winter deciduous leaf drop confirmed by ground truth sensor; no violation.'
      }
    ],
    // Project Specific Field Evidence & SHA-256 Ledger
    fieldEvidence: [
      {
        tag: 'RTM-TAL-OD-0891',
        species: 'Sal (Shorea robusta)',
        heightCm: 158,
        health: 'HEALTHY',
        coords: [20.9512, 85.2185],
        inspector: 'Officer S. Mohanty (Range 4, Angul)',
        date: '18 Feb 2026',
        photoSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        rfidSealed: true,
        crownHealthNote: 'Vigorous taproot anchoring; zero termite infestation.'
      },
      {
        tag: 'RTM-TAL-OD-0892',
        species: 'Teak (Tectona grandis)',
        heightCm: 142,
        health: 'HEALTHY',
        coords: [20.9520, 85.2195],
        inspector: 'Officer S. Mohanty (Range 4, Angul)',
        date: '18 Feb 2026',
        photoSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        rfidSealed: true,
        crownHealthNote: 'Broadleaf canopy healthy; sub-surface soil moisture 28%.'
      },
      {
        tag: 'RTM-TAL-OD-0893',
        species: 'Neem (Azadirachta indica)',
        heightCm: 110,
        health: 'AT_RISK',
        coords: [20.9528, 85.2205],
        inspector: 'Field Ranger B. Patnaik',
        date: '16 Feb 2026',
        photoSha256: 'cbf529a4d5d497042d36780f4e064053f0a4d93a44394ac0bbe85adb3eca80f7',
        rfidSealed: true,
        crownHealthNote: 'Termite root attack flagged; organic bio-pesticide treatment scheduled.'
      },
      {
        tag: 'RTM-TAL-OD-0894',
        species: 'Mahua (Madhuca longifolia)',
        heightCm: 135,
        health: 'HEALTHY',
        coords: [20.9535, 85.2215],
        inspector: 'Field Ranger B. Patnaik',
        date: '14 Feb 2026',
        photoSha256: 'd41d8cd98f00b204e9800998ecf8427e996fb92427ae41e4649b934ca495991b',
        rfidSealed: true,
        crownHealthNote: 'Thriving indigenous sapling; full survival certified.'
      }
    ],
    // High-density plantation compartment
    compartment: {
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
    },
    baselineDate: '15 Jan 2026',
    preProjectGreenCover: 82.4,
    targetTrees: 42000,
    plantedTrees: 38420,
    survivalRateOverall: 88.4,
    description: 'Comprehensive post-mining biological reclamation and compensatory afforestation corridor along the Brahmani River catchment buffer in Talcher.'
  },
  {
    id: 'proj-kenbetwa-02',
    name: 'Ken-Betwa River Linkage Compensatory Afforestation',
    authority: 'National Water Development Agency (NWDA) & MP Forest Dept',
    state: 'Madhya Pradesh',
    district: 'Panna & Chhatarpur',
    status: 'COMPLIANCE ACTIVE',
    complianceScore: 96.8,
    area_hectares: 450.0,
    area: '450.0 ha',
    category: 'River Interlinking & Wildlife Buffer',
    center: [24.5800, 80.0500],
    zoom: 14,
    boundary: [
      [24.5950, 80.0350],
      [24.5980, 80.0680],
      [24.5650, 80.0720],
      [24.5600, 80.0380],
      [24.5950, 80.0350]
    ],
    // Project Specific Satellite Detected Change Events
    changeEvents: [
      {
        id: 'kb-chg-01',
        sector: 'Daudhan Dam Submergence Periphery (Zone K-3)',
        date: '08 Feb 2026',
        magnitudePct: -28.5,
        lossAreaHa: 18.5,
        confidence: 97.2,
        severity: 'CRITICAL',
        type: 'Reservoir Submergence Clearing',
        coords: [24.5880, 80.0450],
        status: 'ACTION_REQUIRED',
        mandateRatio: '1:3 COMPENSATORY OFFSET',
        mandateSaplings: 23125,
        notes: 'Pre-monsoon civil canal excavation initiated; compensatory afforestation site Panna-12 tasked.'
      },
      {
        id: 'kb-chg-02',
        sector: 'Panna Tiger Corridor Seasonal Dry Deciduous Zone',
        date: '20 Jan 2026',
        magnitudePct: -12.4,
        lossAreaHa: 9.4,
        confidence: 89.0,
        severity: 'MODERATE',
        type: 'Canopy Stress / Drought',
        coords: [24.5720, 80.0620],
        status: 'UNDER_REVIEW',
        mandateRatio: 'SOIL MOISTURE WORKS',
        mandateSaplings: 4700,
        notes: 'Low soil moisture detected by NDVI band 8A; check-dam construction in progress.'
      },
      {
        id: 'kb-chg-03',
        sector: 'Chhatarpur Ridge Line Linkage Corridor',
        date: '05 Jan 2026',
        magnitudePct: -5.1,
        lossAreaHa: 1.8,
        confidence: 92.0,
        severity: 'LOW',
        type: 'Scrub Disturbance',
        coords: [24.5680, 80.0390],
        status: 'RESOLVED',
        mandateRatio: 'SURVEILLANCE ACTIVE',
        mandateSaplings: 0,
        notes: 'Grassland regeneration on schedule; no illegal tree felling detected.'
      }
    ],
    // Project Specific Field Evidence & SHA-256 Ledger
    fieldEvidence: [
      {
        tag: 'RTM-KB-MP-1041',
        species: 'Kardhai (Anogeissus pendula)',
        heightCm: 165,
        health: 'HEALTHY',
        coords: [24.5815, 80.0520],
        inspector: 'SDO V. K. Sharma (Panna North)',
        date: '22 Feb 2026',
        photoSha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        rfidSealed: true,
        crownHealthNote: 'Native dry deciduous stand; rapid lateral crown expansion.'
      },
      {
        tag: 'RTM-KB-MP-1042',
        species: 'Bamboo (Dendrocalamus strictus)',
        heightCm: 210,
        health: 'HEALTHY',
        coords: [24.5825, 80.0535],
        inspector: 'SDO V. K. Sharma (Panna North)',
        date: '22 Feb 2026',
        photoSha256: 'b4c6e94a8f1e3190d62c65bf0bcda32b57b277d9ad9f146ee3b0c44298fc1c14',
        rfidSealed: true,
        crownHealthNote: 'Clump formation robust; excellent soil erosion prevention.'
      },
      {
        tag: 'RTM-KB-MP-1043',
        species: 'Dhawra (Anogeissus latifolia)',
        heightCm: 95,
        health: 'AT_RISK',
        coords: [24.5835, 80.0550],
        inspector: 'Forest Guard R. Yadav',
        date: '19 Feb 2026',
        photoSha256: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
        rfidSealed: true,
        crownHealthNote: 'Water stress noted near rocky outcrop; drip irrigation line extended.'
      },
      {
        tag: 'RTM-KB-MP-1044',
        species: 'Teak (Tectona grandis)',
        heightCm: 150,
        health: 'HEALTHY',
        coords: [24.5845, 80.0565],
        inspector: 'Forest Guard R. Yadav',
        date: '17 Feb 2026',
        photoSha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        rfidSealed: true,
        crownHealthNote: 'Full stem lignification and healthy crown index.'
      }
    ],
    compartment: {
      id: 'COMP-KB-12',
      name: 'Panna Tiger Reserve Buffer Comp-12 (8.5 ha)',
      speciesDominant: 'Kardhai (Anogeissus pendula) & Bamboo',
      totalPits: 11400,
      livingCount: 9690,
      deadCount: 684,
      stressedCount: 456,
      blankCount: 570,
      survivalRate: 89.2,
      mortalityRate: 10.8,
      center: [24.5815, 80.0520]
    },
    baselineDate: '01 Nov 2025',
    preProjectGreenCover: 76.8,
    targetTrees: 55000,
    plantedTrees: 48900,
    survivalRateOverall: 91.2,
    description: 'Compensatory ecological restoration to counterbalance Daudhan Dam reservoir submergence, reinforcing core corridor biodiversity.'
  },
  {
    id: 'proj-bullettrain-03',
    name: 'Mumbai-Ahmedabad High-Speed Rail Mangrove Offset',
    authority: 'National High Speed Rail Corp (NHSRCL) & Maharashtra Mangrove Cell',
    state: 'Maharashtra',
    district: 'Palghar & Thane',
    status: 'MONITORING ACTIVE',
    complianceScore: 94.5,
    area_hectares: 128.5,
    area: '128.5 ha',
    category: 'Coastal Eco-Restoration',
    center: [19.6967, 72.7699],
    zoom: 14,
    boundary: [
      [19.7080, 72.7580],
      [19.7120, 72.7820],
      [19.6850, 72.7850],
      [19.6820, 72.7600],
      [19.7080, 72.7580]
    ],
    // Project Specific Satellite Detected Change Events
    changeEvents: [
      {
        id: 'mah-chg-01',
        sector: 'Vaitarna Estuary Pier Foundation Mudflat (Zone M-2)',
        date: '18 Feb 2026',
        magnitudePct: -22.6,
        lossAreaHa: 4.5,
        confidence: 95.8,
        severity: 'CRITICAL',
        type: 'Tidal Mudflat Earthwork',
        coords: [19.7020, 72.7650],
        status: 'ACTION_REQUIRED',
        mandateRatio: '5:1 MANGROVE REPLACEMENT',
        mandateSaplings: 22500,
        notes: 'High-speed rail viaduct pier foundations excavated; 5:1 nursery saplings allocated in Vaitarna tidal flats.'
      },
      {
        id: 'mah-chg-02',
        sector: 'Palghar Coastal Salt Pan Border (Zone M-4)',
        date: '02 Feb 2026',
        magnitudePct: -11.2,
        lossAreaHa: 3.2,
        confidence: 90.4,
        severity: 'MODERATE',
        type: 'Sediment Deposition',
        coords: [19.6920, 72.7780],
        status: 'UNDER_REVIEW',
        mandateRatio: 'TIDAL CHANNEL DESILTING',
        mandateSaplings: 6400,
        notes: 'Tidal flow blockage causing pneumatophore root asphyxiation in Avicennia stands.'
      },
      {
        id: 'mah-chg-03',
        sector: 'Thane Creek Buffer Fringe',
        date: '15 Jan 2026',
        magnitudePct: -4.8,
        lossAreaHa: 1.2,
        confidence: 87.0,
        severity: 'LOW',
        type: 'Seasonal Algal Shift',
        coords: [19.6860, 72.7620],
        status: 'RESOLVED',
        mandateRatio: 'SURVEILLANCE ACTIVE',
        mandateSaplings: 0,
        notes: 'Normal post-monsoon algal bloom dissipation; mangrove stands remain healthy.'
      }
    ],
    // Project Specific Field Evidence & SHA-256 Ledger
    fieldEvidence: [
      {
        tag: 'RTM-HSR-MH-0201',
        species: 'Grey Mangrove (Avicennia marina)',
        heightCm: 115,
        health: 'HEALTHY',
        coords: [19.6980, 72.7720],
        inspector: 'Dr. K. Deshmukh (Mangrove Cell)',
        date: '20 Feb 2026',
        photoSha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        rfidSealed: true,
        crownHealthNote: 'Pneumatophore aerial root clusters fully developed.'
      },
      {
        tag: 'RTM-HSR-MH-0202',
        species: 'Red Mangrove (Rhizophora mucronata)',
        heightCm: 128,
        health: 'HEALTHY',
        coords: [19.6990, 72.7735],
        inspector: 'Dr. K. Deshmukh (Mangrove Cell)',
        date: '20 Feb 2026',
        photoSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        rfidSealed: true,
        crownHealthNote: 'Stilt root anchoring confirmed; zero silt blockage.'
      },
      {
        tag: 'RTM-HSR-MH-0203',
        species: 'Avicennia marina (Propagule #203)',
        heightCm: 75,
        health: 'AT_RISK',
        coords: [19.7000, 72.7750],
        inspector: 'RFO A. Sawant',
        date: '17 Feb 2026',
        photoSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        rfidSealed: true,
        crownHealthNote: 'Excessive sedimentation on leaf surfaces; tidal flushing cleared.'
      },
      {
        tag: 'RTM-HSR-MH-0204',
        species: 'Black Mangrove (Bruguiera cylindrica)',
        heightCm: 140,
        health: 'HEALTHY',
        coords: [19.7010, 72.7765],
        inspector: 'RFO A. Sawant',
        date: '15 Feb 2026',
        photoSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        rfidSealed: true,
        crownHealthNote: 'Knee roots healthy and fully adapted to tidal salinity.'
      }
    ],
    compartment: {
      id: 'COMP-MAH-03',
      name: 'Vaitarna Estuary Tidal Mudflat Plot (5.2 ha)',
      speciesDominant: 'Avicennia marina & Rhizophora mucronata',
      totalPits: 7800,
      livingCount: 7176,
      deadCount: 312,
      stressedCount: 156,
      blankCount: 156,
      survivalRate: 94.6,
      mortalityRate: 5.4,
      center: [19.6980, 72.7720]
    },
    baselineDate: '10 Feb 2026',
    preProjectGreenCover: 68.2,
    targetTrees: 25000,
    plantedTrees: 24100,
    survivalRateOverall: 94.6,
    description: '5:1 compensatory mangrove afforestation project neutralizing civil construction impacts across the Vaitarna & Thane creek estuaries.'
  }
];

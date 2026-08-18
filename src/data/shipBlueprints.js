// 3D Rocket & Spacecraft Blueprints, Modular Components and Faction Skins

export const SHIP_CLASSES = {
  'VENTURE_SKIF': {
    id: 'VENTURE_SKIF',
    name: 'Venture-IV Mining Skiff',
    role: 'Asteroid Extraction & Gas Harvesting',
    tier: 'T2 Expedition Frigate',
    basePrice: 850000, // ISD
    iskPrice: '1.01B ISK',
    stats: {
      miningYield: 450, // m3/min
      warpSpeed: 4.5, // AU/s
      cargoCapacity: 5000, // m3
      powerGrid: 120, // MW
      cpuOutput: 180, // tf
      shieldHp: 3200,
      armorHp: 1800,
      hullHp: 2400
    },
    defaultModules: {
      thruster: 'ION_DRIVE_V2',
      mining: 'MODULATED_CORE_LASER',
      shield: 'KINETIC_BARRIER',
      telemetry: 'PYTHON_SEEDED_ENCLAVE_V1'
    },
    geometryConfig: {
      bodyLength: 4.2,
      bodyRadius: 0.9,
      wingSpan: 5.4,
      engineCount: 2,
      turretCount: 2,
      color: 0x00f0ff,
      type: 'mining'
    }
  },

  'HYPERION_X': {
    id: 'HYPERION_X',
    name: 'Hyperion-X Quantum Cruiser',
    role: 'Deep-Space Combat & Security Escort',
    tier: 'T3 Strategic Cruiser',
    basePrice: 3450000, // ISD
    iskPrice: '4.10B ISK',
    stats: {
      miningYield: 120,
      warpSpeed: 6.2,
      cargoCapacity: 1800,
      powerGrid: 480,
      cpuOutput: 520,
      shieldHp: 9500,
      armorHp: 7800,
      hullHp: 6500
    },
    defaultModules: {
      thruster: 'ANTIMATTER_AFTERBURNER',
      mining: 'BASIC_MINING_LASER',
      shield: 'MULTI_SPECTRAL_MATRIX',
      telemetry: 'QUANTUM_VAULT_CORE'
    },
    geometryConfig: {
      bodyLength: 6.8,
      bodyRadius: 1.4,
      wingSpan: 7.2,
      engineCount: 4,
      turretCount: 4,
      color: 0xf5a623,
      type: 'combat'
    }
  },

  'RORQUAL_HEAVY': {
    id: 'RORQUAL_HEAVY',
    name: 'Rorqual-Prime Heavy Harvester',
    role: 'Capital Industrial Command & Refining',
    tier: 'Capital Industrial Vessel',
    basePrice: 18500000, // ISD
    iskPrice: '22.0B ISK',
    stats: {
      miningYield: 2800,
      warpSpeed: 2.1,
      cargoCapacity: 65000,
      powerGrid: 2400,
      cpuOutput: 1850,
      shieldHp: 48000,
      armorHp: 32000,
      hullHp: 42000
    },
    defaultModules: {
      thruster: 'TACHYON_JUMP_CORE',
      mining: 'DARK_MATTER_PLASMA_DRILL',
      shield: 'ADAPTIVE_INVULN_FIELD',
      telemetry: 'QUANTUM_VAULT_CORE'
    },
    geometryConfig: {
      bodyLength: 10.5,
      bodyRadius: 2.8,
      wingSpan: 8.0,
      engineCount: 6,
      turretCount: 6,
      color: 0x10b981,
      type: 'capital'
    }
  },

  'SOLARIS_CARRIER': {
    id: 'SOLARIS_CARRIER',
    name: 'Solaris-VII Orbital Rocket',
    role: 'Multi-Stage Orbital Payload & Satellite Launcher',
    tier: 'Heavy Rocket Carrier',
    basePrice: 5200000, // ISD
    iskPrice: '6.19B ISK',
    stats: {
      miningYield: 300,
      warpSpeed: 5.0,
      cargoCapacity: 12000,
      powerGrid: 850,
      cpuOutput: 720,
      shieldHp: 14000,
      armorHp: 11000,
      hullHp: 15000
    },
    defaultModules: {
      thruster: 'ANTIMATTER_AFTERBURNER',
      mining: 'MODULATED_CORE_LASER',
      shield: 'MULTI_SPECTRAL_MATRIX',
      telemetry: 'PYTHON_SEEDED_ENCLAVE_V1'
    },
    geometryConfig: {
      bodyLength: 8.5,
      bodyRadius: 1.2,
      wingSpan: 4.2,
      engineCount: 3,
      turretCount: 2,
      color: 0xa855f7,
      type: 'rocket'
    }
  }
};

export const FACTION_SKINS = {
  'CALDARI_STEEL': {
    id: 'CALDARI_STEEL',
    name: 'Caldari State Titanium',
    primaryColor: '#00f0ff',
    secondaryColor: '#1e293b',
    glowColor: '#00d2ff',
    threeColor: 0x00f0ff,
    metalness: 0.85,
    roughness: 0.2,
    bonus: '+5% Shield Capacity'
  },
  'AMARR_GOLD': {
    id: 'AMARR_GOLD',
    name: 'Amarr Imperial Solar Gold',
    primaryColor: '#ffd700',
    secondaryColor: '#3a0808',
    glowColor: '#ffaa00',
    threeColor: 0xffd700,
    metalness: 0.95,
    roughness: 0.15,
    bonus: '+5% Armor Hardness'
  },
  'MINMATAR_RUST': {
    id: 'MINMATAR_RUST',
    name: 'Minmatar Plasma Rust Vanguard',
    primaryColor: '#ff5722',
    secondaryColor: '#18181b',
    glowColor: '#ff3d00',
    threeColor: 0xff5722,
    metalness: 0.6,
    roughness: 0.45,
    bonus: '+10% Warp Speed'
  },
  'GALLENTE_EMERALD': {
    id: 'GALLENTE_EMERALD',
    name: 'Gallente Federation Emerald',
    primaryColor: '#10b981',
    secondaryColor: '#064e3b',
    glowColor: '#00e676',
    threeColor: 0x10b981,
    metalness: 0.75,
    roughness: 0.25,
    bonus: '+8% Drone & Mining Yield'
  },
  'VOID_BLACK': {
    id: 'VOID_BLACK',
    name: 'Void Stealth Obsidian',
    primaryColor: '#a855f7',
    secondaryColor: '#050508',
    glowColor: '#c084fc',
    threeColor: 0x8b5cf6,
    metalness: 0.9,
    roughness: 0.1,
    bonus: '-15% Sensor Signature'
  }
};

export const SHIP_MODULES = {
  thruster: {
    'ION_DRIVE_V2': {
      id: 'ION_DRIVE_V2',
      name: 'Ion Propulsion Drive v2',
      price: 45000,
      stats: { warpBonus: '+0.5 AU/s', powerReq: '25 MW', cpuReq: '30 tf' }
    },
    'ANTIMATTER_AFTERBURNER': {
      id: 'ANTIMATTER_AFTERBURNER',
      name: 'Antimatter Hyper-Afterburner',
      price: 180000,
      stats: { warpBonus: '+1.8 AU/s', powerReq: '60 MW', cpuReq: '55 tf' }
    },
    'TACHYON_JUMP_CORE': {
      id: 'TACHYON_JUMP_CORE',
      name: 'Tachyon Graviton Jump Core',
      price: 650000,
      stats: { warpBonus: '+3.2 AU/s', powerReq: '140 MW', cpuReq: '110 tf' }
    }
  },

  mining: {
    'BASIC_MINING_LASER': {
      id: 'BASIC_MINING_LASER',
      name: 'Basic Strip Miner I',
      price: 30000,
      stats: { yieldBonus: '+150 m3/min', powerReq: '20 MW', cpuReq: '25 tf' }
    },
    'MODULATED_CORE_LASER': {
      id: 'MODULATED_CORE_LASER',
      name: 'Modulated Deep-Core Laser II',
      price: 240000,
      stats: { yieldBonus: '+480 m3/min', powerReq: '75 MW', cpuReq: '65 tf' }
    },
    'DARK_MATTER_PLASMA_DRILL': {
      id: 'DARK_MATTER_PLASMA_DRILL',
      name: 'Dark Matter Resonance Plasma Drill',
      price: 1200000,
      stats: { yieldBonus: '+1600 m3/min', powerReq: '220 MW', cpuReq: '180 tf' }
    }
  },

  shield: {
    'KINETIC_BARRIER': {
      id: 'KINETIC_BARRIER',
      name: 'Kinetic Shield Barrier Mk3',
      price: 55000,
      stats: { shieldBonus: '+1200 HP', powerReq: '35 MW', cpuReq: '40 tf' }
    },
    'MULTI_SPECTRAL_MATRIX': {
      id: 'MULTI_SPECTRAL_MATRIX',
      name: 'Multi-Spectral Shield Matrix',
      price: 320000,
      stats: { shieldBonus: '+4500 HP', powerReq: '90 MW', cpuReq: '85 tf' }
    },
    'ADAPTIVE_INVULN_FIELD': {
      id: 'ADAPTIVE_INVULN_FIELD',
      name: 'Adaptive Invulnerability Field',
      price: 1450000,
      stats: { shieldBonus: '+18000 HP', powerReq: '310 MW', cpuReq: '240 tf' }
    }
  },

  telemetry: {
    'PYTHON_SEEDED_ENCLAVE_V1': {
      id: 'PYTHON_SEEDED_ENCLAVE_V1',
      name: 'Python Seeded Telemetry Enclave v1',
      price: 95000,
      stats: { telemetryBonus: 'Deterministic PRNG Stream', cpuReq: '45 tf' }
    },
    'QUANTUM_VAULT_CORE': {
      id: 'QUANTUM_VAULT_CORE',
      name: 'Quantum Seeded Secrets Vault Core',
      price: 480000,
      stats: { telemetryBonus: '256-bit Hardware HSM + Auto-Arbitrage', cpuReq: '95 tf' }
    }
  }
};

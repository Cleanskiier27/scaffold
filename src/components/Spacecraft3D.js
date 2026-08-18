// 3D Spacecraft & Rocket Fleet Configurator & Marketplace (Three.js)

import * as THREE from 'three';
import { SHIP_CLASSES, FACTION_SKINS, SHIP_MODULES } from '../data/shipBlueprints';
import { sfx } from '../audio/sfx';

export class Spacecraft3D {
  constructor(container, state, onShipPurchased, showToast) {
    this.container = container;
    this.state = state;
    this.onShipPurchased = onShipPurchased;
    this.showToast = showToast;

    this.selectedShipId = 'VENTURE_SKIF';
    this.selectedSkinId = 'CALDARI_STEEL';
    this.viewMode = 'solid'; // 'solid', 'wireframe', 'exploded'
    this.isRotating = true;

    this.currentModules = {
      thruster: 'ION_DRIVE_V2',
      mining: 'MODULATED_CORE_LASER',
      shield: 'KINETIC_BARRIER',
      telemetry: 'PYTHON_SEEDED_ENCLAVE_V1'
    };

    // Three.js State
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.shipGroup = null;
    this.moduleMeshes = {};
    this.particles = null;
    this.animFrameId = null;

    // Mouse Interaction
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
  }

  render() {
    const ship = SHIP_CLASSES[this.selectedShipId];

    this.container.innerHTML = `
      <div class="view-container">
        <div class="shipyard-layout">
          
          <!-- LEFT: 3D Viewport & HUD Overlays -->
          <div class="viewport-container">
            <div id="three-canvas-holder" style="width:100%; height:100%;"></div>

            <!-- Top HUD Viewport Controls -->
            <div class="viewport-hud-top">
              <div class="viewport-tag-group">
                <button class="viewport-btn ${this.viewMode === 'solid' ? 'active' : ''}" data-mode="solid">
                  STANDARD PBR
                </button>
                <button class="viewport-btn ${this.viewMode === 'wireframe' ? 'active' : ''}" data-mode="wireframe">
                  TACTICAL WIREFRAME
                </button>
                <button class="viewport-btn ${this.viewMode === 'exploded' ? 'active' : ''}" data-mode="exploded">
                  EXPLODED VIEW
                </button>
              </div>

              <div class="viewport-tag-group">
                <button class="viewport-btn ${this.isRotating ? 'active' : ''}" id="btn-toggle-spin">
                  AUTO-ORBIT: ${this.isRotating ? 'ON' : 'OFF'}
                </button>
                <button class="viewport-btn" id="btn-reset-cam">
                  RESET CAM
                </button>
              </div>
            </div>

            <!-- Bottom HUD Specs Overlay -->
            <div class="viewport-hud-bottom">
              <div class="wireframe-target-box">
                <div style="color:var(--cyan); font-weight:700;">HULL: ${ship.name}</div>
                <div style="color:#94a3b8;">FACTION: ${FACTION_SKINS[this.selectedSkinId].name}</div>
                <div style="color:var(--gold);">DRIVE: ${SHIP_MODULES.thruster[this.currentModules.thruster].name}</div>
                <div style="color:var(--emerald);">SEEDED TELEMETRY: ACTIVE</div>
              </div>
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:#64748b;">
                DRAG TO ORBIT // SCROLL TO ZOOM
              </div>
            </div>
          </div>

          <!-- RIGHT: Ship Configurator & Marketplace Details -->
          <div class="sci-panel configurator-panel">
            <div class="panel-header">
              <span class="panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>
                FLEET SHIPYARD &amp; CONFIGURATOR
              </span>
              <span class="panel-tag">${ship.tier}</span>
            </div>

            <!-- Hull Class Selector -->
            <div>
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:#94a3b8; margin-bottom:6px;">SELECT HULL CHASSIS:</div>
              <div class="hull-selector-strip">
                ${Object.values(SHIP_CLASSES).map(s => `
                  <div class="hull-card ${s.id === this.selectedShipId ? 'active' : ''}" data-hull="${s.id}">
                    <div class="hull-title">${s.name}</div>
                    <div class="hull-role">${s.role}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Faction Hull Skin Swatches -->
            <div>
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:#94a3b8; margin-bottom:6px;">FACTION HULL COATING:</div>
              <div class="faction-skin-palette">
                ${Object.values(FACTION_SKINS).map(skin => `
                  <div class="skin-swatch ${skin.id === this.selectedSkinId ? 'active' : ''}" 
                       data-skin="${skin.id}" 
                       style="background:${skin.primaryColor}; border-color:${skin.primaryColor};" 
                       title="${skin.name} (${skin.bonus})"></div>
                `).join('')}
              </div>
              <div style="font-family:var(--font-mono); font-size:0.68rem; color:var(--emerald); margin-top:4px;" id="skin-bonus-text">
                Bonus: ${FACTION_SKINS[this.selectedSkinId].bonus}
              </div>
            </div>

            <!-- Modular Upgrade Hardpoints -->
            <div class="module-slot-group">
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:#94a3b8;">MODULAR HARDPOINTS &amp; TELEMETRY:</div>

              <!-- Thruster Slot -->
              <div class="module-slot">
                <div class="slot-header">
                  <span>PROPULSION THRUSTERS</span>
                  <span style="color:var(--cyan);">$${SHIP_MODULES.thruster[this.currentModules.thruster].price.toLocaleString()}</span>
                </div>
                <select class="sci-select" data-slot="thruster">
                  ${Object.values(SHIP_MODULES.thruster).map(m => `
                    <option value="${m.id}" ${m.id === this.currentModules.thruster ? 'selected' : ''}>${m.name} (${m.stats.warpBonus})</option>
                  `).join('')}
                </select>
              </div>

              <!-- Mining Rig Slot -->
              <div class="module-slot">
                <div class="slot-header">
                  <span>MINING / HARVESTING LASER</span>
                  <span style="color:var(--cyan);">$${SHIP_MODULES.mining[this.currentModules.mining].price.toLocaleString()}</span>
                </div>
                <select class="sci-select" data-slot="mining">
                  ${Object.values(SHIP_MODULES.mining).map(m => `
                    <option value="${m.id}" ${m.id === this.currentModules.mining ? 'selected' : ''}>${m.name} (${m.stats.yieldBonus})</option>
                  `).join('')}
                </select>
              </div>

              <!-- Shield Slot -->
              <div class="module-slot">
                <div class="slot-header">
                  <span>DEFENSE SHIELD MATRIX</span>
                  <span style="color:var(--cyan);">$${SHIP_MODULES.shield[this.currentModules.shield].price.toLocaleString()}</span>
                </div>
                <select class="sci-select" data-slot="shield">
                  ${Object.values(SHIP_MODULES.shield).map(m => `
                    <option value="${m.id}" ${m.id === this.currentModules.shield ? 'selected' : ''}>${m.name} (${m.stats.shieldBonus})</option>
                  `).join('')}
                </select>
              </div>

              <!-- Telemetry Enclave Slot -->
              <div class="module-slot">
                <div class="slot-header">
                  <span>PYTHON TELEMETRY SECRETS ENCLAVE</span>
                  <span style="color:var(--violet);">$${SHIP_MODULES.telemetry[this.currentModules.telemetry].price.toLocaleString()}</span>
                </div>
                <select class="sci-select" data-slot="telemetry">
                  ${Object.values(SHIP_MODULES.telemetry).map(m => `
                    <option value="${m.id}" ${m.id === this.currentModules.telemetry ? 'selected' : ''}>${m.name} (${m.stats.telemetryBonus})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Dynamic Specs Meters -->
            <div>
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:#94a3b8; margin-bottom:6px;">VESSEL DIAGNOSTICS:</div>
              
              <div class="stat-meter-row">
                <div class="meter-label-val">
                  <span>Mining Output:</span>
                  <span style="color:var(--cyan); font-weight:600;" id="spec-mining">${ship.stats.miningYield} m³/min</span>
                </div>
                <div class="meter-track"><div class="meter-fill" style="width:${Math.min(100, (ship.stats.miningYield / 3000) * 100)}%;"></div></div>
              </div>

              <div class="stat-meter-row">
                <div class="meter-label-val">
                  <span>Warp Velocity:</span>
                  <span style="color:var(--gold); font-weight:600;" id="spec-warp">${ship.stats.warpSpeed} AU/s</span>
                </div>
                <div class="meter-track"><div class="meter-fill gold" style="width:${(ship.stats.warpSpeed / 8) * 100}%;"></div></div>
              </div>

              <div class="stat-meter-row">
                <div class="meter-label-val">
                  <span>Shield Matrix:</span>
                  <span style="color:var(--emerald); font-weight:600;" id="spec-shield">${ship.stats.shieldHp.toLocaleString()} HP</span>
                </div>
                <div class="meter-track"><div class="meter-fill emerald" style="width:${Math.min(100, (ship.stats.shieldHp / 50000) * 100)}%;"></div></div>
              </div>
            </div>

            <!-- Price & Order Action -->
            <div style="background:rgba(6,10,18,0.9); padding:12px; border-radius:4px; border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">TOTAL BUILD COST:</span>
                <span style="font-family:var(--font-hud); font-size:1.15rem; font-weight:700; color:var(--gold);" id="total-build-price">
                  $${this.calculateTotalPrice().toLocaleString()} ISD
                </span>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <button class="btn-trade-buy" id="btn-purchase-ship">
                  AUTHORIZE &amp; BUILD
                </button>
                <button class="btn-overcharge" id="btn-export-blueprint">
                  EXPORT BLUEPRINT
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    this.bindEvents();
    this.initThree();
  }

  calculateTotalPrice() {
    const base = SHIP_CLASSES[this.selectedShipId].basePrice;
    const thrusterP = SHIP_MODULES.thruster[this.currentModules.thruster].price;
    const miningP = SHIP_MODULES.mining[this.currentModules.mining].price;
    const shieldP = SHIP_MODULES.shield[this.currentModules.shield].price;
    const teleP = SHIP_MODULES.telemetry[this.currentModules.telemetry].price;
    return base + thrusterP + miningP + shieldP + teleP;
  }

  initThree() {
    const holder = this.container.querySelector('#three-canvas-holder');
    if (!holder) return;

    const width  = holder.clientWidth  || 800;
    const height = holder.clientHeight || 580;
    const dpr    = Math.min(window.devicePixelRatio, 3); // Full 4K DPR

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010306);
    this.scene.fog = new THREE.FogExp2(0x010306, 0.028);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 1200);
    this.camera.position.set(0, 4, 12);
    this.camera.lookAt(0, 0, 0);

    // Renderer — 4K quality config
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha:     true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping for HDR look
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.style.width  = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    holder.appendChild(this.renderer.domElement);

    // Responsive resize observer
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width: w, height: h } = e.contentRect;
        if (!this.renderer || !this.camera) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      }
    });
    ro.observe(holder);
    this._resizeObserver = ro;

    // Lighting — 4K quality, more fill sources
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    // Key light — cyan tactical
    const dirLight1 = new THREE.DirectionalLight(0x00eeff, 3.2);
    dirLight1.position.set(12, 18, 10);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.set(2048, 2048);
    dirLight1.shadow.radius = 4;
    this.scene.add(dirLight1);

    // Fill light — gold/amber
    const dirLight2 = new THREE.DirectionalLight(0xf5a623, 2.2);
    dirLight2.position.set(-12, -8, -10);
    this.scene.add(dirLight2);

    // Rim light — violet
    const dirLight3 = new THREE.DirectionalLight(0xa855f7, 1.6);
    dirLight3.position.set(0, -12, 8);
    this.scene.add(dirLight3);

    // Core point light — violet
    const pointLight = new THREE.PointLight(0xa855f7, 4, 22);
    pointLight.position.set(0, 2, 0);
    this.scene.add(pointLight);

    // Ground bounce
    const bounceLight = new THREE.HemisphereLight(0x00eeff, 0x030510, 0.5);
    this.scene.add(bounceLight);

    // Starfield Background Particles
    this.createStarfield();

    // Build Ship Geometry
    this.buildShipModel();

    // Setup Drag Controls
    this.setupControls(holder);

    // Render Loop
    this.animate();
  }

  createStarfield() {
    // Multi-layer starfield — cyan dense + white sparse + violet accent
    const layers = [
      { count: 1200, color: 0x00eeff, size: 0.10, opacity: 0.55, range: 90 },
      { count: 600,  color: 0xffffff, size: 0.16, opacity: 0.35, range: 110 },
      { count: 200,  color: 0xc084fc, size: 0.22, opacity: 0.28, range: 70 }
    ];

    this.starGroups = [];

    layers.forEach(layer => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(layer.count * 3);
      for (let i = 0; i < layer.count * 3; i += 3) {
        pos[i]     = (Math.random() - 0.5) * layer.range;
        pos[i + 1] = (Math.random() - 0.5) * layer.range;
        pos[i + 2] = (Math.random() - 0.5) * layer.range;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color:       layer.color,
        size:        layer.size,
        transparent: true,
        opacity:     layer.opacity,
        sizeAttenuation: true
      });
      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.starGroups.push(pts);
    });

    // Keep backward compat ref
    this.particles = this.starGroups[0];
  }

  buildShipModel() {
    if (this.shipGroup) {
      this.scene.remove(this.shipGroup);
      this.shipGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }

    this.shipGroup = new THREE.Group();
    this.moduleMeshes = {};

    const shipClass = SHIP_CLASSES[this.selectedShipId];
    const skin = FACTION_SKINS[this.selectedSkinId];
    const isWireframe = this.viewMode === 'wireframe';

    // 4K-quality Materials
    const hullMaterial = new THREE.MeshStandardMaterial({
      color:        skin.threeColor,
      metalness:    skin.metalness,
      roughness:    skin.roughness,
      envMapIntensity: 1.2,
      wireframe:    isWireframe
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color:     0x00eeff,
      wireframe: isWireframe
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color:            skin.threeColor,
      emissive:         skin.threeColor,
      emissiveIntensity: 0.45,
      metalness:        0.95,
      roughness:        0.05,
      wireframe:        isWireframe
    });

    const coreMaterial = new THREE.MeshStandardMaterial({
      color:             0xa855f7,
      emissive:          0x7c3aed,
      emissiveIntensity: 1.2,
      metalness:         0.95,
      roughness:         0.05,
      wireframe:         isWireframe
    });

    const cfg = shipClass.geometryConfig;
    // Higher polygon detail for 4K
    const SEG = isWireframe ? 8 : 32;

    // 1. Central Hull Body — higher segment count
    let bodyGeo;
    if (cfg.type === 'rocket') {
      bodyGeo = new THREE.CylinderGeometry(cfg.bodyRadius * 0.7, cfg.bodyRadius, cfg.bodyLength, SEG);
    } else if (cfg.type === 'capital') {
      bodyGeo = new THREE.BoxGeometry(cfg.bodyRadius * 2, cfg.bodyRadius * 1.4, cfg.bodyLength, 4, 4, 4);
    } else {
      bodyGeo = new THREE.ConeGeometry(cfg.bodyRadius, cfg.bodyLength, SEG);
    }

    const hullMesh = new THREE.Mesh(bodyGeo, hullMaterial);
    hullMesh.rotation.x = Math.PI / 2;
    this.shipGroup.add(hullMesh);
    this.moduleMeshes.hull = hullMesh;

    // 2. Wings / Armor Plates
    const wingGeo = new THREE.BoxGeometry(cfg.wingSpan, 0.18, 2.2);
    const wingMesh = new THREE.Mesh(wingGeo, hullMaterial);
    wingMesh.position.set(0, 0, -0.4);
    this.shipGroup.add(wingMesh);
    this.moduleMeshes.wings = wingMesh;

    // 3. Engine Thruster Pods
    const engineGroup = new THREE.Group();
    for (let i = 0; i < cfg.engineCount; i++) {
      const angle = (i / cfg.engineCount) * Math.PI * 2;
      const r = cfg.bodyRadius * 0.9;
      const engGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.4, 12);
      const engMesh = new THREE.Mesh(engGeo, hullMaterial);
      engMesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, -cfg.bodyLength / 2);
      engMesh.rotation.x = Math.PI / 2;

      // Glow nozzle
      const nozzleGeo = new THREE.CircleGeometry(0.34, 12);
      const nozzleMesh = new THREE.Mesh(nozzleGeo, glowMaterial);
      nozzleMesh.position.set(0, -0.71, 0);
      nozzleMesh.rotation.x = Math.PI / 2;
      engMesh.add(nozzleMesh);

      engineGroup.add(engMesh);
    }
    this.shipGroup.add(engineGroup);
    this.moduleMeshes.engines = engineGroup;

    // 4. Mining Turrets / Hardpoints
    const turretGroup = new THREE.Group();
    for (let j = 0; j < cfg.turretCount; j++) {
      const tGeo = new THREE.BoxGeometry(0.4, 0.35, 1.2);
      const tMesh = new THREE.Mesh(tGeo, hullMaterial);
      tMesh.position.set((j === 0 ? -1 : 1) * (cfg.wingSpan / 2.4), 0.3, 0.5);
      turretGroup.add(tMesh);
    }
    this.shipGroup.add(turretGroup);
    this.moduleMeshes.turrets = turretGroup;

    // 5. Quantum Core & Seeded Python Enclave (Inside/Exploded)
    const coreGeo = new THREE.SphereGeometry(0.65, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, coreMaterial);
    coreMesh.position.set(0, 0.2, 0);
    this.shipGroup.add(coreMesh);
    this.moduleMeshes.core = coreMesh;

    // Rotating Quantum Ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.05, 8, 32);
    const ringMesh = new THREE.Mesh(ringGeo, glowMaterial);
    ringMesh.rotation.x = Math.PI / 3;
    this.shipGroup.add(ringMesh);
    this.moduleMeshes.ring = ringMesh;

    this.scene.add(this.shipGroup);

    // Apply Exploded mode displacement if active
    this.updateExplodedState();
  }

  updateExplodedState() {
    if (!this.moduleMeshes.hull) return;

    if (this.viewMode === 'exploded') {
      this.moduleMeshes.wings.position.set(0, 0, -2.8);
      this.moduleMeshes.engines.position.set(0, 0, -2.2);
      this.moduleMeshes.turrets.position.set(0, 1.8, 1.5);
      this.moduleMeshes.core.position.set(0, 2.2, 0);
      this.moduleMeshes.ring.scale.set(1.6, 1.6, 1.6);
    } else {
      this.moduleMeshes.wings.position.set(0, 0, -0.4);
      this.moduleMeshes.engines.position.set(0, 0, 0);
      this.moduleMeshes.turrets.position.set(0, 0, 0);
      this.moduleMeshes.core.position.set(0, 0.2, 0);
      this.moduleMeshes.ring.scale.set(1, 1, 1);
    }
  }

  setupControls(holder) {
    holder.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    holder.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.shipGroup) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.shipGroup.rotation.y += deltaX * 0.008;
      this.shipGroup.rotation.x += deltaY * 0.008;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    holder.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (!this.camera) return;
      this.camera.position.z = Math.max(5, Math.min(22, this.camera.position.z + e.deltaY * 0.015));
    });
  }

  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    if (this.shipGroup) {
      if (this.isRotating && !this.isDragging) {
        this.shipGroup.rotation.y += 0.008;
      }
      if (this.moduleMeshes.ring) {
        this.moduleMeshes.ring.rotation.z += 0.02;
        this.moduleMeshes.ring.rotation.y += 0.01;
      }
    }

    if (this.particles) {
      this.particles.rotation.y += 0.0005;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  bindEvents() {
    // Mode Buttons (Solid, Wireframe, Exploded)
    const modeBtns = this.container.querySelectorAll('[data-mode]');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.viewMode = btn.dataset.mode;
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.buildShipModel();
      });
    });

    // Toggle Spin
    const spinBtn = this.container.querySelector('#btn-toggle-spin');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        sfx.playClick();
        this.isRotating = !this.isRotating;
        spinBtn.textContent = `AUTO-ORBIT: ${this.isRotating ? 'ON' : 'OFF'}`;
        spinBtn.classList.toggle('active', this.isRotating);
      });
    }

    // Reset Camera
    const resetCamBtn = this.container.querySelector('#btn-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        sfx.playClick();
        if (this.camera && this.shipGroup) {
          this.camera.position.set(0, 4, 12);
          this.camera.lookAt(0, 0, 0);
          this.shipGroup.rotation.set(0, 0, 0);
        }
      });
    }

    // Hull Class Selection
    const hullCards = this.container.querySelectorAll('[data-hull]');
    hullCards.forEach(card => {
      card.addEventListener('click', () => {
        sfx.playClick();
        this.selectedShipId = card.dataset.hull;
        this.render();
      });
    });

    // Faction Skin Selection
    const swatches = this.container.querySelectorAll('[data-skin]');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        sfx.playClick();
        this.selectedSkinId = swatch.dataset.skin;
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        
        const bonusText = this.container.querySelector('#skin-bonus-text');
        if (bonusText) bonusText.textContent = `Bonus: ${FACTION_SKINS[this.selectedSkinId].bonus}`;
        
        this.buildShipModel();
      });
    });

    // Modular Upgrade Dropdowns
    const selects = this.container.querySelectorAll('.sci-select');
    selects.forEach(sel => {
      sel.addEventListener('change', (e) => {
        sfx.playClick();
        const slot = sel.dataset.slot;
        this.currentModules[slot] = e.target.value;
        
        const priceEl = this.container.querySelector('#total-build-price');
        if (priceEl) priceEl.textContent = `$${this.calculateTotalPrice().toLocaleString()} ISD`;
      });
    });

    // Authorize & Build Ship
    const btnPurchase = this.container.querySelector('#btn-purchase-ship');
    if (btnPurchase) {
      btnPurchase.addEventListener('click', () => {
        const total = this.calculateTotalPrice();
        if (this.state.wallet.isd < total) {
          sfx.playAlert();
          this.showToast('Insufficient ISD credits to build this custom hull configuration!', 'error');
          return;
        }

        this.state.wallet.isd -= total;
        sfx.playTradeSuccess();
        const ship = SHIP_CLASSES[this.selectedShipId];
        this.showToast(`Spacecraft Built! ${ship.name} (${FACTION_SKINS[this.selectedSkinId].name}) commissioned to active fleet.`, 'success');

        if (this.onShipPurchased) this.onShipPurchased(this.state.wallet);
      });
    }

    // Export Blueprint JSON
    const btnExport = this.container.querySelector('#btn-export-blueprint');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        sfx.playClick();
        const blueprint = {
          hullId: this.selectedShipId,
          hullName: SHIP_CLASSES[this.selectedShipId].name,
          factionSkin: FACTION_SKINS[this.selectedSkinId].name,
          modules: this.currentModules,
          totalPriceISD: this.calculateTotalPrice(),
          quantumSeedChecksum: '0x' + Math.random().toString(16).substring(2, 10),
          exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedShipId}_blueprint.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Blueprint JSON exported to interstellar flight database.', 'success');
      });
    }
  }


  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    if (this.renderer) {
      this.renderer.dispose();
      const dom = this.renderer.domElement;
      if (dom && dom.parentNode) dom.parentNode.removeChild(dom);
    }
  }
}


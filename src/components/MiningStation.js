// Asteroid Rocket Mining Simulator & Ore Refinery Terminal

import { MARKET_PAIRS } from '../data/marketData';
import { sfx } from '../audio/sfx';

export const ASTEROID_TARGETS = [
  {
    id: 'VELD_01',
    name: 'Veldspar Dense Asteroid #89',
    oreType: 'TRITANIUM',
    oreName: 'Tritanium Ore',
    richness: 'Rich (99.4%)',
    density: 'High Density Solid',
    yieldRate: 18.5, // m3 per sec
    distanceKm: '14.2 km',
    color: '#00f0ff',
    baseColor: '#334155'
  },
  {
    id: 'PYRO_02',
    name: 'Pyroxeres Crystalline Core',
    oreType: 'PYERITE',
    oreName: 'Pyerite Crystal',
    richness: 'Pristine (94.2%)',
    density: 'Crystalline Cluster',
    yieldRate: 12.0,
    distanceKm: '8.7 km',
    color: '#f5a623',
    baseColor: '#451a03'
  },
  {
    id: 'ISOG_03',
    name: 'Spodumain Super-Deposit #44',
    oreType: 'ISOGEN',
    oreName: 'Isogen Dark Mineral',
    richness: 'Exceptional (88.5%)',
    density: 'Dark Mineral Node',
    yieldRate: 3.8,
    distanceKm: '22.1 km',
    color: '#10b981',
    baseColor: '#064e3b'
  },
  {
    id: 'DARK_04',
    name: 'Exotic Dark Matter Void Anomaly',
    oreType: 'DARK_MATTER',
    oreName: 'Exotic Dark Matter',
    richness: 'Ultra-Rare (99.9%)',
    density: 'Singularity Fragment',
    yieldRate: 0.85,
    distanceKm: '41.5 km',
    color: '#a855f7',
    baseColor: '#3b0764'
  }
];

export class MiningStation {
  constructor(container, state, onOreRefined, showToast) {
    this.container = container;
    this.state = state;
    this.onOreRefined = onOreRefined;
    this.showToast = showToast;

    this.selectedAsteroidId = 'VELD_01';
    this.isMining = false;
    this.isOvercharged = false;
    this.dronesActive = false;
    this.heat = 0; // 0 to 100%
    
    // Canvas & Animation
    this.canvas = null;
    this.ctx = null;
    this.sparks = [];
    this.animId = null;
    this.miningTickTimer = null;
  }

  render() {
    const target = ASTEROID_TARGETS.find(a => a.id === this.selectedAsteroidId) || ASTEROID_TARGETS[0];

    this.container.innerHTML = `
      <div class="view-container">
        <div class="mining-layout">
          
          <!-- LEFT: 2D Laser Mining Interactive Simulation -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="sci-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                  ASTEROID EXTRACTION &amp; LASER TELEMETRY
                </span>
                <span class="panel-tag" id="mining-status-tag" style="color:${this.isMining ? 'var(--emerald)' : 'var(--cyan)'};">
                  ${this.isMining ? 'EXTRACTING' : 'READY'}
                </span>
              </div>

              <!-- Animated Mining Stage Canvas -->
              <div class="mining-laser-stage">
                <canvas class="mining-canvas" id="mining-canvas"></canvas>
              </div>

              <!-- Mining Action Controls -->
              <div class="mining-controls-bar">
                <div style="display:flex; gap:10px; align-items:center;">
                  <button class="btn-mine-primary ${this.isMining ? 'active' : ''}" id="btn-toggle-mine">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span>${this.isMining ? 'CEASE EXTRACTION' : 'ENGAGE MINING LASER'}</span>
                  </button>

                  <button class="btn-overcharge ${this.isOvercharged ? 'active' : ''}" id="btn-overcharge">
                    ⚡ OVERCHARGE (2.5x)
                  </button>

                  <button class="hud-action-btn ${this.dronesActive ? 'active' : ''}" id="btn-drones">
                    🛰️ DRONES: ${this.dronesActive ? 'DEPLOYED' : 'DOCKED'}
                  </button>
                </div>

                <!-- Laser Thermal Meter -->
                <div style="min-width:180px;">
                  <div class="meter-label-val">
                    <span>LASER HEAT:</span>
                    <span style="color:${this.heat > 75 ? 'var(--red)' : 'var(--cyan)'}; font-weight:700;" id="heat-val-label">
                      ${Math.round(this.heat)}%
                    </span>
                  </div>
                  <div class="meter-track">
                    <div class="meter-fill" id="heat-fill-bar" style="width:${this.heat}%; background:${this.heat > 75 ? 'var(--red)' : 'var(--cyan)'};"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Target Asteroid Scanner Selection -->
            <div class="sci-panel">
              <div class="panel-header">
                <span class="panel-title">SECTOR ASTEROID RADAR TARGETS</span>
                <span class="panel-tag">${ASTEROID_TARGETS.length} DETECTED</span>
              </div>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
                ${ASTEROID_TARGETS.map(ast => `
                  <div class="hull-card ${ast.id === this.selectedAsteroidId ? 'active' : ''}" data-asteroid="${ast.id}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                      <span class="hull-title" style="color:${ast.color};">${ast.name}</span>
                      <span style="font-family:var(--font-mono); font-size:0.65rem; color:#64748b;">${ast.distanceKm}</span>
                    </div>
                    <div class="hull-role">Ore: ${ast.oreName} (${ast.richness})</div>
                    <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--gold); margin-top:4px;">
                      Yield: ~${ast.yieldRate} m³/s
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT: Cargo Hold & Ore Refining Liquidation Terminal -->
          <div class="sci-panel">
            <div class="panel-header">
              <span class="panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                CARGO &amp; REFINERY
              </span>
              <button class="btn-trade-buy" style="padding:4px 10px; font-size:0.72rem;" id="btn-refine-all">
                REFINE ALL
              </button>
            </div>

            <!-- Cargo Capacity Meter -->
            <div style="margin-bottom:14px;">
              <div class="meter-label-val">
                <span>Cargo Hold:</span>
                <span style="color:var(--cyan);" id="cargo-capacity-label">
                  ${this.calculateTotalOreWeight().toFixed(1)} / 5,000 m³
                </span>
              </div>
              <div class="meter-track">
                <div class="meter-fill" id="cargo-fill-bar" style="width:${Math.min(100, (this.calculateTotalOreWeight() / 5000) * 100)}%;"></div>
              </div>
            </div>

            <!-- Mineral Inventory Cards -->
            <div id="ore-inventory-list">
              ${this.renderOreCards()}
            </div>

            <!-- Telemetry Insights -->
            <div style="background:rgba(6,10,18,0.7); padding:10px; border-radius:4px; border:1px solid rgba(0,240,255,0.15); margin-top:12px; font-family:var(--font-mono); font-size:0.72rem;">
              <div style="color:var(--cyan); font-weight:700; margin-bottom:4px;">REFINERY DIRECT FEED:</div>
              <div style="color:#94a3b8;">Refining Tax: 0.0% (Jita IV-4 Station Standing: 9.8)</div>
              <div style="color:#94a3b8;">Auto-Refinery Link: <span style="color:var(--emerald);">ACTIVE</span></div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
    this.initCanvas();
    this.startMiningLoop();
  }

  calculateTotalOreWeight() {
    let total = 0;
    Object.keys(this.state.ores).forEach(k => {
      total += this.state.ores[k] || 0;
    });
    return total;
  }

  renderOreCards() {
    const ores = [
      { key: 'TRITANIUM', name: 'Tritanium', icon: '⚡', unit: 'm³', price: MARKET_PAIRS.TRITANIUM.price },
      { key: 'PYERITE', name: 'Pyerite', icon: '💎', unit: 'm³', price: MARKET_PAIRS.PYERITE.price },
      { key: 'ISOGEN', name: 'Isogen', icon: '🌀', unit: 'm³', price: MARKET_PAIRS.ISOGEN.price },
      { key: 'DARK_MATTER', name: 'Dark Matter', icon: '⚛', unit: 'mg', price: MARKET_PAIRS.DARK_MATTER.price }
    ];

    return ores.map(o => {
      const amount = this.state.ores[o.key] || 0;
      const totalVal = amount * o.price;

      return `
        <div class="ore-refinery-card">
          <div class="ore-info">
            <span class="ore-icon">${o.icon}</span>
            <div>
              <div class="ore-name">${o.name}</div>
              <div class="ore-amount" id="ore-val-${o.key}">
                ${amount.toFixed(2)} ${o.unit} (~$${totalVal.toFixed(2)})
              </div>
            </div>
          </div>
          <button class="btn-sell-ore" data-sell-ore="${o.key}">
            SELL ($${o.price.toFixed(2)})
          </button>
        </div>
      `;
    }).join('');
  }

  initCanvas() {
    this.canvas = this.container.querySelector('#mining-canvas');
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);

    this.renderCanvasFrame(rect.width, rect.height);
  }

  renderCanvasFrame(width, height) {
    this.animId = requestAnimationFrame(() => {
      if (this.canvas) {
        const bounds = this.canvas.getBoundingClientRect();
        this.renderCanvasFrame(bounds.width, bounds.height);
      }
    });

    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    const shipX = 90;
    const shipY = height / 2;
    const asteroidX = width - 110;
    const asteroidY = height / 2;

    // Draw Asteroid (Rotating & Glowing)
    const target = ASTEROID_TARGETS.find(a => a.id === this.selectedAsteroidId) || ASTEROID_TARGETS[0];
    const time = Date.now() * 0.001;

    ctx.save();
    ctx.translate(asteroidX, asteroidY);
    ctx.rotate(time * 0.2);

    ctx.fillStyle = target.baseColor;
    ctx.strokeStyle = target.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const points = 9;
    const rBase = 52;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = rBase + Math.sin(i * 3) * 8;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Asteroid craters
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(-14, -10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, 16, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Mining Vessel
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.strokeStyle = 'var(--cyan)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(shipX + 35, shipY);
    ctx.lineTo(shipX - 35, shipY - 24);
    ctx.lineTo(shipX - 20, shipY);
    ctx.lineTo(shipX - 35, shipY + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Drone Squadron (if active)
    if (this.dronesActive) {
      for (let d = 0; d < 3; d++) {
        const dAngle = time * 1.5 + (d * (Math.PI * 2 / 3));
        const dX = asteroidX + Math.cos(dAngle) * 90;
        const dY = asteroidY + Math.sin(dAngle) * 70;

        ctx.fillStyle = 'var(--gold)';
        ctx.beginPath();
        ctx.arc(dX, dY, 4, 0, Math.PI * 2);
        ctx.fill();

        if (this.isMining) {
          ctx.strokeStyle = 'rgba(245, 166, 35, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(dX, dY);
          ctx.lineTo(asteroidX, asteroidY);
          ctx.stroke();
        }
      }
    }

    // Draw Mining Laser Beam (if active)
    if (this.isMining) {
      const beamColor = this.isOvercharged ? '#f5a623' : '#00f0ff';
      const beamWidth = this.isOvercharged ? 6 + Math.sin(time * 20) * 2 : 3.5 + Math.sin(time * 15) * 1.5;

      // Outer Glow
      ctx.strokeStyle = beamColor;
      ctx.lineWidth = beamWidth * 2.5;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(shipX + 35, shipY);
      ctx.lineTo(asteroidX, asteroidY);
      ctx.stroke();

      // Core Laser Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = beamWidth * 0.8;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(shipX + 35, shipY);
      ctx.lineTo(asteroidX, asteroidY);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Generate Spark Particles at impact point
      if (Math.random() < 0.7) {
        this.sparks.push({
          x: asteroidX + (Math.random() - 0.5) * 10,
          y: asteroidY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 6 - 2,
          vy: (Math.random() - 0.5) * 6,
          life: 1.0,
          color: beamColor
        });
      }
    }

    // Update & Draw Sparks
    for (let s = this.sparks.length - 1; s >= 0; s--) {
      const sp = this.sparks[s];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= 0.04;

      if (sp.life <= 0) {
        this.sparks.splice(s, 1);
        continue;
      }

      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.life;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 2.5 * sp.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  bindEvents() {
    // Toggle Mining Laser
    const btnMine = this.container.querySelector('#btn-toggle-mine');
    if (btnMine) {
      btnMine.addEventListener('click', () => {
        this.isMining = !this.isMining;
        if (this.isMining) {
          sfx.startMiningLaser();
          this.showToast('Mining laser engaged! Extracting raw interstellar minerals.', 'success');
        } else {
          sfx.stopMiningLaser();
          sfx.playClick();
        }
        this.updateMiningUi();
      });
    }

    // Toggle Overcharge
    const btnOvercharge = this.container.querySelector('#btn-overcharge');
    if (btnOvercharge) {
      btnOvercharge.addEventListener('click', () => {
        sfx.playClick();
        this.isOvercharged = !this.isOvercharged;
        btnOvercharge.classList.toggle('active', this.isOvercharged);
        if (this.isOvercharged) {
          this.showToast('LASER OVERCHARGE ACTIVE (+150% Yield). High thermal buildup!', 'warn');
        }
      });
    }

    // Toggle Drones
    const btnDrones = this.container.querySelector('#btn-drones');
    if (btnDrones) {
      btnDrones.addEventListener('click', () => {
        sfx.playClick();
        this.dronesActive = !this.dronesActive;
        btnDrones.textContent = `🛰️ DRONES: ${this.dronesActive ? 'DEPLOYED' : 'DOCKED'}`;
        btnDrones.classList.toggle('active', this.dronesActive);
      });
    }

    // Select Asteroid Target
    const asteroidCards = this.container.querySelectorAll('[data-asteroid]');
    asteroidCards.forEach(card => {
      card.addEventListener('click', () => {
        sfx.playClick();
        this.selectedAsteroidId = card.dataset.asteroid;
        this.render();
      });
    });

    // Sell Individual Ore
    this.bindSellButtons();

    // Refine & Sell All
    const btnRefineAll = this.container.querySelector('#btn-refine-all');
    if (btnRefineAll) {
      btnRefineAll.addEventListener('click', () => {
        let totalGain = 0;
        Object.keys(this.state.ores).forEach(k => {
          const amt = this.state.ores[k] || 0;
          if (amt > 0 && MARKET_PAIRS[k]) {
            totalGain += amt * MARKET_PAIRS[k].price;
            this.state.ores[k] = 0;
          }
        });

        if (totalGain > 0) {
          this.state.wallet.isd += totalGain;
          sfx.playTradeSuccess();
          this.showToast(`Refined all ores! Liquidated for +$${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })} ISD`, 'success');
          this.updateOreUi();
          if (this.onOreRefined) this.onOreRefined(this.state.wallet);
        } else {
          this.showToast('Cargo hold is currently empty!', 'warn');
        }
      });
    }
  }

  bindSellButtons() {
    const sellBtns = this.container.querySelectorAll('[data-sell-ore]');
    sellBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sellOre;
        const amt = this.state.ores[key] || 0;
        if (amt > 0 && MARKET_PAIRS[key]) {
          const gain = amt * MARKET_PAIRS[key].price;
          this.state.wallet.isd += gain;
          this.state.ores[key] = 0;
          
          sfx.playTradeSuccess();
          this.showToast(`Liquidated ${key} for +$${gain.toFixed(2)} ISD`, 'success');
          this.updateOreUi();
          if (this.onOreRefined) this.onOreRefined(this.state.wallet);
        }
      });
    });
  }

  updateMiningUi() {
    const btnMine = this.container.querySelector('#btn-toggle-mine');
    const statusTag = this.container.querySelector('#mining-status-tag');
    if (btnMine) {
      btnMine.classList.toggle('active', this.isMining);
      btnMine.querySelector('span').textContent = this.isMining ? 'CEASE EXTRACTION' : 'ENGAGE MINING LASER';
    }
    if (statusTag) {
      statusTag.textContent = this.isMining ? 'EXTRACTING' : 'READY';
      statusTag.style.color = this.isMining ? 'var(--emerald)' : 'var(--cyan)';
    }
  }

  updateOreUi() {
    const list = this.container.querySelector('#ore-inventory-list');
    if (list) list.innerHTML = this.renderOreCards();
    this.bindSellButtons();

    const cargoLabel = this.container.querySelector('#cargo-capacity-label');
    const cargoFill = this.container.querySelector('#cargo-fill-bar');
    const weight = this.calculateTotalOreWeight();

    if (cargoLabel) cargoLabel.textContent = `${weight.toFixed(1)} / 5,000 m³`;
    if (cargoFill) cargoFill.style.width = `${Math.min(100, (weight / 5000) * 100)}%`;
  }

  startMiningLoop() {
    if (this.miningTickTimer) clearInterval(this.miningTickTimer);
    
    this.miningTickTimer = setInterval(() => {
      if (this.isMining) {
        const target = ASTEROID_TARGETS.find(a => a.id === this.selectedAsteroidId) || ASTEROID_TARGETS[0];
        let yieldAmt = target.yieldRate * 0.5; // per 500ms

        if (this.isOvercharged) yieldAmt *= 2.5;
        if (this.dronesActive) yieldAmt *= 1.35;

        // Add ore to state
        this.state.ores[target.oreType] = (this.state.ores[target.oreType] || 0) + yieldAmt;

        // Heat accumulation
        const heatDelta = this.isOvercharged ? 3.5 : 1.2;
        this.heat = Math.min(100, this.heat + heatDelta);

        // Check Overheat
        if (this.heat >= 100) {
          this.isMining = false;
          sfx.stopMiningLaser();
          sfx.playAlert();
          this.showToast('WARNING: Mining laser overheated! Emergency safety shutdown initiated.', 'error');
          this.updateMiningUi();
        }
      } else {
        // Cooling down
        this.heat = Math.max(0, this.heat - 2.5);
      }

      // Update Heat meter
      const heatLabel = this.container.querySelector('#heat-val-label');
      const heatFill = this.container.querySelector('#heat-fill-bar');
      if (heatLabel) {
        heatLabel.textContent = `${Math.round(this.heat)}%`;
        heatLabel.style.color = this.heat > 75 ? 'var(--red)' : 'var(--cyan)';
      }
      if (heatFill) {
        heatFill.style.width = `${this.heat}%`;
        heatFill.style.background = this.heat > 75 ? 'var(--red)' : 'var(--cyan)';
      }

      // Update Ore Display
      if (this.isMining) {
        this.updateOreUi();
      }
    }, 500);
  }

  destroy() {
    sfx.stopMiningLaser();
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.miningTickTimer) clearInterval(this.miningTickTimer);
  }
}

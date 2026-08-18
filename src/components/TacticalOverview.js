// Tactical Overview Command Center & Solar System Orbital Radar

import { MARKET_PAIRS } from '../data/marketData';
import { SHIP_CLASSES } from '../data/shipBlueprints';
import { sfx } from '../audio/sfx';

export class TacticalOverview {
  constructor(container, state, onNavigate, showToast) {
    this.container = container;
    this.state = state;
    this.onNavigate = onNavigate;
    this.showToast = showToast;

    this.radarCanvas = null;
    this.radarCtx = null;
    this.animId = null;
    this.radarAngle = 0;
  }

  render() {
    this.container.innerHTML = `
      <div class="view-container">
        
        <!-- Top Mission Briefing Hero -->
        <div class="sci-panel" style="margin-bottom:16px; background:linear-gradient(135deg, rgba(6,10,20,0.85) 0%, rgba(16,24,48,0.7) 100%);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
              <div style="font-family:var(--font-hud); font-size:1.4rem; font-weight:900; color:#fff; letter-spacing:2px; display:flex; align-items:center; gap:10px;">
                <span>INTERSTELLAR COMMAND NEXUS</span>
                <span class="panel-tag" style="color:var(--cyan); border-color:var(--cyan);">ALL-IN-ONE MARKETPLACE</span>
              </div>
              <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">
                Unified deep-space cryptocurrency &amp; forex exchange, 3D fleet configurator shipyard, real-time asteroid mining rig, and seeded Python telemetry secrets enclave.
              </div>
            </div>

            <!-- Quick Action Hub Buttons -->
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn-trade-buy" data-quick-nav="trading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                OPEN MARKETS
              </button>
              <button class="btn-overcharge" data-quick-nav="shipyard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>
                3D CONFIGURATOR
              </button>
              <button class="btn-mine-primary" style="padding:8px 14px; font-size:0.8rem;" data-quick-nav="mining">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                ASTEROID DRILL
              </button>
              <button class="btn-decrypt" style="padding:8px 14px; font-size:0.8rem;" data-quick-nav="telemetry">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                PYTHON SECRETS
              </button>
            </div>
          </div>
        </div>

        <!-- 3-Column Tactical Dashboard Layout -->
        <div style="display:grid; grid-template-columns:1fr 1fr 340px; gap:16px;">
          
          <!-- LEFT: Solar System Tactical Radar & Orbital Map -->
          <div class="sci-panel">
            <div class="panel-header">
              <span class="panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                SOLAR SYSTEM TACTICAL RADAR
              </span>
              <span class="panel-tag">SECTOR: JITA-IV</span>
            </div>

            <div style="position:relative; height:340px; background:#020408; border:1px solid var(--border-subtle); border-radius:4px; overflow:hidden;">
              <canvas id="tactical-radar-canvas" style="width:100%; height:100%; display:block;"></canvas>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:10px; font-family:var(--font-mono); font-size:0.72rem; color:#94a3b8;">
              <span>Orbital Range: 100 AU</span>
              <span>Anomalies: <strong style="color:var(--emerald);">4 DETECTED</strong></span>
              <span>Warp Gate: <strong style="color:var(--cyan);">UNRESTRICTED</strong></span>
            </div>
          </div>

          <!-- CENTER: Market Ticker Board & Fleet Status -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            
            <!-- Key Market Highlights -->
            <div class="sci-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  HIGH-LIQUIDITY ASSETS
                </span>
                <span class="panel-tag" style="color:var(--gold); border-color:var(--gold);">24H VOL: $184.2B</span>
              </div>

              <div style="display:flex; flex-direction:column; gap:8px;">
                ${['BTC/ISD', 'ETH/ISD', 'QUANTUM/ISD', 'TRITANIUM', 'DARK_MATTER'].map(pId => {
                  const p = MARKET_PAIRS[pId];
                  const isUp = p.change24h >= 0;
                  return `
                    <div class="ore-refinery-card" style="margin:0; cursor:pointer;" data-quick-pair="${p.id}">
                      <div>
                        <div style="font-family:var(--font-hud); font-size:0.85rem; color:#fff; font-weight:600;">${p.id}</div>
                        <div style="font-size:0.68rem; color:#94a3b8;">${p.name}</div>
                      </div>
                      <div style="text-align:right; font-family:var(--font-mono);">
                        <div style="font-size:0.85rem; font-weight:600; color:#fff;">$${p.price > 100 ? p.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : p.price.toFixed(p.precision)}</div>
                        <div class="${isUp ? 'ticker-change up' : 'ticker-change down'}" style="font-size:0.7rem;">${isUp ? '+' : ''}${p.change24h.toFixed(2)}%</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Active Fleet Vessels -->
            <div class="sci-panel">
              <div class="panel-header">
                <span class="panel-title">COMMISSIONED FLEET STATUS</span>
                <span class="panel-tag">${Object.keys(SHIP_CLASSES).length} HULLS</span>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                ${Object.values(SHIP_CLASSES).slice(0, 2).map(s => `
                  <div class="hull-card" style="margin:0;" data-quick-nav="shipyard">
                    <div class="hull-title">${s.name}</div>
                    <div class="hull-role">${s.tier}</div>
                    <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--emerald); margin-top:4px;">
                      Status: READY IN HANGAR
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- RIGHT: Interstellar Event Log & Telemetry Dispatch -->
          <div class="sci-panel">
            <div class="panel-header">
              <span class="panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
                TELEMETRY DISPATCH
              </span>
              <span class="status-dot"></span>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; font-family:var(--font-mono); font-size:0.74rem;">
              
              <div style="background:rgba(6,10,18,0.7); border-left:3px solid var(--emerald); padding:8px 10px; border-radius:3px;">
                <div style="color:var(--emerald); font-weight:700;">[ANOMALY SCANNED]</div>
                <div style="color:#cbd5e1;">Dense Dark Matter pocket localized at Vector [742, -189, 44].</div>
                <div style="color:#64748b; font-size:0.65rem; margin-top:2px;">00:02:14 UTC // Python Seed: EVE_JITA_44</div>
              </div>

              <div style="background:rgba(6,10,18,0.7); border-left:3px solid var(--gold); padding:8px 10px; border-radius:3px;">
                <div style="color:var(--gold); font-weight:700;">[ARBITRAGE OPPORTUNITY]</div>
                <div style="color:#cbd5e1;">Cross-market spread on BTC/ISD reached +0.42% between Jita and Amarr.</div>
                <div style="color:#64748b; font-size:0.65rem; margin-top:2px;">00:01:45 UTC // Quantum Router</div>
              </div>

              <div style="background:rgba(6,10,18,0.7); border-left:3px solid var(--cyan); padding:8px 10px; border-radius:3px;">
                <div style="color:var(--cyan); font-weight:700;">[FLEET TELEMETRY]</div>
                <div style="color:#cbd5e1;">Solaris-VII rocket orbital trajectory locked at 420.5 km perigee.</div>
                <div style="color:#64748b; font-size:0.65rem; margin-top:2px;">00:00:58 UTC // SHA-256 Verified</div>
              </div>

              <div style="background:rgba(6,10,18,0.7); border-left:3px solid var(--violet); padding:8px 10px; border-radius:3px;">
                <div style="color:var(--violet); font-weight:700;">[SECRETS VAULT]</div>
                <div style="color:#cbd5e1;">Cryptographic payload unlocked for NASA Crater Sector 7.</div>
                <div style="color:#64748b; font-size:0.65rem; margin-top:2px;">00:00:12 UTC // Key: NASA_LUNAR_2026</div>
              </div>

            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
    this.initRadar();
  }

  initRadar() {
    this.radarCanvas = this.container.querySelector('#tactical-radar-canvas');
    if (!this.radarCanvas) return;

    const rect = this.radarCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.radarCanvas.width = rect.width * dpr;
    this.radarCanvas.height = rect.height * dpr;
    this.radarCtx = this.radarCanvas.getContext('2d');
    this.radarCtx.scale(dpr, dpr);

    this.drawRadarLoop(rect.width, rect.height);
  }

  drawRadarLoop(width, height) {
    this.animId = requestAnimationFrame(() => {
      if (this.radarCanvas) {
        const bounds = this.radarCanvas.getBoundingClientRect();
        this.drawRadarLoop(bounds.width, bounds.height);
      }
    });

    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 15;

    // Draw Concentric Radar Rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 4) * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.stroke();

    // Central Star (Solar Core)
    ctx.fillStyle = 'var(--gold)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Planets & Station Nodes
    const time = Date.now() * 0.0008;
    const planets = [
      { r: maxRadius * 0.3, speed: 1.2, color: 'var(--cyan)', label: 'Jita IV-4 Core Station' },
      { r: maxRadius * 0.55, speed: 0.8, color: 'var(--emerald)', label: 'Veldspar Belt Alpha' },
      { r: maxRadius * 0.78, speed: 0.45, color: 'var(--violet)', label: 'Dark Matter Anomaly' },
      { r: maxRadius * 0.95, speed: 0.3, color: 'var(--rust)', label: 'Outer Warp Gate' }
    ];

    planets.forEach(p => {
      const angle = time * p.speed;
      const x = centerX + Math.cos(angle) * p.r;
      const y = centerY + Math.sin(angle) * p.r;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px JetBrains Mono';
      ctx.fillText(p.label, x + 6, y - 4);
    });

    // Rotating Radar Sweep Beam
    this.radarAngle += 0.025;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.radarAngle);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, 0, Math.PI / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  bindEvents() {
    const quickNavs = this.container.querySelectorAll('[data-quick-nav]');
    quickNavs.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playTabSwitch();
        this.onNavigate(btn.dataset.quickNav);
      });
    });

    const quickPairs = this.container.querySelectorAll('[data-quick-pair]');
    quickPairs.forEach(el => {
      el.addEventListener('click', () => {
        sfx.playClick();
        this.onNavigate('trading');
      });
    });
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

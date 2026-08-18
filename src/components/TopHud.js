// Top Command HUD Navigation Bar & Multi-Market Marquee Ticker

import { MARKET_PAIRS } from '../data/marketData';
import { sfx } from '../audio/sfx';

export class TopHud {
  constructor(container, state, onNavigate, onAudioToggle) {
    this.container = container;
    this.state = state;
    this.onNavigate = onNavigate;
    this.onAudioToggle = onAudioToggle;
    this.clockInterval = null;
  }

  render() {
    this.container.innerHTML = `
      <header class="top-hud">
        <div class="hud-primary-bar">
          <!-- Brand & System Telemetry -->
          <div class="hud-brand">
            <div class="hud-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div>
              <div class="hud-title">INTERSTELLAR // EVE</div>
              <div class="hud-subtitle">JITA IV-4 ORBITAL CORE // SEC 0.9</div>
            </div>
          </div>

          <!-- Solar System & Quantum Telemetry Link -->
          <div class="hud-telemetry-badge">
            <span class="status-dot"></span>
            <span>QUANTUM LINK: <strong style="color:var(--cyan);">99.8% SYNC</strong></span>
            <span style="color:#64748b;">|</span>
            <span id="hud-solar-clock">00:00:00 UTC</span>
          </div>

          <!-- Primary Navigation Tabs -->
          <nav class="hud-nav-tabs">
            <button class="hud-tab-btn ${this.state.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              OVERVIEW
            </button>
            <button class="hud-tab-btn ${this.state.activeTab === 'trading' ? 'active' : ''}" data-tab="trading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              MARKETS
            </button>
            <button class="hud-tab-btn ${this.state.activeTab === 'shipyard' ? 'active' : ''}" data-tab="shipyard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>
              3D FLEET &amp; ROCKETS
            </button>
            <button class="hud-tab-btn ${this.state.activeTab === 'mining' ? 'active' : ''}" data-tab="mining">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              MINING RIG
            </button>
            <button class="hud-tab-btn ${this.state.activeTab === 'telemetry' ? 'active' : ''}" data-tab="telemetry">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              PYTHON TELEMETRY
            </button>
          </nav>

          <!-- Wallet & Audio Center -->
          <div class="hud-wallet-center">
            <div class="wallet-stat-card">
              <span class="wallet-label">ISD CREDITS</span>
              <span class="wallet-value" id="hud-wallet-isd">$${this.state.wallet.isd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="wallet-stat-card">
              <span class="wallet-label">ISK BALANCE</span>
              <span class="wallet-value" style="color:var(--cyan);" id="hud-wallet-isk">${this.state.wallet.isk.toLocaleString('en-US')} Ƶ</span>
            </div>

            <!-- Audio SFX Toggle Button -->
            <button class="hud-action-btn" id="btn-audio-toggle" title="Toggle Synthesized Audio FX">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span id="audio-btn-label">SFX: ON</span>
            </button>
          </div>
        </div>

        <!-- Scrolling Ticker Marquee -->
        <div class="ticker-tape">
          <div class="ticker-track" id="ticker-track">
            ${this.renderTickerItems()}
            ${this.renderTickerItems()}
          </div>
        </div>
      </header>
    `;

    this.bindEvents();
    this.startClock();
  }

  renderTickerItems() {
    return Object.values(MARKET_PAIRS).map(pair => {
      const isUp = pair.change24h >= 0;
      return `
        <div class="ticker-item">
          <span class="ticker-pair">${pair.id}</span>
          <span class="ticker-price">${pair.price > 100 ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : pair.price.toFixed(pair.precision)}</span>
          <span class="ticker-change ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${pair.change24h.toFixed(2)}%</span>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    const tabBtns = this.container.querySelectorAll('.hud-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playTabSwitch();
        const tab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onNavigate(tab);
      });
    });

    const audioBtn = this.container.querySelector('#btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = sfx.toggleMute();
        sfx.playClick();
        const label = this.container.querySelector('#audio-btn-label');
        if (label) {
          label.textContent = isMuted ? 'SFX: MUTED' : 'SFX: ON';
          audioBtn.style.borderColor = isMuted ? 'var(--red)' : 'var(--cyan)';
        }
        if (this.onAudioToggle) this.onAudioToggle(!isMuted);
      });
    }
  }

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    const updateTime = () => {
      const clockEl = this.container.querySelector('#hud-solar-clock');
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toUTCString().substring(17, 25) + ' UTC';
      }
    };
    updateTime();
    this.clockInterval = setInterval(updateTime, 1000);
  }

  updateWallet(wallet) {
    this.state.wallet = wallet;
    const isdEl = this.container.querySelector('#hud-wallet-isd');
    const iskEl = this.container.querySelector('#hud-wallet-isk');
    if (isdEl) isdEl.textContent = '$' + wallet.isd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (iskEl) iskEl.textContent = wallet.isk.toLocaleString('en-US') + ' Ƶ';
  }

  updateTicker() {
    const track = this.container.querySelector('#ticker-track');
    if (track) {
      track.innerHTML = this.renderTickerItems() + this.renderTickerItems();
    }
  }

  destroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }
}

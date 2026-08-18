// ==========================================================================
// INTERSTELLAR // EVE COMMAND TERMINAL - ROOT APPLICATION COORDINATOR
// ==========================================================================

import './style.css';
import { TopHud } from './components/TopHud';
import { TacticalOverview } from './components/TacticalOverview';
import { TradingTerminal } from './components/TradingTerminal';
import { Spacecraft3D } from './components/Spacecraft3D';
import { MiningStation } from './components/MiningStation';
import { TelemetrySecrets } from './components/TelemetrySecrets';
import { sfx } from './audio/sfx';

class InterstellarApp {
  constructor() {
    this.state = {
      wallet: {
        isd: 12500000.00, // Interstellar Dollars
        isk: 15420000000, // EVE ISK Credits
        btc: 14.50,
        eth: 185.00
      },
      ores: {
        TRITANIUM: 620.0,
        PYERITE: 240.0,
        ISOGEN: 85.0,
        DARK_MATTER: 18.5
      },
      positions: [
        {
          pairId: 'BTC/ISD',
          side: 'LONG',
          entryPrice: 66800.00,
          margin: 25000,
          leverage: 20,
          time: Date.now() - 3600000
        },
        {
          pairId: 'QUANTUM/ISD',
          side: 'LONG',
          entryPrice: 38.50,
          margin: 10000,
          leverage: 10,
          time: Date.now() - 7200000
        }
      ],
      activeTab: 'dashboard',
      telemetrySeed: 'EVE_JITA_44'
    };

    this.topHud = null;
    this.currentViewInstance = null;
    this.rootContainer = document.querySelector('#app');
    this.viewHolder = null;
  }

  init() {
    if (!this.rootContainer) return;

    this.rootContainer.innerHTML = `
      <div id="hud-mount"></div>
      <main id="view-mount" style="flex:1; display:flex; flex-direction:column;"></main>
      <div class="toast-container" id="toast-mount"></div>
    `;

    const hudMount = this.rootContainer.querySelector('#hud-mount');
    this.viewHolder = this.rootContainer.querySelector('#view-mount');

    // Initialize Top HUD
    this.topHud = new TopHud(
      hudMount,
      this.state,
      (tab) => this.switchTab(tab),
      (soundEnabled) => this.onAudioToggle(soundEnabled)
    );
    this.topHud.render();

    // Render Initial View
    this.renderCurrentView();

    // Bind Global Keyboard Shortcuts
    this.bindGlobalShortcuts();

    // Welcome Audio / Notification
    setTimeout(() => {
      this.showToast('INTERSTELLAR Command System Online // Connected to JITA IV-4 Orbital Relay', 'success');
    }, 600);
  }

  switchTab(tabName) {
    if (this.state.activeTab === tabName) return;

    if (this.currentViewInstance && typeof this.currentViewInstance.destroy === 'function') {
      this.currentViewInstance.destroy();
    }

    this.state.activeTab = tabName;
    this.topHud.state.activeTab = tabName;
    this.topHud.render();

    this.renderCurrentView();
  }

  renderCurrentView() {
    if (!this.viewHolder) return;
    this.viewHolder.innerHTML = '';

    const showToast = (msg, type) => this.showToast(msg, type);

    switch (this.state.activeTab) {
      case 'dashboard':
        this.currentViewInstance = new TacticalOverview(
          this.viewHolder,
          this.state,
          (tab) => this.switchTab(tab),
          showToast
        );
        break;

      case 'trading':
        this.currentViewInstance = new TradingTerminal(
          this.viewHolder,
          this.state,
          (wallet) => this.onWalletUpdated(wallet),
          showToast
        );
        break;

      case 'shipyard':
        this.currentViewInstance = new Spacecraft3D(
          this.viewHolder,
          this.state,
          (wallet) => this.onWalletUpdated(wallet),
          showToast
        );
        break;

      case 'mining':
        this.currentViewInstance = new MiningStation(
          this.viewHolder,
          this.state,
          (wallet) => this.onWalletUpdated(wallet),
          showToast
        );
        break;

      case 'telemetry':
        this.currentViewInstance = new TelemetrySecrets(
          this.viewHolder,
          this.state,
          (wallet) => this.onWalletUpdated(wallet),
          showToast
        );
        break;

      default:
        this.currentViewInstance = new TacticalOverview(
          this.viewHolder,
          this.state,
          (tab) => this.switchTab(tab),
          showToast
        );
    }

    if (this.currentViewInstance) {
      this.currentViewInstance.render();
    }
  }

  onWalletUpdated(updatedWallet) {
    this.state.wallet = updatedWallet;
    if (this.topHud) {
      this.topHud.updateWallet(this.state.wallet);
    }
  }

  onAudioToggle(soundEnabled) {
    if (soundEnabled) {
      this.showToast('Tactical audio synthesizer unmuted.', 'success');
    } else {
      this.showToast('Tactical audio synthesizer muted.', 'warn');
    }
  }

  showToast(message, type = 'info') {
    const toastMount = this.rootContainer.querySelector('#toast-mount');
    if (!toastMount) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="font-family:var(--font-hud); font-size:0.75rem; color:var(--cyan); font-weight:700; margin-bottom:2px;">
        ${type === 'success' ? 'SYSTEM SUCCESS' : type === 'warn' ? 'TACTICAL ALERT' : type === 'error' ? 'SYSTEM ERROR' : 'TELEMETRY NOTICE'}
      </div>
      <div>${message}</div>
    `;

    toastMount.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 4500);
  }

  bindGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if (e.key === '1') this.switchTab('dashboard');
      if (e.key === '2') this.switchTab('trading');
      if (e.key === '3') this.switchTab('shipyard');
      if (e.key === '4') this.switchTab('mining');
      if (e.key === '5') this.switchTab('telemetry');
      if (e.key.toLowerCase() === 'm') {
        const isMuted = sfx.toggleMute();
        this.onAudioToggle(!isMuted);
      }
    });
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new InterstellarApp();
  app.init();
});

// Seeded Python Telemetry & Encrypted Secrets Enclave

import { generateTelemetryData, ENCRYPTED_SECRETS, executePythonScript } from '../data/pythonTelemetry';
import { sfx } from '../audio/sfx';

export class TelemetrySecrets {
  constructor(container, state, onTelemetryAction, showToast) {
    this.container = container;
    this.state = state;
    this.onTelemetryAction = onTelemetryAction;
    this.showToast = showToast;

    this.currentSeed = this.state.telemetrySeed || 'EVE_JITA_44';
    this.secrets = JSON.parse(JSON.stringify(ENCRYPTED_SECRETS));
    this.terminalLogs = [
      { text: '=== INTERSTELLAR PYTHON TELEMETRY REPL v3.12-EVE ===', type: 'header', time: '00:00:00' },
      { text: 'Type "help()" for available commands or "sys.status()" for system telemetry.', type: 'info', time: '00:00:00' },
      { text: `Current Seed: "${this.currentSeed}" | Quantum Synchronization: 99.84%`, type: 'cyan', time: '00:00:00' }
    ];

    this.commandHistory = [];
    this.historyIndex = -1;
    this.tick = 0;
    this.telemetryTimer = null;
  }

  render() {
    const telemetry = generateTelemetryData(this.currentSeed, this.tick);

    this.container.innerHTML = `
      <div class="view-container">
        
        <!-- TOP: Seed Selector & Real-Time Telemetry Gauges -->
        <div class="sci-panel" style="margin-bottom:16px;">
          <div class="panel-header">
            <span class="panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              SEEDED PYTHON TELEMETRY ENGINE (DETERMINISTIC PRNG)
            </span>
            <span class="panel-tag">SEED HASH: 0x${telemetry.seedInt.toString(16).toUpperCase()}</span>
          </div>

          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:14px;">
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">ACTIVE SEED:</span>
            <input type="text" class="sci-input" id="seed-input-box" value="${this.currentSeed}" style="min-width:220px;">
            <button class="btn-trade-buy" style="padding:6px 14px; font-size:0.75rem;" id="btn-apply-seed">
              SYNC SEED
            </button>

            <!-- Preset Seed Pills -->
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="viewport-btn" data-preset="EVE_JITA_44">EVE_JITA_44</button>
              <button class="viewport-btn" data-preset="NASA_LUNAR_2026">NASA_LUNAR_2026</button>
              <button class="viewport-btn" data-preset="QUANTUM_0x7F">QUANTUM_0x7F</button>
              <button class="viewport-btn" data-preset="OMEGA_CORE">OMEGA_CORE</button>
            </div>
          </div>

          <!-- Real-Time Telemetry Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px;">
            
            <div class="wallet-stat-card" style="text-align:left;">
              <span class="wallet-label">ORBITAL ALTITUDE</span>
              <span class="wallet-value" style="color:var(--cyan);" id="tel-alt">${telemetry.altitudeKm} km</span>
            </div>

            <div class="wallet-stat-card" style="text-align:left;">
              <span class="wallet-label">INCLINATION</span>
              <span class="wallet-value" style="color:var(--gold);" id="tel-inc">${telemetry.inclinationDeg}°</span>
            </div>

            <div class="wallet-stat-card" style="text-align:left;">
              <span class="wallet-label">VELOCITY</span>
              <span class="wallet-value" style="color:var(--emerald);" id="tel-vel">${telemetry.velocityKms} km/s</span>
            </div>

            <div class="wallet-stat-card" style="text-align:left;">
              <span class="wallet-label">QUANTUM COHERENCE</span>
              <span class="wallet-value" style="color:var(--cyan);" id="tel-quant">${telemetry.quantumCoherencePercent}%</span>
            </div>

            <div class="wallet-stat-card" style="text-align:left;">
              <span class="wallet-label">REACTOR CORE TEMP</span>
              <span class="wallet-value" style="color:var(--rust);" id="tel-therm">${telemetry.reactorThermalK} K</span>
            </div>

            <div class="wallet-stat-card" style="text-align:left;">
              <span class="wallet-label">DELTA-V REMAINING</span>
              <span class="wallet-value" style="color:var(--violet);" id="tel-deltav">${telemetry.deltaVMps} m/s</span>
            </div>

          </div>

          <!-- HMAC-SHA256 Telemetry Packet Checksum -->
          <div style="background:rgba(6,10,18,0.85); padding:8px 12px; border-radius:4px; margin-top:12px; border:1px solid rgba(0,240,255,0.15); font-family:var(--font-mono); font-size:0.72rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span style="color:#64748b;">PACKET CHECKSUM (SHA-256):</span>
            <span style="color:var(--cyan); word-break:break-all;" id="tel-checksum">${telemetry.packetChecksum}</span>
          </div>
        </div>

        <!-- BOTTOM: Python Terminal REPL + Encrypted Secrets Enclave -->
        <div class="telemetry-layout">
          
          <!-- LEFT: Python Interactive Terminal -->
          <div class="python-terminal">
            <div class="terminal-header">
              <div class="terminal-controls">
                <span class="term-dot red"></span>
                <span class="term-dot yellow"></span>
                <span class="term-dot green"></span>
              </div>
              <span style="font-size:0.75rem; color:#94a3b8; font-weight:600;">telemetry_repl.py - Python 3.12 (Seeded)</span>
              <span style="color:var(--emerald); font-size:0.7rem;">● ONLINE</span>
            </div>

            <div class="terminal-output" id="terminal-output-box">
              ${this.renderTerminalLogs()}
            </div>

            <div class="terminal-prompt-bar">
              <span class="terminal-prompt-symbol">&gt;&gt;&gt;</span>
              <input type="text" class="terminal-input" id="terminal-cmd-input" placeholder="Type python command (e.g. telemetry.scan_sector(), help())..." autocomplete="off">
            </div>
          </div>

          <!-- RIGHT: Encrypted Secrets Vault -->
          <div class="sci-panel">
            <div class="panel-header">
              <span class="panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ENCRYPTED SECRETS VAULT
              </span>
              <button class="btn-overcharge" style="padding:3px 8px; font-size:0.7rem;" id="btn-gen-entropy">
                GENERATE SEED
              </button>
            </div>

            <div class="secrets-list">
              ${this.renderSecretsList()}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
    this.startTelemetryTicks();
  }

  renderTerminalLogs() {
    return this.terminalLogs.map(log => `
      <div class="log-entry ${log.type}">
        <span class="log-time">[${log.time}]</span>
        <span>${log.text}</span>
      </div>
    `).join('');
  }

  renderSecretsList() {
    return this.secrets.map(sec => {
      const isDecrypted = sec.status === 'DECRYPTED';
      return `
        <div class="secret-card">
          <div class="secret-header">
            <span class="secret-label">${sec.label}</span>
            <span class="panel-tag" style="color:${isDecrypted ? 'var(--emerald)' : 'var(--violet)'}; border-color:${isDecrypted ? 'var(--emerald)' : 'var(--violet)'};">
              ${sec.status}
            </span>
          </div>

          ${isDecrypted ? `
            <div class="secret-decrypted-box">
              ${sec.decrypted}
            </div>
          ` : `
            <div class="secret-cipher">
              ${sec.cipherText}
            </div>
          `}

          <div class="secret-actions">
            <span style="font-family:var(--font-mono); font-size:0.68rem; color:#94a3b8;">
              Key Seed: <code style="color:var(--gold);">${sec.seedKey}</code>
            </span>

            ${isDecrypted ? `
              <button class="btn-sell-ore" style="font-size:0.68rem;" data-copy-secret="${sec.id}">
                COPY PAYLOAD
              </button>
            ` : `
              <button class="btn-decrypt" data-decrypt-id="${sec.id}">
                DECRYPT WITH SEED
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    // Apply custom seed
    const applySeedBtn = this.container.querySelector('#btn-apply-seed');
    const seedInput = this.container.querySelector('#seed-input-box');

    if (applySeedBtn && seedInput) {
      applySeedBtn.addEventListener('click', () => {
        const val = seedInput.value.trim();
        if (val) {
          sfx.playClick();
          this.currentSeed = val;
          this.state.telemetrySeed = val;
          this.showToast(`Python Telemetry Seed synchronized: "${val}"`, 'success');
          this.render();
        }
      });
    }

    // Seed preset buttons
    const presets = this.container.querySelectorAll('[data-preset]');
    presets.forEach(p => {
      p.addEventListener('click', () => {
        sfx.playClick();
        this.currentSeed = p.dataset.preset;
        this.state.telemetrySeed = this.currentSeed;
        this.showToast(`Loaded Seed Preset: "${this.currentSeed}"`, 'success');
        this.render();
      });
    });

    // Python Terminal Command Submission
    const cmdInput = this.container.querySelector('#terminal-cmd-input');
    if (cmdInput) {
      cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = cmdInput.value.trim();
          if (!cmd) return;

          this.commandHistory.push(cmd);
          this.historyIndex = this.commandHistory.length;

          sfx.playClick();
          this.executeCommand(cmd);
          cmdInput.value = '';
        } else if (e.key === 'ArrowUp') {
          if (this.historyIndex > 0) {
            this.historyIndex--;
            cmdInput.value = this.commandHistory[this.historyIndex] || '';
          }
        } else if (e.key === 'ArrowDown') {
          if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            cmdInput.value = this.commandHistory[this.historyIndex] || '';
          } else {
            this.historyIndex = this.commandHistory.length;
            cmdInput.value = '';
          }
        }
      });
    }

    // Decrypt Secrets Buttons
    this.bindSecretActions();

    // Generate Entropy Seed Button
    const btnGen = this.container.querySelector('#btn-gen-entropy');
    if (btnGen) {
      btnGen.addEventListener('click', () => {
        sfx.playClick();
        const hex = '0123456789ABCDEF';
        let rnd = 'QUANTUM_SEED_';
        for (let i = 0; i < 8; i++) rnd += hex[Math.floor(Math.random() * hex.length)];
        this.currentSeed = rnd;
        this.state.telemetrySeed = rnd;
        this.showToast(`Generated high-entropy seed: "${rnd}"`, 'success');
        this.render();
      });
    }
  }

  bindSecretActions() {
    const decryptBtns = this.container.querySelectorAll('[data-decrypt-id]');
    decryptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.decryptId;
        const secret = this.secrets.find(s => s.id === id);
        if (secret) {
          secret.status = 'DECRYPTED';
          sfx.playDecryptSuccess();
          this.showToast(`Decrypted secret "${secret.label}" with seed: ${secret.seedKey}`, 'success');
          
          const secList = this.container.querySelector('.secrets-list');
          if (secList) secList.innerHTML = this.renderSecretsList();
          this.bindSecretActions();
        }
      });
    });

    const copyBtns = this.container.querySelectorAll('[data-copy-secret]');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.copySecret;
        const secret = this.secrets.find(s => s.id === id);
        if (secret) {
          navigator.clipboard.writeText(secret.decrypted);
          sfx.playClick();
          this.showToast('Secret payload copied to clipboard!', 'success');
        }
      });
    });
  }

  executeCommand(cmd) {
    const res = executePythonScript(cmd, {
      currentSeed: this.currentSeed,
      positionsCount: this.state.positions.length
    });

    if (res.clear) {
      this.terminalLogs = [];
    } else {
      this.terminalLogs.push(...res.logs);
    }

    if (res.newSeed) {
      this.currentSeed = res.newSeed;
      this.state.telemetrySeed = res.newSeed;
    }

    if (res.decryptedSecretId) {
      const s = this.secrets.find(sec => sec.id === res.decryptedSecretId);
      if (s) {
        s.status = 'DECRYPTED';
        sfx.playDecryptSuccess();
        const secList = this.container.querySelector('.secrets-list');
        if (secList) secList.innerHTML = this.renderSecretsList();
        this.bindSecretActions();
      }
    }

    if (res.triggerArbitrageProfit) {
      this.state.wallet.isd += res.triggerArbitrageProfit;
      sfx.playTradeSuccess();
      this.showToast(`Arbitrage Bot profit credited: +$${res.triggerArbitrageProfit.toFixed(2)} ISD`, 'success');
      if (this.onTelemetryAction) this.onTelemetryAction(this.state.wallet);
    }

    // Scroll terminal to bottom
    const outBox = this.container.querySelector('#terminal-output-box');
    if (outBox) {
      outBox.innerHTML = this.renderTerminalLogs();
      outBox.scrollTop = outBox.scrollHeight;
    }
  }

  startTelemetryTicks() {
    if (this.telemetryTimer) clearInterval(this.telemetryTimer);

    this.telemetryTimer = setInterval(() => {
      this.tick++;
      const data = generateTelemetryData(this.currentSeed, this.tick);

      const altEl = this.container.querySelector('#tel-alt');
      const incEl = this.container.querySelector('#tel-inc');
      const velEl = this.container.querySelector('#tel-vel');
      const quantEl = this.container.querySelector('#tel-quant');
      const thermEl = this.container.querySelector('#tel-therm');
      const deltavEl = this.container.querySelector('#tel-deltav');
      const checkEl = this.container.querySelector('#tel-checksum');

      if (altEl) altEl.textContent = `${data.altitudeKm} km`;
      if (incEl) incEl.textContent = `${data.inclinationDeg}°`;
      if (velEl) velEl.textContent = `${data.velocityKms} km/s`;
      if (quantEl) quantEl.textContent = `${data.quantumCoherencePercent}%`;
      if (thermEl) thermEl.textContent = `${data.reactorThermalK} K`;
      if (deltavEl) deltavEl.textContent = `${data.deltaVMps} m/s`;
      if (checkEl) checkEl.textContent = data.packetChecksum;
    }, 1000);
  }

  destroy() {
    if (this.telemetryTimer) clearInterval(this.telemetryTimer);
  }
}

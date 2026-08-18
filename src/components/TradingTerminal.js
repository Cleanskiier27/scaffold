// All-in-One Multi-Market Trading Terminal (Crypto, Forex & Interstellar Commodities)

import { MARKET_PAIRS, generateCandles, generateOrderBook } from '../data/marketData';
import { sfx } from '../audio/sfx';

export class TradingTerminal {
  constructor(container, state, onOrderExecuted, showToast) {
    this.container = container;
    this.state = state;
    this.onOrderExecuted = onOrderExecuted;
    this.showToast = showToast;

    this.selectedCategory = 'all';
    this.selectedPairId = 'BTC/ISD';
    this.selectedTimeframe = 5; // 5 min
    this.orderType = 'market';
    this.leverage = 10;
    this.tradeAmount = 1000;
    
    this.candles = [];
    this.orderBook = null;
    this.canvas = null;
    this.ctx = null;
    this.mousePos = null;

    this.tickTimer = null;
  }

  render() {
    this.candles = generateCandles(this.selectedPairId, 65, this.selectedTimeframe);
    this.orderBook = generateOrderBook(this.selectedPairId);
    const currentPair = MARKET_PAIRS[this.selectedPairId];

    this.container.innerHTML = `
      <div class="view-container">
        <div class="trading-layout">
          
          <!-- LEFT: Asset Selector & Market Categories -->
          <div class="sci-panel asset-picker-panel">
            <div class="panel-header">
              <span class="panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                MARKETS
              </span>
              <span class="panel-tag">${Object.keys(MARKET_PAIRS).length} PAIRS</span>
            </div>

            <!-- Category Selector Tabs -->
            <div class="market-category-tabs">
              <button class="cat-btn ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">ALL</button>
              <button class="cat-btn ${this.selectedCategory === 'crypto' ? 'active' : ''}" data-cat="crypto">CRYPTO</button>
              <button class="cat-btn ${this.selectedCategory === 'forex' ? 'active' : ''}" data-cat="forex">FOREX</button>
              <button class="cat-btn ${this.selectedCategory === 'commodities' ? 'active' : ''}" data-cat="commodities">MINERALS</button>
            </div>

            <!-- Asset List -->
            <div class="asset-list" id="trading-asset-list">
              ${this.renderAssetList()}
            </div>
          </div>

          <!-- CENTER: Candlestick Chart & Active Positions -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="sci-panel">
              <div class="chart-toolbar">
                <div class="chart-stats-summary">
                  <span style="font-family:var(--font-hud); font-size:1.1rem; color:#fff; font-weight:700;">
                    ${currentPair.id}
                  </span>
                  <span style="font-size:1.1rem; color:var(--cyan); font-weight:600;" id="chart-live-price">
                    $${currentPair.price.toLocaleString('en-US', { minimumFractionDigits: currentPair.precision })}
                  </span>
                  <span class="${currentPair.change24h >= 0 ? 'ticker-change up' : 'ticker-change down'}" id="chart-live-change">
                    ${currentPair.change24h >= 0 ? '+' : ''}${currentPair.change24h.toFixed(2)}%
                  </span>
                  <span style="color:#64748b;">24h High: $${currentPair.high24h.toLocaleString()}</span>
                  <span style="color:#64748b;">Vol: ${currentPair.volume24h}</span>
                </div>

                <!-- Timeframe Selector -->
                <div class="chart-timeframe-selector">
                  <button class="tf-btn ${this.selectedTimeframe === 1 ? 'active' : ''}" data-tf="1">1m</button>
                  <button class="tf-btn ${this.selectedTimeframe === 5 ? 'active' : ''}" data-tf="5">5m</button>
                  <button class="tf-btn ${this.selectedTimeframe === 15 ? 'active' : ''}" data-tf="15">15m</button>
                  <button class="tf-btn ${this.selectedTimeframe === 60 ? 'active' : ''}" data-tf="60">1h</button>
                  <button class="tf-btn ${this.selectedTimeframe === 1440 ? 'active' : ''}" data-tf="1440">1D</button>
                </div>
              </div>

              <!-- Interactive Candlestick Canvas -->
              <div class="chart-container">
                <canvas class="candlestick-canvas" id="candlestick-canvas"></canvas>
              </div>
            </div>

            <!-- Active Positions Table -->
            <div class="sci-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                  OPEN TACTICAL POSITIONS &amp; ARBITRAGE
                </span>
                <span class="panel-tag">${this.state.positions.length} ACTIVE</span>
              </div>

              <div style="overflow-x:auto;">
                <table class="order-book-table" style="font-size:0.8rem;">
                  <thead>
                    <tr>
                      <th>PAIR / ASSET</th>
                      <th>TYPE</th>
                      <th>LEVERAGE</th>
                      <th>ENTRY PRICE</th>
                      <th>MARK PRICE</th>
                      <th>MARGIN</th>
                      <th>PNL (ISD)</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody id="positions-table-body">
                    ${this.renderPositionsTable()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- RIGHT: Order Book & Execution Terminal -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            
            <!-- Live Order Book -->
            <div class="sci-panel" style="padding:12px;">
              <div class="panel-header" style="margin-bottom:8px;">
                <span class="panel-title" style="font-size:0.85rem;">ORDER BOOK</span>
                <span style="font-family:var(--font-mono); font-size:0.7rem; color:#94a3b8;">
                  SPREAD: <span id="ob-spread" style="color:var(--cyan);">${this.orderBook.spread.toFixed(currentPair.precision)} (${this.orderBook.spreadPercent}%)</span>
                </span>
              </div>

              <table class="order-book-table" id="order-book-table">
                <thead>
                  <tr>
                    <th>PRICE (${currentPair.symbol})</th>
                    <th>SIZE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody id="order-book-asks">
                  ${this.renderAsks()}
                </tbody>
              </table>

              <div class="order-spread-row" id="ob-mid-price">
                LAST: $${currentPair.price.toLocaleString('en-US', { minimumFractionDigits: currentPair.precision })}
              </div>

              <table class="order-book-table">
                <tbody id="order-book-bids">
                  ${this.renderBids()}
                </tbody>
              </table>
            </div>

            <!-- Trade Execution Ticket -->
            <div class="sci-panel">
              <div class="panel-header">
                <span class="panel-title">EXECUTION TERMINAL</span>
                <span class="panel-tag" style="color:var(--gold); border-color:var(--gold);">HYPER-LEVERAGE</span>
              </div>

              <div class="trade-form">
                <!-- Order Type -->
                <div class="order-type-tabs">
                  <button class="order-type-btn ${this.orderType === 'market' ? 'active' : ''}" data-type="market">MARKET</button>
                  <button class="order-type-btn ${this.orderType === 'limit' ? 'active' : ''}" data-type="limit">LIMIT</button>
                  <button class="order-type-btn ${this.orderType === 'arbitrage' ? 'active' : ''}" data-type="arbitrage">ARBITRAGE</button>
                </div>

                <!-- Amount Input -->
                <div class="input-field-group">
                  <label class="input-label">
                    <span>POSITION MARGIN (ISD)</span>
                    <span style="color:var(--cyan);">MAX: $${this.state.wallet.isd.toLocaleString()}</span>
                  </label>
                  <input type="number" class="sci-input" id="trade-amount-input" value="${this.tradeAmount}" min="10" max="${this.state.wallet.isd}">
                </div>

                <!-- Leverage Slider -->
                <div class="input-field-group">
                  <div class="input-label">
                    <span>LEVERAGE MULTIPLIER</span>
                    <span class="leverage-badge" id="leverage-display">${this.leverage}x</span>
                  </div>
                  <div class="slider-container">
                    <input type="range" class="sci-range" id="leverage-slider" min="1" max="100" value="${this.leverage}">
                  </div>
                </div>

                <!-- Trade Info Summary -->
                <div style="background:rgba(6,10,18,0.7); padding:8px; border-radius:4px; font-family:var(--font-mono); font-size:0.72rem; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:#94a3b8;">Total Exposure:</span>
                    <span style="color:#fff;" id="trade-notional-val">$${(this.tradeAmount * this.leverage).toLocaleString()}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:#94a3b8;">Est. Liquidation Price:</span>
                    <span style="color:var(--rust);" id="trade-liq-price">$${(currentPair.price * (1 - 0.9 / this.leverage)).toFixed(currentPair.precision)}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:#94a3b8;">Execution Protocol:</span>
                    <span style="color:var(--cyan);">JITA QUANTUM ROUTER</span>
                  </div>
                </div>

                <!-- Buy / Sell Actions -->
                <div class="trade-action-grid">
                  <button class="btn-trade-buy" id="btn-trade-long">
                    LONG / BUY
                  </button>
                  <button class="btn-trade-sell" id="btn-trade-short">
                    SHORT / SELL
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
    this.initCanvas();
    this.startLiveTicks();
  }

  renderAssetList() {
    return Object.values(MARKET_PAIRS)
      .filter(pair => this.selectedCategory === 'all' || pair.category === this.selectedCategory)
      .map(pair => {
        const isSelected = pair.id === this.selectedPairId;
        const isUp = pair.change24h >= 0;
        return `
          <div class="asset-row ${isSelected ? 'selected' : ''}" data-pair="${pair.id}">
            <div class="asset-sym-block">
              <span class="asset-id">${pair.id}</span>
              <span class="asset-name">${pair.name}</span>
            </div>
            <div class="asset-price-block">
              <div class="asset-p">$${pair.price > 100 ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : pair.price.toFixed(pair.precision)}</div>
              <div class="asset-c ${isUp ? 'ticker-change up' : 'ticker-change down'}">${isUp ? '+' : ''}${pair.change24h.toFixed(2)}%</div>
            </div>
          </div>
        `;
      }).join('');
  }

  renderAsks() {
    return this.orderBook.asks.slice().reverse().map(ask => {
      const depthWidth = Math.min(100, (ask.total / (this.orderBook.asks[this.orderBook.asks.length - 1].total || 1)) * 100);
      return `
        <tr class="order-row ask" style="background:linear-gradient(90deg, transparent ${100 - depthWidth}%, rgba(239,68,68,0.12) ${100 - depthWidth}%);">
          <td>$${ask.price.toFixed(MARKET_PAIRS[this.selectedPairId].precision)}</td>
          <td>${ask.amount.toFixed(3)}</td>
          <td style="color:#94a3b8;">${ask.total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  renderBids() {
    return this.orderBook.bids.map(bid => {
      const depthWidth = Math.min(100, (bid.total / (this.orderBook.bids[this.orderBook.bids.length - 1].total || 1)) * 100);
      return `
        <tr class="order-row bid" style="background:linear-gradient(90deg, transparent ${100 - depthWidth}%, rgba(16,185,129,0.12) ${100 - depthWidth}%);">
          <td>$${bid.price.toFixed(MARKET_PAIRS[this.selectedPairId].precision)}</td>
          <td>${bid.amount.toFixed(3)}</td>
          <td style="color:#94a3b8;">${bid.total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  renderPositionsTable() {
    if (this.state.positions.length === 0) {
      return `
        <tr>
          <td colspan="8" style="text-align:center; padding:24px; color:#64748b; font-family:var(--font-mono);">
            NO ACTIVE ORDERS // DEPLOY CAPITAL VIA EXECUTION TERMINAL
          </td>
        </tr>
      `;
    }

    return this.state.positions.map((pos, idx) => {
      const pair = MARKET_PAIRS[pos.pairId] || { price: pos.entryPrice };
      const currentPrice = pair.price;
      const priceDelta = pos.side === 'LONG' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
      const pnl = (priceDelta / pos.entryPrice) * pos.margin * pos.leverage;
      const isProfitable = pnl >= 0;

      return `
        <tr>
          <td style="font-weight:700; color:#fff;">${pos.pairId}</td>
          <td><span style="color:${pos.side === 'LONG' ? 'var(--emerald)' : 'var(--red)'}; font-weight:700;">${pos.side}</span></td>
          <td><span class="leverage-badge">${pos.leverage}x</span></td>
          <td>$${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td>$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td>$${pos.margin.toLocaleString()}</td>
          <td style="color:${isProfitable ? 'var(--emerald)' : 'var(--red)'}; font-weight:700;">
            ${isProfitable ? '+' : ''}$${pnl.toFixed(2)} (${((pnl / pos.margin) * 100).toFixed(1)}%)
          </td>
          <td>
            <button class="btn-trade-sell" style="padding:3px 8px; font-size:0.7rem;" data-pos-idx="${idx}">
              CLOSE
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  initCanvas() {
    this.canvas = this.container.querySelector('#candlestick-canvas');
    if (!this.canvas) return;

    // Full 4K DPR — use actual devicePixelRatio up to 3
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.canvas.width  = rect.width  * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.scale(dpr, dpr);
      // Improve sub-pixel rendering
      this.ctx.imageSmoothingEnabled  = true;
      this.ctx.imageSmoothingQuality  = 'high';
      this.drawChart(rect.width, rect.height);
    };

    resize();

    // Responsive — re-scale on viewport changes (window resize or panel resize)
    const ro = new ResizeObserver(() => resize());
    ro.observe(this.canvas.parentElement || this.canvas);
    this._canvasRO = ro;

    this.canvas.addEventListener('mousemove', (e) => {
      const bounds = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top
      };
      this.drawChart(bounds.width, bounds.height);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mousePos = null;
      const bounds = this.canvas.getBoundingClientRect();
      this.drawChart(bounds.width, bounds.height);
    });
  }


  drawChart(width, height) {
    if (!this.ctx || this.candles.length === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    // Padding
    const padTop = 20;
    const padBottom = 40;
    const padRight = 65;
    const padLeft = 10;
    const chartW = width - padRight - padLeft;
    const chartH = height - padTop - padBottom;

    // Find min / max price
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    this.candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const priceRange = (maxPrice - minPrice) || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const finalRange = maxPrice - minPrice;

    const getY = (p) => padTop + chartH - ((p - minPrice) / finalRange) * chartH;
    const candleW = Math.max(3, (chartW / this.candles.length) * 0.7);
    const stepX = chartW / this.candles.length;

    // Draw Grid Lines & Price Labels
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';

    for (let i = 0; i <= 5; i++) {
      const y = padTop + (chartH / 5) * i;
      const p = maxPrice - (finalRange / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText('$' + p.toFixed(MARKET_PAIRS[this.selectedPairId].precision), width - padRight + 6, y + 3);
    }

    // Draw Volume Bars
    this.candles.forEach((c, idx) => {
      const x = padLeft + idx * stepX + (stepX - candleW) / 2;
      const vH = (c.volume / (maxVolume || 1)) * 55;
      const y = padTop + chartH - vH;

      ctx.fillStyle = c.close >= c.open ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      ctx.fillRect(x, y, candleW, vH);
    });

    // Draw Candlesticks
    this.candles.forEach((c, idx) => {
      const x = padLeft + idx * stepX + (stepX - candleW) / 2;
      const centerX = x + candleW / 2;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const isBullish = c.close >= c.open;
      const color = isBullish ? '#10b981' : '#ef4444';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(centerX, highY);
      ctx.lineTo(centerX, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x, topY, candleW, bodyH);
    });

    // Draw EMA 20 line (Cyan)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let ema20 = this.candles[0].close;
    const k = 2 / (20 + 1);

    this.candles.forEach((c, idx) => {
      ema20 = c.close * k + ema20 * (1 - k);
      const x = padLeft + idx * stepX + stepX / 2;
      const y = getY(ema20);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Crosshair inspection
    if (this.mousePos && this.mousePos.x >= padLeft && this.mousePos.x <= width - padRight) {
      const mX = this.mousePos.x;
      const mY = this.mousePos.y;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mX, padTop);
      ctx.lineTo(mX, height - padBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padLeft, mY);
      ctx.lineTo(width - padRight, mY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hovered Price Badge
      const hoveredPrice = maxPrice - ((mY - padTop) / chartH) * finalRange;
      ctx.fillStyle = 'var(--cyan)';
      ctx.fillRect(width - padRight, mY - 10, padRight - 5, 20);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.fillText('$' + hoveredPrice.toFixed(2), width - padRight + 4, mY + 3);
    }
  }

  bindEvents() {
    // Category filtering
    const catBtns = this.container.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.selectedCategory = btn.dataset.cat;
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const listEl = this.container.querySelector('#trading-asset-list');
        if (listEl) listEl.innerHTML = this.renderAssetList();
        this.bindAssetRowEvents();
      });
    });

    this.bindAssetRowEvents();

    // Timeframe selector
    const tfBtns = this.container.querySelectorAll('.tf-btn');
    tfBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.selectedTimeframe = parseInt(btn.dataset.tf);
        tfBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.candles = generateCandles(this.selectedPairId, 65, this.selectedTimeframe);
        const rect = this.canvas.getBoundingClientRect();
        this.drawChart(rect.width, rect.height);
      });
    });

    // Order Type Tabs
    const typeBtns = this.container.querySelectorAll('.order-type-btn');
    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.orderType = btn.dataset.type;
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Leverage Slider
    const levSlider = this.container.querySelector('#leverage-slider');
    const levDisplay = this.container.querySelector('#leverage-display');
    const notionalVal = this.container.querySelector('#trade-notional-val');
    const liqPriceEl = this.container.querySelector('#trade-liq-price');
    const amountInput = this.container.querySelector('#trade-amount-input');

    if (levSlider) {
      levSlider.addEventListener('input', (e) => {
        this.leverage = parseInt(e.target.value);
        if (levDisplay) levDisplay.textContent = this.leverage + 'x';
        this.updateTradeSummary(notionalVal, liqPriceEl);
      });
    }

    if (amountInput) {
      amountInput.addEventListener('input', (e) => {
        this.tradeAmount = parseFloat(e.target.value) || 0;
        this.updateTradeSummary(notionalVal, liqPriceEl);
      });
    }

    // Trade Buy / Sell Action Buttons
    const btnLong = this.container.querySelector('#btn-trade-long');
    const btnShort = this.container.querySelector('#btn-trade-short');

    if (btnLong) {
      btnLong.addEventListener('click', () => this.executeTrade('LONG'));
    }
    if (btnShort) {
      btnShort.addEventListener('click', () => this.executeTrade('SHORT'));
    }

    // Close Position buttons
    this.bindPositionCloseEvents();
  }

  bindAssetRowEvents() {
    const rows = this.container.querySelectorAll('.asset-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        sfx.playClick();
        this.selectedPairId = row.dataset.pair;
        this.render();
      });
    });
  }

  bindPositionCloseEvents() {
    const closeBtns = this.container.querySelectorAll('[data-pos-idx]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.posIdx);
        const pos = this.state.positions[idx];
        if (pos) {
          const currentPrice = MARKET_PAIRS[pos.pairId].price;
          const delta = pos.side === 'LONG' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
          const pnl = (delta / pos.entryPrice) * pos.margin * pos.leverage;
          
          this.state.wallet.isd += (pos.margin + pnl);
          this.state.positions.splice(idx, 1);
          
          sfx.playTradeSuccess();
          this.showToast(`Position closed: ${pos.pairId} (${pos.side}). PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, pnl >= 0 ? 'success' : 'warn');
          
          const tbody = this.container.querySelector('#positions-table-body');
          if (tbody) tbody.innerHTML = this.renderPositionsTable();
          this.bindPositionCloseEvents();
          if (this.onOrderExecuted) this.onOrderExecuted(this.state.wallet);
        }
      });
    });
  }

  updateTradeSummary(notionalVal, liqPriceEl) {
    const currentPair = MARKET_PAIRS[this.selectedPairId];
    if (notionalVal) notionalVal.textContent = '$' + (this.tradeAmount * this.leverage).toLocaleString();
    if (liqPriceEl) {
      const liq = currentPair.price * (1 - 0.9 / this.leverage);
      liqPriceEl.textContent = '$' + liq.toFixed(currentPair.precision);
    }
  }

  executeTrade(side) {
    if (this.tradeAmount <= 0 || this.tradeAmount > this.state.wallet.isd) {
      sfx.playAlert();
      this.showToast('Insufficient ISD balance for this margin amount!', 'error');
      return;
    }

    const pair = MARKET_PAIRS[this.selectedPairId];
    this.state.wallet.isd -= this.tradeAmount;

    const newPosition = {
      pairId: this.selectedPairId,
      side,
      entryPrice: pair.price,
      margin: this.tradeAmount,
      leverage: this.leverage,
      time: Date.now()
    };

    this.state.positions.push(newPosition);
    sfx.playTradeSuccess();
    this.showToast(`Tactical Order Placed: ${side} ${pair.id} @ $${pair.price.toLocaleString()} (${this.leverage}x Leverage)`, 'success');

    // Update positions table
    const tbody = this.container.querySelector('#positions-table-body');
    if (tbody) tbody.innerHTML = this.renderPositionsTable();
    this.bindPositionCloseEvents();

    if (this.onOrderExecuted) this.onOrderExecuted(this.state.wallet);
  }

  startLiveTicks() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => {
      // Fluctuate prices subtly
      Object.values(MARKET_PAIRS).forEach(pair => {
        const delta = (Math.random() - 0.495) * pair.price * pair.volatility * 0.4;
        pair.price = Math.max(pair.basePrice * 0.2, pair.price + delta);
      });

      // Update current candle
      if (this.candles.length > 0) {
        const lastCandle = this.candles[this.candles.length - 1];
        const currentPrice = MARKET_PAIRS[this.selectedPairId].price;
        lastCandle.close = currentPrice;
        lastCandle.high = Math.max(lastCandle.high, currentPrice);
        lastCandle.low = Math.min(lastCandle.low, currentPrice);
      }

      // Re-render order book and chart
      this.orderBook = generateOrderBook(this.selectedPairId);
      const pair = MARKET_PAIRS[this.selectedPairId];

      const priceEl = this.container.querySelector('#chart-live-price');
      if (priceEl) priceEl.textContent = '$' + (pair.price > 100 ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : pair.price.toFixed(pair.precision));

      const obAsks = this.container.querySelector('#order-book-asks');
      const obBids = this.container.querySelector('#order-book-bids');
      const obSpread = this.container.querySelector('#ob-spread');
      const obMid = this.container.querySelector('#ob-mid-price');

      if (obAsks) obAsks.innerHTML = this.renderAsks();
      if (obBids) obBids.innerHTML = this.renderBids();
      if (obSpread) obSpread.textContent = `${this.orderBook.spread.toFixed(pair.precision)} (${this.orderBook.spreadPercent}%)`;
      if (obMid) obMid.textContent = `LAST: $${pair.price.toLocaleString('en-US', { minimumFractionDigits: pair.precision })}`;

      if (this.canvas) {
        const bounds = this.canvas.getBoundingClientRect();
        this.drawChart(bounds.width, bounds.height);
      }

      // Update positions PnL display
      const tbody = this.container.querySelector('#positions-table-body');
      if (tbody && this.state.positions.length > 0) {
        tbody.innerHTML = this.renderPositionsTable();
        this.bindPositionCloseEvents();
      }
    }, 1200);
  }

  destroy() {
    if (this.tickTimer) clearInterval(this.tickTimer);
  }
}

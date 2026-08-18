// Real-Time Multi-Market Feed & Data Generators (Crypto, Forex & Interstellar Commodities)

export const MARKET_PAIRS = {
  // Crypto Pairs
  'BTC/ISD': {
    id: 'BTC/ISD',
    name: 'Bitcoin / Interstellar Dollar',
    category: 'crypto',
    basePrice: 67450.00,
    price: 67450.00,
    change24h: 3.84,
    high24h: 68900.00,
    low24h: 64800.00,
    volume24h: '4.82B ISD',
    precision: 2,
    symbol: '₿',
    volatility: 0.0018
  },
  'ETH/ISD': {
    id: 'ETH/ISD',
    name: 'Ethereum / Interstellar Dollar',
    category: 'crypto',
    basePrice: 3560.50,
    price: 3560.50,
    change24h: 5.12,
    high24h: 3680.00,
    low24h: 3410.00,
    volume24h: '2.19B ISD',
    precision: 2,
    symbol: 'Ξ',
    volatility: 0.0022
  },
  'SOL/ISD': {
    id: 'SOL/ISD',
    name: 'Solana / Interstellar Dollar',
    category: 'crypto',
    basePrice: 184.25,
    price: 184.25,
    change24h: -1.45,
    high24h: 192.00,
    low24h: 178.50,
    volume24h: '840M ISD',
    precision: 2,
    symbol: '◎',
    volatility: 0.003
  },
  'QUANTUM/ISD': {
    id: 'QUANTUM/ISD',
    name: 'Quantum Core Token',
    category: 'crypto',
    basePrice: 42.80,
    price: 42.80,
    change24h: 14.60,
    high24h: 48.00,
    low24h: 36.20,
    volume24h: '310M ISD',
    precision: 3,
    symbol: 'Ψ',
    volatility: 0.0045
  },
  'ISK/ISD': {
    id: 'ISK/ISD',
    name: 'Interstellar Kredit / ISD',
    category: 'crypto',
    basePrice: 0.00084,
    price: 0.00084,
    change24h: 0.72,
    high24h: 0.00089,
    low24h: 0.00081,
    volume24h: '12.4B ISK',
    precision: 6,
    symbol: 'Ƶ',
    volatility: 0.0012
  },

  // Forex Pairs
  'EUR/USD': {
    id: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    basePrice: 1.0875,
    price: 1.0875,
    change24h: 0.18,
    high24h: 1.0910,
    low24h: 1.0840,
    volume24h: '98.5B USD',
    precision: 4,
    symbol: '€',
    volatility: 0.0004
  },
  'GBP/USD': {
    id: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'forex',
    basePrice: 1.2965,
    price: 1.2965,
    change24h: -0.25,
    high24h: 1.3020,
    low24h: 1.2930,
    volume24h: '64.2B USD',
    precision: 4,
    symbol: '£',
    volatility: 0.0005
  },
  'USD/JPY': {
    id: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'forex',
    basePrice: 154.60,
    price: 154.60,
    change24h: 0.42,
    high24h: 155.40,
    low24h: 153.80,
    volume24h: '82.1B USD',
    precision: 2,
    symbol: '¥',
    volatility: 0.0006
  },
  'SOLAR/CRED': {
    id: 'SOLAR/CRED',
    name: 'Solar Reserve / Federation Credit',
    category: 'forex',
    basePrice: 4.7250,
    price: 4.7250,
    change24h: 2.15,
    high24h: 4.8800,
    low24h: 4.6100,
    volume24h: '15.8B CRED',
    precision: 4,
    symbol: '☼',
    volatility: 0.0009
  },

  // Interstellar Minerals & Commodities
  'TRITANIUM': {
    id: 'TRITANIUM',
    name: 'Tritanium (m³)',
    category: 'commodities',
    basePrice: 6.45,
    price: 6.45,
    change24h: 4.25,
    high24h: 7.10,
    low24h: 6.10,
    volume24h: '1.4B m³',
    precision: 2,
    symbol: '⚡',
    volatility: 0.002
  },
  'PYERITE': {
    id: 'PYERITE',
    name: 'Pyerite (m³)',
    category: 'commodities',
    basePrice: 14.80,
    price: 14.80,
    change24h: -2.30,
    high24h: 15.90,
    low24h: 14.20,
    volume24h: '840M m³',
    precision: 2,
    symbol: '💎',
    volatility: 0.0025
  },
  'ISOGEN': {
    id: 'ISOGEN',
    name: 'Isogen Dark Mineral (m³)',
    category: 'commodities',
    basePrice: 432.00,
    price: 432.00,
    change24h: 8.75,
    high24h: 460.00,
    low24h: 395.00,
    volume24h: '94M m³',
    precision: 2,
    symbol: '🌀',
    volatility: 0.004
  },
  'DARK_MATTER': {
    id: 'DARK_MATTER',
    name: 'Exotic Dark Matter (mg)',
    category: 'commodities',
    basePrice: 2890.00,
    price: 2890.00,
    change24h: 18.20,
    high24h: 3200.00,
    low24h: 2450.00,
    volume24h: '12,500 mg',
    precision: 2,
    symbol: '⚛',
    volatility: 0.006
  },
  'HELIUM_3': {
    id: 'HELIUM_3',
    name: 'Helium-3 Fusion Fuel (L)',
    category: 'commodities',
    basePrice: 1120.00,
    price: 1120.00,
    change24h: 1.10,
    high24h: 1180.00,
    low24h: 1090.00,
    volume24h: '4.2M L',
    precision: 2,
    symbol: '🔥',
    volatility: 0.0015
  }
};

// Generate realistic historical candlestick data
export function generateCandles(pairId, count = 60, intervalMinutes = 5) {
  const pair = MARKET_PAIRS[pairId] || MARKET_PAIRS['BTC/ISD'];
  const now = Date.now();
  const stepMs = intervalMinutes * 60 * 1000;
  let currentPrice = pair.price * (1 - pair.change24h / 200);

  const candles = [];
  for (let i = count; i >= 0; i--) {
    const time = now - i * stepMs;
    const delta = (Math.random() - 0.485) * pair.price * pair.volatility * Math.sqrt(intervalMinutes);
    const open = currentPrice;
    const close = Math.max(open * 0.5, open + delta);
    const high = Math.max(open, close) + Math.random() * pair.price * pair.volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * pair.price * pair.volatility * 0.6;
    const volume = Math.floor(Math.random() * 1000 + 200) * (pair.price > 1000 ? 1 : 50);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  // Ensure current candle matches live price
  candles[candles.length - 1].close = pair.price;
  candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, pair.price);
  candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, pair.price);

  return candles;
}

// Generate Live Order Book
export function generateOrderBook(pairId) {
  const pair = MARKET_PAIRS[pairId] || MARKET_PAIRS['BTC/ISD'];
  const p = pair.price;
  const spread = p * 0.0004;

  const bids = [];
  const asks = [];

  let cumBid = 0;
  let cumAsk = 0;

  for (let i = 1; i <= 9; i++) {
    const bidPrice = p - spread * i - (Math.random() * spread * 0.3);
    const bidSize = (Math.random() * 2.5 + 0.2) * (p > 1000 ? 1.5 : 80);
    cumBid += bidSize;
    bids.push({
      price: bidPrice,
      amount: bidSize,
      total: cumBid
    });

    const askPrice = p + spread * i + (Math.random() * spread * 0.3);
    const askSize = (Math.random() * 2.5 + 0.2) * (p > 1000 ? 1.5 : 80);
    cumAsk += askSize;
    asks.push({
      price: askPrice,
      amount: askSize,
      total: cumAsk
    });
  }

  return {
    bids,
    asks,
    spread: (asks[0].price - bids[0].price),
    spreadPercent: (((asks[0].price - bids[0].price) / p) * 100).toFixed(3)
  };
}

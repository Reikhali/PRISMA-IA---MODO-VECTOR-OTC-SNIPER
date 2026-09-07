import { AssetPair, BullBearAnalysis, Candle, ServerNode, SniperSignal, Timeframe } from '../types';

export const ASSET_PAIRS: AssetPair[] = [
  // --- OptGo OTC Paridades (Mercado Forex OTC 24/7) ---
  { id: 'eur_usd_otc', name: 'EUR/USD (OTC)', symbol: 'EURUSD-OTC', type: 'OTC', payout: 89, basePrice: 1.1704, decimals: 5, change24h: +0.42, isHot: true, activeId: 76 },
  { id: 'usd_brl_otc', name: 'USD/BRL (OTC)', symbol: 'USDBRL-OTC', type: 'OTC', payout: 84, basePrice: 5.0747, decimals: 4, change24h: +1.18, isHot: true, activeId: 2298 },
  { id: 'gbp_usd_otc', name: 'GBP/USD (OTC)', symbol: 'GBPUSD-OTC', type: 'OTC', payout: 89, basePrice: 1.3789, decimals: 5, change24h: +0.37, isHot: true, activeId: 81 },
  { id: 'usd_jpy_otc', name: 'USD/JPY (OTC)', symbol: 'USDJPY-OTC', type: 'OTC', payout: 89, basePrice: 156.28, decimals: 3, change24h: -0.25, isHot: true, activeId: 85 },
  { id: 'eur_jpy_otc', name: 'EUR/JPY (OTC)', symbol: 'EURJPY-OTC', type: 'OTC', payout: 89, basePrice: 181.85, decimals: 3, change24h: +0.48, activeId: 79 },
  { id: 'gbp_jpy_otc', name: 'GBP/JPY (OTC)', symbol: 'GBPJPY-OTC', type: 'OTC', payout: 89, basePrice: 210.77, decimals: 3, change24h: +0.62, isHot: true, activeId: 84 },
  { id: 'eur_gbp_otc', name: 'EUR/GBP (OTC)', symbol: 'EURGBP-OTC', type: 'OTC', payout: 89, basePrice: 0.8648, decimals: 5, change24h: -0.12, activeId: 77 },
  { id: 'aud_cad_otc', name: 'AUD/CAD (OTC)', symbol: 'AUDCAD-OTC', type: 'OTC', payout: 89, basePrice: 0.9971, decimals: 5, change24h: -0.19, activeId: 86 },
  { id: 'aud_usd_otc', name: 'AUD/USD (OTC)', symbol: 'AUDUSD-OTC', type: 'OTC', payout: 84, basePrice: 0.6584, decimals: 5, change24h: +0.34, activeId: 2111 },
  { id: 'usd_cad_otc', name: 'USD/CAD (OTC)', symbol: 'USDCAD-OTC', type: 'OTC', payout: 84, basePrice: 1.3712, decimals: 5, change24h: +0.25, activeId: 2112 },
  { id: 'usd_chf_otc', name: 'USD/CHF (OTC)', symbol: 'USDCHF-OTC', type: 'OTC', payout: 89, basePrice: 0.8174, decimals: 5, change24h: -0.28, activeId: 78 },
  { id: 'nzd_usd_otc', name: 'NZD/USD (OTC)', symbol: 'NZDUSD-OTC', type: 'OTC', payout: 89, basePrice: 0.6575, decimals: 5, change24h: +0.15, activeId: 80 },
  { id: 'eur_cad_otc', name: 'EUR/CAD (OTC)', symbol: 'EURCAD-OTC', type: 'OTC', payout: 84, basePrice: 1.4880, decimals: 5, change24h: +0.41, activeId: 2117 },
  { id: 'gbp_aud_otc', name: 'GBP/AUD (OTC)', symbol: 'GBPAUD-OTC', type: 'OTC', payout: 84, basePrice: 1.9540, decimals: 5, change24h: +0.76, activeId: 2116 },
  { id: 'aud_jpy_otc', name: 'AUD/JPY (OTC)', symbol: 'AUDJPY-OTC', type: 'OTC', payout: 84, basePrice: 102.56, decimals: 3, change24h: -0.10, activeId: 2113 },
  { id: 'cad_jpy_otc', name: 'CAD/JPY (OTC)', symbol: 'CADJPY-OTC', type: 'OTC', payout: 84, basePrice: 112.48, decimals: 3, change24h: +0.22, activeId: 2136 },

  // --- OptGo Commodities & Metais (Mercado OTC) ---
  { id: 'xau_usd_otc', name: 'XAU/USD (Ouro OTC)', symbol: 'XAUUSD-OTC', type: 'COMMODITIES', payout: 88, basePrice: 4515.50, decimals: 2, change24h: +1.85, isHot: true, activeId: 1857 },
  { id: 'silver_otc', name: 'SILVER (Prata OTC)', symbol: 'XAGUSD-OTC', type: 'COMMODITIES', payout: 88, basePrice: 67.10, decimals: 2, change24h: +1.05, activeId: 1858 },
  { id: 'crude_oil_otc', name: 'CRUDE OIL (Petróleo WTI OTC)', symbol: 'USOUSD-OTC', type: 'COMMODITIES', payout: 88, basePrice: 92.78, decimals: 2, change24h: -0.92, activeId: 1859 },
  { id: 'brent_oil_otc', name: 'BRENT OIL (Petróleo Brent OTC)', symbol: 'UKOUSD-OTC', type: 'COMMODITIES', payout: 84, basePrice: 96.40, decimals: 2, change24h: -0.74, activeId: 1931 },

  // --- OptGo Criptomoedas Cotação em Tempo Real ---
  { id: 'btc_usd_otc', name: 'BTC/USD (Bitcoin OTC)', symbol: 'BTCUSD-OTC', type: 'CRYPTO', payout: 89, basePrice: 78840.00, decimals: 2, change24h: +3.94, isHot: true, activeId: 2270 },
  { id: 'btc_usd_real', name: 'BTC/USD (Bitcoin Real)', symbol: 'BTCUSD-op', type: 'CRYPTO', payout: 88, basePrice: 79680.00, decimals: 2, change24h: +3.82, isHot: true, activeId: 1916 },
  { id: 'eth_usd_otc', name: 'ETH/USD (Ethereum OTC)', symbol: 'ETHUSD-OTC', type: 'CRYPTO', payout: 88, basePrice: 2197.50, decimals: 2, change24h: +2.15, isHot: true, activeId: 1941 },
  { id: 'sol_usd_otc', name: 'SOL/USD (Solana OTC)', symbol: 'SOLUSD-OTC', type: 'CRYPTO', payout: 88, basePrice: 93.90, decimals: 2, change24h: +5.40, isHot: true, activeId: 1978 },
  { id: 'xrp_usd_otc', name: 'XRP/USD (Ripple OTC)', symbol: 'XRPUSD-OTC', type: 'CRYPTO', payout: 84, basePrice: 2.1520, decimals: 4, change24h: +1.80, activeId: 2107 },
];

export const INITIAL_SERVERS: ServerNode[] = [
  {
    id: 'srv-optgo-vip',
    name: 'OptGo Traderoom Gateway VIP',
    location: 'trade.optgobroker.com',
    country: 'GLOBAL',
    ping: 6,
    status: 'OPTIMAL',
    ipMasked: '104.26.***.18',
    role: 'Conexão Direta SSL Criptografada • Cotações OTC & Real-time Book',
  },
  {
    id: 'srv-br-sp',
    name: 'Cluster Brasil (SP-01)',
    location: 'São Paulo, SP (OptGo LATAM Hub)',
    country: 'BR',
    ping: 8,
    status: 'OPTIMAL',
    ipMasked: '177.54.***.12',
    role: 'Gateway Primário Conexão Direta e Execução Sem Delay',
  },
  {
    id: 'srv-us-ny',
    name: 'Cluster EUA (NYC-04)',
    location: 'New York, Wall St',
    country: 'US',
    ping: 15,
    status: 'OPTIMAL',
    ipMasked: '198.51.***.44',
    role: 'Feed Institucional L2 & Books de Ordens em Tempo Real',
  },
  {
    id: 'srv-de-fra',
    name: 'Cluster Europa (FRA-02)',
    location: 'Frankfurt (OptGo EU Liquidity)',
    country: 'DE',
    ping: 22,
    status: 'ONLINE',
    ipMasked: '194.12.***.89',
    role: 'Motor de Confluência IA & Liquidez Forex / OTC',
  },
];

/**
 * Generate initial realistic candlestick history for an asset
 */
export function generateCandles(asset: AssetPair, count: number = 60, intervalMs: number = 60000): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const startTime = now - count * intervalMs;
  let currentPrice = asset.basePrice;
  const volatility = asset.basePrice * 0.0007;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalMs;
    const delta = (Math.random() - 0.49) * volatility;
    const open = currentPrice;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * volatility * 0.7;
    const low = Math.min(open, close) - Math.random() * volatility * 0.7;
    const volume = Math.floor(Math.random() * 400 + 80);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const emaValues: (number | null)[] = [];
  let prevEma: number | null = null;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      emaValues.push(null);
      continue;
    }

    if (prevEma === null) {
      // First SMA
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candles[j].close;
      }
      prevEma = sum / period;
      emaValues.push(prevEma);
    } else {
      const currentEma = candles[i].close * k + prevEma * (1 - k);
      emaValues.push(currentEma);
      prevEma = currentEma;
    }
  }

  return emaValues;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(candles: Candle[], period: number = 20, multiplier: number = 2) {
  const upper: (number | null)[] = [];
  const middle: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const sma = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    middle.push(sma);
    upper.push(sma + multiplier * stdDev);
    lower.push(sma - multiplier * stdDev);
  }

  return { upper, middle, lower };
}

/**
 * Quotex Radar v3 — Engine Touros vs Ursos (Bulls vs Bears)
 * Analisa as últimas 20 velas com ponderação exponencial e pressão de corpo/pavio
 */
export function calcBullBear(candles: Candle[], currentCandle?: Candle | null): BullBearAnalysis {
  if (!candles || candles.length === 0) {
    return { bullPct: 50, bearPct: 50, dominant: null, force: 50, statusText: 'equilibrado' };
  }

  const windowCandles = candles.slice(-20);
  let bullScore = 0;
  let bearScore = 0;

  windowCandles.forEach((c, i) => {
    const range = c.high - c.low || 1e-9;
    const body = Math.abs(c.close - c.open);
    const bodyRatio = body / range;
    const wickRatio = (range - body) / range;

    // Ponderação exponencial das últimas 20 velas
    const weight = Math.exp((i - windowCandles.length) * 0.15) + 0.3;

    let pts = weight;
    if (bodyRatio > 0.6) pts += 0.5 * weight;
    if (bodyRatio < 0.1) pts -= 0.3 * weight;
    if (wickRatio < 0.2) pts += 0.3 * weight;

    if (c.close >= c.open) {
      bullScore += Math.max(pts, 0.05);
    } else {
      bearScore += Math.max(pts, 0.05);
    }
  });

  if (currentCandle && (currentCandle.volume > 0 || currentCandle.high > currentCandle.low)) {
    const range = currentCandle.high - currentCandle.low || 1e-9;
    const body = Math.abs(currentCandle.close - currentCandle.open);
    const dir = currentCandle.close >= currentCandle.open ? 'bull' : 'bear';
    const pts = 0.4 + (body / range > 0.5 ? 0.2 : 0);
    if (dir === 'bull') bullScore += pts;
    else bearScore += pts;
  }

  const total = bullScore + bearScore || 1;
  const bullPct = Math.round((bullScore / total) * 100);
  const bearPct = 100 - bullPct;
  const dominant: 'bull' | 'bear' = bullPct >= bearPct ? 'bull' : 'bear';
  const force = Math.max(bullPct, bearPct);

  let statusText = 'equilibrado';
  if (force >= 90) statusText = '🔥 FORÇA MÁXIMA';
  else if (force >= 77) statusText = '⚡ SINAL LIBERADO (≥77%)';
  else if (force >= 70) statusText = dominant === 'bull' ? 'touros dominando' : 'ursos dominando';
  else if (force >= 60) statusText = dominant === 'bull' ? 'touros à frente' : 'ursos à frente';

  return { bullPct, bearPct, dominant, force, statusText };
}

/**
 * Cria sinal estrito Quotex Radar v3 ao atingir gatilho de 77% a 100% de força
 */
export function createBullBearSignal(
  asset: AssetPair,
  bb: BullBearAnalysis,
  timeframe: Timeframe = 'M1',
  entryPrice?: number
): SniperSignal {
  const isCall = bb.dominant === 'bull';
  const direction = isCall ? 'CALL' : 'PUT';
  const confidence = Math.max(77, Math.min(100, bb.force));

  const now = new Date();
  const currentSec = now.getSeconds();
  let secondsRemaining = 60 - currentSec;
  if (secondsRemaining < 10) {
    secondsRemaining += 60;
  }

  const targetDate = new Date(now.getTime() + secondsRemaining * 1000);
  const entryTimeString = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}:00`;

  const confluences = [
    `Força ${confidence}%: ${isCall ? '🐂 TOUROS' : '🐻 URSOS'} dominando`,
    `Touros: ${bb.bullPct}% | Ursos: ${bb.bearPct}%`,
    `Ponderação Exponencial (20 Velas ${timeframe})`,
    'Gatilho de Força Superado (≥ 77%)',
  ];

  return {
    id: `sig-bb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assetId: asset.id,
    assetName: asset.name,
    direction,
    timeframe,
    entryTime: entryTimeString,
    countdownSeconds: Math.min(secondsRemaining, 60),
    confidence,
    bullPct: bb.bullPct,
    bearPct: bb.bearPct,
    force: confidence,
    entryPrice: entryPrice ?? asset.basePrice,
    confluenceFactors: confluences,
    status: 'READY',
    payout: asset.payout,
    createdAt: Date.now(),
  };
}

export const INITIAL_RECENT_SIGNALS: SniperSignal[] = [
  {
    id: 'sig-hist-1',
    assetId: 'eur_usd_otc',
    assetName: 'EUR/USD (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:58:00',
    countdownSeconds: 0,
    confidence: 88,
    bullPct: 88,
    bearPct: 12,
    force: 88,
    entryPrice: 1.08420,
    exitPrice: 1.08438,
    diff: 0.00018,
    confluenceFactors: ['Touros Dominando (88%)', 'Gatilho Vector Superado (≥77%)'],
    status: 'WIN',
    result: 'WIN',
    galeStage: 0,
    payout: 94,
    createdAt: Date.now() - 360000,
  },
  {
    id: 'sig-hist-2',
    assetId: 'gbp_usd_otc',
    assetName: 'GBP/USD (OTC)',
    direction: 'PUT',
    timeframe: 'M1',
    entryTime: '10:54:00',
    countdownSeconds: 0,
    confidence: 82,
    bullPct: 18,
    bearPct: 82,
    force: 82,
    entryPrice: 1.26540,
    exitPrice: 1.26515,
    diff: -0.00025,
    confluenceFactors: ['Ursos Dominando (82%)', 'Gatilho Vector Superado (≥77%)'],
    status: 'WIN',
    result: 'WIN',
    galeStage: 0,
    payout: 93,
    createdAt: Date.now() - 600000,
  },
  {
    id: 'sig-hist-3',
    assetId: 'usd_jpy_otc',
    assetName: 'USD/JPY (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:48:00',
    countdownSeconds: 0,
    confidence: 79,
    bullPct: 79,
    bearPct: 21,
    force: 79,
    entryPrice: 154.120,
    exitPrice: 154.148,
    diff: 0.028,
    confluenceFactors: ['Recuperação no Gale 1 (1M)', 'Fluxo Comprador Confirmado no G1'],
    status: 'WIN',
    result: 'WIN_GALE1',
    galeStage: 1,
    payout: 91,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'sig-hist-4',
    assetId: 'btc_usd',
    assetName: 'BTC/USD Real',
    direction: 'CALL',
    timeframe: 'M5',
    entryTime: '10:45:00',
    countdownSeconds: 0,
    confidence: 85,
    bullPct: 85,
    bearPct: 15,
    force: 85,
    entryPrice: 87420.50,
    exitPrice: 87465.10,
    diff: 44.60,
    confluenceFactors: ['Ponderação Exponencial 20 Velas', 'Gatilho Vector Superado (≥77%)'],
    status: 'WIN',
    result: 'WIN',
    galeStage: 0,
    payout: 92,
    createdAt: Date.now() - 1100000,
  },
  {
    id: 'sig-hist-5',
    assetId: 'eur_usd_otc',
    assetName: 'EUR/USD (OTC)',
    direction: 'PUT',
    timeframe: 'M1',
    entryTime: '10:40:00',
    countdownSeconds: 0,
    confidence: 84,
    bullPct: 16,
    bearPct: 84,
    force: 84,
    entryPrice: 1.08390,
    exitPrice: 1.08365,
    diff: -0.00025,
    confluenceFactors: ['Pressão Vendedora (84%)', 'Gatilho Vector Superado (≥77%)'],
    status: 'WIN',
    result: 'WIN',
    galeStage: 0,
    payout: 94,
    createdAt: Date.now() - 1400000,
  },
  {
    id: 'sig-hist-6',
    assetId: 'usd_chf_otc',
    assetName: 'USD/CHF (OTC)',
    direction: 'PUT',
    timeframe: 'M1',
    entryTime: '10:32:00',
    countdownSeconds: 0,
    confidence: 78,
    bullPct: 22,
    bearPct: 78,
    force: 78,
    entryPrice: 0.88450,
    exitPrice: 0.88422,
    diff: -0.00028,
    confluenceFactors: ['Recuperação no Gale 1 (1M)', 'Pressão Ursos Confirmada no G1'],
    status: 'WIN',
    result: 'WIN_GALE1',
    galeStage: 1,
    payout: 90,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'sig-hist-7',
    assetId: 'aud_cad_otc',
    assetName: 'AUD/CAD (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:25:00',
    countdownSeconds: 0,
    confidence: 80,
    bullPct: 80,
    bearPct: 20,
    force: 80,
    entryPrice: 0.89210,
    exitPrice: 0.89204,
    diff: -0.00006,
    confluenceFactors: ['Rejeição de Nível', 'Retração Inesperada'],
    status: 'LOSS',
    result: 'LOSS',
    galeStage: 0,
    payout: 89,
    createdAt: Date.now() - 2200000,
  },
  {
    id: 'sig-hist-8',
    assetId: 'eur_usd_otc',
    assetName: 'EUR/USD (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:18:00',
    countdownSeconds: 0,
    confidence: 91,
    bullPct: 91,
    bearPct: 9,
    force: 91,
    entryPrice: 1.08320,
    exitPrice: 1.08355,
    diff: 0.00035,
    confluenceFactors: ['Touros Dominando (91%)', 'Gatilho Vector Superado (≥77%)'],
    status: 'WIN',
    result: 'WIN',
    galeStage: 0,
    payout: 94,
    createdAt: Date.now() - 2600000,
  },
];

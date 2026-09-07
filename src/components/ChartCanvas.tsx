import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AssetPair, Candle, SniperSignal, Timeframe } from '../types';
import { calculateEMA, calculateBollingerBands } from '../utils/marketData';
import { ZoomIn, ZoomOut, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ChartCanvasProps {
  asset: AssetPair;
  candles: Candle[];
  timeframe: Timeframe;
  activeSignal: SniperSignal | null;
  currentPrice: number;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  asset,
  candles,
  timeframe,
  activeSignal,
  currentPrice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverData, setHoverData] = useState<{
    candle: Candle;
    x: number;
    y: number;
  } | null>(null);

  const [visibleCount, setVisibleCount] = useState(48);
  const [showIndicators, setShowIndicators] = useState(true);
  const [candleCountdown, setCandleCountdown] = useState(() => 60 - new Date().getSeconds());

  useEffect(() => {
    const timer = setInterval(() => {
      setCandleCountdown(60 - new Date().getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Indicators calculations
  const ema9 = useMemo(() => calculateEMA(candles, 9), [candles]);
  const ema21 = useMemo(() => calculateEMA(candles, 21), [candles]);
  const bollinger = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      drawChart();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [candles, currentPrice, visibleCount, showIndicators, activeSignal]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Dark sleek background
    ctx.fillStyle = '#020504';
    ctx.fillRect(0, 0, width, height);

    // Subtle tactical grid background
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.035)';
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (candles.length === 0) {
      ctx.restore();
      return;
    }

    // Determine slice of candles to show
    const count = Math.min(visibleCount, candles.length);
    const visibleCandles = candles.slice(-count);
    const candleStartIndex = candles.length - count;

    // Price scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (const c of visibleCandles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    }

    // Add padding to price range
    const pricePadding = (maxPrice - minPrice) * 0.12 || 0.001;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Layout regions
    const rightMargin = 85;
    const bottomMargin = 25;
    const chartHeight = height - bottomMargin;
    const chartWidth = width - rightMargin;
    const candleSlotWidth = chartWidth / count;
    const candleBodyWidth = Math.max(3, candleSlotWidth * 0.7);

    const getY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // Draw Price Levels & Horizontal Guidelines
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#7a9587';
    ctx.textAlign = 'left';
    const priceSteps = 6;
    for (let i = 0; i <= priceSteps; i++) {
      const priceVal = minPrice + (priceRange / priceSteps) * i;
      const y = getY(priceVal);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillText(priceVal.toFixed(asset.decimals), chartWidth + 8, y + 3);
    }

    // Draw Volume Bars
    const volumeHeight = chartHeight * 0.18;
    visibleCandles.forEach((c, i) => {
      const x = i * candleSlotWidth + candleSlotWidth / 2;
      const vHeight = (c.volume / (maxVolume || 1)) * volumeHeight;
      const vY = chartHeight - vHeight;
      const isGreen = c.close >= c.open;

      ctx.fillStyle = isGreen ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255, 51, 85, 0.12)';
      ctx.fillRect(x - candleBodyWidth / 2, vY, candleBodyWidth, vHeight);
    });

    // Draw Bollinger Bands if enabled
    if (showIndicators) {
      const { upper, middle, lower } = bollinger;

      // Draw Bollinger Fill
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = candleStartIndex + i;
        const uVal = upper[fullIdx];
        if (uVal !== null && uVal !== undefined) {
          const x = i * candleSlotWidth + candleSlotWidth / 2;
          const y = getY(uVal);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const fullIdx = candleStartIndex + i;
        const lVal = lower[fullIdx];
        if (lVal !== null && lVal !== undefined) {
          const x = i * candleSlotWidth + candleSlotWidth / 2;
          const y = getY(lVal);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 255, 102, 0.025)';
      ctx.fill();

      // Upper Line
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = candleStartIndex + i;
        const uVal = upper[fullIdx];
        if (uVal !== null && uVal !== undefined) {
          const x = i * candleSlotWidth + candleSlotWidth / 2;
          const y = getY(uVal);
          if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      // Lower Line
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = candleStartIndex + i;
        const lVal = lower[fullIdx];
        if (lVal !== null && lVal !== undefined) {
          const x = i * candleSlotWidth + candleSlotWidth / 2;
          const y = getY(lVal);
          if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // EMA 9 (Yellow / Light green)
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = candleStartIndex + i;
        const val = ema9[fullIdx];
        if (val !== null && val !== undefined) {
          const x = i * candleSlotWidth + candleSlotWidth / 2;
          const y = getY(val);
          if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      // EMA 21 (Cyan / Soft Aqua)
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleCandles.length; i++) {
        const fullIdx = candleStartIndex + i;
        const val = ema21[fullIdx];
        if (val !== null && val !== undefined) {
          const x = i * candleSlotWidth + candleSlotWidth / 2;
          const y = getY(val);
          if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
    }

    // Draw Candlesticks
    visibleCandles.forEach((c, i) => {
      const x = i * candleSlotWidth + candleSlotWidth / 2;
      const isGreen = c.close >= c.open;
      const color = isGreen ? '#00ff66' : '#ff3355';

      const highY = getY(c.high);
      const lowY = getY(c.low);
      const openY = getY(c.open);
      const closeY = getY(c.close);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleBodyWidth / 2, bodyTop, candleBodyWidth, bodyHeight);
    });

    // Draw Active Sniper Signal Indicator on chart if applicable
    if (activeSignal && activeSignal.assetId === asset.id) {
      const lastCandleX = (visibleCandles.length - 1) * candleSlotWidth + candleSlotWidth / 2;
      const isCall = activeSignal.direction === 'CALL';
      const targetY = isCall ? getY(visibleCandles[visibleCandles.length - 1].low) + 30 : getY(visibleCandles[visibleCandles.length - 1].high) - 30;

      // Draw Sniper Reticle
      ctx.save();
      ctx.strokeStyle = isCall ? '#00ff66' : '#ff3355';
      ctx.fillStyle = isCall ? 'rgba(0, 255, 102, 0.15)' : 'rgba(255, 51, 85, 0.15)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(lastCandleX, targetY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(lastCandleX - 18, targetY);
      ctx.lineTo(lastCandleX + 18, targetY);
      ctx.moveTo(lastCandleX, targetY - 18);
      ctx.lineTo(lastCandleX, targetY + 18);
      ctx.stroke();

      // Arrow tag
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillStyle = isCall ? '#00ff66' : '#ff3355';
      ctx.textAlign = 'center';
      const text = isCall ? '🎯 SNIPER CALL ⬆' : '🎯 SNIPER PUT ⬇';
      ctx.fillText(text, lastCandleX, isCall ? targetY + 28 : targetY - 22);

      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`IA: ${activeSignal.confidence}%`, lastCandleX, isCall ? targetY + 40 : targetY - 34);

      ctx.restore();
    }

    // Current Price Line & Badge
    const currentPriceY = getY(currentPrice);
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const isCurrentGreen = lastCandle ? lastCandle.close >= lastCandle.open : true;
    const badgeColor = isCurrentGreen ? '#00ff66' : '#ff3355';

    ctx.strokeStyle = badgeColor;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(chartWidth, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price badge on the right axis
    ctx.fillStyle = badgeColor;
    ctx.fillRect(chartWidth + 4, currentPriceY - 11, rightMargin - 8, 22);
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(asset.decimals), chartWidth + (rightMargin / 2), currentPriceY + 4);

    // Hover crosshair and tooltip
    if (hoverData) {
      const hX = hoverData.x;
      const hY = hoverData.y;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hX, 0);
      ctx.lineTo(hX, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hY);
      ctx.lineTo(chartWidth, hY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const count = Math.min(visibleCount, candles.length);
    const chartWidth = rect.width - 85;
    const candleSlotWidth = chartWidth / count;

    if (x < chartWidth) {
      const index = Math.floor(x / candleSlotWidth);
      const candleIndex = candles.length - count + index;
      if (candleIndex >= 0 && candleIndex < candles.length) {
        setHoverData({
          candle: candles[candleIndex],
          x,
          y,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full select-none overflow-hidden bg-[#020504]">
      {/* Chart Top Info Bar */}
      <div className="absolute top-2 left-4 z-10 flex flex-wrap items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 rounded-md bg-black/75 px-2.5 py-1 border border-white/10 backdrop-blur-sm">
          <span className="font-extrabold text-white">{asset.name}</span>
          <span className="text-[#00ff66] font-bold">{currentPrice.toFixed(asset.decimals)}</span>
          <span className={`text-[10px] ${asset.change24h >= 0 ? 'text-[#00ff66]' : 'text-rose-400'}`}>
            {asset.change24h >= 0 ? '▲ +' : '▼ '}{asset.change24h}%
          </span>
        </div>

        {/* Live Candle Countdown */}
        <div className="flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 border border-[#00ff66]/30 backdrop-blur-sm text-[11px] text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="text-[#7a9587]">Vela:</span>
          <strong className="text-[#00ff66] font-extrabold">00:{String(candleCountdown).padStart(2, '0')}s</strong>
        </div>

        {/* OptGo SSL feed badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-md bg-black/80 px-2 py-1 border border-white/10 backdrop-blur-sm text-[10px] text-[#7a9587]">
          <span className="text-[#00ff66]">●</span>
          <span>OptGo Feed Real (SSL TLS 1.3)</span>
        </div>

        {/* Indicator legends */}
        {showIndicators && (
          <div className="hidden sm:flex items-center gap-2.5 rounded-md bg-black/75 px-2.5 py-1 border border-white/10 backdrop-blur-sm text-[10px]">
            <span className="flex items-center gap-1 text-[#ffe600]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffe600]" /> EMA 9
            </span>
            <span className="flex items-center gap-1 text-[#00e5ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff]" /> EMA 21
            </span>
            <span className="flex items-center gap-1 text-[#00ff66]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66]" /> Bollinger (20,2)
            </span>
          </div>
        )}

        {hoverData && (
          <div className="hidden lg:flex items-center gap-3 rounded-md bg-black/85 px-3 py-1 border border-[#00ff66]/30 text-[11px] text-zinc-300 backdrop-blur-md">
            <span>A: <strong className="text-white">{hoverData.candle.open.toFixed(asset.decimals)}</strong></span>
            <span>M: <strong className="text-[#00ff66]">{hoverData.candle.high.toFixed(asset.decimals)}</strong></span>
            <span>B: <strong className="text-rose-400">{hoverData.candle.low.toFixed(asset.decimals)}</strong></span>
            <span>F: <strong className="text-white">{hoverData.candle.close.toFixed(asset.decimals)}</strong></span>
            <span>Vol: <strong className="text-zinc-200">{hoverData.candle.volume}</strong></span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block h-full w-full cursor-crosshair"
      />

      {/* Floating Chart Controls */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-lg border border-[#00ff66]/20 bg-black/80 p-1 backdrop-blur-md">
        <button
          id="zoom-in-btn"
          onClick={() => setVisibleCount((c) => Math.max(20, c - 6))}
          className="p-1.5 text-[#7a9587] hover:text-[#00ff66] transition rounded"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          id="zoom-out-btn"
          onClick={() => setVisibleCount((c) => Math.min(100, c + 6))}
          className="p-1.5 text-[#7a9587] hover:text-[#00ff66] transition rounded"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          id="toggle-indicators-btn"
          onClick={() => setShowIndicators((s) => !s)}
          className={`p-1.5 transition rounded ${showIndicators ? 'text-[#00ff66]' : 'text-zinc-600'}`}
          title="Alternar Indicadores (EMA / Bollinger)"
        >
          {showIndicators ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

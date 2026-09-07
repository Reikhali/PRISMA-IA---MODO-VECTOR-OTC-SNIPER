import React, { useState, useRef, useEffect } from 'react';
import { 
  Crosshair, 
  ChevronDown, 
  Minus, 
  Volume2, 
  Copy, 
  Check, 
  Zap, 
  GripHorizontal,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AssetPair, BullBearAnalysis, Candle, SniperSignal, MartingaleMode } from '../types';
import { sound } from '../utils/audio';

interface FloatingSniperPanelProps {
  asset: AssetPair;
  candles: Candle[];
  currentPrice: number;
  bullBear: BullBearAnalysis;
  signal: SniperSignal | null;
  onExecuteTrade: (direction: 'CALL' | 'PUT') => void;
  onClose: () => void;
  dailyWinRate: number;
  onSimulateTrigger?: (directionChoice?: 'AUTO' | 'CALL' | 'PUT') => { success: boolean; title: string; detail: string } | void;
  martingaleMode?: MartingaleMode;
  onToggleMartingaleMode?: (mode: MartingaleMode) => void;
}

export const FloatingSniperPanel: React.FC<FloatingSniperPanelProps> = ({
  asset,
  candles,
  currentPrice,
  bullBear,
  signal,
  onExecuteTrade,
  onClose,
  dailyWinRate,
  onSimulateTrigger,
  martingaleMode = 'GALE1',
  onToggleMartingaleMode,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vectorFeedback, setVectorFeedback] = useState<{
    type: 'approved' | 'blocked';
    title: string;
    detail: string;
  } | null>(null);

  const handleRunVectorAnalyzer = (choice: 'AUTO' | 'CALL' | 'PUT' = 'AUTO') => {
    sound.playRadarPing();
    if (onSimulateTrigger) {
      const res = onSimulateTrigger(choice);
      if (res && typeof res === 'object' && 'success' in res) {
        setVectorFeedback({
          type: res.success ? 'approved' : 'blocked',
          title: res.title,
          detail: res.detail,
        });
        setTimeout(() => {
          setVectorFeedback((prev) => (prev?.title === res.title ? null : prev));
        }, 6500);
      }
    }
  };
  
  // Draggable position state with persistent coordinates
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('prisma_vector_panel_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.max(0, Math.min(window.innerWidth - 60, parsed.x)),
            y: Math.max(0, Math.min(window.innerHeight - 60, parsed.y)),
          };
        }
      }
    } catch {
      // fallback
    }
    return { x: 24, y: 70 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Sparkline Canvas & Price Delta
  const sparklineRef = useRef<HTMLCanvasElement>(null);
  const ticksRef = useRef<{ price: number; time: number }[]>([]);
  const prevPriceRef = useRef<number>(currentPrice);
  const [priceDelta, setPriceDelta] = useState<{ diff: number; text: string; isUp: boolean } | null>(null);

  // Accumulate ticks for sparkline and compute delta
  useEffect(() => {
    if (currentPrice > 0) {
      ticksRef.current.push({ price: currentPrice, time: Date.now() });
      if (ticksRef.current.length > 80) {
        ticksRef.current.shift();
      }

      const diff = currentPrice - prevPriceRef.current;
      if (Math.abs(diff) > 0.000001) {
        setPriceDelta({
          diff,
          text: `${diff >= 0 ? '▲ +' : '▼ '}${Math.abs(diff).toFixed(asset.decimals)}`,
          isUp: diff >= 0,
        });
      }
      prevPriceRef.current = currentPrice;
    }
  }, [currentPrice, asset.decimals]);

  // Draw Sparkline
  useEffect(() => {
    const canvas = sparklineRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ticks = ticksRef.current;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (ticks.length < 2) return;

    const pts = ticks.map((t) => t.price);
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min || 0.0001;

    const tx = (i: number) => (i / (pts.length - 1)) * W;
    const ty = (p: number) => H - ((p - min) / range) * (H - 6) - 3;

    // Gradient fill - Cyber Green
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p))));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(0, 255, 102, 0.4)');
    g.addColorStop(1, 'rgba(0, 255, 102, 0.02)');
    ctx.fillStyle = g;
    ctx.fill();

    // Line stroke - Cyber Neon Green
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p))));
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = 'rgba(0, 255, 102, 0.7)';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.stroke();
  }, [currentPrice]);

  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleResetPosition = () => {
    sound.playClick();
    const defaultPos = { x: 24, y: 70 };
    setPosition(defaultPos);
    try {
      localStorage.setItem('prisma_vector_panel_pos', JSON.stringify(defaultPos));
    } catch {}
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      // Permite arrastar livremente para qualquer lugar da tela
      const minX = -180;
      const maxX = window.innerWidth - 70;
      const minY = 0;
      const maxY = window.innerHeight - 70;

      const newX = Math.max(minX, Math.min(maxX, clientX - dragStartRef.current.x));
      const newY = Math.max(minY, Math.min(maxY, clientY - dragStartRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setPosition((curr) => {
          try {
            localStorage.setItem('prisma_vector_panel_pos', JSON.stringify(curr));
          } catch {}
          return curr;
        });
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging]);

  const handleCopySignal = () => {
    if (!signal) return;
    sound.playClick();
    const text = `🎯 *PRISMA IA — MODO VECTOR-OTC*
📊 Ativo: ${signal.assetName}
⏰ Horário: ${signal.entryTime}
⏱️ Expiração: ${signal.timeframe}
🚀 Direção: ${signal.direction === 'CALL' ? '🟢 COMPRA / CALL (TOUROS)' : '🔴 VENDA / PUT (URSOS)'}
🔥 Força de Mercado: ${signal.confidence}%
⚡ Touros: ${signal.bullPct || bullBear.bullPct}% | Ursos: ${signal.bearPct || bullBear.bearPct}%
🎯 Status: FILTRO 95-100% ATINGIDO
🤖 Algoritmo Quântico Prisma Vector-OTC`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { bullPct, bearPct, dominant, force } = bullBear;
  const isBull = dominant === 'bull';
  const barWidth = Math.max(0, (force - 50) * 1.0);

  // Status computation matching Quotex Radar v3
  const statusLabel =
    force >= 95
      ? '🔥 FORÇA MÁXIMA'
      : force >= 85
      ? '⚡ MUITO FORTE'
      : force >= 70
      ? isBull
        ? 'touros dominando'
        : 'ursos dominando'
      : force >= 60
      ? isBull
        ? 'touros à frente'
        : 'ursos à frente'
      : 'equilibrado';

  // Last 20 candles for mini-bar preview
  const miniCandles = candles.slice(-20);
  const maxHigh = Math.max(...miniCandles.map((c) => c.high), 1);
  const minLow = Math.min(...miniCandles.map((c) => c.low), 0);
  const candleRange = maxHigh - minLow || 1;

  const isSignalCall = signal?.direction === 'CALL';

  return (
    <div
      ref={panelRef}
      id="radar-panel"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-50 w-[285px] select-none rounded-2xl border-2 font-mono transition-shadow duration-200 ${
        isDragging
          ? 'shadow-[0_0_50px_rgba(0,255,102,0.5)] cursor-grabbing'
          : 'shadow-[0_0_35px_rgba(0,255,102,0.3),_0_20px_45px_rgba(0,0,0,0.9)]'
      } border-[#00ff66]/70 bg-gradient-to-b from-[#052b14]/98 via-[#021f0e]/98 to-[#011409]/98 backdrop-blur-2xl text-white`}
    >
      {/* 1. Header com alça de arrastar e LOGO Cyber Hacker */}
      <div
        id="rp-drag-handle"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        title="Clique/toque e arraste para qualquer lugar da tela"
        className="flex cursor-grab active:cursor-grabbing items-center justify-between border-b border-[#00ff66]/40 bg-gradient-to-r from-[#07381b] via-[#052b15] to-[#031e0e] px-3 py-2 rounded-t-2xl shadow-[inset_0_1px_0_rgba(0,255,102,0.4)]"
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <GripHorizontal className="h-3.5 w-3.5 text-[#00ff66]" />
          <img 
            src="/assets/prisma_vector_logo.jpg" 
            alt="Vector OTC" 
            className="h-5 w-5 rounded object-cover border border-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.6)]"
            referrerPolicy="no-referrer"
          />
          <span className="text-[10px] font-black tracking-widest text-[#00ff66] drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]">
            ◈ PRISMA IA — VECTOR-OTC
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-[9px] font-bold text-[#00ff66] animate-pulse pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66]" /> LIVE
          </span>
          <button
            onClick={handleResetPosition}
            className="rounded p-1 text-[#7a9587] hover:text-[#00ff66] transition"
            title="Redefinir posição inicial do painel"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleRunVectorAnalyzer('AUTO')}
            className="rounded p-1 text-[#7a9587] hover:text-[#00ff66] transition"
            title="ANALISADOR MODO VECTOR (Disparo Inteligente)"
          >
            <Volume2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 text-[#7a9587] hover:text-white transition"
          >
            {isMinimized ? <ChevronDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Asset Name Banner */}
      <div className="border-b border-[#00ff66]/25 px-3 py-1.5 flex items-center justify-between bg-[#042412]/80 text-xs">
        <span className="font-extrabold tracking-wider text-white flex items-center gap-1.5">
          {asset.name}
          <span className="text-[9px] font-extrabold text-[#00ff66] bg-[#00ff66]/20 px-1.5 py-0.2 rounded border border-[#00ff66]/40 shadow-[0_0_8px_rgba(0,255,102,0.2)]">
            {asset.payout}%
          </span>
        </span>
        <span className="text-[10px] text-[#a3d9b5]">
          Assert: <strong className="text-[#00ff66]">{dailyWinRate}%</strong>
        </span>
      </div>

      {!isMinimized && (
        <div>
          {/* 2. Preço ao Vivo & Delta */}
          <div className="flex items-baseline justify-between border-b border-[#00ff66]/30 px-3 py-2 bg-[#021c0e]/90">
            <div className="text-lg font-black tracking-wider text-[#00ff66] font-mono tabular-nums drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]">
              {currentPrice.toFixed(asset.decimals)}
            </div>
            {priceDelta && (
              <div
                className={`text-[10px] font-extrabold ${
                  priceDelta.isUp ? 'text-[#00ff66]' : 'text-[#ff4444]'
                }`}
              >
                {priceDelta.text}
              </div>
            )}
          </div>

          {/* 3. Sparkline */}
          <div className="border-b border-[#00ff66]/30 px-3 py-1.5 bg-[#031f10]/95">
            <canvas ref={sparklineRef} width={254} height={36} className="block w-full" />
          </div>

          {/* 4. TERMÔMETRO BULLS vs BEARS */}
          <div className="border-b border-[#00ff66]/30 p-3 space-y-2.5 bg-[#042412]/50">
            {/* Header Força de Mercado */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#00ff66] font-bold tracking-wider uppercase">
                Força de Mercado
              </span>
              <span
                className={`font-black tracking-wider px-1.5 py-0.5 rounded text-[9px] ${
                  force >= 77
                    ? isBull
                      ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/60 shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                      : 'bg-[#ff4444]/20 text-[#ff4444] border border-[#ff4444]/60 shadow-[0_0_12px_rgba(255,68,68,0.4)]'
                    : 'text-[#a3d9b5] bg-[#021a0d]/80 border border-[#00ff66]/20'
                }`}
              >
                {force >= 77
                  ? `${force}% ${isBull ? '▲ BULL' : '▼ BEAR'}`
                  : force >= 65
                  ? `${force}% ${isBull ? '▲ BULL' : '▼ BEAR'}`
                  : 'AGUARDAR 77%'}
              </span>
            </div>

            {/* Escala 0 25 50 77 100 */}
            <div className="flex justify-between text-[8px] text-[#7a9587] px-0.5 font-bold">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span className="text-[#ffe600] font-black">77%</span>
              <span>100</span>
            </div>

            {/* Barra Touros (▲) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#00ff66] w-3.5">▲</span>
              <div className="relative flex-1 h-3.5 rounded-full overflow-hidden bg-[#031d0f] border border-[#00ff66]/40 shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00aa44] via-[#00ff66] to-[#66ff99] transition-all duration-500 relative shadow-[0_0_10px_rgba(0,255,102,0.5)]"
                  style={{ width: `${bullPct}%` }}
                >
                  <div className="absolute right-0 top-0 h-full w-1 bg-white/60 rounded-r-full" />
                </div>
                {/* Marcador 77% */}
                <div className="absolute left-[77%] top-0 h-full w-px bg-[#ffe600]" title="Gatilho 77%" />
              </div>
              <span className="text-[11px] font-black text-[#00ff66] w-8 text-right drop-shadow-[0_0_4px_rgba(0,255,102,0.5)]">
                {bullPct}%
              </span>
            </div>

            {/* Barra Ursos (▼) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#ff4444] w-3.5">▼</span>
              <div className="relative flex-1 h-3.5 rounded-full overflow-hidden bg-[#1f0a0a] border border-[#ff4444]/40 shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#aa2222] to-[#ff4444] transition-all duration-500 relative shadow-[0_0_10px_rgba(255,68,68,0.5)]"
                  style={{ width: `${bearPct}%` }}
                >
                  <div className="absolute right-0 top-0 h-full w-1 bg-white/60 rounded-r-full" />
                </div>
                {/* Marcador 77% */}
                <div className="absolute left-[77%] top-0 h-full w-px bg-[#ffe600]" title="Gatilho 77%" />
              </div>
              <span className="text-[11px] font-black text-[#ff4444] w-8 text-right drop-shadow-[0_0_4px_rgba(255,68,68,0.5)]">
                {bearPct}%
              </span>
            </div>

            {/* Termômetro Central de Força */}
            <div className="pt-1 space-y-1">
              <div className="text-[8px] text-[#00ff66]/80 uppercase tracking-widest font-bold">
                Termômetro de Força Vector
              </div>
              <div className="relative h-6 rounded-full overflow-hidden border border-[#00ff66]/30 bg-[#02180c]">
                {/* Metades de fundo */}
                <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#200808] to-[#120505]" />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#031a0e] to-[#07361a]" />
                {/* Divisor central */}
                <div className="absolute left-1/2 top-1 h-4 w-px bg-white/30" />
                {/* Linhas de Gatilho 77% */}
                <div className="absolute left-[23%] top-1 h-4 w-px bg-[#ffe600]/80" title="Gatilho 77%" />
                <div className="absolute right-[23%] top-1 h-4 w-px bg-[#ffe600]/80" title="Gatilho 77%" />

                {/* Barra deslizante */}
                <div
                  className={`absolute top-1 h-4 rounded-full transition-all duration-500 ${
                    isBull
                      ? 'left-1/2 bg-gradient-to-r from-[#00aa44] to-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.8)]'
                      : 'right-1/2 bg-gradient-to-l from-[#aa2222] to-[#ff4444] shadow-[0_0_12px_rgba(255,68,68,0.8)]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />

                {/* Agulha central */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-sm z-10 shadow-[0_0_6px_white]" />

                {/* Valor % Central */}
                <div
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black z-20 whitespace-nowrap drop-shadow-[0_0_4px_black] ${
                    force >= 77
                      ? 'text-white'
                      : force >= 65
                      ? isBull
                        ? 'text-[#00ff66]'
                        : 'text-[#ff4444]'
                      : 'text-zinc-300'
                  }`}
                >
                  {force}%
                </div>
              </div>

              {/* Legendas de extremidade */}
              <div className="flex justify-between text-[8px] px-1 font-bold">
                <span className="text-[#ff4444]">← URSOS</span>
                <span
                  className={
                    force >= 77
                      ? isBull
                        ? 'text-[#00ff66]'
                        : 'text-[#ff4444]'
                      : 'text-[#a3d9b5]'
                  }
                >
                  {statusLabel}
                </span>
                <span className="text-[#00ff66]">TOUROS →</span>
              </div>
            </div>

            {/* Zona de Disparo Indicador */}
            <div
              className={`p-2 rounded-lg text-center text-[9px] font-black tracking-wider transition-all duration-300 ${
                force >= 77
                  ? isBull
                    ? 'bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.4)] animate-pulse'
                    : 'bg-[#ff4444]/20 border border-[#ff4444] text-[#ff4444] shadow-[0_0_20px_rgba(255,68,68,0.4)] animate-pulse'
                  : force >= 65
                  ? 'bg-[#ffe600]/15 border border-[#ffe600]/50 text-[#ffe600]'
                  : 'bg-[#02180c]/80 border border-[#00ff66]/20 text-[#a3d9b5]'
              }`}
            >
              {force >= 77
                ? '🎯 ZONA DE ENTRADA — SINAL LIBERADO (≥ 77%)'
                : force >= 65
                ? `⚡ CARREGANDO... ${force}% — AGUARDAR 77%`
                : `ZONA NEUTRA — ${force}% (AGUARDAR 77%)`}
            </div>
          </div>

          {/* 5. Mini-Velas 1M */}
          <div className="border-b border-[#00ff66]/30 px-3 py-2 bg-[#021b0d]/70">
            <div className="flex justify-between items-center text-[8px] text-[#00ff66] mb-1.5 uppercase tracking-wider font-bold">
              <span>Velas 1M (Últimas 20)</span>
              <span className="text-[#7a9587]">{miniCandles.length} velas analisadas</span>
            </div>
            <div className="flex items-end gap-1 h-7">
              {miniCandles.map((c, i) => {
                const isGreen = c.close >= c.open;
                const heightRatio = Math.max(3, Math.round(((c.high - c.low) / candleRange) * 24));
                return (
                  <div
                    key={i}
                    title={`O:${c.open} C:${c.close}`}
                    style={{ height: `${heightRatio}px` }}
                    className={`flex-1 rounded-[1px] ${
                      isGreen ? 'bg-[#00ff66] shadow-[0_0_4px_rgba(0,255,102,0.4)]' : 'bg-[#ff4444]'
                    }`}
                  />
                );
              })}
            </div>
          </div>
          {/* 6. SINAL GERADO AUTOMATICAMENTE (Se force >= 77 ou signal ativo) */}
          {signal ? (
            <div className="p-3 space-y-2.5 bg-gradient-to-b from-[#063319]/95 to-[#021f0e]/95 rounded-b-2xl border-t border-[#00ff66]/40 shadow-[inset_0_1px_0_rgba(0,255,102,0.3)]">
              <div className="text-[9px] text-[#00ff66] text-center font-extrabold tracking-wider drop-shadow-[0_0_6px_rgba(0,255,102,0.4)]">
                ⚡ SINAL DISPARADO VECTOR-OTC (≥ 77%)
              </div>

              {/* Big Direction Callout */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                  isSignalCall
                    ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] shadow-[0_0_25px_rgba(0,255,102,0.35)]'
                    : 'border-[#ff4444] bg-[#ff4444]/20 text-[#ff4444] shadow-[0_0_25px_rgba(255,68,68,0.35)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg font-black ${
                      isSignalCall ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.8)]' : 'bg-[#ff4444] text-white shadow-[0_0_10px_rgba(255,68,68,0.8)]'
                    }`}
                  >
                    {isSignalCall ? (
                      <ArrowUpRight className="h-6 w-6 stroke-[3]" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-black tracking-tight leading-none">
                      {isSignalCall ? '▲ CALL' : '▼ PUT'}
                    </div>
                    <div className="text-[9px] font-bold text-white/95 mt-0.5">
                      Expiração {signal.timeframe} • Entrada Imediata
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8px] text-[#a3d9b5] font-bold">FORÇA</div>
                  <div className="text-lg font-black text-white drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]">{signal.confidence}%</div>
                </div>
              </div>

              {/* Detalhes do Sinal Quotex Radar */}
              <div className="rounded-lg bg-[#032412]/90 border border-[#00ff66]/30 p-2 text-[9px] text-[#a3d9b5] space-y-1">
                <div>
                  ◆ Touros:{' '}
                  <strong className="text-[#00ff66]">{signal.bullPct || bullPct}%</strong> &nbsp;
                  Ursos: <strong className="text-[#ff4444]">{signal.bearPct || bearPct}%</strong>
                </div>
                <div>
                  ◆ Ativo: <strong className="text-white">{signal.assetName}</strong> ({signal.entryTime})
                </div>
                <div>
                  ◆ Entrada: <strong className="text-[#ffe600]">IMEDIATA / PRÓXIMA VELA</strong>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  id="rp-copy-btn"
                  onClick={handleCopySignal}
                  className="flex items-center justify-center gap-1 rounded-lg border border-[#00ff66]/50 bg-[#053319] py-2 text-[10px] font-bold text-[#00ff66] hover:bg-[#00ff66]/25 transition shadow-[0_0_10px_rgba(0,255,102,0.15)]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[#00ff66]" />
                      <span className="text-[#00ff66] font-extrabold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-[#00ff66]" />
                      <span>Copiar Sinal</span>
                    </>
                  )}
                </button>

                <button
                  id="rp-execute-btn"
                  onClick={() => {
                    sound.playClick();
                    onExecuteTrade(signal.direction);
                  }}
                  className={`flex items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-black uppercase transition shadow-lg ${
                    isSignalCall
                      ? 'bg-[#00ff66] text-black hover:bg-[#00ff88] shadow-[0_0_20px_rgba(0,255,102,0.5)]'
                      : 'bg-[#ff4444] text-white hover:bg-[#ff5555] shadow-[0_0_20px_rgba(255,68,68,0.5)]'
                  }`}
                >
                  <Zap className="h-3 w-3 fill-current" />
                  <span>Executar {signal.direction}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center space-y-2 bg-[#032412]/80 rounded-b-2xl border-t border-[#00ff66]/25">
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#00ff66] font-black tracking-wider">
                <Crosshair className="h-3.5 w-3.5 text-[#00ff66] animate-spin" />
                <span>RADAR VECTOR-OTC MONITORANDO</span>
              </div>
              <p className="text-[8px] text-[#a3d9b5]">
                Filtro Vector: Compra somente com Touros ou Equilíbrio; Venda somente com Ursos ou Equilíbrio (≥ 77%).
              </p>

              {vectorFeedback && (
                <div
                  className={`p-2 text-left rounded-lg border text-[9px] space-y-0.5 transition-all ${
                    vectorFeedback.type === 'blocked'
                      ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
                      : 'bg-emerald-950/90 border-[#00ff66]/60 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-black">
                    <div className="flex items-center gap-1">
                      {vectorFeedback.type === 'blocked' ? (
                        <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-[#00ff66] shrink-0" />
                      )}
                      <span>{vectorFeedback.title}</span>
                    </div>
                    <button
                      onClick={() => setVectorFeedback(null)}
                      className="text-white/60 hover:text-white text-[10px] ml-1"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[8px] opacity-90 leading-tight">
                    {vectorFeedback.detail}
                  </p>
                </div>
              )}

              {onSimulateTrigger && (
                <div className="space-y-1.5 pt-0.5">
                  <button
                    onClick={() => handleRunVectorAnalyzer('AUTO')}
                    className="w-full rounded border border-[#00ff66]/70 bg-gradient-to-r from-[#00ff66]/30 via-[#00ff66]/20 to-[#00ff66]/30 py-2 text-[10px] font-black text-[#00ff66] hover:brightness-125 transition shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Zap className="h-3 w-3 fill-current" />
                    <span>⚡ ANALISADOR MODO VECTOR</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleRunVectorAnalyzer('CALL')}
                      title="Analisar oportunidade de Compra (CALL)"
                      className="rounded border border-[#00ff66]/40 bg-[#00ff66]/10 py-1 text-[8.5px] font-black text-[#00ff66] hover:bg-[#00ff66]/25 transition flex items-center justify-center gap-1 active:scale-95"
                    >
                      <ArrowUpRight className="h-2.5 w-2.5" />
                      <span>Analisar Compra</span>
                    </button>
                    <button
                      onClick={() => handleRunVectorAnalyzer('PUT')}
                      title="Analisar oportunidade de Venda (PUT)"
                      className="rounded border border-rose-500/40 bg-rose-500/10 py-1 text-[8.5px] font-black text-rose-400 hover:bg-rose-500/25 transition flex items-center justify-center gap-1 active:scale-95"
                    >
                      <ArrowDownRight className="h-2.5 w-2.5" />
                      <span>Analisar Venda</span>
                    </button>
                  </div>

                  {/* Seletor rápido de Martingale (G1 vs Sem Gale) */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-md border border-white/10 bg-black/60 font-mono text-[8px]">
                    <span className="text-[#7a9587] flex items-center gap-1">
                      <span>Modo:</span>
                      <strong className={martingaleMode === 'GALE1' ? 'text-[#00ff66]' : 'text-amber-300'}>
                        {martingaleMode === 'GALE1' ? '⚡ Gale 1 (1M)' : '🛡️ Sem Gale'}
                      </strong>
                    </span>
                    {onToggleMartingaleMode && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onToggleMartingaleMode(martingaleMode === 'GALE1' ? 'NONE' : 'GALE1');
                        }}
                        className={`px-1.5 py-0.5 rounded font-bold border transition ${
                          martingaleMode === 'GALE1'
                            ? 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                            : 'border-[#00ff66]/40 bg-[#00ff66]/15 text-[#00ff66]'
                        }`}
                      >
                        {martingaleMode === 'GALE1' ? 'Mão Fixa' : 'Usar G1'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

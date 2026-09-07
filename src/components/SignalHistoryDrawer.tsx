import React, { useState } from 'react';
import { SniperSignal, TradeOrder, MartingaleMode } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award, 
  Trash2, 
  TrendingUp, 
  Wallet, 
  Activity, 
  Shield, 
  Zap, 
  BarChart3, 
  Filter 
} from 'lucide-react';

interface SignalHistoryDrawerProps {
  signals: SniperSignal[];
  orders: TradeOrder[];
  isOpen: boolean;
  onClose: () => void;
  onClearHistory?: () => void;
  martingaleMode?: MartingaleMode;
  onToggleMartingaleMode?: (mode: MartingaleMode) => void;
}

export const SignalHistoryDrawer: React.FC<SignalHistoryDrawerProps> = ({
  signals,
  orders,
  isOpen,
  onClose,
  onClearHistory,
  martingaleMode: propMartingaleMode,
  onToggleMartingaleMode,
}) => {
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'ORDERS'>('SIGNALS');
  const [localMartingaleMode, setLocalMartingaleMode] = useState<MartingaleMode>(() => {
    return (localStorage.getItem('vector_martingale_mode') as MartingaleMode) || 'GALE1';
  });
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN_DIRECT' | 'WIN_GALE' | 'LOSS'>('ALL');
  const [onlyM1, setOnlyM1] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentMartingaleMode = propMartingaleMode ?? localMartingaleMode;

  const handleSetMartingale = (mode: MartingaleMode) => {
    setLocalMartingaleMode(mode);
    localStorage.setItem('vector_martingale_mode', mode);
    if (onToggleMartingaleMode) {
      onToggleMartingaleMode(mode);
    }
  };

  // Estatísticas específicas para o Timeframe de 1 Minuto (1M)
  const m1Signals = signals.filter((s) => s.timeframe === 'M1');
  const totalM1 = m1Signals.length;
  const m1DirectWins = m1Signals.filter((s) => s.result === 'WIN').length;
  const m1GaleWins = m1Signals.filter((s) => s.result === 'WIN_GALE1').length;
  const m1Losses = m1Signals.filter((s) => s.status === 'LOSS' || s.result === 'LOSS').length;

  const m1WinRateNone = totalM1 > 0 ? ((m1DirectWins / totalM1) * 100).toFixed(1) : '0.0';
  const m1WinRateGale1 = totalM1 > 0 ? (((m1DirectWins + m1GaleWins) / totalM1) * 100).toFixed(1) : '0.0';

  // Estatísticas Globais dos Sinais adaptadas à estratégia selecionada
  const directWins = signals.filter((s) => s.result === 'WIN').length;
  const galeWins = signals.filter((s) => s.result === 'WIN_GALE1').length;
  const rawLosses = signals.filter((s) => s.status === 'LOSS' || s.result === 'LOSS').length;

  // No modo "Sem Martingale (Mão Fixa)", se o sinal precisou de G1, ele conta como LOSS para a estratégia de mão fixa!
  const effectiveWins = currentMartingaleMode === 'GALE1' ? directWins + galeWins : directWins;
  const effectiveLosses = currentMartingaleMode === 'GALE1' ? rawLosses : rawLosses + galeWins;
  const totalSignals = effectiveWins + effectiveLosses;
  const signalWinRate = totalSignals > 0 ? ((effectiveWins / totalSignals) * 100).toFixed(1) : '100.0';

  // Real statistics computed directly from executed orders
  const resolvedOrders = orders.filter((o) => o.status === 'WON' || o.status === 'LOST');
  const orderWins = resolvedOrders.filter((o) => o.status === 'WON').length;
  const orderLosses = resolvedOrders.filter((o) => o.status === 'LOST').length;
  const totalOrders = orderWins + orderLosses;
  const orderWinRate = totalOrders > 0 ? ((orderWins / totalOrders) * 100).toFixed(1) : '100.0';

  const netProfit = resolvedOrders.reduce((acc, o) => {
    if (o.status === 'WON') return acc + (o.profit || 0);
    if (o.status === 'LOST') return acc - o.amount;
    return acc;
  }, 0);

  const displayWins = activeTab === 'SIGNALS' ? effectiveWins : orderWins;
  const displayLosses = activeTab === 'SIGNALS' ? effectiveLosses : orderLosses;
  const displayWinRate = activeTab === 'SIGNALS' ? signalWinRate : orderWinRate;

  // Filtragem da lista de sinais
  const filteredSignals = signals.filter((sig) => {
    if (onlyM1 && sig.timeframe !== 'M1') return false;
    if (resultFilter === 'WIN_DIRECT') return sig.result === 'WIN';
    if (resultFilter === 'WIN_GALE') return sig.result === 'WIN_GALE1';
    if (resultFilter === 'LOSS') return sig.status === 'LOSS' || sig.result === 'LOSS';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[#00ff66]/35 bg-[rgba(1,4,3,0.98)] p-4 sm:p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00ff66]/20 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-black text-white flex items-center gap-2">
                HISTÓRICO REAL DE OPERAÇÕES
                <span className="rounded bg-[#00ff66]/20 px-1.5 py-0.5 font-mono text-[10px] font-black text-[#00ff66] border border-[#00ff66]/30">
                  100% AUDITADO
                </span>
              </h3>
              <p className="font-mono text-xs text-[#a3d9b5]">
                Prisma IA Modo Vector-OTC • Validação com preços reais de entrada e saída
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                title="Limpar Histórico"
                className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white transition hover:bg-white/5"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mt-3 border-b border-white/10 pb-2.5 font-mono text-xs shrink-0">
          <button
            onClick={() => setActiveTab('SIGNALS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'SIGNALS'
                ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'text-zinc-400 hover:text-white bg-black/40'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Sinais da IA ({signals.length})
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'ORDERS'
                ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'text-zinc-400 hover:text-white bg-black/40'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            Ordens Executadas ({orders.length})
          </button>
        </div>

        {/* Scrollable body content */}
        <div className="overflow-y-auto space-y-3.5 pr-1 mt-3">
          {activeTab === 'SIGNALS' && (
            <>
              {/* OPÇÃO DE ESTRATÉGIA: SEM MARTINGALE vs COM MARTINGALE G1 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-2.5 rounded-xl border border-white/15 bg-black/60 font-mono text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-white text-[11px]">
                    <span>ESTRATÉGIA DE ANÁLISE:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${
                      currentMartingaleMode === 'GALE1'
                        ? 'border-[#00ff66]/40 bg-[#00ff66]/15 text-[#00ff66]'
                        : 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                    }`}>
                      {currentMartingaleMode === 'GALE1' ? '⚡ COM MARTINGALE G1' : '🛡️ SEM MARTINGALE (MÃO FIXA)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7a9587]">
                    {currentMartingaleMode === 'GALE1'
                      ? 'Aceita Win de 1ª Vela e Win no Gale 1 (1M) como vitórias auditadas.'
                      : 'Mão Fixa: Apenas entradas de 1ª vela contam como vitória; se foi pro G1 conta como loss.'}
                  </p>
                </div>

                <div className="flex gap-1.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => handleSetMartingale('NONE')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 ${
                      currentMartingaleMode === 'NONE'
                        ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                        : 'bg-black/50 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Sem Gale (Mão Fixa)</span>
                  </button>
                  <button
                    onClick={() => handleSetMartingale('GALE1')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 ${
                      currentMartingaleMode === 'GALE1'
                        ? 'bg-[#00ff66] text-black shadow-[0_0_12px_rgba(0,255,102,0.35)]'
                        : 'bg-black/50 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>Usar Gale 1 (1M)</span>
                  </button>
                </div>
              </div>

              {/* PAINEL DE AUDITORIA 1 MINUTO (QUANTOS DE 1M SERIA) */}
              <div className="p-3 rounded-xl border border-[#00ff66]/30 bg-[#00ff66]/5 font-mono">
                <div className="flex items-center justify-between border-b border-[#00ff66]/20 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#00ff66]">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>CATALOGADOR E QUANTIDADES DE 1 MINUTO (1M)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold">
                    {totalM1} {totalM1 === 1 ? 'sinal de 1M' : 'sinais de 1M'} no histórico
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-black/70 border border-white/10">
                    <div className="text-[9px] text-[#7a9587] uppercase font-bold">Total Sinais 1M</div>
                    <div className="text-lg font-black text-white mt-0.5">{totalM1}</div>
                    <div className="text-[9px] text-[#7a9587]">100% das ordens 1M</div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/70 border border-[#00ff66]/35">
                    <div className="text-[9px] text-[#00ff66] uppercase font-bold">Win de 1ª (1M)</div>
                    <div className="text-lg font-black text-[#00ff66] mt-0.5">{m1DirectWins}</div>
                    <div className="text-[9px] text-[#a3d9b5]">
                      {totalM1 > 0 ? ((m1DirectWins / totalM1) * 100).toFixed(1) : 0}% de primeira
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/70 border border-emerald-400/35">
                    <div className="text-[9px] text-emerald-300 uppercase font-bold">Win no G1 (1M)</div>
                    <div className="text-lg font-black text-emerald-300 mt-0.5">{m1GaleWins}</div>
                    <div className="text-[9px] text-emerald-400/80">
                      {totalM1 > 0 ? ((m1GaleWins / totalM1) * 100).toFixed(1) : 0}% no Gale 1
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/70 border border-rose-500/35">
                    <div className="text-[9px] text-rose-400 uppercase font-bold">Loss (1M)</div>
                    <div className="text-lg font-black text-rose-400 mt-0.5">{m1Losses}</div>
                    <div className="text-[9px] text-rose-400/80">
                      {totalM1 > 0 ? ((m1Losses / totalM1) * 100).toFixed(1) : 0}% sem acerto
                    </div>
                  </div>
                </div>

                {/* Resumo da Taxa de Conversão 1M */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span>Assertividade Real em 1M:</span>
                    <span className={`font-black text-xs ${
                      currentMartingaleMode === 'GALE1' ? 'text-[#00ff66]' : 'text-amber-300'
                    }`}>
                      {currentMartingaleMode === 'GALE1' ? `${m1WinRateGale1}% (Com G1)` : `${m1WinRateNone}% (Sem Gale)`}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#7a9587] flex items-center gap-2">
                    <span>Sem Gale: <strong className="text-white">{m1WinRateNone}%</strong></span>
                    <span>•</span>
                    <span>Com Gale 1: <strong className="text-[#00ff66]">{m1WinRateGale1}%</strong></span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Real Stats bar (Geral) */}
          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            <div className="rounded-xl border border-white/10 bg-black/60 p-2.5">
              <div className="text-[9px] text-[#7a9587] uppercase font-bold">Total Geral</div>
              <div className="text-lg font-black text-white">
                {activeTab === 'SIGNALS' ? totalSignals : totalOrders}
              </div>
            </div>
            <div className="rounded-xl border border-[#00ff66]/25 bg-black/60 p-2.5">
              <div className="text-[9px] text-[#7a9587] uppercase font-bold">Vitórias (WIN)</div>
              <div className="text-lg font-black text-[#00ff66]">{displayWins}</div>
            </div>
            <div className="rounded-xl border border-rose-500/25 bg-black/60 p-2.5">
              <div className="text-[9px] text-[#7a9587] uppercase font-bold">Derrotas (LOSS)</div>
              <div className="text-lg font-black text-rose-400">{displayLosses}</div>
            </div>
            <div className="rounded-xl border border-[#ffe600]/25 bg-black/60 p-2.5">
              <div className="text-[9px] text-[#7a9587] uppercase font-bold">Assertividade Geral</div>
              <div className="text-lg font-black text-[#ffe600]">{displayWinRate}%</div>
            </div>
          </div>

          {/* P&L banner for Orders tab */}
          {activeTab === 'ORDERS' && (
            <div className="flex items-center justify-between rounded-xl border border-[#00ff66]/30 bg-[#00ff66]/5 px-3 py-2 font-mono text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#00ff66]" /> Resultado Financeiro Real:
              </span>
              <span
                className={`font-black text-sm ${
                  netProfit >= 0 ? 'text-[#00ff66]' : 'text-rose-400'
                }`}
              >
                {netProfit >= 0 ? `+R$ ${netProfit.toFixed(2)}` : `-R$ ${Math.abs(netProfit).toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Filtros da Lista de Sinais */}
          {activeTab === 'SIGNALS' && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[10px]">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-zinc-400 flex items-center gap-1 mr-1">
                  <Filter className="h-3 w-3" /> Filtro:
                </span>
                <button
                  onClick={() => setResultFilter('ALL')}
                  className={`px-2 py-0.5 rounded border transition font-bold ${
                    resultFilter === 'ALL'
                      ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66]'
                      : 'border-white/10 text-zinc-400 hover:text-white bg-black/40'
                  }`}
                >
                  Todos ({signals.length})
                </button>
                <button
                  onClick={() => setResultFilter('WIN_DIRECT')}
                  className={`px-2 py-0.5 rounded border transition font-bold ${
                    resultFilter === 'WIN_DIRECT'
                      ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66]'
                      : 'border-white/10 text-zinc-400 hover:text-white bg-black/40'
                  }`}
                >
                  🎯 Win 1ª Vela ({directWins})
                </button>
                <button
                  onClick={() => setResultFilter('WIN_GALE')}
                  className={`px-2 py-0.5 rounded border transition font-bold ${
                    resultFilter === 'WIN_GALE'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 text-zinc-400 hover:text-white bg-black/40'
                  }`}
                >
                  ⚡ Win no G1 ({galeWins})
                </button>
                <button
                  onClick={() => setResultFilter('LOSS')}
                  className={`px-2 py-0.5 rounded border transition font-bold ${
                    resultFilter === 'LOSS'
                      ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                      : 'border-white/10 text-zinc-400 hover:text-white bg-black/40'
                  }`}
                >
                  ❌ Loss ({rawLosses})
                </button>
              </div>

              <button
                onClick={() => setOnlyM1(!onlyM1)}
                className={`px-2.5 py-0.5 rounded border font-bold transition flex items-center gap-1 ${
                  onlyM1
                    ? 'border-[#00ff66] bg-[#00ff66] text-black shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                    : 'border-white/10 text-[#a3d9b5] bg-black/60 hover:text-white'
                }`}
              >
                <span>⏱️ Somente 1M</span>
              </button>
            </div>
          )}

          {/* List Content */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {activeTab === 'SIGNALS' ? (
              filteredSignals.length === 0 ? (
                <div className="py-8 text-center font-mono text-xs text-[#7a9587]">
                  Nenhum sinal com os filtros selecionados. Conforme a Prisma IA gera sinais no mercado real, eles aparecem aqui.
                </div>
              ) : (
                filteredSignals.map((sig, idx) => {
                  const isCall = sig.direction === 'CALL';
                  const isDirectWin = sig.result === 'WIN';
                  const isGaleWin = sig.result === 'WIN_GALE1';
                  const isReady = sig.status === 'READY';
                  const isLoss = sig.status === 'LOSS' || sig.result === 'LOSS';

                  // No modo "Sem Martingale", se precisou de Gale 1, é considerado perda para mão fixa
                  const countedAsLossInNoGale = currentMartingaleMode === 'NONE' && isGaleWin;

                  return (
                    <div
                      key={`${sig.id}-${idx}`}
                      className={`flex items-center justify-between rounded-xl border p-3 font-mono text-xs transition ${
                        countedAsLossInNoGale
                          ? 'border-amber-400/30 bg-amber-950/10'
                          : 'border-white/10 bg-black/40 hover:border-[#00ff66]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isCall ? 'bg-[#00ff66]/20 text-[#00ff66]' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isCall ? <ArrowUpRight className="h-4 w-4 stroke-[3]" /> : <ArrowDownRight className="h-4 w-4 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{sig.assetName}</span>
                            <span className="rounded bg-[#00ff66]/10 px-1.5 py-0.2 text-[10px] font-black text-[#00ff66] border border-[#00ff66]/30">
                              {sig.timeframe}
                            </span>
                            <span className={`text-[10px] font-bold ${isCall ? 'text-[#00ff66]' : 'text-rose-400'}`}>
                              {sig.direction}
                            </span>
                            {isGaleWin && (
                              <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                                G1 (1M)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#7a9587] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {sig.entryTime}
                            </span>
                            {sig.entryPrice && (
                              <span>• Entrada: <strong className="text-zinc-300">{sig.entryPrice.toFixed(5)}</strong></span>
                            )}
                            {sig.exitPrice && (
                              <span>• Saída: <strong className="text-zinc-300">{sig.exitPrice.toFixed(5)}</strong></span>
                            )}
                            <span>• Força: {sig.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isDirectWin ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-md border border-[#00ff66]/40 bg-[#00ff66]/15 px-2 py-0.5 font-extrabold text-[#00ff66] text-[10px] sm:text-[11px] shadow-[0_0_8px_rgba(0,255,102,0.2)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              WIN DE 1ª ({sig.timeframe})
                            </span>
                            <div className="text-[8.5px] text-[#a3d9b5] mt-0.5">1ª Vela Sem Gale</div>
                          </div>
                        ) : isGaleWin ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/50 bg-emerald-500/20 px-2 py-0.5 font-extrabold text-emerald-300 text-[10px] sm:text-[11px]">
                              <Zap className="h-3.5 w-3.5 fill-current" />
                              WIN NO G1 ({sig.timeframe})
                            </span>
                            <div className="text-[8.5px] mt-0.5">
                              {currentMartingaleMode === 'NONE' ? (
                                <span className="text-amber-300 font-bold">Loss s/ Gale (Salvo no G1)</span>
                              ) : (
                                <span className="text-emerald-400">Recuperação no G1</span>
                              )}
                            </div>
                          </div>
                        ) : isReady ? (
                          <span className="rounded-md border border-[#ffe600]/40 bg-[#ffe600]/15 px-2 py-0.5 font-bold text-[#ffe600] text-[11px]">
                            ANALISANDO
                          </span>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-bold text-rose-400 text-[10px] sm:text-[11px]">
                              <XCircle className="h-3.5 w-3.5" />
                              LOSS
                            </span>
                            <div className="text-[8.5px] text-rose-400/80 mt-0.5">Sem Recuperação</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              orders.length === 0 ? (
                <div className="py-8 text-center font-mono text-xs text-[#7a9587]">
                  Nenhuma ordem executada ainda nesta sessão. Execute uma operação para acompanhar a liquidação em tempo real.
                </div>
              ) : (
                orders.map((ord, idx) => {
                  const isCall = ord.direction === 'CALL';
                  const isWon = ord.status === 'WON';
                  const isLost = ord.status === 'LOST';
                  return (
                    <div
                      key={`${ord.id}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs transition hover:border-[#00ff66]/40"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isCall ? 'bg-[#00ff66]/20 text-[#00ff66]' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isCall ? <ArrowUpRight className="h-4 w-4 stroke-[3]" /> : <ArrowDownRight className="h-4 w-4 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{ord.assetName}</span>
                            <span className="rounded bg-black/60 px-1 py-0.2 text-[10px] text-[#7a9587] border border-white/10">
                              {ord.timeframe}
                            </span>
                            <span className={`text-[10px] font-bold ${isCall ? 'text-[#00ff66]' : 'text-rose-400'}`}>
                              {ord.direction}
                            </span>
                            <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] text-zinc-300">
                              {ord.accountMode || 'REAL'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#7a9587] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span>Entrada: <strong className="text-zinc-300">{ord.entryPrice.toFixed(5)}</strong></span>
                            {ord.exitPrice && (
                              <span>• Saída: <strong className="text-zinc-300">{ord.exitPrice.toFixed(5)}</strong></span>
                            )}
                            <span>• Investido: R$ {ord.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isWon ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-md border border-[#00ff66]/40 bg-[#00ff66]/15 px-2 py-0.5 font-bold text-[#00ff66] text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              +R$ {ord.profit?.toFixed(2)}
                            </span>
                          </div>
                        ) : isLost ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-bold text-rose-400 text-[11px]">
                              <XCircle className="h-3.5 w-3.5" />
                              -R$ {ord.amount.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="rounded-md border border-[#ffe600]/40 bg-[#ffe600]/15 px-2 py-0.5 font-bold text-[#ffe600] text-[11px] animate-pulse">
                            EM ABERTO
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

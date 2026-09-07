import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Flame,
  KeyRound,
  Zap,
  Bot,
  Radio,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  AssetPair, 
  SignalDirection, 
  Timeframe, 
  TradeOrder, 
  BrokerSession, 
  AccountMode, 
  BrokerExecutionMode,
  BrokerExecutionResult 
} from '../types';
import { sound } from '../utils/audio';

interface BrokerOrderPanelProps {
  asset: AssetPair;
  timeframe: Timeframe;
  session: BrokerSession;
  onToggleAccountMode: (mode: AccountMode) => void;
  onToggleCurrency?: (currency: 'USD' | 'BRL') => void;
  brokerExecutionMode: BrokerExecutionMode;
  onToggleBrokerExecutionMode: (mode: BrokerExecutionMode) => void;
  autoTradeEnabled: boolean;
  onToggleAutoTrade: (enabled: boolean) => void;
  isExecutingBrokerOrder: boolean;
  lastBrokerResult: BrokerExecutionResult | null;
  onPlaceTrade: (direction: SignalDirection, amount: number) => void;
  recentOrders: TradeOrder[];
  onOpenSsidModal: () => void;
  tradeAmount?: number;
  onChangeTradeAmount?: (amount: number) => void;
}

export const BrokerOrderPanel: React.FC<BrokerOrderPanelProps> = ({
  asset,
  timeframe,
  session,
  onToggleAccountMode,
  onToggleCurrency,
  brokerExecutionMode,
  onToggleBrokerExecutionMode,
  autoTradeEnabled,
  onToggleAutoTrade,
  isExecutingBrokerOrder,
  lastBrokerResult,
  onPlaceTrade,
  recentOrders,
  onOpenSsidModal,
  tradeAmount,
  onChangeTradeAmount,
}) => {
  const isRealSelected = session.accountMode === 'REAL';
  const currentBalance = isRealSelected ? session.realBalance : session.demoBalance;
  
  const isUSD = (session.currency || 'USD') === 'USD';
  const currencySymbol = isUSD ? '$' : 'R$';
  const minAmount = isUSD ? 1 : 5;
  const quickAmounts = isUSD ? [1, 5, 10, 25, 50, 100] : [5, 10, 20, 50, 100, 200];

  const [amountStr, setAmountStr] = useState<string>(() => {
    if (typeof tradeAmount === 'number' && tradeAmount > 0) return String(tradeAmount);
    return isUSD ? '10' : '20';
  });

  const parsedAmount = parseFloat(amountStr);
  const numericAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
  const isBelowMin = numericAmount < minAmount;
  const isAboveBalance = numericAmount > currentBalance;
  const isAmountValid = !isBelowMin && !isAboveBalance;

  const estimatedReturn = numericAmount * (1 + asset.payout / 100);
  const potentialProfit = numericAmount * (asset.payout / 100);

  const handleCurrencySwitch = (curr: 'USD' | 'BRL') => {
    sound.playClick();
    if (onToggleCurrency) {
      onToggleCurrency(curr);
    }
    const newMin = curr === 'USD' ? 1 : 5;
    if (numericAmount < newMin) {
      const adjusted = curr === 'USD' ? 5 : 10;
      setAmountStr(String(adjusted));
      onChangeTradeAmount?.(adjusted);
    }
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onChangeTradeAmount?.(num);
    }
  };

  const handleInputBlur = () => {
    if (isNaN(parsedAmount) || parsedAmount < minAmount) {
      setAmountStr(String(minAmount));
      onChangeTradeAmount?.(minAmount);
    }
  };

  const handleSelectQuickAmount = (val: number) => {
    sound.playClick();
    setAmountStr(String(val));
    onChangeTradeAmount?.(val);
  };

  const handleOrder = (direction: SignalDirection) => {
    if (isBelowMin) {
      sound.playError();
      return;
    }
    if (isAboveBalance) {
      sound.playError();
      return;
    }
    sound.playClick();
    onPlaceTrade(direction, numericAmount);
  };

  return (
    <div 
      id="broker-order-panel"
      className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#00ff66]/20 bg-[rgba(1,4,3,0.95)] p-4 backdrop-blur-md w-full md:w-80 shrink-0 select-none overflow-y-auto"
    >
      <div className="space-y-3.5">
        {/* Real / Demo Balance Box with Switcher */}
        <div className={`rounded-xl border p-3.5 transition ${
          isRealSelected 
            ? 'border-[#00ff66]/40 bg-black/60 shadow-[0_0_20px_rgba(0,255,102,0.1)]' 
            : 'border-amber-400/40 bg-black/60 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
        }`}>
          {/* Account Mode Tabs */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1 bg-black/80 p-0.5 rounded-lg border border-white/10">
              <button
                id="panel-switch-real"
                onClick={() => {
                  sound.playClick();
                  onToggleAccountMode('REAL');
                }}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold transition ${
                  isRealSelected 
                    ? 'bg-[#00ff66] text-black shadow-[0_0_8px_rgba(0,255,102,0.4)]' 
                    : 'text-[#7a9587] hover:text-white'
                }`}
              >
                CONTA REAL
              </button>
              <button
                id="panel-switch-demo"
                onClick={() => {
                  sound.playClick();
                  onToggleAccountMode('DEMO');
                }}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold transition ${
                  !isRealSelected 
                    ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                    : 'text-[#7a9587] hover:text-white'
                }`}
              >
                DEMO
              </button>
            </div>

            <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-extrabold ${
              isRealSelected ? 'bg-[#00ff66]/20 text-[#00ff66]' : 'bg-amber-400/20 text-amber-400'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isRealSelected ? 'bg-[#00ff66]' : 'bg-amber-400'} animate-ping`} />
              {isRealSelected ? 'AO VIVO' : 'TREINO'}
            </span>
          </div>

          <div className="font-mono text-2xl font-black text-white">
            {session.currency === 'USD' ? '$' : 'R$'} {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          {session.userName && (
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
              Titular: <span className="text-[#00ff66] font-bold">{session.userName}</span>
            </div>
          )}

          {/* SSID verification line */}
          <div 
            onClick={() => {
              sound.playClick();
              onOpenSsidModal();
            }}
            className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#7a9587] cursor-pointer hover:text-white transition pt-2 border-t border-white/10"
            title="Clique para ver ou alterar o SSID da corretora"
          >
            <span className="flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-[#00ff66]" />
              <span>SSID:</span>
              <strong className="text-zinc-300">
                {session.ssid.substring(0, 8)}...{session.ssid.substring(session.ssid.length - 4)}
              </strong>
            </span>
            <span className="text-[#00ff66] font-bold text-[10px] underline">
              {session.isConnected ? 'Conectado' : 'Verificado'}
            </span>
          </div>
        </div>

        {/* ─── PAINEL DE EXECUÇÃO DIRETA NA CORRETORA (OPTGO) ───────────────── */}
        <div className="rounded-xl border border-[#00ff66]/40 bg-gradient-to-b from-[#00ff66]/10 to-transparent p-3 space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white font-extrabold text-[11px]">
              <Radio className={`h-3.5 w-3.5 ${brokerExecutionMode !== 'OFF' ? 'text-[#00ff66] animate-pulse' : 'text-zinc-400'}`} />
              <span>ORDEM NA CORRETORA (OPTGO)</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
              brokerExecutionMode === 'REAL'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : brokerExecutionMode === 'DEMO'
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {brokerExecutionMode === 'REAL' ? 'OPTGO REAL' : brokerExecutionMode === 'DEMO' ? 'OPTGO DEMO' : 'DESATIVADO'}
            </span>
          </div>

          {/* 3-Way Selector: OFF (Simulador) | DEMO (OPTGO) | REAL (OPTGO) */}
          <div className="grid grid-cols-3 gap-1 bg-black/80 p-1 rounded-lg border border-white/10 text-[9px] font-bold text-center">
            <button
              onClick={() => {
                sound.playClick();
                onToggleBrokerExecutionMode('OFF');
              }}
              className={`py-1.5 rounded transition ${
                brokerExecutionMode === 'OFF'
                  ? 'bg-zinc-700 text-white font-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              SIMULADO
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onToggleBrokerExecutionMode('DEMO');
              }}
              className={`py-1.5 rounded transition ${
                brokerExecutionMode === 'DEMO'
                  ? 'bg-amber-400 text-black font-black shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : 'text-amber-400/70 hover:text-amber-300'
              }`}
            >
              OPTGO DEMO
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onToggleBrokerExecutionMode('REAL');
              }}
              className={`py-1.5 rounded transition ${
                brokerExecutionMode === 'REAL'
                  ? 'bg-[#00ff66] text-black font-black shadow-[0_0_10px_rgba(0,255,102,0.5)]'
                  : 'text-[#00ff66]/70 hover:text-[#00ff66]'
              }`}
            >
              OPTGO REAL
            </button>
          </div>

          {/* Auto-Trade (Robô de Entrada nos Sinais da Prisma IA) */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bot className={`h-3.5 w-3.5 ${autoTradeEnabled ? 'text-[#00ff66]' : 'text-zinc-400'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-200 font-bold">Auto-Trade Prisma IA</span>
                <span className="text-[8px] text-[#7a9587]">Disparo automático nos sinais</span>
              </div>
            </div>
            <button
              id="toggle-autotrade-btn"
              onClick={() => {
                sound.playClick();
                onToggleAutoTrade(!autoTradeEnabled);
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-black transition ${
                autoTradeEnabled
                  ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                  : 'bg-black/60 border border-white/15 text-zinc-400 hover:text-white'
              }`}
            >
              {autoTradeEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>

          {/* Active Broker Notification or Progress */}
          {isExecutingBrokerOrder && (
            <div className="flex items-center gap-1.5 bg-[#00ff66]/20 border border-[#00ff66]/50 rounded-lg p-1.5 text-[9px] text-[#00ff66] animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin shrink-0" />
              <span>Enviando ordem Quadcode para a corretora OPTGO...</span>
            </div>
          )}

          {lastBrokerResult && (
            <div className={`rounded-lg p-1.5 text-[9px] border ${
              lastBrokerResult.success 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-1 font-bold">
                {lastBrokerResult.success ? (
                  <CheckCircle2 className="h-3 w-3 text-[#00ff66] shrink-0" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                )}
                <span>{lastBrokerResult.message || lastBrokerResult.error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Investment Amount & Currency Switcher */}
        <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3">
          {/* Header with Title and Currency Toggle USD vs BRL */}
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <span>Valor da Entrada:</span>
            </label>

            {/* Currency Switcher: USD ($) vs BRL (R$) */}
            <div className="flex items-center gap-1 bg-black/90 p-0.5 rounded-lg border border-white/15">
              <button
                type="button"
                id="currency-switch-usd"
                onClick={() => handleCurrencySwitch('USD')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold transition ${
                  isUSD
                    ? 'bg-[#00ff66] text-black shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                    : 'text-[#7a9587] hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                id="currency-switch-brl"
                onClick={() => handleCurrencySwitch('BRL')}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold transition ${
                  !isUSD
                    ? 'bg-[#00ff66] text-black shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                    : 'text-[#7a9587] hover:text-white'
                }`}
              >
                BRL (R$)
              </button>
            </div>
          </div>

          {/* Direct Typed Input Field with Currency Prefix */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-black text-[#00ff66]">
              {currencySymbol}
            </span>
            <input
              id="trade-amount-input"
              type="number"
              step="any"
              min={minAmount}
              value={amountStr}
              onChange={handleAmountInputChange}
              onBlur={handleInputBlur}
              placeholder={`Mín. ${currencySymbol} ${minAmount}`}
              className={`w-full rounded-lg border bg-black/80 pl-10 pr-14 py-2 font-mono text-sm font-black text-white outline-none transition ${
                isBelowMin
                  ? 'border-amber-400/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                  : isAboveBalance
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-[#00ff66]/40 focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              {isUSD ? 'USD' : 'BRL'}
            </span>
          </div>

          {/* Validation Notice & Minimum Rule */}
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={isBelowMin ? 'text-amber-400 font-bold' : 'text-[#7a9587]'}>
              Mínimo: <strong className="text-white">{currencySymbol} {minAmount},00</strong>
            </span>
            <span className="text-[#7a9587]">
              Saldo: <strong className="text-zinc-300">{currencySymbol} {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>

          {/* Alert if typed value is below required minimum */}
          {isBelowMin && (
            <div className="flex items-center gap-1.5 bg-amber-950/50 border border-amber-500/50 rounded-lg px-2 py-1 text-[10px] font-mono text-amber-300">
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
              <span>
                Mínimo obrigatório: {isUSD ? '$1 Dólar' : 'R$ 5 Reais'}.
              </span>
            </div>
          )}

          {isAboveBalance && (
            <div className="flex items-center gap-1.5 bg-rose-950/50 border border-rose-500/50 rounded-lg px-2 py-1 text-[10px] font-mono text-rose-300">
              <AlertTriangle className="h-3 w-3 shrink-0 text-rose-400" />
              <span>Saldo insuficiente na conta selecionada.</span>
            </div>
          )}

          {/* Quick chips adapted to USD vs BRL */}
          <div className="flex gap-1.5 pt-0.5">
            {quickAmounts.map((chipVal) => (
              <button
                key={chipVal}
                type="button"
                id={`quick-amt-${chipVal}`}
                onClick={() => handleSelectQuickAmount(chipVal)}
                className={`flex-1 rounded py-1 font-mono text-[10px] font-bold transition ${
                  numericAmount === chipVal
                    ? 'bg-[#00ff66] text-black font-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                    : 'bg-black/60 border border-white/10 text-zinc-300 hover:border-[#00ff66]/40 hover:text-white'
                }`}
              >
                {currencySymbol}{chipVal}
              </button>
            ))}
          </div>
        </div>

        {/* Payout and Profit preview */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-300">
            <span>Rendimento do Ativo:</span>
            <span className="font-extrabold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded">
              +{asset.payout}%
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Tempo de Expiração:</span>
            <span className="font-bold text-white">{timeframe} (Próxima Vela)</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex items-center justify-between text-white font-bold">
            <span>Lucro Estimado (Win):</span>
            <span className="text-[#00ff66] text-sm font-black">
              +{currencySymbol} {potentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Big Trading Buttons: CALL (Compra) & PUT (Venda) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* CALL Button */}
          <button
            id="order-call-btn"
            onClick={() => handleOrder('CALL')}
            disabled={isExecutingBrokerOrder || isBelowMin || isAboveBalance}
            className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-[#00ff66]/80 bg-gradient-to-b from-[#00ff66] to-[#00cc52] py-3.5 px-3 text-black font-extrabold transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-5 w-5 stroke-[3] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="font-display text-base font-black">ACIMA</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-black/90 font-black">
              CALL {brokerExecutionMode !== 'OFF' ? `(OPTGO ${brokerExecutionMode})` : '(COMPRA)'}
            </span>
          </button>

          {/* PUT Button */}
          <button
            id="order-put-btn"
            onClick={() => handleOrder('PUT')}
            disabled={isExecutingBrokerOrder || isBelowMin || isAboveBalance}
            className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-rose-500/80 bg-gradient-to-b from-[#ff3355] to-[#cc1433] py-3.5 px-3 text-white font-extrabold transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(255,51,85,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-1">
              <ArrowDownRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="font-display text-base font-black">ABAIXO</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/90 font-black">
              PUT {brokerExecutionMode !== 'OFF' ? `(OPTGO ${brokerExecutionMode})` : '(VENDA)'}
            </span>
          </button>
        </div>
      </div>

      {/* Recent Open/Closed Orders Drawer in Panel */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-[#7a9587] font-bold uppercase">Ordens Recentes</span>
          <span className="text-[10px] text-zinc-400">{recentOrders.length} ordens</span>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {recentOrders.length === 0 ? (
            <div className="text-center py-4 text-[11px] font-mono text-[#7a9587]">
              Nenhuma ordem em andamento no momento.
            </div>
          ) : (
            recentOrders.slice(0, 5).map((order, idx) => (
              <div
                key={`${order.id}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 px-2.5 py-1.5 font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-[10px] px-1 py-0.2 rounded ${
                      order.direction === 'CALL'
                        ? 'bg-[#00ff66]/20 text-[#00ff66]'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {order.direction}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 text-[10px]">{order.assetName}</span>
                    {order.brokerOptionId && (
                      <span className="text-[#00ff66] text-[8px]">
                        OPTGO #{order.brokerOptionId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">
                    {session.currency === 'USD' ? '$' : 'R$'} {order.amount}
                  </span>
                  {order.status === 'OPEN' ? (
                    <span className="text-amber-400 text-[10px] animate-pulse">EM ABERTO</span>
                  ) : order.status === 'WON' ? (
                    <span className="text-[#00ff66] font-bold text-[10px]">
                      +{session.currency === 'USD' ? '$' : 'R$'} {order.profit?.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-[10px]">
                      -{session.currency === 'USD' ? '$' : 'R$'} {order.amount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

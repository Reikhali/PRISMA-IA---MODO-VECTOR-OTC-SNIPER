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
  KeyRound
} from 'lucide-react';
import { AssetPair, SignalDirection, Timeframe, TradeOrder, BrokerSession, AccountMode } from '../types';
import { sound } from '../utils/audio';

interface BrokerOrderPanelProps {
  asset: AssetPair;
  timeframe: Timeframe;
  session: BrokerSession;
  onToggleAccountMode: (mode: AccountMode) => void;
  onPlaceTrade: (direction: SignalDirection, amount: number) => void;
  recentOrders: TradeOrder[];
  onOpenSsidModal: () => void;
}

export const BrokerOrderPanel: React.FC<BrokerOrderPanelProps> = ({
  asset,
  timeframe,
  session,
  onToggleAccountMode,
  onPlaceTrade,
  recentOrders,
  onOpenSsidModal,
}) => {
  const isReal = session.accountMode === 'REAL';
  const currentBalance = isReal ? session.realBalance : session.demoBalance;
  const [amount, setAmount] = useState<number>(50);
  const quickAmounts = [25, 50, 100, 250, 500];

  const estimatedReturn = amount * (1 + asset.payout / 100);
  const potentialProfit = amount * (asset.payout / 100);

  const handleOrder = (direction: SignalDirection) => {
    sound.playClick();
    onPlaceTrade(direction, amount);
  };

  return (
    <div 
      id="broker-order-panel"
      className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#00ff66]/20 bg-[rgba(1,4,3,0.95)] p-4 backdrop-blur-md w-full md:w-80 shrink-0 select-none"
    >
      <div className="space-y-4">
        {/* Real / Demo Balance Box with Switcher */}
        <div className={`rounded-xl border p-3.5 transition ${
          isReal 
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
                  isReal 
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
                  !isReal 
                    ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                    : 'text-[#7a9587] hover:text-white'
                }`}
              >
                DEMO
              </button>
            </div>

            <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-extrabold ${
              isReal ? 'bg-[#00ff66]/20 text-[#00ff66]' : 'bg-amber-400/20 text-amber-400'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isReal ? 'bg-[#00ff66]' : 'bg-amber-400'} animate-ping`} />
              {isReal ? 'AO VIVO' : 'TREINO'}
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

        {/* Investment Amount */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between font-mono text-xs font-bold text-zinc-300">
            <span>Valor da Entrada (R$):</span>
            <span className="text-[10px] text-[#7a9587]">Mínimo: R$ 10</span>
          </label>
          <div className="relative">
            <input
              id="trade-amount-input"
              type="number"
              min={10}
              max={currentBalance}
              value={amount}
              onChange={(e) => setAmount(Math.max(10, Number(e.target.value)))}
              className="w-full rounded-lg border border-[#00ff66]/30 bg-black/60 px-3 py-2 font-mono text-sm font-bold text-white outline-none transition focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#7a9587]">
              BRL
            </span>
          </div>

          {/* Quick chips */}
          <div className="flex gap-1.5 pt-1">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                id={`quick-amt-${amt}`}
                onClick={() => {
                  sound.playClick();
                  setAmount(amt);
                }}
                className={`flex-1 rounded py-1 font-mono text-[10px] font-bold transition ${
                  amount === amt
                    ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-black/50 border border-white/10 text-zinc-300 hover:border-[#00ff66]/40 hover:text-white'
                }`}
              >
                +{amt}
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
              +R$ {potentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Big Trading Buttons: CALL (Compra) & PUT (Venda) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* CALL Button */}
          <button
            id="order-call-btn"
            onClick={() => handleOrder('CALL')}
            className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-[#00ff66]/80 bg-gradient-to-b from-[#00ff66] to-[#00cc52] py-3.5 px-3 text-black font-extrabold transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.35)]"
          >
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-5 w-5 stroke-[3] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="font-display text-base font-black">ACIMA</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-black/90 font-black">
              CALL (COMPRA)
            </span>
          </button>

          {/* PUT Button */}
          <button
            id="order-put-btn"
            onClick={() => handleOrder('PUT')}
            className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-rose-500/80 bg-gradient-to-b from-[#ff3355] to-[#cc1433] py-3.5 px-3 text-white font-extrabold transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(255,51,85,0.35)]"
          >
            <div className="flex items-center gap-1">
              <ArrowDownRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="font-display text-base font-black">ABAIXO</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/90 font-black">
              PUT (VENDA)
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
            recentOrders.slice(0, 4).map((order, idx) => (
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
                  <span className="text-zinc-200">{order.assetName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">R$ {order.amount}</span>
                  {order.status === 'OPEN' ? (
                    <span className="text-amber-400 text-[10px] animate-pulse">EM ANDAMENTO</span>
                  ) : order.status === 'WON' ? (
                    <span className="text-[#00ff66] font-bold text-[10px]">
                      +R$ {order.profit?.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-[10px]">
                      -R$ {order.amount}
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

import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  Volume2, 
  VolumeX, 
  Server, 
  Activity, 
  ChevronDown, 
  CheckCircle2, 
  ShieldCheck,
  TrendingUp,
  Sliders,
  Search,
  Lock,
  Globe,
  KeyRound,
  Wallet
} from 'lucide-react';
import { AssetPair, Timeframe, BrokerSession, AccountMode } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentAsset: AssetPair;
  allAssets: AssetPair[];
  onSelectAsset: (asset: AssetPair) => void;
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  isFloatingOpen: boolean;
  onToggleFloating: () => void;
  onOpenServerModal: () => void;
  stats: { wins: number; losses: number; winrate: number };
  session: BrokerSession;
  onToggleAccountMode: (mode: AccountMode) => void;
  onOpenSsidModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAsset,
  allAssets,
  onSelectAsset,
  timeframe,
  onSelectTimeframe,
  isFloatingOpen,
  onToggleFloating,
  onOpenServerModal,
  stats,
  session,
  onToggleAccountMode,
  onOpenSsidModal,
}) => {
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'OTC' | 'COMMODITIES' | 'CRYPTO'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playClick();
    }
  };

  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || asset.type === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allAssets, searchQuery, categoryFilter]);

  return (
    <header 
      id="prisma-vector-header"
      className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[#00ff66]/30 bg-[#02150a]/95 px-4 py-2.5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,255,102,0.15)]"
    >
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-1.5 rounded-xl bg-[#00ff66]/30 blur-md animate-pulse" />
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border-2 border-[#00ff66] bg-[#02150a] shadow-[0_0_20px_rgba(0,255,102,0.5)]">
            <img 
              src="/assets/prisma_vector_logo.jpg" 
              alt="Prisma IA Vector-OTC" 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              PRISMA IA <span className="text-[#00ff66] text-xs font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#00ff66]/15 border border-[#00ff66]/50 shadow-[0_0_10px_rgba(0,255,102,0.2)]">MODO VECTOR-OTC</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#00ff66]/40 bg-[#00ff66]/15 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#00ff66]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-ping" />
              OPTGO CONTA REAL
            </span>
          </div>
          <p className="font-mono text-[11px] font-semibold text-[#7a9587] flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-[#00ff66]" />
            <span className="text-[#00ff66]">SSL REAL</span>
            <span>• trade.optgobroker.com/traderoom • Velas em Tempo Real</span>
          </p>
        </div>
      </div>

      {/* Asset Selector & Timeframes */}
      <div className="flex items-center gap-2">
        {/* Asset dropdown */}
        <div className="relative">
          <button
            id="asset-selector-btn"
            onClick={() => {
              sound.playClick();
              setAssetDropdownOpen(!assetDropdownOpen);
            }}
            className="flex items-center gap-2.5 rounded-lg border border-[#00ff66]/30 bg-black/60 px-3 py-1.5 text-xs font-bold text-white transition hover:border-[#00ff66]/70 hover:bg-[#00ff66]/10 shadow-[0_0_15px_rgba(0,255,102,0.1)]"
          >
            <span className="font-mono text-[#00ff66] font-extrabold">{currentAsset.name}</span>
            <span className="rounded bg-[#00ff66]/20 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-[#00ff66] border border-[#00ff66]/30">
              {currentAsset.payout}% PAYOUT
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#7a9587] transition-transform ${assetDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {assetDropdownOpen && (
            <div className="absolute left-0 mt-1 w-80 sm:w-96 rounded-2xl border border-[#00ff66]/40 bg-[#020603]/98 p-3 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in">
              {/* Header & Search */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#00ff66] flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Ativos OptGo Broker (Feed Real)
                </span>
                <span className="text-[10px] font-mono text-[#7a9587]">
                  {allAssets.length} Ativos Conectados
                </span>
              </div>

              {/* Search input */}
              <div className="relative my-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7a9587]" />
                <input
                  type="text"
                  placeholder="Buscar ativo (ex: BRL, EUR, Ouro, BTC)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/80 pl-8 pr-3 py-1.5 font-mono text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00ff66]/60"
                  autoFocus
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-1 mb-2 font-mono text-[10px]">
                {(['ALL', 'OTC', 'COMMODITIES', 'CRYPTO'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setCategoryFilter(cat);
                    }}
                    className={`flex-1 rounded py-1 transition font-bold ${
                      categoryFilter === cat
                        ? 'bg-[#00ff66] text-black shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                        : 'bg-black/60 text-[#7a9587] hover:text-white border border-white/5'
                    }`}
                  >
                    {cat === 'ALL' ? 'TODOS' : cat === 'CRYPTO' ? 'CRIPTO' : cat}
                  </button>
                ))}
              </div>

              {/* Asset List */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-4 font-mono text-xs text-[#7a9587]">
                    Nenhum ativo encontrado para essa busca.
                  </div>
                ) : (
                  filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        sound.playClick();
                        onSelectAsset(asset);
                        setAssetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                        currentAsset.id === asset.id
                          ? 'bg-[#00ff66]/20 text-[#00ff66] font-bold border border-[#00ff66]/50 shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                          : 'text-zinc-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{asset.name}</span>
                        {asset.isHot && (
                          <span className="text-[9px] font-black text-amber-400 bg-amber-400/15 border border-amber-400/30 px-1 rounded">
                            HOT
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-[#7a9587] rounded bg-white/5 px-1">
                          {asset.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-white/95">
                          {asset.basePrice.toFixed(asset.decimals)}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${asset.change24h >= 0 ? 'text-[#00ff66]' : 'text-rose-400'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                        </span>
                        <span className="rounded-md bg-[#00ff66]/20 border border-[#00ff66]/40 px-1.5 py-0.5 font-mono text-[10px] font-black text-[#00ff66]">
                          {asset.payout}%
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timeframes */}
        <div className="flex items-center rounded-lg border border-[#00ff66]/20 bg-black/60 p-0.5">
          {(['M1', 'M5', 'M15'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              id={`tf-btn-${tf}`}
              onClick={() => {
                sound.playClick();
                onSelectTimeframe(tf);
              }}
              className={`rounded-md px-2.5 py-1 font-mono text-xs font-black transition ${
                timeframe === tf
                  ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                  : 'text-[#7a9587] hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Real Server cluster status, Stats & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Account Mode Switcher (Real vs Demo) */}
        <div className="flex items-center rounded-lg border border-white/15 bg-black/60 p-0.5">
          <button
            id="account-mode-real-btn"
            onClick={() => {
              sound.playClick();
              onToggleAccountMode('REAL');
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition ${
              session.accountMode === 'REAL'
                ? 'bg-[#00ff66] text-black font-black shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                : 'text-[#7a9587] hover:text-white'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${session.accountMode === 'REAL' ? 'bg-black animate-ping' : 'bg-[#00ff66]'}`} />
            <span>REAL: {session.currency === 'USD' ? '$' : 'R$'} {session.realBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </button>

          <button
            id="account-mode-demo-btn"
            onClick={() => {
              sound.playClick();
              onToggleAccountMode('DEMO');
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition ${
              session.accountMode === 'DEMO'
                ? 'bg-amber-400 text-black font-black shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'text-[#7a9587] hover:text-white'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${session.accountMode === 'DEMO' ? 'bg-black animate-ping' : 'bg-amber-400'}`} />
            <span>DEMO: {session.currency === 'USD' ? '$' : 'R$'} {session.demoBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </button>
        </div>

        {/* SSID Connection Status button */}
        <button
          id="ssid-status-btn"
          onClick={() => {
            sound.playClick();
            onOpenSsidModal();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-[#00ff66]/40 bg-black/60 px-2.5 py-1.5 text-xs font-mono font-bold text-[#00ff66] transition hover:bg-[#00ff66]/15"
          title={`SSID Ativo: ${session.ssid} | Clique para gerenciar`}
        >
          <KeyRound className="h-3.5 w-3.5 text-[#00ff66]" />
          <span className="hidden lg:inline">SSID:</span>
          <span className="font-mono text-[11px] text-white">
            {session.ssid.substring(0, 6)}...{session.ssid.substring(session.ssid.length - 4)}
          </span>
          <span className="rounded bg-[#00ff66]/20 px-1 py-0.2 text-[9px] text-[#00ff66]">
            {session.latencyMs}ms
          </span>
        </button>

        {/* Assertividade Counter */}
        <div className="hidden xl:flex items-center gap-2 rounded-lg border border-[#00ff66]/25 bg-black/50 px-3 py-1 text-xs">
          <TrendingUp className="h-3.5 w-3.5 text-[#00ff66]" />
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-[10px] font-bold text-[#7a9587]">ASSERTIVIDADE:</span>
            <span className="font-extrabold text-[#00ff66]">{stats.winrate}%</span>
            <span className="text-[10px] text-zinc-400">({stats.wins}W / {stats.losses}L)</span>
          </div>
        </div>

        {/* Server Cluster status button */}
        <button
          id="server-cluster-btn"
          onClick={() => {
            sound.playClick();
            onOpenServerModal();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-[#00ff66]/30 bg-[#00ff66]/10 px-2.5 py-1.5 text-xs font-mono font-bold text-[#00ff66] transition hover:bg-[#00ff66]/20"
          title="Ver todos os servidores conectados em tempo real"
        >
          <Server className="h-3.5 w-3.5" />
          <span className="h-2 w-2 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="hidden sm:inline">SERVIDORES 100% ONLINE</span>
          <span className="text-[10px] text-white/70">(11ms)</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          id="audio-toggle-btn"
          onClick={toggleSound}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            soundEnabled
              ? 'border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66]'
              : 'border-zinc-700 bg-black/40 text-zinc-500'
          }`}
          title={soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Toggle Floating Panel */}
        <button
          id="toggle-floating-panel-btn"
          onClick={() => {
            sound.playClick();
            onToggleFloating();
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-extrabold uppercase transition ${
            isFloatingOpen
              ? 'border-[#00ff66] bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.4)]'
              : 'border-[#00ff66]/40 bg-black/70 text-[#00ff66] hover:bg-[#00ff66]/15'
          }`}
        >
          <Crosshair className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Painel Flutuante IA</span>
        </button>
      </div>
    </header>
  );
};

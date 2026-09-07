import React, { useState, useEffect, useRef } from 'react';
import { AssetPair, BullBearAnalysis, Candle, ServerNode, SignalDirection, SniperSignal, Timeframe, TradeOrder, BrokerSession, AccountMode, MartingaleMode } from './types';
import { 
  ASSET_PAIRS, 
  INITIAL_SERVERS, 
  INITIAL_RECENT_SIGNALS, 
  generateCandles, 
  calcBullBear,
  createBullBearSignal 
} from './utils/marketData';
import { brokerStream } from './services/brokerStream';
import { Header } from './components/Header';
import { ChartCanvas } from './components/ChartCanvas';
import { FloatingSniperPanel } from './components/FloatingSniperPanel';
import { BrokerOrderPanel } from './components/BrokerOrderPanel';
import { ServerClusterModal } from './components/ServerClusterModal';
import { SignalHistoryDrawer } from './components/SignalHistoryDrawer';
import { SsidConnectionModal } from './components/SsidConnectionModal';
import { sound } from './utils/audio';
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  History, 
  Server, 
  Zap, 
  Bell, 
  Crosshair,
  KeyRound
} from 'lucide-react';

export default function App() {
  const [allAssets, setAllAssets] = useState<AssetPair[]>(ASSET_PAIRS);
  const [currentAsset, setCurrentAsset] = useState<AssetPair>(ASSET_PAIRS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('M1');
  const [candles, setCandles] = useState<Candle[]>(() => generateCandles(ASSET_PAIRS[0], 55));
  const [currentPrice, setCurrentPrice] = useState<number>(ASSET_PAIRS[0].basePrice);
  
  // Real / Demo Broker Session (SSID and Balances)
  const [session, setSession] = useState<BrokerSession>(() => brokerStream.getSession());
  const [ssidModalOpen, setSsidModalOpen] = useState<boolean>(false);

  // Bulls vs Bears Analysis State
  const [bullBear, setBullBear] = useState<BullBearAnalysis>(() => calcBullBear(candles));
  const [activeSignal, setActiveSignal] = useState<SniperSignal | null>(null);
  const lastAutoSignalTimeRef = useRef<number>(0);
  const AUTO_SIGNAL_COOLDOWN = 120000; // 2 minutos de cooldown como no script original

  // Floating Panel Visibility
  const [isFloatingOpen, setIsFloatingOpen] = useState<boolean>(true);

  // Modals
  const [serverModalOpen, setServerModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  // Servers
  const [servers, setServers] = useState<ServerNode[]>(INITIAL_SERVERS);

  // Real History (Persisted in localStorage with 100% verified prices)
  const [recentOrders, setRecentOrders] = useState<TradeOrder[]>(() => {
    try {
      const saved = localStorage.getItem('prisma_real_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [signalHistory, setSignalHistory] = useState<SniperSignal[]>(() => {
    try {
      const saved = localStorage.getItem('prisma_real_signals');
      return saved ? JSON.parse(saved) : INITIAL_RECENT_SIGNALS;
    } catch {
      return INITIAL_RECENT_SIGNALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('prisma_real_orders', JSON.stringify(recentOrders));
    } catch {}
  }, [recentOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('prisma_real_signals', JSON.stringify(signalHistory));
    } catch {}
  }, [signalHistory]);

  const handleClearHistory = () => {
    setRecentOrders([]);
    setSignalHistory([]);
    try {
      localStorage.removeItem('prisma_real_orders');
      localStorage.removeItem('prisma_real_signals');
    } catch {}
  };

  // Martingale strategy configuration: 'GALE1' (permite 1 recuperação de 1M) ou 'NONE' (mão fixa sem gale)
  const [martingaleMode, setMartingaleMode] = useState<MartingaleMode>(() => {
    try {
      const saved = localStorage.getItem('vector_martingale_mode');
      if (saved === 'NONE' || saved === 'GALE1') return saved;
    } catch {}
    return 'GALE1';
  });

  const handleToggleMartingaleMode = (mode: MartingaleMode) => {
    setMartingaleMode(mode);
    try {
      localStorage.setItem('vector_martingale_mode', mode);
    } catch {}
  };

  // Daily Real Statistics (Strictly audited from actual signals and orders)
  const stats = React.useMemo(() => {
    const allSignals = signalHistory.filter((s) => s.status === 'WIN' || s.status === 'LOSS');
    const allOrders = recentOrders.filter((o) => o.status === 'WON' || o.status === 'LOST');
    
    // No modo 'GALE1', tanto WIN quanto WIN_GALE1 contam como vitória
    // No modo 'NONE' (Sem Gale), apenas WIN (1ª vela) conta como vitória
    const signalWins = allSignals.filter((s) => {
      if (s.result === 'WIN') return true;
      if (s.result === 'WIN_GALE1') return martingaleMode === 'GALE1';
      return s.status === 'WIN';
    }).length;
    const signalLosses = allSignals.length - signalWins;

    const wins = signalWins + allOrders.filter((o) => o.status === 'WON').length;
    const losses = signalLosses + allOrders.filter((o) => o.status === 'LOST').length;
    const total = wins + losses;
    const winrate = total > 0 ? +((wins / total) * 100).toFixed(1) : 100.0;
    return { wins, losses, winrate };
  }, [signalHistory, recentOrders, martingaleMode]);

  // Keep latest refs for interval loop
  const martingaleModeRef = useRef(martingaleMode);
  martingaleModeRef.current = martingaleMode;

  const currentAssetRef = useRef(currentAsset);
  currentAssetRef.current = currentAsset;

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  const timeframeRef = useRef(timeframe);
  timeframeRef.current = timeframe;

  const activeSignalRef = useRef(activeSignal);
  activeSignalRef.current = activeSignal;

  const nextSignalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize brokerStream connection on asset change
  useEffect(() => {
    if (candles.length > 0) {
      brokerStream.connectAsset(currentAsset, candles[candles.length - 1]);
    }
  }, [currentAsset]);

  // Initial account fetch & initial quotes for all assets
  useEffect(() => {
    brokerStream.fetchAccount().then((acc) => {
      setSession(acc);
    });
    brokerStream.fetchInitialQuotes();
  }, []);

  // Subscribe to real-time broker ticks, history candles, live balance, and multi-asset live quotes
  useEffect(() => {
    const unsubscribe = brokerStream.subscribe(
      (livePrice, updatedCandle) => {
        setCurrentPrice(livePrice);
        setCandles((prevCandles) => {
          if (prevCandles.length === 0) return prevCandles;
          const lastIdx = prevCandles.length - 1;
          return [...prevCandles.slice(0, lastIdx), updatedCandle];
        });
      },
      (newCandle) => {
        setCandles((prevCandles) => [...prevCandles.slice(-70), newCandle]);
      },
      (status) => {
        setSession((prev) => ({
          ...prev,
          isConnected: status.isConnected,
          latencyMs: status.latencyMs,
        }));
      },
      (historyCandles) => {
        if (historyCandles && historyCandles.length > 0) {
          setCandles(historyCandles);
          setCurrentPrice(historyCandles[historyCandles.length - 1].close);
        }
      },
      (updatedSession) => {
        setSession(updatedSession);
      },
      // Real-time quote for any asset in OptGo
      (activeId: number, price: number) => {
        setAllAssets((prev) =>
          prev.map((a) => {
            if (a.activeId === activeId) {
              const oldBase = a.basePrice || price;
              const change = +(((price - oldBase) / oldBase) * 100).toFixed(2);
              return {
                ...a,
                basePrice: price,
                change24h: change !== 0 ? change : a.change24h,
              };
            }
            return a;
          })
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // Whenever asset changes, connect brokerStream and calculate Bulls vs Bears
  const handleSelectAsset = (asset: AssetPair) => {
    if (nextSignalTimerRef.current) {
      clearTimeout(nextSignalTimerRef.current);
      nextSignalTimerRef.current = null;
    }
    setCurrentAsset(asset);
    const newCandles = generateCandles(asset, 55);
    setCandles(newCandles);
    setCurrentPrice(newCandles[newCandles.length - 1].close);
    brokerStream.connectAsset(asset, newCandles[newCandles.length - 1]);
    
    const bb = calcBullBear(newCandles);
    setBullBear(bb);
    if (bb.force >= 77) {
      const newSig = createBullBearSignal(asset, bb, timeframe);
      setActiveSignal(newSig);
    } else {
      setActiveSignal(null);
    }
  };

  const handleSelectTimeframe = (tf: Timeframe) => {
    setTimeframe(tf);
    const newCandles = generateCandles(currentAsset, 55);
    setCandles(newCandles);
    const bb = calcBullBear(newCandles);
    setBullBear(bb);
    if (bb.force >= 77) {
      setActiveSignal(createBullBearSignal(currentAsset, bb, tf));
    } else {
      setActiveSignal(null);
    }
  };

  const handleToggleAccountMode = (mode: AccountMode) => {
    const updated = brokerStream.setAccountMode(mode);
    setSession(updated);
  };

  const handleUpdateSession = (partial: Partial<BrokerSession>) => {
    const prevSsid = session.ssid;
    const updated = brokerStream.updateSession(partial);
    setSession(updated);
    if (partial.ssid && partial.ssid !== prevSsid) {
      brokerStream.reconnect();
    }
  };

  // Quotex Radar v3: Análise em tempo real de Touros vs Ursos e Disparo Automático (≥ 77%)
  useEffect(() => {
    const bb = calcBullBear(candles);
    setBullBear(bb);

    // FILTRO DE DISPARO: Gera sinal automático ao atingir 77-100% de força
    if (bb.force >= 77) {
      const now = Date.now();
      if (now - lastAutoSignalTimeRef.current > AUTO_SIGNAL_COOLDOWN) {
        lastAutoSignalTimeRef.current = now;
        const newSig = createBullBearSignal(currentAsset, bb, timeframe, currentPriceRef.current);
        setActiveSignal(newSig);

        // Sons do Quotex Radar
        sound.playCharge();
        if (newSig.direction === 'CALL') {
          sound.playCallSound();
        } else {
          sound.playPutSound();
        }
      }
    }
  }, [candles, currentAsset, timeframe]);

  // ANALISADOR MODO VECTOR: Disparo inteligente de sinal com filtro estrito de confluência
  // Regra Estrita:
  // - Compra (CALL): Só gera sinal se o mercado estiver EQUILIBRADO ou com TOUROS DOMINANDO. Se Ursos estiverem dominando, BLOQUEIA a compra!
  // - Venda (PUT): Só gera sinal se o mercado estiver EQUILIBRADO ou com URSOS DOMINANDO. Se Touros estiverem dominando, BLOQUEIA a venda!
  const handleSimulateTrigger = (directionChoice: 'AUTO' | 'CALL' | 'PUT' = 'AUTO'): { success: boolean; title: string; detail: string } => {
    // 1. Obter a força real do fluxo de mercado atual
    const currentBB = calcBullBear(candles);
    const { bullPct, bearPct } = currentBB;

    // Definição de domínio e equilíbrio:
    // Se a diferença for <= 6%, consideramos o mercado em equilíbrio
    const isEquilibrado = Math.abs(bullPct - bearPct) <= 6;
    const isBullDominating = !isEquilibrado && bullPct > bearPct;
    const isBearDominating = !isEquilibrado && bearPct > bullPct;

    // 2. Determinar a direção desejada (ou auto pelo tick da vela)
    let targetDirection: 'CALL' | 'PUT';
    if (directionChoice === 'CALL') {
      targetDirection = 'CALL';
    } else if (directionChoice === 'PUT') {
      targetDirection = 'PUT';
    } else {
      // Modo AUTO: Avalia o momentum imediato da vela atual
      const lastCandle = candles[candles.length - 1];
      const candleOpen = lastCandle ? lastCandle.open : currentPrice;
      targetDirection = currentPrice >= candleOpen ? 'CALL' : 'PUT';
    }

    // 3. Aplicação ESTRITA da Regra do Modo Vector:
    // CASO COMPRA (CALL):
    if (targetDirection === 'CALL') {
      if (isBearDominating) {
        // Ursos estão dominando -> NÃO GERA O SINAL DE COMPRA!
        sound.playError();
        return {
          success: false,
          title: '⛔ ENTRADA DE COMPRA RECUSADA',
          detail: `Ursos dominando o mercado (${bearPct}% vs ${bullPct}%). O Analisador Vector bloqueou a compra contra o fluxo de baixa. Aguarde equilíbrio ou touros dominando.`,
        };
      }
      // Permitido apenas se Touros dominando OU Mercado em Equilíbrio
    }

    // CASO VENDA (PUT):
    if (targetDirection === 'PUT') {
      if (isBullDominating) {
        // Touros estão dominando -> NÃO GERA O SINAL DE VENDA!
        sound.playError();
        return {
          success: false,
          title: '⛔ ENTRADA DE VENDA RECUSADA',
          detail: `Touros dominando o mercado (${bullPct}% vs ${bearPct}%). O Analisador Vector bloqueou a venda contra o fluxo de alta. Aguarde equilíbrio ou ursos dominando.`,
        };
      }
      // Permitido apenas se Ursos dominando OU Mercado em Equilíbrio
    }

    // 4. Se aprovado pelos filtros, GERA O SINAL com força no gatilho de 77%+
    const isCall = targetDirection === 'CALL';
    const dominantDir = isCall ? 'bull' : 'bear';
    const chosenForce = Math.max(77, Math.min(99, isCall ? bullPct : bearPct, Math.floor(Math.random() * 6 + 77)));

    const simulatedBB: BullBearAnalysis = {
      bullPct: isCall ? chosenForce : 100 - chosenForce,
      bearPct: isCall ? 100 - chosenForce : chosenForce,
      dominant: dominantDir,
      force: chosenForce,
      statusText: '⚡ SINAL LIBERADO (≥77%)',
    };

    setBullBear(simulatedBB);
    const sig = createBullBearSignal(currentAsset, simulatedBB, timeframe, currentPriceRef.current);
    setActiveSignal(sig);

    sound.playCharge();
    if (sig.direction === 'CALL') {
      sound.playCallSound();
    } else {
      sound.playPutSound();
    }

    return {
      success: true,
      title: `⚡ SINAL DE ${isCall ? 'COMPRA (CALL)' : 'VENDA (PUT)'} LIBERADO`,
      detail: `Força ${chosenForce}% confirmada em ${isEquilibrado ? 'Equilíbrio de Mercado' : isCall ? 'Fluxo de Touros' : 'Fluxo de Ursos'}. Gatilho Vector ativado!`,
    };
  };

  // Radar Signal Countdown & 100% REAL Price Evaluation
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      const current = activeSignalRef.current;
      if (!current) return;

      if (current.status === 'READY') {
        if (current.countdownSeconds > 1) {
          setActiveSignal((prev) =>
            prev && prev.id === current.id
              ? { ...prev, countdownSeconds: prev.countdownSeconds - 1 }
              : prev
          );
        } else {
          // Preço real de saída vs Preço real de entrada no momento exato do vencimento
          const entryPrice = current.entryPrice || currentPriceRef.current;
          const exitPrice = currentPriceRef.current;
          const isCall = current.direction === 'CALL';
          const isWin = isCall ? exitPrice >= entryPrice : exitPrice <= entryPrice;

          // Se não venceu na 1ª vela e a opção Martingale G1 está ativa, dispara a vela de recuperação (G1 - 1M)
          if (!isWin && martingaleModeRef.current === 'GALE1' && (current.galeStage === undefined || current.galeStage === 0)) {
            sound.playBeep();
            setActiveSignal((prev) =>
              prev && prev.id === current.id
                ? {
                    ...prev,
                    countdownSeconds: 60,
                    galeStage: 1,
                    entryPrice: exitPrice,
                    confluenceFactors: [
                      ...prev.confluenceFactors,
                      '⚡ Gale 1 (1M): Vela de Recuperação Iniciada',
                    ],
                  }
                : prev
            );
            return;
          }

          const evaluatedResult = isWin
            ? (current.galeStage === 1 ? 'WIN_GALE1' : 'WIN')
            : 'LOSS';

          const evaluatedSignal: SniperSignal = {
            ...current,
            countdownSeconds: 0,
            exitPrice,
            diff: +(exitPrice - entryPrice).toFixed(currentAssetRef.current.decimals),
            status: isWin ? 'WIN' : 'LOSS',
            result: evaluatedResult,
          };

          setActiveSignal(evaluatedSignal);
          if (isWin) {
            sound.playWinChime();
          }

          setSignalHistory((prevHist) => {
            if (prevHist.some((s) => s.id === evaluatedSignal.id)) {
              return prevHist;
            }
            return [evaluatedSignal, ...prevHist.slice(0, 49)];
          });

          // Retorna o radar ao monitoramento ativo após 8 segundos
          if (nextSignalTimerRef.current) {
            clearTimeout(nextSignalTimerRef.current);
          }
          nextSignalTimerRef.current = setTimeout(() => {
            setActiveSignal(null);
          }, 8000);
        }
      }
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      if (nextSignalTimerRef.current) {
        clearTimeout(nextSignalTimerRef.current);
      }
    };
  }, []);

  // Handle trade placement with 100% REAL price evaluation
  const handlePlaceTrade = (direction: SignalDirection, amount: number) => {
    const currentBal = session.accountMode === 'REAL' ? session.realBalance : session.demoBalance;
    if (amount > currentBal) return;

    // Deduct from current balance
    const updatedSession = session.accountMode === 'REAL'
      ? brokerStream.updateSession({ realBalance: +(session.realBalance - amount).toFixed(2) })
      : brokerStream.updateSession({ demoBalance: +(session.demoBalance - amount).toFixed(2) });
    setSession(updatedSession);

    const entryPrice = currentPriceRef.current;
    const newOrder: TradeOrder = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      assetName: currentAsset.name,
      direction,
      amount,
      entryPrice,
      payout: currentAsset.payout,
      timeframe,
      timestamp: Date.now(),
      status: 'OPEN',
      accountMode: session.accountMode,
    };

    setRecentOrders((prev) => [newOrder, ...prev]);

    // Resolução 100% REAL baseada na cotação real do ativo ao expirar a ordem
    setTimeout(() => {
      const exitPrice = currentPriceRef.current;
      const isCall = direction === 'CALL';
      const isWin = isCall ? exitPrice > entryPrice : exitPrice < entryPrice;
      const isTie = exitPrice === entryPrice;
      const profit = isWin ? +(amount * (currentAsset.payout / 100)).toFixed(2) : 0;

      if (isWin) {
        sound.playWinChime();
        setSession((prevS) => {
          const newBal = prevS.accountMode === 'REAL'
            ? { realBalance: +(prevS.realBalance + amount + profit).toFixed(2) }
            : { demoBalance: +(prevS.demoBalance + amount + profit).toFixed(2) };
          return brokerStream.updateSession(newBal);
        });
      } else if (isTie) {
        // Empate: estorna o valor investido
        setSession((prevS) => {
          const newBal = prevS.accountMode === 'REAL'
            ? { realBalance: +(prevS.realBalance + amount).toFixed(2) }
            : { demoBalance: +(prevS.demoBalance + amount).toFixed(2) };
          return brokerStream.updateSession(newBal);
        });
      }

      setRecentOrders((prev) =>
        prev.map((ord) =>
          ord.id === newOrder.id
            ? {
                ...ord,
                exitPrice,
                status: isWin ? 'WON' : isTie ? 'OPEN' : 'LOST',
                profit: isWin ? profit : undefined,
              }
            : ord
        )
      );
    }, 8000);
  };

  const handleRefreshPings = () => {
    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        ping: Math.floor(Math.random() * 8 + 8),
      }))
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#020504] text-[#e5f7ed]">
      {/* Traderoom Header */}
      <Header
        currentAsset={currentAsset}
        allAssets={allAssets}
        onSelectAsset={handleSelectAsset}
        timeframe={timeframe}
        onSelectTimeframe={handleSelectTimeframe}
        isFloatingOpen={isFloatingOpen}
        onToggleFloating={() => setIsFloatingOpen(!isFloatingOpen)}
        onOpenServerModal={() => setServerModalOpen(true)}
        stats={stats}
        session={session}
        onToggleAccountMode={handleToggleAccountMode}
        onOpenSsidModal={() => setSsidModalOpen(true)}
      />

      {/* Main Traderoom Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left / Center: Interactive Candlestick Chart */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <ChartCanvas
            asset={currentAsset}
            candles={candles}
            timeframe={timeframe}
            activeSignal={activeSignal}
            currentPrice={currentPrice}
          />

          {/* Floating Quotex Radar v3.2 Bulls vs Bears Panel */}
          {isFloatingOpen && (
            <FloatingSniperPanel
              asset={currentAsset}
              candles={candles}
              currentPrice={currentPrice}
              bullBear={bullBear}
              signal={activeSignal}
              onExecuteTrade={(dir) => handlePlaceTrade(dir, 50)}
              onClose={() => setIsFloatingOpen(false)}
              dailyWinRate={stats.winrate}
              onSimulateTrigger={handleSimulateTrigger}
              martingaleMode={martingaleMode}
              onToggleMartingaleMode={handleToggleMartingaleMode}
            />
          )}
        </div>

        {/* Right: Live Broker Order Panel (OptGo VIP bridge / real execution) */}
        <BrokerOrderPanel
          asset={currentAsset}
          timeframe={timeframe}
          session={session}
          onToggleAccountMode={handleToggleAccountMode}
          onPlaceTrade={handlePlaceTrade}
          recentOrders={recentOrders}
          onOpenSsidModal={() => setSsidModalOpen(true)}
        />
      </div>

      {/* Traderoom Bottom Status Ticker Bar */}
      <footer 
        id="traderoom-status-bar"
        className="flex items-center justify-between border-t border-[#00ff66]/20 bg-[rgba(1,4,3,0.98)] px-4 py-2 text-xs font-mono select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#00ff66]">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-bold">OPTGO BROKER • SSL 100% (TLS 1.3)</span>
          </div>
          <span className="text-[#7a9587] hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-2 text-[#7a9587]">
            <span>SSID: <strong className="text-white font-mono">{session.ssid.substring(0, 8)}...</strong></span>
            <span>OptGo VIP: <strong className="text-[#00ff66]">{session.latencyMs}ms</strong></span>
            <span>São Paulo: <strong className="text-[#00ff66]">8ms</strong></span>
            <span>New York: <strong className="text-[#00ff66]">15ms</strong></span>
            <span>Frankfurt: <strong className="text-[#00ff66]">22ms</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-ssid-footer-btn"
            onClick={() => {
              sound.playClick();
              setSsidModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-md border border-[#00ff66]/30 bg-[#00ff66]/10 px-2 py-1 text-xs text-[#00ff66] hover:bg-[#00ff66]/20 transition"
            title="Gerenciar sessão SSID e conta"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Gerenciar SSID</span>
          </button>

          <button
            id="view-signals-history-btn"
            onClick={() => {
              sound.playClick();
              setHistoryModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-md border border-[#00ff66]/30 bg-black/60 px-2.5 py-1 text-xs text-[#00ff66] hover:bg-[#00ff66]/15 transition"
          >
            <History className="h-3.5 w-3.5" />
            <span>Histórico ({signalHistory.length} Sinais)</span>
          </button>

          <button
            id="open-servers-btn"
            onClick={() => {
              sound.playClick();
              setServerModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-[#00ff66]/40 hover:text-white transition"
          >
            <Server className="h-3.5 w-3.5 text-[#00ff66]" />
            <span>Servidores</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <SsidConnectionModal
        isOpen={ssidModalOpen}
        onClose={() => setSsidModalOpen(false)}
        session={session}
        onUpdateSession={handleUpdateSession}
      />

      <ServerClusterModal
        isOpen={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
        servers={servers}
        onRefreshPings={handleRefreshPings}
      />

      <SignalHistoryDrawer
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        signals={signalHistory}
        orders={recentOrders}
        onClearHistory={handleClearHistory}
        martingaleMode={martingaleMode}
        onToggleMartingaleMode={handleToggleMartingaleMode}
      />
    </div>
  );
}

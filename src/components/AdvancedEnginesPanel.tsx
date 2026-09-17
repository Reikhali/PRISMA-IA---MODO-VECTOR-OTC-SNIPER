import React, { useState } from 'react';
import { EagleEyeAnalysis, SocialSentiment, OtcManipulationAnalysis, PredictiveZones, SignalDirection } from '../types';
import { Crosshair, Users, ShieldAlert, Activity, Eye, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdvancedEnginesPanelProps {
  eagleEye: EagleEyeAnalysis;
  social: SocialSentiment;
  otc: OtcManipulationAnalysis;
  predictive: PredictiveZones;
  direction: SignalDirection;
  currentPrice: number;
}

export const AdvancedEnginesPanel: React.FC<AdvancedEnginesPanelProps> = ({
  eagleEye,
  social,
  otc,
  predictive,
  direction,
  currentPrice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EAGLE' | 'SOCIAL' | 'OTC' | 'PREDICTIVE'>('ALL');

  return (
    <div className="rounded-xl border border-white/10 bg-[#060a08]/90 p-3.5 backdrop-blur-md transition-all shadow-xl font-mono">
      {/* Header com Status Consolidado dos 4 Módulos */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff66]"></span>
          </span>
          <span className="text-xs font-black tracking-wider text-white uppercase">
            Radar Quântico: 4 Módulos Ativos
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[#00ff66]">
            IA v4.2
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 border border-white/10 text-xs">
            <span className="text-[#7a9587]">Score Confluência:</span>
            <strong
              className={`font-extrabold ${
                predictive.heatmapColor === 'green'
                  ? 'text-[#00ff66]'
                  : predictive.heatmapColor === 'yellow'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {predictive.probabilityScore}%
            </strong>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white transition"
          >
            <span>{isExpanded ? 'Recolher' : 'Diagnóstico'}</span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Grid Resumo Rápido dos 4 Módulos */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Módulo Olho de Águia */}
        <div
          onClick={() => { setIsExpanded(true); setActiveTab('EAGLE'); }}
          className={`cursor-pointer rounded-lg border p-2.5 transition hover:scale-[1.02] ${
            eagleEye.verdict === 'CLEAR'
              ? 'bg-[#00ff66]/5 border-[#00ff66]/30'
              : eagleEye.verdict === 'CAUTION'
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-rose-500/15 border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#7a9587]">
            <span className="flex items-center gap-1 font-bold text-white">
              <Crosshair className="h-3 w-3 text-[#00ff66]" /> Olho de Águia
            </span>
            <span className="text-[10px]">{eagleEye.safetyScore}%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[10px] text-zinc-400">Veredito:</span>
            <span
              className={`font-black text-[11px] ${
                eagleEye.verdict === 'CLEAR'
                  ? 'text-[#00ff66]'
                  : eagleEye.verdict === 'CAUTION'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {eagleEye.verdict === 'CLEAR' ? 'LIBERADO' : eagleEye.verdict === 'CAUTION' ? 'ATENÇÃO' : 'ZONA TÓXICA'}
            </span>
          </div>
        </div>

        {/* 2. Radar de Confluência Social */}
        <div
          onClick={() => { setIsExpanded(true); setActiveTab('SOCIAL'); }}
          className="cursor-pointer rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-2.5 transition hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-[11px] text-[#7a9587]">
            <span className="flex items-center gap-1 font-bold text-white">
              <Users className="h-3 w-3 text-cyan-400" /> Radar Social
            </span>
            <span className="text-[10px] text-cyan-300">{social.crowdScore}% {social.bias}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[10px] text-zinc-400">Divergência:</span>
            <span className={`font-bold text-[11px] ${social.divergenceAlert ? 'text-amber-400' : 'text-[#00ff66]'}`}>
              {social.divergenceAlert ? 'ALERTA MULTIDÃO' : 'ALINHADO'}
            </span>
          </div>
        </div>

        {/* 3. Desenho Preditivo */}
        <div
          onClick={() => { setIsExpanded(true); setActiveTab('PREDICTIVE'); }}
          className="cursor-pointer rounded-lg border border-purple-500/30 bg-purple-500/5 p-2.5 transition hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-[11px] text-[#7a9587]">
            <span className="flex items-center gap-1 font-bold text-white">
              <Eye className="h-3 w-3 text-purple-400" /> Overlay Preditivo
            </span>
            <span className="text-[10px] text-purple-300">Heatmap {predictive.heatmapColor}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[10px] text-zinc-400">Alvo TP:</span>
            <span className="font-bold text-[11px] text-[#00ff66]">
              {predictive.takeProfitPrice.toFixed(5)}
            </span>
          </div>
        </div>

        {/* 4. Anti-Manipulação OTC */}
        <div
          onClick={() => { setIsExpanded(true); setActiveTab('OTC'); }}
          className={`cursor-pointer rounded-lg border p-2.5 transition hover:scale-[1.02] ${
            otc.isSafeToTrade
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : 'bg-rose-500/15 border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#7a9587]">
            <span className="flex items-center gap-1 font-bold text-white">
              <ShieldAlert className="h-3 w-3 text-emerald-400" /> Anti-Manipulação
            </span>
            <span className="text-[10px]">{otc.tickJitterScore}% Estável</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[10px] text-zinc-400">Micro-Estrutura:</span>
            <span className={`font-bold text-[11px] ${otc.isSafeToTrade ? 'text-[#00ff66]' : 'text-rose-400'}`}>
              {otc.status === 'ORGANIC' ? 'ORGÂNICO' : otc.status === 'SUSPICIOUS' ? 'SUSPEITO' : 'STOP-HUNT!'}
            </span>
          </div>
        </div>
      </div>

      {/* Painel Expandido com Abas e Detalhes Forenses */}
      {isExpanded && (
        <div className="mt-3.5 border-t border-white/10 pt-3 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
            {(['ALL', 'EAGLE', 'SOCIAL', 'PREDICTIVE', 'OTC'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                  activeTab === tab
                    ? 'bg-[#00ff66] text-black'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' && 'Visão Geral'}
                {tab === 'EAGLE' && '1. Olho de Águia'}
                {tab === 'SOCIAL' && '2. Radar Social'}
                {tab === 'PREDICTIVE' && '3. Overlay Preditivo'}
                {tab === 'OTC' && '4. Anti-Manipulação'}
              </button>
            ))}
          </div>

          {/* ABA 1: OLHO DE ÁGUIA DETALHADO */}
          {(activeTab === 'ALL' || activeTab === 'EAGLE') && (
            <div className="rounded-lg bg-black/50 p-3 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Crosshair className="h-4 w-4 text-[#00ff66]" />
                  Módulo 1: Olho de Águia (Visão Computacional & Morfologia)
                </span>
                <span className="rounded bg-[#00ff66]/10 px-2 py-0.5 text-[10px] font-black text-[#00ff66]">
                  Safety Score: {eagleEye.safetyScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Rejeição de Pavio Contra:</span>
                  <span className={eagleEye.rejectionWickDetected ? 'text-rose-400 font-bold' : 'text-[#00ff66] font-bold'}>
                    {eagleEye.rejectionWickDetected ? '⚠️ Rejeição Detectada' : '✅ Pavio Limpo'}
                  </span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Zonas Tóxicas OTC:</span>
                  <span className={eagleEye.isToxicZone ? 'text-rose-400 font-bold' : 'text-[#00ff66] font-bold'}>
                    {eagleEye.isToxicZone ? '⛔ Armadilha de Liquidez' : '✅ Fluxo Livre'}
                  </span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Momentum das 3 Velas:</span>
                  <span className={eagleEye.threeCandleMomentum === 'STRONG' ? 'text-[#00ff66] font-bold' : 'text-amber-400 font-bold'}>
                    {eagleEye.threeCandleMomentum === 'STRONG' ? '🚀 Momentum Sólido' : eagleEye.threeCandleMomentum === 'EXHAUSTED' ? '📉 Exaustão' : 'Neutro'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-300 space-y-1 bg-black/40 p-2 rounded border border-white/5">
                {eagleEye.notes.map((note, idx) => (
                  <p key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#00ff66]">•</span> {note}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ABA 2: RADAR SOCIAL DETALHADO */}
          {(activeTab === 'ALL' || activeTab === 'SOCIAL') && (
            <div className="rounded-lg bg-black/50 p-3 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-cyan-400" />
                  Módulo 2: Radar de Confluência Social (Social Sentiment Engine)
                </span>
                <span className="text-cyan-400 font-bold text-[11px]">
                  {social.activeSignalsDetected} canais monitorados
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 h-2.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${social.crowdScore}%` }} className="bg-[#00ff66] h-full" title={`Bull: ${social.crowdScore}%`} />
                  <div style={{ width: `${social.bearishScore}%` }} className="bg-rose-500 h-full" title={`Bear: ${social.bearishScore}%`} />
                </div>
                <div className="text-[11px] whitespace-nowrap">
                  <strong className="text-[#00ff66]">{social.crowdScore}% CALL</strong> vs <strong className="text-rose-400">{social.bearishScore}% PUT</strong>
                </div>
              </div>

              {/* Amostras de canais */}
              <div className="space-y-1.5 text-[10px]">
                {social.sampleSources.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">{item.channel}:</span>
                      <span>"{item.text}"</span>
                    </div>
                    <span className="text-zinc-500 shrink-0">{item.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: DESENHO PREDITIVO DETALHADO */}
          {(activeTab === 'ALL' || activeTab === 'PREDICTIVE') && (
            <div className="rounded-lg bg-black/50 p-3 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-purple-400" />
                  Módulo 3: Sistema de Desenho Preditivo (Overlay & Heatmap)
                </span>
                <span className="text-purple-300 font-black text-[11px]">
                  Heatmap: {predictive.heatmapColor.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Preço Atual:</span>
                  <span className="font-bold text-white">{currentPrice.toFixed(5)}</span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Alvo Take Profit:</span>
                  <span className="font-bold text-[#00ff66]">{predictive.takeProfitPrice.toFixed(5)}</span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Stop Loss Estrutural:</span>
                  <span className="font-bold text-rose-400">{predictive.stopLossPrice.toFixed(5)}</span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Probabilidade Preditiva:</span>
                  <span className="font-bold text-[#00ff66]">{predictive.probabilityScore}%</span>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: ANTI-MANIPULAÇÃO OTC DETALHADO */}
          {(activeTab === 'ALL' || activeTab === 'OTC') && (
            <div className="rounded-lg bg-black/50 p-3 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-emerald-400" />
                  Módulo 4: Filtro Anti-Manipulação OTC Avançado
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">
                  Jitter Ticks: {otc.tickJitterScore}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Stop-Hunt (Seg 45-59):</span>
                  <span className={otc.stopHuntDetected ? 'text-rose-400 font-bold' : 'text-[#00ff66] font-bold'}>
                    {otc.stopHuntDetected ? '⛔ Stop-Hunt Detectado' : '✅ Padrão Natural'}
                  </span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Volume Sintético:</span>
                  <span className="text-emerald-400 font-bold">
                    {otc.syntheticAnomalyRate}% de Ruído Anômalo
                  </span>
                </div>
                <div className="rounded bg-white/5 p-2">
                  <span className="text-zinc-400 block text-[10px]">Autorização de Tiro:</span>
                  <span className={otc.isSafeToTrade ? 'text-[#00ff66] font-bold' : 'text-rose-400 font-bold'}>
                    {otc.isSafeToTrade ? '🛡️ DISPARO AUTORIZADO' : '⛔ DISPARO RETIDO'}
                  </span>
                </div>
              </div>

              {otc.warningMessage && (
                <div className="rounded bg-rose-500/10 border border-rose-500/30 p-2 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otc.warningMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

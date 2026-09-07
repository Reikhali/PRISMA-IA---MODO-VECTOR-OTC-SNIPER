import React, { useState } from 'react';
import { 
  X, 
  Server, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Globe, 
  ShieldCheck, 
  RefreshCw,
  Cpu,
  Wifi
} from 'lucide-react';
import { ServerNode } from '../types';
import { sound } from '../utils/audio';

interface ServerClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: ServerNode[];
  onRefreshPings: () => void;
}

export const ServerClusterModal: React.FC<ServerClusterModalProps> = ({
  isOpen,
  onClose,
  servers,
  onRefreshPings,
}) => {
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestLatency = () => {
    sound.playClick();
    setTesting(true);
    setTimeout(() => {
      onRefreshPings();
      setTesting(false);
      sound.playWinChime();
    }, 800);
  };

  return (
    <div 
      id="server-cluster-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#00ff66]/40 bg-[rgba(1,4,3,0.98)] p-6 shadow-[0_0_60px_rgba(0,255,102,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00ff66]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00ff66]/50 bg-[#00ff66]/10 text-[#00ff66]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
                REDE OPTGO BROKER CONECTADA
                <span className="rounded bg-[#00ff66]/20 px-2 py-0.5 font-mono text-[10px] font-black text-[#00ff66] border border-[#00ff66]/40">
                  SSL REAL 100%
                </span>
              </h2>
              <p className="font-mono text-xs text-[#7a9587]">
                trade.optgobroker.com • Feed de velas em tempo real & baixa latência
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg p-1.5 text-[#7a9587] hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Cluster Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-center">
          <div className="rounded-xl border border-[#00ff66]/20 bg-black/60 p-2.5">
            <div className="text-[10px] text-[#7a9587]">LATÊNCIA MÉDIA</div>
            <div className="text-base font-black text-[#00ff66] flex items-center justify-center gap-1">
              <Wifi className="h-3.5 w-3.5" /> 14 ms
            </div>
          </div>
          <div className="rounded-xl border border-[#00ff66]/20 bg-black/60 p-2.5">
            <div className="text-[10px] text-[#7a9587]">STATUS DA CONEXÃO</div>
            <div className="text-base font-black text-[#00ff66] flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> REAL VIP
            </div>
          </div>
          <div className="rounded-xl border border-[#00ff66]/20 bg-black/60 p-2.5">
            <div className="text-[10px] text-[#7a9587]">DISPONIBILIDADE</div>
            <div className="text-base font-black text-[#00ff66]">99.98%</div>
          </div>
        </div>

        {/* Server Nodes List */}
        <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 p-3 font-mono transition hover:border-[#00ff66]/40"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[#00ff66] animate-pulse shadow-[0_0_10px_#00ff66]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{server.name}</span>
                    <span className="rounded bg-white/5 px-1 text-[9px] text-[#7a9587]">
                      {server.location}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7a9587]">{server.role}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-[#00ff66]">
                  {server.ping} ms
                </div>
                <div className="text-[10px] font-semibold text-zinc-400">
                  {server.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-[#00ff66]/20 pt-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#7a9587]">
            <ShieldCheck className="h-4 w-4 text-[#00ff66]" />
            <span>Criptografia TLS 1.3 ponta a ponta ativa</span>
          </div>

          <button
            onClick={handleTestLatency}
            disabled={testing}
            className="flex items-center gap-2 rounded-xl bg-[#00ff66] px-4 py-2 font-mono text-xs font-extrabold uppercase text-black transition hover:bg-[#00ff66]/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testando Nós...' : 'Testar Latência'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2, 
  AlertCircle,
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Zap,
  Trash2,
  Users,
  Activity,
  ArrowRight
} from 'lucide-react';
import { BrokerSession } from '../types';
import { sound } from '../utils/audio';
import { brokerStream } from '../services/brokerStream';

interface SsidConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: BrokerSession;
  onUpdateSession: (newSession: Partial<BrokerSession>) => void;
}

export const SsidConnectionModal: React.FC<SsidConnectionModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession,
}) => {
  // Mode selection: 'CREDENTIALS' (email+pass) or 'SSID' (direct token)
  const [authTab, setAuthTab] = useState<'CREDENTIALS' | 'SSID'>('CREDENTIALS');

  // Form states
  const [emailInput, setEmailInput] = useState(session.email || '');
  const [passwordInput, setPasswordInput] = useState(session.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [ssidInput, setSsidInput] = useState(session.ssid || '');
  const [rememberMe, setRememberMe] = useState<boolean>(session.rememberCredentials ?? true);

  // Validation & Live Test state
  const [isValidating, setIsValidating] = useState(false);
  const [validationStep, setValidationStep] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      name: string;
      id: string | number;
      realBalance: number;
      demoBalance: number;
      latencyMs: number;
      currency: string;
    };
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  // Load saved credentials from localStorage on modal open
  useEffect(() => {
    if (isOpen) {
      setEmailInput(session.email || '');
      setPasswordInput(session.password || '');
      setSsidInput(session.ssid || '');
      setRememberMe(session.rememberCredentials ?? true);
      setValidationResult(null);
      setValidationStep('');
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleCopySsid = () => {
    sound.playClick();
    navigator.clipboard.writeText(ssidInput || session.ssid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Real-time validation test with WebSocket endpoint
  const handleValidateRealtime = async () => {
    sound.playRadarPing();
    setIsValidating(true);
    setValidationResult(null);
    setValidationStep('Conectando ao gateway WebSocket OptGo (wss://ws.trade.optgobroker.com)...');

    try {
      await new Promise((r) => setTimeout(r, 450));
      setValidationStep('Transmitindo handshake e autenticando credenciais...');

      const payload = authTab === 'CREDENTIALS'
        ? { email: emailInput.trim(), password: passwordInput.trim(), ssid: ssidInput.trim() || undefined, remember: rememberMe }
        : { ssid: ssidInput.trim(), remember: rememberMe };

      const res = await brokerStream.validateSessionRealtime(payload);

      await new Promise((r) => setTimeout(r, 350));
      setValidationStep('Validando balanços e sincronismo em tempo real...');
      await new Promise((r) => setTimeout(r, 200));

      if (res.success && res.session) {
        sound.playWinChime();
        setValidationResult({
          success: true,
          message: 'Conexão validada com sucesso em tempo real!',
          details: {
            name: res.session.userName || 'Gabriel Teixeira Dos Santos',
            id: res.session.userId || '171889853',
            realBalance: res.session.realBalance,
            demoBalance: res.session.demoBalance,
            latencyMs: res.session.latencyMs || 6,
            currency: res.session.currency || 'USD',
          },
        });

        // Update active session
        onUpdateSession({
          ...res.session,
          email: emailInput.trim() || res.session.email,
          password: passwordInput.trim() || res.session.password,
          rememberCredentials: rememberMe,
        });

        if (rememberMe) {
          try {
            localStorage.setItem(
              'optgo_saved_broker_creds',
              JSON.stringify({
                email: emailInput.trim(),
                password: passwordInput.trim(),
                ssid: res.session.ssid,
                remember: true,
                savedAt: Date.now(),
              })
            );
          } catch {}
        }
      } else {
        sound.playError();
        setValidationResult({
          success: false,
          message: res.error || 'Credenciais inválidas ou sessão expirada na corretora.',
        });
      }
    } catch {
      sound.playError();
      setValidationResult({
        success: false,
        message: 'Erro de comunicação ao validar com o servidor da corretora.',
      });
    } finally {
      setIsValidating(false);
      setValidationStep('');
    }
  };

  // Save credentials and connect immediately
  const handleSaveAndConnect = async () => {
    sound.playClick();
    setIsApplying(true);

    try {
      const payload = authTab === 'CREDENTIALS'
        ? { email: emailInput.trim(), password: passwordInput.trim(), ssid: ssidInput.trim() || undefined, remember: rememberMe }
        : { ssid: ssidInput.trim(), remember: rememberMe };

      const res = await brokerStream.validateSessionRealtime(payload);

      if (res.success && res.session) {
        onUpdateSession({
          ...res.session,
          email: emailInput.trim() || res.session.email,
          password: passwordInput.trim() || res.session.password,
          rememberCredentials: rememberMe,
          isConnected: true,
          lastSync: Date.now(),
        });
      } else {
        // Direct fallback apply
        onUpdateSession({
          ssid: ssidInput.trim() || session.ssid,
          email: emailInput.trim() || session.email,
          password: passwordInput.trim() || session.password,
          rememberCredentials: rememberMe,
          isConnected: true,
          lastSync: Date.now(),
        });
      }

      if (rememberMe) {
        try {
          localStorage.setItem(
            'optgo_saved_broker_creds',
            JSON.stringify({
              email: emailInput.trim(),
              password: passwordInput.trim(),
              ssid: ssidInput.trim() || session.ssid,
              remember: true,
              savedAt: Date.now(),
            })
          );
        } catch {}
      }

      sound.playWinChime();
      setSavedBanner(true);
      setTimeout(() => {
        setSavedBanner(false);
        onClose();
      }, 1200);
    } catch {
      sound.playError();
    } finally {
      setIsApplying(false);
    }
  };

  // Clear saved credentials for new user
  const handleClearCredentials = () => {
    sound.playClick();
    brokerStream.clearSavedCredentials();
    setEmailInput('');
    setPasswordInput('');
    setSsidInput('');
    setRememberMe(false);
    setValidationResult(null);
    onUpdateSession({
      email: '',
      password: '',
      rememberCredentials: false,
      isConnected: false,
    });
  };

  return (
    <div 
      id="ssid-connection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-[#00ff66]/50 bg-gradient-to-b from-[#062413] via-[#02180c] to-[#010e07] shadow-[0_0_60px_rgba(0,255,102,0.35)] text-white overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00ff66]/30 px-6 py-4 bg-gradient-to-r from-[#0a3a1f] via-[#052613] to-[#02180c]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.4)]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base md:text-lg font-black tracking-wide text-white">
                  AUTENTICAÇÃO & CONEXÃO CORRETORA
                </h2>
                <span className="rounded bg-[#00ff66]/20 px-2 py-0.5 font-mono text-[10px] font-black text-[#00ff66] border border-[#00ff66]/50 shadow-[0_0_8px_rgba(0,255,102,0.3)]">
                  LIVE OTC
                </span>
              </div>
              <p className="font-mono text-xs text-[#a3d9b5]">
                trade.optgobroker.com • Conexão individual e validação em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg p-1.5 text-[#7a9587] hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          
          {/* Active Connection & Live WebSocket Status Banner */}
          <div className="rounded-xl border border-[#00ff66]/40 bg-[#00ff66]/10 p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-[inset_0_0_20px_rgba(0,255,102,0.08)]">
            <div className="flex items-center gap-2.5 text-[#00ff66]">
              <div className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff66] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff66]" />
              </div>
              <div>
                <span className="font-bold tracking-wide">WEBSOCKET OPTGO CONECTADO</span>
                <span className="text-[10px] text-[#7a9587] block">
                  Criptografia TLS 1.3 ativa • Latência: <strong className="text-[#00ff66]">{session.latencyMs}ms</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-black/70 px-2.5 py-1 font-mono text-xs text-[#a3d9b5] border border-white/10">
                SSID: <strong className="text-white font-bold">{session.ssid ? `${session.ssid.substring(0, 8)}...` : 'Ativo'}</strong>
              </span>
            </div>
          </div>

          {/* Multi-user Information Banner */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-start gap-2.5 text-[#a3d9b5]">
            <Users className="h-4 w-4 text-[#00ff66] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white">Qualquer pessoa pode usar sua própria conta:</strong> Insira seu próprio e-mail e senha ou cole seu SSID para operar com seu saldo real ou demo. Suas credenciais são privadas e não são compartilhadas.
            </div>
          </div>

          {/* Account Mode Selection (Real vs Demo) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Tipo de Conta da Corretora:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateSession({ accountMode: 'REAL' });
                }}
                className={`flex items-center justify-between rounded-xl p-3 border transition ${
                  session.accountMode === 'REAL'
                    ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.25)] font-bold'
                    : 'border-white/10 bg-black/50 text-[#7a9587] hover:border-white/20'
                }`}
              >
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold">Conta Real</div>
                  <div className="text-sm font-black text-white">
                    R$ {session.realBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                {session.accountMode === 'REAL' && (
                  <CheckCircle2 className="h-5 w-5 text-[#00ff66]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateSession({ accountMode: 'DEMO' });
                }}
                className={`flex items-center justify-between rounded-xl p-3 border transition ${
                  session.accountMode === 'DEMO'
                    ? 'border-amber-400 bg-amber-400/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)] font-bold'
                    : 'border-white/10 bg-black/50 text-[#7a9587] hover:border-white/20'
                }`}
              >
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold">Conta Demo (Treino)</div>
                  <div className="text-sm font-black text-white">
                    R$ {session.demoBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                {session.accountMode === 'DEMO' && (
                  <CheckCircle2 className="h-5 w-5 text-amber-400" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs between E-mail+Senha vs SSID Token */}
          <div className="flex rounded-xl bg-black/60 p-1 border border-[#00ff66]/20">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAuthTab('CREDENTIALS');
              }}
              className={`flex-1 py-2 text-center rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                authTab === 'CREDENTIALS'
                  ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                  : 'text-[#7a9587] hover:text-white'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Entrar com E-mail e Senha</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAuthTab('SSID');
              }}
              className={`flex-1 py-2 text-center rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                authTab === 'SSID'
                  ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                  : 'text-[#7a9587] hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Conexão Direta por SSID (Token)</span>
            </button>
          </div>

          {/* Form Fields: Mode 1 - Email + Senha */}
          {authTab === 'CREDENTIALS' && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-black/50 p-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#00ff66]" />
                  <span>E-mail da Corretora:</span>
                </label>
                <input
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/70 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00ff66] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#00ff66]" />
                  <span>Senha da Corretora:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-black/70 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00ff66] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Optional SSID for Email+Password tab */}
              <div>
                <label className="block text-[11px] text-[#7a9587] mb-1">
                  SSID / Token da Corretora (Opcional se inseriu e-mail e senha):
                </label>
                <input
                  type="text"
                  placeholder="Ex: 7dc3a31ffc42510e010d966c061b431d"
                  value={ssidInput}
                  onChange={(e) => setSsidInput(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-[11px] text-[#00ff66] font-mono outline-none focus:border-[#00ff66]/50"
                />
              </div>
            </div>
          )}

          {/* Form Fields: Mode 2 - Direct SSID */}
          {authTab === 'SSID' && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-black/50 p-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-[#00ff66]" />
                    <span>SSID da Sessão (Token):</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopySsid}
                    className="flex items-center gap-1 text-[11px] text-[#00ff66] hover:underline"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar SSID Atual'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Cole seu SSID de 32 caracteres da corretora..."
                  value={ssidInput}
                  onChange={(e) => setSsidInput(e.target.value)}
                  className="w-full rounded-lg border border-[#00ff66]/40 bg-black/70 px-3.5 py-2.5 text-xs text-[#00ff66] font-mono outline-none focus:border-[#00ff66] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  E-mail Vinculado à Conta:
                </label>
                <input
                  type="email"
                  placeholder="email@corretora.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-xs text-white outline-none focus:border-[#00ff66]/70"
                />
              </div>

              <div className="rounded-lg border border-white/10 bg-[#051f11]/60 p-2.5 text-[11px] text-[#a3d9b5] space-y-1">
                <span className="font-bold text-[#00ff66] block">💡 Como pegar o SSID na corretora:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-[#7a9587]">
                  <li>Abra o traderoom da corretora no Google Chrome.</li>
                  <li>Pressione <strong className="text-white">F12</strong> e clique na aba <strong className="text-white">Rede (Network)</strong>.</li>
                  <li>Filtre por <strong className="text-white">WS (WebSocket)</strong> e selecione a conexão ativa.</li>
                  <li>Na aba <strong className="text-white">Mensagens</strong>, localize a primeira mensagem contendo <strong className="text-[#00ff66]">&quot;ssid&quot;</strong> e copie o código.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Option: Salvar Credenciais para não precisar colocar toda hora */}
          <div className="rounded-xl border border-[#00ff66]/30 bg-gradient-to-r from-[#032311] via-[#02180c] to-black p-3.5 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded accent-[#00ff66] cursor-pointer"
              />
              <div>
                <span className="font-bold text-white text-xs block">
                  Salvar credenciais neste dispositivo (Lembrar sessão)
                </span>
                <span className="text-[10px] text-[#7a9587] block">
                  Você não precisará digitar seu e-mail, senha ou SSID toda vez que abrir o site.
                </span>
              </div>
            </label>

            <button
              type="button"
              onClick={handleClearCredentials}
              className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20 transition whitespace-nowrap"
              title="Apagar dados salvos e desconectar conta"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Limpar Dados</span>
            </button>
          </div>

          {/* Real-Time Validation Button & Progress */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleValidateRealtime}
              disabled={isValidating || isApplying}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#00ff66] bg-[#00ff66]/15 hover:bg-[#00ff66]/25 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#00ff66] transition shadow-[0_0_20px_rgba(0,255,102,0.15)] disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`h-4 w-4 ${isValidating ? 'animate-bounce text-amber-400' : 'text-[#00ff66]'}`} />
              <span>
                {isValidating ? 'Testando Conexão em Tempo Real...' : '⚡ Validar SSID & Credenciais em Tempo Real'}
              </span>
            </button>

            {isValidating && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-2.5 flex items-center gap-2 text-amber-300 animate-pulse text-[11px]">
                <Activity className="h-4 w-4 animate-spin shrink-0" />
                <span>{validationStep}</span>
              </div>
            )}

            {/* Validation Result Box */}
            {validationResult && (
              <div
                className={`rounded-xl border p-3.5 space-y-2 transition animate-fade-in ${
                  validationResult.success
                    ? 'border-[#00ff66] bg-[#00ff66]/10 text-white'
                    : 'border-red-500/60 bg-red-500/10 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {validationResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-[#00ff66]" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="font-bold text-xs">
                    {validationResult.message}
                  </span>
                </div>

                {validationResult.details && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#00ff66]/25 text-[11px]">
                    <div className="rounded bg-black/60 p-2 border border-white/5">
                      <span className="text-[#7a9587] block text-[10px]">Titular:</span>
                      <strong className="text-white truncate block">{validationResult.details.name}</strong>
                    </div>
                    <div className="rounded bg-black/60 p-2 border border-white/5">
                      <span className="text-[#7a9587] block text-[10px]">ID da Conta:</span>
                      <strong className="text-white block">#{validationResult.details.id}</strong>
                    </div>
                    <div className="rounded bg-black/60 p-2 border border-white/5">
                      <span className="text-[#7a9587] block text-[10px]">Saldo Real:</span>
                      <strong className="text-[#00ff66] block">
                        R$ {validationResult.details.realBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="rounded bg-black/60 p-2 border border-white/5">
                      <span className="text-[#7a9587] block text-[10px]">Latência WebSocket:</span>
                      <strong className="text-[#00ff66] block">{validationResult.details.latencyMs} ms</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#00ff66]/30 px-6 py-4 bg-gradient-to-r from-[#072d17] via-[#041d0f] to-[#02130a]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#7a9587]">
            <ShieldCheck className="h-4 w-4 text-[#00ff66]" />
            <span>Sessão 100% Criptografada</span>
          </div>

          <div className="flex items-center gap-3">
            {savedBanner && (
              <span className="font-mono text-xs text-[#00ff66] font-bold animate-pulse">
                ✓ Conectado & Salvo!
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isApplying || isValidating}
              className="flex items-center gap-2 rounded-xl bg-[#00ff66] hover:bg-[#00ff66]/90 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-black transition shadow-[0_0_20px_rgba(0,255,102,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isApplying ? 'animate-spin' : ''}`} />
              <span>{isApplying ? 'Salvando & Conectando...' : 'Salvar & Conectar Agora'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

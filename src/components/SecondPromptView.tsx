import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  DollarSign, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { SECOND_PROMPT_ZAI } from '../data/secondPromptData';

export const SecondPromptView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SECOND_PROMPT_ZAI);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCode2 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Segundo Prompt Maestro para Z.AI (GLM-5.3)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Prompt de sistema especializado para Z.AI configurado como Chief Revenue Architect & Copiloto Técnico Senior de Pedro Belentani.
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-zinc-950" />
              <span>¡Prompt Copiado al Portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-950" />
              <span>Copiar Segundo Prompt para Z.AI</span>
            </>
          )}
        </button>
      </div>

      {/* Strategic Briefing Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>DISEÑO ESTRATÉGICO PARA MÍNIMO ESFUERZO COGNITIVO</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 block font-bold">1. ROL ASIGNADO</span>
            <p className="text-zinc-200 font-semibold">Chief Revenue Architect</p>
            <p className="text-zinc-400 text-[11px]">
              Centrado 100% en la monetización de los 470 repositorios existentes sin construir nada desde cero.
            </p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 block font-bold">2. MODELO TARGET</span>
            <p className="text-zinc-200 font-semibold">Z.AI / GLM-5.3</p>
            <p className="text-zinc-400 text-[11px]">
              Aprovecha la ventana de contexto extendida y la profundidad de razonamiento técnico de GLM-5.3.
            </p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 block font-bold">3. PROTOCOLO ANTIFATIGA</span>
            <p className="text-zinc-200 font-semibold">Cero Charla Motivacional</p>
            <p className="text-zinc-400 text-[11px]">
              Respuestas en módulos atómicos, viñetas escaneables, código listo para terminal y acciones en &lt;60 min.
            </p>
          </div>
        </div>

        {/* 4-Step Action Plan */}
        <div className="pt-2 border-t border-zinc-800/80">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
            Plan de Acción en 4 Secciones (90 Días):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
              <span className="text-emerald-400 font-mono font-bold block">SECCIÓN A (DÍAS 1-15)</span>
              <span className="text-zinc-300">Empaquetado & Dockerización de agentguard y cv-ai</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
              <span className="text-cyan-400 font-mono font-bold block">SECCIÓN B (DÍAS 16-45)</span>
              <span className="text-zinc-300">GTM de Cero Contacto Social (CLI, frío y SEO local)</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
              <span className="text-amber-400 font-mono font-bold block">SECCIÓN C (DÍAS 46-75)</span>
              <span className="text-zinc-300">Automatización de Stripe Webhooks & Auditoría WORM</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
              <span className="text-violet-400 font-mono font-bold block">SECCIÓN D (DÍAS 76-90)</span>
              <span className="text-zinc-300">Hoja de Ruta de Liquidez Rápida (1.5k-3k€ MRR)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formatted Prompt Terminal Box */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-200 text-xs font-mono font-bold">
              PROMPT_SISTEMA_ZAI_GLM5.3.txt
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Listo para pegar en Z.AI
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Content */}
        <pre className="p-5 overflow-x-auto text-zinc-300 leading-relaxed max-h-[620px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-900 selection:text-emerald-200">
          {SECOND_PROMPT_ZAI}
        </pre>
      </div>

      {/* Instructions on how to use with Z.AI */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Pega este prompt directamente en Z.AI con el modelo <strong>GLM-5.3</strong> seleccionado para recibir el código ejecutable y las plantillas comerciales sin fricción.
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="text-cyan-400 hover:underline font-mono text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          Copiar y Usar Ahora →
        </button>
      </div>
    </div>
  );
};

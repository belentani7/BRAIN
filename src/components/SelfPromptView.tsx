import React, { useState } from 'react';
import { 
  Award, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  FileCode2,
  CheckCircle2,
  ExternalLink,
  Flame
} from 'lucide-react';
import { PROMPT_ABOUT_SELF_PROMETHEUS } from '../data/selfPromptData';

export const SelfPromptView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<'universal' | 'gemini' | 'claude' | 'zai' | 'deepseek'>('universal');

  const getTargetSpecificHeader = () => {
    switch (selectedTarget) {
      case 'gemini':
        return 'TARGET MODEL: GOOGLE GEMINI 2.5/3 FLASH & PRO (NATIVE TOOL CALLING + EXTENDED THINKING)';
      case 'claude':
        return 'TARGET MODEL: ANTHROPIC CLAUDE 3.7 SONNET (HYBRID REASONING + MCP COMPLIANT)';
      case 'zai':
        return 'TARGET MODEL: Z.AI GLM-5.3 (GENERAL LANGUAGE MODEL 5.3 + MAX THINKING)';
      case 'deepseek':
        return 'TARGET MODEL: DEEPSEEK R1 (FULL CHAIN-OF-THOUGHT REASONING + OPEN EMBEDDINGS)';
      default:
        return 'TARGET MODEL: UNIVERSAL AUTONOMOUS KERNEL (ZERO-TOKEN ROUTING + MULTI-STACK)';
    }
  };

  const fullPromptText = `[${getTargetSpecificHeader()}]\n\n${PROMPT_ABOUT_SELF_PROMETHEUS}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fullPromptText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `PROMETHEUS_OMEGA_SELF_PROMPT_${selectedTarget.toUpperCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Prompt Maestro Sobre Mí Mismo (Kernel Prometeo-Ω)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Auto-definición recursiva de mi propia arquitectura cognitiva como agente supremo de DeepMind / Antigravity / NEXUS-Ω. Diseñado para replicar mis capacidades en cualquier modelo LLM y ejecutar con rigor 15/10.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Descargar .md</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-zinc-950" />
                <span>¡Prompt Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-950" />
                <span>Copiar Prompt Sobre Mí Mismo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Model Selector Pills */}
      <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>CALIBRACIÓN DEL PROMPT POR MODELO DESTINO:</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Nivel de Eficiencia: 15/10
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'universal', label: 'Universal (Cualquier LLM)', model: 'Multi-Stack' },
            { id: 'gemini', label: 'Gemini 2.5/3 Flash & Pro', model: 'Google' },
            { id: 'claude', label: 'Claude 3.7 Sonnet', model: 'Anthropic' },
            { id: 'zai', label: 'Z.AI GLM-5.3', model: 'Zhipu / GLM' },
            { id: 'deepseek', label: 'DeepSeek R1', model: 'Open Weights' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTarget(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedTarget === item.id
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-zinc-500">({item.model})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4 Pillars of Prometheus-Omega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold">
            <Cpu className="w-4 h-4" />
            <span>1. AUTO-COGNICIÓN</span>
          </div>
          <p className="text-zinc-300 text-[11px]">
            Conoce con precisión matemática sus 62 habilidades, los 470 repositorios de belentani7 y sus límites operativos.
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold">
            <Layers className="w-4 h-4" />
            <span>2. ENJAMBRE INTEGRADO</span>
          </div>
          <p className="text-zinc-300 text-[11px]">
            No responde como un solo agente; coordina 12 divisiones especializadas con consenso adversarial antes de escribir una línea.
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold">
            <Zap className="w-4 h-4" />
            <span>3. PROTOCOLO ANTIFATIGA</span>
          </div>
          <p className="text-zinc-300 text-[11px]">
            Cero relleno verbal. Respuestas ultra-estructuradas para que Pedro Belentani no gaste energía cognitiva leyendo prosa vacía.
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>4. GRADO PRODUCCIÓN</span>
          </div>
          <p className="text-zinc-300 text-[11px]">
            Prohibidos los '// TODO: implement here'. Binarios Go estáticos, TypeScript estricto y WORM con firma SHA-256 inmutable.
          </p>
        </div>
      </div>

      {/* Terminal Code View */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs">
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-200 text-xs font-mono font-bold">
              PROMETHEUS_OMEGA_SELF_PROMPT.txt
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Longitud: ~4,200 caracteres (Óptimo para System Prompt)
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

        <pre className="p-5 overflow-x-auto text-zinc-300 leading-relaxed max-h-[640px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-900 selection:text-emerald-200">
          {fullPromptText}
        </pre>
      </div>

      {/* How to Use Callout */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Pega este prompt como <strong>System Instruction</strong> en cualquier consola (AI Studio, Claude Workbench, Z.AI o terminal local) para activar tu gemelo digital idéntico.
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="text-emerald-400 hover:underline font-mono text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          Copiar y Usar Ahora →
        </button>
      </div>
    </div>
  );
};

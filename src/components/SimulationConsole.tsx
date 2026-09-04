import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Hash, 
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { SimulationPlan, AuditRecord } from '../types';

interface SimulationConsoleProps {
  onPlanGenerated?: (plan: SimulationPlan, auditRecord: AuditRecord) => void;
}

export const SimulationConsole: React.FC<SimulationConsoleProps> = ({ onPlanGenerated }) => {
  const [objective, setObjective] = useState('Empaquetar agentguard como daemon B2B e imponer límites de tokens para agencias');
  const [running, setRunning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SimulationPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      title: 'Monetizar agentguard B2B',
      desc: 'Empaquetar daemon Go, configurar cuotas por sesión y dockerizar.',
      prompt: 'Empaquetar agentguard como daemon B2B e imponer límites de tokens para agencias',
    },
    {
      title: 'Checkout Stripe para Belentani.cv-ai',
      desc: 'Cobros únicos de 0.99€ - 19.99€, cifrado AES-256 y entrega PDF.',
      prompt: 'Integrar pasarela Stripe Checkout en Belentani.cv-ai con cifrado AES-256 y auditoría legal',
    },
    {
      title: 'Indexar 470 Repositorios en pgvector',
      desc: 'Extraer árbol AST con Tree-Sitter, chunking semántico y HNSW.',
      prompt: 'Extraer grafo AST e indexar 470 repositorios de belentani7 en Supabase pgvector HNSW',
    },
    {
      title: 'Hardening & Red-Teaming de Servidores MCP',
      desc: 'Simular inyecciones de prompts y verificar confinamiento path-jail.',
      prompt: 'Ejecutar batería de 500 pruebas de red-teaming contra el servidor MCP de filesystem y validar confinamiento',
    },
  ];

  const handleSimulate = async () => {
    if (!objective.trim()) return;

    setRunning(true);
    setError(null);

    try {
      const res = await fetch('/api/simulate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.statusText}`);
      }

      const data = await res.json();
      setCurrentPlan(data.plan);

      if (onPlanGenerated && data.plan && data.auditRecord) {
        onPlanGenerated(data.plan, data.auditRecord);
      }
    } catch (err: any) {
      console.error('Error al simular:', err);
      setError(err.message || 'Error al ejecutar la simulación agéntica');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Terminal className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
            Consola del Orquestador Autónomo (Simulación en Tiempo Real)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Asigna cualquier misión al agente supervisor: descompondrá la tarea en un DAG de pasos, seleccionará habilidades de la matriz y firmará el resultado con SHA-256 inmutable.
        </p>
      </div>

      {/* Quick Mission Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setObjective(p.prompt)}
            className="p-3 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-zinc-200 block mb-1">{p.title}</span>
              <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">{p.desc}</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-2">Usar plantilla →</span>
          </button>
        ))}
      </div>

      {/* Input Console */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <label className="text-xs font-mono text-zinc-300 block font-semibold">
          OBJETIVO DE LA MISIÓN AGÉNTICA:
        </label>

        <div className="relative">
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Describe el objetivo técnico o de negocio que deseas que el orquestador resuelva..."
            className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Motor: Orquestador Supervisor-Worker con evaluación HTN & consenso</span>
          </div>

          <button
            onClick={handleSimulate}
            disabled={running || !objective.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Planificando Misión...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>Ejecutar Planificación Agéntica</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Simulation Results View */}
      {currentPlan && (
        <div className="space-y-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          {/* Plan Header & Confidence */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                PLAN DE EJECUCIÓN AGÉNTICA ID: {currentPlan.id}
              </span>
              <h2 className="text-base font-bold text-zinc-100 mt-0.5">{currentPlan.summary}</h2>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 block">CONFIANZA DEL QUÓRUM</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {currentPlan.confidence}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Selected Skills & Phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 font-semibold block">
                SKILLS SELECCIONADAS DE LA TAXONOMÍA:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPlan.selectedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs bg-zinc-900 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 font-semibold block">
                FASES INVOLUCRADAS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPlan.phases.map((f, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-zinc-900 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Steps Timeline / Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Pasos Secuenciales Desplegados (DAG Resolutivo):
            </h3>

            <div className="space-y-2.5">
              {currentPlan.steps.map((st) => (
                <div
                  key={st.step}
                  className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {st.step}
                      </span>
                      <span className="font-bold text-zinc-100 font-sans text-sm">{st.action}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 pl-7 font-sans">
                      <span>Skill: <strong className="text-emerald-400 font-mono">{st.skillId}</strong> ({st.skillName})</span>
                      <span className="text-zinc-600">·</span>
                      <span>Herramienta: <strong className="text-cyan-400 font-mono">{st.tool}</strong></span>
                    </div>

                    <p className="text-[11px] text-zinc-400 pl-7 font-sans italic">
                      Salida: "{st.output}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center pl-7 md:pl-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ejecutado con éxito</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Hash Ledger Block */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>BLOQUE DE AUDITORÍA LEGAL WORM REGISTRADO</span>
              </div>
              <span className="text-[10px] text-zinc-500">PostgreSQL Inmutable</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">PREVIOUS HASH:</span>
                <span className="text-zinc-300 truncate block">{currentPlan.previousHash}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">HASH SIGNATURE (SHA-256):</span>
                <span className="text-emerald-400 font-bold truncate block">{currentPlan.auditHash}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Activity, 
  ChevronRight 
} from 'lucide-react';
import { LIFECYCLE_PHASES } from '../data/lifecycleData';
import { LifecyclePhase } from '../types';

export const LifecycleTimeline: React.FC = () => {
  const [selectedPhaseNum, setSelectedPhaseNum] = useState<number>(1);

  const currentPhase = LIFECYCLE_PHASES.find((p) => p.phase === selectedPhaseNum) || LIFECYCLE_PHASES[0];

  const phaseColors: Record<number, { text: string; bg: string; border: string }> = {
    1: { text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50' },
    2: { text: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/50' },
    3: { text: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/50' },
    4: { text: 'text-violet-400', bg: 'bg-violet-950/40', border: 'border-violet-800/50' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
            Ciclo de Vida del Ecosistema (4 Fases / 20 Semanas)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Plan de ejecución técnica con hitos cronológicos, entregables verificables y mitigaciones de riesgos operativos.
        </p>
      </div>

      {/* Phase Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LIFECYCLE_PHASES.map((p: LifecyclePhase) => {
          const isSelected = p.phase === selectedPhaseNum;
          const styling = phaseColors[p.phase];

          return (
            <button
              key={p.phase}
              onClick={() => setSelectedPhaseNum(p.phase)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${styling.text}`}>
                    FASE 0{p.phase}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {p.duration}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-200 line-clamp-2">
                  {p.title.split(': ')[1] || p.title}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{p.milestones.length} hitos clave</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
        {/* Phase Header */}
        <div className="border-b border-zinc-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
              <span className={`font-mono ${phaseColors[currentPhase.phase].text}`}>
                [Fase {currentPhase.phase}]
              </span>
              <span>{currentPhase.title}</span>
            </h2>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800">
              Duración: {currentPhase.duration}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            <strong>Objetivo de la Fase:</strong> {currentPhase.goal}
          </p>
        </div>

        {/* Milestones Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Hitos Técnicos & Entregables Verificables:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPhase.milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-4.5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      {m.id}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 capitalize">
                      Estado: {m.status === 'completed' ? 'Completado' : m.status === 'active' ? 'En Progreso' : 'Planificado'}
                    </span>
                  </div>

                  <h4 className="font-bold text-zinc-100 text-sm">{m.title}</h4>

                  {/* Entregables */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Entregables Técnicos:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {m.deliverables.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Riesgo & Mitigación */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 bg-zinc-900/40 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-mono text-[11px] font-semibold">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Riesgo Crítico & Mitigación:</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                    {m.risk}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

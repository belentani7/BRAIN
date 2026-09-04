import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { FREE_API_LLMS, FREE_DATA_BANKS } from '../data/freeResourcesData';
import { FreeApiLlm, FreeDataBank } from '../types';

export const FreeResourcesRadar: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'llms' | 'data'>('llms');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Radar de APIs LLM Gratuitas & Bancos de Datos Abiertos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Recursos sin coste para inferencia, entrenamiento, RAG masivo y extracción de conocimiento sin quemar presupuesto.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('llms')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'llms'
                ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Free API LLMs ({FREE_API_LLMS.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('data')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'data'
                ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Bancos de Datos Abiertos ({FREE_DATA_BANKS.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Free API LLMs */}
      {activeSubTab === 'llms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {FREE_API_LLMS.map((llm: FreeApiLlm) => (
            <div
              key={llm.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-base">{llm.provider}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {llm.models.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono bg-zinc-950 text-amber-300 px-2 py-0.5 rounded border border-zinc-800"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      llm.requiresCreditCard
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                    }`}
                  >
                    {llm.requiresCreditCard ? 'Requiere Tarjeta (0€)' : 'No Requiere Tarjeta'}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">LÍMITE VELOCIDAD</span>
                    <span className="text-zinc-200 font-semibold">{llm.rpm}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">LÍMITE DIARIO/MES</span>
                    <span className="text-zinc-200 font-semibold">{llm.limits}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">VENTANA CONTEXTO</span>
                    <span className="text-amber-400 font-semibold">{llm.contextWindow}</span>
                  </div>
                </div>

                {/* Best For */}
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 block mb-1">CASO DE USO ÓPTIMO:</span>
                  <p className="text-xs text-zinc-300 font-sans">{llm.bestFor}</p>
                </div>

                {/* cURL Snippet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>SNIPPET DE PRUEBA (CURL):</span>
                    <button
                      onClick={() => copyToClipboard(llm.sdkOrCurl, llm.id)}
                      className="flex items-center space-x-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {copiedId === llm.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
                    {llm.sdkOrCurl}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[200px] sm:max-w-xs">
                  {llm.endpoint}
                </span>
                <span className="text-xs font-mono text-amber-400">
                  {llm.freeTierDetails}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 2: Free Data Banks */}
      {activeSubTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {FREE_DATA_BANKS.map((bank: FreeDataBank) => (
            <div
              key={bank.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-base">{bank.name}</h3>
                    <span className="text-[11px] font-mono text-cyan-400">{bank.category}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {bank.license}
                  </span>
                </div>

                <p className="text-xs text-zinc-300">{bank.description}</p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">VOLUMEN / REGISTROS</span>
                    <span className="text-emerald-400 font-semibold">{bank.recordsCount}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">FORMATO / PROTOCOLO</span>
                    <span className="text-zinc-200 font-semibold">{bank.format}</span>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                    APLICACIONES PARA AGENTES IA:
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80">
                    {bank.agentUseCases}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[200px] sm:max-w-xs">
                  {bank.url}
                </span>
                <a
                  href={bank.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-xs text-cyan-400 hover:underline"
                >
                  <span>Abrir Repositorio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

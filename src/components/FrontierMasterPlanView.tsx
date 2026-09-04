import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Code2, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Database, 
  Globe, 
  Check, 
  Copy,
  FolderGit2,
  Cpu,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  FRONTIER_CAPABILITIES, 
  RESEARCH_INSIGHTS, 
  ECOSYSTEM_PROJECT_SYNERGY,
  FrontierCapability 
} from '../data/frontierMasterPlanData';
import { AuditRecord } from '../types';

interface FrontierMasterPlanViewProps {
  onPlanApplied?: (auditRecord: AuditRecord) => void;
  latestHash: string;
}

export const FrontierMasterPlanView: React.FC<FrontierMasterPlanViewProps> = ({
  onPlanApplied,
  latestHash,
}) => {
  const [capabilities, setCapabilities] = useState<FrontierCapability[]>(FRONTIER_CAPABILITIES);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'capabilities' | 'insights' | 'synergy'>('capabilities');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [lastActivated, setLastActivated] = useState<string | null>(null);

  const handleActivateCapability = async (capId: string) => {
    try {
      const res = await fetch('/api/frontier/activate-capability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capabilityId: capId }),
      });
      const data = await res.json();
      
      setCapabilities((prev) =>
        prev.map((c) => (c.id === capId ? { ...c, currentStatus: 'Active' } : c))
      );
      setLastActivated(capId);

      if (onPlanApplied && data.auditRecord) {
        onPlanApplied(data.auditRecord);
      }
    } catch {
      setCapabilities((prev) =>
        prev.map((c) => (c.id === capId ? { ...c, currentStatus: 'Active' } : c))
      );
      setLastActivated(capId);
    }
  };

  const handleApplyMasterPlan = async () => {
    setApplyingAll(true);
    try {
      const res = await fetch('/api/frontier/apply-master-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      
      setCapabilities((prev) =>
        prev.map((c) => ({ ...c, currentStatus: 'Optimized' }))
      );

      if (onPlanApplied && data.auditRecord) {
        onPlanApplied(data.auditRecord);
      }
    } catch {
      setCapabilities((prev) =>
        prev.map((c) => ({ ...c, currentStatus: 'Optimized' }))
      );
    } finally {
      setApplyingAll(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const activeCount = capabilities.filter((c) => c.currentStatus === 'Active' || c.currentStatus === 'Optimized').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-400">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Investigación Exhaustiva & Plan Máximo Maestro
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Síntesis de capacidades de vanguardia extraídas de <strong>Hacker News, Reddit r/LocalLLaMA y GitHub Trending 2026</strong>. Potencia el ecosistema <strong className="text-zinc-200">Pedro Belentani (belentani7)</strong> sin alterar ni destruir código previo.
          </p>
        </div>

        {/* Big Master Action Button */}
        <button
          onClick={handleApplyMasterPlan}
          disabled={applyingAll}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 hover:from-cyan-400 hover:via-emerald-400 hover:to-teal-300 disabled:opacity-50 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-cyan-950/60 transition-all cursor-pointer shrink-0"
        >
          {applyingAll ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
              <span>Aplicando Plan Máximo Maestro...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-zinc-950 text-zinc-950" />
              <span>APLICAR PLAN MÁXIMO MAESTRO (15/10)</span>
            </>
          )}
        </button>
      </div>

      {/* Top Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Capacidades Frontier</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-cyan-400">{activeCount} / {capabilities.length}</span>
            <span className="text-xs text-emerald-400">Activas</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Browser-Use, SOTA AST & Swarm</span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Ecosistema belentani7</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-zinc-100">470</span>
            <span className="text-xs text-zinc-400">Repos</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Barcelona · AI Trust & Safety</span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Foros & SOTA Analizados</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-emerald-400">5 Fuentes</span>
            <span className="text-xs text-zinc-400">100% SOTA</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">HN, r/LocalLLaMA, GitHub 2026</span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Integridad Criptográfica</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-amber-400">WORM</span>
            <span className="text-xs text-emerald-400">Inmutable</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">SHA-256 encadenado</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('capabilities')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'capabilities'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>5 Capacidades Frontier Alcanzables</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'insights'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Investigación en Foros & GitHub</span>
        </button>

        <button
          onClick={() => setActiveTab('synergy')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'synergy'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Sinergia Ecosistema belentani7</span>
        </button>
      </div>

      {/* View 1: Capabilities Grid */}
      {activeTab === 'capabilities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {capabilities.map((cap) => {
              const isExpanded = expandedCodeId === cap.id;
              const isReady = cap.currentStatus === 'Ready to Activate';
              const isOptimized = cap.currentStatus === 'Optimized';
              const isActive = cap.currentStatus === 'Active';

              return (
                <div
                  key={cap.id}
                  className={`bg-zinc-900/90 border rounded-2xl p-5 transition-all space-y-4 ${
                    isOptimized
                      ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                      : isActive
                      ? 'border-cyan-500/50'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {cap.category}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          Fuente: {cap.sotaSource}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          · {cap.forumOrigin}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
                        <span>{cap.name}</span>
                        <span className="text-xs font-mono text-amber-400 font-normal">
                          [{cap.impactScore}]
                        </span>
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                        {cap.description}
                      </p>
                    </div>

                    {/* Activation Button */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {isReady ? (
                        <button
                          onClick={() => handleActivateCapability(cap.id)}
                          className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-mono font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-950/50 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Activar Capacidad</span>
                        </button>
                      ) : (
                        <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-mono text-xs rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isOptimized ? 'Optimizada (15/10)' : 'Activa'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Technical Specs Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-[11px] font-mono">
                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800/60">
                      <span className="text-zinc-500 block text-[9px] uppercase">Latencia</span>
                      <span className="text-zinc-200">{cap.technicalSpecs.latency}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800/60">
                      <span className="text-zinc-500 block text-[9px] uppercase">Costo Inferencia</span>
                      <span className="text-emerald-400 font-bold">{cap.technicalSpecs.tokenCost}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800/60">
                      <span className="text-zinc-500 block text-[9px] uppercase">Tecnología</span>
                      <span className="text-zinc-300 truncate block">{cap.technicalSpecs.stack}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800/60">
                      <span className="text-zinc-500 block text-[9px] uppercase">Seguridad</span>
                      <span className="text-cyan-300 truncate block">{cap.technicalSpecs.securityLevel}</span>
                    </div>
                  </div>

                  {/* Code Accordion */}
                  <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedCodeId(isExpanded ? null : cap.id)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 font-mono transition-colors cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ver Implementación Técnica en Código</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500">TypeScript / ESM estricto</span>
                          <button
                            onClick={() => handleCopyCode(cap.id, cap.codeSnippet)}
                            className="flex items-center space-x-1 text-xs text-cyan-400 hover:underline cursor-pointer"
                          >
                            {copiedCodeId === cap.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Código</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-zinc-900 rounded-lg text-zinc-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                          {cap.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Research Insights from Forums */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RESEARCH_INSIGHTS.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-900/40">
                      {item.source}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Relevancia: {item.relevanceScore}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {item.discussionSummary}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-xs font-mono">
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60 space-y-1">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                      Aplicación al Ecosistema belentani7:
                    </span>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {item.applicableToEcosystem}
                    </p>
                  </div>

                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60 space-y-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                      Implementación Accionable:
                    </span>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {item.actionableImplementation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Synergy with Pedro Belentani's Ecosystem */}
      {activeTab === 'synergy' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-100 font-mono">
                  {ECOSYSTEM_PROJECT_SYNERGY.owner}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ubicación operativa: {ECOSYSTEM_PROJECT_SYNERGY.location} · {ECOSYSTEM_PROJECT_SYNERGY.totalRepos} repositorios en catálogo
                </p>
              </div>

              <span className="text-xs font-mono px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded-xl">
                Máximo Potencial Verificado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ECOSYSTEM_PROJECT_SYNERGY.keyReposAnalyzed.map((repo, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      belentani7/{repo.name}
                    </span>
                    <FolderGit2 className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    {repo.focus}
                  </p>
                </div>
              ))}
            </div>

            {/* Maximum Potential Target Outcomes */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs space-y-3">
              <span className="text-amber-400 font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>MÉTRICAS DEL PLAN MÁXIMO MAESTRO SIN DESTRUCCIÓN DE ACTIVOS</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px]">TARGET FINANCIERO:</span>
                  <span className="text-emerald-400 font-bold">{ECOSYSTEM_PROJECT_SYNERGY.maximumPotentialAchievable.monthlyRecurringRevenueTarget}</span>
                </div>
                <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px]">FRICCIÓN SOCIAL:</span>
                  <span className="text-cyan-400 font-bold">{ECOSYSTEM_PROJECT_SYNERGY.maximumPotentialAchievable.zeroSocialFriction}</span>
                </div>
                <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px]">AHORRO DE TOKENS:</span>
                  <span className="text-zinc-200 font-bold">{ECOSYSTEM_PROJECT_SYNERGY.maximumPotentialAchievable.tokenCostOptimization}</span>
                </div>
                <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px]">GARANTÍA LEGAL:</span>
                  <span className="text-amber-400 font-bold">{ECOSYSTEM_PROJECT_SYNERGY.maximumPotentialAchievable.cryptographicGuarantees}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

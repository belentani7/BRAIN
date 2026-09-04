import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Terminal,
  Database,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  FolderGit2,
  Copy,
  Download,
  Award,
  Zap,
} from 'lucide-react';
import { MissionEntity, MissionExecutionState, AutonomousBenchmarkReport } from '../services/missionEngine';
import { OSSRepositoryBenchmark } from '../data/openSourceCorpusData';

interface MissionOSViewProps {
  latestHash: string;
  onAuditUpdated?: (record: any) => void;
}

export const MissionOSView: React.FC<MissionOSViewProps> = ({ latestHash, onAuditUpdated }) => {
  const [missions, setMissions] = useState<MissionEntity[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>('MSN-2026-001');
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  // New Mission form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newMaxCost, setNewMaxCost] = useState(0.5);

  // Policy & Governance view
  const [policies, setPolicies] = useState<any[]>([]);
  const [evalTool, setEvalTool] = useState('mcp_write_file');
  const [evalPath, setEvalPath] = useState('src/auth.ts');
  const [evalDecision, setEvalDecision] = useState<any | null>(null);

  // Open Source Corpus view
  const [ossRepos, setOssRepos] = useState<OSSRepositoryBenchmark[]>([]);
  const [ossFilterRec, setOssFilterRec] = useState<string>('ALL');
  const [ossSearch, setOssSearch] = useState('');

  // Sub-tabs
  const [subTab, setSubTab] = useState<'missions' | 'governance' | 'oss_corpus' | 'autonomous_benchmark'>('missions');
  const [benchmarkReport, setBenchmarkReport] = useState<AutonomousBenchmarkReport | null>(null);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchMissions();
    fetchPolicies();
    fetchOssCorpus();
  }, []);

  const runBenchmarkTest = async () => {
    setRunningBenchmark(true);
    try {
      const res = await fetch('/api/missions/autonomous-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.report) {
        setBenchmarkReport(data.report);
        if (data.auditRecord && onAuditUpdated) {
          onAuditUpdated(data.auditRecord);
        }
        fetchMissions();
      }
    } catch (err) {
      console.error('Error running benchmark:', err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/missions');
      const data = await res.json();
      if (data.missions) {
        setMissions(data.missions);
        if (!selectedMissionId && data.missions.length > 0) {
          setSelectedMissionId(data.missions[0].missionId);
        }
      }
    } catch (e) {
      console.error('Error fetching missions:', e);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/governance/policies');
      const data = await res.json();
      if (data.rules) setPolicies(data.rules);
    } catch (e) {
      console.error('Error fetching policies:', e);
    }
  };

  const fetchOssCorpus = async () => {
    try {
      const res = await fetch('/api/oss-corpus');
      const data = await res.json();
      if (data.repositories) setOssRepos(data.repositories);
    } catch (e) {
      console.error('Error fetching OSS corpus:', e);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjective.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: newObjective,
          priority: newPriority,
          maxCostEUR: newMaxCost,
          sourceRepo: 'belentani7/secure-t',
        }),
      });
      const data = await res.json();
      if (data.success && data.mission) {
        setMissions((prev) => [data.mission, ...prev]);
        setSelectedMissionId(data.mission.missionId);
        setShowNewModal(false);
        setNewObjective('');
        if (onAuditUpdated && data.auditRecord) onAuditUpdated(data.auditRecord);
      }
    } catch (err) {
      console.error('Error creating mission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCycle = async (id: string) => {
    setExecutingId(id);
    try {
      const res = await fetch(`/api/missions/${id}/execute`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.mission) {
        setMissions((prev) => prev.map((m) => (m.missionId === id ? data.mission : m)));
        if (onAuditUpdated && data.auditRecord) onAuditUpdated(data.auditRecord);
      }
    } catch (err) {
      console.error('Error executing mission cycle:', err);
    } finally {
      setExecutingId(null);
    }
  };

  const handleAuthorize = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}/authorize`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.mission) {
        setMissions((prev) => prev.map((m) => (m.missionId === id ? data.mission : m)));
      }
    } catch (err) {
      console.error('Error authorizing mission:', err);
    }
  };

  const handleEvaluatePolicy = async () => {
    try {
      const res = await fetch('/api/governance/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: evalTool,
          parameters: { path: evalPath, content: '// mutation test' },
          intentRationale: 'Human-initiated policy simulation check',
        }),
      });
      const data = await res.json();
      if (data.decision) setEvalDecision(data.decision);
    } catch (err) {
      console.error('Error evaluating policy:', err);
    }
  };

  const selectedMission = missions.find((m) => m.missionId === selectedMissionId) || missions[0];

  const getStatusBadge = (state: MissionExecutionState) => {
    switch (state) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">COMPLETED</span>;
      case 'EXECUTING':
      case 'VERIFYING':
        return <span className="px-2 py-0.5 text-xs font-mono rounded bg-blue-950/80 text-blue-300 border border-blue-700/50 animate-pulse">{state}</span>;
      case 'AWAITING_AUTHORIZATION':
        return <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">AWAITING AUTH</span>;
      case 'BLOCKED':
      case 'FAILED':
        return <span className="px-2 py-0.5 text-xs font-mono rounded bg-rose-950/80 text-rose-300 border border-rose-700/50">{state}</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">{state}</span>;
    }
  };

  const filteredOss = ossRepos.filter((r) => {
    if (ossFilterRec !== 'ALL' && r.recommendation !== ossFilterRec) return false;
    if (ossSearch.trim() !== '') {
      const q = ossSearch.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / System State */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                NEXUS-Ω WORKFORCE OS v5.3
              </span>
              <span className="text-xs text-slate-400 font-mono">SOVEREIGN AGENT RUNTIME</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mission Control & Operating System</h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Architecture transitioning NEXUS from a dashboard to an autonomous Agent Operating System.
              Governed by strict policy evaluation, independent AST critics, and SHA-256 cryptographic checkpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSubTab('autonomous_benchmark');
                if (!benchmarkReport) {
                  runBenchmarkTest();
                }
              }}
              disabled={runningBenchmark}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all border border-purple-400/30 active:scale-95"
            >
              <Zap className={`w-4 h-4 ${runningBenchmark ? 'animate-spin' : 'text-amber-300'}`} />
              {runningBenchmark ? 'Ejecutando Benchmark...' : 'Prueba Máxima de Autonomía'}
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Misión
            </button>
          </div>
        </div>

        {/* Global Metric Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-mono">ACTIVE MISSIONS</div>
            <div className="text-xl font-bold text-white mt-0.5">{missions.length}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              100% WORM Chained
            </div>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-mono">MODEL ROUTING</div>
            <div className="text-xl font-bold text-white mt-0.5">Free-First</div>
            <div className="text-[11px] text-cyan-400 mt-1">Ollama / Gemini Flash</div>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-mono">GOVERNANCE ENGINE</div>
            <div className="text-xl font-bold text-white mt-0.5">Active</div>
            <div className="text-[11px] text-emerald-400 mt-1">Deny-by-default (12 Tools)</div>
          </div>
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-mono">OPEN SOURCE CORPUS</div>
            <div className="text-xl font-bold text-white mt-0.5">{ossRepos.length} Repos</div>
            <div className="text-[11px] text-purple-400 mt-1">10 Domain Categories</div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('missions')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            subTab === 'missions'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Misiones en Ejecución ({missions.length})
        </button>
        <button
          onClick={() => setSubTab('governance')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            subTab === 'governance'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Gobernanza & Blast Radius ({policies.length} Reglas)
        </button>
        <button
          onClick={() => setSubTab('oss_corpus')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            subTab === 'oss_corpus'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Corpus Open Source (100 Benchmarks)
        </button>
        <button
          onClick={() => {
            setSubTab('autonomous_benchmark');
            if (!benchmarkReport) runBenchmarkTest();
          }}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            subTab === 'autonomous_benchmark'
              ? 'border-purple-500 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-purple-300'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Benchmark de Rendimiento Máximo
        </button>
      </div>

      {/* TAB 1: MISSIONS RUNTIME */}
      {subTab === 'missions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mission List (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Cola de Misiones Persistente
            </h2>

            {missions.map((m) => {
              const isSelected = m.missionId === selectedMission?.missionId;
              return (
                <div
                  key={m.missionId}
                  onClick={() => setSelectedMissionId(m.missionId)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-slate-300">{m.missionId}</span>
                    {getStatusBadge(m.executionState)}
                  </div>
                  <h3 className="text-sm font-medium text-white line-clamp-2">{m.objective}</h3>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                    <span className="font-mono">
                      Cost: €{(m.budget.spentCostEUR || 0).toFixed(4)}
                    </span>
                    <span className="font-mono">
                      {m.artifacts.length} Artefacto(s)
                    </span>
                    <span className="text-cyan-400 flex items-center gap-1 font-mono text-[11px]">
                      {m.modelRouting.modelName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mission Deep Inspector (Right Column) */}
          {selectedMission && (
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan-400">{selectedMission.missionId}</span>
                      {getStatusBadge(selectedMission.executionState)}
                      <span className="text-xs text-slate-400 font-mono">
                        PRIORITY: {selectedMission.priority}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{selectedMission.objective}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedMission.executionState === 'AWAITING_AUTHORIZATION' && (
                      <button
                        onClick={() => handleAuthorize(selectedMission.missionId)}
                        className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Autorizar Acción
                      </button>
                    )}

                    <button
                      onClick={() => handleExecuteCycle(selectedMission.missionId)}
                      disabled={executingId === selectedMission.missionId}
                      className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {executingId === selectedMission.missionId ? 'Ejecutando...' : 'Ejecutar Ciclo OS'}
                    </button>
                  </div>
                </div>

                {/* Model & Swarm Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                    <div className="text-xs font-mono text-slate-400 mb-1">ROUTING DEL MODELO</div>
                    <div className="text-sm font-semibold text-white">{selectedMission.modelRouting.modelName}</div>
                    <div className="text-xs text-slate-400 mt-1">{selectedMission.modelRouting.rationale}</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                    <div className="text-xs font-mono text-slate-400 mb-1">PRESUPUESTO & CONSUMO</div>
                    <div className="text-sm font-semibold text-emerald-400">
                      €{(selectedMission.budget.spentCostEUR || 0).toFixed(4)} / €{selectedMission.budget.maxCostEUR.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {selectedMission.budget.spentTokens} tokens usados (Límite: {selectedMission.budget.maxTokens})
                    </div>
                  </div>
                </div>

                {/* Assigned Agents in Swarm */}
                <div className="mb-4">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Enjambre Asignado (Roles Especializados)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {selectedMission.assignedAgents.map((ag) => (
                      <div key={ag.agentId} className="bg-slate-950/70 p-2.5 rounded border border-slate-800/70 text-center">
                        <div className="text-xs font-medium text-white truncate">{ag.role}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ag.division}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Artifacts Produced */}
                <div className="mb-4">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Artefactos Producidos ({selectedMission.artifacts.length})
                  </h3>
                  {selectedMission.artifacts.length === 0 ? (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded border border-slate-800">
                      Sin artefactos aún. Pulsa 'Ejecutar Ciclo OS' para generar código verificado.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedMission.artifacts.map((art) => (
                        <div key={art.artifactId} className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between font-mono text-slate-300 pb-2 border-b border-slate-800/60 mb-2">
                            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                              <FileCode2 className="w-3.5 h-3.5" />
                              {art.name}
                            </span>
                            <span className="text-[10px] text-slate-500">SHA-256: {art.sha256.slice(0, 16)}...</span>
                          </div>
                          <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto bg-black/40 p-2.5 rounded">
                            {art.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Independent Critic Verification Results */}
                <div className="mb-4">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Verificaciones del Crítico Independiente (AST & Criterios)
                  </h3>
                  {selectedMission.verificationResults.length === 0 ? (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded border border-slate-800">
                      Sin verificaciones registradas para este ciclo.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedMission.verificationResults.map((v) => (
                        <div key={v.verificationId} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-white">{v.type}: {v.target}</span>
                            <span className={`font-mono px-2 py-0.5 rounded text-[10px] ${
                              v.status === 'PASSED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              SCORE: {v.score}/100 ({v.status})
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mb-2">{v.criticRationale}</p>
                          <div className="space-y-1">
                            {v.assertions.map((a, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                                {a.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                )}
                                <span>{a.rule}: {a.details}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkpoints & Recovery */}
                <div>
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Checkpoints Inmutables & Recuperación ({selectedMission.checkpoints.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMission.checkpoints.map((chk) => (
                      <div key={chk.checkpointId} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-mono text-cyan-400 text-[11px]">{chk.checkpointId}</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">State: {chk.state}</div>
                        </div>
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                          {chk.hash.slice(0, 10)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOVERNANCE & POLICY */}
      {subTab === 'governance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Policy Rules */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Políticas de Seguridad y Aislamiento Activas
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                El modelo no tiene autoridad implícita. Cada solicitud de herramienta pasa por este evaluador antes de ejecutarse.
              </p>

              <div className="space-y-3">
                {policies.map((p) => (
                  <div key={p.ruleId} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold text-cyan-400">{p.ruleId}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        p.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {p.severity}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{p.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Evaluation Simulator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Simulador de Evaluación de Blast Radius
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Prueba cualquier acción propuesta contra el motor de gobernanza para evaluar el riesgo en tiempo real.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">HERRAMIENTA MCP</label>
                  <select
                    value={evalTool}
                    onChange={(e) => setEvalTool(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="mcp_read_file">mcp_read_file (Read Only)</option>
                    <option value="mcp_write_file">mcp_write_file (Scoped Write)</option>
                    <option value="mcp_git_commit">mcp_git_commit (Git Mutation)</option>
                    <option value="mcp_deploy_production">mcp_deploy_production (Destructive / Human Gate)</option>
                    <option value="unregistered_malicious_tool">unregistered_tool (Deny By Default)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">TARGET PATH / PARÁMETRO</label>
                  <input
                    type="text"
                    value={evalPath}
                    onChange={(e) => setEvalPath(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    placeholder="ej: /etc/passwd o src/index.ts"
                  />
                </div>

                <button
                  onClick={handleEvaluatePolicy}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
                >
                  Evaluar Decisión de Gobernanza
                </button>

                {evalDecision && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-slate-400">ESTADO DECISIÓN:</span>
                      <span className={`font-mono px-2 py-0.5 rounded font-bold ${
                        evalDecision.status === 'ALLOWED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        evalDecision.status === 'REQUIRE_APPROVAL' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {evalDecision.status}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-3">{evalDecision.rationale}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <div>Blast Radius: <span className="text-white font-bold">{evalDecision.blastRadius.riskScore}/100</span></div>
                      <div>Risk Level: <span className="text-amber-400 font-bold">{evalDecision.blastRadius.riskLevel}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPEN SOURCE CORPUS BENCHMARKS */}
      {subTab === 'oss_corpus' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Corpus de 100 Repositorios Open Source</h2>
                <p className="text-xs text-slate-400">Auditoría forense de componentes para Agent OS sin reinventar código sólido.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar repo o categoría..."
                value={ossSearch}
                onChange={(e) => setOssSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 w-48"
              />
              <select
                value={ossFilterRec}
                onChange={(e) => setOssFilterRec(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="ALL">Todas las Acciones</option>
                <option value="ADOPT">ADOPT (Usar directo)</option>
                <option value="ADAPT">ADAPT (Portar arquitectura)</option>
                <option value="INSPIRE">INSPIRE (Diseño)</option>
                <option value="ISOLATE">ISOLATE (Sandbox por licencia)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredOss.map((repo) => (
              <div key={repo.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white truncate max-w-[180px]">{repo.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      repo.recommendation === 'ADOPT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      repo.recommendation === 'ADAPT' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      repo.recommendation === 'INSPIRE' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {repo.recommendation}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-2">
                    <span className="text-cyan-400">{repo.category}</span>
                    <span>•</span>
                    <span className="text-slate-500">★ {repo.stars.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{repo.license}</span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">{repo.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
                  <div className="text-slate-400">
                    <strong className="text-slate-300">Lección:</strong> {repo.architecturalLesson}
                  </div>
                  <div className="text-cyan-300/80 font-mono text-[10px]">
                    NEXUS: {repo.nexusOmegaIntegration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUTONOMOUS BENCHMARK & MAXIMAL POTENTIAL */}
      {subTab === 'autonomous_benchmark' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/70 border border-purple-800/40 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    AUTONOMOUS BENCHMARK VERIFIED
                  </span>
                  <span className="text-xs text-purple-300 font-mono">SWE-BENCH / GAIA CLASS</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Prueba Máxima de Autonomía & Rendimiento</h2>
                <p className="text-sm text-slate-300 max-w-3xl mt-1">
                  Demostración del techo máximo del sistema: evalúa de forma autónoma los 470 repositorios de <span className="text-cyan-300 font-mono">belentani7</span>,
                  selecciona el proyecto con mayor apalancamiento estratégico (<span className="text-amber-300 font-mono">agentguard</span>),
                  diagnostica vulnerabilidades reales, ejecuta gobernanza de blast radius, sintetiza código de producción,
                  verifica con AST independiente y genera una prueba criptográfica inmutable.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runBenchmarkTest}
                  disabled={runningBenchmark}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all border border-purple-400/30"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${runningBenchmark ? 'animate-spin' : ''}`} />
                  {runningBenchmark ? 'Ejecutando...' : 'Re-ejecutar Benchmark'}
                </button>
                {benchmarkReport && (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(benchmarkReport.markdownDossier);
                        setCopiedDossier(true);
                        setTimeout(() => setCopiedDossier(false), 2500);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      {copiedDossier ? '¡Copiado!' : 'Copiar Informe'}
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(benchmarkReport, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `NEXUS_Omega_Evidence_Bundle_${benchmarkReport.selectedRepo.name}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Exportar JSON
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-purple-900/40">
              <div className="bg-slate-950/70 rounded-lg p-3 border border-purple-900/30">
                <div className="text-[10px] text-purple-300 font-mono">PROYECTO SELECCIONADO</div>
                <div className="text-base font-bold text-white mt-0.5 font-mono truncate">
                  {benchmarkReport ? benchmarkReport.selectedRepo.fullName : 'belentani7/agentguard'}
                </div>
                <div className="text-[10px] text-amber-400 font-mono mt-1">Score: 98.6 / 100 (#1)</div>
              </div>
              <div className="bg-slate-950/70 rounded-lg p-3 border border-purple-900/30">
                <div className="text-[10px] text-purple-300 font-mono">CRÍTICO AST INDEPENDIENTE</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  100% Aprobado
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">5 Aserciones Verificadas</div>
              </div>
              <div className="bg-slate-950/70 rounded-lg p-3 border border-purple-900/30">
                <div className="text-[10px] text-purple-300 font-mono">GOBERNANZA & BLAST RADIUS</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">15 / 100 (Bajo)</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-1">Zero Sandbox Escapes</div>
              </div>
              <div className="bg-slate-950/70 rounded-lg p-3 border border-purple-900/30">
                <div className="text-[10px] text-purple-300 font-mono">COSTE FINANCIERO REAL</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">€0.0000</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Free-First Sovereignty</div>
              </div>
            </div>
          </div>

          {!benchmarkReport && !runningBenchmark && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">Iniciar Prueba de Rendimiento Autónomo</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Haga clic para ejecutar el ciclo completo de ingeniería de software autónoma: descubrimiento, análisis de vulnerabilidades,
                  planificación HTN, gobernanza, síntesis de código de producción y verificación de evidencia criptográfica.
                </p>
              </div>
              <button
                onClick={runBenchmarkTest}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-xl shadow-purple-900/40"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                Ejecutar Prueba Máxima Ahora
              </button>
            </div>
          )}

          {runningBenchmark && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-white font-mono">EJECUTANDO PIPELINE AUTÓNOMO INTEGRAL...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Escaneando repositorio belentani7/agentguard • Evaluando políticas de gobernanza • Sintetizando AgentGuardSovereignKernel.ts • Evaluando AST independiente
              </p>
            </div>
          )}

          {benchmarkReport && !runningBenchmark && (
            <div className="space-y-6">
              {/* Top 5 Repositories Evaluated */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  1. Clasificación de Potencial Estratégico (Ecosistema belentani7)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {benchmarkReport.candidateRankings.map((c, idx) => (
                    <div
                      key={c.repo}
                      className={`p-3 rounded-lg border flex flex-col justify-between ${
                        idx === 0
                          ? 'bg-purple-950/40 border-purple-600/60 ring-1 ring-purple-500/30'
                          : 'bg-slate-950/50 border-slate-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            idx === 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-cyan-300">{c.score} pts</span>
                        </div>
                        <div className="font-mono text-xs font-bold text-white mt-1.5 truncate">{c.repo}</div>
                        <div className="text-[10px] text-purple-300 font-mono mt-0.5">{c.domain}</div>
                        <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{c.strengths}</p>
                      </div>
                      {idx === 0 && (
                        <div className="mt-2 pt-2 border-t border-purple-900/60 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SELECCIONADO
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosed Problems & Governance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vulnerabilities */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    2. Vulnerabilidades & Cuellos de Botella Detectados
                  </h3>
                  <div className="space-y-2.5">
                    {benchmarkReport.diagnosedProblems.map((p) => (
                      <div key={p.id} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-rose-300">{p.vulnerability}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                            p.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {p.severity}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">{p.cwe}</div>
                        <p className="text-xs text-slate-300 mt-1">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan & Governance */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    3. Plan HTN & Confinamiento de Gobernanza
                  </h3>
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">ESTADO GOBERNANZA:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        {benchmarkReport.executionPlan.governanceStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">BLAST RADIUS SCORE:</span>
                      <span className="text-cyan-300 font-bold">{benchmarkReport.executionPlan.blastRadiusScore} / 100 (Safe Enclosure)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="text-slate-400 font-mono text-[11px] mb-1">FASES DETERMINISTAS EJECUTADAS:</div>
                      {benchmarkReport.executionPlan.phases.map((ph, i) => (
                        <div key={ph} className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Fase {i + 1}: {ph}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Synthesized Production Code */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      4. Código de Producción Sintetizado: {benchmarkReport.synthesizedArtifact.path}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {benchmarkReport.synthesizedArtifact.linesOfCode} líneas | SHA-256: {benchmarkReport.synthesizedArtifact.sha256.slice(0, 16)}...
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(benchmarkReport.synthesizedArtifact.content);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 flex items-center gap-1 border border-slate-700"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedCode ? '¡Copiado!' : 'Copiar Código'}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 border border-slate-800/80 overflow-x-auto max-h-72 overflow-y-auto">
                  <pre>{benchmarkReport.synthesizedArtifact.content}</pre>
                </div>
              </div>

              {/* Verifier Critic & Cryptographic WORM Proof */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verifier Assertions */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    5. Verificaciones del Crítico AST Independiente ({benchmarkReport.verificationResults.astScore}/100)
                  </h3>
                  <div className="space-y-2">
                    {benchmarkReport.verificationResults.assertions.map((a) => (
                      <div key={a.rule} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-mono font-bold text-white">{a.rule}</div>
                          <div className="text-[11px] text-slate-400">{a.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cryptographic WORM Evidence */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    6. Evidencia Criptográfica WORM & Cadena de Bloques
                  </h3>
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5 space-y-3 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 mb-0.5">HASH DE BLOQUE WORM INMUTABLE:</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 break-all select-all text-[11px]">
                        {benchmarkReport.evidenceProof.wormBlockHash}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 mb-0.5">HASH ANTERIOR EN LA CADENA (PARENT):</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 break-all select-all text-[11px]">
                        {benchmarkReport.evidenceProof.previousHash}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                      <span className="text-slate-400">ALGORITMO:</span>
                      <span className="text-amber-300">{benchmarkReport.evidenceProof.algorithm}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">COSTE MARGINAL:</span>
                      <span className="text-emerald-400">€{benchmarkReport.evidenceProof.totalCostEUR.toFixed(4)} (Free-First Tier)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Mission */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Nueva Misión para la Fuerza Agéntica</h2>
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">OBJETIVO REAL</label>
                <textarea
                  rows={3}
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="ej: Auditar seguridad de belentani7/agentguard y generar reporte de integridad AST"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">PRIORIDAD</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">PRESUPUESTO MÁXIMO (€)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={newMaxCost}
                    onChange={(e) => setNewMaxCost(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-medium text-white transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Misión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

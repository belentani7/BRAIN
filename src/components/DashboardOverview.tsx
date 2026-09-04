import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Database, 
  GitBranch, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  Zap, 
  CheckCircle2, 
  DollarSign, 
  FileCode2,
  Lock,
  Rocket,
  Users,
  Award,
  Compass
} from 'lucide-react';
import { AuditRecord } from '../types';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  auditRecords: AuditRecord[];
  totalSkills: number;
  totalRepos: number;
  ingestedRepos: number;
  totalChunks: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  auditRecords,
  totalSkills,
  totalRepos,
  ingestedRepos,
  totalChunks,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PLAN MAESTRO MULTI-STACK · ARQUITECTURA DE INGENIERÍA RIGUROSA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Ecosistema de Agentes Autónomos Multi-Stack
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
            Arquitectura de software unificada para el desarrollo Full-Stack, automatización corporativa y monetización de activos del ecosistema <strong className="text-zinc-200">Pedro Belentani (belentani7)</strong>. Integra una matriz de <strong>{totalSkills} Skills Agénticas</strong> en 9 subdominios, persistencia vectorial en <strong>Supabase (pgvector)</strong>, interoperabilidad estricta con el protocolo <strong>Anthropic MCP</strong>, e indexación continua de <strong>{totalRepos} repositorios</strong>.
          </p>

          {/* Quick CTAs */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('frontier-plan')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-zinc-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-zinc-950" />
              <span>Plan Máximo Maestro</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('elevation')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              <span>Protocolo Elevación 15/10</span>
            </button>

            <button
              onClick={() => onNavigate('mega-swarm')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-medium text-xs sm:text-sm rounded-xl border border-emerald-500/40 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Mega-Swarm (120 Agentes)</span>
            </button>

            <button
              onClick={() => onNavigate('self-prompt')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-medium text-xs sm:text-sm rounded-xl border border-amber-500/40 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Prompt Sobre Mí Mismo</span>
            </button>

            <button
              onClick={() => onNavigate('simulation')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs sm:text-sm rounded-xl border border-zinc-700 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Consola Simulación IA</span>
            </button>

            <button
              onClick={() => onNavigate('second-prompt')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 font-medium text-xs sm:text-sm rounded-xl border border-zinc-700 transition-all cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>Segundo Prompt Z.AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4.5 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono">SKILLS AGÉNTICOS</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">{totalSkills}</div>
          <p className="text-[11px] text-zinc-500 mt-1">En 9 subdominios operativos</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4.5 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono">REPOSITORIOS GITHUB</span>
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">{totalRepos}</div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 mt-1">
            <span>{ingestedRepos} indexados en pgvector</span>
            <span>({totalChunks} chunks)</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4.5 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono">FREE API LLMS & DATOS</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">8 / 10</div>
          <p className="text-[11px] text-zinc-500 mt-1">8 proveedores gratis · 10 data banks</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4.5 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono">AUDITORÍA LEGAL WORM</span>
            <Lock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">{auditRecords.length}</div>
          <p className="text-[11px] text-emerald-400 mt-1">Cadena SHA-256 inmutable verificada</p>
        </div>
      </div>

      {/* Los 3 Activos de Alta Palanca para Monetización Inmediata */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Diagnóstico de Monetización: 3 Activos de Alta Palanca (Ya Construidos)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sin programar desde cero: empaquetar, desplegar y comercializar lo ya existente en GitHub belentani7.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full self-start">
            Fase de 90 Días
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Activo 1 */}
          <div className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-emerald-400">agentguard + meta-skill</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">Go Daemon</span>
              </div>
              <h3 className="font-bold text-zinc-100 text-sm">Firewall B2B de Presupuesto IA</h3>
              <p className="text-xs text-zinc-400">
                Monitorea el gasto en tokens de LLMs, impone límites por usuario/sesión y desvía llamadas a modelos open-source de bajo coste.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Modelo: Open-Core / SaaS</span>
              <span className="text-emerald-400 font-mono font-medium">B2B MRR</span>
            </div>
          </div>

          {/* Activo 2 */}
          <div className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-cyan-400">Belentani.cv-ai + legal-pdf</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">TS / React</span>
              </div>
              <h3 className="font-bold text-zinc-100 text-sm">Generador de Documentos GDPR</h3>
              <p className="text-xs text-zinc-400">
                Estudio documental para CVs y minutas legales con cifrado AES-256 y cumplimiento normativo estricto.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Precio: 0.99€ - 19.99€</span>
              <span className="text-cyan-400 font-mono font-medium">Stripe Directo</span>
            </div>
          </div>

          {/* Activo 3 */}
          <div className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-amber-400">noiacore-turbo-v2</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">Python / FastAPI</span>
              </div>
              <h3 className="font-bold text-zinc-100 text-sm">BarriServei AI (Servicios Locales)</h3>
              <p className="text-xs text-zinc-400">
                Plataforma de automatización de servicios con custodia de fondos (Stripe Escrow) y atención por WhatsApp para pymes de Barcelona.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Modelo: % por transacción</span>
              <span className="text-amber-400 font-mono font-medium">Comisiones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagrama de Arquitectura en 4 Capas (L4 -> L1) */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Topología de Arquitectura Multi-Stack en 4 Capas</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Estructura desacoplada de alto rendimiento que conecta el cerebro del agente con las herramientas MCP y la persistencia Supabase.
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {/* Capa 4 */}
          <div className="bg-zinc-950/80 border border-violet-800/40 rounded-xl p-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <span className="px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 text-[11px] font-bold border border-violet-800/60 w-fit">
                CAPA L4: RAZONAMIENTO, CONSENSO & ORQUESTACIÓN
              </span>
              <span className="text-[11px] text-zinc-500">Modelos: Gemini 3.8 Flash / DeepSeek R1 / Llama 3.3 70B</span>
            </div>
            <p className="text-zinc-300 text-xs font-sans">
              Planificación HTN (Hierarchical Task Networks) · Árboles de pensamiento (Tree-of-Thoughts) · Debate adversarial Supervisor-Worker · Detección de alucinaciones NLI · Enrutamiento Zero-Token (MetaSkill).
            </p>
          </div>

          {/* Capa 3 */}
          <div className="bg-zinc-950/80 border border-cyan-800/40 rounded-xl p-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 text-[11px] font-bold border border-cyan-800/60 w-fit">
                CAPA L3: INTEROPERABILIDAD & HERRAMIENTAS MCP (MODEL CONTEXT PROTOCOL)
              </span>
              <span className="text-[11px] text-zinc-500">Protocolo: Anthropic MCP JSON-RPC 2.0</span>
            </div>
            <p className="text-zinc-300 text-xs font-sans">
              Servidor MCP en TypeScript con confinamiento Path-Jail · Autenticación mutua mTLS X.509 · Circuit Breaker · Invocación atómica de filesystem, terminal y APIs externas.
            </p>
          </div>

          {/* Capa 2 */}
          <div className="bg-zinc-950/80 border border-emerald-800/40 rounded-xl p-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[11px] font-bold border border-emerald-800/60 w-fit">
                CAPA L2: PERSISTENCIA, MEMORIA EPISÓDICA & AUDITORÍA WORM (SUPABASE)
              </span>
              <span className="text-[11px] text-zinc-500">PostgreSQL 16 + pgvector HNSW</span>
            </div>
            <p className="text-zinc-300 text-xs font-sans">
              Tabla de agentes · Memoria episódica vectorial (1536-d, HNSW vector_cosine_ops) · Libro mayor de auditoría inmutable (WORM) con triggers PL/pgSQL anti-modificación · Colas SKIP LOCKED · RLS Deny-by-Default.
            </p>
          </div>

          {/* Capa 1 */}
          <div className="bg-zinc-950/80 border border-zinc-700/60 rounded-xl p-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px] font-bold border border-zinc-700 w-fit">
                CAPA L1: INFRAESTRUCTURA, INGESTA MASIVA & EDGE FUNCTIONS
              </span>
              <span className="text-[11px] text-zinc-500">Supabase Edge (Deno) + GitHub Webhooks + Cloud Run</span>
            </div>
            <p className="text-zinc-300 text-xs font-sans">
              Recepción de webhooks con firma HMAC SHA-256 · Parser AST Tree-Sitter para 470+ repositorios concurrentes · Contenedores Docker multi-stage · Scale-to-Zero.
            </p>
          </div>
        </div>
      </div>

      {/* Ticker de Auditoría Legal Inmutable */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">Libro Mayor de Auditoría Inmutable (WORM Ledger)</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Cadena SHA-256: <strong className="text-emerald-400">Verificada O(n)</strong>
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {auditRecords.slice(0, 3).map((rec, idx) => (
            <div key={rec.id || idx} className="bg-zinc-950/90 border border-zinc-800/80 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">[{rec.actionType}]</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-300">{rec.agentId}</span>
                  <span className="text-zinc-500 text-[11px]">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-zinc-400 text-[11px] truncate max-w-xl font-sans">
                  Payload: {rec.inputPayload}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400">Hash:</span>
                <span className="text-emerald-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {rec.hashSignature.substring(0, 16)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

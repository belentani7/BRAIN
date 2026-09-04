import React from 'react';
import { 
  Terminal, 
  Cpu, 
  Database, 
  GitBranch, 
  ShieldCheck, 
  Sparkles, 
  FileCode2, 
  Clock, 
  ExternalLink,
  Users,
  Rocket,
  Award,
  Compass
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  auditCount: number;
  latestHash: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  auditCount,
  latestHash,
}) => {
  const navItems = [
    { id: 'overview', label: 'Resumen & Topología', icon: Terminal },
    { id: 'mission-os', label: 'Mission OS (Workforce)', icon: Rocket, badge: 'AGENT OS' },
    { id: 'reality-control', label: 'Reality Control Plane', icon: ShieldCheck, badge: 'Ω∞ REAL' },
    { id: 'frontier-plan', label: 'Plan Máximo Maestro', icon: Compass, badge: 'SOTA' },
    { id: 'mega-swarm', label: 'Mega-Swarm (120 Agentes)', icon: Users, badge: 'Swarm' },
    { id: 'elevation', label: 'Elevación 15/10', icon: Rocket, badge: '15/10' },
    { id: 'self-prompt', label: 'Prompt Sobre Mí Mismo', icon: Award, badge: 'Auto-Prompt' },
    { id: 'skills', label: 'Matriz 62+ Skills', icon: Cpu },
    { id: 'free-resources', label: 'Free LLMs & Datos', icon: Sparkles },
    { id: 'repos', label: 'Repositorios (500)', icon: GitBranch },
    { id: 'architecture', label: 'Arquitectura SQL/MCP', icon: Database },
    { id: 'lifecycle', label: 'Ciclo de Vida', icon: Clock },
    { id: 'simulation', label: 'Consola Agente IA', icon: ShieldCheck },
    { id: 'second-prompt', label: 'Segundo Prompt Z.AI', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      {/* Top Banner: Status & Hash Chain */}
      <div className="bg-zinc-900/90 px-4 py-1.5 border-b border-zinc-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-zinc-400">
          <span className="flex items-center text-emerald-400 font-mono font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            NEXUS-Ω KERNEL v1.2 · ONLINE
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline font-mono text-zinc-400">
            Ecosistema: <strong className="text-zinc-200">Pedro Belentani (belentani7)</strong>
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">
            Stack: <span className="text-emerald-400">Supabase + MCP + Deno + TS/Go</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span className="text-zinc-500">Bloques de Auditoría WORM:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
            #{auditCount}
          </span>
          <span className="hidden lg:inline text-zinc-500">Hash SHA-256:</span>
          <span className="hidden lg:inline text-zinc-400 truncate max-w-[140px]" title={latestHash}>
            {latestHash.substring(0, 16)}...
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black font-mono text-lg shadow-inner">
              Ω
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-zinc-100 tracking-tight">NEXUS-Ω</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-cyan-400 rounded border border-zinc-700">
                  MULTI-STACK
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Plan Maestro & Mission Control de Agentes</p>
            </div>
          </div>

          {/* Quick Actions / External link */}
          <div className="hidden lg:flex items-center space-x-2">
            <a
              href="https://github.com/belentani7"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>belentani7 (470 Repos)</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

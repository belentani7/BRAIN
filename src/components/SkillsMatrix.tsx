import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Layers, 
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SKILLS_DATA } from '../data/skillsData';
import { AgentSkill } from '../types';

export const SkillsMatrix: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubdomain, setSelectedSubdomain] = useState('all');
  const [selectedCriticality, setSelectedCriticality] = useState('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  // Subdominios únicos
  const subdomains = useMemo(() => {
    const map = new Map<string, number>();
    SKILLS_DATA.forEach((s) => {
      map.set(s.subdomain, (map.get(s.subdomain) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  // Filtrado reactivo
  const filteredSkills = useMemo(() => {
    return SKILLS_DATA.filter((skill) => {
      const matchesSubdomain = selectedSubdomain === 'all' || skill.subdomain === selectedSubdomain;
      const matchesCriticality = selectedCriticality === 'all' || skill.criticality === selectedCriticality;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        skill.name.toLowerCase().includes(q) ||
        skill.id.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.executionLogic.toLowerCase().includes(q) ||
        skill.tools.some((t) => t.toLowerCase().includes(q));

      return matchesSubdomain && matchesCriticality && matchesSearch;
    });
  }, [searchQuery, selectedSubdomain, selectedCriticality]);

  const toggleExpand = (id: string) => {
    setExpandedSkillId(expandedSkillId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Taxonomía Integral de 62+ Skills Agénticas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Matriz de competencias autónomas con lógica de ejecución desacoplada, esquemas de entrada/salida y herramientas MCP asociadas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg">
            {filteredSkills.length} de {SKILLS_DATA.length} habilidades activas
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Subdomain Chips */}
      <div className="space-y-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, ID (ej. RAZ-01, SEG-06), herramienta o lógica..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Criticality Filter */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Todas las Criticidades</option>
              <option value="Critical">Crítica (Enterprise)</option>
              <option value="High">Alta</option>
              <option value="Medium">Media</option>
            </select>
          </div>
        </div>

        {/* Subdomain Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedSubdomain('all')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
              selectedSubdomain === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                : 'bg-zinc-950/70 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Todos los Subdominios ({SKILLS_DATA.length})
          </button>

          {subdomains.map((sub) => (
            <button
              key={sub.name}
              onClick={() => setSelectedSubdomain(sub.name)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                selectedSubdomain === sub.name
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'bg-zinc-950/70 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {sub.name} ({sub.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Skills Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill: AgentSkill) => {
          const isExpanded = expandedSkillId === skill.id;

          const criticalityBadge = {
            Critical: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
            High: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
            Medium: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
          }[skill.criticality];

          return (
            <div
              key={skill.id}
              className={`bg-zinc-900/80 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                isExpanded
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header: ID, Subdomain, Criticality */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                    {skill.id}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${criticalityBadge}`}>
                      {skill.criticality}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      Fase {skill.phase}
                    </span>
                  </div>
                </div>

                {/* Name & Subdomain */}
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm leading-snug">{skill.name}</h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{skill.subdomain}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 line-clamp-2">{skill.description}</p>

                {/* Tools List Preview */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
                    <Wrench className="w-3 h-3 text-cyan-400" />
                    <span>Herramientas MCP ({skill.tools.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skill.tools.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800"
                      >
                        {t}
                      </span>
                    ))}
                    {skill.tools.length > 3 && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        +{skill.tools.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Execution Logic */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold block mb-1">
                        LÓGICA DE EJECUCIÓN:
                      </span>
                      <p className="text-zinc-300 text-xs leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80 font-mono">
                        {skill.executionLogic}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                      <span>Complejidad: <strong className="text-zinc-300">{skill.complexity}</strong></span>
                      <span>Módulo MCP: <strong className="text-cyan-400">{skill.tools[0] || 'std'}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expand / Collapse Button */}
              <button
                onClick={() => toggleExpand(skill.id)}
                className="mt-4 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 hover:text-emerald-400 transition-colors w-full cursor-pointer"
              >
                <span>{isExpanded ? 'Ocultar Lógica Interna' : 'Ver Lógica & Detalles'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-xl">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm text-zinc-300 font-medium">No se encontraron habilidades con los filtros aplicados</p>
          <p className="text-xs text-zinc-500 mt-1">Prueba a limpiar la búsqueda o cambiar el subdominio.</p>
        </div>
      )}
    </div>
  );
};

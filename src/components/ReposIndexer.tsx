import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Search, 
  Play, 
  CheckCircle2, 
  Clock, 
  Code2, 
  Lock, 
  Globe, 
  Sparkles, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { RepoItem } from '../types';

interface ReposIndexerProps {
  onIngestionCompleted?: (totalIngested: number, auditHash: string) => void;
}

export const ReposIndexer: React.FC<ReposIndexerProps> = ({ onIngestionCompleted }) => {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedVis, setSelectedVis] = useState('all');
  const [stats, setStats] = useState({
    totalRepos: 500,
    totalIngested: 170,
    totalChunks: 8200,
    languagesCount: {} as Record<string, number>,
  });
  const [ingesting, setIngesting] = useState(false);
  const [lastBatchMessage, setLastBatchMessage] = useState<string | null>(null);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        lang: selectedLang,
        visibility: selectedVis,
        search,
      });

      const res = await fetch(`/api/repos?${params.toString()}`);
      const data = await res.json();
      setRepos(data.repos || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching repos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, [page, selectedLang, selectedVis, search]);

  const handleBatchIngest = async () => {
    setIngesting(true);
    setLastBatchMessage(null);
    try {
      const res = await fetch('/api/repos/ingest-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10 }),
      });
      const data = await res.json();
      if (data.success) {
        setLastBatchMessage(`Lote procesado: ${data.processed} repositorios indexados en AST y pgvector.`);
        fetchRepos();
        if (onIngestionCompleted) {
          onIngestionCompleted(data.totalIngested, data.auditHash);
        }
      }
    } catch (err) {
      console.error('Error en ingesta por lote:', err);
    } finally {
      setIngesting(false);
    }
  };

  const languageColors: Record<string, string> = {
    TypeScript: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    Python: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40',
    HTML: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
    JavaScript: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    Go: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40',
    Shell: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    PowerShell: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40',
    Rust: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Índice de 500 Repositorios (GitHub belentani7 + Open Source)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            470 repositorios propios del corpus de Pedro Belentani + 30 repositorios agénticos líderes mundiales.
          </p>
        </div>

        {/* Action Button: Batch Ingestion */}
        <button
          onClick={handleBatchIngest}
          disabled={ingesting}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
        >
          {ingesting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Extrayendo AST & Embeddings...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Disparar Ingesta AST por Lote (+10)</span>
            </>
          )}
        </button>
      </div>

      {lastBatchMessage && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastBatchMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-500 block">TOTAL REPOSITORIOS</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">{stats.totalRepos}</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">470 belentani7 · 30 OSS</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-500 block">INDEXADOS EN PGVECTOR</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {stats.totalIngested} / {stats.totalRepos}
          </span>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((stats.totalIngested / stats.totalRepos) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-500 block">CHUNKS AST GENERADOS</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">{stats.totalChunks}</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">Segmentación semántica Tree-Sitter</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-mono text-zinc-500 block">LENGUAJE DOMINANTE</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">TypeScript / Python</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">155 TS · 95 HTML · 86 Python</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre de repositorio (ej: agentguard, cv-ai, noiacore)..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Language Filter */}
        <select
          value={selectedLang}
          onChange={(e) => {
            setSelectedLang(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">Todos los Lenguajes</option>
          <option value="TypeScript">TypeScript</option>
          <option value="Python">Python</option>
          <option value="HTML">HTML</option>
          <option value="Go">Go</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Shell">Shell / Bash</option>
          <option value="PowerShell">PowerShell</option>
        </select>

        {/* Visibility Filter */}
        <select
          value={selectedVis}
          onChange={(e) => {
            setSelectedVis(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">Todas las Visibilidades</option>
          <option value="public">Públicos</option>
          <option value="private">Privados</option>
        </select>
      </div>

      {/* Repositories Table / Cards */}
      <div className="space-y-2.5">
        {repos.map((repo) => {
          const langBadge = languageColors[repo.language] || 'text-zinc-400 bg-zinc-900 border-zinc-800';

          return (
            <div
              key={repo.id}
              className="bg-zinc-900/60 border border-zinc-800/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://github.com/${repo.fullName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-zinc-100 hover:text-cyan-400 transition-colors text-sm flex items-center space-x-1.5"
                  >
                    <span>{repo.fullName}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${langBadge}`}>
                    {repo.language}
                  </span>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 flex items-center space-x-1">
                    {repo.visibility === 'private' ? (
                      <>
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>Privado</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Público</span>
                      </>
                    )}
                  </span>

                  {repo.stars !== undefined && repo.stars > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">
                      ★ {repo.stars}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 font-sans truncate">{repo.description}</p>

                {/* Topics */}
                <div className="flex flex-wrap gap-1">
                  {repo.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingestion & Vector Metrics */}
              <div className="flex items-center space-x-4 shrink-0 font-mono text-xs pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                <div className="text-right">
                  <span className="text-zinc-500 text-[10px] block">ESTADO AST</span>
                  {repo.astParsed ? (
                    <span className="text-emerald-400 text-[11px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 inline" />
                      <span>Parseado</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[11px]">Pendiente</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-zinc-500 text-[10px] block">CHUNKS / EMBEDDINGS</span>
                  <span className="text-cyan-400 text-[11px] font-bold">
                    {repo.chunksCount} / {repo.embeddingsCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {repos.length === 0 && !loading && (
          <div className="text-center py-10 bg-zinc-900/40 border border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-400">No se encontraron repositorios con esos filtros.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
        <span>
          Mostrando página <strong className="text-zinc-200">{page}</strong> de{' '}
          <strong className="text-zinc-200">{totalPages}</strong> ({totalCount} repositorios)
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  FileCode2, 
  ShieldCheck, 
  Server, 
  GitPullRequest, 
  Users 
} from 'lucide-react';
import { ARCHITECTURE_ARTIFACTS } from '../data/architectureArtifacts';
import { ArchitectureArtifact } from '../types';

export const ArchitectureViewer: React.FC = () => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(ARCHITECTURE_ARTIFACTS[0].id);
  const [copied, setCopied] = useState(false);

  const currentArtifact = ARCHITECTURE_ARTIFACTS.find((a) => a.id === selectedArtifactId) || ARCHITECTURE_ARTIFACTS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentArtifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'art-01': return Database;
      case 'art-02': return Server;
      case 'art-03': return GitPullRequest;
      case 'art-04': return Users;
      default: return FileCode2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Arquitectura de Persistencia Supabase & Servidores MCP
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Artefactos técnicos listos para producción: SQL con pgvector HNSW, WORM ledger, servidor MCP confinado y webhooks HMAC.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium rounded-xl transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Código Copiado al Portapapeles</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>Copiar Artefacto Completo</span>
            </>
          )}
        </button>
      </div>

      {/* Artifact Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {ARCHITECTURE_ARTIFACTS.map((art: ArchitectureArtifact) => {
          const Icon = getIcon(art.id);
          const isSelected = art.id === selectedArtifactId;

          return (
            <button
              key={art.id}
              onClick={() => setSelectedArtifactId(art.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span className={`text-xs font-mono font-bold truncate ${isSelected ? 'text-zinc-100' : 'text-zinc-400'}`}>
                  {art.filename}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 self-start">
                {art.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Artifact Details Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-200">{currentArtifact.title}</h2>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            {currentArtifact.badge}
          </span>
        </div>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          {currentArtifact.description}
        </p>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-zinc-400 text-xs font-mono ml-2">{currentArtifact.filename}</span>
          </div>

          <span className="text-[11px] text-zinc-500 font-mono">
            {currentArtifact.code.split('\n').length} líneas · UTF-8
          </span>
        </div>

        {/* Code Content */}
        <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed max-h-[580px] overflow-y-auto">
          <code>{currentArtifact.code}</code>
        </pre>
      </div>
    </div>
  );
};

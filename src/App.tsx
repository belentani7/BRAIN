/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { SkillsMatrix } from './components/SkillsMatrix';
import { FreeResourcesRadar } from './components/FreeResourcesRadar';
import { ReposIndexer } from './components/ReposIndexer';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { LifecycleTimeline } from './components/LifecycleTimeline';
import { SimulationConsole } from './components/SimulationConsole';
import { SecondPromptView } from './components/SecondPromptView';
import { MegaSwarmView } from './components/MegaSwarmView';
import { SelfPromptView } from './components/SelfPromptView';
import { EnterpriseElevationView } from './components/EnterpriseElevationView';
import { FrontierMasterPlanView } from './components/FrontierMasterPlanView';
import { RealityControlPlane } from './components/RealityControlPlane';
import { MissionOSView } from './components/MissionOSView';
import { AuditRecord, SimulationPlan } from './types';
import { SKILLS_DATA } from './data/skillsData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [latestHash, setLatestHash] = useState('8f4c2b9a7d3e1f0e6c5b4a3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f');
  const [ingestedRepos, setIngestedRepos] = useState(170);
  const [totalChunks, setTotalChunks] = useState(8200);

  // Fetch initial audit records and stats from backend
  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch('/api/audit-log');
        if (res.ok) {
          const data = await res.json();
          if (data.records) setAuditRecords(data.records);
          if (data.latestHash) setLatestHash(data.latestHash);
        }
      } catch (err) {
        console.warn('Error fetching audit log:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/repos?page=1&limit=1');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setIngestedRepos(data.stats.totalIngested);
            setTotalChunks(data.stats.totalChunks);
          }
        }
      } catch (err) {
        console.warn('Error fetching repo stats:', err);
      }
    };

    fetchAudit();
    fetchStats();
  }, []);

  const handlePlanGenerated = (_plan: SimulationPlan, auditRecord: AuditRecord) => {
    setAuditRecords((prev) => [auditRecord, ...prev]);
    setLatestHash(auditRecord.hashSignature);
  };

  const handleIngestionCompleted = (newTotalIngested: number, auditHash: string) => {
    setIngestedRepos(newTotalIngested);
    setTotalChunks((prev) => prev + 540);
    setLatestHash(auditHash);

    // Refresh audit log from server
    fetch('/api/audit-log')
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setAuditRecords(data.records);
      })
      .catch((e) => console.error(e));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-900 selection:text-emerald-200">
      {/* Navbar with status & navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auditCount={auditRecords.length}
        latestHash={latestHash}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            onNavigate={setActiveTab}
            auditRecords={auditRecords}
            totalSkills={SKILLS_DATA.length}
            totalRepos={500}
            ingestedRepos={ingestedRepos}
            totalChunks={totalChunks}
          />
        )}

        {activeTab === 'mission-os' && (
          <MissionOSView
            latestHash={latestHash}
            onAuditUpdated={(rec) => {
              setAuditRecords((prev) => [rec, ...prev]);
              setLatestHash(rec.hashSignature);
            }}
          />
        )}

        {activeTab === 'reality-control' && (
          <RealityControlPlane
            latestHash={latestHash}
            onAuditUpdated={(rec) => {
              setAuditRecords((prev) => [rec, ...prev]);
              setLatestHash(rec.hashSignature);
            }}
          />
        )}

        {activeTab === 'frontier-plan' && (
          <FrontierMasterPlanView
            latestHash={latestHash}
            onPlanApplied={(rec) => {
              setAuditRecords((prev) => [rec, ...prev]);
              setLatestHash(rec.hashSignature);
            }}
          />
        )}

        {activeTab === 'mega-swarm' && (
          <MegaSwarmView onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'elevation' && (
          <EnterpriseElevationView
            latestHash={latestHash}
            onElevationExecuted={(rec) => {
              setAuditRecords((prev) => [rec, ...prev]);
              setLatestHash(rec.hashSignature);
            }}
          />
        )}

        {activeTab === 'self-prompt' && <SelfPromptView />}

        {activeTab === 'skills' && <SkillsMatrix />}

        {activeTab === 'free-resources' && <FreeResourcesRadar />}

        {activeTab === 'repos' && (
          <ReposIndexer onIngestionCompleted={handleIngestionCompleted} />
        )}

        {activeTab === 'architecture' && <ArchitectureViewer />}

        {activeTab === 'lifecycle' && <LifecycleTimeline />}

        {activeTab === 'simulation' && (
          <SimulationConsole onPlanGenerated={handlePlanGenerated} />
        )}

        {activeTab === 'second-prompt' && <SecondPromptView />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">NEXUS-Ω</span>
            <span>·</span>
            <span>Ecosistema de Agentes Autónomos Multi-Stack</span>
            <span>·</span>
            <span className="text-zinc-400">Pedro Belentani (belentani7)</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('second-prompt')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Segundo Prompt Z.AI
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:text-zinc-300 cursor-pointer"
            >
              PostgreSQL pgvector DDL
            </button>
            <span>·</span>
            <span>Hash Ledger: SHA-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


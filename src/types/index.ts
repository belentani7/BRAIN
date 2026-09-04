export type SubDomain =
  | 'Razonamiento'
  | 'Full-Stack'
  | 'Persistencia'
  | 'MCP'
  | 'Seguridad'
  | 'DevOps'
  | 'Scraping'
  | 'Finanzas'
  | 'Soporte';

export interface AgentSkill {
  id: string;
  subdomain: SubDomain;
  name: string;
  description: string;
  executionLogic: string;
  tools: string[];
  complexity: 'L1 - Baja' | 'L2 - Media' | 'L3 - Alta' | 'L4 - Crítica';
  phase: 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4';
  criticality: 'Standard' | 'High' | 'Critical';
}

export interface RepoItem {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  visibility: 'public' | 'private';
  size: number;
  topics: string[];
  ingested: boolean;
  chunksCount: number;
  embeddingsCount: number;
  astParsed: boolean;
  source: 'belentani7' | 'top500_open_source';
  stars?: number;
}

export interface FreeApiLlm {
  id: string;
  provider: string;
  models: string[];
  limits: string;
  freeTierDetails: string;
  rpm: string;
  contextWindow: string;
  requiresCreditCard: boolean;
  endpoint: string;
  sdkOrCurl: string;
  bestFor: string;
}

export interface FreeDataBank {
  id: string;
  name: string;
  category: 'NLP & Datasets' | 'Ciencia & Papers' | 'Web & Archivos' | 'Código & Software' | 'Datos Públicos & Gov';
  recordsCount: string;
  license: string;
  format: string;
  url: string;
  description: string;
  agentUseCases: string;
}

export interface ArchitectureArtifact {
  id: string;
  title: string;
  filename: string;
  language: 'sql' | 'typescript' | 'json';
  badge: string;
  description: string;
  code: string;
}

export interface SimulationStep {
  step: number;
  action: string;
  skillId: string;
  skillName: string;
  tool: string;
  status: 'completed' | 'in_progress' | 'pending';
  output: string;
}

export interface SimulationPlan {
  id: string;
  objective: string;
  timestamp: string;
  confidence: number;
  selectedSkills: string[];
  phases: string[];
  steps: SimulationStep[];
  auditHash: string;
  previousHash?: string;
  summary: string;
}

export interface LifecycleMilestone {
  id: string;
  title: string;
  deliverables: string[];
  risk: string;
  status: 'completed' | 'active' | 'scheduled';
}

export interface LifecyclePhase {
  phase: number;
  title: string;
  duration: string;
  goal: string;
  milestones: LifecycleMilestone[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  agentId: string;
  actionType: string;
  inputPayload: string;
  outputPayload: string;
  hashSignature: string;
  previousHash: string;
  verified: boolean;
}

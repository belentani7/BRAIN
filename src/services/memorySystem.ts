// NEXUS-Ω Real Three-Tier Memory System
// Short-Term (Execution context) + Episodic (Experiences) + Semantic (Consolidated knowledge)
// Vector retrieval with cosine similarity, deduplication, and provenance tracking.

import { LocalEmbeddingProvider, cosineSimilarity, VectorEmbedding } from './embeddingProvider';

export interface EpisodicMemory {
  id: string;
  task: string;
  action: string;
  result: string;
  error?: string;
  resolution?: string;
  timestamp: string;
  embedding: VectorEmbedding;
}

export interface SemanticFact {
  id: string;
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  provenance: string;
  timestamp: string;
  embedding: VectorEmbedding;
}

export class MemorySystem {
  private shortTermContext: Map<string, any> = new Map();
  private episodicStore: EpisodicMemory[] = [];
  private semanticStore: SemanticFact[] = [];
  private embeddingProvider: LocalEmbeddingProvider;

  constructor(dimensions: number = 384) {
    this.embeddingProvider = new LocalEmbeddingProvider(dimensions);
    this.seedFoundationalKnowledge();
  }

  // --- Short-term Memory ---
  setShortTerm(key: string, value: any): void {
    this.shortTermContext.set(key, value);
  }

  getShortTerm(key: string): any {
    return this.shortTermContext.get(key);
  }

  clearShortTerm(): void {
    this.shortTermContext.clear();
  }

  // --- Episodic Memory ---
  async storeEpisodic(item: Omit<EpisodicMemory, 'id' | 'timestamp' | 'embedding'>): Promise<EpisodicMemory> {
    const textToEmbed = `${item.task} ${item.action} ${item.result} ${item.error || ''} ${item.resolution || ''}`;
    const embedding = await this.embeddingProvider.embedText(textToEmbed);

    const record: EpisodicMemory = {
      ...item,
      id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      embedding,
    };

    this.episodicStore.unshift(record);
    if (this.episodicStore.length > 500) {
      this.episodicStore.pop(); // Keep bounded in memory
    }
    return record;
  }

  // --- Semantic Memory ---
  async storeSemantic(fact: Omit<SemanticFact, 'id' | 'timestamp' | 'embedding'>): Promise<SemanticFact> {
    // Check for duplicates
    const existing = this.semanticStore.find(
      (f) => f.subject.toLowerCase() === fact.subject.toLowerCase() && f.relation.toLowerCase() === fact.relation.toLowerCase()
    );
    if (existing) {
      existing.object = fact.object;
      existing.confidence = Math.max(existing.confidence, fact.confidence);
      existing.provenance = fact.provenance;
      existing.timestamp = new Date().toISOString();
      return existing;
    }

    const textToEmbed = `${fact.subject} ${fact.relation} ${fact.object}`;
    const embedding = await this.embeddingProvider.embedText(textToEmbed);

    const record: SemanticFact = {
      ...fact,
      id: `sem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      embedding,
    };

    this.semanticStore.push(record);
    return record;
  }

  // Hybrid vector similarity and keyword retrieval
  async retrieve(query: string, topK: number = 5): Promise<{
    episodic: Array<{ item: EpisodicMemory; score: number }>;
    semantic: Array<{ fact: SemanticFact; score: number }>;
  }> {
    const queryEmbedding = await this.embeddingProvider.embedText(query);
    const queryTerms = query.toLowerCase().split(/\s+/);

    // Score Episodic
    const episodicScored = this.episodicStore.map((ep) => {
      const vecSim = cosineSimilarity(queryEmbedding.vector, ep.embedding.vector);
      // Keyword boost
      const fullText = `${ep.task} ${ep.action} ${ep.result}`.toLowerCase();
      let kwBoost = 0;
      for (const t of queryTerms) {
        if (fullText.includes(t)) kwBoost += 0.05;
      }
      return { item: ep, score: Number(Math.min(1.0, vecSim + kwBoost).toFixed(4)) };
    });

    episodicScored.sort((a, b) => b.score - a.score);

    // Score Semantic
    const semanticScored = this.semanticStore.map((sm) => {
      const vecSim = cosineSimilarity(queryEmbedding.vector, sm.embedding.vector);
      const fullText = `${sm.subject} ${sm.relation} ${sm.object}`.toLowerCase();
      let kwBoost = 0;
      for (const t of queryTerms) {
        if (fullText.includes(t)) kwBoost += 0.05;
      }
      return { fact: sm, score: Number(Math.min(1.0, vecSim + kwBoost).toFixed(4)) };
    });

    semanticScored.sort((a, b) => b.score - a.score);

    return {
      episodic: episodicScored.slice(0, topK),
      semantic: semanticScored.slice(0, topK),
    };
  }

  getStats() {
    return {
      shortTermKeys: this.shortTermContext.size,
      episodicCount: this.episodicStore.length,
      semanticCount: this.semanticStore.length,
      vectorDimension: this.embeddingProvider.dimensions,
    };
  }

  private async seedFoundationalKnowledge(): Promise<void> {
    const seeds = [
      { subject: 'NEXUS-Ω', relation: 'operatesOn', object: 'Docker Container Port 3000 Ingress', confidence: 0.99, provenance: 'Environment constraints' },
      { subject: 'AgentGuard', relation: 'enforcesHardLimitOn', object: 'AI token consumption via Go static daemon', confidence: 0.95, provenance: 'belentani7/agentguard' },
      { subject: 'Supabase', relation: 'isolatesTenantsWith', object: 'PostgreSQL Row Level Security deny-by-default', confidence: 0.98, provenance: 'architectureArtifacts.ts' },
      { subject: 'AuditLedger', relation: 'ensuresIntegrityVia', object: 'Chained SHA-256 hash proofs (WORM compliant)', confidence: 0.99, provenance: 'Protocol Ω∞' },
      { subject: 'SWE-bench', relation: 'requiresForAutonomousRepair', object: 'Deterministic AST analysis and ephemeral git worktree sandboxes', confidence: 0.94, provenance: 'Research Insights 2026' },
    ];

    for (const s of seeds) {
      await this.storeSemantic(s);
    }
  }
}

export const globalMemorySystem = new MemorySystem();

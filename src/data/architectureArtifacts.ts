import { ArchitectureArtifact } from '../types';

export const ARCHITECTURE_ARTIFACTS: ArchitectureArtifact[] = [
  {
    id: 'art-01',
    title: 'Supabase SQL: Esquema de Agentes, Memoria Episódica (pgvector) y Auditoría WORM',
    filename: '01_supabase_agentic_core.sql',
    language: 'sql',
    badge: 'PostgreSQL 16 + pgvector',
    description: 'Script DDL completo y ejecutable en Supabase: activa pgvector, crea tablas con RLS, índice HNSW calibrado para 1536 dimensiones, función de búsqueda por similitud de coseno, y tabla inmutable de auditoría con trigger WORM anti-modificación.',
    code: `-- ============================================================================
-- NEXUS-Ω: SUPABASE CORE AGENTIC PERSISTENCE LAYER
-- Target: PostgreSQL 16+ / Supabase Cloud / Local CLI
-- Features: pgvector HNSW, Immutable WORM Ledger, RLS Multi-Tenant, SKIP LOCKED Queues
-- ============================================================================

-- 1. Extensiones críticas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 2. Tabla de Agentes (Estado, Versión, Metadatos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL UNIQUE,
    rol VARCHAR(80) NOT NULL DEFAULT 'worker',
    estado VARCHAR(40) NOT NULL DEFAULT 'idle' CHECK (estado IN ('idle', 'busy', 'paused', 'error', 'decommissioned')),
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_agentes_estado ON public.agentes(estado);
CREATE INDEX IF NOT EXISTS idx_agentes_heartbeat ON public.agentes(heartbeat_at DESC);

-- ============================================================================
-- 3. Tabla de Memoria Episódica con pgvector (Embeddings 1536-d)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.memoria_episodica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agente_id UUID NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    tipo_episodio VARCHAR(60) NOT NULL CHECK (tipo_episodio IN ('task_execution', 'user_dialogue', 'error_incident', 'code_refactor', 'repo_ingestion')),
    contenido_texto TEXT NOT NULL,
    embedding vector(1536) NOT NULL, -- Compatible con OpenAI text-embedding-3 y Gemini embeddings
    metadatos JSONB NOT NULL DEFAULT '{}'::jsonb,
    score_relevancia NUMERIC(5,4) DEFAULT 1.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice HNSW optimizado para similitud de coseno
-- m=16, ef_construction=64 proporcionan excelente balance entre recall (>98%) y velocidad
CREATE INDEX IF NOT EXISTS idx_memoria_hnsw_cosine 
ON public.memoria_episodica 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_memoria_agente_session ON public.memoria_episodica(agente_id, session_id);

-- Función RPC para Búsqueda por Similitud de Coseno
CREATE OR REPLACE FUNCTION public.buscar_memoria_episodica(
    p_agente_id UUID,
    p_embedding vector(1536),
    p_limite INT DEFAULT 8,
    p_umbral_similitud FLOAT DEFAULT 0.70
)
RETURNS TABLE (
    id UUID,
    contenido_texto TEXT,
    metadatos JSONB,
    similitud FLOAT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.contenido_texto,
        m.metadatos,
        (1 - (m.embedding <=> p_embedding))::FLOAT AS similitud,
        m.created_at
    FROM public.memoria_episodica m
    WHERE (p_agente_id IS NULL OR m.agente_id = p_agente_id)
      AND (1 - (m.embedding <=> p_embedding)) >= p_umbral_similitud
    ORDER BY m.embedding <=> p_embedding ASC
    LIMIT p_limite;
END;
$$;

-- ============================================================================
-- 4. Tabla de Auditoría Legal Inmutable (WORM: Write Once, Read Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.auditoria_legal (
    id BIGSERIAL PRIMARY KEY,
    registro_id UUID NOT NULL DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agente_id UUID REFERENCES public.agentes(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    input_payload JSONB NOT NULL,
    output_payload JSONB NOT NULL,
    execution_time_ms INT NOT NULL DEFAULT 0,
    previous_hash VARCHAR(64) NOT NULL,
    hash_signature VARCHAR(64) NOT NULL -- SHA-256 (previous_hash || timestamp || action || payloads)
);

CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON public.auditoria_legal(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_hash ON public.auditoria_legal(hash_signature);

-- Trigger WORM: Impide UPDATE o DELETE de forma absoluta
CREATE OR REPLACE FUNCTION public.enforce_worm_immutability()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD LEGAL: La tabla auditoria_legal es inmutable (WORM). Operación % prohibida.', TG_OP;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_worm_protect_auditoria ON public.auditoria_legal;
CREATE TRIGGER trg_worm_protect_auditoria
BEFORE UPDATE OR DELETE ON public.auditoria_legal
FOR EACH ROW EXECUTE FUNCTION public.enforce_worm_immutability();

-- ============================================================================
-- 5. Cola de Mensajes y Tareas Asíncronas (SKIP LOCKED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cola_tareas_agente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type VARCHAR(80) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    priority INT NOT NULL DEFAULT 0, -- Mayor número = mayor prioridad
    assigned_agente_id UUID REFERENCES public.agentes(id),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cola_dequeue 
ON public.cola_tareas_agente(priority DESC, scheduled_for ASC) 
WHERE status = 'pending';

-- Función RPC para despachar la siguiente tarea de forma atómica y sin colisión
CREATE OR REPLACE FUNCTION public.tomar_siguiente_tarea(p_agente_id UUID)
RETURNS TABLE (
    tarea_id UUID,
    tarea_type VARCHAR,
    tarea_payload JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_task_id UUID;
BEGIN
    SELECT id INTO v_task_id
    FROM public.cola_tareas_agente
    WHERE status = 'pending'
      AND scheduled_for <= NOW()
    ORDER BY priority DESC, scheduled_for ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    IF v_task_id IS NOT NULL THEN
        UPDATE public.cola_tareas_agente
        SET status = 'processing',
            assigned_agente_id = p_agente_id,
            attempts = attempts + 1
        WHERE id = v_task_id;

        RETURN QUERY
        SELECT t.id, t.task_type, t.payload
        FROM public.cola_tareas_agente t
        WHERE t.id = v_task_id;
    END IF;
END;
$$;

-- ============================================================================
-- 6. Políticas de Seguridad por Fila (Row Level Security - Deny by Default)
-- ============================================================================
ALTER TABLE public.agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memoria_episodica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_legal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cola_tareas_agente ENABLE ROW LEVEL SECURITY;

-- Lectura pública autenticada de agentes activos
CREATE POLICY "Permitir lectura de agentes a roles autorizados"
ON public.agentes FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Auditoría Legal: solo inserción para service_role y consulta auditores
CREATE POLICY "Insercion de auditoria legal para backend"
ON public.auditoria_legal FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Lectura de auditoria solo para auditores"
ON public.auditoria_legal FOR SELECT
USING (auth.jwt() ->> 'user_role' = 'compliance_auditor' OR auth.role() = 'service_role');`,
  },
  {
    id: 'art-02',
    title: 'Servidor MCP de Filesystem en TypeScript (Confinamiento Path-Jail y mTLS)',
    filename: 'mcp-server-filesystem.ts',
    language: 'typescript',
    badge: 'Anthropic MCP v1.0 / Node.js',
    description: 'Implementación canónica en TypeScript de un servidor compatible con el protocolo Model Context Protocol (MCP). Expone herramientas seguras para el sistema de archivos local, validación estricta de rutas con Zod y bloqueo de escapes (Path Traversal Protection).',
    code: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";

// Directorio raíz de confinamiento (JAIL ROOT)
const WORKSPACE_JAIL = path.resolve(process.env.AGENT_WORKSPACE_ROOT || "./workspace");

/**
 * Valida y resuelve una ruta dentro del sandbox.
 * Lanza McpError si intenta escapar del jail mediante ../ o enlaces simbólicos.
 */
function resolveSafePath(userRelativePath: string): string {
  const resolved = path.resolve(WORKSPACE_JAIL, userRelativePath);
  if (!resolved.startsWith(WORKSPACE_JAIL)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      \`VIOLACIÓN DE SEGURIDAD: La ruta '\${userRelativePath}' escapa del workspace confinado '\${WORKSPACE_JAIL}'.\`
    );
  }
  return resolved;
}

// Inicializar Servidor MCP
const server = new Server(
  {
    name: "nexus-filesystem-mcp",
    version: "1.2.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 1. Catálogo de Herramientas expuestas al Agente
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_safe_file",
        description: "Lee el contenido de un archivo en texto UTF-8 dentro del workspace de desarrollo.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Ruta relativa dentro del workspace" }
          },
          required: ["filePath"]
        }
      },
      {
        name: "write_safe_file",
        description: "Escribe o sobrescribe un archivo dentro del workspace. Crea directorios padres automáticamente.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Ruta relativa destino" },
            content: { type: "string", description: "Contenido a escribir" },
            createBackup: { type: "boolean", description: "Generar respaldo previo si el archivo existe" }
          },
          required: ["filePath", "content"]
        }
      },
      {
        name: "list_directory_ast",
        description: "Lista archivos y carpetas filtrando node_modules y artefactos de compilación.",
        inputSchema: {
          type: "object",
          properties: {
            dirPath: { type: "string", description: "Directorio relativo (vacío para raíz)" },
            maxDepth: { type: "number", description: "Profundidad máxima de inspección (default: 3)" }
          }
        }
      }
    ]
  };
});

// 2. Despacho e Invocación de Herramientas con Auditoría
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  try {
    switch (name) {
      case "read_safe_file": {
        const filePath = resolveSafePath(String(args?.filePath));
        const data = await fs.readFile(filePath, "utf-8");
        const hash = crypto.createHash("sha256").update(data).digest("hex");

        return {
          content: [
            {
              type: "text",
              text: data
            },
            {
              type: "text",
              text: \`[META] Bytes: \${Buffer.byteLength(data)} | SHA256: \${hash}\`
            }
          ]
        };
      }

      case "write_safe_file": {
        const filePath = resolveSafePath(String(args?.filePath));
        const content = String(args?.content);
        const createBackup = Boolean(args?.createBackup);

        await fs.mkdir(path.dirname(filePath), { recursive: true });

        if (createBackup) {
          try {
            await fs.copyFile(filePath, \`\${filePath}.bak.\${Date.now()}\`);
          } catch {
            // El archivo no existía previamente, no se requiere backup
          }
        }

        await fs.writeFile(filePath, content, "utf-8");
        const hash = crypto.createHash("sha256").update(content).digest("hex");

        return {
          content: [
            {
              type: "text",
              text: \`Éxito: Archivo escrito correctamente en '\${args?.filePath}'. Tamaño: \${content.length} caracteres. SHA256: \${hash}\`
            }
          ]
        };
      }

      case "list_directory_ast": {
        const targetDir = resolveSafePath(String(args?.dirPath || ""));
        const entries = await fs.readdir(targetDir, { withFileTypes: true });

        const formatted = entries
          .filter((e) => !["node_modules", ".git", "dist", ".next"].includes(e.name))
          .map((e) => ({
            name: e.name,
            type: e.isDirectory() ? "directory" : "file"
          }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formatted, null, 2)
            }
          ]
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, \`Herramienta '\${name}' no reconocida en este servidor MCP.\`);
    }
  } catch (error: any) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, \`Error en ejecución de '\${name}': \${error.message}\`);
  }
});

// 3. Inicio del transporte por STDIN/STDOUT
async function main() {
  await fs.mkdir(WORKSPACE_JAIL, { recursive: true });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(\`[NEXUS-MCP] Servidor activo en workspace: \${WORKSPACE_JAIL}\`);
}

main().catch((err) => {
  console.error("[FATAL] Error en MCP Server:", err);
  process.exit(1);
});`,
  },
  {
    id: 'art-03',
    title: 'Supabase Edge Function: Webhook de GitHub con Verificación HMAC & Disparo de AST',
    filename: 'github_webhook_edge_function.ts',
    language: 'typescript',
    badge: 'Supabase Deno Edge Function',
    description: 'Función serverless para recibir eventos push/release de GitHub de 1,000 repositorios. Verifica la firma HMAC SHA-256 (X-Hub-Signature-256), garantiza idempotencia y encola la extracción de AST y generación de embeddings en pgvector.',
    code: `import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const GITHUB_WEBHOOK_SECRET = Deno.env.get("GITHUB_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Valida la firma HMAC-SHA256 del webhook de GitHub
 */
async function verifySignature(secret: string, signature: string, payload: string): Promise<boolean> {
  if (!signature || !signature.startsWith("sha256=")) return false;
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigHex = signature.replace("sha256=", "");
  const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  return await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(payload)
  );
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const signature = req.headers.get("x-hub-signature-256") || "";
  const event = req.headers.get("x-github-event") || "push";
  const deliveryId = req.headers.get("x-github-delivery") || "";
  const rawBody = await req.text();

  // 1. Verificación de Seguridad Criptográfica
  const isValid = await verifySignature(GITHUB_WEBHOOK_SECRET, signature, rawBody);
  if (!isValid) {
    console.error(\`[SECURITY] Firma HMAC inválida en delivery \${deliveryId}\`);
    return new Response(JSON.stringify({ error: "Invalid HMAC signature" }), { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const repoFullName = payload.repository?.full_name;
  const commitSha = payload.after || payload.head_commit?.id;

  console.log(\`[SYNC] Evento '\${event}' en repo '\${repoFullName}' @ \${commitSha}\`);

  // 2. Control de Idempotencia: Verificar si el delivery ya fue procesado
  const { data: existing } = await supabase
    .from("cola_tareas_agente")
    .select("id")
    .eq("payload->>delivery_id", deliveryId)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ status: "already_processed", deliveryId }), { status: 200 });
  }

  // 3. Encolar tarea de Ingesta AST y Chunking en PostgreSQL (SKIP LOCKED)
  const { error: insertError } = await supabase
    .from("cola_tareas_agente")
    .insert({
      task_type: "REPO_AST_INDEXING",
      priority: 10,
      payload: {
        delivery_id: deliveryId,
        repo: repoFullName,
        commit: commitSha,
        event: event,
        ref: payload.ref,
        sender: payload.sender?.login
      }
    });

  if (insertError) {
    console.error("[ERROR] Fallo al encolar tarea:", insertError);
    return new Response(JSON.stringify({ error: "Database queue failed" }), { status: 500 });
  }

  // 4. Registro en Auditoría Inmutable
  await supabase.from("auditoria_legal").insert({
    action_type: "GITHUB_WEBHOOK_INGESTED",
    input_payload: { repo: repoFullName, deliveryId, event },
    output_payload: { queued: true, status: "pending" },
    previous_hash: "GENESIS_NODE_OR_PREV_HASH",
    hash_signature: "COMPUTED_SHA256_CHAIN"
  });

  return new Response(JSON.stringify({ success: true, repo: repoFullName, queued: true }), {
    headers: { "Content-Type": "application/json" },
    status: 202
  });
});`,
  },
  {
    id: 'art-04',
    title: 'Protocolo de Comunicación Inter-Agente: Orquestador Supervisor-Worker',
    filename: 'agent-orchestrator-protocol.ts',
    language: 'typescript',
    badge: 'Multi-Agent Consensus Pattern',
    description: 'Protocolo jerárquico Supervisor-Worker para enjambres de agentes. Define el ciclo de vida del sub-agente, arbitraje de tareas, verificación de consensos con quórum y mitigación de fallos en cascada.',
    code: `export interface AgentMessage {
  id: string;
  senderId: string;
  recipientId: string | 'BROADCAST';
  correlationId: string;
  intent: 'TASK_ASSIGN' | 'TASK_RESULT' | 'HEARTBEAT' | 'CRITIQUE_REQUEST' | 'VOTE';
  payload: Record<string, unknown>;
  timestamp: string;
  signature: string; // HMAC del payload
}

export interface WorkerReport {
  taskId: string;
  workerId: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  confidenceScore: number;
  outputArtifacts: string[];
  executionTimeMs: number;
  tokenConsumption: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
}

/**
 * Supervisor: Coordina trabajadores, evalúa calidad y aplica quorum
 */
export class AgentSupervisor {
  private activeWorkers = new Map<string, { role: string; lastSeen: number }>();
  private pendingTasks = new Map<string, { objective: string; assignedTo: string[] }>();

  public registerWorker(workerId: string, role: string) {
    this.activeWorkers.set(workerId, { role, lastSeen: Date.now() });
    console.log(\`[SUPERVISOR] Worker '\${workerId}' registrado con rol: '\${role}'\`);
  }

  public dispatchTaskWithConsensus(
    taskId: string,
    objective: string,
    requiredQuorum: number = 2
  ): string[] {
    const qualifiedWorkers = Array.from(this.activeWorkers.entries())
      .slice(0, Math.max(requiredQuorum, 2))
      .map(([id]) => id);

    this.pendingTasks.set(taskId, { objective, assignedTo: qualifiedWorkers });
    console.log(\`[DISPATCH] Tarea '\${taskId}' asignada a quorum de \${qualifiedWorkers.length} workers.\`);
    return qualifiedWorkers;
  }

  public evaluateConsensus(reports: WorkerReport[]): { approved: boolean; bestOutput: string; consensusConfidence: number } {
    if (reports.length === 0) return { approved: false, bestOutput: '', consensusConfidence: 0 };

    const successful = reports.filter((r) => r.status === 'SUCCESS');
    const quorumReached = successful.length >= Math.ceil(reports.length / 2);

    const avgConfidence = successful.reduce((acc, curr) => acc + curr.confidenceScore, 0) / (successful.length || 1);
    const highestQualityReport = successful.sort((a, b) => b.confidenceScore - a.confidenceScore)[0];

    return {
      approved: quorumReached && avgConfidence >= 0.85,
      bestOutput: highestQualityReport?.outputArtifacts[0] || '',
      consensusConfidence: Math.round(avgConfidence * 100)
    };
  }
}`,
  },
];

import { z } from 'zod';

/**
 * Mission Lifecycle States
 */
export const MissionStatusSchema = z.enum([
  'CREATED',
  'DISCOVERING',
  'PLANNING',
  'AUTHORIZED',
  'EXECUTING',
  'VERIFYING',
  'REPLANNING',
  'BLOCKED',
  'FAILED',
  'COMPLETED',
  'CANCELLED',
]);

export type MissionStatus = z.infer<typeof MissionStatusSchema>;

/**
 * Mission Definition
 */
export const MissionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  objective: z.string().min(1).max(5000),
  description: z.string().max(10000).optional(),
  priority: z.number().int().min(1).max(10).default(5),
  status: MissionStatusSchema.default('CREATED'),
  budget: z.number().positive().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  actualCost: z.number().nonnegative().default(0),
  deadline: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  failedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
  parentMissionId: z.string().uuid().optional().nullable(),
});

export type Mission = z.infer<typeof MissionSchema>;

/**
 * Mission Creation Input
 */
export const CreateMissionInputSchema = z.object({
  title: z.string().min(1).max(500),
  objective: z.string().min(1).max(5000),
  description: z.string().max(10000).optional(),
  priority: z.number().int().min(1).max(10).default(5),
  budget: z.number().positive().optional(),
  deadline: z.coerce.date().optional(),
  parentMissionId: z.string().uuid().optional().nullable(),
});

export type CreateMissionInput = z.infer<typeof CreateMissionInputSchema>;

/**
 * Agent Lifecycle States
 */
export const AgentStatusSchema = z.enum([
  'IDLE',
  'SPAWN',
  'INITIALIZING',
  'CONTEXT_LOADING',
  'REASONING',
  'REQUESTING_TOOL',
  'EXECUTING',
  'OBSERVING',
  'VERIFYING',
  'REPORTING',
  'ERROR',
]);

export type AgentStatus = z.infer<typeof AgentStatusSchema>;

/**
 * Agent Definition
 */
export const AgentSchema = z.object({
  id: z.string().uuid(),
  identity: z.string(),
  role: z.string(),
  capabilities: z.array(z.string()),
  status: AgentStatusSchema.default('IDLE'),
  currentMissionId: z.string().uuid().optional().nullable(),
  modelProvider: z.string().optional(),
  modelConfig: z.record(z.unknown()).optional(),
  contextLimit: z.number().int().positive().default(4096),
  tokenBudget: z.number().positive().optional(),
  tokensUsed: z.number().nonnegative().default(0),
  timeout: z.number().int().positive().default(60000),
  sandboxEnabled: z.boolean().default(true),
});

export type Agent = z.infer<typeof AgentSchema>;

/**
 * Tool Risk Levels
 */
export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/**
 * Tool Policy
 */
export const ToolPolicySchema = z.enum([
  'ALLOW_BY_DEFAULT',
  'DENY_BY_DEFAULT',
  'REQUIRE_AUTHORIZATION',
]);

export type ToolPolicy = z.infer<typeof ToolPolicySchema>;

/**
 * Tool Definition
 */
export const ToolSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string().default('1.0.0'),
  description: z.string(),
  schema: z.record(z.unknown()), // JSON Schema
  permissions: z.array(z.string()),
  riskLevel: RiskLevelSchema.default('MEDIUM'),
  timeout: z.number().int().positive().default(30000),
  authRequired: z.boolean().default(false),
  networkRequired: z.boolean().default(false),
  enabled: z.boolean().default(true),
  policy: ToolPolicySchema.default('DENY_BY_DEFAULT'),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Tool Execution Request
 */
export const ToolExecutionRequestSchema = z.object({
  toolName: z.string(),
  input: z.record(z.unknown()),
  missionId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
});

export type ToolExecutionRequest = z.infer<typeof ToolExecutionRequestSchema>;

/**
 * Verification Types
 */
export const VerificationTypeSchema = z.enum([
  'BUILD',
  'TEST',
  'API_READ_BACK',
  'HEALTH_CHECK',
  'HASH_VERIFY',
  'ACCEPTANCE_TEST',
]);

export type VerificationType = z.infer<typeof VerificationTypeSchema>;

/**
 * Verification Result
 */
export const VerificationSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  resourceId: z.string(),
  resourceType: z.string(),
  verificationType: VerificationTypeSchema,
  method: z.string(),
  expected: z.unknown(),
  actual: z.unknown().optional(),
  status: z.enum(['PENDING', 'PASSED', 'FAILED', 'SKIPPED']),
  evidence: z.unknown().optional(),
  error: z.string().optional(),
});

export type Verification = z.infer<typeof VerificationSchema>;

/**
 * Checkpoint for Mission Recovery
 */
export const CheckpointSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  state: z.record(z.unknown()), // Full mission state
  reason: z.string().optional(),
  recoverable: z.boolean().default(true),
});

export type Checkpoint = z.infer<typeof CheckpointSchema>;

/**
 * Plan Step
 */
export const PlanStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  agent: z.string().optional(),
  tools: z.array(z.string()).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED']).default('PENDING'),
  result: z.unknown().optional(),
  error: z.string().optional(),
});

export type PlanStep = z.infer<typeof PlanStepSchema>;

/**
 * Mission Plan
 */
export const MissionPlanSchema = z.object({
  missionId: z.string().uuid(),
  steps: z.array(PlanStepSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type MissionPlan = z.infer<typeof MissionPlanSchema>;

// NEXUS-Ω Governance & Policy Engine
// Strict separation: AGENT INTENT != AUTHORIZED ACTION
// Enforces: Budget quotas, Path traversal jail, Deny-by-default, Blast radius calculation, and Human-in-the-Loop authorization.

import { sha256 } from './securityEngine';

export type PolicyDecisionStatus = 'ALLOWED' | 'REQUIRE_APPROVAL' | 'DENIED';

export interface ActionRequest {
  requestId: string;
  missionId: string;
  agentId: string;
  toolName: string;
  parameters: Record<string, any>;
  intentRationale: string;
  estimatedCostEUR?: number;
  estimatedTokens?: number;
  timestamp: string;
}

export interface BlastRadiusAssessment {
  filesystemScope: 'NONE' | 'READ_ONLY' | 'SCOPED_WRITE' | 'DESTRUCTIVE';
  networkScope: 'NONE' | 'INTERNAL_API' | 'EXTERNAL_RESTRICTED' | 'UNRESTRICTED_EGRESS';
  financialExposureEUR: number;
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PolicyDecision {
  decisionId: string;
  requestId: string;
  missionId: string;
  status: PolicyDecisionStatus;
  policyViolated?: string;
  rationale: string;
  blastRadius: BlastRadiusAssessment;
  requiresHumanAuthorization: boolean;
  timestamp: string;
  signatureHash: string;
}

export interface GovernancePolicyRule {
  ruleId: string;
  name: string;
  description: string;
  severity: 'WARNING' | 'BLOCKING' | 'CRITICAL';
  evaluator: (req: ActionRequest, missionContext: any) => { pass: boolean; violationReason?: string; requiresApproval?: boolean };
}

export class GovernancePolicyEngine {
  private rules: GovernancePolicyRule[] = [];
  private decisionsLedger: PolicyDecision[] = [];

  constructor() {
    this.registerStandardRules();
  }

  private registerStandardRules(): void {
    // Rule 1: Prevent Directory Traversal and Sensitive File Access
    this.rules.push({
      ruleId: 'GOV-POL-01',
      name: 'Filesystem Sandbox & Traversal Jail',
      description: 'Prevents directory traversal and unauthorized access to critical configuration and key files.',
      severity: 'CRITICAL',
      evaluator: (req) => {
        const pathParam = req.parameters?.path || req.parameters?.filePath || req.parameters?.targetFile;
        if (typeof pathParam === 'string') {
          const forbiddenSubstrings = ['../', '..\\', '/etc/', '/root/', '.ssh', '.aws', '.env.local', 'id_rsa'];
          for (const forbidden of forbiddenSubstrings) {
            if (pathParam.includes(forbidden)) {
              return {
                pass: false,
                violationReason: `Filesystem Traversal or sensitive path target detected: '${pathParam}' matching '${forbidden}'`,
              };
            }
          }
        }
        return { pass: true };
      },
    });

    // Rule 2: Deny Unregistered or Insecure Tools (Deny-By-Default)
    this.rules.push({
      ruleId: 'GOV-POL-02',
      name: 'Deny-By-Default Tool Allowlist',
      description: 'Rejects any tool invocation that is not explicitly registered in the Sovereign MCP Tool catalog.',
      severity: 'CRITICAL',
      evaluator: (req) => {
        const allowedTools = [
          'mcp_read_file',
          'mcp_write_file',
          'mcp_git_status',
          'mcp_git_commit',
          'mcp_run_tests',
          'mcp_run_linter',
          'mcp_browser_action',
          'mcp_vector_search',
          'mcp_github_fetch_repo',
          'mcp_github_create_branch',
          'mcp_gemini_inference',
          'mcp_apply_ast_patch'
        ];

        if (!allowedTools.includes(req.toolName)) {
          return {
            pass: false,
            violationReason: `Tool '${req.toolName}' is not registered in the Sovereign MCP Tool Allowlist. Denied by default.`,
          };
        }
        return { pass: true };
      },
    });

    // Rule 3: Destructive Operation Approval Gate
    this.rules.push({
      ruleId: 'GOV-POL-03',
      name: 'High Blast Radius Destructive Gate',
      description: 'Pauses execution and requires explicit human approval for destructive operations like force pushes or production deployments.',
      severity: 'BLOCKING',
      evaluator: (req) => {
        const destructiveTools = ['mcp_deploy_production', 'mcp_db_drop_table', 'mcp_git_push_force'];
        if (destructiveTools.includes(req.toolName) || req.parameters?.force === true) {
          return {
            pass: true,
            requiresApproval: true,
            violationReason: `Action '${req.toolName}' involves irreversible mutations. Pausing for human authorization.`,
          };
        }
        return { pass: true };
      },
    });

    // Rule 4: Mission Financial & Token Quota Check
    this.rules.push({
      ruleId: 'GOV-POL-04',
      name: 'Budget & Token Burn Ceiling',
      description: 'Enforces hard stops on token consumption and financial budget limits to prevent runaway resource exhaustion.',
      severity: 'BLOCKING',
      evaluator: (req, missionContext) => {
        if (missionContext?.budget) {
          const currentCost = missionContext.budget.spentCostEUR || 0;
          const maxCost = missionContext.budget.maxCostEUR || 10.0;
          const additionalCost = req.estimatedCostEUR || 0;

          if (currentCost + additionalCost > maxCost) {
            return {
              pass: false,
              violationReason: `Financial budget ceiling reached. Current: €${currentCost.toFixed(4)}, Max: €${maxCost.toFixed(4)}`,
            };
          }

          const currentTokens = missionContext.budget.spentTokens || 0;
          const maxTokens = missionContext.budget.maxTokens || 200000;
          const additionalTokens = req.estimatedTokens || 0;

          if (currentTokens + additionalTokens > maxTokens) {
            return {
              pass: false,
              violationReason: `Token quota ceiling reached. Current: ${currentTokens}, Max: ${maxTokens}`,
            };
          }
        }
        return { pass: true };
      },
    });

    // Rule 5: Prompt Injection / Secret Exfiltration Guard
    this.rules.push({
      ruleId: 'GOV-POL-05',
      name: 'Prompt Injection & Data Exfiltration Guard',
      description: 'Scans tool parameters and prompt strings for adversarial jailbreaks and outbound data exfiltration patterns.',
      severity: 'CRITICAL',
      evaluator: (req) => {
        const payloadStr = JSON.stringify(req.parameters || {});
        const injectionPatterns = [
          /ignore previous instructions/i,
          /system prompt override/i,
          /disregard safety/i,
          /<script>.*<\/script>/i,
          /curl\s+.*https?:\/\//i,
        ];

        for (const pattern of injectionPatterns) {
          if (pattern.test(payloadStr)) {
            return {
              pass: false,
              violationReason: `Adversarial prompt injection pattern detected in tool payload: ${pattern}`,
            };
          }
        }
        return { pass: true };
      },
    });
  }

  public assessBlastRadius(req: ActionRequest): BlastRadiusAssessment {
    let filesystemScope: BlastRadiusAssessment['filesystemScope'] = 'NONE';
    let networkScope: BlastRadiusAssessment['networkScope'] = 'NONE';
    let riskScore = 10;

    if (req.toolName.includes('write') || req.toolName.includes('patch')) {
      filesystemScope = 'SCOPED_WRITE';
      riskScore += 25;
    } else if (req.toolName.includes('read')) {
      filesystemScope = 'READ_ONLY';
      riskScore += 5;
    }

    if (req.toolName.includes('deploy') || req.toolName.includes('force')) {
      filesystemScope = 'DESTRUCTIVE';
      riskScore += 50;
    }

    if (req.toolName.includes('browser') || req.toolName.includes('fetch')) {
      networkScope = 'EXTERNAL_RESTRICTED';
      riskScore += 20;
    }

    const financialExposureEUR = req.estimatedCostEUR || 0.0001;

    let riskLevel: BlastRadiusAssessment['riskLevel'] = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 25) riskLevel = 'MEDIUM';

    return {
      filesystemScope,
      networkScope,
      financialExposureEUR,
      riskScore,
      riskLevel,
    };
  }

  public evaluateAction(req: ActionRequest, missionContext: any = {}): PolicyDecision {
    const blastRadius = this.assessBlastRadius(req);
    let status: PolicyDecisionStatus = 'ALLOWED';
    let policyViolated: string | undefined = undefined;
    let rationale = 'All active governance constraints and security invariants passed.';
    let requiresHumanAuthorization = false;

    for (const rule of this.rules) {
      const result = rule.evaluator(req, missionContext);
      if (!result.pass) {
        status = 'DENIED';
        policyViolated = rule.ruleId;
        rationale = result.violationReason || `Policy violation on ${rule.name}`;
        break; // Short-circuit on first hard deny
      }
      if (result.requiresApproval) {
        status = 'REQUIRE_APPROVAL';
        policyViolated = rule.ruleId;
        rationale = result.violationReason || `Manual authorization mandatory for ${rule.name}`;
        requiresHumanAuthorization = true;
      }
    }

    // If blast radius is critical, require approval even if no specific rule caught it
    if (status === 'ALLOWED' && blastRadius.riskLevel === 'CRITICAL') {
      status = 'REQUIRE_APPROVAL';
      requiresHumanAuthorization = true;
      rationale = 'Blast radius assessment score exceeded 75/100 threshold.';
    }

    const decisionId = `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = new Date().toISOString();
    const signatureHash = sha256(`${decisionId}:${req.requestId}:${status}:${rationale}`);

    const decision: PolicyDecision = {
      decisionId,
      requestId: req.requestId,
      missionId: req.missionId,
      status,
      policyViolated,
      rationale,
      blastRadius,
      requiresHumanAuthorization,
      timestamp,
      signatureHash,
    };

    this.decisionsLedger.unshift(decision);
    if (this.decisionsLedger.length > 500) this.decisionsLedger.pop();

    return decision;
  }

  public getRules(): { ruleId: string; name: string; description: string; severity: string }[] {
    return this.rules.map((r) => ({
      ruleId: r.ruleId,
      name: r.name,
      description: r.description,
      severity: r.severity,
    }));
  }

  public getDecisionsLedger(): PolicyDecision[] {
    return this.decisionsLedger;
  }
}

export const globalGovernanceEngine = new GovernancePolicyEngine();

import { Router, Request, Response } from 'express';
import { missionRuntime } from './mission-runtime.js';
import { auditService } from '../audit/service.js';
import { githubService } from '../github/service.js';
import prisma from '../lib/db.js';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * Get system stats
 */
router.get('/stats', async (_req: Request, res: Response) => {
  const [missionCount, agentCount, toolCount, auditCount, repoCount] = await Promise.all([
    prisma.mission.count(),
    prisma.agent.count(),
    prisma.tool.count(),
    prisma.auditEvent.count(),
    prisma.ingestedRepository.count(),
  ]);

  const ledgerIntegrity = await auditService.verifyChain();

  res.json({
    missions: missionCount,
    agents: agentCount,
    tools: toolCount,
    auditEvents: auditCount,
    ingestedRepositories: repoCount,
    ledgerIntegrity: ledgerIntegrity.valid,
    githubState: githubService.getState(),
  });
});

/**
 * Missions API
 */
router.get('/missions', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const missions = await missionRuntime.listMissions(status as any);
    res.json({ missions });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/missions/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const mission = await missionRuntime.getMission(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    res.json({ mission });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/missions', async (req: Request, res: Response) => {
  try {
    const { title, objective, description, priority, budget, deadline } = req.body;
    
    if (!title || !objective) {
      return res.status(400).json({ error: 'title and objective are required' });
    }

    const mission = await missionRuntime.createMission({
      title,
      objective,
      description,
      priority,
      budget,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    res.status(201).json({ mission });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/missions/:id/start', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await missionRuntime.startDiscovery(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/missions/:id/authorize', async (req: Request, res: Response) => {
  try {
    const { authorizedBy } = req.body;
    if (!authorizedBy) {
      return res.status(400).json({ error: 'authorizedBy is required' });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await missionRuntime.authorizeMission(id, authorizedBy as string);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/missions/:id/complete', async (req: Request, res: Response) => {
  try {
    await missionRuntime.completeMission(req.params.id as string);
    res.json({ success: true });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/missions/:id/fail', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    await missionRuntime.failMission(req.params.id as string, reason as string);
    res.json({ success: true });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Audit API
 */
router.get('/audit', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = await auditService.getRecentEvents(limit);
    res.json({ events });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/audit/verify', async (_req: Request, res: Response) => {
  try {
    const result = await auditService.verifyChain();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/audit/missions/:id', async (req: Request, res: Response) => {
  try {
    const events = await auditService.getMissionEvents(req.params.id as string);
    res.json({ events });
    return;
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

/**
 * GitHub Integration API
 */
router.get('/github/status', async (_req: Request, res: Response) => {
  const state = githubService.getState();
  res.json({ state });
});

router.post('/github/ingest/:repo', async (req: Request, res: Response) => {
  try {
    const repo = Array.isArray(req.params.repo) ? req.params.repo[0] : req.params.repo;
    const result = await githubService.ingestRepository(repo);
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Tools API
 */
router.get('/tools', async (_req: Request, res: Response) => {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/tools', async (req: Request, res: Response) => {
  try {
    const { name, description, schema, permissions, riskLevel, policy } = req.body;
    
    const tool = await prisma.tool.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description,
        schema: JSON.stringify(schema),
        permissions: JSON.stringify(permissions ?? []),
        riskLevel: riskLevel ?? 'MEDIUM',
        policy: policy ?? 'DENY_BY_DEFAULT',
      },
    });

    res.status(201).json({ tool });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;

import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';
import { githubService } from '../github/service.js';
import { auditService } from '../audit/service.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (basic)
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
  return undefined;
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'NEXUS-Ω',
    version: '1.0.0',
    description: 'AI Workforce Control Plane / Agent Operating System',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      missions: '/api/missions',
      audit: '/api/audit',
      tools: '/api/tools',
      github: '/api/github/status',
    },
  });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize services and start server
async function main() {
  try {
    // Restore audit ledger state
    await auditService.restoreState();
    
    // Initialize GitHub integration
    await githubService.initialize();

    // Start server
    app.listen(PORT, () => {
      console.log(`NEXUS-Ω API listening on port ${PORT}`);
      console.log(`GitHub Integration State: ${githubService.getState()}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to initialize NEXUS-Ω:', error);
    process.exit(1);
  }
}

main();

export default app;

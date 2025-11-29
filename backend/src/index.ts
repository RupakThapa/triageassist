/**
 * Backend API Server
 * Handles audio uploads, visit management, and triggers n8n-mock workflow
 */

import express from 'express';
import cors from 'cors';
import { config } from './config';
import { visitsRouter } from './routes/visits';
import { audioRouter } from './routes/audio';
import { logger } from './utils/logger';

const app = express();

// Middleware - Allow multiple origins for development
app.use(cors({ 
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:5173',
    config.corsOrigin
  ],
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-api' });
});

// Routes
app.use('/api/visits', visitsRouter);
app.use('/api/audio', audioRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Backend API server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`CORS origin: ${config.corsOrigin}`);
  logger.info(`n8n webhook: ${config.n8nWebhookUrl}`);
});


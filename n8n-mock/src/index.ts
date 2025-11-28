/**
 * n8n-mock Service
 * Simulates n8n workflow for processing medical triage audio recordings
 */

import express from 'express';
import { processVisitWebhook } from './handlers/webhook';
import { config } from './config';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'n8n-mock' });
});

// Webhook endpoint (matches n8n interface)
app.post('/webhook/process-visit', processVisitWebhook);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`n8n-mock service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Processing delay: ${config.processingDelayMin}-${config.processingDelayMax}ms`);
  logger.info(`Use real Deepgram: ${config.useRealDeepgram}`);
});


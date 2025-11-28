/**
 * Webhook handler for processing visit audio
 */

import { Request, Response } from 'express';
import { processVisit } from '../services/visitProcessor';
import { ProcessVisitWebhookPayload, ProcessVisitWebhookResponse } from '../../../shared/types';
import { logger } from '../utils/logger';

export async function processVisitWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  
  try {
    const payload: ProcessVisitWebhookPayload = req.body;
    
    // Validate payload
    if (!payload.visitId || !payload.audioUrl) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: visitId and audioUrl',
      } as ProcessVisitWebhookResponse);
      return;
    }

    logger.info(`Processing visit ${payload.visitId}`);

    // Process asynchronously (don't block the response)
    // In production, you might want to use a queue system
    processVisit(payload).catch((error) => {
      logger.error(`Error processing visit ${payload.visitId}:`, error);
    });

    // Return immediate response
    const response: ProcessVisitWebhookResponse = {
      success: true,
      visitId: payload.visitId,
    };

    res.json(response);
    
    const duration = Date.now() - startTime;
    logger.info(`Webhook response sent in ${duration}ms for visit ${payload.visitId}`);
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ProcessVisitWebhookResponse);
  }
}


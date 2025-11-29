/**
 * n8n-mock webhook service
 * Triggers the n8n-mock workflow to process audio
 */

import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ProcessVisitWebhookPayload } from '../../../shared/types';

export async function triggerN8nWebhook(
  visitId: string,
  audioUrl: string,
  nurseId?: string,
  transcript?: string
): Promise<void> {
  try {
    const payload: ProcessVisitWebhookPayload & { transcript?: string } = {
      visitId,
      audioUrl,
      nurseId,
      transcript, // Pass the live transcript
    };

    logger.info(`Triggering n8n webhook for visit ${visitId}${transcript ? ' (with transcript)' : ''}`);

    const response = await axios.post(config.n8nWebhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout for webhook acceptance
    });

    if (response.data.success) {
      logger.info(`n8n webhook triggered successfully for visit ${visitId}`);
    } else {
      logger.warn(`n8n webhook returned success=false for visit ${visitId}`);
    }
  } catch (error) {
    logger.error(`Failed to trigger n8n webhook for visit ${visitId}:`, error);
    // Don't throw - we want the visit to be created even if webhook fails
    // The webhook can be retried later if needed
  }
}


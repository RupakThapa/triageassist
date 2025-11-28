/**
 * Main visit processing service
 * Simulates the n8n workflow: transcription → PII redaction → AI extraction → DB update
 */

import { ProcessVisitWebhookPayload } from '../../../shared/types';
import { transcribeAudio } from './transcription';
import { redactPII } from './piiRedaction';
import { extractStructuredData } from './aiExtraction';
import { updateVisitRecord } from './database';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function processVisit(payload: ProcessVisitWebhookPayload): Promise<void> {
  const { visitId, audioUrl } = payload;
  const startTime = Date.now();

  try {
    logger.info(`Starting processing for visit ${visitId}`);

    // Step 1: Transcription (simulated or real)
    logger.info(`Step 1: Transcribing audio...`);
    const transcriptStart = Date.now();
    const transcript = await transcribeAudio(audioUrl);
    const transcriptDuration = Date.now() - transcriptStart;
    logger.info(`Transcription completed in ${transcriptDuration}ms`);

    // Step 2: PII Redaction
    logger.info(`Step 2: Redacting PII...`);
    const redactionStart = Date.now();
    const redactedTranscript = redactPII(transcript);
    const redactionDuration = Date.now() - redactionStart;
    logger.info(`PII redaction completed in ${redactionDuration}ms`);

    // Step 3: AI Extraction
    logger.info(`Step 3: Extracting structured data with AI...`);
    const aiStart = Date.now();
    const structuredData = await extractStructuredData(redactedTranscript);
    const aiDuration = Date.now() - aiStart;
    logger.info(`AI extraction completed in ${aiDuration}ms`);

    // Step 4: Update Database
    logger.info(`Step 4: Updating database...`);
    const dbStart = Date.now();
    await updateVisitRecord(visitId, {
      ...structuredData,
      raw_transcript: redactedTranscript,
      status: 'review',
    });
    const dbDuration = Date.now() - dbStart;
    logger.info(`Database update completed in ${dbDuration}ms`);

    const totalDuration = Date.now() - startTime;
    logger.info(`Visit ${visitId} processed successfully in ${totalDuration}ms`);
  } catch (error) {
    logger.error(`Error processing visit ${visitId}:`, error);
    
    // Update visit status to indicate error
    try {
      await updateVisitRecord(visitId, {
        status: 'review', // Still allow manual entry
      });
    } catch (dbError) {
      logger.error(`Failed to update visit status after error:`, dbError);
    }
    
    throw error;
  }
}


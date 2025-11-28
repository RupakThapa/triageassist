/**
 * Database service for updating visit records in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { VisitData, VisitStatus } from '../../../shared/types';
import { logger } from '../utils/logger';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

interface UpdateVisitData {
  visit_summary?: string | null;
  vitals?: VisitData['vitals'] | null;
  medications?: VisitData['medications'] | null;
  consult_notes?: VisitData['consult_notes'] | null;
  raw_transcript?: string | null;
  status?: VisitStatus;
}

/**
 * Updates a visit record in Supabase
 * This will trigger Supabase Realtime, which notifies the frontend
 */
export async function updateVisitRecord(
  visitId: string,
  data: UpdateVisitData
): Promise<void> {
  try {
    logger.debug(`Updating visit ${visitId} with data:`, data);

    const { error } = await supabase
      .from('visits')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', visitId);

    if (error) {
      logger.error(`Supabase update error for visit ${visitId}:`, error);
      throw error;
    }

    logger.info(`Successfully updated visit ${visitId}`);
  } catch (error) {
    logger.error(`Failed to update visit ${visitId}:`, error);
    throw error;
  }
}


/**
 * Supabase client for frontend
 */

import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { VisitRecord } from '../types';

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

/**
 * Subscribe to visit updates via Realtime
 */
export function subscribeToVisit(
  visitId: string,
  callback: (visit: VisitRecord) => void
) {
  const channel = supabase
    .channel(`visits:${visitId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'visits',
        filter: `id=eq.${visitId}`,
      },
      (payload) => {
        callback(payload.new as VisitRecord);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}


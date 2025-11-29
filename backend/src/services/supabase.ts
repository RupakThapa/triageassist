/**
 * Supabase client service
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { VisitRecord, VisitStatus } from '../../../shared/types';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

export const supabaseService = {
  /**
   * Create a new visit record
   */
  async createVisit(nurseId?: string): Promise<VisitRecord> {
    const { data, error } = await supabase
      .from('visits')
      .insert({
        status: 'recording' as VisitStatus,
        nurse_id: nurseId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create visit: ${error.message}`);
    }

    return data as VisitRecord;
  },

  /**
   * Get a visit by ID
   */
  async getVisit(visitId: string): Promise<VisitRecord | null> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('id', visitId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get visit: ${error.message}`);
    }

    return data as VisitRecord;
  },

  /**
   * Update a visit record
   */
  async updateVisit(visitId: string, updates: Partial<VisitRecord>): Promise<VisitRecord> {
    const { data, error } = await supabase
      .from('visits')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', visitId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update visit: ${error.message}`);
    }

    return data as VisitRecord;
  },

  /**
   * Upload audio file to Supabase Storage
   */
  async uploadAudio(visitId: string, audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<string> {
    const extension = mimeType.includes('webm') ? 'webm' : 'mp3';
    const fileName = `visit-${visitId}.${extension}`;

    const { data, error } = await supabase.storage
      .from(config.storageBucket)
      .upload(fileName, audioBuffer, {
        contentType: mimeType,
        upsert: true, // Allow overwriting if re-uploading
      });

    if (error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }

    // Get signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from(config.storageBucket)
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (!urlData?.signedUrl) {
      throw new Error('Failed to generate signed URL');
    }

    return urlData.signedUrl;
  },

  /**
   * Get signed URL for audio file
   */
  async getAudioUrl(visitId: string): Promise<string | null> {
    // Try webm first (browser default), then mp3
    for (const ext of ['webm', 'mp3']) {
      const fileName = `visit-${visitId}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from(config.storageBucket)
        .createSignedUrl(fileName, 3600);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }
    
    return null;
  },
};


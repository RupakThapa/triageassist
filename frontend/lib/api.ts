/**
 * API client for backend communication
 */

import axios from 'axios';
import { config } from './config';
import { VisitRecord } from '../types';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Create a new visit
   */
  async createVisit(nurseId?: string): Promise<VisitRecord> {
    const response = await api.post<VisitRecord>('/api/visits', { nurseId });
    return response.data;
  },

  /**
   * Get a visit by ID
   */
  async getVisit(visitId: string): Promise<VisitRecord> {
    const response = await api.get<VisitRecord>(`/api/visits/${visitId}`);
    return response.data;
  },

  /**
   * Update a visit
   */
  async updateVisit(visitId: string, updates: Partial<VisitRecord>): Promise<VisitRecord> {
    const response = await api.put<VisitRecord>(`/api/visits/${visitId}`, updates);
    return response.data;
  },

  /**
   * Upload audio file with transcript
   */
  async uploadAudio(visitId: string, audioBlob: Blob, transcript?: string): Promise<{ audioUrl: string }> {
    const formData = new FormData();
    // Use correct extension based on blob type
    const extension = audioBlob.type.includes('webm') ? 'webm' : 'mp3';
    formData.append('audio', audioBlob, `recording.${extension}`);
    
    // Include the live transcript if available
    if (transcript) {
      formData.append('transcript', transcript);
    }

    const response = await api.post(`/api/audio/upload/${visitId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get audio URL
   */
  async getAudioUrl(visitId: string): Promise<{ audioUrl: string }> {
    const response = await api.get<{ audioUrl: string }>(`/api/audio/${visitId}`);
    return response.data;
  },
};


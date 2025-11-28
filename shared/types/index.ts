/**
 * Shared TypeScript types and interfaces
 * Used across frontend, backend, and n8n-mock services
 */

/**
 * Visit Status Enum
 */
export enum VisitStatus {
  RECORDING = 'recording',
  PROCESSING = 'processing',
  REVIEW = 'review',
  COMPLETED = 'completed',
}

/**
 * Pain Type Options
 */
export type PainType = 'Throbbing' | 'Sharp' | 'Dull' | 'Burning' | 'Aching' | 'Stabbing' | 'Other';

/**
 * Medication Status
 */
export type MedicationStatus = 'Current' | 'Prescribed' | 'Discontinued';

/**
 * Vitals Data Structure
 */
export interface Vitals {
  pain_level: number | null; // 0-10 or null
  pain_type: string | null;
  pain_location: string | null;
}

/**
 * Medication Data Structure
 */
export interface Medication {
  name: string;
  dosage: string;
  status: MedicationStatus;
}

/**
 * Consult Notes Structure
 */
export interface ConsultNotes {
  subjective: string; // Patient's verbal complaints
  objective: string; // Nurse's observations
  plan: string; // Next steps
}

/**
 * Complete Visit Data Structure (matches JSON schema from PRD)
 */
export interface VisitData {
  visit_summary: string; // 1-2 sentence professional summary
  vitals: Vitals;
  medications: Medication[];
  consult_notes: ConsultNotes;
}

/**
 * Database Visit Record
 */
export interface VisitRecord {
  id: string; // UUID
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  audio_url: string | null; // Supabase Storage signed URL
  visit_summary: string | null;
  vitals: Vitals | null;
  medications: Medication[] | null;
  consult_notes: ConsultNotes | null;
  status: VisitStatus;
  raw_transcript: string | null; // PII-redacted transcript
  nurse_id: string | null; // UUID
}

/**
 * WebSocket Message Types (Deepgram)
 */
export interface DeepgramTranscriptMessage {
  channel_index: number[];
  duration: number;
  start: number;
  is_final: boolean;
  speech_final: boolean;
  channel: {
    alternatives: Array<{
      transcript: string;
      confidence: number;
      words: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
        speaker?: number; // When diarize=true
      }>;
    }>;
  };
}

/**
 * n8n-mock Webhook Payload
 */
export interface ProcessVisitWebhookPayload {
  visitId: string;
  audioUrl: string;
  nurseId?: string;
}

/**
 * n8n-mock Webhook Response
 */
export interface ProcessVisitWebhookResponse {
  success: boolean;
  visitId: string;
  error?: string;
}

/**
 * Supabase Realtime Payload
 */
export interface RealtimeVisitUpdate {
  eventType: 'UPDATE' | 'INSERT' | 'DELETE';
  new: VisitRecord;
  old?: VisitRecord;
}

/**
 * Form Field Mapping
 * Maps VisitData structure to form field names
 */
export interface FormFieldMapping {
  visit_summary: string;
  'vitals.pain_level': string;
  'vitals.pain_type': string;
  'vitals.pain_location': string;
  medications: string;
  'consult_notes.subjective': string;
  'consult_notes.objective': string;
  'consult_notes.plan': string;
}

/**
 * Audio Recording State
 */
export interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  audioBlob: Blob | null;
  transcript: string; // Live transcript text
}


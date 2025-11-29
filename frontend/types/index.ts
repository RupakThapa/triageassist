// Frontend types
export type MedicationStatus = 'Current' | 'Prescribed' | 'Discontinued';

export interface Medication {
  name: string;
  dosage: string;
  status: MedicationStatus;
}

export interface Vitals {
  pain_level: number | null;
  pain_type: string | null;
  pain_location: string | null;
}

export interface ConsultNotes {
  subjective: string;
  objective: string;
  plan: string;
}

export interface VisitData {
  visit_summary: string;
  vitals: Vitals;
  medications: Medication[];
  consult_notes: ConsultNotes;
}

export enum VisitStatus {
  RECORDING = 'recording',
  PROCESSING = 'processing',
  REVIEW = 'review',
  COMPLETED = 'completed',
}

export interface VisitRecord {
  id: string;
  created_at: string;
  updated_at: string;
  audio_url: string | null;
  visit_summary: string | null;
  vitals: Vitals | null;
  medications: Medication[] | null;
  consult_notes: ConsultNotes | null;
  status: VisitStatus;
  raw_transcript: string | null;
  nurse_id: string | null;
}


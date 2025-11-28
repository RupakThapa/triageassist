/**
 * JSON Schema validation for Visit Data
 * Used for validating AI output and form submissions
 */

import { z } from 'zod';

/**
 * Zod schema matching the PRD data dictionary
 */
export const vitalsSchema = z.object({
  pain_level: z.number().int().min(0).max(10).nullable(),
  pain_type: z.string().nullable(),
  pain_location: z.string().nullable(),
});

export const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string(),
  status: z.enum(['Current', 'Prescribed', 'Discontinued']),
});

export const consultNotesSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  plan: z.string(),
});

export const visitDataSchema = z.object({
  visit_summary: z.string().min(1),
  vitals: vitalsSchema,
  medications: z.array(medicationSchema),
  consult_notes: consultNotesSchema,
});

/**
 * Type inference from schema
 */
export type VisitDataSchema = z.infer<typeof visitDataSchema>;
export type VitalsSchema = z.infer<typeof vitalsSchema>;
export type MedicationSchema = z.infer<typeof medicationSchema>;
export type ConsultNotesSchema = z.infer<typeof consultNotesSchema>;

/**
 * Validation helper functions
 */
export function validateVisitData(data: unknown): {
  success: boolean;
  data?: VisitDataSchema;
  errors?: z.ZodError;
} {
  const result = visitDataSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}


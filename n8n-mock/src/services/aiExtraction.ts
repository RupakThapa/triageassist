/**
 * AI Extraction Service
 * Uses GPT-4o to extract structured data from transcript
 */

import OpenAI from 'openai';
import { config } from '../config';
import { VisitData } from '../../../shared/types';
import { validateVisitData } from '../../../shared/schemas/visit.schema';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * System prompt for GPT-4o to enforce structured JSON output
 */
const SYSTEM_PROMPT = `You are a medical transcription assistant. Your task is to extract structured information from a medical triage conversation transcript.

You must output ONLY valid JSON matching this exact structure:
{
  "visit_summary": "A 1-2 sentence professional summary of the visit.",
  "vitals": {
    "pain_level": 0-10 integer or null if not mentioned,
    "pain_type": "e.g., 'Throbbing', 'Sharp', 'Dull', 'Burning', 'Aching', 'Stabbing', or null",
    "pain_location": "Body part mentioned or null"
  },
  "medications": [
    {
      "name": "Drug name (normalized)",
      "dosage": "e.g., '50mg', '200mg'",
      "status": "Either 'Current' or 'Prescribed'"
    }
  ],
  "consult_notes": {
    "subjective": "Patient's verbal complaints and symptoms",
    "objective": "Nurse's observations and findings",
    "plan": "Next steps, recommendations, or treatment plan"
  }
}

Rules:
- Output ONLY the JSON object, no markdown, no code blocks, no explanations
- Use null for missing values, not empty strings
- Extract pain level as integer 0-10
- Normalize medication names (e.g., "ibuprofen" not "Ibuprofen")
- Be clinically accurate and professional
- If information is not mentioned, use null for that field`;

/**
 * Extracts structured data from transcript using GPT-4o
 */
export async function extractStructuredData(transcript: string): Promise<VisitData> {
  try {
    logger.debug('Calling GPT-4o for structured extraction');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Extract structured medical data from this transcript:\n\n${transcript}` },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      response_format: { type: 'json_object' }, // Force JSON output
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    logger.debug('Received response from GPT-4o');

    // Parse JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      logger.error('Failed to parse JSON from GPT-4o:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate against schema
    const validation = validateVisitData(parsedData);
    if (!validation.success) {
      logger.error('Validation errors:', validation.errors);
      throw new Error('AI output does not match required schema');
    }

    logger.info('Successfully extracted and validated structured data');
    return validation.data!;
  } catch (error) {
    logger.error('AI extraction error:', error);
    throw error;
  }
}


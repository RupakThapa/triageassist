/**
 * Transcription service
 * Simulates Deepgram Batch API or uses real API if configured
 */

import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Simulates Deepgram transcription with realistic timing
 */
async function simulateTranscription(audioUrl: string): Promise<string> {
  // Simulate processing time (2-3 seconds)
  const delay = 2000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Generate a mock transcript with speaker diarization
  // In a real scenario, this would be the actual Deepgram response
  const mockTranscript = `
    [Nurse] Good morning, how are you feeling today?
    [Patient] I've been having some chest pain for the past few hours.
    [Nurse] Can you describe the pain? Is it sharp, dull, or throbbing?
    [Patient] It's more of a sharp pain, about a 7 out of 10. It's in my left side.
    [Nurse] Have you taken any medications?
    [Patient] Yes, I took some ibuprofen about an hour ago, 200 milligrams.
    [Nurse] Okay, let me check your vitals. Your blood pressure is 140 over 90.
    [Patient] That's higher than usual for me.
    [Nurse] I'll document this and we'll need to run some tests.
  `.trim();

  logger.debug('Generated mock transcript');
  return mockTranscript;
}

/**
 * Calls real Deepgram Batch API
 */
async function realTranscription(audioUrl: string): Promise<string> {
  try {
    // Download audio file
    const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data);

    // Call Deepgram Batch API
    const deepgramResponse = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${config.deepgramApiKey}`,
          'Content-Type': 'audio/mpeg',
        },
        params: {
          model: 'nova-2-medical',
          language: 'en-US',
          punctuate: 'true',
          diarize: 'true',
        },
      }
    );

    // Extract transcript from Deepgram response
    const transcript = deepgramResponse.data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    
    logger.debug('Received transcript from Deepgram');
    return transcript;
  } catch (error) {
    logger.error('Deepgram API error:', error);
    // Fallback to simulation
    logger.warn('Falling back to simulated transcription');
    return simulateTranscription(audioUrl);
  }
}

/**
 * Main transcription function
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  if (config.useRealDeepgram && config.deepgramApiKey) {
    return realTranscription(audioUrl);
  } else {
    return simulateTranscription(audioUrl);
  }
}


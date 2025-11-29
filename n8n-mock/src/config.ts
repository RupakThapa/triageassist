/**
 * Configuration management for n8n-mock service
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Deepgram (optional)
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || '',
  useRealDeepgram: process.env.USE_REAL_DEEPGRAM === 'true',
  
  // Processing timing
  processingDelayMin: parseInt(process.env.PROCESSING_DELAY_MIN || '10000', 10),
  processingDelayMax: parseInt(process.env.PROCESSING_DELAY_MAX || '15000', 10),
  
  // Server
  port: parseInt(process.env.N8N_MOCK_PORT || process.env.PORT || '3001', 10),
  nodeEnv: process.env.N8N_MOCK_NODE_ENV || process.env.NODE_ENV || 'development',
};

// Validate required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.warn(`Warning: ${varName} is not set. Some features may not work.`);
  }
}


/**
 * Configuration management for backend API
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10),
  nodeEnv: process.env.BACKEND_NODE_ENV || process.env.NODE_ENV || 'development',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  
  // n8n-mock webhook
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:3001/webhook/process-visit',
  
  // Storage
  storageBucket: process.env.STORAGE_BUCKET || 'patient-audio-raw',
  
  // CORS
  corsOrigin: process.env.BACKEND_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validate required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.warn(`Warning: ${varName} is not set. Some features may not work.`);
  }
}


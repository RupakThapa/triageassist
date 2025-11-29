/**
 * Frontend configuration
 */

export const config = {
  // API
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Deepgram
  deepgramApiKey: process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '',
};


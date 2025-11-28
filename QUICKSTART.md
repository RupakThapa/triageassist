# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (for database and storage)
- OpenAI API key (for GPT-4o)
- Deepgram API key (optional, for real transcription)

## Step 1: Clone and Setup

```bash
cd triageassist
```

## Step 2: Setup n8n-mock Service

```bash
cd n8n-mock
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key  # Optional
USE_REAL_DEEPGRAM=false  # Set to true to use real Deepgram
```

## Step 3: Start n8n-mock Service

```bash
npm run dev
```

The service will start on `http://localhost:3001`

## Step 4: Test the Service

In another terminal, test the webhook:

```bash
curl -X POST http://localhost:3001/webhook/process-visit \
  -H "Content-Type: application/json" \
  -d '{
    "visitId": "test-visit-123",
    "audioUrl": "https://example.com/test-audio.mp3"
  }'
```

You should see:
```json
{
  "success": true,
  "visitId": "test-visit-123"
}
```

## Step 5: Check Health

```bash
curl http://localhost:3001/health
```

## Next Steps

1. **Set up Supabase Database**:
   - Create `visits` table (see `docs/ARCHITECTURE.md`)
   - Enable Realtime on the table
   - Create storage bucket `patient-audio-raw`

2. **Build Backend API**:
   - Set up Express server
   - Configure Supabase client
   - Implement audio upload endpoint
   - Connect to n8n-mock webhook

3. **Build Frontend**:
   - Set up React app
   - Integrate Deepgram WebSocket
   - Create recording interface
   - Set up Supabase Realtime subscription

## Development Tips

### Using Real Deepgram
To use actual Deepgram API instead of simulation:
```env
USE_REAL_DEEPGRAM=true
DEEPGRAM_API_KEY=your-actual-key
```

### Adjusting Processing Time
To change the simulated processing time:
```env
PROCESSING_DELAY_MIN=8000   # 8 seconds
PROCESSING_DELAY_MAX=12000  # 12 seconds
```

### Viewing Logs
The service logs all operations to console. In development mode, you'll see:
- Webhook requests
- Processing steps
- API calls
- Errors and retries

## Troubleshooting

### Service won't start
- Check Node.js version: `node --version` (should be 18+)
- Verify all required environment variables are set
- Check port 3001 is not in use

### Processing fails
- Verify Supabase credentials are correct
- Check OpenAI API key is valid
- Ensure network connectivity
- Review console logs for specific errors

### Database errors
- Verify Supabase URL and service role key
- Check `visits` table exists
- Ensure service role key has proper permissions

## Architecture Overview

```
┌─────────────┐
│  Frontend   │  (To be built)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │  (To be built)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  n8n-mock   │  ✅ Ready
└──────┬──────┘
       │
       ├──► Supabase (Database)
       ├──► OpenAI (GPT-4o)
       └──► Deepgram (Optional)
```

## Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [n8n-mock Integration Guide](./docs/N8N_MOCK_INTEGRATION.md)
- [Project Summary](./PROJECT_SUMMARY.md)


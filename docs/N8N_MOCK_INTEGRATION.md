# n8n-mock Service Integration Guide

## Overview

The `n8n-mock` service is a standalone Node.js service that simulates the n8n workflow for processing medical triage audio recordings. It's designed to be **completely interchangeable** with the real n8n service, allowing seamless switching between development and production environments.

## Key Features

### 1. Interchangeability
- Uses the same webhook interface as n8n
- Accepts the same payload structure
- Returns the same response format
- Can be swapped by changing a single environment variable

### 2. Realistic Simulation
- Simulates processing timing (10-15 seconds)
- Mimics Deepgram transcription behavior
- Applies real PII redaction
- Uses actual GPT-4o for AI extraction

### 3. Development-Friendly
- Can run locally without n8n infrastructure
- Supports both simulated and real API calls
- Comprehensive logging for debugging
- Easy to test and iterate

## Architecture

```
┌─────────────┐
│   Backend   │
│     API     │
└──────┬──────┘
       │
       │ POST /webhook/process-visit
       │ { visitId, audioUrl }
       │
       ▼
┌─────────────┐
│  n8n-mock   │
│   Service   │
└──────┬──────┘
       │
       ├──► Download Audio (Supabase Storage)
       ├──► Transcribe (Deepgram or Simulated)
       ├──► Redact PII (Regex Patterns)
       ├──► Extract Data (GPT-4o)
       └──► Update Database (Supabase)
```

## Webhook Interface

### Request

**Endpoint**: `POST /webhook/process-visit`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "audioUrl": "https://supabase-storage-url/visit-123.mp3",
  "nurseId": "optional-nurse-uuid"
}
```

### Response

**Success** (200 OK):
```json
{
  "success": true,
  "visitId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error** (400/500):
```json
{
  "success": false,
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "error": "Error message here"
}
```

## Processing Flow

### Step 1: Audio Download
- Downloads audio file from Supabase Storage using signed URL
- Validates file exists and is accessible
- **Time**: ~1 second

### Step 2: Transcription
- **If `USE_REAL_DEEPGRAM=true`**: Calls actual Deepgram Batch API
- **Otherwise**: Simulates transcription with realistic timing
- Returns transcript with speaker diarization
- **Time**: 2-3 seconds

### Step 3: PII Redaction
- Applies regex patterns to remove:
  - SSN: `\d{3}-\d{2}-\d{4}`
  - Phone: `\d{3}-\d{3}-\d{4}` or `\(\d{3}\)\s?\d{3}-\d{4}`
  - Email: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
- **Time**: <1 second

### Step 4: AI Extraction
- Calls GPT-4o with structured prompt
- Extracts visit summary, vitals, medications, consult notes
- Validates JSON output against schema
- **Time**: 5-8 seconds

### Step 5: Database Update
- Updates Supabase `visits` table
- Triggers Realtime update (notifies frontend)
- **Time**: ~1 second

**Total Processing Time**: 10-15 seconds

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | Yes | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | - | Supabase service role key (bypasses RLS) |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for GPT-4o |
| `DEEPGRAM_API_KEY` | No | - | Deepgram API key (if using real API) |
| `USE_REAL_DEEPGRAM` | No | `false` | Use real Deepgram API vs simulation |
| `PROCESSING_DELAY_MIN` | No | `10000` | Min processing time in ms |
| `PROCESSING_DELAY_MAX` | No | `15000` | Max processing time in ms |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |

### Switching Between Mock and Real n8n

#### Using n8n-mock (Development)
```env
# Backend .env
N8N_WEBHOOK_URL=http://localhost:3001/webhook/process-visit
```

#### Using Real n8n (Production)
```env
# Backend .env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/process-visit
```

No code changes needed! The webhook interface is identical.

## Running the Service

### Development
```bash
cd n8n-mock
npm install
npm run dev  # Uses tsx watch for hot reload
```

### Production
```bash
cd n8n-mock
npm install
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## Testing

### Manual Testing
```bash
# Start the service
npm run dev

# In another terminal, send a test webhook
curl -X POST http://localhost:3001/webhook/process-visit \
  -H "Content-Type: application/json" \
  -d '{
    "visitId": "test-visit-id",
    "audioUrl": "https://example.com/test-audio.mp3"
  }'
```

### Unit Tests
```bash
npm test
```

## Error Handling

### Audio Download Failure
- **Behavior**: Returns error response
- **Visit Status**: Remains in 'processing' state
- **Recovery**: Manual entry fallback

### Transcription Failure
- **Behavior**: Falls back to mock transcript
- **Logging**: Error logged, processing continues
- **Recovery**: AI can still extract data from mock transcript

### AI Processing Failure
- **Behavior**: Returns error response
- **Visit Status**: Set to 'review' (allows manual entry)
- **Recovery**: Nurse can manually fill form

### Database Update Failure
- **Behavior**: Retries up to 3 times
- **Logging**: All retry attempts logged
- **Recovery**: If all retries fail, error returned

## Monitoring

### Logs
The service logs:
- Webhook requests (with timing)
- Processing steps and durations
- Errors and retries
- API calls (Deepgram, OpenAI)

### Health Check
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "service": "n8n-mock"
}
```

## Performance Considerations

### Processing Time
- **Target**: 10-15 seconds total
- **Breakdown**:
  - Transcription: 2-3s
  - PII Redaction: <1s
  - AI Extraction: 5-8s
  - Database Update: ~1s

### Scalability
- Stateless service (can be horizontally scaled)
- Each request is independent
- No shared state between requests

### Rate Limiting
- Consider adding rate limiting for production
- OpenAI API has rate limits
- Deepgram API has rate limits

## Security

### API Keys
- Never commit `.env` files
- Use environment variables or secret management
- Rotate keys regularly

### PII Handling
- PII redaction happens before AI processing
- Redacted transcript stored in database
- Original audio encrypted at rest (Supabase)

### Network Security
- Use HTTPS in production
- Validate webhook requests (optional: add signature verification)
- Restrict access to service (firewall, VPN)

## Troubleshooting

### Service Won't Start
- Check environment variables are set
- Verify port 3001 is available
- Check Node.js version (18+)

### Processing Fails
- Check Supabase credentials
- Verify OpenAI API key is valid
- Check network connectivity
- Review logs for specific errors

### Slow Processing
- Check OpenAI API response times
- Verify Supabase connection
- Check system resources (CPU, memory)

## Future Enhancements

### Queue System
- Add job queue (Bull, BullMQ) for better reliability
- Retry failed jobs automatically
- Monitor queue status

### Caching
- Cache common transcriptions
- Cache AI responses for similar inputs

### Metrics
- Add Prometheus metrics
- Track processing times
- Monitor error rates

### RAG Integration
- Add Pinecone integration for "Protocol of the Month"
- Include protocol context in AI prompt


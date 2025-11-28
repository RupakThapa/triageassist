# n8n-mock Service

A simulated n8n workflow service that mimics the behavior of the real n8n workflow for development and testing purposes.

## Purpose

This service simulates the n8n workflow that processes audio recordings and generates structured medical records. It is designed to be **interchangeable** with the real n8n service, meaning you can switch between them by simply changing the webhook URL.

## Features

- ✅ Simulates Deepgram Batch API transcription (with realistic timing)
- ✅ Applies PII redaction (SSN, phone numbers, emails)
- ✅ Calls GPT-4o for structured JSON extraction
- ✅ Updates Supabase database with results
- ✅ Triggers Supabase Realtime updates
- ✅ Simulates realistic processing time (10-15 seconds)
- ✅ Same webhook interface as real n8n

## Architecture

```
Webhook Request
    ↓
Download Audio from Supabase Storage
    ↓
Simulate Deepgram Transcription (2-3 seconds)
    ↓
Apply PII Redaction (1 second)
    ↓
Call GPT-4o API (5-8 seconds)
    ↓
Validate JSON Structure
    ↓
Update Supabase Database (1 second)
    ↓
Return Success Response
```

## API Endpoints

### POST /webhook/process-visit

Processes an audio file and generates structured visit data.

**Request Body**:
```json
{
  "visitId": "uuid-here",
  "audioUrl": "https://supabase-storage-url/visit-123.mp3",
  "nurseId": "optional-nurse-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "visitId": "uuid-here"
}
```

**Error Response**:
```json
{
  "success": false,
  "visitId": "uuid-here",
  "error": "Error message"
}
```

## Configuration

### Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for GPT-4o)
OPENAI_API_KEY=your-openai-api-key

# Deepgram (optional, for actual transcription simulation)
DEEPGRAM_API_KEY=your-deepgram-api-key

# Processing Configuration
PROCESSING_DELAY_MIN=10000  # Minimum processing time in ms (10 seconds)
PROCESSING_DELAY_MAX=15000  # Maximum processing time in ms (15 seconds)
USE_REAL_DEEPGRAM=false     # Set to true to use real Deepgram API
```

## Processing Steps

### 1. Audio Download
Downloads the audio file from Supabase Storage using the provided signed URL.

### 2. Transcription Simulation
- If `USE_REAL_DEEPGRAM=true`: Calls actual Deepgram Batch API
- Otherwise: Simulates transcription with realistic timing (2-3 seconds)
- Returns transcript with speaker diarization (Nurse vs Patient)

### 3. PII Redaction
Applies regex patterns to redact:
- SSN: `\d{3}-\d{2}-\d{4}`
- Phone: `\d{3}-\d{3}-\d{4}` or `\(\d{3}\)\s?\d{3}-\d{4}`
- Email: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`

### 4. AI Extraction
Calls GPT-4o with a structured prompt to extract:
- Visit summary
- Vitals (pain level, type, location)
- Medications
- Consult notes (subjective, objective, plan)

### 5. Database Update
Updates the Supabase `visits` table with:
- `visit_summary`
- `vitals` (JSONB)
- `medications` (JSONB)
- `consult_notes` (JSONB)
- `raw_transcript` (PII-redacted)
- `status` = 'review'

### 6. Realtime Trigger
The database update automatically triggers Supabase Realtime, which notifies the frontend to update the form.

## Timing Simulation

The service simulates realistic processing times:
- **Total**: 10-15 seconds (configurable)
- **Transcription**: 2-3 seconds
- **PII Redaction**: 1 second
- **AI Processing**: 5-8 seconds
- **Database Update**: 1 second

Random delays are added to make the simulation more realistic.

## Interchangeability with Real n8n

To switch from n8n-mock to real n8n:

1. Update the webhook URL in backend configuration
2. Ensure real n8n uses the same webhook interface
3. No code changes needed in frontend or backend

The webhook interface is designed to match what n8n would expect:
- Same request payload structure
- Same response format
- Same error handling

## Development

### Installation

```bash
cd n8n-mock
npm install
```

### Running

```bash
npm run dev  # Development mode with hot reload
npm start    # Production mode
```

### Testing

```bash
npm test
```

## Error Handling

- **Audio Download Failure**: Returns error, visit status remains 'processing'
- **Transcription Failure**: Falls back to mock transcript, logs error
- **AI Processing Failure**: Returns error, allows manual entry
- **Database Update Failure**: Retries up to 3 times, then returns error

## Logging

The service logs:
- Webhook requests
- Processing steps and timing
- Errors and retries
- API calls (Deepgram, OpenAI)

Logs are output to console and can be redirected to a file or logging service.


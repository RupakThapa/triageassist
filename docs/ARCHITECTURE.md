# Architecture Documentation

## System Architecture

### Component Diagram

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         ├─── WebSocket ────► Deepgram (nova-2-medical)
         │
         ├─── HTTPS ────────► Backend API
         │
         └─── Realtime ─────► Supabase (PostgreSQL)
                 ▲
                 │
┌────────────────┴────────┐
│   Backend API           │
│   (Node.js/Express)     │
└────────┬────────────────┘
         │
         ├─── Upload ──────► Supabase Storage
         │
         └─── Trigger ─────► n8n-mock Service
                              │
                              ├─── Transcription ──► Deepgram Batch API
                              ├─── PII Redaction ──► Guardrails
                              └─── AI Extraction ──► GPT-4o
```

## Service Details

### Frontend Service

**Technology**: React + TypeScript + Vite

**Key Responsibilities**:
- WebSocket connection to Deepgram for live transcription
- Dual audio capture (stream + buffer)
- Supabase Realtime subscription for form updates
- React Hook Form for structured data entry
- Audio playback from Supabase Storage

**Key Components**:
- `RecordingScreen`: Main recording interface
- `LiveTranscript`: Real-time text display
- `AudioPlayer`: Playback component
- `TriageForm`: Structured data entry form

### Backend API Service

**Technology**: Node.js + Express + TypeScript

**Key Responsibilities**:
- Handle audio file uploads
- Store files in Supabase Storage
- Trigger n8n-mock workflow
- Manage database operations
- Handle Supabase Realtime triggers

**Endpoints**:
- `POST /api/visits`: Create new visit record
- `POST /api/visits/:id/audio`: Upload audio file
- `GET /api/visits/:id`: Get visit record
- `PUT /api/visits/:id`: Update visit record

### n8n-mock Service

**Technology**: Node.js + Express + TypeScript

**Key Responsibilities**:
- Simulate n8n workflow behavior
- Process audio files (simulated transcription)
- Apply PII redaction rules
- Call GPT-4o for structured extraction
- Update Supabase database with results
- Simulate realistic timing (10-15 seconds)

**Workflow Simulation**:
1. Receive webhook from backend
2. Simulate Deepgram Batch API call (with timing)
3. Apply PII redaction (regex patterns)
4. Call GPT-4o with structured prompt
5. Parse and validate JSON response
6. Update Supabase visits table
7. Trigger Realtime update

**Interchangeability**:
- Uses same webhook interface as n8n
- Outputs same data structure
- Can be swapped by changing webhook URL
- Environment variable controls which service to use

## Data Flow

### Recording Phase (Fast Lane)

```
Nurse → Start Recording
  ↓
Frontend → WebSocket Connection → Deepgram
  ↓
Deepgram → Real-time Transcript → Frontend (< 300ms)
  ↓
Frontend → Display Text (ephemeral, not stored)
```

### Processing Phase (Slow Lane)

```
Nurse → Stop Recording
  ↓
Frontend → Upload Audio Blob → Backend API
  ↓
Backend → Store in Supabase Storage
  ↓
Backend → Trigger Webhook → n8n-mock
  ↓
n8n-mock → Process (10-15 seconds)
  ├── Simulate Transcription
  ├── PII Redaction
  └── AI Extraction
  ↓
n8n-mock → Update Supabase Database
  ↓
Supabase Realtime → Notify Frontend
  ↓
Frontend → Auto-populate Form Fields
```

## Database Schema

### visits Table

```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  audio_url TEXT, -- Supabase Storage signed URL
  visit_summary TEXT,
  vitals JSONB,
  medications JSONB,
  consult_notes JSONB,
  status TEXT DEFAULT 'recording', -- recording, processing, review, completed
  raw_transcript TEXT, -- PII-redacted transcript
  nurse_id UUID REFERENCES users(id)
);
```

## Integration Points

### Deepgram Integration

**Live Transcription**:
- WebSocket endpoint: `wss://api.deepgram.com/v1/listen`
- Model: `nova-2-medical`
- Language: `en-US`
- Features: `punctuate`, `diarize`

**Batch Transcription**:
- REST endpoint: `POST https://api.deepgram.com/v1/listen`
- Same model and features
- Used by n8n-mock for full audio processing

### Supabase Integration

**Storage**:
- Bucket: `patient-audio-raw`
- File naming: `visit-{uuid}.mp3`
- Encryption: At rest (Supabase managed)

**Realtime**:
- Channel: `visits:{visit_id}`
- Event: `UPDATE`
- Payload: Full visit record

**Database**:
- PostgreSQL with Row Level Security (RLS)
- Realtime enabled on `visits` table

### n8n-mock Integration

**Webhook Interface**:
- Endpoint: `POST /webhook/process-visit`
- Payload: `{ visitId, audioUrl }`
- Response: `{ success: true, visitId }`

**Processing Steps**:
1. Download audio from Supabase Storage
2. Simulate Deepgram transcription (with delay)
3. Apply PII redaction
4. Call GPT-4o
5. Update database
6. Return success

## Security Considerations

### HIPAA Compliance

1. **Encryption at Rest**: Supabase Storage encryption
2. **PII Redaction**: Before AI processing
3. **UUID Filenames**: No patient identifiers
4. **Access Control**: Row Level Security (RLS)
5. **Audit Logging**: Track all data access

### PII Redaction Patterns

- SSN: `\d{3}-\d{2}-\d{4}`
- Phone: `\d{3}-\d{3}-\d{4}` or `\(\d{3}\)\s?\d{3}-\d{4}`
- Email: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`

## Performance Targets

- **Live Transcription Latency**: < 300ms
- **Processing Time**: 10-15 seconds
- **Form Update Latency**: < 1 second (after processing)
- **Audio Upload**: < 5 seconds (for typical 2-3 minute recording)

## Error Handling

### WebSocket Failure
- Continue recording in background
- Show warning to user
- Ensure audio blob is still captured

### Processing Failure
- Retry mechanism in n8n-mock
- Fallback to manual entry
- Log errors for debugging

### Network Failure
- Queue uploads for retry
- Show offline indicator
- Sync when connection restored


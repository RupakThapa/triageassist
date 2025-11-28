# TriageAssist - Medical Triage Assistant

A HIPAA-compliant, voice-first medical triage assistant for nurses that provides real-time transcription and automated structured record generation.

## Architecture Overview

### Fast Lane (Visuals)
- **Protocol**: WebSocket (wss://)
- **Provider**: Deepgram (nova-2-medical)
- **Latency**: < 300ms from speech to screen
- **Data**: Ephemeral, never stored

### Slow Lane (Record)
- **Protocol**: HTTPS (POST)
- **Orchestrator**: n8n (or n8n-mock for development)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Model**: GPT-4o

## Project Structure

```
triageassist/
├── frontend/              # React tablet application
├── backend/               # API server (Supabase integration)
├── n8n-mock/             # Simulated n8n workflow service
├── shared/               # Shared types and utilities
├── docs/                 # Documentation
└── README.md
```

## Key Features

1. **Live Transcription**: Real-time WebSocket connection to Deepgram
2. **Dual Audio Capture**: Stream to WebSocket + buffer locally
3. **Automated Processing**: AI converts conversation to structured JSON
4. **Real-time Sync**: Supabase Realtime updates form fields
5. **HIPAA Compliance**: PII redaction, encrypted storage, UUID-based filenames

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Deepgram API key
- OpenAI API key (for n8n-mock)

### Environment Variables
See `.env.example` files in each service directory.

## Services

### Frontend
React-based tablet application with:
- Deepgram WebSocket integration
- Supabase Realtime subscriptions
- React Hook Form for structured data
- Audio playback component

### Backend
API server handling:
- Supabase authentication
- File upload to Supabase Storage
- Database operations
- Realtime triggers

### n8n-mock
Simulated n8n workflow service that:
- Mimics n8n processing timing (10-15 seconds)
- Simulates transcription, PII redaction, and AI processing
- Outputs structured JSON matching the data dictionary
- Can be swapped with real n8n service seamlessly

## Data Flow

1. **Recording Start**: Frontend establishes WebSocket + starts local buffer
2. **Live Transcription**: Deepgram streams text to UI (< 300ms latency)
3. **Stop Recording**: Audio blob uploaded to Supabase Storage
4. **Processing**: n8n-mock (or n8n) processes audio → transcription → PII redaction → AI extraction
5. **Update**: Supabase Realtime triggers form auto-population
6. **Review**: Nurse reviews and edits structured data
7. **Save**: Final record committed to database

## Security & Compliance

- All audio encrypted at rest
- PII redaction before AI processing
- UUID-based filenames (no patient names)
- HIPAA-compliant data handling


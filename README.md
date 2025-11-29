# TriageAssist - Medical Triage Assistant

A HIPAA-compliant, voice-first medical triage assistant for nurses that provides real-time transcription and automated structured record generation.

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend (Next.js)
cd frontend && npm install

# n8n-mock
cd n8n-mock && npm install
```

### 2. Configure Environment

**Backend & n8n-mock**: Edit `.env` in root directory

**Frontend**: Edit `frontend/.env.local`

### 3. Set Up Supabase

1. Create the `visits` table (see `SETUP.md`)
2. Create storage bucket `patient-audio-raw`
3. Enable Realtime on `visits` table

### 4. Start Services

```bash
# Terminal 1: n8n-mock (port 3001)
cd n8n-mock && npm run dev

# Terminal 2: Backend API (port 3000)
cd backend && npm run dev

# Terminal 3: Frontend (port 3000 or next available)
cd frontend && npm run dev
```

### 5. Open Application

Visit http://localhost:3000 (or the port shown in terminal)

## Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js (React)
│   Port 3000+    │
└────────┬────────┘
         │
         ├─── WebSocket ────► Deepgram (nova-2-medical)
         │
         ├─── REST API ─────► Backend API (Port 3000)
         │
         └─── Realtime ─────► Supabase
                 ▲
                 │
┌────────────────┴────────┐
│   Backend API           │  Express + TypeScript
│   Port 3000             │
└────────┬────────────────┘
         │
         ├─── Storage ─────► Supabase Storage
         │
         └─── Webhook ─────► n8n-mock (Port 3001)
                              │
                              ├─── Transcription
                              ├─── PII Redaction
                              └─── AI Extraction (GPT-4o)
```

## Project Structure

```
triageassist/
├── frontend/          # Next.js app (React + TypeScript + Tailwind)
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Services (API, Supabase)
│   └── types/        # TypeScript types
├── backend/          # Express API server
├── n8n-mock/         # Simulated n8n workflow
├── shared/           # Shared types (for backend/n8n-mock)
├── docs/             # Documentation
└── .env              # Environment variables (backend/n8n-mock)
```

## Key Features

1. **Live Transcription**: Real-time WebSocket to Deepgram (< 300ms latency)
2. **Dual Audio Capture**: Stream to WebSocket + buffer locally
3. **Automated Processing**: AI converts conversation to structured JSON
4. **Real-time Sync**: Supabase Realtime updates form fields
5. **HIPAA Compliance**: PII redaction, encrypted storage, UUID filenames

## Environment Variables

### Backend & n8n-mock (`.env`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEEPGRAM_API_KEY`

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o
- **Transcription**: Deepgram (nova-2-medical)

## Security

- PII redaction before AI processing
- Encrypted storage (Supabase)
- UUID-based filenames
- HIPAA-compliant data handling

## Documentation

- `SETUP.md` - Detailed setup instructions
- `TESTING_GUIDE.md` - Testing guide
- `API_KEYS_GUIDE.md` - API keys setup
- `docs/ARCHITECTURE.md` - System architecture

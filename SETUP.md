# Setup Guide

## Prerequisites

- Node.js 18+
- npm
- Supabase account
- OpenAI API key
- Deepgram API key

## Step 1: Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# n8n-mock
cd n8n-mock && npm install
```

## Step 2: Configure Environment

### Backend & n8n-mock

Edit `.env` in root directory with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key
```

### Frontend

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEEPGRAM_API_KEY=your-deepgram-api-key
```

## Step 3: Set Up Supabase Database

Run this SQL in your Supabase SQL editor:

```sql
-- Create visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  audio_url TEXT,
  visit_summary TEXT,
  vitals JSONB,
  medications JSONB,
  consult_notes JSONB,
  status TEXT DEFAULT 'recording',
  raw_transcript TEXT,
  nurse_id UUID
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE visits;

-- Create indexes
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_created_at ON visits(created_at);
```

### Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create bucket named `patient-audio-raw`
3. Make it public or configure RLS

## Step 4: Start Services

Open 3 terminal windows:

### Terminal 1: n8n-mock
```bash
cd n8n-mock
npm run dev
```
Should show: `n8n-mock service running on port 3001`

### Terminal 2: Backend
```bash
cd backend
npm run dev
```
Should show: `Backend API server running on port 3000`

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```
Should show: `Local: http://localhost:3000`

## Step 5: Test

1. Open http://localhost:3000 in browser
2. Click "New Visit"
3. Click "Start Recording" (allow microphone)
4. Speak test dialogue
5. Click "Stop & Analyze"
6. Wait 10-15 seconds for processing
7. Review auto-populated form
8. Click "Finalize & Save"

## Troubleshooting

### Frontend shows error
- Check `frontend/.env.local` has correct values
- Restart frontend: `npm run dev`

### API returns Network Error
- Check backend is running on port 3000
- Check CORS settings in backend

### Processing fails
- Check n8n-mock is running
- Check OpenAI API key is valid
- Check Supabase credentials

### Realtime not working
- Verify Realtime is enabled on visits table
- Check Supabase Realtime settings

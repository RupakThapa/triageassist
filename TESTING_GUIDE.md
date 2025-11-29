# Testing Guide - Step by Step

## Prerequisites Checklist

Before testing, make sure you have:

- [ ] ✅ `.env` file configured with all API keys
- [ ] ✅ Supabase project set up
- [ ] ✅ Database table created
- [ ] ✅ Storage bucket created
- [ ] ✅ All dependencies installed

## Step 1: Set Up Supabase Database

### Create the `visits` table:

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste this SQL and run it:

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
CREATE INDEX idx_visits_nurse_id ON visits(nurse_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_created_at ON visits(created_at);
```

5. Click **Run** (or press Cmd/Ctrl + Enter)

### Create Storage Bucket:

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Name it: `patient-audio-raw`
4. Make it **Public** (or configure RLS as needed)
5. Click **Create bucket**

## Step 2: Start All Services

You need **3 terminal windows** open:

### Terminal 1: n8n-mock Service
```bash
cd n8n-mock
npm run dev
```
✅ Should see: `n8n-mock service running on port 3001`

### Terminal 2: Backend API
```bash
cd backend
npm run dev
```
✅ Should see: `Backend API server running on port 3000`

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```
✅ Should see: `Local: http://localhost:5173`

## Step 3: Test the Application

### 3.1 Open the Frontend

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see: "TriageAssist" with a "New Visit" button

### 3.2 Create a New Visit

1. Click **"New Visit"** button
2. You should see the recording screen

### 3.3 Test Recording

1. Click **"Start Recording"** button
2. **Allow microphone access** when prompted
3. Speak something like:
   - "Good morning, how are you feeling today?"
   - "I've been having chest pain, about a 7 out of 10"
   - "It's a sharp pain in my left side"
   - "I took ibuprofen, 200 milligrams"

4. You should see:
   - ✅ Button changes to "Stop & Analyze" (red, pulsing)
   - ✅ Live transcript appears below (words appear as you speak)
   - ✅ Transcript updates in real-time

### 3.4 Stop Recording and Process

1. Click **"Stop & Analyze"** button
2. You should see:
   - ✅ "Processing Clinical Data..." spinner appears
   - ✅ Live transcript fades out
   - ✅ Wait 10-15 seconds for processing

### 3.5 Review Auto-Populated Form

After processing completes, you should see:

1. ✅ Audio player appears (you can play back the recording)
2. ✅ Form appears with auto-populated data:
   - Visit summary
   - Pain level (slider)
   - Pain type (dropdown)
   - Pain location
   - Medications list
   - Consult notes (subjective, objective, plan)

### 3.6 Edit and Save

1. Review the auto-populated data
2. Make any edits if needed (e.g., adjust pain level)
3. Click **"Finalize & Save"** button
4. You should see: "Visit saved successfully!" alert

## Step 4: Verify Everything Worked

### Check Backend Logs (Terminal 2):
- ✅ Should see: "Created visit {id}"
- ✅ Should see: "Uploading audio for visit {id}"
- ✅ Should see: "Audio uploaded successfully"

### Check n8n-mock Logs (Terminal 1):
- ✅ Should see: "Processing visit {id}"
- ✅ Should see: "Transcription completed"
- ✅ Should see: "PII redaction completed"
- ✅ Should see: "AI extraction completed"
- ✅ Should see: "Database update completed"

### Check Supabase:
1. Go to **Table Editor** → **visits**
2. You should see your visit record with:
   - ✅ All fields populated
   - ✅ Status = "completed"
   - ✅ JSON data in vitals, medications, consult_notes

## Troubleshooting

### Frontend won't load:
- Check Terminal 3 for errors
- Verify `VITE_API_URL` in `.env` is correct
- Check browser console for errors

### Recording doesn't work:
- Check browser console for Deepgram errors
- Verify `VITE_DEEPGRAM_API_KEY` is set
- Allow microphone permissions in browser

### Processing fails:
- Check n8n-mock logs (Terminal 1)
- Verify `OPENAI_API_KEY` is set correctly
- Check Supabase credentials

### Form doesn't auto-populate:
- Check Supabase Realtime is enabled on `visits` table
- Check browser console for Realtime connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Backend errors:
- Check Terminal 2 for error messages
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase storage bucket exists

## Expected Flow Timeline

```
0s    - Click "Start Recording"
<1s   - Live transcript starts appearing
30s   - Speak test dialogue
30s   - Click "Stop & Analyze"
30s   - Audio uploads to Supabase
31s   - n8n-mock starts processing
31-45s - Processing (transcription → PII → AI)
45s   - Form auto-populates
45s   - Review and edit form
60s   - Click "Finalize & Save"
60s   - Visit saved to database
```

## Success Criteria

✅ All three services start without errors
✅ Frontend loads at http://localhost:5173
✅ Recording starts and shows live transcript
✅ Audio uploads successfully
✅ Processing completes in 10-15 seconds
✅ Form auto-populates with structured data
✅ Visit saves successfully to database

## Next Steps After Testing

Once everything works:
1. Test with longer recordings (2-3 minutes)
2. Test error scenarios (disconnect, invalid keys)
3. Test form validation
4. Add authentication (if needed)
5. Deploy to production


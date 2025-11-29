# API Keys Setup Guide

This guide will help you obtain all the required API keys for TriageAssist.

## Required API Keys

### 1. Supabase (Required for all services)

**Where to get:**
1. Go to https://supabase.com
2. Create a new project or use an existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

**In `.env` file:**
```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Also set in Frontend section:**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. OpenAI API Key (Required for n8n-mock)

**Where to get:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)

**In `.env` file:**
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** You'll need a paid OpenAI account with credits to use GPT-4o.

### 3. Deepgram API Key (Required for Frontend, Optional for n8n-mock)

**Where to get:**
1. Go to https://console.deepgram.com/
2. Sign up or sign in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key

**In `.env` file:**
```env
# For Frontend (required for live transcription)
VITE_DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# For n8n-mock (optional, only if USE_REAL_DEEPGRAM=true)
DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** Deepgram offers free credits for new accounts.

## Quick Setup Checklist

- [ ] Supabase project created
- [ ] Supabase API keys copied to `.env`
- [ ] OpenAI API key created and added to `.env`
- [ ] Deepgram API key created and added to `.env`
- [ ] All `VITE_` prefixed variables set (for frontend)
- [ ] Supabase database table created (see `SETUP.md`)
- [ ] Supabase storage bucket created (`patient-audio-raw`)

## Testing Your Keys

### Test Supabase Connection
```bash
# Backend will show warnings if keys are missing
cd backend && npm run dev
```

### Test OpenAI Key
```bash
# n8n-mock will show warnings if key is missing
cd n8n-mock && npm run dev
```

### Test Deepgram Key
- Start the frontend and try recording
- Check browser console for Deepgram connection errors

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git (it's in `.gitignore`)
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret (it bypasses RLS)
- Don't share API keys publicly
- Rotate keys if they're exposed

## Cost Estimates

- **Supabase**: Free tier available (500MB database, 1GB storage)
- **OpenAI**: Pay-per-use (~$0.01-0.03 per request for GPT-4o)
- **Deepgram**: Free tier available (12,000 minutes/month)

## Need Help?

- Supabase Docs: https://supabase.com/docs
- OpenAI Docs: https://platform.openai.com/docs
- Deepgram Docs: https://developers.deepgram.com/


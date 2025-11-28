# Implementation Plan

## Phase 1: Project Setup & n8n-mock Service ✅

### Completed
- [x] Project structure created
- [x] n8n-mock service architecture designed
- [x] Shared types and schemas defined
- [x] n8n-mock service implementation started

### Next Steps
- [ ] Complete n8n-mock service implementation
- [ ] Add unit tests for n8n-mock
- [ ] Test n8n-mock with sample audio files
- [ ] Document API endpoints

## Phase 2: Backend API Service

### Tasks
- [ ] Set up Express/Node.js backend
- [ ] Configure Supabase client
- [ ] Implement audio upload endpoint
- [ ] Implement visit CRUD endpoints
- [ ] Set up Supabase Realtime triggers
- [ ] Add authentication middleware
- [ ] Create database schema migration
- [ ] Add error handling and logging

### Database Schema
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
  nurse_id UUID REFERENCES users(id)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE visits;

-- Create index for faster queries
CREATE INDEX idx_visits_nurse_id ON visits(nurse_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_created_at ON visits(created_at);
```

## Phase 3: Frontend Application

### Tasks
- [ ] Set up React + TypeScript + Vite project
- [ ] Install dependencies (Deepgram, Supabase, React Hook Form)
- [ ] Create recording screen component
- [ ] Implement Deepgram WebSocket connection
- [ ] Implement dual audio capture (stream + buffer)
- [ ] Create live transcript display component
- [ ] Set up Supabase Realtime subscription
- [ ] Create triage form with React Hook Form
- [ ] Implement audio player component
- [ ] Add form auto-population logic
- [ ] Style components (responsive tablet design)
- [ ] Add loading states and error handling

### Key Components

#### RecordingScreen
- Start/Stop recording button
- Live transcript display
- Processing spinner
- Audio player (after processing)

#### TriageForm
- Visit summary field
- Pain level slider (0-10)
- Pain type dropdown
- Pain location input
- Medications list (add/remove)
- Consult notes (subjective, objective, plan)
- Finalize & Save button

#### LiveTranscript
- Real-time text display
- Speaker labels (Nurse/Patient)
- Auto-scroll to bottom
- Fade out animation when processing starts

## Phase 4: Integration & Testing

### Tasks
- [ ] End-to-end testing
- [ ] Test WebSocket connection stability
- [ ] Test audio upload and processing
- [ ] Test Realtime updates
- [ ] Test form auto-population
- [ ] Test error scenarios
- [ ] Performance testing (latency targets)
- [ ] HIPAA compliance verification

### Test Scenarios
1. **Happy Path**: Complete recording → processing → form fill → save
2. **WebSocket Failure**: Test recording continues when WebSocket fails
3. **Processing Failure**: Test error handling and manual entry fallback
4. **Network Failure**: Test offline behavior and retry logic
5. **Long Recording**: Test with 5+ minute recordings
6. **Multiple Speakers**: Test speaker diarization display

## Phase 5: Deployment & Production

### Tasks
- [ ] Set up production Supabase project
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend API
- [ ] Deploy n8n-mock service (or switch to real n8n)
- [ ] Deploy frontend (static hosting)
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Set up backup strategy
- [ ] Document deployment process

## Phase 6: Real n8n Integration (Future)

### Tasks
- [ ] Set up self-hosted n8n instance
- [ ] Create n8n workflow matching n8n-mock behavior
- [ ] Configure Deepgram Batch API node
- [ ] Add PII redaction code node
- [ ] Configure OpenAI GPT-4o node
- [ ] Set up webhook endpoint
- [ ] Test n8n workflow
- [ ] Switch backend to use real n8n webhook
- [ ] Keep n8n-mock for local development

## Development Priorities

### P0 (Critical)
1. n8n-mock service (for development)
2. Backend API with audio upload
3. Frontend recording screen
4. Deepgram WebSocket integration
5. Supabase Realtime subscription
6. Form auto-population

### P1 (High)
1. Audio playback
2. Form validation
3. Error handling
4. Loading states
5. Basic styling

### P2 (Medium)
1. Advanced error recovery
2. Offline support
3. Performance optimization
4. Comprehensive testing
5. Documentation

## Timeline Estimate

- **Phase 1**: 1-2 days (n8n-mock setup)
- **Phase 2**: 3-5 days (Backend API)
- **Phase 3**: 5-7 days (Frontend)
- **Phase 4**: 2-3 days (Integration & Testing)
- **Phase 5**: 2-3 days (Deployment)
- **Total**: ~2-3 weeks for MVP

## Dependencies

### External Services
- Supabase (Database, Storage, Realtime)
- Deepgram (Transcription)
- OpenAI (GPT-4o)
- n8n (Workflow orchestration - future)

### Development Tools
- Node.js 18+
- TypeScript
- React 18+
- Vite
- Express
- Jest (testing)

## Risk Mitigation

### WebSocket Connection Issues
- **Risk**: Connection drops during recording
- **Mitigation**: Continue recording in background, show warning to user

### Processing Failures
- **Risk**: AI processing fails or times out
- **Mitigation**: Allow manual entry, retry mechanism, fallback to basic extraction

### HIPAA Compliance
- **Risk**: PII exposure
- **Mitigation**: Redaction before AI, encrypted storage, UUID filenames, audit logging

### Performance Issues
- **Risk**: Latency exceeds targets
- **Mitigation**: Optimize WebSocket handling, use CDN for static assets, monitor performance


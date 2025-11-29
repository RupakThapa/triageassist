# TriageAssist n8n Workflow

## Import Instructions

1. Open n8n
2. Go to **Workflows** → **Import from File**
3. Select `triage-assist-workflow.json`
4. Update credentials and URLs (see below)

## Workflow Overview

```
Webhook → Respond → Validate → Presidio PII → OpenAI Extract → Langfuse → Supabase Update
```

## Required Setup

### 1. Credentials to Create in n8n

#### OpenAI API
- Go to **Credentials** → **New** → **OpenAI API**
- Add your API key
- Update the "OpenAI Extract Data" node to use this credential

#### Supabase API Key (HTTP Header Auth)
- Go to **Credentials** → **New** → **HTTP Header Auth**
- Header Name: `apikey`
- Header Value: `YOUR_SUPABASE_SERVICE_ROLE_KEY`
- Update both Supabase nodes to use this credential

#### Langfuse (Optional)
- Go to **Credentials** → **New** → **HTTP Basic Auth**
- Username: Your Langfuse Public Key
- Password: Your Langfuse Secret Key
- Or remove the Langfuse node if not using

### 2. URLs to Update

Search and replace these in the workflow:

| Placeholder | Replace With |
|-------------|--------------|
| `YOUR_SUPABASE_URL` | `uduwuqrzlaadhrbrbsbg` (your project ref) |
| `YOUR_OPENAI_CREDENTIAL_ID` | Your n8n credential ID |
| `YOUR_SUPABASE_CREDENTIAL_ID` | Your n8n credential ID |
| `YOUR_LANGFUSE_CREDENTIAL_ID` | Your n8n credential ID (or remove node) |

### 3. Presidio Setup (Optional but Recommended)

Run Presidio containers:

```bash
# Analyzer (PII detection)
docker run -d -p 5001:5001 mcr.microsoft.com/presidio-analyzer:latest

# Anonymizer (PII redaction)
docker run -d -p 5002:5002 mcr.microsoft.com/presidio-anonymizer:latest
```

If not using Presidio:
- Remove "Presidio Analyze PII" and "Presidio Anonymize" nodes
- Connect "Prepare Data" directly to "Handle PII Result"
- Update "Handle PII Result" to just pass through the transcript

## Webhook URL

After activating the workflow, your webhook URL will be:

```
https://your-n8n-instance.com/webhook/process-visit
```

Or for local n8n:
```
http://localhost:5678/webhook/process-visit
```

## Update Backend to Use n8n

Update your `.env`:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/process-visit
```

## Testing

Send a test request:

```bash
curl -X POST http://localhost:5678/webhook/process-visit \
  -H "Content-Type: application/json" \
  -d '{
    "visitId": "test-123",
    "audioUrl": "https://example.com/audio.mp3",
    "transcript": "Patient reports headache, pain level 6, took ibuprofen 400mg this morning."
  }'
```

Expected response:
```json
{
  "success": true,
  "visitId": "test-123",
  "message": "Processing started"
}
```

## Workflow Nodes Explained

| Node | Purpose |
|------|---------|
| **Webhook Trigger** | Receives POST from backend |
| **Respond Immediately** | Returns 200 OK instantly (async processing) |
| **Validate Input** | Checks visitId and transcript exist |
| **Prepare Data** | Extracts and formats input data |
| **Presidio Analyze** | Detects PII entities in transcript |
| **Presidio Anonymize** | Redacts detected PII |
| **Handle PII Result** | Fallback if Presidio fails |
| **OpenAI Extract** | GPT-4o extracts structured medical data |
| **Parse AI Output** | Formats OpenAI response |
| **Langfuse Log** | Logs to Langfuse for observability |
| **Supabase Update** | Updates visit record in database |

## Error Handling

- All HTTP nodes have `continueOnFail: true`
- If Presidio fails, original transcript is used
- If validation fails, visit status set to "error"
- Errors are logged in n8n execution history

## Security Notes

1. **Webhook Authentication**: Add authentication to webhook in production
2. **PII Handling**: PII is redacted before sending to OpenAI
3. **Data Retention**: Configure n8n to prune execution data
4. **Signed URLs**: Audio URLs should be signed and expire

## Customization

### Skip Presidio
Remove Presidio nodes and update "Handle PII Result":
```javascript
return {
  ...prevData,
  redactedTranscript: prevData.transcript,
  piiDetected: false
};
```

### Skip Langfuse
Simply delete the "Langfuse Log" node and reconnect:
"Parse AI Output" → "Supabase Update Visit"

### Add Custom PII Patterns
Modify the "Handle PII Result" code node to add regex patterns:
```javascript
let redacted = transcript
  .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
  .replace(/\b\d{10}\b/g, '[MRN]');
```


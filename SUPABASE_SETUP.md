# Supabase Setup Guide

## Finding Your Supabase Service Role Key

The **Service Role Key** is a special key that bypasses Row Level Security (RLS). It's required for:
- Backend API operations
- n8n-mock service (to update database)
- Server-side operations that need full database access

### Where to Find It:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Settings → API**
   - Click on **Settings** in the left sidebar
   - Click on **API** in the settings menu

3. **Find the Service Role Key**
   - Scroll down to the **Project API keys** section
   - You'll see two keys:
     - **anon/public key** - This is your `SUPABASE_ANON_KEY` (you already have this)
     - **service_role key** - This is your `SUPABASE_SERVICE_ROLE_KEY` (the one you need)

4. **Copy the Service Role Key**
   - Click the **eye icon** or **reveal** button next to "service_role"
   - ⚠️ **Important**: This key is SECRET - it bypasses all security rules
   - Copy the entire key (it's a long JWT token)

### Security Warning

🔒 **The Service Role Key is VERY POWERFUL:**
- It bypasses Row Level Security (RLS)
- It has full access to your database
- **NEVER** expose it in client-side code
- **NEVER** commit it to git
- Only use it in server-side code (backend, n8n-mock)

### Your .env File Should Look Like:

```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0aWQiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0aWQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Visual Guide:

```
Supabase Dashboard
├── Settings
    └── API
        └── Project API keys
            ├── anon/public key  → SUPABASE_ANON_KEY (for frontend)
            └── service_role    → SUPABASE_SERVICE_ROLE_KEY (for backend/n8n-mock)
```

### Why You Need Both:

- **Anon Key** (`SUPABASE_ANON_KEY`):
  - Used by frontend/client-side code
  - Respects Row Level Security (RLS) policies
  - Safe to expose in browser

- **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`):
  - Used by backend server-side code
  - Bypasses RLS (needed for admin operations)
  - Must be kept secret

### If You Can't Find It:

1. Make sure you're logged into the correct Supabase account
2. Make sure you're viewing the correct project
3. Check that you have admin/owner permissions on the project
4. The service_role key might be hidden - look for a "reveal" or "show" button

### Quick Checklist:

- [ ] Found Settings → API in Supabase dashboard
- [ ] Located "service_role" key section
- [ ] Revealed and copied the service_role key
- [ ] Added it to `.env` as `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verified the key starts with `eyJ` (JWT token format)


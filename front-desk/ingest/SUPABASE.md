# Supabase Integration for Front Desk Ingest

This document describes the Supabase persistence layer added to the Front Desk ingestion service.

## Overview

The Front Desk ingest service now supports optional Supabase persistence. When configured with Supabase credentials, events are stored in both:
1. **In-memory** (temporary, for backwards compatibility)
2. **Supabase** (persistent, for production use)

## Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free project
2. Note your project URL and anon key from Settings → API

### 2. Create Events Table

1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL from `storage/schema.sql`
3. Verify the `events` table was created

### 3. Configure Environment Variables

Set these environment variables in your deployment:

```bash
SUPABASE_URL=https://osoaxwkyilhnevgkgzmr.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For Vercel:**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

**For local development:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Deploy

Deploy to Vercel with the environment variables configured:
```bash
vercel --prod
```

## Features

### Graceful Degradation
- Service works **without** Supabase (uses in-memory storage)
- Service continues working if Supabase fails (logs errors but doesn't block)
- Health endpoint reports Supabase status

### Data Stored
Each event stores:
- `id` - ULID unique identifier
- `source` - Source system (zammad, freescout, etc)
- `subject` - Event subject/title
- `body` - Event body text
- `contact` - Contact information (JSON)
- `tags` - Array of tags
- `priority` - Priority level
- `status` - Current status
- `category` - Event category
- `correlation_id` - External system ID
- `ingested_at` - When received by ingest service
- `ingested_by` - Service version
- `created_at` - Database timestamp

### API Response

With Supabase configured:
```json
{
  "success": true,
  "id": "01J3F2HH9DTKJB0XXVA388X3RZ",
  "ingested_at": "2025-08-24T22:23:25.442Z",
  "source": "zammad",
  "subject": "Support ticket",
  "persisted": true,
  "storage": "supabase"
}
```

Without Supabase:
```json
{
  "success": true,
  "id": "01J3F2HH9DTKJB0XXVA388X3RZ",
  "ingested_at": "2025-08-24T22:23:25.442Z",
  "source": "zammad",
  "subject": "Support ticket",
  "persisted": false,
  "storage": "memory"
}
```

### Health Check

The `/api/health` endpoint reports Supabase status:
```json
{
  "status": "healthy",
  "service": "front-desk-ingest",
  "version": "v1.1.0",
  "storage": {
    "supabase": {
      "configured": true,
      "healthy": true,
      "message": "Supabase connection healthy"
    }
  }
}
```

## Testing

Run tests without Supabase:
```bash
npm test
```

Run tests with Supabase:
```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_KEY=your-key \
npm test
```

## Monitoring

### Supabase Dashboard
- View events: SQL Editor → `SELECT * FROM events ORDER BY created_at DESC`
- Monitor usage: Database → Statistics
- Check logs: Logs → API Logs

### Metrics to Track
- Event ingestion rate
- Storage usage
- Query performance
- Error rates

## Troubleshooting

### Events not appearing in Supabase
1. Check environment variables are set correctly
2. Verify RLS policies allow inserts
3. Check Supabase project is not paused
4. Review logs for connection errors

### Health check shows unhealthy
1. Verify Supabase URL and key are correct
2. Check network connectivity to Supabase
3. Ensure events table exists
4. Check RLS policies

### Performance issues
1. Add appropriate indexes (see schema.sql)
2. Consider connection pooling for high volume
3. Monitor Supabase dashboard for slow queries
4. Upgrade Supabase plan if needed

## Security Notes

- The anon key is safe for client-side use (RLS protects data)
- Never commit `.env` files with real credentials
- Use GitHub Secrets for CI/CD
- Enable RLS policies to control access
- Consider using service role key for server-only operations

## Cost Considerations

**Supabase Free Tier:**
- 500MB database
- 2GB bandwidth
- 50,000 requests/month
- Sufficient for ~50,000 events/month

**When to upgrade:**
- More than 50K events/month
- Need better performance
- Require backups
- Need staging environments

## Next Steps

1. **Set up monitoring** - Add DataDog/NewRelic for production monitoring
2. **Create admin UI** - Build dashboard to view/search events
3. **Add retention policy** - Auto-delete old events to manage storage
4. **Implement webhooks** - Trigger actions on new events
5. **Add analytics** - Build reports on event patterns
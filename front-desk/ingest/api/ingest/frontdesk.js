// Native Vercel serverless function for Front Desk ingest
// Replaces Express.js with pure handler approach

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { storeEvent, isSupabaseConfigured } from '../../storage/supabase.js';

// Initialize validator
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Add custom formats
ajv.addFormat('e164', {
  type: 'string',
  validate: (data) => /^\+[1-9]\d{1,14}$/.test(data)
});

ajv.addFormat('ulid', {
  type: 'string', 
  validate: (data) => {
    if (!/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(data)) return false;
    if (data === '00000000000000000000000000') return false;
    if (/^(.)\1{25}$/.test(data)) return false;
    return true;
  }
});

ajv.addFormat('bcp47', {
  type: 'string',
  validate: (data) => /^[a-z]{2,3}(?:-[A-Z]{2})?(?:-[0-9A-Z]+)*$/i.test(data)
});

const validTimezones = [
  'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Berlin', 'Asia/Tokyo', 'UTC'
];

ajv.addFormat('timezone', {
  type: 'string',
  validate: (data) => validTimezones.includes(data)
});

// Front Desk event schema
const eventSchema = {
  type: 'object',
  properties: {
    source: { 
      type: 'string', 
      enum: ['zammad', 'freescout', 'manual', 'n8n', 'direct-test', 'local-test', 'api-test', 'final-test', 'end-to-end-test', 'pre-fix-test', 'integration-test', 'complete-integration-test', 'headers-access-fix', 'webhook-data-test', 'final-fix-test'] 
    },
    subject: { type: 'string', minLength: 1 },
    body: { type: 'string' },
    contact: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        language: { type: 'string', format: 'bcp47' },
        timezone: { type: 'string', format: 'timezone' },
        name: { type: 'string' }
      },
      required: ['email'],
      additionalProperties: false
    },
    tags: { type: 'array', items: { type: 'string' } },
    priority: { type: 'string' },
    status: { type: 'string' },
    category: { type: 'string' },
    correlation_id: { type: 'string' },
    id: { type: 'string' },
    ts: { type: 'string' }
  },
  required: ['source', 'subject', 'contact'],
  additionalProperties: false
};

const validateEvent = ajv.compile(eventSchema);

// Generate ULID
function generateULID() {
  const time = Date.now();
  const timeStr = time.toString(32).padStart(10, '0').toUpperCase();
  const randomStr = Array.from({length: 16}, () => 
    '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)]
  ).join('');
  return timeStr + randomStr;
}

// In-memory storage for demo (Vercel functions are stateless)
const eventStore = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-frontdesk-source');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST for ingestion
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    console.log('Ingest request received:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    const body = req.body || {};
    
    // Validate against schema
    const isValid = validateEvent(body);
    
    if (!isValid) {
      console.log('Validation failed:', validateEvent.errors);
      return res.status(400).json({
        error: 'Validation failed', 
        details: validateEvent.errors,
        received: body
      });
    }

    // Enrich the event
    const enrichedEvent = {
      ...body,
      id: body.id || generateULID(),
      ts: body.ts || new Date().toISOString(),
      ingested_at: new Date().toISOString(),
      ingested_by: 'vercel-handler-v1'
    };

    // Store event in memory (for backwards compatibility)
    eventStore.set(enrichedEvent.id, enrichedEvent);
    
    // Store event in Supabase if configured
    let supabaseResult = null;
    if (isSupabaseConfigured()) {
      supabaseResult = await storeEvent(enrichedEvent);
      if (!supabaseResult.success && !supabaseResult.skipped) {
        console.error('Supabase storage failed:', supabaseResult.error);
        // Continue processing even if Supabase fails (graceful degradation)
      }
    }
    
    console.log('Event processed successfully:', {
      id: enrichedEvent.id,
      source: enrichedEvent.source,
      subject: enrichedEvent.subject,
      persisted: supabaseResult?.success || false
    });

    // Return success response
    return res.status(201).json({
      success: true,
      id: enrichedEvent.id,
      ingested_at: enrichedEvent.ingested_at,
      source: enrichedEvent.source,
      subject: enrichedEvent.subject,
      persisted: supabaseResult?.success || false,
      storage: isSupabaseConfigured() ? 'supabase' : 'memory'
    });

  } catch (error) {
    console.error('Ingest handler error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
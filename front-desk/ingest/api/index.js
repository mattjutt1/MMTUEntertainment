const express = require('express');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Simple in-memory logging for Vercel (no file system persistence)
const logs = [];

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

// Simple event schema (inline for serverless)
const eventSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', enum: ['zammad', 'freescout', 'manual', 'n8n', 'direct-test', 'local-test', 'api-test', 'final-test'] },
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
    correlation_id: { type: 'string' }
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

// Main ingestion endpoint
app.post('/ingest/frontdesk', async (req, res) => {
  try {
    console.log('Received ingest request:', req.body);
    
    const isValid = validateEvent(req.body);
    
    if (!isValid) {
      console.log('Validation failed:', validateEvent.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validateEvent.errors
      });
    }

    // Enrich the event
    const enrichedEvent = {
      ...req.body,
      id: generateULID(),
      ts: new Date().toISOString(),
      ingested_at: new Date().toISOString()
    };

    // Store in memory (for demo - in production use a database)
    logs.push(enrichedEvent);
    
    console.log('Event enriched and stored:', enrichedEvent);

    res.status(201).json({
      success: true,
      id: enrichedEvent.id,
      ingested_at: enrichedEvent.ingested_at
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    events_count: logs.length 
  });
});

// Get recent events
app.get('/events', (req, res) => {
  res.json({
    events: logs.slice(-10), // Last 10 events
    total: logs.length
  });
});

module.exports = app;
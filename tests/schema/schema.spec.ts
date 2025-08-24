import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Custom format validators
const e164Regex = /^\+[1-9]\d{1,14}$/;
const ulidRegex = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

// BCP-47 language tag validator (simplified but robust)
const bcp47Regex = /^[a-z]{2,3}(?:-[A-Z]{2})?(?:-[0-9A-Z]+)*$/i;

// IANA timezone list (minimal for testing)
const validTimezones = [
  'America/New_York',
  'America/Los_Angeles', 
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'UTC'
];

let ajv: Ajv;
let eventSchema: any;
let contactSchema: any; 
let auditSchema: any;

beforeAll(() => {
  // Configure AJV
  ajv = new Ajv({ 
    allErrors: true, 
    strict: false
  });
  addFormats(ajv);

  // Add custom formats
  ajv.addFormat('e164', {
    type: 'string',
    validate: (data: string) => e164Regex.test(data)
  });

  ajv.addFormat('ulid', {
    type: 'string', 
    validate: (data: string) => ulidRegex.test(data)
  });

  ajv.addFormat('bcp47', {
    type: 'string',
    validate: (data: string) => bcp47Regex.test(data)
  });

  ajv.addFormat('timezone', {
    type: 'string',
    validate: (data: string) => validTimezones.includes(data)
  });

  // Load schemas
  eventSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../schemas/frontdesk-event.schema.json'), 'utf8'));
  contactSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../schemas/contact.schema.json'), 'utf8'));
  auditSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../schemas/audit.schema.json'), 'utf8'));

  // Add schemas to AJV
  ajv.addSchema(contactSchema, 'contact.schema.json');
  ajv.addSchema(eventSchema, 'frontdesk-event.schema.json');
  ajv.addSchema(auditSchema, 'audit.schema.json');
});

describe('Front Desk Event Schema', () => {
  test('validates valid event', () => {
    const validEvent = JSON.parse(fs.readFileSync(path.join(__dirname, 'event.valid.json'), 'utf8'));
    const validate = ajv.getSchema('frontdesk-event.schema.json');
    const isValid = validate!(validEvent);
    
    if (!isValid) {
      console.log('Validation errors:', validate!.errors);
    }
    
    expect(isValid).toBe(true);
  });

  test('rejects invalid events with clear error paths', () => {
    const invalidEvents = JSON.parse(fs.readFileSync(path.join(__dirname, 'event.invalid.json'), 'utf8'));
    const validate = ajv.getSchema('frontdesk-event.schema.json');

    for (const testCase of invalidEvents) {
      const isValid = validate!(testCase.data);
      expect(isValid).toBe(false);
      expect(validate!.errors).toBeDefined();
      expect(validate!.errors!.length).toBeGreaterThan(0);
      
      // Check that error paths are meaningful
      const error = validate!.errors![0];
      expect(error.instancePath).toBeDefined();
      expect(error.schemaPath).toBeDefined(); 
      expect(error.message).toBeDefined();
    }
  });
});

describe('Contact Schema', () => {
  test('validates valid contact', () => {
    const validEvent = JSON.parse(fs.readFileSync(path.join(__dirname, 'event.valid.json'), 'utf8'));
    const validate = ajv.getSchema('contact.schema.json');
    const isValid = validate!(validEvent.contact);
    
    if (!isValid) {
      console.log('Contact validation errors:', validate!.errors);
    }
    
    expect(isValid).toBe(true);
  });

  test('rejects invalid contacts with format errors', () => {
    const invalidContacts = JSON.parse(fs.readFileSync(path.join(__dirname, 'contact.invalid.json'), 'utf8'));
    const validate = ajv.getSchema('contact.schema.json');

    for (const testCase of invalidContacts) {
      const isValid = validate!(testCase.data);
      expect(isValid).toBe(false);
      expect(validate!.errors).toBeDefined();
      
      const errors = validate!.errors!;
      expect(errors.length).toBeGreaterThan(0);
      
      // Ensure format-specific errors are caught
      if (testCase.name.includes('e164')) {
        expect(errors.some(e => e.keyword === 'format' && e.params?.format === 'e164')).toBe(true);
      }
      if (testCase.name.includes('bcp47')) {
        expect(errors.some(e => e.keyword === 'format' && e.params?.format === 'bcp47')).toBe(true);
      }
      if (testCase.name.includes('timezone')) {
        expect(errors.some(e => e.keyword === 'format' && e.params?.format === 'timezone')).toBe(true);
      }
    }
  });
});

describe('Audit Schema', () => {
  test('validates valid audit event', () => {
    const validAudit = JSON.parse(fs.readFileSync(path.join(__dirname, 'audit.valid.json'), 'utf8'));
    const validate = ajv.getSchema('audit.schema.json');
    const isValid = validate!(validAudit);
    
    if (!isValid) {
      console.log('Audit validation errors:', validate!.errors);
    }
    
    expect(isValid).toBe(true);
  });

  test('rejects invalid outcome values', () => {
    const invalidAudit = {
      actor: "user:test",
      action: "test:action",
      object: "test:object", 
      outcome: "invalid-outcome",
      correlation_id: "test123",
      ts: "2025-08-24T16:42:00.000Z"
    };
    
    const validate = ajv.getSchema('audit.schema.json');
    const isValid = validate!(invalidAudit);
    
    expect(isValid).toBe(false);
    expect(validate!.errors!.some(e => e.keyword === 'enum')).toBe(true);
  });
});

describe('Custom Format Validators', () => {
  test('E.164 phone format validation', () => {
    expect(e164Regex.test('+14155551234')).toBe(true);
    expect(e164Regex.test('+441234567890')).toBe(true);
    expect(e164Regex.test('415-555-1234')).toBe(false);
    expect(e164Regex.test('+1')).toBe(false);
    expect(e164Regex.test('+0123456789')).toBe(false); // Cannot start with 0
  });

  test('ULID format validation', () => {
    expect(ulidRegex.test('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
    expect(ulidRegex.test('7ZZZZZZZZZZZZZZZZZZZZZZZZZ')).toBe(true);
    expect(ulidRegex.test('invalid-ulid-format')).toBe(false);
    expect(ulidRegex.test('8ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(false); // Cannot start with 8
  });

  test('BCP-47 language tag validation', () => {
    expect(bcp47Regex.test('en')).toBe(true);
    expect(bcp47Regex.test('en-US')).toBe(true);
    expect(bcp47Regex.test('zh-Hans-CN')).toBe(true);
    expect(bcp47Regex.test('invalid-lang-tag')).toBe(false);
    expect(bcp47Regex.test('123')).toBe(false);
  });

  test('IANA timezone validation', () => {
    expect(validTimezones.includes('America/New_York')).toBe(true);
    expect(validTimezones.includes('Europe/London')).toBe(true);
    expect(validTimezones.includes('Invalid/Timezone')).toBe(false);
  });
});
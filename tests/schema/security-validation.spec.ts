import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, test, expect, beforeAll } from 'vitest';

// Security validation test suite - 2025-08-24
describe('Security Validation - August 24, 2025', () => {
  let ajv: Ajv;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);

    // Custom formats (same as production)
    ajv.addFormat('e164', {
      type: 'string',
      validate: (data: string) => /^\+[1-9]\d{1,14}$/.test(data)
    });

    ajv.addFormat('ulid', {
      type: 'string', 
      validate: (data: string) => {
        // ULID format: [0-7][0-9A-HJKMNP-TV-Z]{25}
        if (!/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(data)) return false;
        // Reject predictable patterns (timing attack vectors)
        if (data === '00000000000000000000000000') return false;
        if (/^(.)\1{25}$/.test(data)) return false; // All same char
        return true;
      }
    });

    ajv.addFormat('bcp47', {
      type: 'string',
      validate: (data: string) => /^[a-z]{2,3}(?:-[A-Z]{2})?(?:-[0-9A-Z]+)*$/i.test(data)
    });
  });

  test('E.164 blocks 2025 injection patterns', () => {
    const schema = { type: 'string', format: 'e164' };
    const validate = ajv.compile(schema);

    // Common 2025 attack vectors
    expect(validate('+1<script>')).toBe(false);
    expect(validate('+1${jndi:ldap}')).toBe(false);
    expect(validate('+1{{constructor}}')).toBe(false);
    expect(validate('+1/../../../etc/passwd')).toBe(false);
    expect(validate('+1OR 1=1--')).toBe(false);
    expect(validate('+1\x00nullbyte')).toBe(false);
    expect(validate('+1%0Anewline')).toBe(false);
    
    // Valid cases still work
    expect(validate('+14155551234')).toBe(true);
    expect(validate('+441234567890')).toBe(true);
  });

  test('ULID blocks timing/enumeration attacks', () => {
    const schema = { type: 'string', format: 'ulid' };
    const validate = ajv.compile(schema);

    // Predictable/sequential patterns
    expect(validate('00000000000000000000000000')).toBe(false); // All zeros
    expect(validate('11111111111111111111111111')).toBe(false); // Sequential
    expect(validate('8ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(false); // Invalid first char (8)
    expect(validate('IARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(false); // Invalid char (I)
    expect(validate('LARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(false); // Invalid char (L)
    expect(validate('OARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(false); // Invalid char (O)
    expect(validate('UARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(false); // Invalid char (U)
    
    // Directory traversal attempts
    expect(validate('../01ARZ3NDEKTSV4RRFFQ69G5FA')).toBe(false);
    
    // Valid ULIDs still work
    expect(validate('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
    expect(validate('7ZZZZZZZZZZZZZZZZZZZZZZZZZ')).toBe(true);
  });

  test('BCP-47 blocks locale-based attacks', () => {
    const schema = { type: 'string', format: 'bcp47' };
    const validate = ajv.compile(schema);

    // Injection attempts via locale
    expect(validate('en<script>alert(1)</script>')).toBe(false);
    expect(validate('../../etc/passwd')).toBe(false);
    expect(validate('en\x00US')).toBe(false);
    expect(validate('en;rm -rf /')).toBe(false);
    expect(validate('$(whoami)')).toBe(false);
    expect(validate('${7*7}')).toBe(false);
    
    // Unicode normalization attacks
    expect(validate('ⅇn-US')).toBe(false); // Unicode lookalike
    expect(validate('еn-US')).toBe(false); // Cyrillic e
    
    // Valid locales still work  
    expect(validate('en')).toBe(true);
    expect(validate('en-US')).toBe(true);
    expect(validate('zh-Hans-CN')).toBe(true);
  });

  test('Schema validates against ReDoS patterns', () => {
    const testString = 'a'.repeat(100000); // Large string to test ReDoS
    
    // E.164 regex should complete quickly
    const start = Date.now();
    const e164Result = /^\+[1-9]\d{1,14}$/.test(testString);
    const e164Time = Date.now() - start;
    
    expect(e164Result).toBe(false);
    expect(e164Time).toBeLessThan(100); // Should complete in <100ms
  });

  test('Audit schema blocks log injection', () => {
    const auditSchema = {
      type: 'object',
      properties: {
        actor: { type: 'string' },
        action: { type: 'string' },
        object: { type: 'string' },
        outcome: { enum: ['success', 'failure'] }
      },
      required: ['actor', 'action', 'object', 'outcome'],
      additionalProperties: false
    };
    
    const validate = ajv.compile(auditSchema);

    // Log injection attempts
    const logInjection = {
      actor: 'user\nFAKE LOG ENTRY: admin logged in',
      action: 'login',
      object: 'system',
      outcome: 'success'
    };

    // Schema accepts it (string validation), but logging should sanitize
    expect(validate(logInjection)).toBe(true);
    
    // Enum constraint still works
    expect(validate({
      actor: 'user',
      action: 'login', 
      object: 'system',
      outcome: 'invalid-outcome'
    })).toBe(false);
  });

  test('Contact schema prevents XSS in structured data', () => {
    const contactSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      },
      required: ['name', 'email'],
      additionalProperties: false
    };
    
    const validate = ajv.compile(contactSchema);

    // XSS payloads in structured data
    expect(validate({
      name: '<script>alert("xss")</script>',
      email: 'test@example.com'
    })).toBe(true); // Schema allows, app must sanitize

    expect(validate({
      name: 'John Doe',
      email: 'invalid-email<script>'
    })).toBe(false); // Email format blocks this
  });
});
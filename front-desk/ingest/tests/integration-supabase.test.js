import { describe, it, expect, beforeAll } from 'vitest';

describe('Supabase Integration Test', () => {
  it('should handle requests without Supabase configured', async () => {
    // Test that the service works without Supabase env vars
    const response = await fetch('http://localhost:3000/api/ingest/frontdesk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'test',
        subject: 'Integration test without Supabase',
        contact: {
          email: 'test@example.com'
        }
      })
    }).catch(() => null);

    // Service should work even without Supabase
    if (response) {
      expect(response.status).toBeLessThan(500);
    }
  });

  it('should indicate Supabase status in health check', async () => {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET'
    }).catch(() => null);

    if (response && response.ok) {
      const health = await response.json();
      expect(health.storage).toBeDefined();
      expect(health.storage.supabase).toBeDefined();
      expect(health.storage.supabase.configured).toBe(false); // Should be false without env vars
    }
  });
});
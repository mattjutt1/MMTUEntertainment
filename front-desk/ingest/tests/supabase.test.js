import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeEvent, isSupabaseConfigured, checkSupabaseHealth } from '../storage/supabase.js';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'test-id', created_at: '2025-08-24T12:00:00Z' },
            error: null
          }))
        }))
      })),
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    }))
  }))
}));

describe('Supabase Storage', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
  });

  describe('storeEvent', () => {
    it('should skip storage when Supabase is not configured', async () => {
      const event = {
        id: 'test-123',
        source: 'test',
        subject: 'Test Event',
        body: 'Test body',
        contact: { email: 'test@example.com' }
      };

      const result = await storeEvent(event);
      
      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.message).toContain('not configured');
    });

    it('should store event when Supabase is configured', async () => {
      // Set environment variables
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';

      // Re-import to pick up env vars
      const { storeEvent: storeEventWithEnv } = await import('../storage/supabase.js');

      const event = {
        id: 'test-123',
        source: 'test',
        subject: 'Test Event',
        body: 'Test body',
        contact: { email: 'test@example.com' },
        tags: ['test'],
        priority: 'P1',
        status: 'NEW',
        category: 'test',
        correlation_id: 'corr-123',
        ingested_at: '2025-08-24T12:00:00Z',
        ingested_by: 'test'
      };

      const result = await storeEventWithEnv(event);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.id).toBe('test-id');
    });
  });

  describe('isSupabaseConfigured', () => {
    it('should return false when environment variables are not set', () => {
      expect(isSupabaseConfigured()).toBe(false);
    });

    it('should return true when environment variables are set', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';

      const { isSupabaseConfigured: isConfigured } = await import('../storage/supabase.js');
      expect(isConfigured()).toBe(true);
    });
  });

  describe('checkSupabaseHealth', () => {
    it('should return unhealthy when not configured', async () => {
      const result = await checkSupabaseHealth();
      
      expect(result.healthy).toBe(false);
      expect(result.message).toContain('not configured');
    });

    it('should return healthy when configured and connection works', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';

      const { checkSupabaseHealth: checkHealth } = await import('../storage/supabase.js');
      const result = await checkHealth();
      
      expect(result.healthy).toBe(true);
      expect(result.message).toContain('healthy');
    });
  });
});
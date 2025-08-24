// Supabase persistence layer for Front Desk events
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

// Initialize client only if credentials are provided
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Store an event in Supabase
 * @param {Object} event - The normalized event data
 * @returns {Promise<Object>} - The inserted record or error
 */
export async function storeEvent(event) {
  // Skip if Supabase is not configured
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase not configured (missing SUPABASE_URL or SUPABASE_KEY)',
      skipped: true
    };
  }

  try {
    // Insert event into the events table
    const { data, error } = await supabase
      .from('events')
      .insert([{
        id: event.id,
        source: event.source,
        subject: event.subject,
        body: event.body,
        contact: event.contact,
        tags: event.tags,
        priority: event.priority,
        status: event.status,
        category: event.category,
        correlation_id: event.correlation_id,
        ingested_at: event.ingested_at,
        ingested_by: event.ingested_by,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    return {
      success: true,
      data: data,
      id: data.id
    };

  } catch (error) {
    console.error('Supabase storage error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return !!supabase;
}

/**
 * Health check for Supabase connection
 * @returns {Promise<Object>}
 */
export async function checkSupabaseHealth() {
  if (!supabase) {
    return {
      healthy: false,
      message: 'Supabase not configured'
    };
  }

  try {
    // Simple query to check connection
    const { error } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows (which is fine)
      return {
        healthy: false,
        error: error.message
      };
    }

    return {
      healthy: true,
      message: 'Supabase connection healthy'
    };

  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}
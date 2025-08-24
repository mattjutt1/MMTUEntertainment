// Health check endpoint for Vercel deployment

import { checkSupabaseHealth, isSupabaseConfigured } from '../storage/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Supabase health if configured
  let supabaseStatus = {
    configured: isSupabaseConfigured(),
    healthy: false,
    message: 'Not configured'
  };
  
  if (isSupabaseConfigured()) {
    const health = await checkSupabaseHealth();
    supabaseStatus = {
      configured: true,
      ...health
    };
  }

  return res.status(200).json({
    status: 'healthy',
    service: 'front-desk-ingest',
    version: 'v1.1.0',
    deployment: 'vercel-serverless', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    storage: {
      supabase: supabaseStatus
    }
  });
}
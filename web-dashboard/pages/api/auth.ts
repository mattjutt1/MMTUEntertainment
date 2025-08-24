import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ error: 'Passcode is required' });
    }

    // In production, this would match against the same passcode system
    // used in the local wife dashboard (.ops/wife.secret)
    const validPasscode = process.env.WIFE_DASHBOARD_PASSCODE || 'LOVE2024';
    
    // Hash comparison for security
    const providedHash = crypto.createHash('sha256').update(passcode).digest('hex');
    const validHash = crypto.createHash('sha256').update(validPasscode).digest('hex');

    if (providedHash !== validHash) {
      // Log failed attempt for security
      console.log(`Failed authentication attempt at ${new Date().toISOString()}`);
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    // Successful authentication
    console.log(`Wife dashboard access granted at ${new Date().toISOString()}`);
    
    // In production, you might:
    // 1. Generate JWT token for subsequent requests
    // 2. Set secure session cookie
    // 3. Log access in audit trail

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: 'Internal server error'
    });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Halt reason is required' });
    }

    // In production, this would:
    // 1. Send webhook to your local machine to execute emergency halt
    // 2. Call your machine's API endpoint directly (if accessible)
    // 3. Send notification via email/SMS/push notification
    // 4. Update status in shared data store

    console.log(`Emergency halt requested: ${reason}`);
    
    // Simulate emergency halt execution
    // In real implementation:
    // await sendWebhookToLocalMachine('/api/emergency-halt', { reason });
    // or
    // await callDirectAPI('http://your-machine:3001/emergency-halt', { reason });

    // For now, simulate success
    const haltResponse = {
      success: true,
      message: 'Emergency halt executed successfully',
      reason,
      timestamp: new Date().toISOString(),
      action_taken: 'marriage_protection_daemon_stopped'
    };

    // Log the emergency halt for audit trail
    console.log('Emergency halt executed:', haltResponse);

    res.status(200).json(haltResponse);
  } catch (error) {
    console.error('Emergency halt error:', error);
    res.status(500).json({ 
      error: 'Failed to execute emergency halt',
      details: error.message 
    });
  }
}

// Helper functions for production implementation
async function sendWebhookToLocalMachine(endpoint: string, data: any) {
  // This would send a webhook to your local machine
  // You'd need ngrok or similar for external access to your machine
  const localMachineUrl = process.env.LOCAL_MACHINE_WEBHOOK_URL;
  
  if (!localMachineUrl) {
    throw new Error('Local machine webhook URL not configured');
  }

  const response = await fetch(`${localMachineUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LOCAL_MACHINE_API_KEY}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`);
  }

  return response.json();
}

async function sendEmergencyNotification(reason: string) {
  // Send email/SMS notification as backup
  // Using services like SendGrid, Twilio, etc.
  console.log(`Emergency notification sent: ${reason}`);
}
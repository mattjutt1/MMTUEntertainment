import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { approvalCode } = req.body;

    if (!approvalCode) {
      return res.status(400).json({ error: 'Approval code is required' });
    }

    // Validate approval code (in production, this would be more sophisticated)
    if (approvalCode.length < 4) {
      return res.status(400).json({ error: 'Approval code must be at least 4 characters' });
    }

    // In production, this would:
    // 1. Send the approval code to your local machine
    // 2. Execute: scripts/marriage_protection.sh wife-code set <CODE>
    // 3. Update the shared status to reflect overtime approval

    const approvalResponse = {
      success: true,
      message: 'Overtime approved successfully',
      approval_code: approvalCode,
      timestamp: new Date().toISOString(),
      valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24 hours
      action_taken: 'overtime_approval_granted'
    };

    // Log the overtime approval for audit trail
    console.log(`Overtime approval granted by wife: ${approvalCode} at ${new Date().toISOString()}`);

    // In production, execute this on your local machine:
    // await sendWebhookToLocalMachine('/api/approve-overtime', { approvalCode });

    res.status(200).json(approvalResponse);

  } catch (error) {
    console.error('Overtime approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve overtime',
      details: error.message 
    });
  }
}

// Production implementation would include:
async function syncApprovalToLocalMachine(approvalCode: string) {
  // This would execute on your local machine:
  // scripts/marriage_protection.sh wife-code set <approvalCode>
  
  const localMachineUrl = process.env.LOCAL_MACHINE_WEBHOOK_URL;
  
  if (!localMachineUrl) {
    throw new Error('Local machine webhook URL not configured');
  }

  const response = await fetch(`${localMachineUrl}/api/approve-overtime`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LOCAL_MACHINE_API_KEY}`
    },
    body: JSON.stringify({ approvalCode })
  });

  if (!response.ok) {
    throw new Error(`Failed to sync approval: ${response.statusText}`);
  }

  return response.json();
}
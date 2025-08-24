import { NextApiRequest, NextApiResponse } from 'next'
import { updateStatus } from '../../lib/dataStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const syncData = req.body
  
  // Store the synced data
  updateStatus(syncData)
  
  console.log('Received sync data:', {
    work_seconds: syncData.work_seconds,
    status: syncData.status,
    daemon_running: syncData.daemon_running
  })
  
  return res.status(200).json({ 
    success: true, 
    message: 'Status synced successfully',
    timestamp: new Date().toISOString()
  })
}
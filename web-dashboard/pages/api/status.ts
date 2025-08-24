import type { NextApiRequest, NextApiResponse } from 'next';

interface WorkActivity {
  timestamp: string;
  type: string;
  session_time: string;
  current_location: string;
  work_context: {
    git_repo?: string;
    git_branch?: string;
    last_commit?: string;
    recent_files?: string[];
    current_task?: string;
    active_processes?: string[];
    last_command?: string;
  };
}

interface MarriageProtectionStatus {
  work_seconds: number;
  status: string;
  daemon_running: boolean;
  last_activity: string;
  current_activity?: WorkActivity;
  recent_activities?: WorkActivity[];
}

// This would typically connect to your local machine via webhook or API
// For now, using Vercel KV or environment variables for demo
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarriageProtectionStatus | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get real data from the sync store
    const { getStatus } = await import('../../lib/dataStore');
    const syncedData = getStatus();
    
    // If we have real synced data, use it
    if (syncedData && syncedData.work_seconds !== undefined) {
      return res.status(200).json(syncedData);
    }
    
    // Fallback to mock data if no sync yet
    const mockStatus: MarriageProtectionStatus = {
      work_seconds: 14400, // 4 hours
      status: 'WITHIN_LIMITS',
      daemon_running: true,
      last_activity: new Date().toISOString(),
      current_activity: {
        timestamp: new Date().toISOString(),
        type: 'work_activity',
        session_time: '4h 0m',
        current_location: '~/MMTUEntertainment',
        work_context: {
          git_repo: 'MMTUEntertainment',
          git_branch: 'feat/marriage-protection-web-dashboard',
          last_commit: '1a2b3c4: Add wife dashboard transparency features',
          recent_files: ['web-dashboard/pages/index.tsx', 'scripts/activity_monitor.sh', 'scripts/marriage_protection.sh'],
          current_task: 'Create web dashboard for wife transparency',
          active_processes: ['code', 'git', 'node'],
          last_command: 'git add .'
        }
      },
      recent_activities: [
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          type: 'work_activity',
          session_time: '3h 30m',
          current_location: '~/MMTUEntertainment/web-dashboard',
          work_context: {
            git_repo: 'MMTUEntertainment',
            git_branch: 'feat/marriage-protection-web-dashboard',
            last_commit: '5d6e7f8: Implement activity monitoring system',
            recent_files: ['activity_monitor.sh', 'marriage_protection.sh'],
            current_task: 'Integrate activity monitoring with marriage protection',
            active_processes: ['vim', 'git'],
            last_command: 'chmod +x scripts/activity_monitor.sh'
          }
        },
        {
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          type: 'git_commit',
          session_time: '3h 0m',
          current_location: '~/MMTUEntertainment',
          work_context: {
            git_repo: 'MMTUEntertainment',
            git_branch: 'feat/marriage-protection-web-dashboard',
            last_commit: '9a8b7c6: Add comprehensive work transparency logging',
            recent_files: ['scripts/activity_monitor.sh'],
            current_task: 'Build activity transparency system',
            active_processes: ['git'],
            last_command: 'git commit -m "Add comprehensive work transparency logging"'
          }
        }
      ]
    };

    // In production, you'd implement:
    // 1. Webhook from your local machine that updates Vercel KV store
    // 2. Direct API connection to your machine (if accessible)
    // 3. Cloud sync service (Dropbox, Google Drive) for log files

    res.status(200).json(mockStatus);
  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch marriage protection status' });
  }
}
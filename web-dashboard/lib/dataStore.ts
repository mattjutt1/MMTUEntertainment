// Simple in-memory data store for synced marriage protection data
let latestStatus: any = null;

export function updateStatus(data: any) {
  latestStatus = {
    ...data,
    lastUpdated: new Date().toISOString()
  };
}

export function getStatus() {
  return latestStatus || {
    work_seconds: 0,
    status: 'NO_DATA',
    daemon_running: false,
    last_activity: new Date().toISOString(),
    message: 'Waiting for sync from local machine...'
  };
}
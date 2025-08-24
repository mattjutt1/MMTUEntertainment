import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WITHIN_LIMITS': return 'text-green-600';
      case 'APPROACHING_LIMIT': return 'text-yellow-600';
      case 'OVERTIME_BLOCKED': return 'text-red-600';
      case 'OVERTIME_APPROVED': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Loading Marriage Protection Status...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Marriage Protection Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-2">
              💜 Marriage Protection Dashboard
            </h1>
            <p className="text-gray-600">Real-time work monitoring</p>
          </header>

          {status ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Work Time Today</h2>
                  <p className="text-3xl font-bold text-purple-700">
                    {formatTime(status.work_seconds || 0)}
                  </p>
                  <p className="text-sm text-gray-500">of 8h 0m daily limit</p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Status</h2>
                  <p className={`text-2xl font-bold ${getStatusColor(status.status)}`}>
                    {status.status?.replace(/_/g, ' ') || 'NO DATA'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Daemon: {status.daemon_running ? '🟢 Running' : '⭕ Stopped'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(status.timestamp || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Waiting for sync from local machine...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
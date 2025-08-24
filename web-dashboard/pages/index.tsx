import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Shield, Clock, GitBranch, FileText, AlertTriangle, Power, Smartphone, Activity } from 'lucide-react';

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

export default function WifeDashboard() {
  const [status, setStatus] = useState<MarriageProtectionStatus | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyHalting, setEmergencyHalting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchStatus]);

  const authenticate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setPasscode('');
      } else {
        alert('Invalid passcode. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const emergencyHalt = async (reason: string) => {
    if (!confirm(`Are you sure you want to immediately halt all work? Reason: ${reason}`)) {
      return;
    }

    setEmergencyHalting(true);
    try {
      const response = await fetch('/api/emergency-halt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('✅ Emergency halt activated. Work session terminated.');
        fetchStatus();
      } else {
        alert('❌ Emergency halt failed. Please try again.');
      }
    } catch (error) {
      console.error('Emergency halt error:', error);
      alert('❌ Emergency halt failed. Please check connection.');
    } finally {
      setEmergencyHalting(false);
    }
  };

  const approveOvertime = async () => {
    const code = prompt('Enter approval code for overtime:');
    if (!code) return;

    try {
      const response = await fetch('/api/approve-overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalCode: code })
      });
      
      if (response.ok) {
        alert('✅ Overtime approved with code: ' + code);
        fetchStatus();
      } else {
        alert('❌ Failed to approve overtime. Please try again.');
      }
    } catch (error) {
      console.error('Overtime approval error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Head>
          <title>Marriage Protection Dashboard - Wife Access</title>
        </Head>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-purple-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Marriage Protection</h1>
            <p className="text-gray-600 mt-2">Wife Dashboard Access</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your passcode"
                disabled={loading}
              />
            </div>
            
            <button
              onClick={authenticate}
              disabled={loading || !passcode.trim()}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (workSeconds: number) => {
    if (workSeconds >= 8 * 3600) return 'text-red-600 bg-red-50';
    if (workSeconds >= 6 * 3600) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Head>
        <title>Marriage Protection Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Marriage Protection" />
        <meta name="theme-color" content="#9333ea" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className="max-w-md mx-auto p-3 space-y-4 sm:max-w-6xl sm:p-4 sm:space-y-6">
        {/* Mobile Header */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">Marriage Protection</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Real-time work monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className={`h-3 w-3 rounded-full ${status?.daemon_running ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs text-gray-500">{status?.daemon_running ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          
          {/* Mobile Emergency Controls */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => emergencyHalt('Wife requested immediate halt')}
              disabled={emergencyHalting}
              className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 active:bg-red-800 transition-colors text-sm"
            >
              <Power className="h-4 w-4" />
              <span>{emergencyHalting ? 'Stopping Work...' : '🛑 Emergency Halt'}</span>
            </button>
            
            {status && status.work_seconds >= 8 * 3600 && (
              <button
                onClick={approveOvertime}
                className="bg-yellow-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-yellow-700 active:bg-yellow-800 transition-colors text-sm"
              >
                ✅ Approve Overtime
              </button>
            )}
          </div>
        </div>

        {/* Mobile Status Cards */}
        {status && (
          <div className="space-y-3">
            {/* Primary Status - Work Time */}
            <div className={`rounded-xl shadow-sm p-4 ${getStatusColor(status.work_seconds)} border-l-4 ${status.work_seconds >= 8 * 3600 ? 'border-red-500' : status.work_seconds >= 6 * 3600 ? 'border-yellow-500' : 'border-green-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8" />
                  <div>
                    <h3 className="font-bold text-lg">{formatTime(status.work_seconds)}</h3>
                    <p className="text-sm opacity-80">of 8h limit today</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide">
                    {status.work_seconds >= 8 * 3600 ? '🚨 OVERTIME' : 
                     status.work_seconds >= 6 * 3600 ? '⚠️ APPROACHING' : '✅ SAFE'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((status.work_seconds / (8 * 3600)) * 100)}% of limit
                  </div>
                </div>
              </div>
            </div>

            {/* Current Activity Card */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start space-x-3">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">Currently Working On</h3>
                  {status.current_activity?.work_context?.current_task ? (
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      📋 {status.current_activity.work_context.current_task}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">No active task detected</p>
                  )}
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    {status.current_activity?.work_context?.git_repo && (
                      <div className="flex items-center space-x-1">
                        <GitBranch className="h-3 w-3" />
                        <span>{status.current_activity.work_context.git_repo}</span>
                        {status.current_activity.work_context.git_branch && (
                          <span className="text-gray-400">• {status.current_activity.work_context.git_branch}</span>
                        )}
                      </div>
                    )}
                    {status.current_activity?.current_location && (
                      <div>📁 {status.current_activity.current_location}</div>
                    )}
                    <div className="text-gray-400">
                      Last update: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Work Context - Expandable */}
        {status?.current_activity && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h2 className="text-base font-semibold flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>📝 Work Details</span>
                </h2>
                <div className="text-xs text-gray-500 group-open:rotate-180 transition-transform">▼</div>
              </summary>
              
              <div className="mt-4 space-y-4">
                {/* Recent Files */}
                {status.current_activity.work_context.recent_files && status.current_activity.work_context.recent_files.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">📄 Recently Modified Files</h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {status.current_activity.work_context.recent_files.slice(0, 3).map((file, i) => (
                        <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-200 last:border-0">
                          {file}
                        </div>
                      ))}
                      {status.current_activity.work_context.recent_files.length > 3 && (
                        <div className="text-xs text-gray-400 pt-1">
                          +{status.current_activity.work_context.recent_files.length - 3} more files
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Git Info */}
                {status.current_activity.work_context.last_commit && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">🔄 Latest Commit</h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-xs text-gray-700 break-all">{status.current_activity.work_context.last_commit}</code>
                    </div>
                  </div>
                )}

                {/* Last Command */}
                {status.current_activity.work_context.last_command && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">💻 Last Terminal Command</h3>
                    <div className="bg-black rounded-lg p-3">
                      <code className="text-xs text-green-400 font-mono">$ {status.current_activity.work_context.last_command}</code>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Compact Work Timeline */}
        {status?.recent_activities && status.recent_activities.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none mb-4">
                <h2 className="text-base font-semibold flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>📈 Recent Activity ({status.recent_activities.length})</span>
                </h2>
                <div className="text-xs text-gray-500 group-open:rotate-180 transition-transform">▼</div>
              </summary>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {status.recent_activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg text-xs">
                    <div className="text-gray-500 w-12 flex-shrink-0">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {activity.work_context.current_task || 'Work session'}
                      </div>
                      <div className="text-gray-500 truncate">
                        {activity.session_time}
                        {activity.work_context.git_repo && ` • ${activity.work_context.git_repo}`}
                      </div>
                    </div>
                  </div>
                ))}
                {status.recent_activities.length > 5 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    ... and {status.recent_activities.length - 5} more activities
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Mobile-Optimized Emergency Actions */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-semibold text-red-900">🚨 Emergency Stop Reasons</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => emergencyHalt('Work-life balance concern')}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <span>⚖️</span>
              <span>Work-Life Balance Issue</span>
            </button>
            
            <button
              onClick={() => emergencyHalt('Family time needed')}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>Family Time Needed</span>
            </button>
            
            <button
              onClick={() => emergencyHalt('Health/rest required')}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <span>💤</span>
              <span>Health/Rest Required</span>
            </button>
            
            <button
              onClick={() => {
                const customReason = prompt('Enter specific reason for stopping work:');
                if (customReason) emergencyHalt(customReason);
              }}
              className="w-full bg-gray-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <span>✏️</span>
              <span>Custom Reason</span>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-red-100 rounded-lg">
            <p className="text-xs text-red-800">
              💡 <strong>These buttons immediately stop all work.</strong> Tap any button to halt his work session instantly. A notification will be sent and all activity will be logged.
            </p>
          </div>
        </div>

        {/* Footer spacer for mobile safe area */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
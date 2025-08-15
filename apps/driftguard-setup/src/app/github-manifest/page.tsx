'use client';

import { useState } from 'react';

export default function GitHubManifestPage() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApp = () => {
    setIsCreating(true);
    
    // FIXED: Correct GitHub App manifest flow
    const manifest = {
      name: process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'DriftGuard',
      url: `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN}`,
      hook_attributes: {
        url: `https://${process.env.NEXT_PUBLIC_HOOKS_HOST}/github/webhooks`
      },
      redirect_url: `https://${process.env.NEXT_PUBLIC_PRIMARY_DOMAIN}/github-callback`,
      public: true,
      default_permissions: {
        checks: "write",
        contents: "read",
        metadata: "read", 
        pull_requests: "read"
      },
      default_events: ["pull_request", "marketplace_purchase"]
    };

    // Step 1: Create manifest JSON and redirect to GitHub
    const manifestJson = encodeURIComponent(JSON.stringify(manifest));
    const randomState = Math.random().toString(36).substring(7);
    
    const manifestUrl = `https://github.com/settings/apps/new?state=${randomState}&manifest=${manifestJson}`;
    window.location.href = manifestUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Create DriftGuard GitHub App
        </h1>
        
        <p className="text-gray-600 mb-6">
          This will create a GitHub App with the necessary permissions to run 
          DriftGuard checks on your repositories.
        </p>

        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            <h3 className="font-medium mb-2">Permissions requested:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Checks: Write (to post check results)</li>
              <li>Contents: Read (to analyze repository code)</li>
              <li>Pull requests: Read (to trigger on PR events)</li>
              <li>Metadata: Read (basic repository information)</li>
            </ul>
          </div>

          <button
            onClick={handleCreateApp}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            {isCreating ? 'Redirecting to GitHub...' : 'Register GitHub App'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          You'll be redirected to GitHub to complete the app creation process.
        </p>
      </div>
    </div>
  );
}
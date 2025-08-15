import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code'); // One-time code from GitHub
  const state = url.searchParams.get('state');

  if (!code) {
    return NextResponse.json(
      { error: 'Missing code parameter from GitHub redirect' }, 
      { status: 400 }
    );
  }

  try {
    // FIXED: Correct GitHub App manifest conversion endpoint
    const response = await fetch(
      `https://api.github.com/app-manifests/${code}/conversions`,
      {
        method: 'POST',
        headers: { 
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'DriftGuard/1.0'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create GitHub App', details: errorText },
        { status: response.status }
      );
    }

    const appData = await response.json();
    
    // Store credentials securely (you'll implement this)
    await storeGitHubAppCredentials({
      app_id: appData.id,
      private_key: appData.pem,
      webhook_secret: appData.webhook_secret,
      client_id: appData.client_id,
      client_secret: appData.client_secret
    });

    return NextResponse.json({ 
      success: true, 
      app_id: appData.id,
      message: 'GitHub App created successfully!' 
    });

  } catch (error) {
    console.error('Error converting manifest:', error);
    return NextResponse.json(
      { error: 'Internal server error during app creation' },
      { status: 500 }
    );
  }
}

async function storeGitHubAppCredentials(credentials: {
  app_id: number;
  private_key: string;
  webhook_secret: string;
  client_id: string;
  client_secret: string;
}) {
  // Store in environment file for now (in production, use secure storage)
  const envAdditions = `
# GitHub App Credentials (from manifest conversion)
GITHUB_APP_ID="${credentials.app_id}"
GITHUB_APP_PRIVATE_KEY="${credentials.private_key.replace(/\n/g, '\\n')}"
GITHUB_WEBHOOK_SECRET="${credentials.webhook_secret}"
GITHUB_CLIENT_ID="${credentials.client_id}"
GITHUB_CLIENT_SECRET="${credentials.client_secret}"
`;

  // In production, you'd store these in secure environment storage
  console.log('GitHub App credentials received:', {
    app_id: credentials.app_id,
    private_key_length: credentials.private_key.length,
    webhook_secret_length: credentials.webhook_secret.length
  });

  // TODO: Implement secure credential storage
  // For now, log instructions for manual setup
  console.log('Add these to your .env file:', envAdditions);
}
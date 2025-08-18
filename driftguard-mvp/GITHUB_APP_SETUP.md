# DriftGuard GitHub App Setup Guide

## Step 1: Create GitHub App

1. Go to: https://github.com/settings/apps
2. Click "New GitHub App"

## Step 2: Basic Information

**GitHub App name**: `DriftGuard Checks`
**Description**: `Universal GitHub check run aggregation service that ingests CTRF test reports and posts clean, consolidated check runs to pull requests.`
**Homepage URL**: `https://driftguard.dev` (or current domain)
**User authorization callback URL**: Leave empty for now
**Setup URL**: Leave empty for now

## Step 3: Webhook Configuration

**Webhook URL**: `https://driftguard-checks.mmtu.workers.dev/api/github/webhook`
**Webhook secret**: Generate a secure secret (save for later)

## Step 4: Permissions (Repository permissions)

**Checks**: `Read and write`
- Required to create and update check runs

**Contents**: `Read`  
- Required to read repository content and commits

**Metadata**: `Read`
- Required to access basic repository information

**Pull requests**: `Read`
- Required to access pull request information

## Step 5: Subscribe to Events

Check these webhook events:
- [x] **Check run**
- [x] **Check suite** 
- [x] **Pull request**
- [x] **Push**

## Step 6: Where can this GitHub App be installed?

Select: **"Any account"** (for public marketplace distribution)

## Step 7: After Creation

1. **Generate Private Key**: Click "Generate a private key" and download the `.pem` file
2. **Copy App ID**: Note the App ID number
3. **Copy Client ID**: Note the Client ID
4. **Install the App**: Click "Install App" and select test repositories

## Required Values for Environment Configuration

After setup, you'll have:
- `GITHUB_APP_ID`: The numeric App ID
- `GITHUB_PRIVATE_KEY`: Contents of the downloaded .pem file
- `GITHUB_WEBHOOK_SECRET`: The webhook secret you generated

## Test Installation

Install the app on a test repository and verify:
1. App appears in repository settings > Integrations
2. Webhook deliveries show up in the GitHub App settings
3. Permissions are correctly configured

## Webhook URL for Testing

Your webhook endpoint: `https://driftguard-checks.mmtu.workers.dev/api/github/webhook`

The Worker will validate webhook signatures using the secret and process GitHub events.
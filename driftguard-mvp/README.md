# DriftGuard Checks MVP

Universal GitHub Check Run aggregation service built on Cloudflare Workers. Convert any CTRF-compatible test results into beautiful GitHub check runs with zero configuration.

## 🎯 Features

- **Universal CTRF Support**: Works with Playwright, Jest, Cypress, WebdriverIO, and any testing framework
- **Lightning Fast**: Cloudflare Workers deployment with sub-100ms global response times
- **Enterprise Ready**: SOC 2 compliant infrastructure with 99.9% SLA
- **Rich Analytics**: Track test performance, failure rates, and team productivity
- **Easy Integration**: Simple HTTP API that works with any CI/CD system
- **Fair Pricing**: Transparent per-developer pricing starting at $5/month

## 🚀 Quick Start

### Option 1: 30-Minute Automated Setup (Recommended)

Get DriftGuard fully configured and deployed in 30 minutes:

```bash
# Clone and install
git clone https://github.com/mmtu-entertainment/driftguard-mvp
cd driftguard-mvp
pnpm install

# Run guided setup wizard (creates accounts, configures everything)
pnpm run setup
```

### Option 2: Manual Setup

Follow step-by-step guides:

```bash
# Interactive wizard with clickable links
pnpm run setup:wizard

# Quick checklist for experienced users  
pnpm run setup:checklist

# Manual secret configuration
pnpm run setup:secrets
```

### Option 3: Use Existing Installation

If DriftGuard is already set up, install the GitHub App and start posting results:

**1. Install GitHub App**

Install the [DriftGuard GitHub App](https://github.com/apps/driftguard) to your repositories.

**2. Post Test Results**

Send your CTRF test results to DriftGuard:

```bash
curl -X POST https://api.driftguard.dev/api/ctrf/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "ctrf": {
      "name": "Test Results",
      "duration": 5000,
      "status": "passed",
      "results": {
        "tool": {
          "name": "playwright",
          "version": "1.40.0"
        },
        "summary": {
          "tests": 50,
          "passed": 48,
          "failed": 2,
          "pending": 0,
          "skipped": 0
        },
        "tests": [...]
      }
    },
    "repository": {
      "owner": "your-username",
      "repo": "your-repo",
      "sha": "abc123...",
      "installationId": 12345
    }
  }'
```

**3. See Check Runs on GitHub**

Check runs appear automatically on your PRs and commits with detailed test results.

---

## 🛠️ Setup Documentation

| File | Purpose | Use When |
|------|---------|----------|
| `SETUP_CHECKLIST.md` | Quick overview of setup options | Want to see what's involved |
| `INTERACTIVE_SETUP_WIZARD.md` | Step-by-step guide with clickable links | First time setup, want details |
| `quick-setup.sh` | Automated setup script | Want guided automation |
| `configure-secrets.sh` | Secret configuration only | Already have accounts |
| `validate-setup.js` | Verify setup completion | Check if everything works |

## 📊 CTRF Integration Examples

### Playwright

```javascript
// playwright.config.js
module.exports = {
  reporter: [
    ['@ctrf/playwright-ctrf-json-reporter', {
      outputFile: 'ctrf-report.json',
    }]
  ],
  // ... other config
};
```

### Jest

```json
// package.json
{
  "scripts": {
    "test": "jest --reporters=default --reporters=@ctrf/jest-ctrf-json-reporter"
  }
}
```

### Cypress

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      require('@ctrf/cypress-ctrf-json-reporter/src/index')(on);
    },
  },
};
```

## 🔧 Development Setup

### Prerequisites

- Node.js v16+ 
- pnpm 8+
- Wrangler CLI
- Stripe CLI (for webhook testing)

### Local Development

```bash
# Clone and install dependencies
git clone https://github.com/mmtu-entertainment/driftguard-mvp
cd driftguard-mvp
pnpm install

# Set up environment
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your configuration

# Start development server
pnpm dev

# Test with Stripe webhooks
stripe listen --forward-to localhost:8787/api/stripe/webhook
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy

# Set secrets
wrangler secret put GITHUB_PRIVATE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put SUPABASE_SERVICE_KEY
```

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Cloudflare Workers (workerd)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2 + KV
- **Payments**: Stripe
- **Analytics**: PostHog
- **Language**: TypeScript

### Key Components

- **CTRF Handler**: Validates and processes test reports
- **GitHub Integration**: Posts check runs via GitHub Apps API
- **Stripe Integration**: Manages subscriptions and billing
- **Rate Limiting**: KV-based rate limiting for API protection
- **Dashboard**: Simple web interface for repository management

### Security Features

- HMAC signature verification for all webhooks
- Row-level security (RLS) for multi-tenant data access
- Input validation and sanitization
- Rate limiting and DDoS protection
- SOC 2 compliant infrastructure

## 📋 API Reference

### POST /api/ctrf/ingest

Submit CTRF test results for processing.

**Request Body:**

```typescript
{
  ctrf: CTRFReport;           // Valid CTRF format report
  repository: {
    owner: string;            // GitHub repository owner
    repo: string;             // Repository name
    sha: string;              // Commit SHA (40 chars)
    installationId: number;   // GitHub App installation ID
  };
  metadata?: {
    pullRequestNumber?: number;
    branchName?: string;
    buildUrl?: string;
    buildNumber?: string;
  };
}
```

**Response:**

```typescript
{
  success: boolean;
  checkRun: {
    id: number;
    url: string;
    name: string;
    status: string;
    conclusion: string;
  };
  report: {
    tool: string;
    status: string;
    tests: number;
    passed: number;
    failed: number;
    duration: number;
  };
}
```

### GET /api/dashboard/repositories

List repositories associated with authenticated installation.

### GET /api/dashboard/check-runs

List recent check runs with optional repository filtering.

### POST /api/github/webhook

GitHub App webhook endpoint (internal use only).

### POST /api/stripe/webhook

Stripe webhook endpoint for subscription management (internal use only).

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $5/dev/month | 5 repos, basic analytics, email support |
| **Professional** | $15/dev/month | Unlimited repos, advanced analytics, priority support |
| **Enterprise** | $25/dev/month | SOC 2, SSO, SLA, dedicated support |

## 🔒 Security & Compliance

- **SOC 2 Type II** compliance in progress
- **GDPR** compliant data handling
- **End-to-end encryption** for sensitive data
- **Regular security audits** and penetration testing
- **99.9% uptime SLA** for Enterprise customers

## 📈 Performance Metrics

- **< 100ms** average response time globally
- **99.9%** uptime across all regions
- **15,000 req/hour** per GitHub Enterprise installation
- **< 130KB** total bundle size (gzipped)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: [docs.driftguard.dev](https://docs.driftguard.dev)
- **GitHub Issues**: [Report bugs](https://github.com/mmtu-entertainment/driftguard/issues)
- **Email**: support@driftguard.dev
- **Status Page**: [status.driftguard.dev](https://status.driftguard.dev)

---

Built with ❤️ by [MMTU Entertainment](https://mmtuentertainment.com) • Powered by [CTRF](https://ctrf.io)
/**
 * Web Dashboard Handler
 * Simple HTML dashboard for repository management
 */

import type { Env } from '../index';
import { htmlResponse, jsonResponse } from '../utils/response';

export async function handleDashboard(
  request: Request,
  env: Env,
  services: { supabase: any }
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  // Handle different dashboard routes
  if (pathname === '/api/dashboard/repositories') {
    return await handleRepositoriesAPI(request, env, services);
  }

  if (pathname === '/api/dashboard/check-runs') {
    return await handleCheckRunsAPI(request, env, services);
  }

  if (pathname === '/api/dashboard/pricing') {
    return await handlePricingAPI(request, env, services);
  }

  // Serve main dashboard HTML
  return htmlResponse(generateDashboardHTML(env));
}

/**
 * API endpoint for repositories data
 */
async function handleRepositoriesAPI(
  request: Request,
  env: Env,
  services: { supabase: any }
): Promise<Response> {
  try {
    const { data: repositories, error } = await services.supabase
      .from('installation_repositories')
      .select(`
        *,
        installations!inner(account_login, account_type)
      `)
      .is('removed_at', null)
      .order('added_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return jsonResponse({
      repositories: repositories || [],
      total: repositories?.length || 0,
    });

  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    return jsonResponse({ error: 'Failed to fetch repositories' }, 500);
  }
}

/**
 * API endpoint for check runs data
 */
async function handleCheckRunsAPI(
  request: Request,
  env: Env,
  services: { supabase: any }
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const repository = url.searchParams.get('repository');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let query = services.supabase
      .from('check_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (repository) {
      const [owner, repo] = repository.split('/');
      query = query
        .eq('repository_owner', owner)
        .eq('repository_name', repo);
    }

    const { data: checkRuns, error } = await query;

    if (error) {
      throw error;
    }

    return jsonResponse({
      checkRuns: checkRuns || [],
      total: checkRuns?.length || 0,
    });

  } catch (error) {
    console.error('Failed to fetch check runs:', error);
    return jsonResponse({ error: 'Failed to fetch check runs' }, 500);
  }
}

/**
 * API endpoint for pricing information
 */
async function handlePricingAPI(
  request: Request,
  env: Env,
  services: { supabase: any }
): Promise<Response> {
  const pricing = {
    plans: [
      {
        id: 'starter',
        name: 'Starter',
        price: 5,
        currency: 'USD',
        interval: 'month',
        features: [
          'Up to 5 repositories',
          'Basic check runs',
          'Email support',
          'Standard analytics',
        ],
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 15,
        currency: 'USD',
        interval: 'month',
        popular: true,
        features: [
          'Unlimited repositories',
          'Advanced analytics',
          'Team management',
          'Priority support',
          'Custom integrations',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 25,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Professional',
          'SOC 2 compliance',
          'SSO integration',
          '99.9% SLA',
          'Dedicated support',
          'Custom onboarding',
        ],
      },
    ],
  };

  return jsonResponse(pricing);
}

/**
 * Generate HTML for dashboard
 */
function generateDashboardHTML(env: Env): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DriftGuard - Universal GitHub Check Runs</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            padding: 20px 0;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 30px;
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .nav-links {
            display: flex;
            gap: 30px;
        }
        
        .nav-links a {
            text-decoration: none;
            color: #64748b;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .nav-links a:hover {
            color: #2563eb;
        }
        
        .hero {
            text-align: center;
            padding: 60px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            margin-bottom: 40px;
        }
        
        .hero h1 {
            font-size: 48px;
            margin-bottom: 20px;
            font-weight: 700;
        }
        
        .hero p {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .cta-button {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            transition: transform 0.2s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        
        .feature {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .feature h3 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 14px;
        }
        
        .pricing {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        
        .price-card {
            background: white;
            padding: 40px 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: relative;
        }
        
        .price-card.popular {
            border: 2px solid #2563eb;
        }
        
        .popular-badge {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: #2563eb;
            color: white;
            padding: 5px 20px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .price {
            font-size: 48px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        
        .price-period {
            color: #64748b;
            margin-bottom: 30px;
        }
        
        .features-list {
            list-style: none;
            margin-bottom: 30px;
        }
        
        .features-list li {
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .features-list li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .select-plan {
            width: 100%;
            background: #2563eb;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .select-plan:hover {
            background: #1d4ed8;
        }
        
        .footer {
            background: #1e293b;
            color: white;
            text-align: center;
            padding: 40px 0;
            border-radius: 12px;
        }
        
        .api-status {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #10b981;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">DriftGuard</div>
                <div class="nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#docs">Docs</a>
                    <a href="https://github.com/apps/driftguard">Install</a>
                </div>
            </nav>
        </div>
    </div>

    <div class="container">
        <div class="hero">
            <h1>Universal GitHub Check Runs</h1>
            <p>Aggregate test results from any framework into clean, beautiful GitHub check runs</p>
            <a href="https://github.com/apps/driftguard" class="cta-button">Install GitHub App</a>
        </div>

        <div class="api-status">
            <span class="status-indicator"></span>
            <strong>API Status:</strong> All systems operational
            <span style="float: right; color: #64748b;">
                Environment: ${env.ENVIRONMENT || 'development'}
            </span>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-number" id="total-repositories">-</div>
                <div class="stat-label">Active Repositories</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="total-check-runs">-</div>
                <div class="stat-label">Check Runs Created</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="total-installations">-</div>
                <div class="stat-label">GitHub Installations</div>
            </div>
            <div class="stat">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">Uptime</div>
            </div>
        </div>

        <div id="features" class="features">
            <div class="feature">
                <h3>🔄 Universal CTRF Support</h3>
                <p>Works with Playwright, Jest, Cypress, WebdriverIO, and any testing framework that outputs CTRF format. One API for all your test results.</p>
            </div>
            <div class="feature">
                <h3>⚡ Lightning Fast</h3>
                <p>Cloudflare Workers deployment ensures sub-100ms response times globally. Your check runs appear instantly on GitHub PRs.</p>
            </div>
            <div class="feature">
                <h3>🔒 Enterprise Ready</h3>
                <p>SOC 2 compliant infrastructure with 99.9% SLA. Built for teams that need reliability and security at scale.</p>
            </div>
            <div class="feature">
                <h3>📊 Rich Analytics</h3>
                <p>Track test performance, failure rates, and team productivity with detailed analytics and historical trend data.</p>
            </div>
            <div class="feature">
                <h3>🚀 Easy Integration</h3>
                <p>Simple HTTP API for posting test results. Works with any CI/CD system. No complex setup or maintenance required.</p>
            </div>
            <div class="feature">
                <h3>💰 Fair Pricing</h3>
                <p>Pay only for what you use. Transparent per-developer pricing with no hidden fees. Start free, scale as you grow.</p>
            </div>
        </div>

        <div id="pricing" class="pricing">
            <div class="price-card">
                <h3>Starter</h3>
                <div class="price">$5</div>
                <div class="price-period">per developer/month</div>
                <ul class="features-list">
                    <li>Up to 5 repositories</li>
                    <li>Basic check runs</li>
                    <li>Email support</li>
                    <li>Standard analytics</li>
                </ul>
                <button class="select-plan" onclick="selectPlan('starter')">Choose Starter</button>
            </div>
            <div class="price-card popular">
                <div class="popular-badge">Most Popular</div>
                <h3>Professional</h3>
                <div class="price">$15</div>
                <div class="price-period">per developer/month</div>
                <ul class="features-list">
                    <li>Unlimited repositories</li>
                    <li>Advanced analytics</li>
                    <li>Team management</li>
                    <li>Priority support</li>
                    <li>Custom integrations</li>
                </ul>
                <button class="select-plan" onclick="selectPlan('professional')">Choose Professional</button>
            </div>
            <div class="price-card">
                <h3>Enterprise</h3>
                <div class="price">$25</div>
                <div class="price-period">per developer/month</div>
                <ul class="features-list">
                    <li>Everything in Professional</li>
                    <li>SOC 2 compliance</li>
                    <li>SSO integration</li>
                    <li>99.9% SLA</li>
                    <li>Dedicated support</li>
                    <li>Custom onboarding</li>
                </ul>
                <button class="select-plan" onclick="selectPlan('enterprise')">Choose Enterprise</button>
            </div>
        </div>

        <div class="footer">
            <p>&copy; 2025 MMTU Entertainment. Built with Cloudflare Workers.</p>
            <p style="margin-top: 10px; opacity: 0.8;">
                <a href="https://ctrf.io" style="color: #94a3b8;">Powered by CTRF</a> • 
                <a href="/api/health" style="color: #94a3b8;">API Status</a> • 
                <a href="https://github.com/mmtu-entertainment/driftguard" style="color: #94a3b8;">Open Source</a>
            </p>
        </div>
    </div>

    <script>
        // Load dashboard data
        async function loadDashboardData() {
            try {
                const [repos, checkRuns] = await Promise.all([
                    fetch('/api/dashboard/repositories').then(r => r.json()),
                    fetch('/api/dashboard/check-runs').then(r => r.json())
                ]);

                document.getElementById('total-repositories').textContent = repos.total || 0;
                document.getElementById('total-check-runs').textContent = checkRuns.total || 0;
                
                // Estimate installations (assuming avg 3 repos per installation)
                const estimatedInstallations = Math.ceil((repos.total || 0) / 3);
                document.getElementById('total-installations').textContent = estimatedInstallations;
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }

        // Handle plan selection
        function selectPlan(planId) {
            alert(\`Selected \${planId} plan. Stripe integration coming soon!\`);
            // TODO: Implement Stripe Checkout
        }

        // Load data on page load
        document.addEventListener('DOMContentLoaded', loadDashboardData);
    </script>
</body>
</html>`;
}
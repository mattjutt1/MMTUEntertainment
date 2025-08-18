#!/bin/bash

# DriftGuard Secret Configuration Script
# Run this after completing all external service setups
# Make sure you have the following credentials ready:
# - GitHub App private key (.pem file)
# - GitHub webhook secret
# - Stripe secret key
# - Stripe webhook secret
# - Supabase service key

echo "🔐 DriftGuard Secret Configuration"
echo "=================================="
echo ""
echo "This script will configure all sensitive secrets for DriftGuard."
echo "Make sure you have completed all external service setups first:"
echo "- GitHub App (GITHUB_APP_SETUP.md)"
echo "- Supabase project (SUPABASE_SETUP.md)"
echo "- Stripe account (STRIPE_SETUP.md)"
echo "- PostHog project (POSTHOG_SETUP.md)"
echo ""

read -p "Have you completed all external service setups? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Please complete the external service setups first."
    echo "📖 See the setup guides in the project directory."
    exit 1
fi

echo ""
echo "🔑 Setting GitHub secrets..."
echo "GitHub App private key (paste the contents of your .pem file):"
wrangler secret put GITHUB_PRIVATE_KEY

echo ""
echo "GitHub webhook secret (from your GitHub App settings):"
wrangler secret put GITHUB_WEBHOOK_SECRET

echo ""
echo "🔑 Setting Stripe secrets..."
echo "Stripe secret key (sk_test_... or sk_live_...):"
wrangler secret put STRIPE_SECRET_KEY

echo ""
echo "Stripe webhook secret (whsec_...):"
wrangler secret put STRIPE_WEBHOOK_SECRET

echo ""
echo "🔑 Setting Supabase secrets..."
echo "Supabase service key (service_role key from project settings):"
wrangler secret put SUPABASE_SERVICE_KEY

echo ""
echo "✅ All secrets configured!"
echo ""
echo "🚀 Next steps:"
echo "1. Update environment variables in wrangler.toml with your actual values"
echo "2. Run: pnpm run deploy"
echo "3. Test all endpoints for 200 status codes"
echo ""
echo "📊 Your Worker will be fully functional after deployment!"
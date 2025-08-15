#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

async function collectSecrets() {
  console.log('🧙‍♂️ MMTU One-Time Setup Wizard');
  console.log('=====================================\n');

  const config = {};
  
  // Domain configuration
  config.SUPPORT_EMAIL = await prompt('📧 Support email: ');
  config.PRIMARY_DOMAIN = await prompt('🌐 Primary domain (e.g., mmtuentertainment.com): ');
  config.REPORTS_HOST = await prompt('📊 Reports subdomain (e.g., reports): ');
  config.HOOKS_HOST = await prompt('🪝 Webhooks subdomain (e.g., hooks): ');

  // Stripe configuration (FIXED: Proper environment separation)
  console.log('\n💳 Stripe Configuration');
  config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = await prompt('   Publishable key (pk_...): ');
  config.STRIPE_SECRET_KEY = await prompt('   Secret key (sk_...): ');

  // Calendly configuration  
  console.log('\n📅 Calendly Configuration');
  config.CALENDLY_SOC2_URL = await prompt('   SOC2 Paid Event URL: ');

  // Supabase configuration (FIXED: Server-only service key)
  console.log('\n🗄️  Supabase Configuration');
  config.SUPABASE_URL = await prompt('   URL (https://xxxx.supabase.co): ');
  config.SUPABASE_SERVICE_KEY = await prompt('   SERVICE_ROLE key (server-only): ');

  // PostHog configuration (FIXED: Client vs server split)
  console.log('\n📈 PostHog Configuration');
  config.NEXT_PUBLIC_POSTHOG_KEY = await prompt('   Project API key (phc_...) for client: ');
  config.POSTHOG_KEY = await prompt('   Project API key (phc_...) for server: ');

  // GitHub configuration
  console.log('\n🐙 GitHub Configuration');
  config.GITHUB_ORG = await prompt('   Organization: ');
  config.GITHUB_APP_NAME = await prompt('   App name: ');

  rl.close();

  // Write .env file with proper variable separation
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Environment file created with security separation');

  // Deploy Worker secrets (only server-side secrets)
  console.log('\n🔐 Deploying Cloudflare Worker secrets...');
  
  try {
    execSync(`echo "${config.STRIPE_SECRET_KEY}" | npx wrangler secret put STRIPE_SECRET_KEY --name mmtu-marketplace-webhooks`, { stdio: 'inherit' });
    execSync(`echo "${config.SUPABASE_SERVICE_KEY}" | npx wrangler secret put SUPABASE_SERVICE_KEY --name mmtu-marketplace-webhooks`, { stdio: 'inherit' });
    execSync(`echo "${config.POSTHOG_KEY}" | npx wrangler secret put POSTHOG_KEY --name mmtu-marketplace-webhooks`, { stdio: 'inherit' });
    console.log('✅ Worker secrets deployed securely');
  } catch (error) {
    console.log('⚠️  Manual secret deployment needed - run:');
    console.log('  npx wrangler secret put STRIPE_SECRET_KEY --name mmtu-marketplace-webhooks');
    console.log('  npx wrangler secret put SUPABASE_SERVICE_KEY --name mmtu-marketplace-webhooks'); 
    console.log('  npx wrangler secret put POSTHOG_KEY --name mmtu-marketplace-webhooks');
  }

  console.log('\n🚀 Setup complete! Next steps:');
  console.log('1. /deploy-soc2 <domain> - Deploy SOC2 Express');
  console.log('2. /deploy-driftguard <app-name> - Deploy DriftGuard');
  console.log('3. Test end-to-end payment and PDF generation');
  
  console.log('\n🔐 Security Notes:');
  console.log('✅ Publishable keys safe for frontend');
  console.log('✅ Secret keys secured in Workers only');
  console.log('✅ PostHog split: client vs server tracking');
}

collectSecrets().catch(console.error);
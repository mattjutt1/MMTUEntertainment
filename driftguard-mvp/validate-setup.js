#!/usr/bin/env node

/**
 * DriftGuard Setup Validation Script
 * Validates that all required environment variables and secrets are configured
 */

const fs = require('fs');
const path = require('path');

function validateWranglerToml() {
  const wranglerPath = path.join(__dirname, 'wrangler.toml');
  
  if (!fs.existsSync(wranglerPath)) {
    console.error('❌ wrangler.toml not found');
    return false;
  }

  const content = fs.readFileSync(wranglerPath, 'utf8');
  
  // Check for placeholder values that need to be replaced
  const placeholders = [
    'YOUR_GITHUB_APP_ID',
    'YOUR_STRIPE_PUBLISHABLE_KEY', 
    'YOUR_SUPABASE_PROJECT_URL',
    'YOUR_SUPABASE_ANON_KEY',
    'YOUR_POSTHOG_API_KEY'
  ];

  const hasPlaceholders = placeholders.some(placeholder => content.includes(placeholder));
  
  if (hasPlaceholders) {
    console.error('❌ wrangler.toml still contains placeholder values');
    console.error('📝 Please update the following in wrangler.toml:');
    placeholders.forEach(placeholder => {
      if (content.includes(placeholder)) {
        console.error(`   - ${placeholder}`);
      }
    });
    return false;
  }

  console.log('✅ wrangler.toml environment variables configured');
  return true;
}

async function validateSecrets() {
  const { execSync } = require('child_process');
  
  const requiredSecrets = [
    'GITHUB_PRIVATE_KEY',
    'GITHUB_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_KEY'
  ];

  console.log('🔍 Checking secrets...');
  
  try {
    const output = execSync('wrangler secret list', { encoding: 'utf8' });
    
    const missingSecrets = requiredSecrets.filter(secret => !output.includes(secret));
    
    if (missingSecrets.length > 0) {
      console.error('❌ Missing secrets:');
      missingSecrets.forEach(secret => console.error(`   - ${secret}`));
      console.error('📝 Run ./configure-secrets.sh to set them');
      return false;
    }

    console.log('✅ All secrets configured');
    return true;
  } catch (error) {
    console.error('❌ Error checking secrets:', error.message);
    console.error('💡 Make sure you\'re authenticated with wrangler');
    return false;
  }
}

function validateSetupGuides() {
  const guides = [
    'GITHUB_APP_SETUP.md',
    'SUPABASE_SETUP.md', 
    'STRIPE_SETUP.md',
    'POSTHOG_SETUP.md'
  ];

  const missingGuides = guides.filter(guide => !fs.existsSync(path.join(__dirname, guide)));
  
  if (missingGuides.length > 0) {
    console.error('❌ Missing setup guides:', missingGuides);
    return false;
  }

  console.log('✅ All setup guides present');
  return true;
}

async function main() {
  console.log('🔍 DriftGuard Setup Validation');
  console.log('==============================\n');

  const validations = [
    validateSetupGuides(),
    validateWranglerToml(),
    await validateSecrets()
  ];

  const allValid = validations.every(v => v);

  console.log('\n' + '='.repeat(40));
  
  if (allValid) {
    console.log('🎉 Setup validation complete!');
    console.log('🚀 Ready to deploy: pnpm run deploy');
  } else {
    console.log('❌ Setup incomplete');
    console.log('📖 Follow the setup guides and run this script again');
    process.exit(1);
  }
}

main().catch(console.error);
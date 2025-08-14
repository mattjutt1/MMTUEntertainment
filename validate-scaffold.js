#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateScaffold() {
  const checks = [];
  
  // Check 1: Root package.json with workspaces
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  checks.push({
    name: 'Root workspace configuration',
    pass: rootPkg.workspaces && rootPkg.workspaces.includes('apps/*'),
    details: `Workspaces: ${rootPkg.workspaces}`
  });
  
  // Check 2: Pricing catalog exists
  const pricingExists = fs.existsSync('docs/pricing-catalog.v2.json');
  let pricingValid = false;
  if (pricingExists) {
    try {
      const pricing = JSON.parse(fs.readFileSync('docs/pricing-catalog.v2.json', 'utf8'));
      pricingValid = pricing.comparison_matrix && pricing.driftguard;
    } catch (e) {}
  }
  checks.push({
    name: 'Pricing catalog configuration',
    pass: pricingExists && pricingValid,
    details: `File exists: ${pricingExists}, Valid structure: ${pricingValid}`
  });
  
  // Check 3: Probot app structure
  const probotStructure = [
    'apps/probot-app/package.json',
    'apps/probot-app/src/index.ts',
    'apps/probot-app/src/webhooks/marketplace.ts',
    'apps/probot-app/src/features/chatgpt-reviews.ts'
  ];
  const probotValid = probotStructure.every(file => fs.existsSync(file));
  checks.push({
    name: 'Probot app structure',
    pass: probotValid,
    details: `Files: ${probotStructure.map(f => fs.existsSync(f) ? '✓' : '✗').join(' ')}`
  });
  
  // Check 4: Entitlements package
  const entitlementsValid = fs.existsSync('packages/entitlements/src/index.ts');
  checks.push({
    name: 'Entitlements package',
    pass: entitlementsValid,
    details: `Core file exists: ${entitlementsValid}`
  });
  
  // Check 5: Comparison matrix app
  const comparisonFiles = [
    'apps/comparison-matrix/src/App.tsx',
    'apps/comparison-matrix/src/components/ComparisonMatrix.tsx'
  ];
  const comparisonValid = comparisonFiles.every(file => fs.existsSync(file));
  checks.push({
    name: 'Comparison matrix app',
    pass: comparisonValid,
    details: `React components: ${comparisonFiles.map(f => fs.existsSync(f) ? '✓' : '✗').join(' ')}`
  });
  
  // Check 6: GitHub Action
  const actionFiles = [
    '.github/workflows/chatgpt-pr-review.yml',
    '.github/actions/chatgpt-review/action.yml',
    '.github/actions/chatgpt-review/src/index.ts'
  ];
  const actionValid = actionFiles.every(file => fs.existsSync(file));
  checks.push({
    name: 'ChatGPT GitHub Action',
    pass: actionValid,
    details: `Action files: ${actionFiles.map(f => fs.existsSync(f) ? '✓' : '✗').join(' ')}`
  });
  
  // Report results
  console.log('🔍 MMTU Monorepo Scaffold Validation\n');
  
  let allPassed = true;
  checks.forEach(check => {
    const status = check.pass ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (check.details) {
      console.log(`   ${check.details}`);
    }
    if (!check.pass) allPassed = false;
  });
  
  console.log(`\n📊 Summary: ${checks.filter(c => c.pass).length}/${checks.length} checks passed`);
  
  if (allPassed) {
    console.log('\n🎉 Scaffold validation successful! Ready for development.');
  } else {
    console.log('\n⚠️  Some checks failed. Review the issues above.');
  }
  
  return allPassed;
}

if (require.main === module) {
  const success = validateScaffold();
  process.exit(success ? 0 : 1);
}

module.exports = { validateScaffold };
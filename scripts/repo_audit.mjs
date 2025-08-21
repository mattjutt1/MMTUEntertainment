#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const AUDIT_TIMESTAMP = new Date().toISOString();
const REQUIRED_ARTIFACTS = [
  'package.json',
  'pnpm-workspace.yaml',
  'docs/pricing-catalog.v2.json',
  'apps/reports/src/components/PricingTiers.tsx',
  'apps/stream-overlay-studio/package.json',
  'packages/entitlements/src/index.ts',
  'packages/pricing-engine/src/index.ts',
  '.github/workflows/repo-audit.yml'
];

const EXPECTED_APPS = [
  'apps/comparison-matrix',
  'apps/probot-app', 
  'apps/reports',
  'apps/stream-overlay-studio',
  'apps/web-toy-mvp'
];

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

function generateRepoTree() {
  console.log('📁 Generating repository tree...');
  
  function walkDirectory(dir, prefix = '', results = []) {
    try {
      const items = readdirSync(dir).filter(item => 
        !item.startsWith('.git') && 
        !item.startsWith('node_modules') &&
        !item.startsWith('dist') &&
        !item.startsWith('build')
      ).sort();
      
      items.forEach((item, index) => {
        const fullPath = join(dir, item);
        const isLast = index === items.length - 1;
        const currentPrefix = isLast ? '└── ' : '├── ';
        const nextPrefix = isLast ? '    ' : '│   ';
        
        try {
          const stats = statSync(fullPath);
          if (stats.isDirectory()) {
            results.push(`${prefix}${currentPrefix}${item}/`);
            walkDirectory(fullPath, prefix + nextPrefix, results);
          } else {
            const size = stats.size;
            const sizeStr = size > 1024 ? `(${Math.round(size/1024)}KB)` : `(${size}B)`;
            results.push(`${prefix}${currentPrefix}${item} ${sizeStr}`);
          }
        } catch (err) {
          results.push(`${prefix}${currentPrefix}${item} (ACCESS_ERROR)`);
        }
      });
    } catch (err) {
      results.push(`${prefix}ERROR reading directory: ${err.message}`);
    }
    
    return results;
  }
  
  const tree = walkDirectory('.', '', ['Repository Structure:', '']);
  const treeContent = tree.join('\\n');
  writeFileSync('repo-tree.txt', treeContent);
  return tree.length;
}

function generateCommitHistory() {
  console.log('📝 Generating commit history...');
  
  const gitLog = executeCommand('git log --oneline -n 50 --all --graph --decorate');
  const gitStatus = executeCommand('git status --porcelain');
  const gitBranches = executeCommand('git branch -a');
  
  const commitContent = [
    'Last 50 Commits:',
    '='.repeat(50),
    gitLog,
    '',
    'Current Status:',
    '='.repeat(20),
    gitStatus || 'Working directory clean',
    '',
    'Branches:',
    '='.repeat(20),
    gitBranches,
    '',
    `Generated: ${AUDIT_TIMESTAMP}`
  ].join('\\n');
  
  writeFileSync('last-commits.txt', commitContent);
  return gitLog.split('\\n').length;
}

function auditRequiredArtifacts() {
  console.log('🔍 Auditing required artifacts...');
  console.log(`🔧 Working directory: ${process.cwd()}`);
  console.log(`🔧 Node version: ${process.version}`);
  
  const results = {
    timestamp: AUDIT_TIMESTAMP,
    summary: {
      total_files: 0,
      total_commits: 0,
      required_artifacts: REQUIRED_ARTIFACTS.length,
      artifacts_present: 0,
      apps_expected: EXPECTED_APPS.length,
      apps_present: 0,
      critical_failures: 0,
      warnings: 0
    },
    artifacts: {},
    apps: {},
    structure_checks: {},
    git_info: {}
  };
  
  // Check required artifacts
  console.log('🔍 Checking required artifacts:');
  REQUIRED_ARTIFACTS.forEach(artifact => {
    const exists = existsSync(artifact);
    let size = 0;
    let type = 'file';
    
    if (exists) {
      console.log(`  ✅ ${artifact}`);
      try {
        const stats = statSync(artifact);
        size = stats.size;
        type = stats.isDirectory() ? 'directory' : 'file';
        results.summary.artifacts_present++;
      } catch (err) {
        console.log(`  ⚠️ ${artifact} (stat error: ${err.message})`);
        exists = false;
      }
    } else {
      console.log(`  ❌ ${artifact} (not found)`);
      results.summary.critical_failures++;
    }
    
    results.artifacts[artifact] = {
      exists,
      size,
      type,
      critical: true
    };
  });
  
  // Check expected apps
  console.log('🔍 Checking expected apps:');
  EXPECTED_APPS.forEach(app => {
    const exists = existsSync(app);
    let packageJson = false;
    let hasSource = false;
    
    if (exists) {
      console.log(`  ✅ ${app}`);
      results.summary.apps_present++;
      packageJson = existsSync(join(app, 'package.json'));
      
      // Check for source files
      try {
        const srcPath = join(app, 'src');
        hasSource = existsSync(srcPath);
      } catch (err) {
        // Ignore
      }
    } else {
      console.log(`  ❌ ${app} (not found)`);
      results.summary.warnings++;
    }
    
    results.apps[app] = {
      exists,
      has_package_json: packageJson,
      has_source: hasSource
    };
  });
  
  // Structure checks
  results.structure_checks = {
    monorepo_workspace: existsSync('pnpm-workspace.yaml'),
    pricing_catalog: existsSync('docs/pricing-catalog.v2.json'),
    entitlements_package: existsSync('packages/entitlements'),
    pricing_engine: existsSync('packages/pricing-engine'),
    github_workflows: existsSync('.github/workflows'),
    security_workflows: [
      existsSync('.github/workflows/gitleaks.yml'),
      existsSync('.github/workflows/semgrep.yml')
    ].every(Boolean)
  };
  
  // Git information
  results.git_info = {
    current_branch: executeCommand('git branch --show-current'),
    total_branches: executeCommand('git branch -a').split('\\n').length,
    remote_url: executeCommand('git remote get-url origin'),
    latest_commit: executeCommand('git log -1 --format="%H %s"'),
    commit_count: parseInt(executeCommand('git rev-list --count HEAD')) || 0
  };
  
  // Generate file tree and commit history
  results.summary.total_files = generateRepoTree();
  results.summary.total_commits = generateCommitHistory();
  
  // Additional critical checks
  if (!existsSync('package.json')) {
    results.summary.critical_failures++;
  }
  
  if (!existsSync('pnpm-workspace.yaml')) {
    results.summary.critical_failures++;
  }
  
  return results;
}

function main() {
  console.log('🚀 Starting repository self-audit...');
  console.log(`Timestamp: ${AUDIT_TIMESTAMP}`);
  
  try {
    const auditResults = auditRequiredArtifacts();
    
    // Write audit report
    writeFileSync('audit-report.json', JSON.stringify(auditResults, null, 2));
    
    // Console summary
    console.log('\\n📊 Audit Summary:');
    console.log(`✅ Artifacts present: ${auditResults.summary.artifacts_present}/${auditResults.summary.required_artifacts}`);
    console.log(`✅ Apps present: ${auditResults.summary.apps_present}/${auditResults.summary.apps_expected}`);
    console.log(`📁 Total files: ${auditResults.summary.total_files}`);
    console.log(`📝 Total commits: ${auditResults.summary.total_commits}`);
    console.log(`⚠️  Warnings: ${auditResults.summary.warnings}`);
    console.log(`❌ Critical failures: ${auditResults.summary.critical_failures}`);
    
    if (auditResults.summary.critical_failures > 0) {
      console.log('\\n❌ AUDIT FAILED - Critical artifacts missing');
      process.exit(1);
    } else {
      console.log('\\n✅ AUDIT PASSED - All critical artifacts present');
    }
    
  } catch (error) {
    console.error('💥 Audit failed with error:', error.message);
    
    // Write error report
    const errorReport = {
      timestamp: AUDIT_TIMESTAMP,
      error: error.message,
      stack: error.stack,
      summary: {
        critical_failures: 1,
        total_files: 0,
        total_commits: 0
      }
    };
    
    writeFileSync('audit-report.json', JSON.stringify(errorReport, null, 2));
    process.exit(1);
  }
}

main();
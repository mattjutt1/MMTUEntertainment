#!/usr/bin/env node

/**
 * GitHub Actions SOC2-lite Report Generator
 * Converts HTML template to professional PDF report in CI environment
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function renderReport() {
  // Configuration from environment variables (GitHub Actions compatible)
  const config = {
    orgName: process.env.ORG_NAME || 'ACME Corp',
    repoName: process.env.REPO_NAME || 'main-application',
    reportType: process.env.REPORT_TYPE || 'security-audit',
    scanDate: process.env.SCAN_DATE || new Date().toISOString(),
    findingsFile: process.env.FINDINGS_FILE || './mock-findings.json'
  };

  console.log('🎯 Starting PDF report generation...');
  console.log(`📁 Organization: ${config.orgName}`);
  console.log(`📦 Repository: ${config.repoName}`);
  console.log(`📊 Report Type: ${config.reportType}`);
  console.log(`📅 Scan Date: ${config.scanDate}`);

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'apps', 'reports', 'output');
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Output directory ready: ${outputDir}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Load security findings
  let findings = {};
  try {
    const findingsContent = await fs.readFile(config.findingsFile, 'utf8');
    findings = JSON.parse(findingsContent);
    console.log(`📊 Loaded ${findings.findings?.length || 0} security findings`);
  } catch (error) {
    console.log('⚠️  Error loading findings, using mock data:', error.message);
    findings = createMockFindings(config);
  }

  // Load HTML template
  const templatePath = path.join(__dirname, '..', 'apps', 'reports', 'templates', 'soc2-lite.html');
  const template = await fs.readFile(templatePath, 'utf8');
  console.log('📝 HTML template loaded');

  // Prepare template data
  const templateData = {
    org: config.orgName,
    repo: config.repoName || 'All repositories',
    from: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    to: formatDate(config.scanDate),
    generated_at: formatDate(config.scanDate),
    report_id: `github-${Date.now()}`,
    crit: findings.summary?.critical || 0,
    high: findings.summary?.high_severity || 0,
    med: findings.summary?.medium_severity || 0,
    low: findings.summary?.low_severity || 0,
    total_findings: findings.summary?.total_findings || 0,
    evidence: findings.findings || []
  };

  console.log(`🔍 Report summary: ${templateData.total_findings} findings (${templateData.crit} critical, ${templateData.high} high)`);

  // Process template
  const html = simpleTemplateReplace(template, templateData);

  // Generate PDF
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process' // Additional CI stability
    ]
  });

  const page = await browser.newPage();

  console.log('📄 Processing HTML content...');
  await page.setContent(html, { 
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Generate filename
  const sanitizedOrg = config.orgName.replace(/[^a-zA-Z0-9-]/g, '_');
  const sanitizedRepo = (config.repoName || 'all').replace(/[^a-zA-Z0-9-]/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);
  const pdfFilename = `${config.reportType}-${sanitizedOrg}-${sanitizedRepo}-${timestamp}.pdf`;
  const pdfPath = path.join(outputDir, pdfFilename);

  console.log('📊 Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
      right: '0.5in'
    }
  });

  await browser.close();

  // Get file stats
  const stats = await fs.stat(pdfPath);
  const fileSizeKB = Math.round(stats.size / 1024);

  console.log('✅ PDF generated successfully:');
  console.log(`   📁 Path: ${pdfPath}`);
  console.log(`   📊 Size: ${fileSizeKB} KB`);
  console.log(`   🏢 Org: ${config.orgName}`);
  console.log(`   📦 Repo: ${config.repoName || 'All repositories'}`);
  console.log(`   📅 Period: ${templateData.from} → ${templateData.to}`);
  console.log(`   🔍 Findings: ${templateData.total_findings} total (${templateData.crit} critical, ${templateData.high} high)`);

  return pdfPath;
}

function createMockFindings(config) {
  return {
    org: config.orgName,
    repo: config.repoName,
    scan_date: config.scanDate,
    report_type: config.reportType,
    findings: [
      {
        severity: 'HIGH',
        category: 'Authentication',
        description: 'Missing multi-factor authentication enforcement',
        file: 'src/auth/config.ts',
        line: 42,
        remediation: 'Enable MFA requirement in authentication configuration',
        cwe: 'CWE-308'
      },
      {
        severity: 'MEDIUM',
        category: 'Input Validation',
        description: 'Insufficient input sanitization in user upload endpoint',
        file: 'api/upload.js',
        line: 156,
        remediation: 'Implement comprehensive input validation and sanitization',
        cwe: 'CWE-20'
      },
      {
        severity: 'LOW',
        category: 'Logging',
        description: 'Sensitive data potentially logged in error messages',
        file: 'utils/logger.ts',
        line: 89,
        remediation: 'Implement log sanitization to remove sensitive information',
        cwe: 'CWE-532'
      }
    ],
    summary: {
      total_findings: 3,
      high_severity: 1,
      medium_severity: 1,
      low_severity: 1,
      files_scanned: 247,
      scan_duration: '2m 34s'
    }
  };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function simpleTemplateReplace(html, data) {
  let result = html;

  // Replace simple variables
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
  });

  // Handle evidence array
  if (data.evidence && Array.isArray(data.evidence) && data.evidence.length > 0) {
    const evidenceHtml = data.evidence.map(item => `
      <tr>
        <td>
          <div class="evidence-rule">${item.category || item.rule || 'Security Finding'}</div>
          ${item.description ? `<div style="font-size: 11px; color: #718096; margin-top: 4px;">${item.description}</div>` : ''}
        </td>
        <td>
          <div class="evidence-location">${item.file}:${item.line}</div>
        </td>
        <td>
          <span class="evidence-severity ${item.severity.toLowerCase()}">${item.severity}</span>
        </td>
        <td>
          <span class="evidence-status ${item.status || 'open'}">${item.status || 'Open'}</span>
        </td>
        <td>
          ${item.pr_url ? `<a href="${item.pr_url}" class="evidence-link">PR #${item.pr_number}</a>` : '<span style="color: #a0aec0;">—</span>'}
        </td>
        <td style="font-size: 11px; color: #718096;">
          ${item.last_updated ? formatDate(item.last_updated) : formatDate(new Date().toISOString())}
        </td>
      </tr>
    `).join('');

    result = result.replace(/{{#each evidence}}[\s\S]*?{{\/each}}/g, evidenceHtml);
  } else {
    // No evidence case
    const noEvidenceHtml = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 24px; color: #4a5568; font-style: italic;">
          No security findings detected during the assessment period.
        </td>
      </tr>
    `;
    result = result.replace(/{{#each evidence}}[\s\S]*?{{\/each}}/g, noEvidenceHtml);
  }

  // Handle unless blocks
  if (!data.evidence || data.evidence.length === 0) {
    result = result.replace(/{{#unless evidence}}[\s\S]*?{{\/unless}}/g,
      '<tr><td colspan="6" style="text-align: center; padding: 24px; color: #4a5568; font-style: italic;">No security findings detected during the assessment period.</td></tr>');
  } else {
    result = result.replace(/{{#unless evidence}}[\s\S]*?{{\/unless}}/g, '');
  }

  return result;
}

// Run if called directly
if (require.main === module) {
  renderReport().catch(error => {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  });
}

module.exports = { renderReport };
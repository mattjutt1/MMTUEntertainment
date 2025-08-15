#!/usr/bin/env node

/**
 * SOC2-lite Report Generator using Puppeteer
 * Converts HTML template to professional PDF report
 */

import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

// Environment variables
const ORG = process.env.DG_ORG;
const REPO = process.env.DG_REPO;
const FROM = process.env.DG_FROM;
const TO = process.env.DG_TO;
const RUNID = process.env.DG_RUNID || `run-${Date.now()}`;

// Validate required parameters
if (!ORG || !REPO || !FROM || !TO) {
  console.error("Missing required environment variables:");
  console.error("  DG_ORG: Organization name");
  console.error("  DG_REPO: Repository name"); 
  console.error("  DG_FROM: Start date (ISO format)");
  console.error("  DG_TO: End date (ISO format)");
  console.error("  DG_RUNID: Run identifier (optional)");
  process.exit(1);
}

// File paths
const templatePath = path.join("apps", "reports", "templates", "soc2-lite.html");
const outDir = path.join("out", "reports");
const pdfPath = path.join(outDir, `soc2-lite-${ORG}-${REPO}-${RUNID}.pdf`);

async function loadEvidenceData() {
  // TODO: Load actual evidence from Supabase Evidence Store
  // This is placeholder data for template rendering
  return {
    critical: 1,
    high: 2,
    medium: 5,
    low: 3,
    evidence: [
      {
        rule: "hardcoded-secrets",
        description: "API keys and passwords should not be hardcoded",
        file: "src/config.ts",
        line: 42,
        severity: "high",
        status: "open",
        pr_url: "https://github.com/example/repo/pull/123",
        pr_number: 123,
        last_updated: "2025-01-15T10:30:00Z"
      },
      {
        rule: "sql-injection-risk",
        description: "Potential SQL injection vulnerability detected",
        file: "src/database/queries.ts",
        line: 89,
        severity: "critical",
        status: "fixed",
        pr_url: "https://github.com/example/repo/pull/124",
        pr_number: 124,
        last_updated: "2025-01-14T15:45:00Z"
      },
      {
        rule: "weak-crypto",
        description: "Use of weak cryptographic algorithm",
        file: "src/utils/encryption.ts",
        line: 15,
        severity: "medium",
        status: "acknowledged",
        pr_url: null,
        pr_number: null,
        last_updated: "2025-01-13T09:20:00Z"
      }
    ]
  };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", 
    day: "numeric"
  });
}

function simpleTemplateReplace(html, data) {
  // Simple handlebars-style template replacement
  // For production, consider using a proper template engine
  
  let result = html;
  
  // Replace simple variables
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number") {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value));
    }
  });
  
  // Handle evidence array
  if (data.evidence && Array.isArray(data.evidence)) {
    const evidenceHtml = data.evidence.map(item => `
      <tr>
        <td>
          <div class="evidence-rule">${item.rule}</div>
          ${item.description ? `<div style="font-size: 11px; color: #718096; margin-top: 4px;">${item.description}</div>` : ''}
        </td>
        <td>
          <div class="evidence-location">${item.file}:${item.line}</div>
        </td>
        <td>
          <span class="evidence-severity ${item.severity}">${item.severity}</span>
        </td>
        <td>
          <span class="evidence-status ${item.status}">${item.status}</span>
        </td>
        <td>
          ${item.pr_url ? `<a href="${item.pr_url}" class="evidence-link">PR #${item.pr_number}</a>` : '<span style="color: #a0aec0;">—</span>'}
        </td>
        <td style="font-size: 11px; color: #718096;">
          ${formatDate(item.last_updated)}
        </td>
      </tr>
    `).join("");
    
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

async function generateReport() {
  try {
    console.log("🔄 Loading template and evidence data...");
    
    // Load HTML template
    const template = await fs.readFile(templatePath, "utf8");
    
    // Load evidence data
    const evidenceData = await loadEvidenceData();
    
    // Prepare template data
    const templateData = {
      org: ORG,
      repo: REPO,
      from: formatDate(FROM),
      to: formatDate(TO),
      generated_at: formatDate(new Date().toISOString()),
      report_id: RUNID,
      crit: evidenceData.critical,
      high: evidenceData.high,
      med: evidenceData.medium,
      low: evidenceData.low,
      total_findings: evidenceData.critical + evidenceData.high + evidenceData.medium + evidenceData.low,
      evidence: evidenceData.evidence
    };
    
    console.log("📝 Rendering HTML template...");
    const html = simpleTemplateReplace(template, templateData);
    
    // Ensure output directory exists
    await fs.mkdir(outDir, { recursive: true });
    
    console.log("🚀 Launching browser...");
    const browser = await puppeteer.launch({
      // CI-friendly options
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ]
    });
    
    const page = await browser.newPage();
    
    console.log("📄 Processing HTML content...");
    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000
    });
    
    // Configure for print media
    await page.emulateMediaType("screen");
    
    console.log("📊 Generating PDF...");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0.5in",
        bottom: "0.5in", 
        left: "0.5in",
        right: "0.5in"
      }
    });
    
    await browser.close();
    
    // Get file size for logging
    const stats = await fs.stat(pdfPath);
    const fileSizeKB = Math.round(stats.size / 1024);
    
    console.log(`✅ PDF generated successfully:`);
    console.log(`   📁 Path: ${pdfPath}`);
    console.log(`   📊 Size: ${fileSizeKB} KB`);
    console.log(`   🏢 Org: ${ORG}`);
    console.log(`   📦 Repo: ${REPO}`);
    console.log(`   📅 Period: ${templateData.from} → ${templateData.to}`);
    console.log(`   🔍 Findings: ${templateData.total_findings} total (${templateData.crit} critical, ${templateData.high} high)`);
    
  } catch (error) {
    console.error("❌ Error generating report:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the report generation
generateReport();
/**
 * GitHub Checks API implementation for DriftGuard
 * Handles check run creation, updates, and annotation batching
 */

import { Octokit } from "octokit";
import { 
  CheckRunParams, 
  GitHubAnnotation, 
  createBatchedUpdates, 
  sanitizeAnnotations 
} from "./batchAnnotations.js";

export interface DriftGuardCheckConfig {
  github_token: string;
  owner: string;
  repo: string;
  details_base_url?: string;
}

export interface SecurityFinding {
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  file: string;
  line: number;
  column?: number;
  message: string;
  description?: string;
  remediation?: string;
  category?: string;
}

export class DriftGuardChecks {
  private octokit: Octokit;
  private config: DriftGuardCheckConfig;

  constructor(config: DriftGuardCheckConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.github_token });
  }

  /**
   * Creates a new check run
   */
  async createCheckRun(params: CheckRunParams): Promise<number> {
    const response = await this.octokit.request("POST /repos/{owner}/{repo}/check-runs", {
      owner: this.config.owner,
      repo: this.config.repo,
      ...params
    });

    return response.data.id;
  }

  /**
   * Updates a check run with results
   */
  async updateCheckRun(checkRunId: number, params: Partial<CheckRunParams>): Promise<void> {
    await this.octokit.request("PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      owner: this.config.owner,
      repo: this.config.repo,
      check_run_id: checkRunId,
      ...params
    });
  }

  /**
   * Converts security findings to GitHub annotations
   */
  private findingsToAnnotations(findings: SecurityFinding[]): GitHubAnnotation[] {
    return findings.map(finding => ({
      path: finding.file,
      start_line: finding.line,
      end_line: finding.line,
      start_column: finding.column,
      end_column: finding.column,
      annotation_level: this.severityToLevel(finding.severity),
      message: finding.message,
      title: `${finding.rule} (${finding.severity})`,
      raw_details: this.formatFindingDetails(finding)
    }));
  }

  /**
   * Maps security severity to GitHub annotation level
   */
  private severityToLevel(severity: SecurityFinding["severity"]): GitHubAnnotation["annotation_level"] {
    switch (severity) {
      case "critical":
      case "high":
        return "failure";
      case "medium":
        return "warning";
      case "low":
        return "notice";
      default:
        return "notice";
    }
  }

  /**
   * Formats finding details for raw_details field
   */
  private formatFindingDetails(finding: SecurityFinding): string {
    const details = [`Rule: ${finding.rule}`, `Severity: ${finding.severity}`];
    
    if (finding.category) {
      details.push(`Category: ${finding.category}`);
    }
    
    if (finding.description) {
      details.push(`Description: ${finding.description}`);
    }
    
    if (finding.remediation) {
      details.push(`Remediation: ${finding.remediation}`);
    }

    return details.join("\\n");
  }

  /**
   * Generates check run summary from findings
   */
  private generateSummary(findings: SecurityFinding[]): { title: string; summary: string } {
    const counts = {
      critical: findings.filter(f => f.severity === "critical").length,
      high: findings.filter(f => f.severity === "high").length,
      medium: findings.filter(f => f.severity === "medium").length,
      low: findings.filter(f => f.severity === "low").length
    };

    const total = findings.length;
    const hasFailures = counts.critical > 0 || counts.high > 0;

    const title = hasFailures 
      ? `${total} security findings require attention`
      : total > 0 
        ? `${total} security findings (non-blocking)`
        : "No security issues found";

    const summary = total > 0
      ? `Found ${total} security findings:\\n\\n` +
        `• Critical: ${counts.critical}\\n` +
        `• High: ${counts.high}\\n` +
        `• Medium: ${counts.medium}\\n` +
        `• Low: ${counts.low}\\n\\n` +
        "Click 'Details' for remediation guidance and evidence links."
      : "All security checks passed. No issues detected.";

    return { title, summary };
  }

  /**
   * Runs security checks and posts results to GitHub
   */
  async runSecurityCheck(
    headSha: string, 
    findings: SecurityFinding[],
    runId?: string
  ): Promise<number> {
    const detailsUrl = this.config.details_base_url 
      ? `${this.config.details_base_url}/${this.config.owner}/${this.config.repo}/${runId || headSha}`
      : undefined;

    // Create initial check run
    const checkRunId = await this.createCheckRun({
      owner: this.config.owner,
      repo: this.config.repo,
      name: "DriftGuard Security Check",
      head_sha: headSha,
      status: "in_progress",
      started_at: new Date().toISOString(),
      details_url: detailsUrl
    });

    try {
      // Convert findings to annotations
      const annotations = this.findingsToAnnotations(findings);
      const { valid, invalid } = sanitizeAnnotations(annotations);

      if (invalid.length > 0) {
        console.warn(`Skipping ${invalid.length} invalid annotations:`, invalid);
      }

      // Generate summary
      const { title, summary } = this.generateSummary(findings);
      
      // Determine conclusion
      const hasBlockingFindings = findings.some(f => f.severity === "critical" || f.severity === "high");
      const conclusion = hasBlockingFindings ? "failure" : findings.length > 0 ? "neutral" : "success";

      // Create batched updates for annotations
      const output = { title, summary, annotations: valid };
      const batches = createBatchedUpdates(checkRunId, output);

      // Send first batch with conclusion
      await this.updateCheckRun(checkRunId, {
        status: "completed",
        conclusion,
        completed_at: new Date().toISOString(),
        output: batches[0].output
      });

      // Send additional batches if needed
      for (let i = 1; i < batches.length; i++) {
        await this.updateCheckRun(checkRunId, {
          output: batches[i].output
        });
      }

      return checkRunId;

    } catch (error) {
      // Update check run with error
      await this.updateCheckRun(checkRunId, {
        status: "completed",
        conclusion: "failure",
        completed_at: new Date().toISOString(),
        output: {
          title: "DriftGuard Check Failed",
          summary: `Check execution failed: ${error instanceof Error ? error.message : "Unknown error"}`
        }
      });

      throw error;
    }
  }
}

/**
 * Example usage for webhook handlers
 */
export async function handlePullRequestEvent(
  event: any,
  config: DriftGuardCheckConfig
): Promise<void> {
  if (!["opened", "synchronize", "reopened"].includes(event.action)) {
    return;
  }

  const checks = new DriftGuardChecks(config);
  const headSha = event.pull_request.head.sha;
  const runId = `pr-${event.pull_request.number}-${Date.now()}`;

  // Run security analysis (placeholder - integrate with your scanning tools)
  const findings: SecurityFinding[] = await runSecurityAnalysis(
    config.owner,
    config.repo,
    headSha
  );

  await checks.runSecurityCheck(headSha, findings, runId);
}

/**
 * Placeholder for security analysis integration
 * Integrate with Semgrep, Gitleaks, or other security tools
 */
async function runSecurityAnalysis(
  owner: string,
  repo: string,
  sha: string
): Promise<SecurityFinding[]> {
  // TODO: Integrate with actual security scanning tools
  // This is a placeholder implementation
  return [
    {
      rule: "hardcoded-secret",
      severity: "high",
      file: "src/config.ts",
      line: 42,
      message: "Hardcoded API key detected",
      description: "API keys should not be hardcoded in source code",
      remediation: "Move API key to environment variable or secure key store",
      category: "secrets"
    }
  ];
}
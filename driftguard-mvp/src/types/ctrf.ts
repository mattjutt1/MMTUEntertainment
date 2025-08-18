/**
 * CTRF (Common Test Report Format) TypeScript definitions
 * Based on CTRF specification: https://ctrf.io/docs/intro
 */

export interface CTRFReport {
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  results: {
    tool: {
      name: string;
      version: string;
    };
    summary: {
      tests: number;
      passed: number;
      failed: number;
      pending: number;
      skipped: number;
      other?: number;
      start?: number;
      stop?: number;
    };
    tests: CTRFTest[];
    environment?: {
      appName?: string;
      buildName?: string;
      buildNumber?: string;
      buildUrl?: string;
      repositoryName?: string;
      repositoryUrl?: string;
      branchName?: string;
      testEnvironment?: string;
    };
    extra?: Record<string, unknown>;
  };
}

export interface CTRFTest {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending' | 'other';
  duration: number;
  start?: number;
  stop?: number;
  suite?: string;
  message?: string;
  trace?: string;
  rawStatus?: string;
  type?: string;
  tags?: string[];
  retry?: number;
  flaky?: boolean;
  browser?: string;
  device?: string;
  screenshot?: string;
  video?: string;
  extra?: Record<string, unknown>;
}

export interface CTRFValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validates a CTRF report against the specification
 */
export function validateCTRFReport(data: unknown): { valid: boolean; errors: CTRFValidationError[] } {
  const errors: CTRFValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push({ field: 'root', message: 'Report must be an object' });
    return { valid: false, errors };
  }

  const report = data as Record<string, unknown>;

  // Validate required top-level fields
  if (typeof report.name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string', value: report.name });
  }

  if (typeof report.duration !== 'number' || report.duration < 0) {
    errors.push({ field: 'duration', message: 'Duration must be a non-negative number', value: report.duration });
  }

  if (!['passed', 'failed', 'skipped'].includes(report.status as string)) {
    errors.push({ field: 'status', message: 'Status must be one of: passed, failed, skipped', value: report.status });
  }

  // Validate results object
  if (!report.results || typeof report.results !== 'object') {
    errors.push({ field: 'results', message: 'Results must be an object', value: report.results });
    return { valid: errors.length === 0, errors };
  }

  const results = report.results as Record<string, unknown>;

  // Validate tool object
  if (!results.tool || typeof results.tool !== 'object') {
    errors.push({ field: 'results.tool', message: 'Tool must be an object', value: results.tool });
  } else {
    const tool = results.tool as Record<string, unknown>;
    if (typeof tool.name !== 'string') {
      errors.push({ field: 'results.tool.name', message: 'Tool name must be a string', value: tool.name });
    }
    if (typeof tool.version !== 'string') {
      errors.push({ field: 'results.tool.version', message: 'Tool version must be a string', value: tool.version });
    }
  }

  // Validate summary object
  if (!results.summary || typeof results.summary !== 'object') {
    errors.push({ field: 'results.summary', message: 'Summary must be an object', value: results.summary });
  } else {
    const summary = results.summary as Record<string, unknown>;
    const requiredSummaryFields = ['tests', 'passed', 'failed', 'pending', 'skipped'];
    
    for (const field of requiredSummaryFields) {
      if (typeof summary[field] !== 'number' || summary[field] < 0) {
        errors.push({ 
          field: `results.summary.${field}`, 
          message: `${field} must be a non-negative number`, 
          value: summary[field] 
        });
      }
    }
  }

  // Validate tests array
  if (!Array.isArray(results.tests)) {
    errors.push({ field: 'results.tests', message: 'Tests must be an array', value: results.tests });
  } else {
    results.tests.forEach((test, index) => {
      if (!test || typeof test !== 'object') {
        errors.push({ field: `results.tests[${index}]`, message: 'Test must be an object', value: test });
        return;
      }

      const testObj = test as Record<string, unknown>;
      
      if (typeof testObj.name !== 'string') {
        errors.push({ field: `results.tests[${index}].name`, message: 'Test name must be a string', value: testObj.name });
      }

      if (!['passed', 'failed', 'skipped', 'pending', 'other'].includes(testObj.status as string)) {
        errors.push({ 
          field: `results.tests[${index}].status`, 
          message: 'Test status must be one of: passed, failed, skipped, pending, other', 
          value: testObj.status 
        });
      }

      if (typeof testObj.duration !== 'number' || testObj.duration < 0) {
        errors.push({ 
          field: `results.tests[${index}].duration`, 
          message: 'Test duration must be a non-negative number', 
          value: testObj.duration 
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Converts CTRF report to GitHub Check Run format
 */
export function ctrfToCheckRun(report: CTRFReport, repositoryInfo: { owner: string; repo: string; sha: string }) {
  const { summary } = report.results;
  const conclusion: 'success' | 'failure' | 'neutral' = report.status === 'passed' ? 'success' : 
                    report.status === 'failed' ? 'failure' : 'neutral';

  const title = `${report.results.tool.name} - ${summary.passed}/${summary.tests} tests passed`;
  
  const failedTests = report.results.tests.filter(test => test.status === 'failed');
  const annotations = failedTests.slice(0, 50).map(test => ({
    path: test.suite || 'unknown',
    start_line: 1,
    end_line: 1,
    annotation_level: 'failure' as const,
    message: test.message || `Test "${test.name}" failed`,
    title: test.name,
  }));

  const summaryText = `
## Test Results Summary

- **Total Tests**: ${summary.tests}
- **Passed**: ${summary.passed} ✅
- **Failed**: ${summary.failed} ❌
- **Skipped**: ${summary.skipped} ⏭️
- **Duration**: ${Math.round(report.duration)}ms

### Tool Information
- **Name**: ${report.results.tool.name}
- **Version**: ${report.results.tool.version}

${failedTests.length > 0 ? `### Failed Tests\n${failedTests.map(test => `- **${test.name}**: ${test.message || 'No message'}`).join('\n')}` : ''}
  `.trim();

  return {
    name: `DriftGuard: ${report.results.tool.name}`,
    head_sha: repositoryInfo.sha,
    status: 'completed' as const,
    conclusion,
    output: {
      title,
      summary: summaryText,
      annotations,
    },
  };
}
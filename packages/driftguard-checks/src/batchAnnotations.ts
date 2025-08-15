/**
 * GitHub Checks API annotation batching utility
 * Handles the 50-annotation limit per request requirement
 */

export interface GitHubAnnotation {
  path: string;
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  annotation_level: "notice" | "warning" | "failure";
  message: string;
  title?: string;
  raw_details?: string;
}

export interface CheckRunOutput {
  title: string;
  summary: string;
  text?: string;
  annotations?: GitHubAnnotation[];
  images?: Array<{
    alt: string;
    image_url: string;
    caption?: string;
  }>;
}

export interface CheckRunParams {
  owner: string;
  repo: string;
  name: string;
  head_sha: string;
  status: "queued" | "in_progress" | "completed";
  started_at?: string;
  conclusion?: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
  completed_at?: string;
  details_url?: string;
  external_id?: string;
  output?: CheckRunOutput;
}

/**
 * Chunks array into smaller arrays of specified size
 * GitHub Checks API limits annotations to 50 per request
 */
export function chunk<T>(arr: T[], size = 50): T[][] {
  if (size <= 0) throw new Error("Chunk size must be positive");
  
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Creates batched check run updates for annotations
 * Returns array of update payloads, each with ≤50 annotations
 */
export function createBatchedUpdates(
  checkRunId: number,
  output: CheckRunOutput,
  maxAnnotations = 50
): Array<{
  check_run_id: number;
  output: CheckRunOutput;
}> {
  if (!output.annotations || output.annotations.length <= maxAnnotations) {
    return [{
      check_run_id: checkRunId,
      output
    }];
  }

  const annotationBatches = chunk(output.annotations, maxAnnotations);
  
  return annotationBatches.map((annotations, index) => ({
    check_run_id: checkRunId,
    output: {
      ...output,
      annotations,
      // Only include title/summary on first batch to avoid duplication
      title: index === 0 ? output.title : `${output.title} (batch ${index + 1}/${annotationBatches.length})`,
      summary: index === 0 ? output.summary : `Continuation of findings (batch ${index + 1}/${annotationBatches.length})`
    }
  }));
}

/**
 * Validates annotation data before sending to GitHub
 */
export function validateAnnotation(annotation: GitHubAnnotation): string[] {
  const errors: string[] = [];

  if (!annotation.path) {
    errors.push("path is required");
  }

  if (annotation.start_line < 1) {
    errors.push("start_line must be >= 1");
  }

  if (annotation.end_line < annotation.start_line) {
    errors.push("end_line must be >= start_line");
  }

  if (!annotation.message) {
    errors.push("message is required");
  }

  if (annotation.message.length > 64000) {
    errors.push("message must be <= 64000 characters");
  }

  if (!["notice", "warning", "failure"].includes(annotation.annotation_level)) {
    errors.push("annotation_level must be notice, warning, or failure");
  }

  return errors;
}

/**
 * Sanitizes annotations and removes invalid ones
 */
export function sanitizeAnnotations(annotations: GitHubAnnotation[]): {
  valid: GitHubAnnotation[];
  invalid: Array<{ annotation: GitHubAnnotation; errors: string[] }>;
} {
  const valid: GitHubAnnotation[] = [];
  const invalid: Array<{ annotation: GitHubAnnotation; errors: string[] }> = [];

  for (const annotation of annotations) {
    const errors = validateAnnotation(annotation);
    if (errors.length === 0) {
      valid.push(annotation);
    } else {
      invalid.push({ annotation, errors });
    }
  }

  return { valid, invalid };
}
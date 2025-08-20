// Minimal heuristics for common prompt/indirect injections
const INJECTION_PATTERNS = [
  /ignore (all )?previous (instructions|directions)/i,
  /(disregard|bypass|override).{0,40}(guardrails|safety|policy|rules)/i,
  /(exfiltrate|leak|send).{0,40}(secret|token|credential|key|password)/i
];

export function validateToolRequest({ toolName, input, sourceText = '' }, cfg) {
  if (!cfg.tools.includes(toolName)) {
    return { allowed: false, reason: `Tool ${toolName} not in allow-list` };
  }
  
  const hay = `${String(input || '')}\n${String(sourceText || '')}`;
  if (INJECTION_PATTERNS.some((re) => re.test(hay))) {
    return { allowed: false, reason: 'Possible prompt injection detected' };
  }
  
  return { allowed: true, reason: 'ok', maxToolCallsPerRun: cfg.maxToolCallsPerRun };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('validateToolRequest ready');
}
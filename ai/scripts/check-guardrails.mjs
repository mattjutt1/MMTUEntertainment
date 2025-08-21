import fs from 'node:fs';

const required = [
  'ai/SECURITY.md',
  'ai/guardrails/allowlist.json',
  'ai/guardrails/validateToolRequest.mjs',
  'ai/tests/prompt-injection.test.mjs'
];

const missing = required.filter(p => !fs.existsSync(p));
if (missing.length) {
  console.error('Missing guardrail files:', missing.join(', '));
  process.exit(1);
}

// Light sanity: ensure allowlist has at least one tool
const cfg = JSON.parse(fs.readFileSync('ai/guardrails/allowlist.json', 'utf8'));
if (!Array.isArray(cfg.tools) || cfg.tools.length === 0) {
  console.error('Guardrails allowlist has no tools');
  process.exit(1);
}

console.log('OK: guardrails present');
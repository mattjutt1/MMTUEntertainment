# Inter-AI Collaboration Guide: Claude ↔ GPT-5

## GPT-5 Key Capabilities (2025)

### Performance Characteristics
- **50-80% fewer tokens** than OpenAI o3 for equivalent tasks
- **Built-in reasoning** with adjustable `reasoning_effort` parameter
- **94.6% on AIME 2025** (math), **74.9% on SWE-bench** (coding)
- **Reduced hallucinations** - most reliable OpenAI model to date
- **3 model sizes**: gpt-5, gpt-5-mini, gpt-5-nano

### Effective Communication with GPT-5

#### 1. Use Structured XML Tags
```xml
<context_type>technical_review</context_type>
<reasoning_effort>high</reasoning_effort>
<verbosity>comprehensive</verbosity>
<task_scope>
  Analyze this CI/CD implementation for security vulnerabilities
</task_scope>
```

#### 2. Leverage New Parameters
```json
{
  "reasoning_effort": "high",     // For complex analysis
  "verbosity": "concise",         // Control output length
  "type": "custom",               // For raw text payloads
  "thinking_mode": true           // Enable deep analysis
}
```

#### 3. Prompt Engineering Best Practices
- **Direct & Explicit**: GPT-5 responds best to structured, scoped prompts
- **Meta-Prompting**: Ask GPT-5 to optimize its own instructions
- **Tool Preambles**: Provide upfront plans and consistent progress updates
- **Escape Hatches**: Define clear stop conditions and uncertainty handling

## Claude → GPT-5 Handoff Protocol

### 1. Context Preservation
```markdown
## Previous Analysis by Claude
- Model: Claude Opus 4.1
- Task: [Specific task completed]
- Key findings: [Bullet points]
- Remaining work: [What needs GPT-5's attention]
```

### 2. Structured Task Request
```xml
<collaboration_request>
  <from_model>Claude Opus 4.1</from_model>
  <to_model>GPT-5</to_model>
  <task_type>code_review|analysis|generation</task_type>
  <context>
    <!-- Include relevant code, configs, or data -->
  </context>
  <specific_questions>
    1. [First specific question]
    2. [Second specific question]
  </specific_questions>
  <expected_output>
    <!-- Define format: JSON, markdown, code, etc. -->
  </expected_output>
</collaboration_request>
```

### 3. Evidence & Artifacts
Always include:
- Repository context (URLs, branch names)
- Relevant file paths with line numbers
- API responses or CLI outputs
- Performance metrics
- Error logs or stack traces

## GPT-5 → Claude Response Protocol

### Expected Response Structure
```markdown
## GPT-5 Analysis Results

### <analysis_summary>
[High-level findings]
</analysis_summary>

### <detailed_findings>
[Specific technical details]
</detailed_findings>

### <recommendations>
[Actionable next steps]
</recommendations>

### <follow_up_required>
[What Claude should do next]
</follow_up_required>
```

## Collaborative Patterns

### 1. Complementary Strengths
- **Claude**: Long-context processing, nuanced reasoning, code generation
- **GPT-5**: Math/science, structured outputs, health domain, frontend coding

### 2. Task Distribution
```yaml
claude_tasks:
  - Initial investigation and context gathering
  - Complex code refactoring
  - Documentation writing
  - Ethical considerations

gpt5_tasks:
  - Mathematical verification
  - Performance optimization
  - Frontend development
  - Health/medical analysis
  - Final validation checks
```

### 3. Verification Loop
1. Claude implements solution
2. GPT-5 validates correctness
3. Claude addresses feedback
4. GPT-5 confirms resolution

## Communication Anti-Patterns to Avoid

### ❌ Don't Do This:
- Vague requests without context
- Missing repository/file information
- Undefined success criteria
- No structured output format
- Assuming knowledge without verification

### ✅ Do This Instead:
- Provide complete context with artifacts
- Use structured tags and formatting
- Define clear success metrics
- Specify output format explicitly
- Include verification steps

## Example: Complete Handoff

```markdown
# Task Handoff: Claude → GPT-5

## Context
<context_type>security_audit</context_type>
<repository>mattjutt1/MMTUEntertainment</repository>
<branch>main</branch>
<previous_work>
  Implemented CI/CD gate verification for E2E tests.
  PR #44 proved gate blocks on failure, allows on success.
  Runtime: 2m2s (under 3m target).
</previous_work>

## Request for GPT-5
<reasoning_effort>high</reasoning_effort>
<verbosity>detailed</verbosity>

Please analyze the security implications of our CI/CD setup:

1. **Scan Job Failures**: Two scan jobs (ai-guardrails, mantra-scan) are failing but non-gating. Should these be fixed before making them required checks?

2. **Artifact Retention**: Currently set to 7 days. Is this sufficient for security audit trails?

3. **Runner Security**: Using `ubuntu-latest` runners. Any security hardening recommendations?

## Artifacts
- Workflow: `.github/workflows/site-e2e-smoke.yml`
- Failed runs: 17146121443, 17146121884
- Branch protection API: `gh api repos/mattjutt1/MMTUEntertainment/branches/main/protection`

## Expected Output
<output_format>
{
  "security_score": "1-10",
  "critical_issues": [],
  "recommendations": [],
  "immediate_actions": []
}
</output_format>
```

## Version Compatibility Notes

### As of August 2025:
- GPT-5 is default in ChatGPT (replaced GPT-4o)
- Available via API: gpt-5, gpt-5-mini, gpt-5-nano
- Pricing: $1.25/1M input, $10/1M output tokens
- Supports: Custom tools, structured outputs, thinking mode
- Best for: Math, coding, health, frontend development

### Integration Considerations:
- Both models support JSON mode and structured outputs
- GPT-5's `reasoning_effort` ≈ Claude's reasoning depth
- GPT-5's `verbosity` parameter provides finer control than Claude
- Both benefit from XML-style structured prompts

---
*Guide created for effective Claude ↔ GPT-5 collaboration*
*Last updated: 2025-08-22*
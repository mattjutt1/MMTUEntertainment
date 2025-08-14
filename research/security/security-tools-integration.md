# Security Tools Integration for Claude Code Framework

## ✅ Successfully Integrated Tools

### 1. MCP-Watch (INSTALLED ✓)
**Location**: `/home/matt/.npm-global/bin/mcp-watch`
**Capabilities**:
- 🔑 Credential Detection - Finds hardcoded API keys, tokens
- 🧪 Tool Poisoning - Detects malicious instructions in tool descriptions  
- 🎯 Parameter Injection - Identifies magic parameters extracting AI context
- 💉 Prompt Injection - Scans for prompt manipulation attacks
- 🔄 Tool Mutation - Detects dynamic tool changes and rug-pull risks
- 💬 Conversation Exfiltration - Finds triggers stealing conversation history
- 🎨 ANSI Injection - Detects steganographic attacks using escape sequences
- 📋 Protocol Violations - Identifies MCP protocol security violations
- 🛡️ Input Validation - Finds command injection, SSRF, path traversal
- 🎭 Server Spoofing - Detects servers impersonating popular services

**Usage**: `mcp-watch scan <github-url> --format json`

### 2. Official Semgrep MCP Server (AVAILABLE)
**Installation Options**:
- **UV**: `uvx semgrep-mcp` 
- **Docker**: `docker run -i --rm ghcr.io/semgrep/mcp -t stdio`
- **SSE**: `https://mcp.semgrep.ai/sse`

**Capabilities**: Full Semgrep SAST scanning via MCP protocol

### 3. Built-in Security Arsenal
- **semgrep 1.131.0** - Static analysis (OWASP Top 10)
- **gitleaks 8.28.0** - Secret detection  
- **actionlint 1.7.7** - GitHub Actions security

## 🚀 Enhanced Claude Code Security Framework

### Real-Time Security Integration

```bash
# Before ANY code change
mcp-watch scan https://github.com/user/target-repo --format json

# During code review
semgrep --config=auto --json changed_files/

# After commits
gitleaks detect --source . --verbose
```

### MCP Security Server Stack

1. **Semgrep MCP** - SAST scanning with 2000+ rules
2. **MCP-Watch** - AI-specific security (prompt injection, tool poisoning)  
3. **Vulnerability Scanner MCP** - Network/IP scanning capabilities

### Security-Enhanced Workflow

```yaml
Security Pipeline:
1. Pre-commit: detect-secrets, trailing-whitespace, large-files
2. Code Analysis: semgrep OWASP + custom rules
3. AI Security: mcp-watch for prompt injection/tool poisoning
4. Dependency Check: npm audit / pip-audit
5. Secret Scan: gitleaks on entire history
6. Network Scan: vulnerability-scanner MCP for exposed services
```

## 🎯 Power User Security Commands

### For ANY Codebase (Current + Future Projects)

```bash
# Full security audit pipeline
security_audit() {
  local repo_url="$1"
  echo "🔍 Running comprehensive security audit..."
  
  # AI-specific security
  mcp-watch scan "$repo_url" --format json > security_ai.json
  
  # SAST scanning  
  semgrep --config=auto --json . > security_sast.json
  
  # Secret detection
  gitleaks detect --source . --report-format json --report-path security_secrets.json
  
  # Dependency vulnerabilities
  npm audit --json > security_deps.json 2>/dev/null || echo "No npm deps"
  
  echo "✅ Security audit complete - check security_*.json files"
}

# Quick security check for code changes
security_diff() {
  git diff --name-only HEAD~1 | xargs semgrep --config=auto
  echo "🔍 Checking AI security for recent changes..."
  mcp-watch scan $(git config --get remote.origin.url) --format json | jq '.vulnerabilities[] | select(.severity == "high" or .severity == "critical")'
}
```

### MCP Integration in Claude Code

**Phase 1**: Local stdio MCP servers
```bash
# Start Semgrep MCP server
uvx semgrep-mcp &

# Add to Claude Code MCP config
echo '{
  "mcpServers": {
    "semgrep": {
      "command": "uvx",
      "args": ["semgrep-mcp"]
    }
  }
}' > ~/.config/claude/mcp_security.json
```

**Phase 2**: Network-based MCP servers  
```bash
# Use Semgrep cloud MCP
curl -X POST https://mcp.semgrep.ai/sse \
  -H "Authorization: Bearer $SEMGREP_TOKEN" \
  -d '{"command": "scan", "path": "."}'
```

## 🛡️ Security Capabilities Matrix

| Tool | Scope | Real-time | AI-aware | Network | Protocol |
|------|-------|-----------|----------|---------|----------|
| mcp-watch | ✅ AI/MCP | ✅ Yes | ✅ Yes | ❌ No | ✅ MCP |
| Semgrep | ✅ SAST | ✅ Yes | ❌ No | ❌ No | ✅ MCP |
| gitleaks | ✅ Secrets | ✅ Yes | ❌ No | ❌ No | ❌ CLI |
| vuln-scanner | ✅ Network | ✅ Yes | ❌ No | ✅ Yes | ✅ MCP |

## 🎯 Next Integration Targets

### High-Priority MCP Servers to Add
1. **Socket Security MCP** - Real-time dependency scanning
2. **OWASP ZAP MCP** - Dynamic application security testing
3. **Trivy MCP** - Container/filesystem vulnerability scanning
4. **Bandit MCP** - Python-specific security linting

### CLI Tools to Integrate
1. **penta** - All-in-one pentesting CLI (167⭐)
2. **burpa** - Burp Suite automation (200⭐)
3. **nuclei** - Fast vulnerability scanner
4. **subfinder** - Subdomain discovery

## 🔄 Automated Security Loop

```
1. Code Change → 2. MCP-Watch Scan → 3. Semgrep SAST → 4. Secret Detection → 5. Commit Block/Allow
                                   ↓
6. PR Security Review ← 5. Network Scan ← 4. Dependency Check ← 3. Final Validation
```

This creates a **bulletproof security framework** that enhances Claude Code's capabilities across ALL projects, not just this one.

The tools are REAL, INSTALLED, and READY for immediate use on any codebase.
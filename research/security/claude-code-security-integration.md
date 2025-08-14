# Official Claude Code Security Integration

## ✅ **Both Methods Are Official Claude Code Approaches**

### Method 1: CLI Commands (Interactive Setup)
```bash
# Add local MCP server
claude mcp add semgrep-security -- semgrep-mcp

# Add remote SSE server  
claude mcp add --transport sse semgrep-cloud https://mcp.semgrep.ai/sse

# List all servers
claude mcp list

# Remove a server
claude mcp remove semgrep-security
```

### Method 2: Configuration Files (Team/Version Control)
**`.mcp.json`** (Project-level, shareable):
```json
{
  "mcpServers": {
    "semgrep-security": {
      "command": "semgrep-mcp",
      "args": []
    }
  }
}
```

**`.claude/settings.json`** (Project settings):
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["semgrep-security"],
  "toolPermissions": {
    "mcp:semgrep-security:*": "allow"
  }
}
```

## 🎯 **Security Tool Classification**

### MCP Servers (Integrated into Claude Code)
- ✅ **semgrep-mcp** - SAST scanning via MCP protocol
- ✅ **semgrep-cloud** - Cloud-based Semgrep via SSE
- 🔄 Future: vulnerability-scanner MCP, socket-security MCP

### CLI Security Tools (Called via Bash)
- ✅ **mcp-watch** - AI-specific security scanner
- ✅ **gitleaks** - Secret detection
- ✅ **semgrep** - Direct CLI SAST
- ✅ **actionlint** - GitHub Actions security

## 🚀 **Usage Patterns in Claude Code**

### 1. MCP Server Usage (Native Integration)
```
User: "Run a security scan on this file"
Claude: [Uses semgrep-security MCP server directly]
```

### 2. CLI Tool Usage (Bash Integration)
```
User: "Check for AI security vulnerabilities"
Claude: [Uses Bash tool to run mcp-watch scan]
```

### 3. Combined Security Pipeline
```bash
# Full security audit using both methods
security_audit() {
  # MCP-based SAST
  # [Claude calls semgrep-mcp via MCP]
  
  # CLI-based AI security
  mcp-watch scan . --format json
  
  # CLI-based secret detection
  gitleaks detect --source . --verbose
}
```

## 🔧 **Configuration Best Practices**

### Project Configuration (Team Shared)
- Use `.mcp.json` for team-wide security servers
- Add to version control for consistency
- Use `.claude/settings.json` for project-specific permissions

### User Configuration (Personal)
- Use `claude mcp add` for personal tools
- Store in `~/.claude.json` for cross-project use
- Use `claude config set` for user preferences

### Security Permissions
```json
{
  "toolPermissions": {
    "default": "ask",
    "mcp:semgrep-security:*": "allow",  // Pre-approve security scanning
    "mcp:*:scan": "allow",              // Allow all security scans
    "mcp:*:write": "ask"                // Always ask for write operations
  }
}
```

## 🛡️ **Security Workflow Integration**

### Pre-commit Integration
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: claude-security-scan
        name: Claude Code Security Scan
        entry: claude
        args: ["--prompt", "Run security scan on changed files", "--no-interactive"]
        language: system
        files: "\\.(ts|js|py|go)$"
```

### CI/CD Integration
```yaml
# .github/workflows/claude-security.yml
- name: Claude Code Security Review
  run: |
    claude mcp list
    claude --prompt "Run comprehensive security audit" --output security-report.md
```

## 🎯 **Official Claude Code Security Commands**

### Available Security MCP Servers
```bash
# List available security servers
claude mcp list | grep -i security

# Add Semgrep (official)
claude mcp add semgrep -- semgrep-mcp

# Add from registry (when available)
claude mcp add socket-security -- npx socket-security-mcp
```

### Security Scanning Workflows
```bash
# Quick security check
claude --prompt "Scan current directory for security issues"

# Detailed audit with MCP servers
claude --prompt "Use all security MCP servers to audit this codebase"

# AI-specific security (via CLI tools)
claude --prompt "Run mcp-watch scan for AI security vulnerabilities"
```

This integration follows **official Claude Code patterns** and provides both **native MCP integration** and **CLI tool access** for comprehensive security coverage.
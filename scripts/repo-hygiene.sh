#!/bin/bash
# Repo Hygiene Script - Pabrai Governance Operationalization
# Phase 3: Systematic repo health with governance integration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[HYGIENE]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Pabrai Governance Validation
validate_governance() {
    log "Validating Pabrai governance artifacts..."
    
    local missing_files=()
    
    # Required governance files
    local required_files=(
        ".github/pull_request_template.md"
        "docs/pivot-rules.md"
        ".github/workflows/weekly-market-digest.yml"
        "docs/Prompt-ClaudeCode.md"
        "docs/Prompt-ChatGPT-Task.md"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$REPO_ROOT/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        error "Missing governance files:"
        printf '%s\n' "${missing_files[@]}" | sed 's/^/  - /'
        return 1
    fi
    
    success "All governance artifacts present"
    return 0
}

# CI/CD Health Check
check_ci_health() {
    log "Checking CI/CD pipeline health..."
    
    local workflow_dir="$REPO_ROOT/.github/workflows"
    local issues=()
    
    # Check for critical workflows
    local critical_workflows=(
        "billing-smoke.yml"
        "weekly-market-digest.yml"
        "actionlint.yml"
        "gitleaks.yml"
    )
    
    for workflow in "${critical_workflows[@]}"; do
        if [[ ! -f "$workflow_dir/$workflow" ]]; then
            issues+=("Missing critical workflow: $workflow")
        fi
    done
    
    # Check for proper concurrency configuration
    while IFS= read -r -d '' workflow_file; do
        if ! grep -q "concurrency:" "$workflow_file"; then
            issues+=("Missing concurrency config: $(basename "$workflow_file")")
        fi
    done < <(find "$workflow_dir" -name "*.yml" -print0)
    
    if [[ ${#issues[@]} -gt 0 ]]; then
        warn "CI/CD health issues found:"
        printf '%s\n' "${issues[@]}" | sed 's/^/  - /'
        return 1
    fi
    
    success "CI/CD pipeline healthy"
    return 0
}

# Security Hygiene
check_security() {
    log "Running security hygiene checks..."
    
    # Check for sensitive files that shouldn't be tracked
    local sensitive_patterns=(
        "*.key"
        "*.pem" 
        "*.p12"
        ".env"
        "secrets.yml"
        "*.secret"
    )
    
    local found_sensitive=()
    for pattern in "${sensitive_patterns[@]}"; do
        while IFS= read -r -d '' file; do
            found_sensitive+=("$(realpath --relative-to="$REPO_ROOT" "$file")")
        done < <(find "$REPO_ROOT" -name "$pattern" -type f -print0 2>/dev/null || true)
    done
    
    if [[ ${#found_sensitive[@]} -gt 0 ]]; then
        error "Potentially sensitive files found:"
        printf '%s\n' "${found_sensitive[@]}" | sed 's/^/  - /'
        return 1
    fi
    
    # Check .gitignore completeness
    if [[ ! -f "$REPO_ROOT/.gitignore" ]]; then
        warn "Missing .gitignore file"
        return 1
    fi
    
    success "Security hygiene passed"
    return 0
}

# Dependencies Health
check_dependencies() {
    log "Checking dependency health..."
    
    local issues=()
    
    # Check for package.json files and verify npm audit
    while IFS= read -r -d '' package_json; do
        local dir=$(dirname "$package_json")
        local rel_path=$(realpath --relative-to="$REPO_ROOT" "$dir")
        
        log "Checking dependencies in $rel_path..."
        
        if [[ -f "$dir/package-lock.json" ]] || [[ -f "$dir/pnpm-lock.yaml" ]]; then
            # Check for high/critical vulnerabilities only to avoid noise
            if command -v npm >/dev/null 2>&1; then
                if ! npm audit --audit-level=high --prefix="$dir" >/dev/null 2>&1; then
                    issues+=("High/critical vulnerabilities in $rel_path")
                fi
            fi
        else
            issues+=("Missing lockfile in $rel_path")
        fi
    done < <(find "$REPO_ROOT" -name "package.json" -not -path "*/node_modules/*" -print0)
    
    if [[ ${#issues[@]} -gt 0 ]]; then
        warn "Dependency issues found:"
        printf '%s\n' "${issues[@]}" | sed 's/^/  - /'
        return 1
    fi
    
    success "Dependencies healthy"
    return 0
}

# Cleanup Operations
cleanup_artifacts() {
    log "Cleaning up build artifacts and temporary files..."
    
    local cleanup_patterns=(
        "node_modules"
        "dist"
        "build"
        ".next"
        "coverage"
        "test-results"
        "*.log"
        ".DS_Store"
        "Thumbs.db"
    )
    
    local cleaned=()
    for pattern in "${cleanup_patterns[@]}"; do
        while IFS= read -r -d '' item; do
            if [[ -e "$item" ]]; then
                rm -rf "$item"
                cleaned+=("$(realpath --relative-to="$REPO_ROOT" "$item")")
            fi
        done < <(find "$REPO_ROOT" -name "$pattern" -not -path "*/.git/*" -print0 2>/dev/null || true)
    done
    
    if [[ ${#cleaned[@]} -gt 0 ]]; then
        success "Cleaned up ${#cleaned[@]} items"
    else
        log "No cleanup needed"
    fi
}

# Governance Metrics Report
generate_metrics() {
    log "Generating governance metrics report..."
    
    local report_file="$REPO_ROOT/governance-metrics.md"
    
    {
        echo "# Governance Metrics Report"
        echo "Generated: $(date -Iseconds)"
        echo ""
        echo "## Pabrai Governance Health"
        
        if validate_governance >/dev/null 2>&1; then
            echo "- ✅ Governance artifacts: COMPLETE"
        else
            echo "- ❌ Governance artifacts: INCOMPLETE"
        fi
        
        if check_ci_health >/dev/null 2>&1; then
            echo "- ✅ CI/CD pipeline: HEALTHY"
        else
            echo "- ⚠️ CI/CD pipeline: ISSUES DETECTED"
        fi
        
        if check_security >/dev/null 2>&1; then
            echo "- ✅ Security hygiene: PASSED"
        else
            echo "- ⚠️ Security hygiene: REVIEW NEEDED"
        fi
        
        if check_dependencies >/dev/null 2>&1; then
            echo "- ✅ Dependencies: HEALTHY"
        else
            echo "- ⚠️ Dependencies: VULNERABILITIES DETECTED"
        fi
        
        echo ""
        echo "## Repository Statistics"
        echo "- Total files: $(find "$REPO_ROOT" -type f -not -path "*/.git/*" | wc -l)"
        echo "- Workflow files: $(find "$REPO_ROOT/.github/workflows" -name "*.yml" 2>/dev/null | wc -l)"
        echo "- Documentation files: $(find "$REPO_ROOT" -name "*.md" -not -path "*/.git/*" | wc -l)"
        echo "- Configuration files: $(find "$REPO_ROOT" -name "*.json" -o -name "*.yml" -o -name "*.yaml" -not -path "*/.git/*" -not -path "*/node_modules/*" | wc -l)"
        
        echo ""
        echo "## Next Actions"
        echo "- [ ] Review any failed health checks above"
        echo "- [ ] Execute manual Phase 2 steps if not completed"
        echo "- [ ] Validate Business Action Tracks project board"
        echo "- [ ] Test weekly digest workflow execution"
        
    } > "$report_file"
    
    success "Metrics report generated: governance-metrics.md"
}

# Main execution
main() {
    log "Starting Pabrai governance repo hygiene check..."
    echo "Repository: $REPO_ROOT"
    echo ""
    
    local exit_code=0
    
    # Run all checks
    validate_governance || exit_code=1
    check_ci_health || exit_code=1
    check_security || exit_code=1
    check_dependencies || exit_code=1
    
    # Always run cleanup and metrics
    cleanup_artifacts
    generate_metrics
    
    echo ""
    if [[ $exit_code -eq 0 ]]; then
        success "Repository hygiene check PASSED"
        log "Pabrai governance operationalization complete"
    else
        warn "Repository hygiene check completed with ISSUES"
        log "Review warnings above and governance-metrics.md report"
    fi
    
    return $exit_code
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
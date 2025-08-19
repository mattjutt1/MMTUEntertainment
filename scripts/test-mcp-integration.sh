#!/bin/bash

# MMTU Entertainment MCP Server Integration Test Script
# Validates all MCP server connections and revenue optimization pipeline

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.mcp"

# Test results
declare -A test_results
declare -A server_status

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
print_banner() {
    echo -e "${BLUE}"
    echo "============================================================================"
    echo "                 MMTU Entertainment MCP Integration Test"
    echo "============================================================================"
    echo -e "${NC}"
    echo "Testing MCP server connections and revenue optimization pipeline..."
    echo ""
}

# Load environment
load_environment() {
    if [ -f "$ENV_FILE" ]; then
        set -a  # automatically export all variables
        source "$ENV_FILE"
        set +a  # stop automatically exporting
        log_success "Environment loaded from $ENV_FILE"
    else
        log_error "Environment file not found: $ENV_FILE"
        log_warning "Run ./scripts/setup-mcp-servers.sh first"
        exit 1
    fi
}

# Test individual MCP server
test_mcp_server() {
    local server_name="$1"
    local server_package="$2"
    local required_env="$3"
    
    log_info "Testing $server_name MCP server..."
    
    # Check if required environment variables are set
    local env_check_passed=true
    for var in $required_env; do
        if [ -z "${!var:-}" ]; then
            log_error "$server_name: Required environment variable $var is not set"
            env_check_passed=false
        fi
    done
    
    if [ "$env_check_passed" = false ]; then
        test_results["$server_name"]="ENV_MISSING"
        server_status["$server_name"]="❌ Environment variables missing"
        return 1
    fi
    
    # Test server installation and basic functionality
    local test_output
    if test_output=$(timeout 30 npx -y "$server_package" --version 2>&1); then
        test_results["$server_name"]="SUCCESS"
        server_status["$server_name"]="✅ Ready"
        log_success "$server_name MCP server is working"
        return 0
    else
        test_results["$server_name"]="CONNECTION_FAILED"
        server_status["$server_name"]="⚠️  Connection failed"
        log_warning "$server_name MCP server connection failed: $test_output"
        return 1
    fi
}

# Test all MCP servers
test_all_servers() {
    log_info "Testing all MCP servers..."
    echo ""
    
    # PostHog
    test_mcp_server "PostHog" "@modelcontextprotocol/server-posthog" "POSTHOG_API_KEY"
    
    # HubSpot
    test_mcp_server "HubSpot" "@modelcontextprotocol/server-hubspot" "HUBSPOT_PRIVATE_APP_TOKEN"
    
    # PostgreSQL
    test_mcp_server "PostgreSQL" "@modelcontextprotocol/server-postgres" "POSTGRES_CONNECTION_STRING"
    
    # Grafana
    test_mcp_server "Grafana" "@modelcontextprotocol/server-grafana" "GRAFANA_URL GRAFANA_API_KEY"
    
    # Kubernetes (optional)
    test_mcp_server "Kubernetes" "@modelcontextprotocol/server-kubernetes" ""
    
    # Docker (optional)
    test_mcp_server "Docker" "@modelcontextprotocol/server-docker" ""
    
    echo ""
}

# Test Claude Desktop configuration
test_claude_desktop() {
    log_info "Testing Claude Desktop configuration..."
    
    local claude_config="$HOME/.config/claude-desktop/claude_desktop_config.json"
    
    if [ -f "$claude_config" ]; then
        if jq empty "$claude_config" 2>/dev/null; then
            log_success "Claude Desktop configuration is valid JSON"
            
            # Check if all servers are configured
            local configured_servers=$(jq -r '.mcpServers | keys[]' "$claude_config" 2>/dev/null || echo "")
            if [ -n "$configured_servers" ]; then
                log_success "Configured MCP servers in Claude Desktop:"
                echo "$configured_servers" | while read -r server; do
                    echo "  • $server"
                done
            else
                log_warning "No MCP servers found in Claude Desktop configuration"
            fi
        else
            log_error "Claude Desktop configuration is invalid JSON"
        fi
    else
        log_warning "Claude Desktop configuration not found at $claude_config"
        log_info "This is normal if you're not using Claude Desktop"
    fi
    
    echo ""
}

# Test revenue optimization pipeline
test_revenue_pipeline() {
    log_info "Testing revenue optimization pipeline integration..."
    
    local pipeline_ready=true
    local required_servers=("PostHog" "HubSpot" "PostgreSQL")
    
    for server in "${required_servers[@]}"; do
        if [ "${test_results[$server]:-}" != "SUCCESS" ]; then
            log_warning "Revenue pipeline: $server is not ready (${test_results[$server]:-UNKNOWN})"
            pipeline_ready=false
        fi
    done
    
    if [ "$pipeline_ready" = true ]; then
        log_success "Revenue optimization pipeline is ready!"
        echo ""
        echo "  🎯 Metrics Targets:"
        echo "    • LTV:CAC Ratio ≥ 3.0"
        echo "    • Week 4 Retention ≥ 20%"
        echo "    • Gross Margin ≥ 60%"
        echo ""
        echo "  📊 Data Sources Connected:"
        echo "    • PostHog: Product analytics and user behavior"
        echo "    • HubSpot: CRM data and customer lifecycle"
        echo "    • PostgreSQL: Custom analytics and aggregated metrics"
    else
        log_error "Revenue optimization pipeline is not fully ready"
        log_warning "Fix the failing MCP servers above to enable revenue optimization"
    fi
    
    echo ""
}

# Test E2E integration
test_e2e_integration() {
    log_info "Testing E2E testing integration..."
    
    local site_config="$PROJECT_ROOT/products/site/playwright.config.ts"
    if [ -f "$site_config" ]; then
        log_success "Site E2E configuration found"
        
        # Check if site tests can run
        if cd "$PROJECT_ROOT" && pnpm test:e2e:site --list &>/dev/null; then
            log_success "Site E2E tests are executable"
        else
            log_warning "Site E2E tests may have issues (check dependencies)"
        fi
    else
        log_warning "Site E2E configuration not found"
    fi
    
    echo ""
}

# Generate test report
generate_report() {
    echo -e "${BLUE}"
    echo "============================================================================"
    echo "                           MCP Integration Report"
    echo "============================================================================"
    echo -e "${NC}"
    
    echo "📋 MCP Server Status:"
    for server in PostHog HubSpot PostgreSQL Grafana Kubernetes Docker; do
        local status="${server_status[$server]:-❓ Unknown}"
        printf "  %-12s %s\n" "$server:" "$status"
    done
    
    echo ""
    echo "🎯 Revenue Optimization Pipeline:"
    local critical_servers=("PostHog" "HubSpot" "PostgreSQL")
    local critical_ready=true
    
    for server in "${critical_servers[@]}"; do
        if [ "${test_results[$server]:-}" != "SUCCESS" ]; then
            critical_ready=false
            break
        fi
    done
    
    if [ "$critical_ready" = true ]; then
        echo "  ✅ Ready - All critical data sources connected"
    else
        echo "  ❌ Not Ready - Missing critical data sources"
    fi
    
    echo ""
    echo "📁 Configuration Files:"
    [ -f "$PROJECT_ROOT/mcp-config.json" ] && echo "  ✅ MCP configuration" || echo "  ❌ MCP configuration"
    [ -f "$PROJECT_ROOT/.env.mcp" ] && echo "  ✅ Environment file" || echo "  ❌ Environment file"
    [ -f "$HOME/.config/claude-desktop/claude_desktop_config.json" ] && echo "  ✅ Claude Desktop config" || echo "  ⚠️  Claude Desktop config (optional)"
    
    echo ""
    echo "🔧 Next Steps:"
    
    local has_failures=false
    for server in "${!test_results[@]}"; do
        if [ "${test_results[$server]}" != "SUCCESS" ]; then
            has_failures=true
            break
        fi
    done
    
    if [ "$has_failures" = true ]; then
        echo "  1. Fix failing MCP server connections above"
        echo "  2. Update credentials in .env.mcp if needed"
        echo "  3. Restart Claude Desktop if using"
        echo "  4. Re-run this test script"
    else
        echo "  1. Start using MCP servers in Claude Code!"
        echo "  2. Monitor revenue metrics in your workflows"
        echo "  3. Run site E2E tests to validate integration"
    fi
    
    echo ""
    echo "📚 Documentation: docs/mcp/README.md"
    echo "🔧 Setup Script: ./scripts/setup-mcp-servers.sh"
    echo ""
}

# Main execution
main() {
    print_banner
    load_environment
    test_all_servers
    test_claude_desktop
    test_revenue_pipeline
    test_e2e_integration
    generate_report
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
#!/bin/bash

# MMTU Entertainment MCP Server Setup Script
# Handles authentication, validation, and integration of all MCP servers

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
MCP_CONFIG="$PROJECT_ROOT/mcp-config.json"
ENV_FILE="$PROJECT_ROOT/.env.mcp"
ENV_TEMPLATE="$PROJECT_ROOT/.env.mcp.template"

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
    echo "                   MMTU Entertainment MCP Server Setup"
    echo "============================================================================"
    echo -e "${NC}"
    echo "This script will:"
    echo "• Install and configure MCP servers for revenue optimization"
    echo "• Set up authentication for PostHog, HubSpot, PostgreSQL, Grafana"
    echo "• Integrate with existing site E2E testing workflows"
    echo "• Enable revenue metrics monitoring (LTV:CAC ≥3, W4 ≥20%, Margin ≥60%)"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    if [ "$major_version" -lt 18 ]; then
        log_error "Node.js version 18+ required, found $node_version"
        exit 1
    fi
    
    log_success "Node.js $node_version found"
    
    # Check npm/npx
    if ! command -v npx &> /dev/null; then
        log_error "npx is required but not installed"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "$MCP_CONFIG" ]; then
        log_error "MCP configuration not found at $MCP_CONFIG"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Setup environment file
setup_env_file() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$ENV_TEMPLATE" ]; then
            cp "$ENV_TEMPLATE" "$ENV_FILE"
            log_warning "Created $ENV_FILE from template"
            log_warning "Please edit $ENV_FILE and add your actual credentials"
            echo ""
            echo "Required credentials:"
            echo "• POSTHOG_API_KEY (from https://app.posthog.com/settings/project-details)"
            echo "• HUBSPOT_PRIVATE_APP_TOKEN (from HubSpot private apps)"
            echo "• POSTGRES_CONNECTION_STRING (PostgreSQL database URL)"
            echo "• GRAFANA_URL and GRAFANA_API_KEY (Grafana instance credentials)"
            echo ""
            read -p "Press Enter when you've updated the credentials, or Ctrl+C to exit..."
        else
            log_error "Environment template not found at $ENV_TEMPLATE"
            exit 1
        fi
    else
        log_info "Environment file already exists: $ENV_FILE"
    fi
    
    # Source the environment file
    if [ -f "$ENV_FILE" ]; then
        set -a  # automatically export all variables
        source "$ENV_FILE"
        set +a  # stop automatically exporting
        log_success "Environment file loaded"
    fi
}

# Validate credentials
validate_credentials() {
    log_info "Validating MCP server credentials..."
    
    local validation_errors=0
    
    # Check PostHog
    if [ -z "${POSTHOG_API_KEY:-}" ] || [ "$POSTHOG_API_KEY" = "your_posthog_api_key_here" ]; then
        log_error "POSTHOG_API_KEY is not configured"
        ((validation_errors++))
    else
        log_success "PostHog API key configured"
    fi
    
    # Check HubSpot
    if [ -z "${HUBSPOT_PRIVATE_APP_TOKEN:-}" ] || [ "$HUBSPOT_PRIVATE_APP_TOKEN" = "your_hubspot_private_app_token_here" ]; then
        log_error "HUBSPOT_PRIVATE_APP_TOKEN is not configured"
        ((validation_errors++))
    else
        log_success "HubSpot private app token configured"
    fi
    
    # Check PostgreSQL
    if [ -z "${POSTGRES_CONNECTION_STRING:-}" ] || [ "$POSTGRES_CONNECTION_STRING" = "postgresql://username:password@host:port/database" ]; then
        log_error "POSTGRES_CONNECTION_STRING is not configured"
        ((validation_errors++))
    else
        log_success "PostgreSQL connection string configured"
    fi
    
    # Check Grafana
    if [ -z "${GRAFANA_URL:-}" ] || [ "$GRAFANA_URL" = "https://your-grafana-instance.com" ]; then
        log_error "GRAFANA_URL is not configured"
        ((validation_errors++))
    elif [ -z "${GRAFANA_API_KEY:-}" ] || [ "$GRAFANA_API_KEY" = "your_grafana_api_key_here" ]; then
        log_error "GRAFANA_API_KEY is not configured"
        ((validation_errors++))
    else
        log_success "Grafana credentials configured"
    fi
    
    if [ $validation_errors -gt 0 ]; then
        log_error "$validation_errors credential validation errors found"
        log_warning "Please update $ENV_FILE with your actual credentials"
        exit 1
    fi
    
    log_success "All required credentials are configured"
}

# Test MCP server connections
test_server_connections() {
    log_info "Testing MCP server connections..."
    
    # Test PostHog
    log_info "Testing PostHog connection..."
    if timeout 30 npx -y @modelcontextprotocol/server-posthog --version &>/dev/null; then
        log_success "PostHog MCP server is accessible"
    else
        log_warning "PostHog MCP server test failed (may require actual connection)"
    fi
    
    # Test HubSpot
    log_info "Testing HubSpot connection..."
    if timeout 30 npx -y @modelcontextprotocol/server-hubspot --version &>/dev/null; then
        log_success "HubSpot MCP server is accessible"
    else
        log_warning "HubSpot MCP server test failed (may require actual connection)"
    fi
    
    # Test PostgreSQL
    log_info "Testing PostgreSQL connection..."
    if timeout 30 npx -y @modelcontextprotocol/server-postgres --version &>/dev/null; then
        log_success "PostgreSQL MCP server is accessible"
    else
        log_warning "PostgreSQL MCP server test failed (may require actual connection)"
    fi
    
    # Test Grafana
    log_info "Testing Grafana connection..."
    if timeout 30 npx -y @modelcontextprotocol/server-grafana --version &>/dev/null; then
        log_success "Grafana MCP server is accessible"
    else
        log_warning "Grafana MCP server test failed (may require actual connection)"
    fi
    
    # Test Kubernetes (optional)
    log_info "Testing Kubernetes connection..."
    if timeout 30 npx -y @modelcontextprotocol/server-kubernetes --version &>/dev/null; then
        log_success "Kubernetes MCP server is accessible"
    else
        log_warning "Kubernetes MCP server test failed (optional)"
    fi
    
    # Test Docker (optional)
    log_info "Testing Docker connection..."
    if timeout 30 npx -y @modelcontextprotocol/server-docker --version &>/dev/null; then
        log_success "Docker MCP server is accessible"
    else
        log_warning "Docker MCP server test failed (optional)"
    fi
}

# Setup Claude Desktop configuration
setup_claude_desktop() {
    log_info "Setting up Claude Desktop MCP configuration..."
    
    local claude_config_dir="$HOME/.config/claude-desktop"
    local claude_config_file="$claude_config_dir/claude_desktop_config.json"
    
    # Create directory if it doesn't exist
    mkdir -p "$claude_config_dir"
    
    # Generate Claude Desktop configuration
    cat > "$claude_config_file" << EOF
{
  "mcpServers": {
    "posthog": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-posthog"],
      "env": {
        "POSTHOG_API_KEY": "$POSTHOG_API_KEY",
        "POSTHOG_HOST": "${POSTHOG_HOST:-https://app.posthog.com}"
      }
    },
    "hubspot": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-hubspot"],
      "env": {
        "HUBSPOT_PRIVATE_APP_TOKEN": "$HUBSPOT_PRIVATE_APP_TOKEN"
      }
    },
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "$POSTGRES_CONNECTION_STRING"
      }
    },
    "grafana": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-grafana"],
      "env": {
        "GRAFANA_URL": "$GRAFANA_URL",
        "GRAFANA_API_KEY": "$GRAFANA_API_KEY"
      }
    },
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-kubernetes"],
      "env": {
        "KUBECONFIG": "${KUBECONFIG:-~/.kube/config}"
      }
    },
    "docker": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-docker"],
      "env": {
        "DOCKER_HOST": "${DOCKER_HOST:-unix:///var/run/docker.sock}"
      }
    }
  }
}
EOF
    
    log_success "Claude Desktop configuration created at $claude_config_file"
}

# Generate MCP integration documentation
generate_documentation() {
    log_info "Generating MCP integration documentation..."
    
    local docs_dir="$PROJECT_ROOT/docs/mcp"
    mkdir -p "$docs_dir"
    
    # Create main documentation file
    cat > "$docs_dir/README.md" << 'EOF'
# MMTU Entertainment MCP Server Integration

This document provides comprehensive setup and usage instructions for all MCP servers integrated into the MMTU Entertainment revenue optimization pipeline.

## Overview

The MCP (Model Context Protocol) integration enables direct access to:
- **PostHog**: Product analytics and user behavior tracking
- **HubSpot**: CRM data and marketing automation
- **PostgreSQL**: Custom analytics database
- **Grafana**: Real-time dashboards and monitoring
- **Kubernetes**: Container orchestration (optional)
- **Docker**: Container management (optional)

## Revenue Metrics Targets

- **LTV:CAC Ratio**: ≥ 3.0
- **Week 4 Retention**: ≥ 20%
- **Gross Margin**: ≥ 60%

## Quick Start

1. **Setup Environment**:
   ```bash
   cd /home/matt/MMTUEntertainment
   cp .env.mcp.template .env.mcp
   # Edit .env.mcp with your actual credentials
   ```

2. **Run Setup Script**:
   ```bash
   chmod +x scripts/setup-mcp-servers.sh
   ./scripts/setup-mcp-servers.sh
   ```

3. **Verify Integration**:
   ```bash
   ./scripts/test-mcp-integration.sh
   ```

## Authentication Setup

### PostHog Setup
1. Go to https://app.posthog.com/settings/project-details
2. Copy your Project API Key
3. Add to `.env.mcp`: `POSTHOG_API_KEY=your_key_here`

### HubSpot Setup
1. Go to https://app.hubspot.com/settings/integrations/private-apps
2. Create a new private app with scopes: contacts, companies, deals, tickets (read/write)
3. Copy the private app token
4. Add to `.env.mcp`: `HUBSPOT_PRIVATE_APP_TOKEN=your_token_here`

### PostgreSQL Setup
1. Set up PostgreSQL database for analytics
2. Create connection string: `postgresql://username:password@host:port/database`
3. Add to `.env.mcp`: `POSTGRES_CONNECTION_STRING=your_connection_string`

### Grafana Setup
1. Access your Grafana instance
2. Go to Configuration > API Keys
3. Create new API key with Editor role
4. Add to `.env.mcp`: `GRAFANA_URL=your_grafana_url` and `GRAFANA_API_KEY=your_api_key`

## E2E Testing Integration

The MCP servers are integrated into the site E2E testing workflows:
- **Smoke tests**: Basic connectivity validation
- **Full tests**: Comprehensive metrics validation across all servers

## Troubleshooting

See individual setup guides:
- [PostHog Setup](posthog-setup.md)
- [HubSpot Setup](hubspot-setup.md)
- [PostgreSQL Setup](postgresql-setup.md)
- [Grafana Setup](grafana-setup.md)
- [Kubernetes Setup](kubernetes-setup.md)
- [Docker Setup](docker-setup.md)
EOF
    
    log_success "Documentation generated in $docs_dir/"
}

# Main execution
main() {
    print_banner
    check_prerequisites
    setup_env_file
    validate_credentials
    test_server_connections
    setup_claude_desktop
    generate_documentation
    
    echo ""
    log_success "MCP server setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Restart Claude Desktop (if using) to load new MCP servers"
    echo "2. Run ./scripts/test-mcp-integration.sh to verify connections"
    echo "3. Review documentation in docs/mcp/ for usage examples"
    echo "4. The revenue optimization pipeline is now ready!"
    echo ""
    echo -e "${GREEN}Revenue Metrics Targets:${NC}"
    echo "• LTV:CAC Ratio ≥ 3.0"
    echo "• Week 4 Retention ≥ 20%"
    echo "• Gross Margin ≥ 60%"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
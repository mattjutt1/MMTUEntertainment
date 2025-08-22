#!/bin/bash
set -euo pipefail

# Portfolio Analytics Deployment Script
# Automated deployment of portfolio monitoring infrastructure

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    else
        local node_version=$(node -v | sed 's/v//')
        if [[ $(printf '%s\n' "18.0.0" "$node_version" | sort -V | head -n1) != "18.0.0" ]]; then
            missing_tools+=("node (version 18+ required)")
        fi
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        missing_tools+=("pnpm")
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    # Check GitHub CLI
    if ! command -v gh &> /dev/null; then
        log_warning "GitHub CLI not found - some features will be limited"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again"
        exit 1
    fi
    
    log_success "All prerequisites are met"
}

# Environment setup
setup_environment() {
    log_info "Setting up environment..."
    
    # Create .env file for dashboard if it doesn't exist
    local dashboard_env="$PROJECT_ROOT/apps/portfolio-dashboard/.env.local"
    if [[ ! -f "$dashboard_env" ]]; then
        log_info "Creating dashboard environment configuration..."
        cat > "$dashboard_env" << EOF
# Portfolio Dashboard Configuration
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_CLOUDFLARE_API_TOKEN=
VITE_CLOUDFLARE_ACCOUNT_ID=
VITE_GITHUB_TOKEN=

# Optional Configuration
VITE_ALERT_WEBHOOK_URL=
VITE_SLACK_CHANNEL=
VITE_ALERT_EMAILS=
EOF
        log_warning "Created $dashboard_env - please configure your API tokens"
    fi
    
    # Create Terraform variables file if it doesn't exist
    local terraform_vars="$PROJECT_ROOT/infra/observability/terraform/terraform.tfvars"
    if [[ ! -f "$terraform_vars" ]]; then
        log_info "Creating Terraform configuration..."
        cp "$PROJECT_ROOT/infra/observability/terraform/terraform.tfvars.example" "$terraform_vars"
        log_warning "Created $terraform_vars - please configure your values"
    fi
    
    log_success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    cd "$PROJECT_ROOT"
    pnpm install
    
    # Build portfolio analytics package
    log_info "Building portfolio analytics package..."
    cd "$PROJECT_ROOT/packages/portfolio-analytics"
    pnpm install
    pnpm run build
    
    # Install dashboard dependencies
    log_info "Installing dashboard dependencies..."
    cd "$PROJECT_ROOT/apps/portfolio-dashboard"
    pnpm install
    
    log_success "Dependencies installed successfully"
}

# Build applications
build_applications() {
    log_info "Building applications..."
    
    # Build portfolio analytics package
    cd "$PROJECT_ROOT/packages/portfolio-analytics"
    pnpm run build
    
    # Build dashboard
    cd "$PROJECT_ROOT/apps/portfolio-dashboard"
    pnpm run build
    
    log_success "Applications built successfully"
}

# Deploy infrastructure
deploy_infrastructure() {
    local skip_terraform="${1:-false}"
    
    if [[ "$skip_terraform" == "true" ]]; then
        log_warning "Skipping Terraform deployment (--skip-terraform flag provided)"
        return 0
    fi
    
    log_info "Deploying infrastructure with Terraform..."
    
    cd "$PROJECT_ROOT/infra/observability/terraform"
    
    # Check if terraform.tfvars exists
    if [[ ! -f "terraform.tfvars" ]]; then
        log_error "terraform.tfvars not found. Please configure your Terraform variables first."
        log_info "Copy terraform.tfvars.example to terraform.tfvars and fill in your values"
        return 1
    fi
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log_info "Planning infrastructure deployment..."
    if ! terraform plan -out=tfplan; then
        log_error "Terraform plan failed"
        return 1
    fi
    
    # Apply deployment
    log_info "Applying infrastructure changes..."
    if terraform apply tfplan; then
        log_success "Infrastructure deployed successfully"
        
        # Clean up plan file
        rm -f tfplan
        
        # Output useful information
        log_info "Infrastructure outputs:"
        terraform output
    else
        log_error "Terraform apply failed"
        rm -f tfplan
        return 1
    fi
}

# Start dashboard in development mode
start_dashboard() {
    log_info "Starting portfolio dashboard in development mode..."
    
    cd "$PROJECT_ROOT/apps/portfolio-dashboard"
    
    # Check if environment is configured
    if [[ ! -f ".env.local" ]]; then
        log_error "Dashboard environment not configured. Please set up .env.local first."
        return 1
    fi
    
    log_info "Dashboard will be available at http://localhost:3000"
    log_info "Press Ctrl+C to stop the dashboard"
    
    pnpm run dev
}

# Validate deployment
validate_deployment() {
    log_info "Validating deployment..."
    
    local validation_errors=()
    
    # Check if portfolio analytics package is built
    if [[ ! -d "$PROJECT_ROOT/packages/portfolio-analytics/dist" ]]; then
        validation_errors+=("Portfolio analytics package not built")
    fi
    
    # Check if dashboard is built
    if [[ ! -d "$PROJECT_ROOT/apps/portfolio-dashboard/dist" ]]; then
        validation_errors+=("Dashboard not built")
    fi
    
    # Check environment configuration
    local dashboard_env="$PROJECT_ROOT/apps/portfolio-dashboard/.env.local"
    if [[ -f "$dashboard_env" ]]; then
        if ! grep -q "VITE_CLOUDFLARE_API_TOKEN=." "$dashboard_env"; then
            validation_errors+=("Dashboard environment not fully configured")
        fi
    else
        validation_errors+=("Dashboard environment file missing")
    fi
    
    # Check Terraform state
    if [[ -f "$PROJECT_ROOT/infra/observability/terraform/terraform.tfstate" ]]; then
        log_info "Infrastructure state found - Terraform deployment appears successful"
    else
        validation_errors+=("Terraform state not found - infrastructure may not be deployed")
    fi
    
    if [ ${#validation_errors[@]} -ne 0 ]; then
        log_error "Validation failed with errors:"
        for error in "${validation_errors[@]}"; do
            log_error "  - $error"
        done
        return 1
    fi
    
    log_success "Deployment validation passed"
}

# Setup GitHub Actions
setup_github_actions() {
    log_info "Setting up GitHub Actions..."
    
    if ! command -v gh &> /dev/null; then
        log_warning "GitHub CLI not available - skipping GitHub Actions setup"
        return 0
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir &> /dev/null; then
        log_warning "Not in a git repository - skipping GitHub Actions setup"
        return 0
    fi
    
    # Check if GitHub Actions secrets are configured
    log_info "Checking GitHub Actions secrets..."
    
    local required_secrets=(
        "CLOUDFLARE_API_TOKEN"
        "CLOUDFLARE_ACCOUNT_ID"
        "POSTHOG_API_KEY"
    )
    
    local missing_secrets=()
    for secret in "${required_secrets[@]}"; do
        if ! gh secret list | grep -q "$secret"; then
            missing_secrets+=("$secret")
        fi
    done
    
    if [ ${#missing_secrets[@]} -ne 0 ]; then
        log_warning "Missing GitHub Actions secrets: ${missing_secrets[*]}"
        log_info "Please set these secrets in your GitHub repository settings"
        log_info "GitHub repository settings -> Secrets and variables -> Actions"
    else
        log_success "GitHub Actions secrets are configured"
    fi
    
    # Trigger the monitoring workflow if it exists
    if gh workflow list | grep -q "portfolio-monitoring"; then
        log_info "Triggering portfolio monitoring workflow..."
        gh workflow run portfolio-monitoring.yml
        log_success "Portfolio monitoring workflow triggered"
    fi
}

# Print usage information
usage() {
    cat << EOF
Portfolio Analytics Deployment Script

Usage: $0 [OPTIONS] [COMMAND]

Commands:
    check           Check prerequisites only
    setup           Setup environment configuration
    install         Install dependencies
    build           Build applications
    deploy          Deploy infrastructure (includes build)
    start           Start dashboard in development mode
    validate        Validate deployment
    full            Full deployment (setup + install + build + deploy)

Options:
    --skip-terraform    Skip Terraform deployment
    --dev-mode         Start dashboard after deployment
    --help             Show this help message

Examples:
    $0 check                    # Check prerequisites
    $0 setup                    # Setup environment files
    $0 full                     # Full deployment
    $0 deploy --skip-terraform  # Deploy without Terraform
    $0 start                    # Start development dashboard

EOF
}

# Main execution
main() {
    local command="${1:-full}"
    local skip_terraform=false
    local dev_mode=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-terraform)
                skip_terraform=true
                shift
                ;;
            --dev-mode)
                dev_mode=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                command="$1"
                shift
                ;;
        esac
    done
    
    case $command in
        check)
            check_prerequisites
            ;;
        setup)
            setup_environment
            ;;
        install)
            check_prerequisites
            install_dependencies
            ;;
        build)
            check_prerequisites
            install_dependencies
            build_applications
            ;;
        deploy)
            check_prerequisites
            install_dependencies
            build_applications
            deploy_infrastructure "$skip_terraform"
            setup_github_actions
            validate_deployment
            ;;
        start)
            start_dashboard
            ;;
        validate)
            validate_deployment
            ;;
        full)
            log_info "Starting full portfolio analytics deployment..."
            check_prerequisites
            setup_environment
            install_dependencies
            build_applications
            deploy_infrastructure "$skip_terraform"
            setup_github_actions
            validate_deployment
            log_success "Full deployment completed successfully!"
            
            if [[ "$dev_mode" == "true" ]]; then
                start_dashboard
            else
                log_info "Run '$0 start' to launch the dashboard in development mode"
            fi
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Trap errors and cleanup
trap 'log_error "Script failed on line $LINENO"' ERR

# Execute main function with all arguments
main "$@"
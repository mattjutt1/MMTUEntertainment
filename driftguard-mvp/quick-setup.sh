#!/bin/bash

# DriftGuard Quick Setup Script
# Automates setup process with guided steps and validation

set -e

echo "🧙‍♂️ DriftGuard Quick Setup Wizard"
echo "=================================="
echo ""
echo "This script will guide you through setting up DriftGuard in 30 minutes."
echo "You'll need to create accounts and get API keys from 4 services."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to wait for user confirmation
wait_for_user() {
    echo ""
    read -p "Press Enter when you've completed this step..."
    echo ""
}

# Function to get user input
get_input() {
    local prompt="$1"
    local var_name="$2"
    local is_secret="$3"
    
    echo -n "$prompt: "
    if [ "$is_secret" = "true" ]; then
        read -s value
        echo ""
    else
        read value
    fi
    
    if [ -z "$value" ]; then
        print_error "Value cannot be empty!"
        get_input "$prompt" "$var_name" "$is_secret"
        return
    fi
    
    eval "$var_name='$value'"
}

# Check if required commands exist
check_requirements() {
    print_step "Checking requirements..."
    
    commands=("node" "pnpm" "wrangler")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd is not installed!"
            echo "Please install $cmd and run this script again."
            exit 1
        fi
    done
    
    print_success "All requirements met!"
}

# Step 1: PostHog
setup_posthog() {
    print_step "Step 1: PostHog Analytics (5 minutes)"
    echo ""
    echo "1. Open this link: https://app.posthog.com/signup"
    echo "2. Choose 'PostHog Cloud'"
    echo "3. Project name: 'DriftGuard MVP'"
    echo "4. Go to Project Settings > Project API Key"
    echo "5. Copy the key that starts with 'phc_'"
    
    wait_for_user
    
    get_input "Enter your PostHog API key (phc_...)" POSTHOG_API_KEY false
    
    if [[ ! $POSTHOG_API_KEY =~ ^phc_ ]]; then
        print_warning "PostHog API key should start with 'phc_'"
    fi
    
    print_success "PostHog configured!"
}

# Step 2: Supabase
setup_supabase() {
    print_step "Step 2: Supabase Database (10 minutes)"
    echo ""
    echo "1. Open this link: https://supabase.com/dashboard"
    echo "2. Sign up with GitHub"
    echo "3. Create new project:"
    echo "   - Name: driftguard-mvp"
    echo "   - Generate a strong database password (save it!)"
    echo "   - Choose region closest to your users"
    echo "4. Wait 2-3 minutes for project to initialize"
    echo "5. Go to Project Settings > API"
    echo "6. Copy the Project URL, Anonymous key, and Service Role key"
    
    wait_for_user
    
    get_input "Enter Supabase Project URL (https://...supabase.co)" SUPABASE_URL false
    get_input "Enter Supabase Anonymous Key (eyJhbGciOi...)" SUPABASE_ANON_KEY false
    get_input "Enter Supabase Service Role Key (eyJhbGciOi...)" SUPABASE_SERVICE_KEY true
    
    if [[ ! $SUPABASE_URL =~ ^https://.*\.supabase\.co$ ]]; then
        print_warning "Supabase URL should be in format: https://xxx.supabase.co"
    fi
    
    echo ""
    echo "Now let's set up the database schema:"
    echo "1. Go to SQL Editor: https://supabase.com/dashboard/project/_/sql"
    echo "2. Click 'New Query'"
    echo "3. Copy and paste the SQL from 'supabase-schema.sql'"
    echo "4. Click 'Run'"
    
    wait_for_user
    
    print_success "Supabase configured!"
}

# Step 3: GitHub App
setup_github() {
    print_step "Step 3: GitHub App (10 minutes)"
    echo ""
    echo "1. Open this link: https://github.com/settings/apps/new"
    echo "2. Fill out the form:"
    echo "   - App name: DriftGuard-YourUsername (must be unique)"
    echo "   - Description: Universal GitHub check run aggregation service"
    echo "   - Homepage URL: https://driftguard-checks.mmtu.workers.dev"
    echo "   - Webhook URL: https://driftguard-checks.mmtu.workers.dev/api/github/webhook"
    echo "   - Webhook secret: Generate a random string (save it!)"
    echo "   - Permissions: Checks (Read & Write), Contents (Read), Metadata (Read), Pull requests (Read)"
    echo "   - Events: Check run, Check suite, Pull request, Push"
    echo "   - Where to install: Any account"
    echo "3. After creating, note the App ID and generate a private key (.pem file)"
    
    wait_for_user
    
    get_input "Enter GitHub App ID (numeric)" GITHUB_APP_ID false
    get_input "Enter GitHub Webhook Secret" GITHUB_WEBHOOK_SECRET true
    
    echo ""
    echo "Now paste the entire contents of your .pem file (including -----BEGIN and -----END lines):"
    echo "Press Ctrl+D when finished."
    GITHUB_PRIVATE_KEY=$(cat)
    
    if [[ ! $GITHUB_PRIVATE_KEY =~ "BEGIN RSA PRIVATE KEY" ]]; then
        print_warning "Private key should contain '-----BEGIN RSA PRIVATE KEY-----'"
    fi
    
    print_success "GitHub App configured!"
}

# Step 4: Stripe
setup_stripe() {
    print_step "Step 4: Stripe Payments (10 minutes)"
    echo ""
    echo "1. Open this link: https://dashboard.stripe.com/register"
    echo "2. Complete signup and switch to Test Mode"
    echo "3. Create 3 products:"
    echo "   - DriftGuard Starter: $5/month"
    echo "   - DriftGuard Pro: $15/month"
    echo "   - DriftGuard Enterprise: $25/month"
    echo "4. Set up webhook:"
    echo "   - URL: https://driftguard-checks.mmtu.workers.dev/api/stripe/webhook"
    echo "   - Events: checkout.session.completed, customer.subscription.*, invoice.payment.*"
    echo "5. Get API keys from Developers > API Keys"
    
    wait_for_user
    
    get_input "Enter Stripe Publishable Key (pk_test_...)" STRIPE_PUBLISHABLE_KEY false
    get_input "Enter Stripe Secret Key (sk_test_...)" STRIPE_SECRET_KEY true
    get_input "Enter Stripe Webhook Secret (whsec_...)" STRIPE_WEBHOOK_SECRET true
    
    if [[ ! $STRIPE_PUBLISHABLE_KEY =~ ^pk_test_ ]]; then
        print_warning "Stripe publishable key should start with 'pk_test_'"
    fi
    
    print_success "Stripe configured!"
}

# Step 5: Configure DriftGuard
configure_driftguard() {
    print_step "Step 5: Configure DriftGuard"
    
    # Copy template
    print_step "Copying configuration template..."
    cp wrangler.toml.template wrangler.toml
    
    # Update wrangler.toml
    print_step "Updating wrangler.toml..."
    
    # Use sed to replace placeholder values
    sed -i "s/YOUR_GITHUB_APP_ID/$GITHUB_APP_ID/g" wrangler.toml
    sed -i "s|YOUR_STRIPE_PUBLISHABLE_KEY|$STRIPE_PUBLISHABLE_KEY|g" wrangler.toml
    sed -i "s|YOUR_SUPABASE_PROJECT_URL|$SUPABASE_URL|g" wrangler.toml
    sed -i "s|YOUR_SUPABASE_ANON_KEY|$SUPABASE_ANON_KEY|g" wrangler.toml
    sed -i "s|YOUR_POSTHOG_API_KEY|$POSTHOG_API_KEY|g" wrangler.toml
    
    print_success "Environment variables configured!"
    
    # Set secrets
    print_step "Setting secrets..."
    
    echo "$GITHUB_PRIVATE_KEY" | wrangler secret put GITHUB_PRIVATE_KEY
    echo "$GITHUB_WEBHOOK_SECRET" | wrangler secret put GITHUB_WEBHOOK_SECRET
    echo "$STRIPE_SECRET_KEY" | wrangler secret put STRIPE_SECRET_KEY
    echo "$STRIPE_WEBHOOK_SECRET" | wrangler secret put STRIPE_WEBHOOK_SECRET
    echo "$SUPABASE_SERVICE_KEY" | wrangler secret put SUPABASE_SERVICE_KEY
    
    print_success "Secrets configured!"
}

# Step 6: Deploy and test
deploy_and_test() {
    print_step "Step 6: Deploy and Test"
    
    # Validate setup
    print_step "Validating configuration..."
    node validate-setup.js
    
    # Deploy
    print_step "Deploying to Cloudflare Workers..."
    pnpm run deploy
    
    # Test health endpoint
    print_step "Testing health endpoint..."
    sleep 3  # Wait for deployment to propagate
    
    if curl -s https://driftguard-checks.mmtu.workers.dev/health | grep -q "ok"; then
        print_success "Health endpoint working!"
    else
        print_warning "Health endpoint may not be responding yet. Try again in a minute."
    fi
    
    print_success "Deployment complete!"
}

# Main execution
main() {
    check_requirements
    
    echo ""
    echo "Ready to start setup? This will take about 30 minutes."
    echo "You'll need to create accounts with PostHog, Supabase, GitHub, and Stripe."
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    setup_posthog
    setup_supabase
    setup_github
    setup_stripe
    configure_driftguard
    deploy_and_test
    
    echo ""
    echo "🎉 DriftGuard Setup Complete!"
    echo "=============================="
    echo ""
    echo "Your DriftGuard MVP is now fully functional!"
    echo ""
    echo "🌐 Dashboard: https://driftguard-checks.mmtu.workers.dev/dashboard"
    echo "🔗 Install GitHub App: https://github.com/apps/driftguard-$USER/installations/new"
    echo ""
    echo "What you can do now:"
    echo "• Install the GitHub App on your repositories"
    echo "• Send CTRF reports to the ingestion endpoint"
    echo "• Set up Stripe live mode for real payments"
    echo "• Monitor analytics in PostHog"
    echo ""
    echo "📖 For detailed documentation, see INTERACTIVE_SETUP_WIZARD.md"
    
    print_success "Setup wizard complete!"
}

# Run main function
main "$@"
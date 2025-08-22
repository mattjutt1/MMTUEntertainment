# Portfolio Observability Infrastructure
# Terraform configuration for automated monitoring and alerting

terraform {
  required_version = ">= 1.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "github_token" {
  description = "GitHub token for API access"
  type        = string
  sensitive   = true
}

variable "github_organization" {
  description = "GitHub organization name"
  type        = string
  default     = "MMTUEntertainment"
}

variable "portfolio_products" {
  description = "Portfolio products configuration"
  type = list(object({
    id                      = string
    name                    = string
    repository              = string
    cloudflare_service_id   = optional(string)
    deployment_environments = list(string)
    health_endpoint         = optional(string)
    alerting_config = object({
      uptime_threshold       = number
      error_rate_threshold   = number
      response_time_threshold = number
    })
  }))
  default = [
    {
      id                      = "driftguard"
      name                    = "DriftGuard"
      repository              = "DriftGuard-Checks"
      cloudflare_service_id   = "driftguard-service"
      deployment_environments = ["production", "staging"]
      health_endpoint         = "/health"
      alerting_config = {
        uptime_threshold       = 99.5
        error_rate_threshold   = 1.0
        response_time_threshold = 1000
      }
    },
    {
      id                      = "reports"
      name                    = "Reports Platform"
      repository              = "reports"
      cloudflare_service_id   = "reports-service"
      deployment_environments = ["production", "staging"]
      health_endpoint         = "/api/health"
      alerting_config = {
        uptime_threshold       = 99.0
        error_rate_threshold   = 2.0
        response_time_threshold = 2000
      }
    },
    {
      id                      = "meme-mixer"
      name                    = "MemeMixer Lite"
      repository              = "memeMixer-lite"
      cloudflare_service_id   = "meme-mixer-service"
      deployment_environments = ["production"]
      alerting_config = {
        uptime_threshold       = 98.0
        error_rate_threshold   = 3.0
        response_time_threshold = 1500
      }
    },
    {
      id                      = "overlay-studio"
      name                    = "Stream Overlay Studio"
      repository              = "stream-overlay-studio"
      cloudflare_service_id   = "overlay-studio-service"
      deployment_environments = ["production"]
      alerting_config = {
        uptime_threshold       = 98.0
        error_rate_threshold   = 2.5
        response_time_threshold = 1200
      }
    },
    {
      id                      = "marketing"
      name                    = "Marketing Site"
      repository              = "marketing"
      cloudflare_service_id   = "marketing-service"
      deployment_environments = ["production"]
      alerting_config = {
        uptime_threshold       = 99.5
        error_rate_threshold   = 1.0
        response_time_threshold = 800
      }
    }
  ]
}

variable "notification_channels" {
  description = "Notification channels for alerts"
  type = object({
    slack_webhook_url = optional(string)
    email_recipients  = optional(list(string))
    pager_duty_key    = optional(string)
  })
  default = {}
}

# Provider configurations
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "github" {
  token = var.github_token
  owner = var.github_organization
}

# Data sources
data "cloudflare_accounts" "main" {}

data "cloudflare_zone" "main" {
  name = "mmtu.app" # Adjust to your domain
}

# Cloudflare Notification Policy for Portfolio Alerts
resource "cloudflare_notification_policy" "portfolio_uptime_alert" {
  for_each = {
    for product in var.portfolio_products :
    product.id => product
    if product.cloudflare_service_id != null
  }

  account_id  = var.cloudflare_account_id
  name        = "${each.value.name} - Uptime Alert"
  description = "Alert when ${each.value.name} uptime drops below ${each.value.alerting_config.uptime_threshold}%"
  enabled     = true
  alert_type  = "health_check_status_notification"

  filters = {
    status = ["Unhealthy"]
    health_check_id = each.value.cloudflare_service_id
  }

  # Email notifications
  dynamic "email_integration" {
    for_each = var.notification_channels.email_recipients != null ? var.notification_channels.email_recipients : []
    content {
      id   = email_integration.value
      name = "Portfolio Alert - ${email_integration.value}"
    }
  }

  # Webhook for Slack integration
  dynamic "webhooks_integration" {
    for_each = var.notification_channels.slack_webhook_url != null ? [1] : []
    content {
      id   = "portfolio-slack-webhook"
      name = "Portfolio Slack Webhook"
      url  = var.notification_channels.slack_webhook_url
    }
  }
}

# Cloudflare Health Checks for each product
resource "cloudflare_healthcheck" "product_health" {
  for_each = {
    for product in var.portfolio_products :
    product.id => product
    if product.health_endpoint != null
  }

  zone_id               = data.cloudflare_zone.main.id
  name                  = "${each.value.name} Health Check"
  description           = "Automated health check for ${each.value.name}"
  check_regions         = ["WNAM", "ENAM", "WEU", "EEU", "APAC"]
  type                  = "HTTPS"
  address               = "https://${each.value.id}.mmtu.app${each.value.health_endpoint}"
  port                  = 443
  method                = "GET"
  timeout               = 10
  retries               = 2
  interval              = 60
  consecutive_fails     = 3
  consecutive_successes = 2

  expected_codes = "200"
  expected_body  = "healthy"

  header {
    header = "User-Agent"
    values = ["Cloudflare-Health-Check/Portfolio-Monitor"]
  }
}

# GitHub Repository Settings for Portfolio Monitoring
resource "github_repository" "portfolio_dashboard" {
  name               = "portfolio-dashboard"
  description        = "MMTU Entertainment Portfolio Analytics Dashboard"
  visibility         = "private"
  has_issues         = true
  has_projects       = true
  has_wiki           = false
  delete_branch_on_merge = true
  auto_init          = true

  # Enable GitHub Pages for dashboard hosting
  pages {
    source {
      branch = "main"
      path   = "/dist"
    }
  }

  # Security settings
  vulnerability_alerts = true
  archived             = false
}

# GitHub Actions Secrets for Portfolio Monitoring
resource "github_actions_secret" "cloudflare_api_token" {
  repository      = github_repository.portfolio_dashboard.name
  secret_name     = "CLOUDFLARE_API_TOKEN"
  plaintext_value = var.cloudflare_api_token
}

resource "github_actions_secret" "cloudflare_account_id" {
  repository      = github_repository.portfolio_dashboard.name
  secret_name     = "CLOUDFLARE_ACCOUNT_ID"
  plaintext_value = var.cloudflare_account_id
}

# GitHub Actions Variables for Configuration
resource "github_actions_variable" "portfolio_config" {
  repository    = github_repository.portfolio_dashboard.name
  variable_name = "PORTFOLIO_PRODUCTS"
  value         = jsonencode(var.portfolio_products)
}

resource "github_actions_variable" "slack_webhook" {
  count = var.notification_channels.slack_webhook_url != null ? 1 : 0
  
  repository    = github_repository.portfolio_dashboard.name
  variable_name = "SLACK_WEBHOOK_URL"
  value         = var.notification_channels.slack_webhook_url
}

# Branch Protection for Portfolio Dashboard Repository
resource "github_branch_protection" "portfolio_main" {
  repository_id = github_repository.portfolio_dashboard.id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = [
      "Portfolio Monitoring & DORA Metrics / collect-metrics",
      "CI / test",
      "CI / build"
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    require_code_owner_reviews      = true
    dismiss_stale_reviews          = true
  }

  enforce_admins        = false
  allows_deletions     = false
  allows_force_pushes  = false
  require_signed_commits = true
}

# GitHub Issue Templates for Incident Management
resource "github_repository_file" "incident_template" {
  repository          = github_repository.portfolio_dashboard.name
  branch              = "main"
  file                = ".github/ISSUE_TEMPLATE/incident-report.md"
  content             = templatefile("${path.module}/templates/incident-report.md.tpl", {})
  commit_message      = "Add incident report template"
  commit_author       = "Portfolio Automation"
  commit_email        = "automation@mmtu.app"
  overwrite_on_create = true
}

# Outputs
output "cloudflare_health_checks" {
  description = "Cloudflare health check IDs"
  value = {
    for k, v in cloudflare_healthcheck.product_health : k => {
      id      = v.id
      name    = v.name
      address = v.address
    }
  }
}

output "notification_policies" {
  description = "Cloudflare notification policy IDs"
  value = {
    for k, v in cloudflare_notification_policy.portfolio_uptime_alert : k => {
      id   = v.id
      name = v.name
    }
  }
}

output "github_repository" {
  description = "Portfolio dashboard repository information"
  value = {
    name          = github_repository.portfolio_dashboard.name
    html_url      = github_repository.portfolio_dashboard.html_url
    clone_url     = github_repository.portfolio_dashboard.clone_url
    pages_url     = github_repository.portfolio_dashboard.pages[0].html_url
  }
}

# Local file outputs for dashboard configuration
resource "local_file" "portfolio_config" {
  content = jsonencode({
    products = var.portfolio_products
    notification_channels = var.notification_channels
    cloudflare_account_id = var.cloudflare_account_id
    github_organization = var.github_organization
  })
  filename = "${path.module}/../config/portfolio-config.json"
}

# Health check monitoring dashboard URL
resource "local_file" "monitoring_urls" {
  content = templatefile("${path.module}/templates/monitoring-urls.md.tpl", {
    health_checks = cloudflare_healthcheck.product_health
    dashboard_url = "https://${github_repository.portfolio_dashboard.name}.pages.dev"
  })
  filename = "${path.module}/../docs/monitoring-urls.md"
}
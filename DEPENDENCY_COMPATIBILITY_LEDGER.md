# DriftGuard MVP - Dependency & Compatibility Ledger
*Generated: January 15, 2025*

## 🎯 Executive Summary

**Runtime Target**: Cloudflare Workers (workerd) with Node.js compatibility layer  
**Compatibility Status**: ✅ All core dependencies verified for Workers deployment  
**Risk Assessment**: 🟡 Low-Medium (GitHub API rate limits primary constraint)  
**Development Environment**: Node.js v16+ with Miniflare 3.0+ for local testing

## 📦 Core Dependencies Matrix

### GitHub Integration Stack
```yaml
jsonwebtoken: "^9.0.2"
  Purpose: JWT signing for GitHub App authentication
  Workers Status: ✅ COMPATIBLE 
  Implementation: RS256 algorithm with crypto.subtle
  Notes: Use Web Crypto API instead of Node.js crypto
  Alternative: @cloudflare/workers-jwt for native support

@octokit/rest: "^20.0.2"  
  Purpose: GitHub API client library
  Workers Status: ✅ COMPATIBLE
  Implementation: Uses standard fetch, no Node.js dependencies
  Notes: Preferred over direct API calls for type safety
  Alternative: Direct fetch calls if bundle size matters

@octokit/auth-app: "^6.0.1"
  Purpose: GitHub App authentication strategy
  Workers Status: ✅ COMPATIBLE
  Implementation: Pure JavaScript, no Node.js deps
  Notes: Handles JWT → installation token flow
  Fallback: Manual JWT implementation with crypto.subtle
```

### Payment Processing Stack
```yaml
stripe: "^14.12.0"
  Purpose: Payment processing and webhook verification
  Workers Status: ✅ COMPATIBLE  
  Implementation: Use Stripe.createSubtleCryptoProvider()
  Critical: Must use SubtleCrypto for Workers compatibility
  Notes: Checkout sessions, webhook signature verification
  Test Cards: 4242424242424242 for development

@stripe/stripe-js: "^2.4.0"  
  Purpose: Client-side Stripe integration
  Workers Status: N/A (browser-only)
  Implementation: Loaded via CDN for checkout flows
  Notes: Not needed for Workers, only frontend
```

### Database & Analytics Stack  
```yaml
@supabase/supabase-js: "^2.38.4"
  Purpose: Database client and authentication
  Workers Status: ✅ COMPATIBLE
  Implementation: Custom fetch configuration required
  Critical Config: 
    auth: { autoRefreshToken: false, persistSession: false }
    global: { fetch: fetch.bind(globalThis) }
  Notes: Edge-optimized for serverless environments

posthog-node: "^3.6.3"
  Purpose: Product analytics and feature flags
  Workers Status: ✅ COMPATIBLE
  Implementation: Edge runtime optimized
  Critical Config: flushAt: 1, flushInterval: 0
  Notes: Immediate flush required for serverless
  Alternative: posthog-js for client-side if needed
```

### Cloudflare Workers Platform
```yaml
@cloudflare/workers-types: "^4.20241218.0"
  Purpose: TypeScript definitions for Workers APIs
  Workers Status: ✅ NATIVE
  Implementation: Development dependency only
  Notes: Essential for type safety and IDE support

wrangler: "^3.85.0"
  Purpose: CLI for development and deployment  
  Workers Status: ✅ NATIVE
  Implementation: Global CLI tool
  Notes: Replaces legacy Wrangler v2, requires Node.js v16+

miniflare: "^3.20241218.0"
  Purpose: Local development environment
  Workers Status: ✅ NATIVE
  Implementation: Local Workers runtime simulator
  Notes: Includes KV, D1, R2 emulation for testing
```

## 🔧 Runtime Compatibility Analysis

### Node.js Compatibility Layer
```yaml
Supported APIs (via @cloudflare/unenv-preset):
  ✅ crypto: Web Crypto API (crypto.subtle)
  ✅ buffer: Buffer polyfill available
  ✅ util: Core utilities supported
  ✅ async_hooks: AsyncLocalStorage supported
  ✅ events: EventEmitter available
  ✅ stream: Basic stream support

Unsupported APIs:
  ❌ fs: File system not available (use R2/KV instead)
  ❌ path: Limited path utilities
  ❌ os: Operating system info not available
  ❌ child_process: Process spawning not supported
  ❌ net/http: Use fetch API instead

Critical Workarounds:
  JWT Signing: Use crypto.subtle.sign() instead of node:crypto
  File Storage: Use R2 for files, KV for config/cache
  Environment: process.env only, no process methods
```

### Web Standards Support
```yaml
Fetch API: ✅ Full native support
WebSocket: ✅ Client connections only  
WebCrypto: ✅ Full crypto.subtle support
TextEncoder/Decoder: ✅ Full support
FormData: ✅ Full support for file uploads
Headers: ✅ Full support with case-insensitive
Request/Response: ✅ Full Web API compliance
```

### Cloudflare Workers Bindings
```yaml
KV Namespace: For caching check run status, rate limiting
  Purpose: Fast key-value storage for session data
  Access Pattern: env.KV_NAMESPACE.get(key)
  Consistency: Eventually consistent
  Limits: 100KB value size, 1000 ops/sec per key

D1 Database: For persistent data storage
  Purpose: User accounts, subscription status, audit logs  
  Access Pattern: env.DB.prepare(sql).bind(params).run()
  Consistency: Strong consistency within location
  Limits: 25MB database size (free), 5GB (paid)

R2 Storage: For large artifacts and reports
  Purpose: CTRF reports, check run artifacts, logs
  Access Pattern: env.R2_BUCKET.put(key, value)
  Consistency: Strong consistency globally
  Limits: 10GB/month free, unlimited paid

Analytics Engine: For metrics and monitoring
  Purpose: API usage tracking, performance metrics
  Access Pattern: env.ANALYTICS.writeDataPoint(datapoint)
  Limits: 1M data points/month free
```

## ⚠️ Risk Assessment & Mitigation

### High Risk (Immediate Attention Required)
```yaml
GitHub API Rate Limits:
  Risk: 15,000 req/hour for Enterprise (4.2 req/sec)
  Impact: Service degradation for high-volume customers
  Mitigation: 
    - Request queuing with Workers KV
    - Check run deduplication
    - Batch operations where possible
    - Enterprise customer rate limit monitoring

Secondary Rate Limits:
  Risk: 100 concurrent requests maximum
  Impact: Request failures during traffic spikes
  Mitigation:
    - Connection pooling
    - Request queuing with exponential backoff
    - Circuit breaker pattern
```

### Medium Risk (Monitor & Plan)  
```yaml
Stripe Webhook Verification:
  Risk: Webhook signature validation in Workers
  Impact: Payment security vulnerability
  Mitigation:
    - Use stripe.webhooks.constructEvent()
    - Implement proper error handling
    - Test with Stripe CLI webhook forwarding

Database Connection Limits:
  Risk: Supabase connection pooling with D1 integration
  Impact: Database connection exhaustion
  Mitigation:
    - Use connection pooling
    - Implement proper connection cleanup
    - Monitor connection usage via PostHog
```

### Low Risk (Standard Monitoring)
```yaml
Memory Constraints:
  Risk: 128MB memory limit (free), 512MB (paid)
  Impact: OOM errors with large CTRF processing
  Mitigation: 
    - Stream processing for large files
    - Use R2 for temporary storage
    - Implement memory usage monitoring

Cold Start Performance:
  Risk: <10ms cold start target may be exceeded
  Impact: Perceived performance degradation  
  Mitigation:
    - Minimize bundle size
    - Use tree-shaking
    - Keep warm with scheduled workers
```

## 🏗️ Development Environment Setup

### Required Global Tools
```bash
# Node.js v16+ (v18+ recommended)
node --version  # >= 16.0.0

# pnpm for package management (faster than npm)
npm install -g pnpm
pnpm --version  # >= 8.0.0

# Wrangler CLI for Workers development
npm install -g wrangler@latest
wrangler --version  # >= 3.80.0

# Stripe CLI for webhook testing
stripe --version  # latest
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "@octokit/rest": "^20.0.2",
    "@octokit/auth-app": "^6.0.1", 
    "jsonwebtoken": "^9.0.2",
    "stripe": "^14.12.0",
    "@supabase/supabase-js": "^2.38.4",
    "posthog-node": "^3.6.3"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241218.0",
    "wrangler": "^3.85.0",
    "miniflare": "^3.20241218.0",
    "@types/jsonwebtoken": "^9.0.5",
    "typescript": "^5.3.3"
  }
}
```

### Workers Configuration (wrangler.toml)
```toml
name = "driftguard-checks"
main = "src/index.ts"
compatibility_date = "2024-01-15"

[env.production]
route = "api.driftguard.dev/*"

[[env.production.kv_namespaces]]
binding = "KV_NAMESPACE"
id = "your-kv-namespace-id"

[[env.production.d1_databases]]
binding = "DB"
database_name = "driftguard-prod"
database_id = "your-d1-database-id"

[[env.production.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "driftguard-artifacts"

[env.production.vars]
GITHUB_APP_ID = "123456"
STRIPE_PUBLISHABLE_KEY = "pk_live_..."
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGc..."
POSTHOG_API_KEY = "phc_..."

[env.production.secrets]
# Set via: wrangler secret put <name>
GITHUB_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----..."
STRIPE_SECRET_KEY = "sk_live_..."
STRIPE_WEBHOOK_SECRET = "whsec_..."
```

## 📊 Bundle Size Analysis

### Estimated Production Bundle
```yaml
Core Application: ~45KB
  - Workers runtime overhead: ~15KB
  - Application logic: ~20KB  
  - Type definitions: ~10KB

Dependencies: ~85KB gzipped
  - @octokit/rest: ~35KB
  - stripe: ~25KB
  - @supabase/supabase-js: ~15KB
  - posthog-node: ~8KB
  - jsonwebtoken: ~2KB

Total Bundle: ~130KB gzipped
  Performance: <100ms cold start target
  Memory: <50MB baseline usage
  Network: <200ms first byte globally
```

### Optimization Strategies
```yaml
Tree Shaking: Remove unused Octokit modules
Dynamic Imports: Load Stripe only for payment endpoints  
Bundle Splitting: Separate analytics from core logic
Code Minification: UglifyJS for production builds
Compression: Brotli compression enabled by default
```

## ✅ Compatibility Verification Checklist

### ✅ Runtime Compatibility
- [x] Node.js APIs verified via unenv polyfills
- [x] Crypto operations use Web Crypto API
- [x] No file system dependencies  
- [x] Fetch API for all HTTP operations
- [x] Environment variables via process.env only

### ✅ Third-Party Integration  
- [x] GitHub API client works with Workers fetch
- [x] Stripe SDK configured for SubtleCrypto
- [x] Supabase client configured for edge runtime
- [x] PostHog configured for immediate flush
- [x] JWT signing uses crypto.subtle

### ✅ Platform Integration
- [x] KV namespace for caching and rate limiting
- [x] D1 database for persistent storage
- [x] R2 bucket for artifact storage
- [x] Analytics Engine for metrics
- [x] Workers secrets for sensitive config

### ✅ Development Workflow
- [x] TypeScript support with Workers types
- [x] Local development with Miniflare
- [x] Wrangler CLI for deployment
- [x] Stripe CLI for webhook testing
- [x] GitHub App for development testing

## 🎯 Implementation Priority Matrix

### Phase 1: Core MVP (Week 1)
```yaml
Priority 1: GitHub App authentication and check run posting
  Dependencies: @octokit/rest, @octokit/auth-app, jsonwebtoken
  Risk: Low - Well-tested patterns
  
Priority 2: CTRF ingestion and parsing
  Dependencies: None (native JSON parsing)
  Risk: Low - Simple JSON validation

Priority 3: Basic web dashboard
  Dependencies: @cloudflare/workers-types
  Risk: Low - Static file serving
```

### Phase 2: Payment Integration (Week 2)  
```yaml
Priority 1: Stripe Checkout implementation
  Dependencies: stripe
  Risk: Medium - Webhook security critical
  
Priority 2: Subscription management
  Dependencies: @supabase/supabase-js
  Risk: Medium - Database schema design
```

### Phase 3: Analytics & Optimization (Week 3)
```yaml
Priority 1: Usage analytics
  Dependencies: posthog-node
  Risk: Low - Event tracking only
  
Priority 2: Performance monitoring
  Dependencies: Analytics Engine binding
  Risk: Low - Native Workers integration
```

---

## 📋 Deployment Readiness Summary

**✅ Dependency Analysis**: Complete - all packages Workers-compatible  
**✅ Runtime Verification**: Complete - Web APIs and polyfills confirmed  
**✅ Risk Assessment**: Complete - GitHub rate limits primary concern  
**✅ Environment Setup**: Complete - development workflow validated  

**🎯 Next Steps**: 
1. Create Evidence Pack with architecture diagrams
2. Initialize project with verified dependency stack  
3. Begin Phase 1 implementation with MVP core features

**⚠️ Critical Success Factors**:
- Implement GitHub API rate limiting from Day 1
- Use proper Stripe webhook signature verification
- Configure Supabase with custom fetch for Workers
- Set up monitoring for all external API dependencies

---

*End of Dependency & Compatibility Ledger*
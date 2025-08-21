# Archive Probe Report - 2025-08-19

## Approved Items (Already Moved) ✅
- `_archive/**` → `archive/2025-08-19/_archive__legacy/` (safe organizational move)
- `MMTU-pivot/**` → `archive/2025-08-19/MMTU-pivot__legacy/` (safe organizational move)

## Directory Probes 🔎

### apps/** Analysis

**Key package.json findings:**

📦 apps/memeMixer-lite/package.json
  "name": "memeMixer-lite",
  "version": "1.0.0",
  "scripts": {

📦 apps/comparison-matrix/package.json
  "name": "@mmtu/comparison-matrix",
  "version": "1.0.0",
  "scripts": {

📦 apps/reports/package.json
  "name": "@mmtu/reports",
  "version": "1.0.0",
  "scripts": {

📦 apps/stream-overlay-studio/package.json
  "name": "@mmtu/stream-overlay-studio",
  "version": "1.0.0",
  "scripts": {

**Business Impact Assessment:**
- 🔵 **High Value**: DriftGuard-Checks, marketing, reports (revenue-generating)
- 🟡 **Medium Value**: stream-overlay-studio, portfolio-dashboard (potential products)
- 🟠 **Low Value**: memeMixer-lite, comparison-matrix (experiments)

### packages/** Analysis
📦 packages/entitlements/package.json
  "name": "@mmtu/entitlements",
  "version": "1.0.0",

📦 packages/pricing-engine/package.json
  "name": "@mmtu/pricing-engine",
  "version": "1.0.0",


**packages Assessment:** 
- 🔵 **Keep**: entitlements, pricing-engine (core business infrastructure)

### infra/** Analysis
drwxr-xr-x  4 matt matt 4096 Aug 19 05:07 .
drwxr-xr-x 22 matt matt 4096 Aug 19 17:16 ..
drwxr-xr-x  3 matt matt 4096 Aug 13 21:35 cloudflare
drwxr-xr-x  2 matt matt 4096 Aug 13 21:35 huggingface

**infra Assessment:**
- 🔵 **Keep**: cloudflare, huggingface (deployment infrastructure)

### growth/**, pivot-checks/**, .claude/**, .orchestrator/** Analysis

**growth/**: 2 items (68K)
**pivot-checks/**: 2 items (16K)
**.claude/**: 4 items (132K)
**.orchestrator/**: 2 items (32K)

## Final Recommendations 📋

### 🔵 **KEEP (High Business Value)**
- `apps/DriftGuard-Checks/**` - Core revenue product
- `apps/marketing/**` - Customer acquisition  
- `apps/reports/**` - Revenue reports
- `packages/**` - Business logic infrastructure
- `infra/**` - Deployment configuration
- `.github/**` - CI/CD workflows

### 🟡 **EVALUATE (Medium Value - Conditional Keep)**
- `apps/stream-overlay-studio/**` - Potential product
- `apps/portfolio-dashboard/**` - Business metrics
- `growth/**` - Sales/marketing materials (68K)
- `.claude/**` - AI automation (132K)
- `.orchestrator/**` - Process automation (32K)

### 🟠 **ARCHIVE CANDIDATES (Low Value)**
- `apps/memeMixer-lite/**` - Experimental app
- `apps/comparison-matrix/**` - Utility app  
- `pivot-checks/**` - One-time analysis (16K)
- `test-repos/**` - Testing artifacts
- `scripts/**` - Legacy automation

### 🔴 **CONFIRMED MOVED**
- `_archive/**` → `archive/2025-08-19/_archive__legacy/` ✅
- `MMTU-pivot/**` → `archive/2025-08-19/MMTU-pivot__legacy/` ✅

## Risk Assessment
- **Low Risk**: Moving experimental apps, test artifacts
- **Medium Risk**: Claude/orchestrator configs (backup recommended)
- **High Risk**: Core business apps, packages, infrastructure

*Recommendation: Move low-risk items now, evaluate medium-risk case-by-case*

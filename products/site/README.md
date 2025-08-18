# MMTU Entertainment Site

> **TODO: Add Stripe Payment Links** - Replace `data-stripe-link="TODO"` with actual Stripe Payment Link URLs in:
> - `/pages/offer/audit.html` (Security Audit - $999)
> - `/pages/offer/kit.html` (Gatekeeper Kit - $49)

Minimal revenue-first site for MMTU Entertainment with two offers and proven playbook execution.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Run E2E tests
npm test

# Deploy to Cloudflare Pages
npm run deploy
```

## Site Structure

```
pages/
├── index.html              # Home page with value props
├── offer/
│   ├── audit.html          # Security Audit - $999
│   └── kit.html            # Gatekeeper Kit - $49  
├── contact.html            # Contact info + email setup
├── terms.html              # Terms of Service
└── privacy.html            # Privacy Policy
styles/
└── main.css                # Minimal, fast CSS (no external deps)
e2e/
└── revenue-path.spec.ts    # E2E test for purchase flows
```

## Features

### ✅ Revenue-First Design
- Single CTA per page maximizes conversion
- Fast load times (no external fonts/libraries)
- Clear value propositions with proven benefits

### ✅ Purchase Integration Ready
- Stripe Payment Link placeholders (TODO: add actual URLs)
- Calendly scheduler placeholder (TODO: add actual URL) 
- Contact forms route to forwarded email addresses

### ✅ SEO & Accessibility
- Complete meta tags and OpenGraph
- Semantic HTML with ARIA labels
- Mobile-responsive design
- Fast Core Web Vitals

### ✅ Security & Quality
- No external dependencies (security)
- CI workflows with security scanning
- E2E tests for revenue paths
- All secrets and API keys externalized

## Offers

### 1. Rapid Gatekeeper & Security Audit - $999
- 72-hour comprehensive security assessment
- Actionable remediation plan
- Follow-up consultation included
- **CTA**: `data-stripe-link="TODO"` in `/pages/offer/audit.html`

### 2. Gatekeeper Kit Early Access - $49  
- Proven security templates and tools
- Instant download after purchase
- Implementation guides included
- **CTA**: `data-stripe-link="TODO"` in `/pages/offer/kit.html`

## Development

### Local Development
```bash
# Start dev server (serves /pages on :3000)
npm run dev

# Run E2E tests locally
npm test

# Build production assets
npm run build
```

### CI/CD
- **Quality Gates**: actionlint, semgrep, trivy, gitleaks, playwright
- **Security**: Block merge on High/Critical vulnerabilities
- **E2E**: Test revenue paths on every PR
- **Artifacts**: Playwright reports uploaded to artifacts/

### Testing
```bash
# Run E2E tests
npm test

# Run with browser visible
npm run test:headed

# Test specific revenue path
npx playwright test --grep "revenue-path"
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for complete setup instructions including:
- Cloudflare Pages deployment
- Custom domain configuration (www.mmtuentertainment.com)
- DNS settings and apex redirects
- Email routing setup (support@, privacy@)
- SSL/TLS verification

## Email Configuration

### Inbound (Cloudflare Email Routing)
- `support@mmtuentertainment.com` → `mmtuentertainment@gmail.com`
- `privacy@mmtuentertainment.com` → `mmtuentertainment@gmail.com`

### Outbound (Current Setup)
- **From**: `mmtuentertainment@gmail.com` (until domain SMTP configured)
- **Note**: Contact page clearly states replies come from Gmail address

## Performance

- **CSS**: Single file, no external fonts, optimized for fast TTFB
- **HTML**: Semantic, minimal, no JavaScript bloat
- **Images**: None (emoji only for fast load)
- **Fonts**: System fonts only
- **Size**: <50KB total bundle size

## Revenue Path Testing

E2E tests validate:
1. Home page loads with offers visible
2. Offer pages have working CTA buttons
3. CTA buttons link to Stripe (or show TODO markers)
4. Contact page has email links
5. Terms/Privacy pages accessible
6. Navigation works across all pages

## Support

- **General**: support@mmtuentertainment.com
- **Privacy**: privacy@mmtuentertainment.com
- **Notes**: Replies currently from mmtuentertainment@gmail.com

---

**Doctrine**: Prove it, then scale it. Minimal viable site with maximum revenue focus.
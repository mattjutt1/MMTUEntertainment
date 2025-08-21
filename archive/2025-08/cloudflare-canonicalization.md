# Cloudflare Domain Canonicalization Runbook

## Objective
Enforce single canonical domain: `https://www.mmtuentertainment.com`  
Redirect apex domain: `mmtuentertainment.com` → `https://www.mmtuentertainment.com`

## Steps

### 1. Verify Custom Domain Mapping
```
Cloudflare Dashboard → Pages → mmtu-marketing project → Custom domains
✅ Ensure www.mmtuentertainment.com is mapped and active
✅ Verify SSL certificate is active
```

### 2. Create Apex Redirect Rule
```
Cloudflare Dashboard → Rules → Redirect Rules → Create Rule

Name: "Apex to WWW Redirect"
When incoming requests match:
  - Field: Hostname
  - Operator: equals
  - Value: mmtuentertainment.com

Then:
  - Type: Dynamic
  - Expression: concat("https://www.mmtuentertainment.com", http.request.uri.path)
  - Status code: 301 (Permanent Redirect)
  - Preserve query string: Yes
```

### 3. Smoke Tests
Run these commands to verify:

```bash
# Test apex redirect
curl -I http://mmtuentertainment.com/pricing
# Expected: 301 redirect, Location: https://www.mmtuentertainment.com/pricing

# Test canonical domain
curl -I https://www.mmtuentertainment.com/
# Expected: 200 OK

# Test HTTPS redirect
curl -I http://www.mmtuentertainment.com/
# Expected: 301 redirect to https://www.mmtuentertainment.com/
```

### 4. DNS Verification
```
A record: mmtuentertainment.com → Cloudflare Pages IP
CNAME: www.mmtuentertainment.com → mmtu-marketing.pages.dev
```

## Completion Checklist
- [ ] Custom domain www.mmtuentertainment.com mapped to Pages project
- [ ] Redirect rule created for apex domain
- [ ] Smoke tests passing
- [ ] SSL certificate active for both domains
# Deployment Guide - MMTU Entertainment Site

Complete deployment instructions for www.mmtuentertainment.com on Cloudflare Pages with custom domain and email routing.

## Quick Deploy

```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages (requires auth)
npm run deploy
# OR manually:
wrangler pages deploy dist --project-name mmtu-site
```

## Prerequisites

### 1. Cloudflare Account Setup
- Cloudflare account with API access
- `CLOUDFLARE_API_TOKEN` with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` from dashboard

### 2. Environment Variables (CI/CD)
```bash
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

## Custom Domain Configuration

### Scenario A: Domain Already on Cloudflare

If `mmtuentertainment.com` is already managed by Cloudflare DNS:

1. **Add Custom Domain in Pages**:
   - Go to Cloudflare Dashboard → Pages → mmtu-site → Custom domains
   - Add `www.mmtuentertainment.com`
   - Cloudflare auto-creates CNAME: `www` → `mmtu-site.pages.dev`

2. **Set Apex Redirect**:
   - Go to Redirect Rules → Create rule
   - **Rule name**: "Apex to WWW redirect"
   - **When incoming requests match**: 
     - Field: `Hostname` 
     - Operator: `equals` 
     - Value: `mmtuentertainment.com`
   - **Then take action**: 
     - Type: `Dynamic redirect`
     - Expression: `concat("https://www.", http.request.uri.path)`
     - Status code: `301`

3. **Enable HTTPS**:
   - Go to SSL/TLS → Edge Certificates
   - Enable "Automatic HTTPS Rewrites"
   - Enable "Always Use HTTPS"

### Scenario B: Domain NOT on Cloudflare

If domain is with another registrar/DNS provider:

#### Option 1: DNS Only (Keep Current Registrar)
1. **Add CNAME Record**:
   ```
   Type: CNAME
   Name: www
   Value: mmtu-site.pages.dev
   TTL: Auto/300
   ```

2. **Add Apex Redirect** (if supported by DNS provider):
   ```
   Type: ALIAS/ANAME/URL Redirect
   Name: @
   Value: https://www.mmtuentertainment.com
   ```

3. **If apex redirect not supported**: Document manual nameserver transfer

#### Option 2: Transfer to Cloudflare (Recommended)
1. **Add Site to Cloudflare**:
   - Dashboard → Add site → Enter `mmtuentertainment.com`
   - Choose Free plan → Continue

2. **Update Nameservers** at registrar:
   ```
   # Replace registrar nameservers with Cloudflare's:
   NS1: zoe.ns.cloudflare.com
   NS2: tim.ns.cloudflare.com
   # (Exact nameservers provided by Cloudflare)
   ```

3. **Wait for Activation** (up to 24 hours)

4. **Follow Scenario A** steps above

## Email Routing Setup

### Cloudflare Email Routing Configuration

1. **Enable Email Routing**:
   - Go to Email → Email Routing
   - Enable Email Routing for `mmtuentertainment.com`
   - Add MX records (auto-configured if on Cloudflare DNS)

2. **Create Email Forwards**:
   ```
   support@mmtuentertainment.com → mmtuentertainment@gmail.com
   privacy@mmtuentertainment.com → mmtuentertainment@gmail.com
   ```

3. **Verify Destination**:
   - Check `mmtuentertainment@gmail.com` for verification email
   - Click verification link

### Manual DNS Setup (If Not on Cloudflare)
Add these MX records at your DNS provider:
```
Type: MX
Name: @
Value: isaac.mx.cloudflare.net
Priority: 10

Type: MX  
Name: @
Value: linda.mx.cloudflare.net
Priority: 20

Type: MX
Name: @
Value: amir.mx.cloudflare.net  
Priority: 30

Type: TXT
Name: @
Value: v=spf1 include:_spf.mx.cloudflare.net ~all
```

### Outbound Email (Current Setup)
- **Outbound from domain aliases**: Requires SMTP provider or Google Workspace
- **Current solution**: Use `mmtuentertainment@gmail.com` for outbound
- **Contact page note**: "Replies come from mmtuentertainment@gmail.com until domain SMTP is enabled"

## Verification Checklist

After deployment, verify these work:

### Site Functionality
- [ ] `https://www.mmtuentertainment.com` loads (200 OK)
- [ ] `https://mmtuentertainment.com` redirects to www (301)
- [ ] All offer pages load: `/offer/audit`, `/offer/kit`
- [ ] Legal pages accessible: `/terms`, `/privacy` 
- [ ] Contact page loads: `/contact`
- [ ] SSL certificate valid (green lock)

### Purchase Flow
- [ ] Security Audit CTA present with `data-stripe-link="TODO"`
- [ ] Gatekeeper Kit CTA present with `data-stripe-link="TODO"`
- [ ] Calendly placeholder present with `data-calendly-link="TODO"`

### Email Routing
- [ ] Test email to `support@mmtuentertainment.com` arrives at Gmail
- [ ] Test email to `privacy@mmtuentertainment.com` arrives at Gmail
- [ ] mailto: links work from contact page

### Performance
- [ ] First Contentful Paint <2s
- [ ] No external font/library dependencies
- [ ] Total page size <50KB

## Next Steps (After Deployment)

### 1. Add Stripe Payment Links
Replace in these files:
```
pages/offer/audit.html: data-stripe-link="TODO" → actual Stripe URL
pages/offer/kit.html: data-stripe-link="TODO" → actual Stripe URL
```

### 2. Add Calendly Scheduler
Replace in:
```
pages/offer/audit.html: data-calendly-link="TODO" → actual Calendly URL
```

### 3. Set Up Domain SMTP (Optional)
For sending from `support@` and `privacy@` addresses:
- Google Workspace ($6/user/month)
- SendGrid, Mailgun, or similar SMTP service
- Update contact page to remove Gmail note

## Troubleshooting

### Common Issues

**"Domain not found" errors**:
- Verify DNS propagation: `dig www.mmtuentertainment.com`
- Check nameservers: `dig NS mmtuentertainment.com`

**SSL/TLS errors**:
- Wait up to 15 minutes for certificate issuance
- Verify Cloudflare SSL mode is "Full" or "Full (strict)"

**Email routing not working**:
- Verify MX records: `dig MX mmtuentertainment.com`
- Check Cloudflare Email Routing logs
- Confirm Gmail verification completed

**Pages deployment fails**:
- Check Cloudflare API token permissions
- Verify project name matches: `mmtu-site`
- Ensure `dist/` directory exists after build

### Support
- **General**: support@mmtuentertainment.com  
- **Deployment**: Check CI/CD logs in GitHub Actions
- **DNS**: Use tools like `dig` or DNS checkers online

---

**Status**: Ready for deployment with auth credentials
**Primary Domain**: www.mmtuentertainment.com
**Fallback**: mmtu-site.pages.dev (if custom domain fails)
# Cloudflare Pages Preview Deployments

## Current Status
✅ **Single Production Project**: `mmtu-marketing`  
✅ **Domains**: `mmtu-marketing.pages.dev`, `www.mmtuentertainment.com`  
✅ **No duplicate projects found**

## Preview Deployment Configuration

### Enable Preview Deployments
```
Cloudflare Dashboard → Pages → mmtu-marketing → Settings → Builds & deployments
✅ Ensure "Preview deployments" = ON
✅ Branch deployments = ALL branches (or specify pattern)
```

### How Preview URLs Work
- **Production**: `https://www.mmtuentertainment.com` (main branch)
- **Preview**: `https://<commit-hash>.mmtu-marketing.pages.dev` (feature branches)
- **Latest**: `https://mmtu-marketing.pages.dev` (latest deployment)

### Git Workflow with Previews
1. Create feature branch: `git checkout -b feature/new-page`
2. Make changes and push: `git push origin feature/new-page`
3. Cloudflare auto-deploys to preview URL
4. Review changes at preview URL
5. Merge to main for production deployment

### Example Preview URLs
- Feature branch: `https://a1b2c3d4.mmtu-marketing.pages.dev`
- Pull request: `https://pr-123.mmtu-marketing.pages.dev`

This eliminates the need for multiple "staging" sites - every branch gets its own isolated preview environment.
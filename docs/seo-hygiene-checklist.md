# SEO Hygiene Checklist

## Files Created
✅ **robots.txt**: `/public/robots.txt` - Allows all crawlers, points to sitemap  
✅ **sitemap.xml**: `/public/sitemap.xml` - Lists main pages with priorities

## Next Steps for SEO

### 1. Add Canonical Tags
Add to `src/app/layout.tsx` or individual pages:
```tsx
<link rel="canonical" href="https://www.mmtuentertainment.com" />
```

### 2. Google Search Console Setup
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `mmtuentertainment.com` (Domain property)
3. Verify via DNS TXT record in Cloudflare:
   - Type: TXT
   - Name: @
   - Content: `google-site-verification=...` (from GSC)
4. Submit sitemap: `https://www.mmtuentertainment.com/sitemap.xml` (TODO: verify sitemap is accessible)

### 3. Meta Tags Audit
Current status: ✅ Title and description set in layout.tsx
```tsx
title: "MMTU Entertainment"
description: "Professional development tools and services for modern teams"
```

### 4. Structured Data (Future)
Consider adding JSON-LD structured data for:
- Organization schema
- Service offerings
- Contact information

## Current SEO Files
- `public/robots.txt`: Basic crawler permissions
- `public/sitemap.xml`: 5 main pages indexed
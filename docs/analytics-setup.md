# Analytics Configuration

## Cloudflare Web Analytics (Recommended)
✅ **Zero external scripts** - No performance impact  
✅ **Privacy-focused** - No personal data collection  
✅ **Built-in** - Already available in Pages project

### Setup Steps
```
Cloudflare Dashboard → Pages → mmtu-marketing → Analytics → Web Analytics
1. Enable Web Analytics
2. Add beacon to site (automatic for Pages)
3. View real-time data in dashboard
```

### What You Get
- Page views and unique visitors
- Top pages and referrers  
- Country/browser breakdown
- Core Web Vitals metrics
- Zero cookie compliance needed

## Google Analytics 4 (Optional Future Addition)
If needed later, add to `src/app/layout.tsx`:

```tsx
import Script from 'next/script'

// In layout component
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

## Current Status
- **Primary**: Cloudflare Web Analytics (enable in Pages dashboard)
- **Secondary**: GA4 setup available if needed
- **Performance**: Zero-impact analytics preferred
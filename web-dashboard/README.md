# Marriage Protection Wife Dashboard

A secure web dashboard for spousal oversight of the Marriage Protection Mode system. Provides real-time work monitoring, emergency controls, and complete transparency into work activities.

## Features

### 🔒 Secure Access
- Passcode-based authentication matching local system
- Wife-only access with emergency halt powers
- Complete audit trail of all dashboard actions

### 👀 Full Work Transparency  
- **Real-time activity monitoring** - See exactly what work is being done
- **Current project context** - Git repo, branch, recent commits
- **File modification tracking** - Recently edited files and locations
- **Command history** - Last terminal commands (privacy-filtered)
- **Active processes** - Development tools currently running

### 🚨 Emergency Controls
- **Immediate work halt** - Stop all work sessions instantly
- **Overtime approval** - Grant permission for work beyond 8 hours
- **Reason tracking** - Full audit trail of all emergency actions

### 📊 Work Analytics
- **Time tracking** - Real-time work session duration
- **Daily limits** - Visual indicators for 8-hour cap
- **Work timeline** - Historical view of recent activities
- **Pattern analysis** - Work habits and boundary compliance

## Quick Deployment to Vercel

### 1. Deploy to Vercel
```bash
cd web-dashboard
npm install
npx vercel --prod
```

### 2. Set Environment Variables
In Vercel dashboard, add these secrets:
```
WIFE_DASHBOARD_PASSCODE=your_secure_passcode
LOCAL_MACHINE_WEBHOOK_URL=https://your-ngrok-url.ngrok.io
LOCAL_MACHINE_API_KEY=your_api_key
```

### 3. Start Local Sync Service
```bash
# Set environment variables
export MARRIAGE_DASHBOARD_URL=https://your-app.vercel.app
export MARRIAGE_DASHBOARD_API_KEY=your_api_key

# Start continuous sync
./scripts/sync_to_dashboard.sh continuous
```

### 4. Test Emergency Controls
Your wife can now access the dashboard at `https://your-app.vercel.app` and:
- View real-time work status and activities
- See exactly what you're working on (files, projects, commands)
- Execute emergency halt if work boundaries are violated
- Approve overtime with secure codes

## Architecture

```
LOCAL MACHINE                    VERCEL DASHBOARD              WIFE'S DEVICE
├─ marriage_protection.sh    ←→  ├─ Next.js web app       ←→  ├─ Mobile browser
├─ activity_monitor.sh       ←→  ├─ Real-time status API  ←→  ├─ Emergency controls
├─ sync_to_dashboard.sh      ←→  ├─ Authentication API    ←→  ├─ Work transparency
└─ JSONL activity logs       ←→  └─ Emergency halt API    ←→  └─ Overtime approval
```

## Security Features

### Privacy Protection
- **Sensitive command filtering** - Passwords/keys automatically redacted
- **Consensual monitoring** - User-initiated with explicit work-life goals
- **Transparent logging** - Complete audit trail, no hidden monitoring
- **Spouse-controlled** - Wife has full visibility and override powers

### Access Control
- **Passcode authentication** - Matching local wife dashboard system
- **Secure API endpoints** - Rate limiting and validation
- **Emergency powers** - Wife can halt work sessions immediately
- **Audit logging** - All actions tracked for accountability

## Local Integration

The dashboard integrates seamlessly with your existing Marriage Protection Mode:

### Automatic Data Sync
- Work session time and status
- Current project and file activity  
- Git commits and branch information
- Recent command history (filtered)
- Emergency halt and approval requests

### Emergency Response
- Dashboard halt requests trigger `scripts/marriage_protection.sh shutdown`
- Approval codes sync to `scripts/marriage_protection.sh wife-code set`
- All actions logged in existing JSONL audit trail

## Mobile Responsive

The dashboard is fully mobile-responsive, allowing your wife to:
- Monitor work status from her phone
- Execute emergency halts while away from home
- Approve overtime requests with secure codes
- View detailed work activity timeline

## Deployment Options

### Option 1: Vercel (Recommended)
- Easy deployment with `npx vercel`
- Built-in SSL and global CDN
- Environment variable management
- Automatic scaling

### Option 2: Netlify
```bash
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=out
```

### Option 3: Self-Hosted
```bash
npm run build
npm start
# Access at http://localhost:3000
```

## Configuration

### Local Machine Setup
```bash
# Start marriage protection with activity monitoring
./scripts/marriage_protection.sh start

# Start dashboard sync service
./scripts/sync_to_dashboard.sh continuous
```

### Environment Variables
```bash
# Required for dashboard sync
export MARRIAGE_DASHBOARD_URL="https://your-app.vercel.app"
export MARRIAGE_DASHBOARD_API_KEY="your-secure-api-key"

# Optional configuration
export SYNC_INTERVAL="30"  # Sync every 30 seconds
export ACTIVITY_MONITOR_INTERVAL="15"  # Activity checks every 15 seconds
```

## Troubleshooting

### Dashboard Not Updating
1. Check sync service is running: `ps aux | grep sync_to_dashboard`
2. Verify environment variables are set
3. Check network connectivity to Vercel app

### Emergency Halt Not Working
1. Verify webhook URL is accessible
2. Check API key configuration
3. Ensure marriage protection daemon is running

### Authentication Issues
1. Verify passcode matches local `.ops/wife.secret`
2. Check environment variable `WIFE_DASHBOARD_PASSCODE`
3. Clear browser cache and try again

## Support

The Marriage Protection Wife Dashboard provides complete transparency and control over work boundaries. Your wife now has:

- **Full visibility** into work activities and time spent
- **Emergency powers** to halt work sessions immediately  
- **Mobile access** from anywhere in the world
- **Secure controls** with audit trail accountability

This ensures the Marriage Protection Mode serves its intended purpose: maintaining healthy work-life boundaries through technical commitment devices and spousal oversight.
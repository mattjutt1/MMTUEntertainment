# Marriage Protection Dashboard - iPhone Safari Guide

## 📱 Optimized for Your Wife's iPhone

This dashboard is specifically designed for iPhone Safari with mobile-first features:

### 🎯 **Perfect iPhone Experience**

**Native iOS Features**:
- **Add to Home Screen** - Looks and feels like a native app
- **Safe Area Support** - Works perfectly with notches and bottom bars
- **Touch-Optimized** - Large, easy-to-tap buttons (44px minimum)
- **No Zoom Issues** - Text stays readable, no accidental zooming
- **Smooth Scrolling** - Native iOS momentum scrolling
- **Purple Theme** - Beautiful iOS-style design with Marriage Protection branding

### 📲 **How to Install on iPhone**

**Step 1: Deploy to Vercel**
```bash
cd web-dashboard
npm install
npx vercel --prod
# Copy the Vercel URL (e.g., https://marriage-protection-abc123.vercel.app)
```

**Step 2: Set Up on iPhone**
1. Send Vercel URL to your wife's iPhone
2. Open in Safari (must be Safari, not Chrome)
3. Tap the "Share" button (box with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Name it "Marriage Protection" 
6. Tap "Add"

**Step 3: Result**
- Purple app icon appears on home screen
- Opens full-screen like native app
- No Safari browser UI showing
- Instant access to emergency controls

### 🚨 **Emergency Controls - Designed for Quick Access**

**Large Touch Targets**:
```
🛑 Emergency Halt        (Always visible at top)
⚖️  Work-Life Balance    (One tap to stop work)  
👨‍👩‍👧‍👦 Family Time Needed  (Immediate family priority)
💤 Health/Rest Required  (Health-first approach)
✏️  Custom Reason        (Specific situations)
```

**One-Tap Emergency Stop**:
- No confirmation dialogs for main buttons
- Immediate work session termination
- Instant notification to local system
- Complete audit trail logging

### 📊 **Mobile Dashboard Features**

**At-a-Glance Status**:
```
📊 Marriage Protection
Work Time Today: 4h 23m / 8h 0m  
Status: ✅ SAFE (52% of limit)
🟢 Live • Last update: 2:34 PM
```

**Expandable Details**:
- **📝 Work Details** - Tap to see files, commits, commands
- **📈 Recent Activity** - Timeline of work sessions
- **🚨 Emergency Stop Reasons** - Quick access to halt controls

**Real-Time Transparency**:
- Current task from triage system
- Git repository and branch
- Recently modified files
- Last terminal command (privacy-filtered)
- Active development tools

### 📱 **Mobile-Specific Optimizations**

**iOS Safari Features**:
- **Viewport Meta Tags** - Prevents zooming issues
- **Apple Web App** - Full-screen native feel
- **Touch Action** - Prevents scrolling conflicts
- **Safe Area Insets** - Works with notches/home indicators
- **Font Smoothing** - Crystal clear text rendering

**Performance Optimizations**:
- **30-second auto-refresh** - Always shows current status
- **Offline Caching** - Works even with poor connection
- **Fast Loading** - Optimized for mobile networks
- **Battery Efficient** - Minimal CPU usage

### 🔒 **Security & Privacy**

**Same Security as Local System**:
- Passcode authentication matching `.ops/wife.secret`
- All commands privacy-filtered (passwords/keys redacted)
- Complete audit trail of all wife dashboard actions
- Emergency actions logged with timestamps and reasons

**Mobile-Specific Security**:
- App stored in iPhone secure enclave
- Face ID/Touch ID support through Safari
- No data stored locally on device
- All communication encrypted (HTTPS)

### 💕 **Wife User Experience**

**Scenario 1: Quick Check**
- Open app from home screen (1 second)
- See work time: "6h 45m ⚠️ APPROACHING" 
- Close app, continue with day

**Scenario 2: Emergency Stop**
- Notice work session going too long
- Open app → Tap "👨‍👩‍👧‍👦 Family Time Needed"
- Work immediately stops, notification sent
- Audit trail: "Wife emergency halt: Family time needed"

**Scenario 3: Overtime Approval**  
- Husband requests overtime approval
- App shows "🚨 OVERTIME - Approval Needed"
- Tap "✅ Approve Overtime"
- Enter approval code (e.g., "LOVE2024")
- Overtime authorized with full audit trail

### 📋 **Mobile Testing Checklist**

Before giving to wife, verify:
```
✅ App installs properly on home screen
✅ Opens full-screen without Safari UI
✅ Emergency halt buttons work instantly
✅ Status updates in real-time
✅ Passcode authentication works
✅ All text readable without zooming
✅ Buttons large enough for easy tapping
✅ Works in both portrait and landscape
✅ Handles poor network connections
✅ Battery usage is minimal
```

### 🚀 **Quick Setup Commands**

```bash
# 1. Install dependencies
cd web-dashboard && npm install

# 2. Deploy to Vercel
npx vercel --prod

# 3. Set environment variables in Vercel dashboard:
WIFE_DASHBOARD_PASSCODE=your_secure_passcode

# 4. Start local sync service
export MARRIAGE_DASHBOARD_URL=https://your-app.vercel.app
./scripts/sync_to_dashboard.sh continuous

# 5. Send Vercel URL to wife's iPhone
# 6. Have her add to home screen
# 7. Test emergency halt functionality
```

### 📞 **Support & Troubleshooting**

**Common Issues**:
- **App not updating**: Check sync service is running
- **Can't add to home screen**: Must use Safari (not Chrome)
- **Buttons not working**: Check network connection
- **Wrong passcode**: Verify matches local `.ops/wife.secret`

**Emergency Fallback**:
If app fails, wife can always:
- Call/text you directly
- Use backup notification methods
- Physical interruption as last resort

### 💡 **Pro Tips for Wife**

**Daily Usage**:
- Check app 2-3 times during work day
- Use as conversation starter about work-life balance
- Emergency controls are there if needed, but communication first

**Boundary Enforcement**:
- 6+ hours: Start paying attention
- 7+ hours: Have conversation
- 8+ hours: Use emergency controls if needed

**Overtime Requests**:
- Ask why overtime is needed
- Set specific end time
- Approve with meaningful code (dates, special words)

The Marriage Protection Dashboard gives your wife **complete transparency and control** over work boundaries, accessible instantly from her iPhone. This ensures the system serves its true purpose: protecting your marriage through healthy work-life balance enforcement. 💕
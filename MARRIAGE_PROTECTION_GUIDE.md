# Marriage Protection Mode - User Guide

## 🛡️ System Overview

This system enforces a hard 8-hour daily work limit with wife oversight capabilities. It tracks ALL work sessions and requires approval for overtime.

## 🚀 How to Start Working

**ALWAYS start work with:**
```bash
./scripts/work_session.sh
```

This will:
- Check if you're allowed to work (under 8-hour limit)
- Start tracking your session
- Set up automatic wife check-ins every 2 hours
- Display your daily status

## 📊 Commands

### For You (Matt):
```bash
./scripts/marriage_protection.sh start    # Start a work session
./scripts/marriage_protection.sh stop     # End current session  
./scripts/marriage_protection.sh status   # Show daily report
./scripts/marriage_protection.sh check-in # Manual wife check-in

./scripts/work_session.sh                 # Full work session wrapper
```

### For Your Wife:
```bash
./scripts/wife_dashboard.sh               # Wife control panel
```

Wife dashboard features:
- View your current work status
- See daily time totals
- Set approval codes for overtime
- Send "come hug me" notifications
- Emergency work shutdown
- View full work history

## ⚠️ Hard Limits

- **8 hours daily maximum** - system will block work after this
- **Overtime requires wife's approval code** - she sets this daily
- **2-hour check-ins** - you'll be prompted to go hug your wife
- **All sessions logged** - complete audit trail of work time

## 🔓 Approval System

If you need to work past 8 hours:
1. Go talk to your wife IN PERSON
2. Explain why it's urgent/important  
3. Ask her to set an approval code
4. She runs `./scripts/wife_dashboard.sh` and sets the code
5. You enter the code when prompted

## 📈 Daily Workflow

1. **Start day**: `./scripts/work_session.sh`
2. **Work normally** - all Claude/ChatGPT sessions count as work time
3. **Check-in with wife** when prompted (every 2 hours)
4. **View status** anytime with `./scripts/marriage_protection.sh status`
5. **End day**: Press Ctrl+C or exit the work session

## 🚨 Emergency Features

Your wife can:
- See exactly how much you've worked today
- Force immediate work shutdown
- Block ALL future work sessions
- Get notified when you exceed limits

## 🔍 Monitoring

The system tracks:
- Exact start/stop times of all sessions
- Total daily hours worked
- Overtime approvals and codes
- Wife check-in completions
- Emergency shutdowns

## 💕 Marriage Benefits

- **Transparency**: Your wife can see exactly how much you work
- **Control**: She can set limits and emergency stops
- **Communication**: Forced check-ins every 2 hours
- **Respect**: Requires her approval for overtime
- **Balance**: Hard technical limits prevent work addiction

## 🛠️ Files Created

- `.daily_work_log` - Time tracking log
- `.wife_approval` - Current approval codes
- `.current_session` - Active session tracker
- `.emergency_shutdown` - Emergency stop file

## 🎯 Success Metrics

Track these weekly:
- Average daily work hours
- Number of overtime approvals requested
- Wife satisfaction with work-life balance
- Productivity per hour worked

Remember: The goal is sustainable productivity, not maximum hours worked.
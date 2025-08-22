#!/usr/bin/env python3
import json, datetime, pathlib, collections
import os

def main():
    log_path = pathlib.Path("front-desk/log.jsonl")
    if not log_path.exists():
        print("No log file found")
        return
    
    # Calculate week boundaries
    today = datetime.date.today()
    week_num = today.isocalendar().week
    week_start = today - datetime.timedelta(days=7)
    week_start_str = week_start.strftime("%Y-%m-%d")
    
    # Parse log entries
    by_type = collections.Counter()
    by_status = collections.Counter()
    new_ids = []
    missed_days = []
    
    lines = log_path.read_text().splitlines()
    for line in lines:
        if not line.strip():
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
            
        # Filter to this week
        entry_date = rec.get("ts", "")[:10]  # YYYY-MM-DD part
        if entry_date >= week_start_str:
            by_type[rec.get("type", "unknown")] += 1
            by_status[rec.get("status", "unknown")] += 1
            if rec.get("type") == "triage":
                new_ids.append(rec.get("id", "unknown"))
            elif rec.get("type") == "missed":
                missed_days.append(entry_date)
    
    # Generate report
    reports_dir = pathlib.Path("reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    report_file = reports_dir / f"week-{week_num:02d}.md"
    
    with open(report_file, "w") as f:
        f.write(f"# Front Desk – Weekly Summary (Week {week_num})\n\n")
        f.write(f"**Period:** {week_start_str} to {today.strftime('%Y-%m-%d')}\n")
        f.write(f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Counts by Type\n\n")
        if by_type:
            for event_type, count in by_type.most_common():
                f.write(f"- **{event_type}**: {count}\n")
        else:
            f.write("- No events this week\n")
        
        f.write("\n## Counts by Status\n\n")
        if by_status:
            for status, count in by_status.most_common():
                f.write(f"- **{status}**: {count}\n")
        else:
            f.write("- No status data\n")
        
        f.write(f"\n## New Triage Items\n\n")
        if new_ids:
            f.write(f"**Total:** {len(new_ids)} items\n\n")
            for tid in new_ids:
                f.write(f"- {tid}\n")
        else:
            f.write("- No new items triaged\n")
        
        if missed_days:
            f.write(f"\n## Missed Days\n\n")
            for day in missed_days:
                f.write(f"- {day}\n")
        
        f.write(f"\n## Summary\n\n")
        total_events = sum(by_type.values())
        triage_events = by_type.get("triage", 0)
        f.write(f"- **Total events:** {total_events}\n")
        f.write(f"- **Triage rate:** {(triage_events/total_events*100):.1f}%" if total_events > 0 else "- **Triage rate:** 0%")
        f.write(f"\n- **Active days:** {7 - len(missed_days)}/7\n")
        
        if total_events >= 10 and len(missed_days) <= 2:
            f.write("\n✅ **Week Goal Met:** ≥10 events, ≤2 missed days\n")
        else:
            f.write(f"\n❌ **Week Goal Missed:** Need ≥10 events (have {total_events}), ≤2 missed days (have {len(missed_days)})\n")
    
    print(f"Weekly report written: {report_file}")
    print(f"Total events: {sum(by_type.values())}, New items: {len(new_ids)}")

if __name__ == "__main__":
    main()
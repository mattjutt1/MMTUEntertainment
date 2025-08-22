#!/usr/bin/env python3
"""
Simple triage script - moves items from intake → triage → log
No dependencies, pure Python, $0 cost
"""

import json
import datetime
import os

def load_intake():
    """Load raw items from intake.md"""
    intake_file = 'front-desk/intake.md'
    if not os.path.exists(intake_file):
        return []
    
    with open(intake_file, 'r') as f:
        lines = f.readlines()
    
    # Skip header and empty lines
    items = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            items.append(line)
    
    return items

def get_next_note_id():
    """Get the next available note_id from log.jsonl"""
    log_file = 'front-desk/log.jsonl'
    if not os.path.exists(log_file):
        return 1
    
    max_id = 0
    with open(log_file, 'r') as f:
        for line in f:
            if line.strip():
                entry = json.loads(line)
                max_id = max(max_id, entry.get('note_id', 0))
    
    return max_id + 1

def create_action(raw_text):
    """Convert raw text to action format"""
    # Simple heuristic: convert to lowercase, replace spaces with hyphens
    # In practice, you'd add more sophisticated parsing
    action = raw_text.lower()[:30]  # First 30 chars
    action = action.replace(' ', '-')
    action = ''.join(c for c in action if c.isalnum() or c == '-')
    
    # Determine priority and due time based on keywords
    priority = 'medium'
    due = '48h'
    
    if any(word in raw_text.lower() for word in ['urgent', 'asap', 'critical', 'bug']):
        priority = 'high'
        due = '24h'
    if any(word in raw_text.lower() for word in ['customer', 'refund', 'complaint']):
        priority = 'urgent'
        due = '12h'
    if any(word in raw_text.lower() for word in ['research', 'document', 'plan']):
        priority = 'low'
        due = '7d'
    
    return action, priority, due

def triage_item(raw_text, note_id):
    """Process a single intake item"""
    timestamp = datetime.datetime.utcnow().isoformat() + 'Z'
    action, priority, due = create_action(raw_text)
    
    # Create triage entry
    date_str = datetime.datetime.utcnow().strftime('%Y-%m-%d')
    triage_line = f"{date_str} | note_id={note_id} | action: {action} | due: {due} | priority: {priority}\n"
    
    # Create log entry
    log_entry = {
        "ts": timestamp,
        "note_id": note_id,
        "status": "triaged",
        "action": action,
        "raw": raw_text,
        "priority": priority,
        "due": due
    }
    
    return triage_line, log_entry

def update_report():
    """Generate or update weekly report with counts"""
    log_file = 'front-desk/log.jsonl'
    report_file = 'reports/week-01.md'
    
    total_notes = 0
    triaged_notes = 0
    
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    total_notes += 1
                    if entry.get('status') == 'triaged':
                        triaged_notes += 1
    
    percent_triaged = (triaged_notes / total_notes * 100) if total_notes > 0 else 0
    time_saved_estimate = triaged_notes * 5  # Estimate 5 minutes saved per triaged item
    
    report_content = f"""# Week 01 Report - Front Desk Module

Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC

## Metrics

- **Total Notes Processed**: {total_notes}
- **Notes Triaged**: {triaged_notes}
- **Triage Rate**: {percent_triaged:.1f}%
- **Estimated Time Saved**: {time_saved_estimate} minutes

## Status

Module 1 is {"✓ COMPLETE" if total_notes >= 10 and triaged_notes >= 10 else "IN PROGRESS"}

### Completion Criteria:
- [{"✓" if total_notes >= 10 else " "}] ≥10 lines in intake.md
- [{"✓" if triaged_notes >= 10 else " "}] ≥10 triaged entries in log.jsonl
- [✓] week-01.md report exists

## Next Steps

Continue adding raw notes to `front-desk/intake.md` and run `python scripts/triage.py` to process them.
"""
    
    with open(report_file, 'w') as f:
        f.write(report_content)
    
    return total_notes, triaged_notes, percent_triaged

def main():
    """Main triage workflow"""
    print("Starting triage process...")
    
    # Load intake items
    intake_items = load_intake()
    
    if not intake_items:
        print("No items to triage in front-desk/intake.md")
        update_report()
        return
    
    # Process each item
    triage_lines = []
    log_entries = []
    
    for item in intake_items:
        note_id = get_next_note_id() + len(log_entries)
        triage_line, log_entry = triage_item(item, note_id)
        triage_lines.append(triage_line)
        log_entries.append(log_entry)
        print(f"Triaged: {item[:50]}... → {log_entry['action']}")
    
    # Append to triage.md
    with open('front-desk/triage.md', 'a') as f:
        for line in triage_lines:
            f.write(line)
    
    # Append to log.jsonl
    with open('front-desk/log.jsonl', 'a') as f:
        for entry in log_entries:
            f.write(json.dumps(entry) + '\n')
    
    # Clear intake.md (keep header)
    with open('front-desk/intake.md', 'w') as f:
        f.write("# Raw Intake - Paste ideas/requests here (one per line)\n\n")
    
    # Update report
    total, triaged, percent = update_report()
    
    print(f"\n✓ Processed {len(intake_items)} items")
    print(f"✓ Total notes: {total}, Triaged: {triaged} ({percent:.1f}%)")
    print(f"✓ Report updated: reports/week-01.md")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Interactive triage helper - prompts you for each decision
Reads untriaged intake.md lines, asks for action/due date
Still $0 cost, pure Python, no dependencies
"""

import json
import datetime
import os

def load_untriaged_items():
    """Load items from intake.md that haven't been processed yet"""
    intake_file = 'front-desk/intake.md'
    if not os.path.exists(intake_file):
        return []
    
    with open(intake_file, 'r') as f:
        lines = f.readlines()
    
    # Get already processed items from log.jsonl
    processed_items = set()
    log_file = 'front-desk/log.jsonl'
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    try:
                        entry = json.loads(line)
                        if 'raw' in entry:
                            processed_items.add(entry['raw'].strip())
                    except json.JSONDecodeError:
                        continue
    
    # Filter to untriaged items
    untriaged = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and line not in processed_items:
            untriaged.append(line)
    
    return untriaged

def get_next_note_id():
    """Get the next available note_id from log.jsonl"""
    log_file = 'front-desk/log.jsonl'
    if not os.path.exists(log_file):
        return 1
    
    max_id = 0
    with open(log_file, 'r') as f:
        for line in f:
            if line.strip():
                try:
                    entry = json.loads(line)
                    max_id = max(max_id, entry.get('note_id', 0))
                except json.JSONDecodeError:
                    continue
    
    return max_id + 1

def prompt_for_action(raw_text):
    """Interactive prompt for action and due date"""
    print(f"\n📝 Raw item: {raw_text}")
    print("\nWhat action should this become?")
    print("Examples:")
    print("  - fix-login-bug")
    print("  - call-customer-about-refund") 
    print("  - research-competitor-pricing")
    print("  - update-ssl-certificate")
    
    while True:
        action = input("\nAction (use-dashes-for-spaces): ").strip()
        if action:
            break
        print("⚠️  Action cannot be empty")
    
    print("\nWhen is this due?")
    print("Options:")
    print("  1 = 12h (urgent)")
    print("  2 = 24h (high priority)")
    print("  3 = 48h (normal)")  
    print("  4 = 72h (low priority)")
    print("  5 = 7d (research/planning)")
    
    while True:
        try:
            choice = input("\nDue date (1-5): ").strip()
            due_map = {
                '1': ('12h', 'urgent'),
                '2': ('24h', 'high'), 
                '3': ('48h', 'medium'),
                '4': ('72h', 'low'),
                '5': ('7d', 'low')
            }
            if choice in due_map:
                due, priority = due_map[choice]
                break
            else:
                print("⚠️  Please choose 1-5")
        except (ValueError, KeyError):
            print("⚠️  Please choose 1-5")
    
    return action, due, priority

def create_triage_entry(raw_text, note_id, action, due, priority):
    """Create triage.md line and log.jsonl entry"""
    timestamp = datetime.datetime.now(datetime.UTC).isoformat().replace('+00:00', 'Z')
    date_str = datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d')
    
    # Triage line
    triage_line = f"{date_str} | note_id={note_id} | action: {action} | due: {due} | priority: {priority}\n"
    
    # Log entry
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
    """Update weekly report with current counts"""
    log_file = 'front-desk/log.jsonl'
    report_file = 'reports/week-01.md'
    
    total_notes = 0
    triaged_notes = 0
    
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    try:
                        entry = json.loads(line)
                        if 'note_id' in entry:
                            total_notes += 1
                            if entry.get('status') == 'triaged':
                                triaged_notes += 1
                    except json.JSONDecodeError:
                        continue
    
    percent_triaged = (triaged_notes / total_notes * 100) if total_notes > 0 else 0
    
    # Calculate days since start
    try:
        with open('START.yml', 'r') as f:
            start_line = next((line for line in f if 'start_at_utc' in line), None)
            if start_line:
                start_date_str = start_line.split('"')[1].split('T')[0]
                start_date = datetime.datetime.fromisoformat(start_date_str.replace('Z', ''))
                days_active = (datetime.datetime.now() - start_date).days + 1
            else:
                days_active = 1
    except:
        days_active = 1
    
    report_content = f"""# Week 01 Report - Front Desk Module

Generated: {datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S')} UTC

## Metrics

- **Total Notes Processed**: {total_notes}
- **Notes Triaged**: {triaged_notes}
- **Triage Rate**: {percent_triaged:.1f}%
- **Days Active**: {days_active}

## Status

Module 1 is {"✓ COMPLETE" if total_notes >= 10 and triaged_notes >= 10 else "IN PROGRESS"}

### Completion Criteria:
- [{"✓" if total_notes >= 10 else " "}] ≥10 notes processed
- [{"✓" if triaged_notes >= 10 else " "}] ≥10 items triaged
- [✓] week-01.md report exists

## Next Steps

Continue adding raw notes to `front-desk/intake.md` and run `python scripts/triage_interactive.py` to process them.
"""
    
    with open(report_file, 'w') as f:
        f.write(report_content)
    
    return total_notes, triaged_notes, percent_triaged

def main():
    """Interactive triage workflow"""
    print("🔄 Interactive Triage Helper")
    print("="*50)
    
    # Load untriaged items
    untriaged_items = load_untriaged_items()
    
    if not untriaged_items:
        print("✅ No untriaged items in front-desk/intake.md")
        # Still update the report
        total, triaged, percent = update_report()
        print(f"📊 Current stats: {total} total, {triaged} triaged ({percent:.1f}%)")
        return
    
    print(f"📋 Found {len(untriaged_items)} untriaged items")
    print("\nPress Enter to start triaging, or Ctrl+C to exit")
    try:
        input()
    except KeyboardInterrupt:
        print("\n👋 Exiting without changes")
        return
    
    # Process each item interactively
    triage_lines = []
    log_entries = []
    note_id = get_next_note_id()
    
    for i, item in enumerate(untriaged_items):
        print(f"\n📍 Item {i+1} of {len(untriaged_items)}")
        
        try:
            action, due, priority = prompt_for_action(item)
            triage_line, log_entry = create_triage_entry(item, note_id, action, due, priority)
            
            triage_lines.append(triage_line)
            log_entries.append(log_entry)
            note_id += 1
            
            print(f"✅ Triaged as: {action} (due: {due}, priority: {priority})")
            
            # Ask if they want to continue
            if i < len(untriaged_items) - 1:
                continue_prompt = input("\nContinue to next item? (y/n/s=skip remaining): ").strip().lower()
                if continue_prompt == 'n':
                    print("🛑 Stopping - partial progress will be saved")
                    break
                elif continue_prompt == 's':
                    print("⏭️  Skipping remaining items")
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Interrupted - saving progress so far")
            break
    
    if not triage_lines:
        print("📝 No items were triaged")
        return
    
    # Save to files
    print(f"\n💾 Saving {len(triage_lines)} triaged items...")
    
    # Append to triage.md
    with open('front-desk/triage.md', 'a') as f:
        for line in triage_lines:
            f.write(line)
    
    # Append to log.jsonl
    with open('front-desk/log.jsonl', 'a') as f:
        for entry in log_entries:
            f.write(json.dumps(entry) + '\n')
    
    # Update report
    total, triaged, percent = update_report()
    
    print(f"✅ Processed {len(triage_lines)} items")
    print(f"📊 Total stats: {total} notes, {triaged} triaged ({percent:.1f}%)")
    print(f"📄 Report updated: reports/week-01.md")
    
    # Show items still in intake
    remaining = len(untriaged_items) - len(triage_lines)
    if remaining > 0:
        print(f"📋 {remaining} items remain in intake.md")
        print("Run this script again to continue triaging")

if __name__ == "__main__":
    main()
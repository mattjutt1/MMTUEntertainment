#!/usr/bin/env python3
import sys, re, json, datetime, pathlib, hashlib, os

def canon(obj):
    # exclude the 'hash' field from the digest
    return json.dumps({k:v for k,v in obj.items() if k != "hash"},
                      sort_keys=True, separators=(",", ":")).encode("utf-8")

def digest(obj):
    return hashlib.sha256(canon(obj)).hexdigest()

def append_atomic(path, data):
    """Atomically append to file"""
    with open(path, "ab") as f:
        f.write(data + b"\n")

def load_last_hash(log):
    """Get the most recent hash from the log"""
    if not log.exists():
        return ""
    
    # Read backwards through the file to find last triage entry
    with open(log, "rb") as f:
        # Go to end of file
        f.seek(0, 2)
        position = f.tell()
        line = ""
        
        while position >= 0:
            f.seek(position)
            next_char = f.read(1)
            if next_char == b"\n":
                try:
                    entry = json.loads(line)
                    # Skip marriage protection events, find last triage entry
                    if entry.get("type") == "triage" and "hash" in entry:
                        return entry["hash"]
                except:
                    pass
                line = ""
            else:
                line = next_char.decode("utf-8", errors="ignore") + line
            position -= 1
    
    return ""

def main():
    if len(sys.argv) < 4:
        print("Usage: triage.py intake.md triage.md log.jsonl [--from-logs]")
        return
    
    intake, triage, log = map(pathlib.Path, sys.argv[1:4])
    from_logs = "--from-logs" in sys.argv
    
    if from_logs:
        process_from_logs(log, triage)
        return
    
    # 1) load current max ID
    maxid = 0
    if triage.exists():
        for line in triage.read_text().splitlines():
            m = re.match(r"\|\s*(T-(\d{4}))\s*\|", line)
            if m: maxid = max(maxid, int(m.group(2)))

    # 2) read unchecked bullets from intake
    if not intake.exists():
        print(f"No intake file found: {intake}")
        return
    
    raw = intake.read_text().splitlines()
    new_items = [l.strip("- [ ]").strip() for l in raw if l.startswith("- [ ]")]

    # 3) append to triage table if missing
    rows = []
    if triage.exists():
        rows = [l for l in triage.read_text().splitlines() if l.strip()]
    
    header = "| id | title | status | due | tag |\n|---|---|---|---|---|"
    if not rows or not rows[0].startswith("| id |"):
        rows = [header]

    added = []
    prev_hash = load_last_hash(log)
    
    for note in new_items[:10]:  # cap per run
        maxid += 1
        tid = f"T-{maxid:04d}"
        row = f"| {tid} | {note} | open |  | general |"
        rows.append(row)
        
        # Create entry with hash chain
        ts = datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z"
        entry = {
            "id": tid,
            "note": note,
            "status": "open",
            "src": "intake", 
            "ts": ts,
            "type": "triage",
            "prev_hash": prev_hash,
        }
        
        # Calculate and add hash
        entry["hash"] = digest(entry)
        added.append(entry)
        prev_hash = entry["hash"]

    triage.write_text("\n".join(rows) + "\n")

    # 4) log events with hash chain
    for entry in added:
        line_bytes = json.dumps(entry, sort_keys=True, separators=(",", ":")).encode("utf-8")
        append_atomic(str(log), line_bytes)
        
        prev_hash = entry["hash"]
    
    print(f"triaged: {len(added)}")

def process_from_logs(log, triage):
    """Process marriage protection work sessions from logs to create triage entries"""
    if not log.exists():
        print("No log file found")
        return
    
    # Read existing triage entries to find max ID
    maxid = 0
    if triage.exists():
        for line in triage.read_text().splitlines():
            m = re.match(r"\|\s*(T-(\d{4}))\s*\|", line)
            if m: maxid = max(maxid, int(m.group(2)))
    
    # Extract work sessions from marriage protection logs
    work_sessions = []
    session_start = None
    
    with open(log, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('{"_comment'):
                continue
                
            try:
                entry = json.loads(line)
                if entry.get("module") == "marriage_protection":
                    action = entry.get("action", "")
                    timestamp = entry.get("timestamp", "")
                    
                    if action == "daemon_started":
                        session_start = timestamp
                    elif action == "daemon_stopped" and session_start:
                        # Calculate session duration (simplified)
                        duration_min = 5  # Placeholder - could calculate from timestamps
                        work_sessions.append({
                            "start": session_start,
                            "end": timestamp,
                            "duration": f"{duration_min}min",
                            "note": f"Work session {session_start[:10]} ({duration_min}min)"
                        })
                        session_start = None
                        
            except json.JSONDecodeError:
                continue
    
    # Convert unassociated work sessions to triage entries
    if not work_sessions:
        print("No unassociated work sessions found")
        return
    
    # Read existing triage rows
    rows = []
    if triage.exists():
        rows = [l for l in triage.read_text().splitlines() if l.strip()]
    
    header = "| id | title | status | due | tag |"
    if not rows or not rows[0].startswith("| id |"):
        rows = [header, "|---|---|---|---|---|"]
    
    added = []
    prev_hash = load_last_hash(pathlib.Path(log))
    
    for session in work_sessions[:5]:  # Limit to avoid spam
        maxid += 1
        tid = f"T-{maxid:04d}"
        note = f"Document work session: {session['note']}"
        row = f"| {tid} | {note} | open |  | sessions |"
        rows.append(row)
        
        # Create triage entry
        ts = datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z"
        entry = {
            "id": tid,
            "note": note,
            "status": "open", 
            "src": "marriage_logs",
            "ts": ts,
            "type": "triage",
            "prev_hash": prev_hash,
        }
        
        entry["hash"] = digest(entry)
        added.append(entry)
        prev_hash = entry["hash"]
    
    # Write updated triage table
    triage.write_text("\n".join(rows) + "\n")
    
    # Append to log with hash chain
    for entry in added:
        line_bytes = json.dumps(entry, sort_keys=True, separators=(",", ":")).encode("utf-8")
        append_atomic(str(log), line_bytes)
        
    print(f"Created {len(added)} triage entries from work sessions")

if __name__ == "__main__":
    main()
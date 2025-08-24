#!/usr/bin/env python3
import sys, re, json, datetime, pathlib, hashlib, os

def canon(obj):
    # exclude the 'hash' field from the digest
    return json.dumps({k:v for k,v in obj.items() if k != "hash"},
                      sort_keys=True, separators=(",", ":")).encode("utf-8")

def digest(obj):
    return hashlib.sha256(canon(obj)).hexdigest()

def last_hash(path):
    if not os.path.exists(path):
        return ""
    prev = ""
    with open(path, "rb") as f:
        for line in f:
            if line.strip():
                try:
                    entry = json.loads(line)
                    if "hash" in entry:
                        prev = entry["hash"]
                except Exception:
                    pass
    return prev

def append_atomic(path, line_bytes):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "ab") as f:
        f.write(line_bytes + b"\n")
        f.flush()
        os.fsync(f.fileno())

def process_from_logs(log_path):
    """Process unassociated work bursts from marriage protection logs"""
    if not os.path.exists(log_path):
        return []
    
    work_sessions = []
    with open(log_path, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('{"_comment"'):
                try:
                    entry = json.loads(line)
                    if (entry.get("module") == "marriage_protection" and 
                        entry.get("action") in ["daemon_started", "daemon_stopped"] and
                        entry.get("task_ref") is None):
                        work_sessions.append(f"work session {entry.get('timestamp', '')[:10]} - {entry.get('seconds_today', 0)/3600:.1f}h")
                except json.JSONDecodeError:
                    continue
    
    return work_sessions

def main():
    # Check for --from-logs flag
    from_logs = False
    args = sys.argv[1:]
    if "--from-logs" in args:
        from_logs = True
        args.remove("--from-logs")
    
    if len(args) != 3:
        print("Usage: triage.py [--from-logs] intake.md triage.md log.jsonl")
        sys.exit(1)
    
    intake, triage, log = map(pathlib.Path, args)

    # 1) load current max ID
    maxid = 0
    if triage.exists():
        for line in triage.read_text().splitlines():
            m = re.match(r"\|\s*(T-(\d{4}))\s*\|", line)
            if m: maxid = max(maxid, int(m.group(2)))

    # 2) read unchecked bullets from intake
    if not intake.exists():
        print("triaged: 0 (no intake file)")
        return
    
    raw = intake.read_text().splitlines()
    new_items = [l.strip("- [ ]").strip() for l in raw if l.startswith("- [ ]")]

    # Add work sessions from logs if requested
    if from_logs:
        work_sessions = process_from_logs(str(log))
        new_items.extend(work_sessions)

    if not new_items:
        print("triaged: 0 (no unchecked items)")
        return

    # 3) append to triage table if missing
    rows = []
    if triage.exists():
        rows = [l for l in triage.read_text().splitlines() if l.strip()]
    header = "| id | title | status | due | tag |\n|---|---|---|---|---|"
    if not rows or not rows[0].startswith("| id |"):
        rows = [header]

    added = []
    for note in new_items[:10]:  # cap per run
        maxid += 1
        tid = f"T-{maxid:04d}"
        row = f"| {tid} | {note} | open |  | general |"
        rows.append(row)
        added.append({"id": tid, "note": note})

    triage.write_text("\n".join(rows) + "\n")

    # 4) log events with hash chaining
    prev_hash = last_hash(str(log))
    ts = datetime.datetime.utcnow().isoformat(timespec="seconds")+"Z"
    
    for a in added:
        entry = {
            "ts": ts,
            "type": "triage",
            "id": a["id"],
            "status": "open",
            "src": "intake",
            "note": a["note"],
            "prev_hash": prev_hash
        }
        entry["hash"] = digest(entry)
        
        line_bytes = json.dumps(entry, sort_keys=True, separators=(",", ":")).encode("utf-8")
        append_atomic(str(log), line_bytes)
        
        prev_hash = entry["hash"]
    
    print(f"triaged: {len(added)}")

if __name__ == "__main__":
    main()
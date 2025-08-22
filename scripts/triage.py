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

def main():
    if len(sys.argv) != 4:
        print("Usage: triage.py intake.md triage.md log.jsonl")
        sys.exit(1)
    
    intake, triage, log = map(pathlib.Path, sys.argv[1:4])

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
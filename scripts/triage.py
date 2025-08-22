#!/usr/bin/env python3
import sys, re, json, datetime, pathlib
intake, triage, log = map(pathlib.Path, sys.argv[1:4])

# 1) load current max ID
maxid = 0
if triage.exists():
    for line in triage.read_text().splitlines():
        m = re.match(r"\|\s*(T-(\d{4}))\s*\|", line)
        if m: maxid = max(maxid, int(m.group(2)))

# 2) read unchecked bullets from intake
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
for note in new_items[:10]:  # cap per run
    maxid += 1
    tid = f"T-{maxid:04d}"
    row = f"| {tid} | {note} | open |  | general |"
    rows.append(row)
    added.append({"id": tid, "note": note})

triage.write_text("\n".join(rows) + "\n")

# 4) log events
ts = datetime.datetime.utcnow().isoformat(timespec="seconds")+"Z"
with log.open("a") as f:
    for a in added:
        f.write(json.dumps({"ts": ts, "type":"triage", "id": a["id"], "status":"open","src":"intake","note":a["note"]})+"\n")
print(f"triaged: {len(added)}")

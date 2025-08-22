#!/usr/bin/env python3
import hashlib, json, sys, os

def canon(obj):
    # exclude the 'hash' field from the digest
    return json.dumps({k:v for k,v in obj.items() if k != "hash"},
                      sort_keys=True, separators=(",", ":")).encode("utf-8")

def digest(obj):
    return hashlib.sha256(canon(obj)).hexdigest()

def main(path):
    if not os.path.exists(path):
        print(f"OK 0 entries (no file): {path}")
        return 0
    prev = None
    n = 0
    with open(path, "rb") as f:
        for i, raw in enumerate(f, start=1):
            line = raw.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except Exception as e:
                print(f"ERROR line {i}: not JSON ({e})"); return 1
            if "hash" not in entry or "prev_hash" not in entry:
                print(f"ERROR line {i}: missing hash/prev_hash"); return 1
            if entry.get("prev_hash") != (prev or ""):
                exp = prev or ""
                print(f"ERROR line {i}: prev_hash mismatch (have {entry.get('prev_hash')}, expected {exp})")
                return 1
            h = digest(entry)
            if entry["hash"] != h:
                print(f"ERROR line {i}: hash mismatch (have {entry['hash']}, expected {h})")
                return 1
            prev = entry["hash"]
            n += 1
    print(f"OK {n} entries: chain verified")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "front-desk/log.jsonl"))
#!/usr/bin/env python3
import json, sys, argparse
DEFAULTS = {
  "min_active_streams": 3,
  "min_evidence_tier_to_scale": 2,
  "thresholds": {
    "retention_w4_scale": 0.20,
    "retention_w4_kill": 0.10,
    "gross_margin_scale": 0.60,
    "ltv_cac_scale_min": 3.0,
    "smoke_conv_min": 0.05
  }
}

def load(p): return json.load(open(p,"r",encoding="utf-8"))
def get_cfg(path):
    cfg = DEFAULTS.copy()
    if path and hasattr(path, "__call__") == False:
        u = json.load(open(path,"r",encoding="utf-8"))
        for k, v in u.items():
            cfg[k] = {**cfg.get(k, {}), **v} if k in cfg and isinstance(v, dict) else v
    return cfg

def decide(exp, cfg, baseline):
    notes = []; t = cfg["thresholds"]
    adop = float(exp.get("adoption", 0)); w4 = float(exp.get("retention_w4", 0))
    gm = float(exp.get("gross_margin", 0)); ltv = float(exp.get("ltv_cac", 0))
    smoke = float(exp.get("smoke_conv", 1)); cycles = int(exp.get("cycles_failed",0))
    breakeven = bool(exp.get("cac_breakeven", False))
    if smoke < t["smoke_conv_min"] and cycles >= 1:
        notes.append("Kill: smoke conv < minimum")
        return "kill", notes
    if adop < 0.10 and cycles >= 2:
        notes.append("Kill: adoption <10% for ≥2 cycles")
        return "kill", notes
    if not breakeven and cycles >= 2:
        notes.append("Kill: CAC not breakeven")
        return "kill", notes
    if w4 < t["retention_w4_kill"]:
        notes.append("Kill: W4 retention below kill threshold")
        return "kill", notes
    scale_ready = True
    if w4 < t["retention_w4_scale"]:
        scale_ready = False; notes.append("W4 retention below scale gate")
    if gm < t["gross_margin_scale"]:
        scale_ready = False; notes.append("Gross margin below scale gate")
    if ltv < t["ltv_cac_scale_min"]:
        scale_ready = False; notes.append("LTV/CAC below scale gate")
    if scale_ready and breakeven:
        notes.append("Scale OK: All gates passed")
        return "scale", notes
    notes.append("Continue: refine hypothesis")
    return "continue", notes

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--metrics", required=True)
    parser.add_argument("--config", required=False)
    args = parser.parse_args()
    cfg = get_cfg(args.config)
    d = load(args.metrics)
    ok = True
    print("== Pivot Rules Enforcement ==")
    active = int(d.get("active_streams", 0))
    print(f"Active streams: {active} (min {cfg[min_active_streams]})")
    if active < cfg["min_active_streams"]:
        print("  -> FAIL: too few streams"); ok = False
    for exp in d.get("experiments", []):
        name = exp.get("name", "unnamed")
        decision, notes = decide(exp, cfg, d.get("arpu_baseline"))
        print(f"[{name}] -> {decision.upper()}")
        for note in notes:
            print("  -", note)
        if decision == "kill":
            ok = False
    print("RESULT:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)

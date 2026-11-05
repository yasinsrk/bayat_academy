#!/usr/bin/env python3
"""Usage: python3 incident_report.py [path/to/monitor.jsonl]"""
import json, sys
from pathlib import Path

def main(path):
    p = Path(path)
    if not p.exists():
        print(f"Not found: {p}"); return
    alerts, errors, shutdowns, last_health = [], [], [], None
    with open(p, encoding="utf-8") as f:
        for line in f:
            try:
                e = json.loads(line)
            except json.JSONDecodeError:
                continue
            t = e.get("type", "")
            if t == "alert":
                alerts.append(e)
            elif t in ("monitor_error", "monitor_start", "monitor_shutdown"):
                errors.append(e) if t == "monitor_error" else shutdowns.append(e)
            elif t == "health_check":
                last_health = e
    print(f"=== {p.name} ===")
    print(f"Last health check: {last_health}")
    print(f"\nShutdowns/starts ({len(shutdowns)}):")
    for s in shutdowns[-5:]: print(" ", s)
    print(f"\nErrors ({len(errors)}):")
    for e in errors[-10:]: print(" ", e)
    print(f"\nAlerts ({len(alerts)}):")
    for a in alerts[-20:]: print(" ", a)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "logs/monitor.jsonl")
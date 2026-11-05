import subprocess, json

def collect_kernel_events(since_minutes=10):
    events = []
    try:
        result = subprocess.run(
            ["journalctl", "-k", "--since", f"{since_minutes} minutes ago", "-o", "json", "--no-pager"],
            capture_output=True, text=True, timeout=20
        )
        for line in result.stdout.splitlines():
            try:
                entry = json.loads(line)
                msg = entry.get("MESSAGE", "")
                if any(k in msg.lower() for k in ["oom", "out of memory", "killed process", "kernel panic", "error"]):
                    events.append({
                        "message": msg,
                        "timestamp": entry.get("__REALTIME_TIMESTAMP"),
                    })
            except json.JSONDecodeError:
                continue
    except Exception as e:
        events.append({"error": str(e)})
    return {"type": "kernel_events", "events": events[:50]}
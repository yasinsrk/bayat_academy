import subprocess, re
from collections import Counter
from datetime import datetime, timezone

def collect_ssh_failures(window_minutes: int = 5):
    try:
        since = f"{window_minutes} minutes ago"
        result = subprocess.run(
            ["journalctl", "-u", "ssh", "-u", "sshd", "--since", since, "--no-pager"],
            capture_output=True, text=True, timeout=15
        )
        failures = []
        for line in result.stdout.splitlines():
            m = re.search(r"Failed password for (\S+) from ([\d.]+)", line)
            if m:
                failures.append({"user": m.group(1), "ip": m.group(2)})
        ip_counts = Counter(f["ip"] for f in failures)
        return {
            "type": "ssh_security",
            "failed_count": len(failures),
            "top_source_ips": ip_counts.most_common(5),
            "window_minutes": window_minutes,
        }
    except Exception as e:
        return {"type": "ssh_security", "error": str(e)}
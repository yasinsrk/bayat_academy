import psutil
from pathlib import Path

def collect_disk():
    alerts_paths = ["/", "/var/lib/docker", "/var/log"]
    data = []
    for p in alerts_paths:
        try:
            usage = psutil.disk_usage(p)
            data.append({
                "type": "disk",
                "path": p,
                "percent": usage.percent,
                "used_gb": round(usage.used / 1024**3, 2),
                "total_gb": round(usage.total / 1024**3, 2),
            })
        except FileNotFoundError:
            continue
    return {"type": "disk_summary", "volumes": data}
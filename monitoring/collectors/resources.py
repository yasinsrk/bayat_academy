import psutil
from datetime import datetime, timezone

def collect_host_resources():
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    top_cpu = sorted(
        [{"pid": p.info["pid"], "name": p.info["name"], "cpu": p.info["cpu_percent"]}
         for p in psutil.process_iter(["pid", "name", "cpu_percent"])],
        key=lambda x: x["cpu"] or 0, reverse=True
    )[:5]
    top_mem = sorted(
        [{"pid": p.info["pid"], "name": p.info["name"], "mem_mb": round(p.info["memory_info"].rss / 1024 / 1024, 1)}
         for p in psutil.process_iter(["pid", "name", "memory_info"])],
        key=lambda x: x["mem_mb"] or 0, reverse=True
    )[:5]
    return {
        "type": "host_resources",
        "cpu_percent": cpu,
        "memory_percent": mem.percent,
        "memory_used_mb": round(mem.used / 1024 / 1024, 1),
        "disk_percent": disk.percent,
        "disk_used_gb": round(disk.used / 1024**3, 2),
        "top_cpu_processes": top_cpu,
        "top_memory_processes": top_mem,
    }
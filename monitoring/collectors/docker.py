import docker, json
from datetime import datetime, timezone

client = docker.DockerClient(base_url="unix:///var/run/docker.sock")

def collect_docker_containers():
    containers = []
    for c in client.containers.list(all=True):
        info = {
            "name": c.name,
            "status": c.status,
            "image": c.image.tags[0] if c.image.tags else "unknown",
        }
        try:
            stats = c.stats(stream=False)
            cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
            sys_delta = stats["cpu_stats"].get("system_cpu_usage", 0) - stats["precpu_stats"].get("system_cpu_usage", 0)
            online = stats["cpu_stats"].get("online_cpus", 1)
            info["cpu_percent"] = round((cpu_delta / sys_delta) * online * 100, 2) if sys_delta > 0 else 0
            mem = stats["memory_stats"].get("usage", 0)
            cache = stats["memory_stats"].get("stats", {}).get("cache", 0)
            info["memory_mb"] = round((mem - cache) / 1024 / 1024, 1)
            info["restart_count"] = c.attrs.get("RestartCount", 0)
        except Exception:
            info["cpu_percent"] = None
            info["memory_mb"] = None
        containers.append(info)
    return {"type": "docker_containers", "containers": containers}
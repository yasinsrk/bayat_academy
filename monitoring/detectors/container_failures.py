def detect_container_failures(docker_data):
    alerts = []
    for c in docker_data.get("containers", []):
        if c["status"] in ("exited", "dead"):
            alerts.append({"alert": "container_down", "container": c["name"], "status": c["status"]})
        if c.get("restart_count", 0) > 0:
            alerts.append({"alert": "container_restarted", "container": c["name"], "restart_count": c["restart_count"]})
    return alerts
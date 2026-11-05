from config import CPU_SPIKE_PERCENT, MEMORY_SPIKE_PERCENT, CONTAINER_CPU_SPIKE, CONTAINER_MEM_SPIKE_MB, DISK_USAGE_PERCENT

def detect_resource_spikes(host_data, docker_data):
    alerts = []
    if host_data["cpu_percent"] > CPU_SPIKE_PERCENT:
        alerts.append({"alert": "host_cpu_high", "value": host_data["cpu_percent"]})
    if host_data["memory_percent"] > MEMORY_SPIKE_PERCENT:
        alerts.append({"alert": "host_memory_high", "value": host_data["memory_percent"]})
    if host_data["disk_percent"] > DISK_USAGE_PERCENT:
        alerts.append({"alert": "disk_usage_high", "value": host_data["disk_percent"]})
    for c in docker_data.get("containers", []):
        if c.get("cpu_percent") and c["cpu_percent"] > CONTAINER_CPU_SPIKE:
            alerts.append({"alert": "container_cpu_high", "container": c["name"], "value": c["cpu_percent"]})
        if c.get("memory_mb") and c["memory_mb"] > CONTAINER_MEM_SPIKE_MB:
            alerts.append({"alert": "container_memory_high", "container": c["name"], "value_mb": c["memory_mb"]})
    return alerts
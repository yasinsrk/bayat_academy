from config import UNEXPECTED_PORTS, SSH_FAIL_THRESHOLD

def detect_connection_anomalies(net_data, ssh_data):
    alerts = []
    # Unexpected listening ports
    for port_spec in net_data.get("listening_ports", []):
        try:
            port = int(port_spec.split(":")[-1])
            if port not in UNEXPECTED_PORTS and port > 0:
                alerts.append({"alert": "unexpected_listening_port", "port": port})
        except (ValueError, IndexError):
            pass
    # SSH brute force
    if ssh_data.get("failed_count", 0) >= SSH_FAIL_THRESHOLD:
        alerts.append({
            "alert": "ssh_bruteforce",
            "failed_count": ssh_data["failed_count"],
            "top_ips": ssh_data.get("top_source_ips"),
        })
    return alerts
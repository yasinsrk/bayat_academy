import subprocess, time, json
from pathlib import Path

_last_net = {}

def collect_network():
    global _last_net
    stats = {}
    with open("/proc/net/dev") as f:
        for line in f:
            if ":" not in line:
                continue
            iface, data = line.split(":", 1)
            iface = iface.strip()
            if iface in ("lo",):
                continue
            parts = data.split()
            rx_bytes = int(parts[0])
            tx_bytes = int(parts[8])
            stats[iface] = {"rx_bytes": rx_bytes, "tx_bytes": tx_bytes}

    now = time.time()
    rates = {}
    for iface, cur in stats.items():
        prev = _last_net.get(iface)
        if prev:
            dt = now - prev["ts"]
            if dt > 0:
                rx_rate = (cur["rx_bytes"] - prev["rx_bytes"]) / dt / 1024 / 1024
                tx_rate = (cur["tx_bytes"] - prev["tx_bytes"]) / dt / 1024 / 1024
                rates[iface] = {"rx_mbps": round(rx_rate, 2), "tx_mbps": round(tx_rate, 2)}
        _last_net[iface] = {"rx_bytes": cur["rx_bytes"], "tx_bytes": cur["tx_bytes"], "ts": now}

    # Active connections + remote IPs
    try:
        ss_out = subprocess.check_output(
            ["ss", "-tun", "state", "established"], text=True, timeout=10
        )
        connections = []
        for line in ss_out.splitlines()[1:]:
            parts = line.split()
            if len(parts) >= 5:
                connections.append({"local": parts[3], "remote": parts[4]})
    except Exception:
        connections = []

    # Listening ports
    try:
        ss_listen = subprocess.check_output(["ss", "-tlnp"], text=True, timeout=10)
        listening = []
        for line in ss_listen.splitlines()[1:]:
            parts = line.split()
            if len(parts) >= 4:
                listening.append(parts[3])
    except Exception:
        listening = []

    return {
        "type": "network",
        "interface_rates": rates,
        "active_connections": len(connections),
        "remote_ips_sample": connections[:20],
        "listening_ports": listening,
    }
#!/usr/bin/env python3
"""
Bayat Academy Monitoring Agent
-------------------------------
Collects Linux system-level + Docker-level events and writes them to a
rotating JSONL log. Designed to run as a systemd service on an Ubuntu VPS.

After a crash: inspect logs/monitor.jsonl (or run logger/incident_report.py)
to see the last health check, alerts, and kernel/OOM events leading up to it.
"""

import os
import signal
import sys
import time
import traceback

from config import (
    LOG_FILE,
    MAX_LOG_BYTES,
    BACKUP_COUNT,
    INTERVAL,
)
from logger.jsonl_writer import JSONLWriter

# Collectors
from collectors.resources import collect_host_resources
from collectors.network import collect_network
from collectors.security import collect_ssh_failures
from collectors.docker import collect_docker_containers
from collectors.kernel import collect_kernel_events
from collectors.disk import collect_disk
from collectors.bandwidth_processes import collect_bandwidth_per_process
from collectors.bandwidth_per_connection import collect_bandwidth_per_connection

# Detectors
from detectors.bandwidth import detect_bandwidth_spike
from detectors.resource_spikes import detect_resource_spikes
from detectors.suspicious_connections import detect_connection_anomalies
from detectors.container_failures import detect_container_failures


# ---------------------------------------------------------------------------
# Writer + lifecycle
# ---------------------------------------------------------------------------
writer = JSONLWriter(LOG_FILE, MAX_LOG_BYTES, BACKUP_COUNT)
running = True


def _shutdown(signum, frame):
    """Gracefully stop the loop on SIGTERM / SIGINT (systemd stop)."""
    global running
    running = False
    try:
        writer.write({
            "type": "monitor_shutdown",
            "reason": "signal",
            "signal": signal.Signals(signum).name,
        })
    finally:
        sys.exit(0)


signal.signal(signal.SIGTERM, _shutdown)
signal.signal(signal.SIGINT, _shutdown)


# ---------------------------------------------------------------------------
# One collection cycle
# ---------------------------------------------------------------------------
def run_cycle() -> None:
    """Collect everything once, write raw data, then emit alerts."""
    cycle_start = time.time()

    # --- Collect (each collector is independent; one failing must not
    #     prevent the others from running) ---
    host = None
    net = None
    ssh = None
    docker = None
    kernel = None
    disk = None

    try:
        host = collect_host_resources()
        writer.write(host)
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "resources", "error": str(e)})

    try:
        net = collect_network()
        writer.write(net)
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "network", "error": str(e)})

    try:
        ssh = collect_ssh_failures()
        writer.write(ssh)
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "security", "error": str(e)})

    try:
        docker = collect_docker_containers()
        writer.write(docker)
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "docker", "error": str(e)})

    try:
        kernel = collect_kernel_events()
        # Only write kernel block when there are actual events, to avoid
        # thousands of empty entries in the JSONL.
        if kernel and kernel.get("events"):
            writer.write(kernel)
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "kernel", "error": str(e)})

    try:
        disk = collect_disk()
        writer.write(disk)
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "disk", "error": str(e)})

    # --- Per-process bandwidth (nethogs) ---
    try:
        writer.write(collect_bandwidth_per_process())
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "bandwidth_processes", "error": str(e)})

    # --- Per-connection bandwidth (ss -tin) ---
    try:
        writer.write(collect_bandwidth_per_connection())
    except Exception as e:
        writer.write({"type": "collector_error", "collector": "bandwidth_per_connection", "error": str(e)})

    # --- Detect (only run detectors whose input data is available) ---
    alerts = []

    if net is not None:
        try:
            alerts.extend(detect_bandwidth_spike(net))
        except Exception as e:
            writer.write({"type": "detector_error", "detector": "bandwidth", "error": str(e)})

    if host is not None and docker is not None:
        try:
            alerts.extend(detect_resource_spikes(host, docker))
        except Exception as e:
            writer.write({"type": "detector_error", "detector": "resource_spikes", "error": str(e)})

    if net is not None and ssh is not None:
        try:
            alerts.extend(detect_connection_anomalies(net, ssh))
        except Exception as e:
            writer.write({"type": "detector_error", "detector": "suspicious_connections", "error": str(e)})

    if docker is not None:
        try:
            alerts.extend(detect_container_failures(docker))
        except Exception as e:
            writer.write({"type": "detector_error", "detector": "container_failures", "error": str(e)})

    # --- Emit alerts ---
    for alert in alerts:
        try:
            writer.write({"type": "alert", **alert})
        except Exception:
            pass

    # --- Health check (your "last known good" marker before a crash) ---
    writer.write({
        "type": "health_check",
        "status": "ok",
        "cycle_duration_sec": round(time.time() - cycle_start, 2),
        "alerts_emitted": len(alerts),
    })


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
def main() -> None:
    writer.write({
        "type": "monitor_start",
        "pid": os.getpid(),
        "interval_sec": INTERVAL,
        "log_file": str(LOG_FILE),
    })

    while running:
        loop_start = time.time()

        try:
            run_cycle()
        except Exception as e:
            # Catch-all so the loop never dies because of an unexpected bug.
            writer.write({
                "type": "monitor_error",
                "error": str(e),
                "traceback": traceback.format_exc(),
            })

        # Sleep the remainder of the interval, accounting for collection time.
        elapsed = time.time() - loop_start
        sleep_for = max(0, INTERVAL - elapsed)
        if running:
            time.sleep(sleep_for)


if __name__ == "__main__":
    main()
# Bayat Academy Monitoring Agent

A lightweight, self-hosted system + Docker monitoring agent for an Ubuntu VPS
running a Docker Compose stack. Writes everything to a single rotating JSONL
log so you can answer "what happened?" after a crash, a bandwidth drain, or a
CPU/memory spike.

Designed to run as a systemd service alongside your application stack. It does
**not** modify, restart, or interfere with your containers — it only observes.

---

## What it monitors

### 1. Host resources
- CPU percent, memory percent + MB used, disk percent + GB used
- Top 5 CPU-consuming processes (pid, name, cpu%)
- Top 5 memory-consuming processes (pid, name, MB)
- Detects: CPU > 85%, memory > 85%, disk > 85%

### 2. Network
- Per-interface rx/tx rates in Mbps (`eth0`, `docker0`, `br-*`, each `veth*`)
- Active connection count
- Sample of active connections with local and remote IPs (up to 20)
- Listening TCP ports
- Detects: bandwidth spike above `BANDWIDTH_SPIKE_MBPS`, unexpected listening ports

### 3. SSH security
- Failed SSH login count in the last 5 minutes
- Top source IPs with attempt counts
- Detects: brute force (>= `SSH_FAIL_THRESHOLD` failures in `SSH_WINDOW_SECONDS`)

### 4. Docker
- All containers: name, status, image, CPU percent, memory MB, restart count
- Detects: container exited/dead, container restarted, per-container CPU > 90%,
  per-container memory > 1024 MB

### 5. Disk
- Usage for `/`, `/var/lib/docker`, `/var/log`
- Detects: any path above `DISK_USAGE_PERCENT`

### 6. Kernel / OOM
- Kernel messages containing "oom", "out of memory", "killed process", "kernel panic"
- Captured only when such events occur (silent otherwise)

### 7. Per-process bandwidth (nethogs)
- Top 10 processes by (sent + received) KB during a 5-second sample
- Cached between cycles: if a cycle sees no traffic, the previous result is
  returned with `"fresh": false`

### 8. Per-connection bandwidth (ss)
- Top 20 established TCP connections by bytes sent + received
- Each entry: local address, remote address, bytes_sent, bytes_received
- This is the collector that answers "which remote IP is using my bandwidth"

### 9. Health check
- Written every cycle: status, cycle duration, number of alerts emitted
- The last `health_check` before a crash tells you the exact moment the server
  was still alive

### 10. Alerts
Every threshold breach writes a separate `alert` line:
- `ssh_bruteforce`
- `bandwidth_spike`
- `host_cpu_high`, `host_memory_high`, `disk_usage_high`
- `container_cpu_high`, `container_memory_high`
- `container_down`, `container_restarted`
- `unexpected_listening_port`

---

## What it does NOT monitor

To avoid surprises, these are out of scope by design:

- Application-level metrics (Django request counts, DB query times, HTTP status codes)
- Nginx access/error log contents (Nginx is seen only as a container)
- Per-URL or per-endpoint bandwidth
- Monthly bandwidth accounting per IP (snapshots, not totals)
- Windows-specific metrics (Linux only: uses `journalctl`, `ss`, `/proc`, `dmesg`)

---

## File layout
/root/bayat/monitoring/
├── main.py # orchestrator, runs the loop
├── config.py # all thresholds and paths
├── collectors/
│ ├── resources.py # CPU, memory, top processes
│ ├── network.py # interfaces, connections, ports
│ ├── security.py # SSH failures
│ ├── docker.py # container stats
│ ├── kernel.py # kernel/OOM events
│ ├── disk.py # disk usage per path
│ ├── bandwidth_processes.py # nethogs, per-process bandwidth
│ └── bandwidth_per_connection.py # ss -tin, per-connection bandwidth
├── detectors/
│ ├── bandwidth.py # bandwidth spike alerts
│ ├── resource_spikes.py # CPU/memory/disk/container spikes
│ ├── suspicious_connections.py # SSH bruteforce + unexpected ports
│ └── container_failures.py # container down/restarted
├── logger/
│ ├── jsonl_writer.py # JSONL writer with rotation
│ └── incident_report.py # post-crash summary tool
└── services/systemd/
└── bayat-monitor.service # systemd unit

Logs go to: /root/bayat/logs/monitor.jsonl


---

## Installation (already done — for reference)

```bash
# 1. Install Python dependencies
apt update && apt install -y python3-pip iproute2 nethogs
pip3 install --break-system-packages psutil docker

# 2. Install systemd service (already installed)
cp /root/bayat/monitoring/services/systemd/bayat-monitor.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now bayat-monitor

# 3. Confirm
systemctl status bayat-monitor --no-pager

# Check status
systemctl status bayat-monitor --no-pager

# Stop
systemctl stop bayat-monitor

# Start
systemctl start bayat-monitor

# Restart (after editing code)
systemctl restart bayat-monitor

# Clear failed state if it crashed repeatedly
systemctl reset-failed bayat-monitor

# View service journal (Python errors, tracebacks)
journalctl -u bayat-monitor -f
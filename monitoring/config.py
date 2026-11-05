import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "monitor.jsonl"
MAX_LOG_BYTES = 50 * 1024 * 1024  # 50 MB per file
BACKUP_COUNT = 5

# Detection thresholds
BANDWIDTH_SPIKE_MBPS = 5          # alert if rx/tx exceeds this
CPU_SPIKE_PERCENT = 85             # host CPU alert threshold
MEMORY_SPIKE_PERCENT = 85          # host memory alert threshold
CONTAINER_CPU_SPIKE = 90           # per-container CPU %
CONTAINER_MEM_SPIKE_MB = 1024      # per-container memory in MB
SSH_FAIL_THRESHOLD = 5             # failed SSH logins within window
SSH_WINDOW_SECONDS = 300           # 5 minutes
DISK_USAGE_PERCENT = 85            # disk alert threshold
UNEXPECTED_PORTS = {22, 80, 443}    # expected listening ports (adjust yours)

# Docker socket
DOCKER_SOCKET = "unix:///var/run/docker.sock"

# Collect interval (seconds)
INTERVAL = 30
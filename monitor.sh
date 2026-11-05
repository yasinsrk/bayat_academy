#!/usr/bin/env bash
# Bayat Academy host + Docker resource monitor (Ubuntu/Linux).
# Run from the project root, on the HOST (not inside a container).
# Usage: ./monitor.sh [interval_seconds]
set -Eeuo pipefail

INTERVAL="${1:-10}"
if ! [[ "$INTERVAL" =~ ^[1-9][0-9]*$ ]]; then
  echo "Usage: $0 [positive_interval_seconds]" >&2
  exit 2
fi

LOG_DIR="${LOG_DIR:-./monitoring-logs}"
mkdir -p "$LOG_DIR"
chmod 700 "$LOG_DIR"
umask 077
LOG_FILE="$LOG_DIR/bayat-monitor-$(date -u +%Y%m%dT%H%M%SZ).log"

cpu_read() {
  awk '/^cpu / {
    idle=$5+$6
    total=0
    for (i=2; i<=NF; i++) total += $i
    printf "%.0f %.0f\n", total, idle
    exit
  }' /proc/stat
}

mem_read() {
  awk '
    /MemTotal:/ { total=$2 }
    /MemAvailable:/ { available=$2 }
    END {
      used=total-available
      printf "used=%.1f%% (%d MiB / %d MiB), available=%d MiB",
        100*used/total, used/1024, total/1024, available/1024
    }' /proc/meminfo
}

net_read() {
  awk -F'[: ]+' '
    NR > 2 {
      iface=$2
      gsub(/ /, "", iface)
      if (iface != "" && iface != "lo")
        printf "%s %s %s\n", iface, $3, $11
    }' /proc/net/dev
}

declare -A PREV_RX PREV_TX
while read -r iface rx tx; do
  PREV_RX["$iface"]="$rx"
  PREV_TX["$iface"]="$tx"
done < <(net_read)

read -r PREV_TOTAL PREV_IDLE < <(cpu_read)

{
  echo "Bayat Academy server monitor"
  echo "Started UTC: $(date -u --iso-8601=seconds)"
  echo "Host: $(hostname)"
  echo "Kernel: $(uname -sr)"
  echo "Interval: ${INTERVAL} seconds"
  echo "Log: $LOG_FILE"
  echo "Network rates are host-interface RX/TX MiB/s, calculated between samples."
  echo "Docker stats include per-container CPU, memory, network and block I/O."
  echo
} | tee -a "$LOG_FILE"

while true; do
  sleep "$INTERVAL"
  NOW="$(date -u --iso-8601=seconds)"

  read -r TOTAL IDLE < <(cpu_read)
  DT=$((TOTAL - PREV_TOTAL))
  DI=$((IDLE - PREV_IDLE))
  CPU="n/a"
  if (( DT > 0 )); then
    CPU="$(awk -v t="$DT" -v i="$DI" 'BEGIN { printf "%.1f%%", 100*(t-i)/t }')"
  fi
  PREV_TOTAL="$TOTAL"
  PREV_IDLE="$IDLE"

  {
    echo "========== $NOW =========="
    echo "HOST cpu=$CPU loadavg=$(awk '{print $1" "$2" "$3}' /proc/loadavg)"
    echo "MEMORY $(mem_read)"
    df -hP / | awk 'NR==2 { print "DISK root_used="$5, "available="$4 }'

    echo "NETWORK interface RX_MiB/s TX_MiB/s"
    while read -r iface rx tx; do
      old_rx="${PREV_RX[$iface]:-$rx}"
      old_tx="${PREV_TX[$iface]:-$tx}"
      awk -v n="$iface" -v r="$rx" -v t="$tx" -v pr="$old_rx" -v pt="$old_tx" -v s="$INTERVAL" \
        'BEGIN { printf "  %s RX=%.3f TX=%.3f\n", n, (r-pr)/1048576/s, (t-pt)/1048576/s }'
      PREV_RX["$iface"]="$rx"
      PREV_TX["$iface"]="$tx"
    done < <(net_read)

    echo "DOCKER CONTAINER STATS"
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
      docker stats --no-stream \
        --format '  {{.Name}} CPU={{.CPUPerc}} MEM={{.MemUsage}} ({{.MemPerc}}) NET={{.NetIO}} BLOCK={{.BlockIO}} PIDS={{.PIDs}}' \
        2>&1 || true
      echo "DOCKER CONTAINER STATUS"
      docker ps --format '  {{.Names}} status={{.Status}}' 2>&1 || true
    else
      echo "  Docker unavailable or this user cannot access the Docker socket."
    fi

    echo "TOP PROCESSES BY CPU"
    ps -eo pid,ppid,user,%cpu,%mem,rss,etime,comm --sort=-%cpu | head -n 11

    echo "CONNECTION SUMMARY"
    if command -v ss >/dev/null 2>&1; then ss -s 2>&1; else echo "  ss command not installed"; fi
    echo
  } >> "$LOG_FILE" 2>&1
done

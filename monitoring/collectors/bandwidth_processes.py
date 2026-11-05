"""
Per-process bandwidth using nethogs in trace mode.
Requires: apt install -y nethogs
"""
import subprocess
import re

_last_nonempty = []


def collect_bandwidth_per_process(samples: int = 5, interval: int = 1):
    global _last_nonempty
    try:
        result = subprocess.run(
            ["nethogs", "-t", "-c", str(samples), "-d", str(interval)],
            capture_output=True,
            text=True,
            timeout=samples + 10,
        )

        procs = {}
        line_re = re.compile(
            r"^(?P<name>[^/]+?)"
            r"(?::\s*(?P<user_pts>[^/]+)/(?P<pts>[^/]+)/(?P<pid1>\d+)/(?P<uid>\d+))?"
            r"(?:/(?P<pid2>\d+)/(?P<user2>\S+))?"
            r"\s+(?P<sent>[\d.]+)\s+(?P<recv>[\d.]+)\s*$"
        )

        for line in result.stdout.splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("Refreshing:"):
                continue
            if stripped.startswith(("unknown TCP", "unknown UDP")):
                continue

            m = line_re.match(stripped)
            if not m:
                continue

            name = m.group("name").strip()
            if "unknown" in name.lower() or "[net]" in name.lower():
                continue

            pid = m.group("pid1") or m.group("pid2") or "0"
            user_raw = m.group("user_pts") or m.group("user2") or "?"
            user = user_raw.split("@")[0]
            sent = float(m.group("sent"))
            recv = float(m.group("recv"))

            if sent == 0 and recv == 0:
                continue

            key = (name, pid, user)
            procs[key] = {
                "process": name,
                "pid": int(pid),
                "user": user,
                "sent_kb": sent,
                "recv_kb": recv,
            }

        top = sorted(
            procs.values(),
            key=lambda x: x["sent_kb"] + x["recv_kb"],
            reverse=True,
        )[:10]

        if top:
            _last_nonempty = top
            return {"type": "bandwidth_per_process", "top_processes": top, "fresh": True}

        return {"type": "bandwidth_per_process", "top_processes": _last_nonempty, "fresh": False}

    except FileNotFoundError:
        return {"type": "bandwidth_per_process", "error": "nethogs not installed"}
    except subprocess.TimeoutExpired:
        return {"type": "bandwidth_per_process", "error": "nethogs timeout"}
    except Exception as e:
        return {"type": "bandwidth_per_process", "error": str(e)}
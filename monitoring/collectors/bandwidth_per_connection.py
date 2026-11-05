"""
Per-connection bandwidth using `ss -tin state established`.

Parses output of the form:
    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
    0       0       185.94.96.54:22     89.198.61.58:26205
        cubic ... bytes_sent:41843 ... bytes_received:10576 ...
"""
import subprocess
import re


def collect_bandwidth_per_connection(limit: int = 20):
    try:
        result = subprocess.run(
            ["ss", "-tin", "state", "established"],
            capture_output=True,
            text=True,
            timeout=10,
        )

        conns = []
        current = None

        data_row_re = re.compile(
            r"^\s*\d+\s+\d+\s+(?P<local>\S+)\s+(?P<remote>\S+)"
        )

        for line in result.stdout.splitlines():
            stripped = line.strip()
            if not stripped:
                continue

            if stripped.startswith("Recv-Q") or stripped.startswith("State"):
                continue

            m = data_row_re.match(stripped)
            if m:
                current = {
                    "local": m.group("local"),
                    "remote": m.group("remote"),
                    "bytes_sent": 0,
                    "bytes_received": 0,
                }
                conns.append(current)
                continue

            if current is not None:
                m_sent = re.search(r"bytes_sent:(\d+)", stripped)
                m_recv = re.search(r"bytes_received:(\d+)", stripped)
                if m_sent:
                    current["bytes_sent"] = int(m_sent.group(1))
                if m_recv:
                    current["bytes_received"] = int(m_recv.group(1))

        top = sorted(
            conns,
            key=lambda c: c["bytes_sent"] + c["bytes_received"],
            reverse=True,
        )[:limit]

        return {"type": "bandwidth_per_connection", "top_connections": top}

    except FileNotFoundError:
        return {"type": "bandwidth_per_connection", "error": "ss not found"}
    except subprocess.TimeoutExpired:
        return {"type": "bandwidth_per_connection", "error": "ss timeout"}
    except Exception as e:
        return {"type": "bandwidth_per_connection", "error": str(e)}
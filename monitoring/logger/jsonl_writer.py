import json
import threading
from pathlib import Path
from datetime import datetime, timezone

class JSONLWriter:
    def __init__(self, path: Path, max_bytes: int, backup_count: int):
        self.path = path
        self.max_bytes = max_bytes
        self.backup_count = backup_count
        self._lock = threading.Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, event: dict):
        event.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        line = json.dumps(event, default=str) + "\n"
        with self._lock:
            with open(self.path, "a", encoding="utf-8") as f:
                f.write(line)
            if self.path.stat().st_size > self.max_bytes:
                self._rotate()

    def _rotate(self):
        for i in range(self.backup_count - 1, 0, -1):
            src = self.path.with_suffix(f".jsonl.{i}")
            dst = self.path.with_suffix(f".jsonl.{i+1}")
            if src.exists():
                src.rename(dst)
        self.path.rename(self.path.with_suffix(".jsonl.1"))
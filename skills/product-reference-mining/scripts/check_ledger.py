#!/usr/bin/env python3
"""Check candidate product names against a Markdown decision ledger."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


SECTION_STATUS = {
    "已确认采用或已入表": "accepted",
    "已明确否决，不再重复": "rejected",
    "已采用但仅作纯分享或趋势参考": "shared",
    "暂缓，不主动重复": "deferred",
    "已交付过，本轮不得重复": "delivered",
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", value.casefold())


def load_ledger(path: Path) -> list[dict[str, str]]:
    section = "unclassified"
    rows: list[dict[str, str]] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("## "):
            section = SECTION_STATUS.get(line[3:].strip(), "unclassified")
        elif line.startswith("- ") and section in {"accepted", "rejected", "shared", "deferred", "delivered"}:
            label = line[2:].split("｜", 1)[0].strip()
            rows.append({"name": label, "normalized": normalize(label), "status": section})
    return rows


def load_fingerprints(path: Path) -> list[dict[str, str]]:
    in_section = False
    rows: list[dict[str, str]] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line == "## 机制指纹台账":
            in_section = True
            continue
        if line.startswith("## ") and in_section:
            break
        if not in_section or not line.startswith("- "):
            continue
        parts = [part.strip() for part in line[2:].split("｜", 2)]
        if len(parts) < 2:
            continue
        fingerprint_id, status = parts[:2]
        rows.append({
            "fingerprint_id": fingerprint_id,
            "normalized": normalize(fingerprint_id),
            "status": status,
            "description": parts[2] if len(parts) == 3 else "",
        })
    return rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ledger", required=True, type=Path)
    parser.add_argument("--mechanism-id", action="append", default=[])
    parser.add_argument("candidate", nargs="+")
    args = parser.parse_args()
    ledger = load_ledger(args.ledger)
    fingerprints = load_fingerprints(args.ledger)
    results = []
    for candidate in args.candidate:
        key = normalize(candidate)
        matches = [row for row in ledger if key == row["normalized"]]
        results.append({"kind": "product", "candidate": candidate, "status": matches[0]["status"] if matches else "new", "matches": matches})
    for mechanism_id in args.mechanism_id:
        key = normalize(mechanism_id)
        matches = [row for row in fingerprints if key == row["normalized"]]
        results.append({"kind": "mechanism", "candidate": mechanism_id, "status": matches[0]["status"] if matches else "new", "matches": matches})
    print(json.dumps(results, ensure_ascii=False, indent=2))
    blocking_statuses = {"accepted", "rejected", "shared", "deferred", "delivered"}
    return 1 if any(row["status"] in blocking_statuses for row in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())

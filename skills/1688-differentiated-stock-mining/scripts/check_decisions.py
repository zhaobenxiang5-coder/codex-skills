#!/usr/bin/env python3
"""Check product, mechanism and 1688 Offer decisions with route-specific semantics."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


PRODUCT_SECTION_STATUS = {
    "已确认采用或已入表": "accepted",
    "已明确否决，不再重复": "rejected",
    "已采用但仅作纯分享或趋势参考": "shared",
    "暂缓，不主动重复": "deferred",
    "已交付过，本轮不得重复": "delivered",
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", str(value).casefold())


def load_reference_ledger(path: Path) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    products: list[dict[str, str]] = []
    mechanisms: list[dict[str, str]] = []
    section = ""
    in_mechanisms = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("## "):
            title = line[3:].strip()
            in_mechanisms = title == "机制指纹台账"
            section = PRODUCT_SECTION_STATUS.get(title, "")
            continue
        if not line.startswith("- "):
            continue
        if in_mechanisms:
            parts = [item.strip() for item in line[2:].split("｜", 2)]
            if len(parts) >= 2:
                mechanisms.append({
                    "id": parts[0],
                    "normalized": normalize(parts[0]),
                    "status": parts[1],
                    "description": parts[2] if len(parts) > 2 else "",
                })
        elif section:
            name = line[2:].split("｜", 1)[0].strip()
            products.append({"name": name, "normalized": normalize(name), "status": section})
    return products, mechanisms


def load_supply_ledger(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    offers = data.get("offers", []) if isinstance(data, dict) else []
    return [item for item in offers if isinstance(item, dict)]


def evaluate_decisions(
    *,
    mode: str,
    products: list[dict[str, str]],
    mechanisms: list[dict[str, str]],
    supply_offers: list[dict[str, Any]],
    product_names: list[str],
    mechanism_ids: list[str],
    offer_ids: list[str],
) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    product_index = {row["normalized"]: row for row in products}
    mechanism_index = {row["normalized"]: row for row in mechanisms}
    offer_index = {str(row.get("offerId", "")).strip(): row for row in supply_offers if row.get("offerId")}

    for name in product_names:
        match = product_index.get(normalize(name))
        status = match["status"] if match else "new"
        blocked = mode == "reference" and status in {"accepted", "rejected", "shared", "deferred", "delivered"}
        results.append({
            "kind": "product",
            "candidate": name,
            "status": status,
            "blocked": blocked,
            "actionZh": "国外参考产品已处理，不得冒充新答案" if blocked else ("历史参考产品，仅作提示" if match else "新产品"),
        })

    for mechanism_id in mechanism_ids:
        match = mechanism_index.get(normalize(mechanism_id))
        status = match["status"] if match else "new"
        if mode == "reference":
            blocked = status in {"accepted", "rejected", "delivered"}
            action = "机制已处理，不得冒充新答案" if blocked else "机制仍可寻找更好代表产品"
        else:
            blocked = status == "rejected"
            if status in {"accepted", "delivered"}:
                action = "已有机制的1688落地候选，不阻断"
            elif blocked:
                action = "该机制已被明确否决，阻断"
            else:
                action = "机制开放，可继续找现货"
        results.append({
            "kind": "mechanism",
            "candidate": mechanism_id,
            "status": "implementation-target" if mode == "supply" and status in {"accepted", "delivered"} else status,
            "sourceStatus": status,
            "blocked": blocked,
            "actionZh": action,
        })

    for offer_id in offer_ids:
        match = offer_index.get(str(offer_id).strip())
        status = str(match.get("decision", "new")) if match else "new"
        blocked = status == "reject"
        labels = {"want": "我要", "pending": "待定", "reject": "不要", "new": "未记录"}
        results.append({
            "kind": "offer",
            "candidate": str(offer_id),
            "status": status,
            "statusZh": labels.get(status, status),
            "blocked": blocked,
            "actionZh": "该具体Offer已否决" if blocked else ("历史Offer已记录，保留并提示" if match else "新Offer"),
        })

    return {"ok": not any(row["blocked"] for row in results), "mode": mode, "results": results}


def main() -> int:
    parser = argparse.ArgumentParser(description="检查产品、机制与1688 Offer决策")
    parser.add_argument("--mode", choices=("reference", "supply"), required=True)
    parser.add_argument("--reference-ledger", required=True, type=Path)
    parser.add_argument("--supply-ledger", required=True, type=Path)
    parser.add_argument("--product-name", action="append", default=[])
    parser.add_argument("--mechanism-id", action="append", default=[])
    parser.add_argument("--offer-id", action="append", default=[])
    args = parser.parse_args()
    products, mechanisms = load_reference_ledger(args.reference_ledger)
    supply = load_supply_ledger(args.supply_ledger)
    result = evaluate_decisions(
        mode=args.mode,
        products=products,
        mechanisms=mechanisms,
        supply_offers=supply,
        product_names=args.product_name,
        mechanism_ids=args.mechanism_id,
        offer_ids=args.offer_id,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())


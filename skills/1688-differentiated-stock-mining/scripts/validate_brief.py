#!/usr/bin/env python3
"""Validate a product-mining Brief without mutating any external state."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


REQUIRED_STRINGS = (
    "productDirectionId",
    "categoryId",
    "categoryNameZh",
    "targetValueZh",
)


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _nonempty_strings(value: Any) -> bool:
    return isinstance(value, list) and all(isinstance(item, str) and item.strip() for item in value)


def validate_brief(brief: Any, *, check_images: bool = True) -> list[str]:
    errors: list[str] = []
    if not isinstance(brief, dict):
        return ["Brief必须是JSON对象。"]

    if brief.get("version") != 1:
        errors.append("version必须为1。")
    for field in REQUIRED_STRINGS:
        if not isinstance(brief.get(field), str) or not brief[field].strip():
            errors.append(f"{field}必须是非空字符串。")

    form = brief.get("formFingerprint")
    if not isinstance(form, dict):
        errors.append("formFingerprint必须是对象。")
    else:
        if not isinstance(form.get("nameZh"), str) or not form["nameZh"].strip():
            errors.append("formFingerprint.nameZh必须是非空字符串。")
        if not _nonempty_strings(form.get("mustHave")) or not form.get("mustHave"):
            errors.append("formFingerprint.mustHave至少包含一个具体版型或结构。")
        for field in ("preferred", "exclusions"):
            if not _nonempty_strings(form.get(field, [])):
                errors.append(f"formFingerprint.{field}必须是字符串数组。")

    gate = brief.get("commercialGate")
    if not isinstance(gate, dict):
        errors.append("commercialGate必须是对象。")
    else:
        price = gate.get("minCompleteSkuPrice")
        if not _is_number(price) or price < 0:
            errors.append("commercialGate.minCompleteSkuPrice必须是大于等于0的数字。")
        if gate.get("priceOperator") not in {">", ">="}:
            errors.append("commercialGate.priceOperator只能是>或>=。")
        moq = gate.get("maxMoq")
        if not isinstance(moq, int) or isinstance(moq, bool) or moq < 1:
            errors.append("commercialGate.maxMoq必须是大于等于1的整数。")
        if not isinstance(gate.get("stockRequired"), bool):
            errors.append("commercialGate.stockRequired必须是布尔值。")
        forms = gate.get("allowedProductForms")
        if not _nonempty_strings(forms) or not forms:
            errors.append("commercialGate.allowedProductForms至少包含一种完整商品形态。")
        for field in ("skuAccessoryOnlyKeywords", "skuCompleteProductKeywords"):
            if not _nonempty_strings(gate.get(field, [])):
                errors.append(f"commercialGate.{field}必须是字符串数组。")

    images = brief.get("referenceImages")
    if not _nonempty_strings(images) or not images:
        errors.append("referenceImages至少包含一个绝对图片路径。")
    else:
        for raw in images:
            path = Path(raw).expanduser()
            if not path.is_absolute():
                errors.append(f"参考图必须使用绝对路径：{raw}")
            elif check_images and not path.is_file():
                errors.append(f"参考图不存在：{raw}")

    for field in ("targetReviewCount", "detailCandidateLimit"):
        value = brief.get(field)
        if not isinstance(value, int) or isinstance(value, bool) or not 1 <= value <= 500:
            errors.append(f"{field}必须是1到500之间的整数。")
    return errors


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="校验1688差异化现货挖掘Brief")
    parser.add_argument("brief", type=Path)
    parser.add_argument("--skip-image-exists", action="store_true", help="只校验路径格式，不检查图片是否存在")
    args = parser.parse_args()
    try:
        brief = load_json(args.brief)
    except FileNotFoundError:
        errors = [f"Brief文件不存在：{args.brief}"]
    except json.JSONDecodeError as error:
        errors = [f"Brief不是有效JSON：{error}"]
    else:
        errors = validate_brief(brief, check_images=not args.skip_image_exists)
    result = {"ok": not errors, "brief": str(args.brief), "errors": errors}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 2


if __name__ == "__main__":
    sys.exit(main())


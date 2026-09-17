#!/usr/bin/env python3
"""Validate product-demand-insight-v1 JSON without third-party dependencies."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "product-demand-insight-v1"
MODES = {"evidence-backed", "hypothesis-only"}
CLAIM_TYPES = {"fact", "inference", "hypothesis"}
PRIORITIES = {"P0", "P1", "P2"}
DECISION_STATUSES = {
    "hypothesis-only",
    "evidence-needed",
    "manual-review",
    "ready-for-domestic-sourcing",
}
APPROVAL_STATUSES = {"not-requested", "pending", "approved", "rejected"}
REQUIRED_TOP_LEVEL = {
    "schemaVersion",
    "analysisId",
    "mode",
    "scope",
    "evidenceSummary",
    "targetSegments",
    "emotionalInsights",
    "opportunities",
    "feasibility",
    "missingEvidenceTasks",
    "decision",
}
FORBIDDEN_KEYS = {
    "productTruth",
    "ProductTruth",
    "productMaster",
    "ProductMaster",
    "imageJob",
    "ImageJob",
    "listingDraft",
    "ListingDraft",
    "publishPackage",
    "PublishPackage",
}


def is_list(value: Any) -> bool:
    return isinstance(value, list)


def ref_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str) and item.strip()]


def scan_forbidden_keys(value: Any, path: str = "$") -> list[str]:
    errors: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key in FORBIDDEN_KEYS:
                errors.append(f"{path}.{key}: demand insight must not create formal downstream entities")
            errors.extend(scan_forbidden_keys(child, f"{path}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            errors.extend(scan_forbidden_keys(child, f"{path}[{index}]"))
    return errors


def validate_document(document: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(document, dict):
        return ["$: top-level JSON must be an object"], warnings

    missing = sorted(REQUIRED_TOP_LEVEL - set(document))
    for key in missing:
        errors.append(f"$.{key}: missing required field")

    errors.extend(scan_forbidden_keys(document))

    if document.get("schemaVersion") != SCHEMA_VERSION:
        errors.append(f"$.schemaVersion: must equal {SCHEMA_VERSION!r}")

    mode = document.get("mode")
    if mode not in MODES:
        errors.append(f"$.mode: must be one of {sorted(MODES)}")

    evidence_summary = document.get("evidenceSummary")
    evidence_ids: list[str] = []
    if not isinstance(evidence_summary, dict):
        errors.append("$.evidenceSummary: must be an object")
    else:
        evidence_ids = ref_list(evidence_summary.get("evidenceIds"))
        if not is_list(evidence_summary.get("evidenceIds")):
            errors.append("$.evidenceSummary.evidenceIds: must be an array")
        if mode == "evidence-backed" and not evidence_ids:
            errors.append("$.evidenceSummary.evidenceIds: evidence-backed mode requires evidence")

    known_refs = set(evidence_ids)

    def check_refs(refs: Any, path: str, required: bool = False) -> list[str]:
        local = ref_list(refs)
        if not is_list(refs):
            errors.append(f"{path}: must be an array")
            return local
        if required and not local:
            errors.append(f"{path}: at least one evidence reference is required")
        unknown = sorted(set(local) - known_refs)
        for ref in unknown:
            errors.append(f"{path}: unknown evidence reference {ref!r}")
        return local

    segments = document.get("targetSegments")
    if not is_list(segments):
        errors.append("$.targetSegments: must be an array")
    else:
        for index, segment in enumerate(segments):
            path = f"$.targetSegments[{index}]"
            if not isinstance(segment, dict):
                errors.append(f"{path}: must be an object")
                continue
            for key in ("id", "nameZh", "behaviorSceneZh", "jobToBeDoneZh", "claimType", "evidenceRefs", "confidence"):
                if key not in segment:
                    errors.append(f"{path}.{key}: missing required field")
            claim_type = segment.get("claimType")
            if claim_type not in CLAIM_TYPES:
                errors.append(f"{path}.claimType: must be one of {sorted(CLAIM_TYPES)}")
            check_refs(
                segment.get("evidenceRefs"),
                f"{path}.evidenceRefs",
                required=(mode == "evidence-backed"),
            )
            check_refs(segment.get("counterEvidenceRefs", []), f"{path}.counterEvidenceRefs")
            confidence = segment.get("confidence")
            if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or not 0 <= confidence <= 1:
                errors.append(f"{path}.confidence: must be a number from 0 to 1")

    insights = document.get("emotionalInsights")
    if not isinstance(insights, dict):
        errors.append("$.emotionalInsights: must be an object")
    else:
        for kind in ("pain", "itch", "pleasure"):
            items = insights.get(kind)
            base_path = f"$.emotionalInsights.{kind}"
            if not is_list(items):
                errors.append(f"{base_path}: must be an array")
                continue
            for index, item in enumerate(items):
                path = f"{base_path}[{index}]"
                if not isinstance(item, dict):
                    errors.append(f"{path}: must be an object")
                    continue
                for key in ("claim", "claimType", "evidenceRefs", "confidence", "validationMethodZh"):
                    if key not in item:
                        errors.append(f"{path}.{key}: missing required field")
                claim_type = item.get("claimType")
                if claim_type not in CLAIM_TYPES:
                    errors.append(f"{path}.claimType: must be one of {sorted(CLAIM_TYPES)}")
                check_refs(
                    item.get("evidenceRefs"),
                    f"{path}.evidenceRefs",
                    required=(claim_type == "fact"),
                )
                check_refs(item.get("counterEvidenceRefs", []), f"{path}.counterEvidenceRefs")
                confidence = item.get("confidence")
                if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or not 0 <= confidence <= 1:
                    errors.append(f"{path}.confidence: must be a number from 0 to 1")

    opportunities = document.get("opportunities")
    if not is_list(opportunities):
        errors.append("$.opportunities: must be an array")
    else:
        for index, opportunity in enumerate(opportunities):
            path = f"$.opportunities[{index}]"
            if not isinstance(opportunity, dict):
                errors.append(f"{path}: must be an object")
                continue
            required_keys = (
                "id",
                "priority",
                "titleZh",
                "requirementType",
                "userOutcomeZh",
                "functionalRequirementZh",
                "acceptanceCriteria",
                "evidenceRefs",
                "validationPlanZh",
                "failureConditionZh",
            )
            for key in required_keys:
                if key not in opportunity:
                    errors.append(f"{path}.{key}: missing required field")
            if opportunity.get("priority") not in PRIORITIES:
                errors.append(f"{path}.priority: must be one of {sorted(PRIORITIES)}")
            criteria = opportunity.get("acceptanceCriteria")
            if not is_list(criteria):
                errors.append(f"{path}.acceptanceCriteria: must be an array")
            elif opportunity.get("priority") == "P0" and not criteria:
                errors.append(f"{path}.acceptanceCriteria: P0 requires at least one criterion")
            check_refs(
                opportunity.get("evidenceRefs"),
                f"{path}.evidenceRefs",
                required=(mode == "evidence-backed"),
            )
            check_refs(opportunity.get("counterEvidenceRefs", []), f"{path}.counterEvidenceRefs")

    if not isinstance(document.get("feasibility"), dict):
        errors.append("$.feasibility: must be an object")
    if not is_list(document.get("missingEvidenceTasks")):
        errors.append("$.missingEvidenceTasks: must be an array")

    decision = document.get("decision")
    if not isinstance(decision, dict):
        errors.append("$.decision: must be an object")
    else:
        for key in ("status", "externalGatePassed", "humanApprovalStatus", "blockers", "nextActionZh"):
            if key not in decision:
                errors.append(f"$.decision.{key}: missing required field")
        status = decision.get("status")
        approval = decision.get("humanApprovalStatus")
        blockers = decision.get("blockers")
        external_gate = decision.get("externalGatePassed")
        if status not in DECISION_STATUSES:
            errors.append(f"$.decision.status: must be one of {sorted(DECISION_STATUSES)}")
        if approval not in APPROVAL_STATUSES:
            errors.append(f"$.decision.humanApprovalStatus: must be one of {sorted(APPROVAL_STATUSES)}")
        if not isinstance(external_gate, bool):
            errors.append("$.decision.externalGatePassed: must be boolean")
        if not is_list(blockers):
            errors.append("$.decision.blockers: must be an array")
            blockers = []
        if mode == "hypothesis-only" and status != "hypothesis-only":
            errors.append("$.decision.status: hypothesis-only mode cannot be promoted")
        if status == "ready-for-domestic-sourcing":
            if mode != "evidence-backed":
                errors.append("$.decision.status: ready state requires evidence-backed mode")
            if external_gate is not True:
                errors.append("$.decision.externalGatePassed: ready state requires true")
            if approval != "approved":
                errors.append("$.decision.humanApprovalStatus: ready state requires approved")
            if blockers:
                errors.append("$.decision.blockers: ready state requires an empty array")
            if not evidence_ids:
                errors.append("$.evidenceSummary.evidenceIds: ready state requires evidence")

    if mode == "evidence-backed" and not segments:
        warnings.append("$.targetSegments: evidence-backed output has no target segments")
    if mode == "evidence-backed" and not opportunities:
        warnings.append("$.opportunities: evidence-backed output has no product opportunities")

    return errors, warnings


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: validate_output.py /absolute/path/to/product-demand-insight.json", file=sys.stderr)
        return 2

    path = Path(argv[1]).expanduser()
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"ERROR: file not found: {path}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}", file=sys.stderr)
        return 1

    errors, warnings = validate_document(document)
    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(f"INVALID: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1

    print(f"VALID: {SCHEMA_VERSION} ({len(warnings)} warning(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

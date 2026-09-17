#!/usr/bin/env python3
"""Validate an isolated 醒醒关系微剧场 scaffold or final render."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
from fractions import Fraction
from pathlib import Path
from typing import Any


CAST_SHA256 = "85d9d01c073a10f6eff8d27823ac46f224a2c01ef20b32c8c0581f17790369d2"
EXPECTED_BEATS = ("need", "care", "proof", "response", "meaning")
RENDERER_V1 = "hyperframes-story-sketch-17s-v1"
RENDERER_V2 = "hyperframes-story-sketch-17s-v2"
ALLOWED_RENDERERS = {RENDERER_V1, RENDERER_V2}
REQUIRED_FILES = (
    ".nvmrc",
    "project.json",
    "storyboard.json",
    "asset-manifest.json",
    "frame.md",
    "hyperframes.json",
    "package.json",
    "assets/images/couple-v1-reference.png",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: Path, errors: list[str]) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid JSON {path.name}: {exc}")
        return {}
    if not isinstance(payload, dict):
        errors.append(f"{path.name} must contain a JSON object")
        return {}
    return payload


def validate_scaffold(project: Path, errors: list[str]) -> dict[str, Any]:
    for relative in REQUIRED_FILES:
        if not (project / relative).is_file():
            errors.append(f"missing required file: {relative}")
    for relative in ("assets/audio", "assets/branding", "assets/images", "output", "qa"):
        if not (project / relative).is_dir():
            errors.append(f"missing required directory: {relative}")
    if errors:
        return {}

    metadata = load_json(project / "project.json", errors)
    storyboard = load_json(project / "storyboard.json", errors)
    manifest = load_json(project / "asset-manifest.json", errors)
    package = load_json(project / "package.json", errors)
    hyperframes = load_json(project / "hyperframes.json", errors)

    video = metadata.get("video", {})
    expected_video = {
        "width": 1080,
        "height": 1920,
        "fps": 30,
        "durationSeconds": 17.0,
        "frameCount": 510,
    }
    if video != expected_video:
        errors.append(f"project.json video contract must equal {expected_video}")
    cast = metadata.get("cast", {})
    if cast.get("id") != "couple-v1":
        errors.append("project.json cast.id must be couple-v1")
    if cast.get("wardrobe") not in {"winter-transit", "indoor-home", "mild-commute"}:
        errors.append("project.json cast.wardrobe is not an approved capsule")
    if metadata.get("isolation", {}).get("originalSkill") != "read-only":
        errors.append("project.json must declare the original Skill read-only")
    renderer_id = metadata.get("rendererId", RENDERER_V1)
    if renderer_id not in ALLOWED_RENDERERS:
        errors.append(f"project.json rendererId must be one of {sorted(ALLOWED_RENDERERS)}")
    if renderer_id == RENDERER_V2:
        optimization = metadata.get("optimization", {})
        if optimization.get("target") != "retention":
            errors.append("v2 optimization.target must be retention")
        if optimization.get("openingGrammar") != "action-first-v1":
            errors.append("v2 optimization.openingGrammar must be action-first-v1")

    scenes = storyboard.get("scenes", [])
    if not isinstance(scenes, list) or len(scenes) != 5:
        errors.append("storyboard must contain exactly five scenes")
    else:
        ids = tuple(scene.get("id") for scene in scenes if isinstance(scene, dict))
        if ids != EXPECTED_BEATS:
            errors.append(f"scene ids must be {EXPECTED_BEATS}")
        cursor = 0.0
        for index, scene in enumerate(scenes):
            if not isinstance(scene, dict):
                errors.append(f"scene {index} must be an object")
                continue
            try:
                start = float(scene["start"])
                end = float(scene["end"])
            except (KeyError, TypeError, ValueError):
                errors.append(f"scene {index} has invalid start/end")
                continue
            if abs(start - cursor) > 1e-6:
                errors.append(f"scene {index} does not start at {cursor}")
            if end <= start:
                errors.append(f"scene {index} has non-positive duration")
            cursor = end
            for field in ("visual", "caption", "audio"):
                if field not in scene:
                    errors.append(f"scene {index} missing {field}")
        if abs(cursor - 17.0) > 1e-6:
            errors.append("storyboard must end at 17.0 seconds")
    if storyboard.get("wardrobe") != cast.get("wardrobe"):
        errors.append("storyboard wardrobe must match project.json")
    if renderer_id == RENDERER_V2:
        if storyboard.get("rendererId") != RENDERER_V2:
            errors.append("v2 storyboard rendererId mismatch")
        if storyboard.get("openingGrammar") != "action-first-v1":
            errors.append("v2 storyboard openingGrammar must be action-first-v1")
        opening_action = storyboard.get("openingAction")
        if not isinstance(opening_action, str):
            errors.append("v2 storyboard openingAction must be a string")
        first_caption = ""
        if isinstance(scenes, list) and scenes and isinstance(scenes[0], dict):
            first_caption = str(scenes[0].get("caption", "")).replace("\n", "")
        if first_caption and len(first_caption) > 12:
            errors.append("v2 first caption must not exceed 12 characters")

    reference = project / "assets" / "images" / "couple-v1-reference.png"
    if reference.is_file() and sha256(reference) != CAST_SHA256:
        errors.append("couple-v1 reference hash mismatch")

    assets = manifest.get("assets", [])
    if not isinstance(assets, list) or not assets:
        errors.append("asset-manifest.json must contain at least one asset")
    else:
        for index, asset in enumerate(assets):
            if not isinstance(asset, dict):
                errors.append(f"manifest asset {index} must be an object")
                continue
            relative = asset.get("path")
            if not isinstance(relative, str) or Path(relative).is_absolute() or ".." in Path(relative).parts:
                errors.append(f"manifest asset {index} has unsafe path")
                continue
            target = project / relative
            if not target.is_file():
                errors.append(f"manifest asset missing: {relative}")
                continue
            actual = sha256(target)
            if asset.get("sha256") != actual:
                errors.append(f"manifest hash mismatch: {relative}")
            source_hash = asset.get("sourceSha256")
            if source_hash and source_hash != actual:
                errors.append(f"source/destination hash mismatch: {relative}")

    scripts = package.get("scripts", {})
    if "--at-transitions --strict" not in scripts.get("check", ""):
        errors.append("package.json check script must run strict transition checks")
    if "--strict" not in scripts.get("inspect", ""):
        errors.append("package.json inspect script must be strict")
    if "--strict --no-best-effort" not in scripts.get("render", ""):
        errors.append("package.json render script must be strict and disable best effort")
    if "__PROJECT_ID__" in (project / "package.json").read_text(encoding="utf-8"):
        errors.append("package.json still contains __PROJECT_ID__ placeholder")
    if hyperframes.get("media", {}).get("autoProxy") is not False:
        errors.append("hyperframes.json media.autoProxy must be false")

    return metadata


def validate_qa_json(path: Path, errors: list[str]) -> None:
    payload = load_json(path, errors)
    if payload and payload.get("ok") is not True:
        errors.append(f"{path.name} does not report ok=true")


def validate_render(project: Path, metadata: dict[str, Any], errors: list[str]) -> dict[str, Any]:
    project_id = metadata.get("projectId")
    video_path = project / "output" / f"{project_id}.mp4"
    lint_path = project / "qa" / "hyperframes-lint.txt"
    check_path = project / "qa" / "hyperframes-check.json"
    inspect_path = project / "qa" / "hyperframes-inspect.json"
    required_paths = [video_path, lint_path, check_path, inspect_path]
    if metadata.get("rendererId") == RENDERER_V2:
        required_paths.extend([
            project / "qa" / "opening-contact-sheet.jpg",
            project / "qa" / "scene-contact-sheet.jpg",
            project / "qa" / "opening-action-qa.json",
        ])
    for path in required_paths:
        if not path.is_file():
            errors.append(f"missing render evidence: {path.relative_to(project)}")
    if errors:
        return {}

    lint_text = lint_path.read_text(encoding="utf-8", errors="replace")
    if not lint_text.strip():
        errors.append("hyperframes-lint.txt is empty")
    if re.search(r"\b[1-9]\d*\s+(?:errors?|warnings?)\b", lint_text, re.IGNORECASE):
        errors.append("HyperFrames lint reports errors or warnings")
    validate_qa_json(check_path, errors)
    validate_qa_json(inspect_path, errors)
    if metadata.get("rendererId") == RENDERER_V2:
        opening_qa = load_json(project / "qa" / "opening-action-qa.json", errors)
        if opening_qa.get("status") != "passed":
            errors.append("opening-action-qa.json must report status=passed")
        checks = opening_qa.get("checks", {})
        required_checks = (
            "frameZeroHasAction",
            "captionVisibleByPointTwoSeconds",
            "actionResultVisibleByTwoSeconds",
            "voiceStartsByPointOneFiveSeconds",
            "noOpeningBlackFrame",
        )
        for name in required_checks:
            if checks.get(name) is not True:
                errors.append(f"opening action check failed: {name}")

    ffprobe = shutil.which("ffprobe")
    if ffprobe is None:
        errors.append("ffprobe is required for render validation")
        return {}
    command = [
        ffprobe,
        "-v",
        "error",
        "-count_frames",
        "-show_entries",
        "format=duration:stream=codec_type,width,height,avg_frame_rate,nb_read_frames,sample_rate,channels",
        "-of",
        "json",
        str(video_path),
    ]
    try:
        probe = json.loads(subprocess.check_output(command, text=True))
    except (subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        errors.append(f"ffprobe failed: {exc}")
        return {}

    streams = probe.get("streams", [])
    video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)
    if video_stream is None:
        errors.append("MP4 has no video stream")
    else:
        if (video_stream.get("width"), video_stream.get("height")) != (1080, 1920):
            errors.append("MP4 must be 1080x1920")
        try:
            fps = float(Fraction(video_stream.get("avg_frame_rate", "0/1")))
        except (ValueError, ZeroDivisionError):
            fps = 0.0
        if abs(fps - 30.0) > 0.001:
            errors.append(f"MP4 fps must be 30, got {fps}")
        try:
            frames = int(video_stream.get("nb_read_frames", 0))
        except (TypeError, ValueError):
            frames = 0
        if frames != 510:
            errors.append(f"MP4 must contain 510 frames, got {frames}")
    if audio_stream is None:
        errors.append("MP4 has no audio stream")
    try:
        duration = float(probe.get("format", {}).get("duration", 0.0))
    except (TypeError, ValueError):
        duration = 0.0
    if abs(duration - 17.0) > 0.05:
        errors.append(f"MP4 duration must be 17 seconds, got {duration}")
    return {
        "path": str(video_path),
        "sha256": sha256(video_path),
        "durationSeconds": duration,
        "hasAudio": audio_stream is not None,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path)
    parser.add_argument("--stage", choices=("scaffold", "render"), default="scaffold")
    parser.add_argument("--json", action="store_true", dest="as_json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    project = args.project.expanduser().resolve()
    errors: list[str] = []
    if not project.is_dir():
        errors.append(f"project directory does not exist: {project}")
        metadata: dict[str, Any] = {}
    else:
        metadata = validate_scaffold(project, errors)
    media: dict[str, Any] = {}
    if args.stage == "render" and metadata:
        media = validate_render(project, metadata, errors)
    report = {
        "ok": not errors,
        "stage": args.stage,
        "project": str(project),
        "projectId": metadata.get("projectId") if metadata else None,
        "cast": metadata.get("cast", {}).get("id") if metadata else None,
        "media": media or None,
        "errors": errors,
    }
    if args.as_json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print("PASS" if report["ok"] else "FAIL")
        for error in errors:
            print(f"- {error}")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Create an isolated 醒醒关系微剧场 HyperFrames project."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT_TOKEN = Path("~/Documents/图文/xingxing-emotion-video-system")
CAST_SOURCE = SKILL_DIR / "assets" / "cast" / "couple-v1-reference.png"
CAST_SHA256 = "85d9d01c073a10f6eff8d27823ac46f224a2c01ef20b32c8c0581f17790369d2"
PROJECT_ID_RE = re.compile(r"^\d{8}-[a-z0-9]+(?:-[a-z0-9]+)*-v\d+$")
WARDROBES = ("winter-transit", "indoor-home", "mild-commute")
RENDERERS = {
    "hyperframes-story-sketch-17s-v1": {
        "template": "template",
        "format": "relationship-watercolor-sketch-17s-v1",
        "openingGrammar": None,
    },
    "hyperframes-story-sketch-17s-v2": {
        "template": "template-v2",
        "format": "relationship-watercolor-sketch-17s-v2",
        "openingGrammar": "action-first-v1",
    },
}
BEATS = (
    ("need", 0.0, 3.2),
    ("care", 3.2, 6.4),
    ("proof", 6.4, 9.6),
    ("response", 9.6, 13.0),
    ("meaning", 13.0, 17.0),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def default_projects_root() -> Path:
    if str(REPO_ROOT_TOKEN).startswith("__"):
        repo_root = SKILL_DIR.parents[1]
    else:
        repo_root = REPO_ROOT_TOKEN
    return repo_root / "relationship-micro-story-studio" / "projects"


def write_json(path: Path, payload: object) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def scaffold(
    project_id: str,
    title: str,
    wardrobe: str,
    root: Path,
    renderer: str = "hyperframes-story-sketch-17s-v2",
) -> Path:
    if not PROJECT_ID_RE.fullmatch(project_id):
        raise ValueError("project-id must match YYYYMMDD-lowercase-kebab-vN")
    if wardrobe not in WARDROBES:
        raise ValueError(f"wardrobe must be one of: {', '.join(WARDROBES)}")
    if renderer not in RENDERERS:
        raise ValueError(f"renderer must be one of: {', '.join(RENDERERS)}")
    if sha256(CAST_SOURCE) != CAST_SHA256:
        raise RuntimeError("bundled couple-v1 reference hash does not match the approved anchor")

    project = root.expanduser().resolve() / project_id
    project.mkdir(parents=True, exist_ok=False)
    for relative in (
        "assets/audio",
        "assets/branding",
        "assets/fonts",
        "assets/images",
        "compositions/components",
        "output",
        "qa",
    ):
        (project / relative).mkdir(parents=True, exist_ok=True)

    renderer_contract = RENDERERS[renderer]
    template_dir = SKILL_DIR / "assets" / renderer_contract["template"]
    for name in ("frame.md", "hyperframes.json", "package.json"):
        shutil.copy2(template_dir / name, project / name)
    package_path = project / "package.json"
    package_path.write_text(
        package_path.read_text(encoding="utf-8").replace("__PROJECT_ID__", project_id),
        encoding="utf-8",
    )
    (project / ".nvmrc").write_text("24\n", encoding="utf-8")

    cast_target = project / "assets" / "images" / "couple-v1-reference.png"
    shutil.copy2(CAST_SOURCE, cast_target)

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    write_json(
        project / "project.json",
        {
            "schemaVersion": 1,
            "projectId": project_id,
            "title": title,
            "format": renderer_contract["format"],
            "rendererId": renderer,
            "skill": "xingxing-relationship-micro-story",
            "createdAt": now,
            "video": {
                "width": 1080,
                "height": 1920,
                "fps": 30,
                "durationSeconds": 17.0,
                "frameCount": 510,
            },
            "cast": {
                "id": "couple-v1",
                "wardrobe": wardrobe,
                "reference": "assets/images/couple-v1-reference.png",
            },
            "branding": {
                "canonicalDuoPolicy": "unchanged-final-beat-only",
                "canonicalDuoAsset": None,
            },
            "isolation": {
                "originalSkill": "read-only",
                "originalContentSystem": "read-only",
                "publishState": "local-draft",
            },
            "optimization": {
                "target": "retention" if renderer.endswith("-v2") else None,
                "openingGrammar": renderer_contract["openingGrammar"],
                "baselineBatchId": (
                    "20260813-relationship-story-sketch-17s-001"
                    if renderer.endswith("-v2")
                    else None
                ),
            },
        },
    )
    write_json(
        project / "storyboard.json",
        {
            "schemaVersion": 1,
            "projectId": project_id,
            "durationSeconds": 17.0,
            "wardrobe": wardrobe,
            "rendererId": renderer,
            "openingGrammar": renderer_contract["openingGrammar"],
            "openingAction": "" if renderer.endswith("-v2") else None,
            "engagementPrompt": "",
            "scenes": [
                {
                    "id": beat,
                    "start": start,
                    "end": end,
                    "visual": "",
                    "caption": "",
                    "audio": "",
                }
                for beat, start, end in BEATS
            ],
        },
    )
    write_json(
        project / "asset-manifest.json",
        {
            "schemaVersion": 1,
            "projectId": project_id,
            "assets": [
                {
                    "id": "couple-v1-reference",
                    "path": "assets/images/couple-v1-reference.png",
                    "sha256": CAST_SHA256,
                    "source": str(CAST_SOURCE),
                    "sourceSha256": CAST_SHA256,
                    "role": "identity-anchor",
                }
            ],
        },
    )
    return project


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--wardrobe", choices=WARDROBES, default="winter-transit")
    parser.add_argument(
        "--renderer",
        choices=tuple(RENDERERS),
        default="hyperframes-story-sketch-17s-v2",
    )
    parser.add_argument("--root", type=Path, default=default_projects_root())
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        project = scaffold(
            args.project_id,
            args.title,
            args.wardrobe,
            args.root,
            renderer=args.renderer,
        )
    except (FileExistsError, OSError, RuntimeError, ValueError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1
    print(
        json.dumps(
            {
                "ok": True,
                "project": str(project),
                "cast": "couple-v1",
                "castSha256": CAST_SHA256,
                "rendererId": args.renderer,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# 独立项目契约

## Location and boundary

Default root:

`~/Documents/图文/xingxing-emotion-video-system/relationship-micro-story-studio/projects/<project-id>`

Project IDs match `YYYYMMDD-lowercase-kebab-vN`. Every episode is self-contained. It may read and byte-copy approved original media, but it never writes to the source and never modifies the original Skill, content system, Episode registry, renderer, template, or published work.

## Required scaffold

```text
<project-id>/
├── .nvmrc
├── project.json
├── storyboard.json
├── asset-manifest.json
├── frame.md
├── hyperframes.json
├── package.json
├── assets/
│   ├── audio/
│   ├── branding/
│   └── images/couple-v1-reference.png
├── qa/
└── output/
```

`node_modules`, audio, generated scenes, fonts, video, and QA output are project-local runtime artifacts, not Skill assets.

## Storyboard contract

- Exactly five contiguous beats: `need`, `care`, `proof`, `response`, `meaning`.
- First beat starts at `0.0`; final beat ends at `17.0`; no gap or overlap.
- Each beat records `start`, `end`, `visual`, `caption`, and `audio`.
- Use one capsule wardrobe for all five scenes.
- Generated scene art contains no text. The final original duo seal is composited by HyperFrames only in `meaning`.
- v2 projects declare `rendererId: hyperframes-story-sketch-17s-v2`, `openingGrammar: action-first-v1`, a non-empty `openingAction`, and a first caption no longer than 12 Chinese characters.

## Asset manifest

Every copied asset entry records:

```json
{
  "id": "couple-v1-reference",
  "path": "assets/images/couple-v1-reference.png",
  "sha256": "...",
  "source": "/absolute/read-only/source/path",
  "sourceSha256": "...",
  "role": "identity-anchor"
}
```

Source and destination hashes must match. The canonical duo seal also requires `role: "final-brand-seal"` and may appear only in the final beat.

## Render evidence

Before release preparation, retain:

- `qa/hyperframes-lint.txt` with zero errors and warnings.
- `qa/hyperframes-check.json` from strict transition checks.
- `qa/hyperframes-inspect.json` from strict inspection.
- `output/<project-id>.mp4`: 1080×1920, 30 fps, 510 frames, 17 seconds, audio present.
- v2 also retains `qa/opening-contact-sheet.jpg`, `qa/scene-contact-sheet.jpg`, and `qa/opening-action-qa.json`.

Use `scripts/validate_project.py <project> --stage render --json`. A local PASS is not publication evidence.

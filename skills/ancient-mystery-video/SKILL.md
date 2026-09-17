---
name: ancient-mystery-video
description: Research and produce finished 60-90 second Chinese vertical videos about ancient mysteries, archaeology, lost civilizations, tombs, ruins, and disputed historical questions. Use when the user asks for 神秘历史视频、失落文明、古代遗迹悬疑、秦始皇陵未解之谜, or invokes $ancient-mystery-video. Do not use for 手绘故事 or 铅笔故事; those belong to handdraw-story-video.
---

# Ancient Mystery Video

Produce a complete 1080x1920 MP4 plus cover, contact sheet, QA report, and publish copy. Work inside `~/Documents/图文/ancient-mystery-video-studio`. Do not edit `handdraw-video-studio`.

## Workflow

1. Run `uv run mystery doctor`. Stop if required local dependencies are missing.
2. Create a project with `uv run mystery new --topic "<topic>" --duration <60-90>`.
3. Research the question. Use at least two museum, university, government, archive, or paper sources plus one explanatory source. Save `research/sources.json` and `research/claims.json`, following [research-policy.md](references/research-policy.md).
4. Write `script.md` as 260-310 Chinese characters: hook, background, three pieces of evidence, mainstream and disputed views, final question. Clearly label facts versus dispute or speculation.
5. Run `uv run mystery research <id>` and then `uv run mystery storyboard <id>`.
6. Complete each scene's `visualPrompt`, `keyText`, `factLevel`, and source linkage. Follow [visual-style.md](references/visual-style.md).
7. Generate each `scenes/scene-NNN/image.png` with Codex image generation. Use 9:16 cinematic historical reconstruction, no embedded text, no watermark, consistent era and palette. Inspect every image before accepting it.
8. Run `uv run mystery assets <id> --resume`, then `uv run mystery render <id> --resume`.
9. Run `uv run mystery qa <id>`. Read [qa-checklist.md](references/qa-checklist.md) and inspect `output/contact-sheet.png` plus sampled video frames. Never call a failed QA output finished.
10. After QA passes, run `uv run mystery publish-pack <id> --title "..." --cover-line1 "..." --cover-line2 "..."`.
11. `publish-pack` 会把完整项目自动复制到 `~/Desktop/视频号测试/`，每个测试一个独立编号目录；不要移动原项目。

## Recovery

- Image generation resumes per scene; do not regenerate successful images.
- Reset one scene with `uv run mystery rerun <id> --scene scene-006 --from image|audio|render`.
- Never replace a missing image with a blank or placeholder.
- Never mark unsupported claims as verified.
- Only publish to an external platform when the user explicitly says to publish.

## Default Output

Return the absolute paths to:

- `output/final.mp4`
- `output/cover.png`
- `output/contact-sheet.png`
- `qa/report.json`
- `output/publish/manifest.json`

Also report duration, resolution, codecs, and any scene that still needs repair.

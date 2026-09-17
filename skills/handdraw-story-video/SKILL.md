---
name: handdraw-story-video
description: Turn a Chinese topic, story, article, or narration into a finished 3:4 illustrated hand-drawn story MP4 with consistent characters, typewriter narration, progressive pencil reveal, color fill, Edge TTS voiceover, quiet original background music, Remotion rendering, and QA. Use when the user asks to 做手绘故事视频, 铅笔故事视频, 把文稿做成手绘视频, 用手绘讲故事, 生成知识猫那种视频, or directly provides a topic/script and wants the video rendered rather than a plan.
---

# Handdraw Story Video

Produce the video immediately. Do not answer with another plan unless the user explicitly asks for one.

## Runtime

Use `HANDDRAW_STUDIO_ROOT` when set; otherwise use:

```text
~/Documents/图文/handdraw-video-studio
```

Run commands from that directory with `uv run handdraw ...`. Use the scripts in `scripts/` only as portable wrappers.

## Defaults

- 1080×1440, 3:4, 30fps, H.264 + AAC.
- Target 45 seconds and 8 scenes unless the user specifies duration.
- `story-color-sketch` for fables, history, knowledge and character stories.
- `story-pencil` for family, emotional and realistic stories.
- Default narration is the mature, warm female `zh-CN-XiaoxiaoNeural` at `-5%` rate and `-3Hz` pitch, tuned for clear listening by a broad 40–60 audience.
- Default production uses the vendored stroke renderer: a small visible pencil/hand follows the strokes while an isolated character or key object is being drawn on stable bright paper. Do not use a giant hand, mouse cursor, full-scene/background tracing, dark page recoloring, bottom caption box, large overlay title, video-model API, or placeholder image.
- No `OPENAI_API_KEY`. Use Codex image generation for illustrations and local Remotion/FFmpeg for video.
- Use the bundled original `warm-pentatonic` music at 0.45 Remotion volume. It is normalized quietly, fades in/out, and must remain clearly below narration. Use `--no-bgm` only when the user explicitly asks for silence behind the voice.

Read `references/style-prompts.md` before generating images. Read `references/storyboard-schema.md` before authoring character continuity or editing scene JSON. Use `references/qa-checklist.md` when QA fails.

## Workflow

1. Run `uv run handdraw doctor`. Stop on a failed hard dependency; never substitute a blank video or silent track.
2. If the input is only a topic, write a 150–190 Chinese-character narration with about 8 sentences. Use a conflict in the first sentence, then development, reversal, result and closing insight. If the user supplies a script, preserve its meaning and only tighten it for narration.
3. Create the project:
   - Topic: `uv run handdraw new --topic "..." --duration 45 --style auto`, then overwrite `script.md` and `input/script.md` with the finished narration.
   - Script: save it to a temporary Markdown file and run `uv run handdraw new --script <file> --duration 45 --style auto`.
4. Author `character-bible.json` before generating scenes. Fix each recurring character's age, face, hair, clothes, proportions and palette. Then run `uv run handdraw storyboard <project-id>` and enrich scene `characters`, `emotion`, `shot`, `composition`, and `imagePrompt` if needed.
5. Generate `cast-reference.png` first with Codex `image_gen`. Inspect it with `view_image`. It must be a clean reference sheet without text.
6. Generate each `scenes/scene-NNN/color.png` with Codex `image_gen`:
   - Use the cast reference and the previous accepted scene as local reference images.
   - Inspect every result with `view_image` before accepting it. The default composition is one isolated character or one key object on a clean white paper field; reject a full environmental scene unless the user explicitly asks for it.
   - Reject text, watermark, extra limbs, changed clothing, wrong age/face, crowded top text area, or repeated composition.
   - Regenerate only that scene, up to three attempts. Stop with the exact scene ID if it still fails.
7. Run `uv run handdraw assets <project-id> --resume`. This normalizes each image, creates `sketch.png`, synthesizes scene voice and typewriter audio, writes SRT, and measures the real duration. The renderer then mixes the bundled low-volume background music globally; it must not be duplicated per scene.
8. Run `uv run handdraw draw <project-id> --resume`. This calls the vendored `whiteboard-video-engine` for each scene, fixes the paper tone, traces the pencil strokes, and writes `scenes/<id>/whiteboard.mp4`. It does not call a neural line-art API and does not silently fall back to a still-image fade.
9. Run `uv run handdraw render <project-id> --resume`. When `whiteboard.mp4` exists, Remotion automatically selects the `HanddrawStoryWhiteboard` composition and only adds typewriter narration, voice, and quiet music.
10. Run `uv run handdraw qa <project-id>`. Inspect `output/contact-sheet.png`. It must show blank page → partial graphite drawing → completed page for every scene, with the paper tone unchanged.
11. After QA passes, author one recommended platform title, two alternatives, a short description, five focused hashtags, cover title and cover subtitle. Save them into `project.json.publish`, then run `uv run handdraw publish-pack <project-id>`.
12. `publish-pack` 会把完整测试项目自动复制到 `~/Desktop/视频号测试/`，目录名以 `手绘故事-` 开头；源项目仍保留在原工作区。
13. If one scene fails, use `uv run handdraw rerun <project-id> --scene scene-NNN --from image`, regenerate only that image, then rerun assets, draw, render and QA.

## Completion

Do not call the task complete until QA passes. Return:

- Absolute path to `output/final.mp4`.
- Absolute path to `output/contact-sheet.png`.
- Absolute path to `output/publish/manifest.json` and its finished cover.
- Duration and video/audio specifications from `qa/report.json`.
- A short note naming any intentionally user-adjustable choices, such as voice or style.

Show the contact sheet in the final response when the client supports local images.

If the user explicitly says “发布” or “直接发布”, use the signed-in browser session to upload the final MP4 and publish pack to the requested platform. Do not publish merely because a video was generated; `publish-pack` is automatic, the external submit action requires an explicit publishing instruction.

---
name: xingxing-relationship-micro-story
description: Create and validate 17-second Chinese relationship micro-story videos in a restrained watercolor-sketch style with the fixed couple-v1 cast. Use for 醒醒关系微剧场 episodes, five-beat adult relationship stories, HyperFrames vertical-video projects, character-consistent scene generation, or isolated visual-style pilots that must not modify the original xingxing-emotion-video Skill.
---

# 醒醒关系微剧场·副线

Build adult relationship micro-stories as an independent side-line extension. Keep the original `xingxing-emotion-video` Skill and all of its strategy, Episode, renderer, registry, character, and published assets read-only. This side line never replaces or changes the main Skill.

The current optimization renderer is `hyperframes-story-sketch-17s-v2`. It keeps the proven v1 visual system and changes only the first two seconds through the `action-first-v1` opening grammar. Historical v1 projects remain immutable.

## Non-negotiable boundary

- Work only in `~/Documents/图文/xingxing-emotion-video-system/relationship-micro-story-studio/` or a user-specified independent project directory.
- Never edit `skill/xingxing-emotion-video/**`, `emotion-card-video-studio/content/**`, existing Episodes, canonical assets, renderers, templates, or publication ledgers.
- Use `couple-v1` as the recurring human cast. Treat the original 醒醒×星星 PNG as a byte-for-byte final brand seal only; never redraw either mascot.
- Do not mix this pilot into an existing copy or hook experiment. Record it as a separate visual-format test.
- Generate and validate locally before preparing any release. Never infer `published` from a local render or queued request.

## Start a project

Read [project-contract.md](references/project-contract.md), then scaffold from this Skill directory:

```bash
python3 scripts/new_project.py \
  --project-id 20260813-small-kindness-v1 \
  --title "他记得你每一个小习惯" \
  --wardrobe winter-transit \
  --renderer hyperframes-story-sketch-17s-v2
```

The command copies only the lightweight HyperFrames template and the approved cast reference. It does not copy audio, video, generated scenes, `node_modules`, or any original production file.

## Production workflow

1. **Lock the story.** Write five beats in this order: `need`, `care`, `proof`, `response`, `meaning`. Keep the total at 17 seconds. For v2, read [action-first-v2.md](references/action-first-v2.md); record one visible opening action and keep the first caption at 12 Chinese characters or fewer.
2. **Lock the cast.** Read [character-bible.md](references/character-bible.md). Attach `assets/images/couple-v1-reference.png` to every scene-generation request. Select one of the three capsule wardrobes for the whole episode.
3. **Direct the look.** Read [style-bible.md](references/style-bible.md). Generate clean scene art without text, logos, watermark, UI cards, or a replacement mascot.
4. **Compose in HyperFrames.** Put captions, paper texture, light, transitions, and deterministic camera motion in HTML/CSS/GSAP. Keep generated text out of raster artwork.
5. **Copy approved media.** Copy narration, BGM, font, and final canonical duo seal into the independent project. Add source and destination SHA-256 values to `asset-manifest.json`; never write back to their sources.
6. **Run QA.** Run HyperFrames `lint`, `check --at-transitions --strict`, `inspect --strict`, and strict render. Then run:

```bash
python3 scripts/validate_project.py /absolute/path/to/project --stage render --json
```

7. **Prepare release evidence.** Keep local-ready, queued, submitted, scheduled, published, and platform-confirmed states distinct. Capture only real 2/24/72-hour metrics. Respect any active platform circuit breaker; a blocked platform receives no automated account or publishing request.

For v2, also retain the 0/0.5/1/2/3.2-second opening contact sheet, scene contact sheet, and `opening-action-qa.json`. A local renderer may not claim a legible action from metadata alone; the rendered frames are the evidence.

## Character decision

Fix identity, not every frame. Keep faces, age range, hair, height relationship, body proportions, and wardrobe palette stable. Vary action, setting, prop, composition, expression intensity, and camera distance. During the first ten-video pilot, use `couple-v1` in every episode and change only the story situation.

## Validation stages

- `scaffold`: checks the isolated project contract, five beats, 17-second timeline, template, manifest, and cast-reference hash.
- `render`: also requires a 1080×1920, 30 fps, 510-frame MP4 with audio plus HyperFrames lint/check/inspect evidence.
- `render` for v2 additionally requires frame-zero action, caption by 0.2 seconds, action result by 2 seconds, audible narration by 0.15 seconds, and no opening black frame.

Do not claim a render or publication passed unless the corresponding command and platform evidence actually exist.

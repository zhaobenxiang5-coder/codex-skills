---
name: xingxing-emotion-video
description: "Run the unified content operating system for the 醒醒别再猜 relationship IP: scored topics, Hook-only experiments, Xiaoyi narration, steady-push 20-second production, QianFan publishing, and comparable 2/24/72-hour decisions."
---

# 醒醒别再猜：统一内容操作系统

Work in:

```text
~/Documents/图文/xingxing-emotion-video-system/emotion-card-video-studio
```

安装 Skill 时，`scripts/install-skill.sh` 会把上面的占位路径替换为仓库的
绝对克隆路径。

The source of truth is one `DailyContentRun`:

```text
strategy → scored backlog → Hook-only slot → one daily episode
→ render/QA → QianFan remote schedule → verified work → metrics → decision
```

## Hard rules

- Never redraw or overwrite canonical 醒醒、星星 or duo assets. Preserve 星星的粉色星星细节.
- The only active content-copy experiment is `hook-copy-20s-002`; `hook-opening-20s-001` and old 16/25-second records are read-only/confounded baselines. A voice treatment is a separately registered sound-variable test: never place it in, substitute it for, or use it to judge a Hook-only slot.
- Use `balanced-20s`. Publish at most one episode per platform per day at 20:30. A/B counterparts are exactly 48 hours apart.
- Within a Hook-only A/B pair, only Hook text changes. Body, actions, background, title, covers, BGM, CTA, and the complete fixed-treatment fingerprint must match. That fingerprint includes voice/no-voice state, voice engine, rate, pitch, scene clock, BGM gain/ducking, opening-chime state, and motion-template version. Never change an already materialized pair; new pairs created on or after the Xiaoyi steady-push cutover use the same treatment on both arms.
- Use the five roles in order: 星星具体冲突 → 星星承接情绪 → 醒醒指出可观察行为 → 醒醒给一句可直接说的话 → 双人展示结果并提出具体问题.
- Hook is exactly two lines and 12–18 Chinese characters excluding the line break. It contains a quote, behavior, time, count, or light reversal.
- Select a topic only when six 1–5 scores total at least 24 and both specificity and solution value are at least 4. The first eight pairs use `猜测误解3 / 冲突修复2 / 需求表达2 / 边界共同决定1`.
- Change at least 3/5 actual images from the preceding topic; reject a latest-10 duplicate sequence. `pass_star` and `shared_star` are one pixel identity.
- Xiaohongshu is `manual_official_only`: never use QianFan, browser automation, cookies, sync, login checks, scheduling, publishing, replies, or creator-center collection for it. This is absolute isolation, including every voice-template test. Generate only a local manual package.
- Hook-only DailyContentRuns have exactly three automated distribution targets: Douyin, Kuaishou, and Channels. A separately registered voice/sound pilot may additionally target Bilibili, Baijiahao, and Tencent Video only after the account owner explicitly requests that expansion. Never silently turn a six-platform pilot into a Hook-only slot or a default daily target set.
- Set `isOriginal: true` whenever the platform UI/API supports it. Never add an optional AI-generated label or AI-related tag.

## Default Xiaoyi natural-narration + steady-push template

Use treatment id `xiaoyi-natural-steady-push-v2` for new videos. The approved standalone pilot remains excluded from Hook-only decisions. For future Hook-only pairs, apply the complete treatment identically to both arms; existing pairs keep their original immutable fingerprint.

- Lock the render at 20.000 seconds / 600 frames at 30 fps. Use the five acts `hook, emotion, observe, clarity, heal` with frame lengths `[128, 102, 111, 125, 134]`; the first act is exactly 128 frames (4.267 seconds).
- Narrate with `zh-CN-XiaoyiNeural` at `+0%` rate and `-2Hz` pitch. Do not substitute a different voice, rate, pitch, or scene clock within the same treatment.
- Keep the complete BGM at its original static mix: no BGM gain reduction, no dynamic ducking, and no sidechain avoidance under narration. Remove the separate opening “ding” only; do not trim or mute the remaining BGM.
- Use `steady-single-push`: start at frame 12 of every scene, push once for 60–66 frames with quintic smootherstep, and increase scale by exactly `0.015`. Never add vertical drift, scale return, bounce, oscillation, or a second push.
- Hold the final position for at least 12 frames before a transition. During every 18-frame / 0.6-second star-mask crossfade, freeze character scale, container size, and camera position. Keep one consistent frame size across all five scenes.
- Encode audio as AAC at 48 kHz. Set `isOriginal: true` whenever the target supports it; do not apply an AI-generated label or AI-related tag.
- The default pilot target set is Douyin, Kuaishou, and Channels. When, and only when, the account owner explicitly requests it, this separately registered Xiaoyi sound pilot may expand to Bilibili, Baijiahao, and Tencent Video. Record the explicit expansion, release identity, video hash, and each platform target separately; do not add those platforms to `hook-copy-20s-002` or any normal DailyContentRun.
- For Bilibili relationship/life pilots, use leaf tid `21` (`生活 / 日常`), not parent tid `160`. Clear inherited draft tags first and require the final selected-tag set to equal the release manifest. If category or tags cannot be read back exactly before submit, stop that lane without clicking submit.
- Xiaohongshu remains absolutely isolated in every case: no target creation, QianFan action, session use, sync, schedule, upload, publication, or account check.
- Before upload, produce and QA a platform-specific cover for every target. Validate its exact required ratio(s), safe area, 180 px readability, canonical-art source, stored absolute path, and file hash. If the current QianFan/platform capability does not expose the accepted cover requirement or the cover fails QA, block only that platform; never substitute an unrelated cover or bypass the gate.
- A target is `scheduled` only after a remote `remoteScheduleId`, `platformWorkId`, publish URL, or creator-center schedule record is captured with timestamp. A local package, upload request, HTTP 200, queue entry, or `submitted` result remains unconfirmed and must not be retried until read-only reconciliation.

## Daily 10:17 workflow

Preview without side effects:

```bash
cd ~/Documents/图文/xingxing-emotion-video-system/emotion-card-video-studio
.venv/bin/emotion-card content-status
.venv/bin/emotion-card program-status
.venv/bin/emotion-card daily-program --date YYYY-MM-DD
```

The scheduled job uses one resumable command:

```bash
.venv/bin/emotion-card daily-program \
  --date YYYY-MM-DD --write --execute-local --through schedule \
  --remote-adapter emotion_card_studio.emotion_daily_adapter:from_environment
```

Internally it must:

1. Read only confirmed works and comparable 2/24/72-hour snapshots. Missing data stays missing.
2. Output `多做 / 少做 / 今日测试`, select the scheduled A or B arm, and persist the scored topic, copy, actions, scene moods, motion/sound cues, and ratio-specific covers.
3. Materialize Episode v5, render one 20-second video, and run character, color, transition, subtitle, audio, cover, duration, and hash QA.
4. Run QianFan capability and read-only preflight for exact `episode + platform + account + variant + videoHash`.
5. Submit platform-side 20:30 schedules and persist per-platform evidence. At 19:30, any unconfirmed platform becomes blocked; never switch to immediate posting.

Recovery resumes the same immutable run and slot. It does not create a new hash, batch, or upload.

## Visual/audio v3 gates

- Frame 0 is full color with complete Hook and a character at 36%–40% screen height.
- Never show `full color → full sketch` regression. Only a local 0.3–0.9-second wand/glow pass is allowed; later scenes transition full-color to full-color through a star/object mask.
- In 0–3 seconds show distinct semantic events without violating the steady camera: keyword/prop/expression changes plus the single 1.5% smootherstep push. Do not reintroduce the old 2%–4% push, drift, or bounce rule.
- Use role labels and semantic scene light such as phone glow, rain window, calendar, table, doorway, warm lamp, or shared starlight.
- Covers use canonical art, not an in-progress video frame. Each ratio headline is 8–14 Chinese characters, at most two lines, phrase-safe, and readable at 180 px.
- New post-cutover Hook pairs use Xiaoyi narration and the complete static BGM with no opening chime. Both arms must share the same audio bytes/timing except where Hook narration necessarily differs. Keep AAC 48 kHz, True Peak below `-1 dBFS`, and A/V drift within 50 ms. Existing no-voice pairs remain unchanged.

## Remote evidence boundary

- Apply these rules only to permitted targets. Xiaohongshu remains `manual_official_only`, including for remote-evidence collection or reconciliation.
- A local pack, HTTP 200, queue row, click, `submitted`, `scheduled_pending`, `pending_schedule`, or `unresolved` is not remote scheduling proof.
- A platform cell is scheduled only with a remote schedule/work/creator-center reference, observed timestamp, and evidence. Preserve successful cells when another platform fails.
- Login/captcha must preserve the session and stop for the user. Unknown results are hard no-resend until read-only reconciliation.
- Published means a work ID/URL or linked creator-center work. Never manufacture metrics, fill missing values with zero, or pool platform results.

## Experiment decision

Douyin is primary; Kuaishou and Channels are independent replications. Do not judge until at least eight valid pairs and 400 cumulative Douyin views per arm. Promotion requires 7/8 same-direction pairs, paired median lift of at least 20%, guardrails no worse than 20%, and replication on Kuaishou or Channels. Only insufficient exposure may extend to 12 pairs, requiring 10/12 same-direction pairs; otherwise record `inconclusive`.

After Hook is decided, test duration by platform, then semantic sounds, BGM, background, cover, and publish time—one variable at a time.

## Benchmark grammar pilot (local-only)

The independent `benchmark-grammar-001` pilot borrows a short-hook, single-anchor
composition without replacing the five-act 20-second default or entering the
Hook experiment. Its source of truth is
`emotion-card-video-studio/content/experiments/benchmark-grammar-001.json` and
its render profile is `content/render-profiles/benchmark-grammar-v1.json`.

- Render with `hyperframes-sticker-17s-v2`: 510 frames, 1080x1920, 30 fps,
  three beats `[170, 160, 180]`.
- The first frame must show the complete character and a concrete two-line
  Hook; every 0.8–1.4 seconds needs a caption, expression, gaze, gesture, prop,
  camera or star event.
- Scene transitions retain at least six overlapping frames. Empty transition
  frames, black fades, full-sketch resets and vertical drift fail QA.
- Keep canonical character hashes, Xiaoyi `+0% / -2Hz`, the full static BGM,
  no ducking and no opening chime.
- New benchmark copy tests use `positive-relationship-micro-moment-v1`:
  a concrete remembered/caring behavior, one positive response the viewer can
  say aloud, then a comfortable two-person result. Test at least three fresh
  topics before changing direction; do not replace this with accusation-led
  copy or abstract healing slogans.
- Keep the approved music bed at source volume `1.0`. A copied audio file or an
  audio stream alone does not prove music is audible; verify the narration-free
  final hold contains the BGM at a phone-audible level.
- Do not infer the canonical character from a directory name such as
  `formal`, `production`, or `canonical`. Read the locked source manifest and
  compare the candidate artwork with the user-confirmed master first.
- Before the first render of a new character/action set, create a contact sheet
  with source paths and SHA-256 values and stop for user confirmation. Until
  that lock exists, do not render, publish, or use ImageGen as a fallback.
- A rejected or deleted asset pack must remain unavailable to selectors; its
  deletion/tombstone record is the only retained reference.
- Derive `9:16`, `3:4`, `4:3` and `16:9` covers from the approved first-scene
  artwork; never crop a rendered video frame. The preview normalizes a short
  TTS file into an ignored 17-second audio bed without changing the source.
- Validate without side effects:

```bash
emotion-card validate-benchmark \
  content/experiments/benchmark-grammar-001.json
python scripts/render_benchmark_preview.py \
  --narration /absolute/path/to/xiaoyi-narration.mp3
```

The preview is local-only and must not create a QianFan target, publish slot or
platform request. Compare its platform-specific metrics independently; never
pool raw views across platforms.

## Positive micro-moment 17-second batches

The explicitly authorized batches
`20260810-positive-micro-moments-17s-001` (10 items) and
`20260813-positive-micro-moments-17s-002` (30 items) extend the approved
benchmark grammar into bounded six-platform content screens. They do not
change the normal 20-second Hook experiment or create a general permission for
future benchmark episodes.

- Copy shape is fixed: a visible caring behavior, a positive sentence the
  viewer can say aloud, then a comfortable two-person result.
- Render with `hyperframes-sticker-17s-v2`, Xiaoyi `+0% / -2Hz`, full
  `emotional-pentatonic` at volume `1.0`, no ducking and no opening chime.
- The engagement question is visible only and must not enter the narration.
- Use only `user-confirmed-canonical-v1`; all nine pose frames in one video
  must have distinct real SHA-256 values.  `pass-star` and `shared-star` count
  as one image because their bytes are identical.
- Produce 9:16, 3:4, 4:3 and 16:9 covers from the approved first-scene art.
- Local production entry:

```bash
python scripts/positive_micro_batch.py --validate-only
python scripts/positive_micro_batch.py --jobs 2
```

- The release boundary is the exact item registry in the selected batch
  manifest. Never infer or append additional IDs. The approved target
  set is Douyin, Kuaishou, Channels, Bilibili, Baijiahao and Tencent Video;
  Xiaohongshu remains zero-operation.
- The 30-item batch uses an item-first barrier: preflight all six targets,
  obtain an exact Tencent schedule receipt first, schedule the other five in
  parallel, and advance only after the current item has 6/6 remote evidence.
  Never let five platforms run ahead when Tencent or another target is blocked.
- Tencent submissions are limited to three per account per Shanghai calendar
  day across all batches; unresolved or unknown submit-capable attempts consume
  the quota. Baijiahao is submitted only inside its seven-day remote window.
  For the 30-item batch, target times remain exactly six hours apart from
  `2026-08-19 22:00` through `2026-08-27 04:00` unless a new immutable manifest
  is explicitly approved before the first remote slot.
- A write requires
  `--execute --confirm-publish --all-six-platforms`; a remote ID, work ID or
  exact creator-center record with the exact target minute is still mandatory.
  A captcha stops the current item wave while preserving completed cells.
  `submitting`, unknown results, and conflicting active attempts remain
  no-resend and block later items until official read-only reconciliation.
- QianFan must hold a global `(platform_key, account_id)` lane lock across all
  pilots and batches. A second batch may not upload through the same platform
  account while any other attempt is `submitting`.

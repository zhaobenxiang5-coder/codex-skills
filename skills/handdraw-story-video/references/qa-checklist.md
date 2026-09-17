# QA recovery checklist

## Hard video checks

- 1080×1440, 30fps, H.264, AAC, yuv420p.
- Duration within 10 percent of the requested target.
- Audio/video duration difference below 0.3 seconds.
- Global background music is present when enabled, fades at both ends, and its configured volume is no higher than 0.55.
- Narration remains plainly intelligible over music and typewriter clicks.
- Required scene count and all formal assets present.

## Frame checks

For every scene inspect three frames in `output/contact-sheet.png`:

1. `START`: almost blank warm paper.
2. `SKETCH`: narration partly typed and gray pencil drawing partially revealed.
3. `COLOR`: full illustration colored and held before the page cut.

Reject scenes with an instant full-image fade, unchanged middle/final frames, gibberish text inside the illustration, inconsistent people, duplicated limbs, overflowed narration or repeated compositions.

## Recovery

Image failure:

```bash
uv run handdraw rerun <project-id> --scene scene-003 --from image
```

Voice failure:

```bash
uv run handdraw rerun <project-id> --scene scene-003 --from audio
uv run handdraw assets <project-id> --scene scene-003
```

After any correction, rerun full render and QA. Do not accept a blank/silent fallback.

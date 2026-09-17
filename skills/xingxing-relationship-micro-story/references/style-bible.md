# 淡彩关系微剧风格圣经

## Format lock

- Canvas: 1080×1920 portrait, 30 fps, exactly 17 seconds / 510 frames.
- Structure: five scenes with one clear adult action each.
- Surface: warm off-white fibrous paper, loose indigo construction lines, sparse blue-gray watercolor wash.
- Emotional color: cold blue establishes need; one restrained orange light source reveals care.
- Typography: captions are live HTML text in natural negative space. No white card, pill, dialog box, or text baked into generated art.

## Palette

| Role | Color | Use |
|---|---|---|
| Paper | `#F6F0E6` | Base field |
| Ink | `#263A61` | Linework and primary copy |
| Cold wash | `#AAB7C4` | Weather, distance, quiet |
| Blush | `#D58C87` | Human response, sparingly |
| Warmth | `#E47B31` | One caring action or payoff |

Orange is a narrative signal, not decoration. Keep most frames under roughly ten percent orange coverage.

## Image direction

Use `couple-v1-reference.png` on every generation. Ask for the same two mature Chinese adults, natural anatomy, restrained expressions, editorial watercolor on textured paper, and useful empty space for captions. The visible action must be legible without text.

Negative prompt: childlike or teenage faces, anime, chibi, glossy 3D, black-gold luxury treatment, photorealistic skin, dense crosshatching, exaggerated crying, extra fingers, duplicate people, embedded text, logo, watermark, UI, white card.

## Motion

- Use deterministic 1.2–1.5% pushes, gentle pans, opacity, blur crossfades, and one warm light leak at the proof beat.
- Animate transforms and opacity; avoid layout-thrashing properties.
- No random drift, bounce, rubber motion, rapid zoom, or decorative particles.
- Captions enter as phrase-sized blocks and remain readable inside safe margins: 74 px left/right, 96 px top, 120 px bottom.

## Five-beat rhythm

1. `need` — establish a small discomfort or unspoken need.
2. `care` — the partner acts before being asked.
3. `proof` — a close physical detail makes care visible.
4. `response` — one restrained line or look acknowledges it.
5. `meaning` — conclude what the action says about the relationship; show the unchanged canonical duo seal small at the end.

The final seal is a brand signature, never a story character or generated illustration.

## v2 action-first opening

`hyperframes-story-sketch-17s-v2` preserves every format lock above. The first scene must already show the decisive hand/prop action on frame zero, then use a deterministic crop reveal so the action is legible by 1.2 seconds and its human result is visible by 2 seconds. The first caption appears by 0.2 seconds and contains at most 12 Chinese characters. Do not use a title card, empty establishing shot, wide master, or fade from black before 2 seconds.

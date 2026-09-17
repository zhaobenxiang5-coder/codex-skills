# Storyboard and character continuity

## Project contract

`project.json` is the only task-state source. Valid states are:

```text
draft → storyboarded → generating → assets_ready → rendering → rendered → done
                                                        ↘ failed / qa_failed
```

Default audio config:

```json
{
  "voice": "zh-CN-XiaoxiaoNeural",
  "voiceRate": "-5%",
  "voicePitch": "-3Hz",
  "typewriterSound": true,
  "backgroundMusic": true,
  "backgroundMusicTrack": "warm-pentatonic",
  "backgroundMusicVolume": 0.45
}
```

The bundled music is one global looping track. Do not attach it to individual scenes or raise it above `0.55`.

Each scene must contain:

```json
{
  "id": "scene-001",
  "narration": "古时候，北方边塞住着一位老人。",
  "characters": ["塞翁"],
  "emotion": "平静",
  "shot": "环境远景",
  "composition": "塞翁站在茅屋前，远处有山和木栅栏",
  "imagePrompt": "...",
  "colorImage": "scenes/scene-001/color.png",
  "sketchImage": "scenes/scene-001/sketch.png",
  "audio": "scenes/scene-001/voice.wav",
  "durationInFrames": 150,
  "status": "assets_ready"
}
```

## Character bible

Write `character-bible.json` before the cast image. For every recurring character record:

- `id` and Chinese display name.
- approximate age, gender and body build.
- face shape, eyes, hair, beard and distinguishing features.
- exact clothing pieces and colors.
- relative height to other characters.
- allowed emotional range.
- forbidden changes.

Keep the same description verbatim in every relevant image prompt. The cast sheet and previous accepted scene are visual anchors; prose alone is not enough for continuity.

## Shot rhythm

Do not repeat the same framing in adjacent scenes. Rotate among environment wide shot, character medium shot, key-object close-up, two-person interaction, face close-up and action medium shot. Keep the upper 24 percent of every illustration almost empty.

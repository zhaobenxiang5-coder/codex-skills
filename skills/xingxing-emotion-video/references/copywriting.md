# 醒醒别再猜文案系统

## 1. One-topic input

Accept a short topic such as:

- 他回了消息，却没有接住我的情绪
- 总要我主动的关系还要不要继续
- 对方一冷淡，我就怀疑自己不值得被爱

Infer audience and angle from the topic unless ambiguity would materially change the story.

## 2. Diagnose before writing

Read the latest comparable performance snapshots before choosing the problem to solve:

```bash
cd ~/Documents/图文/xingxing-emotion-video-system/emotion-card-video-studio
.venv/bin/emotion-card performance-history --limit 10 --hours 2,24,72
```

Use `--db PATH`, `--episode-id ID`, or `--project-id ID` only to narrow or relocate the read-only query. Never manufacture missing snapshots or compare raw views from different platform/time windows as if they were controlled results.

- High 2-second bounce or average viewing near the opening duration: prioritize frame 0, hook specificity, character visibility, and reveal speed.
- Better 2-second retention but a later drop: simplify abstract body copy and reduce repeated animation.
- Adequate retention but no saves, shares, comments, or follows: strengthen beat 4's shareable line and beat 5's specific question.
- Low distribution alone does not prove the copy, character, or background failed.

Darkness is not the variable by itself. Keep the dark healing identity, but make frame 0 information-rich with a full character, complete hook, local glow, and visual depth. Do not replace “dark and empty” with “bright and empty.” In tests, change one major variable at a time.

## 3. Topic and Hook selection

Every ready topic records six integer scores from 1–5:

`universality`, `specificity`, `conflictStrength`, `solutionValue`, `ipFit`, and `freshness`.

Reject a topic when the sum is below 24, or when `specificity` or `solutionValue` is below 4. The first eight Hook pairs follow the fixed pillar quota `猜测与误解3 / 冲突修复2 / 需求表达2 / 边界与共同决定1`.

Generate at least eight original hook candidates. Score each from 0-100:

- pain recognition: 25
- concrete relationship behavior: 20
- curiosity and forward pull: 20
- emotional safety: 15
- 醒醒 brand fit: 10
- originality against the registry: 10

Subtract points for clichés, gender attacks, fake certainty, diagnosis, commands, or copying known posts. Select one hook and record a one-sentence reason.

Every selected Hook is exactly two lines and 12–18 Chinese characters excluding the line break. It puts its strongest conflict in the first 0–1 second and contains at least one concrete anchor:

| `hookType` | Required anchor | Example |
|---|---|---|
| `observable_behavior` | A visible action | 吵完架后，又是你先找他 |
| `direct_quote` | Something actually said | “随便你”，又成了最后一句 |
| `time` | A specific duration/time | 三天没联系，你还在等 |
| `count` | A meaningful count | 第五次了，还是你先道歉 |
| `reversal` | A light but concrete reversal | 他每条都回，却从不问你 |

`concreteAnchor` must be a non-empty phrase that appears in the selected first-scene hook and matches `hookType`. Abstract words such as “沉默、情绪、回应、稳定的爱” may support a sentence, but cannot be the whole opening.

## 4. Five-beat writing

Use the relationship `星星提出困惑 → 醒醒观察并给话术 → 双人把结果落到关系里`.

| Beat | Character function | Copy job |
|---|---|---|---|
| hook | 星星 names a specific conflict | Strongest tension immediately; 1-2 lines |
| emotion | 星星 receives the viewer's feeling | Warm, specific, no mind-reading |
| observe | 醒醒 answers with one observable behavior | A concrete thing the viewer can look for |
| clarity | 醒醒 gives a sentence to say aloud | The actual request must appear in the video, not only the caption |
| heal | 双人 shows the shared result | Healing conclusion plus a specific `engagementPrompt` overlay |

Each line must be at most 12 characters. Total scene copy should usually be 42-65 Chinese characters. Keep one idea per beat.

Preferred pattern:

1. `吵完架后 / 又是你先找他`
2. `你先开口 / 也许只是怕走散`
3. `先看他会不会 / 主动把话说清楚`
4. `我愿意和好 / 但不愿独自修复`
5. `和好要两个人 / 一起走回来`
6. End overlay: `你们吵完，通常谁先开口？`

The prompt must ask about a concrete experience or choice. Avoid generic prompts such as `你怎么看？`, `同意吗？`, or forced engagement.

## 5. Voice

- First receive, then clarify: `先抱抱你，再陪你清醒` is the brand attitude, not mandatory repeated scene copy.
- Use `你可以看见的行为` instead of guessing what the other person secretly thinks.
- Avoid `他就是不爱你`, `好男人一定`, `恋爱脑没救了`, or clinical labels.
- Avoid mechanically repeating `真正的爱` in every episode. Vary the conclusion while keeping the brand stable.
- Keep 醒醒 reliable, 星星 emotionally expressive, and both characters non-hostile.

## 6. Experiment discipline

- The only active experiment is `hook-copy-20s-002`, using one 20-second post per platform per day.
- Schedule A/B counterparts 48 hours apart with an `A/A/B/B` interleave. Only Hook text differs; body, actions, background, title, ratio covers, BGM, CTA, and fixed-treatment fingerprint must match.
- Do not change first-screen action, music, timing, cover, or background between arms and then call the result a Hook test.
- Douyin is primary. Kuaishou and Channels validate independently; Xiaohongshu is excluded from automation and experiment collection.
- Existing pre-cutover pairs keep their original no-voice fingerprint. New
  post-cutover pairs use Xiaoyi `+0% / -2Hz` on both arms, with the same
  full-BGM, no-ducking and no-opening-chime treatment. `opening-only` limits
  extra semantic sound effects; it does not disable the locked narration.
- After Hook has a valid decision, duration tests are platform-specific: Douyin 16 vs 20, Kuaishou 16 vs 20, Channels 20 vs 25. Do not start them early.

## 7. Supporting copy

For every accepted episode, also create:

- caption: 50-120 Chinese characters, expanding the observation rather than repeating all five scenes;
- hashtags: 3-8, including `#醒醒别再猜` and topic-specific tags;
- platform variants in `platformCopy` when publishing is expected:
  - short-video: direct opening and short CTA;
  - Xiaohongshu: create a local manual-official package only; never log in, schedule, sync, or publish automatically;
  - long-video/community: explanatory title and context;
  - WeChat article: a 350-500 character companion article outline when requested.

Do not hard-code platform character limits without checking current official rules at publish time.

## 8. Originality and accumulation

- Read recent `content/registry.jsonl` rows and related archived episode JSON files.
- Reject the same hook, near-identical tension, or the same five-beat argument with superficial synonym changes.
- A repeated topic is allowed only with a materially different audience, behavior, or conclusion.
- Reject a new episode whose first two action/image beats exactly repeat the preceding accepted episode, even if later scenes differ.
- Preserve rejected hook candidates; they can seed future episodes only after being re-evaluated against the current registry.

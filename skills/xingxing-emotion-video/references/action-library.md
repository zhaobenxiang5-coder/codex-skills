# 醒醒别再猜正式动作库

Select actions by meaning first, then use recent-history rarity as the tie-breaker. Do not shuffle randomly and do not reuse the old five-action default just because it is valid.

## 醒醒 `xingxing`

| Action id | 画面 | 优先语义 |
|---|---|---|
| `standard` | 标准站姿 | 中性说明、稳定陪伴 |
| `phone` | 看手机 | 消息、等待、观察回应 |
| `heart` | 抱心 | 珍惜、自爱、接住情绪 |
| `umbrella` | 撑伞 | 支持、陪伴、保护 |
| `shield` | 举盾 | 边界、自我保护、拒绝伤害 |
| `cut_rope` | 剪断绳子 | 停止纠缠、退出消耗、放下 |
| `water_plant` | 浇花 | 共同经营、成长、持续投入 |
| `sleep` | 睡觉 | 休息、抽离、停止内耗 |
| `lantern` | 提灯 | 看清、方向、清醒结论 |

## 星星 `xingxing_female`

| Action id | 画面 | 优先语义 |
|---|---|---|
| `standard` | 标准站姿 | 中性开场、表达自己 |
| `hug_star` | 抱星 | 自我安慰、珍惜、接住情绪 |
| `phone_hesitate` | 看手机犹豫 | 消息、等待、反复猜测 |
| `head_down` | 低头委屈 | 委屈、失落、疲惫 |
| `wipe_tear` | 擦泪 | 难过、受伤、情绪承接 |
| `look_up` | 抬头观察 | 看行为、确认、重新看见 |
| `blink` | 眨眼 | 停顿、轻松、温柔转折 |
| `lantern` | 提灯 | 寻找方向、主动清醒 |

## 双人 `duo`

| Action id | 画面 | 优先语义 |
|---|---|---|
| `side_by_side` | 并肩 | 共同面对、陪伴、平等 |
| `pass_star` | 递星 | 双向回应、主动给予、互相修复 |
| `shared_star` | 共同抱星 | 共同经营、共享责任、关系共建 |
| `comfort` | 安慰 | 安慰、支持、治愈收尾 |

`pass_star` and `shared_star` currently point to identical approved painterly pixels. They remain separate semantic names for compatibility, but must not appear together in one episode and do not count as a visual change between episodes.

## Selection gate

1. Draft the five scene texts first.
2. For each beat, consider two or three semantically suitable actions.
3. Read `visual-history --limit 10`; among equally suitable choices, prefer the least recently used action.
4. In `hook-copy-20s-002`, the role order is fixed to `xingxing_female, xingxing_female, xingxing, xingxing, duo`; choose semantically different actions inside that grammar.
5. At least three of five beat images must differ by actual visual identity from the previous episode; different filenames with identical pixels do not count.
6. Reject a sequence identical to any of the latest ten episodes.
7. Record the selected canonical ids, actual image identities, and a concrete `actionReason` in the episode JSON. A/B counterparts reuse the same five actions; novelty is enforced between topics, not between Hook arms.

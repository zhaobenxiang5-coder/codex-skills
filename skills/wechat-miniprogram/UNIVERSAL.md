# wechat-miniprogram-builder · Universal (tool-agnostic) guide

> 用 AI（氛围编程 / Vibe Coding）从 0 到 1 做微信小程序、跑通被动收入闭环的**工具无关方法论**。
> 本文件供任意支持「项目上下文 / 系统指令」的 AI 工具使用——Cursor、Claude、Claude Code、Cline、通义灵码、CodeBuddy、ChatGPT 自定义指令、WorkBuddy 等，不绑定任何单一工具。

## 这是什么

把「AI 做微信小程序」的实战经验，整理成一份给 AI 助手看的程序化工作流。它覆盖一个微信小程序从想法到矩阵化运营的全生命周期：

**选题 → 注册备案 → AI 开发 → 变现 → 审核发布 → 推广 → 矩阵**

配套文件：
- `references/` 按阶段拆分的详细方法论（本文件只做索引与决策）
- `assets/` 可直接复制的交付物模板（提示词、检查清单、小红书笔记）
- `SKILL.md` WorkBuddy 专用入口（可选；用其他工具无需它）

## 怎么用（任意 AI 工具都行）

把本仓库作为**项目上下文 / 系统指令**提供给你的 AI，然后告诉它读哪些文件。例如：

> 先读 `UNIVERSAL.md` 和 `references/02-topic-selection.md`，帮我想 5 个适合个人开发者做的小程序方向。

AI 会按下面的决策树自动加载对应阶段的方法论。无需安装插件，也无需特定平台。

## 决策树：该读哪一份

| 你的目标 | 读这份 |
|---|---|
| 不知道做什么 / 想找方向 | `references/02-topic-selection.md` |
| 想赚钱 / 了解变现 | `references/01-monetization-logic.md` |
| 要注册账号 / 备案 | `references/03-register-filing.md` |
| 写代码 / 接广告 | `references/04-dev-and-ads.md` |
| 上云 / 接 AI 能力 | `references/05-cloud-activation-ai.md` |
| 提交审核 / 被拒修复 | `references/06-submit-review.md` |
| 做推广 / 涨量 | `references/07-promotion-growth.md` |
| 批量复制 / 矩阵 | `references/08-matrix.md` |

## 五条底线（合规）

1. **平台规则会变**：微信类目、流量主门槛、广告能力、API 权限以官方最新文档为准。
2. **不承诺收益**：所有收入、UV、eCPM、案例只作参考区间，绝不构成收益承诺或"保证结果"。
3. **激活码模式已违规**：原教程 2026/4/21 标注激活码方式存在违规，仅作学习引导，**请勿上线**；付费请走企业/个体户主体 + 微信官方支付。
4. **个体主体限制**：个人主体无法接入微信支付；程序内直接调用 AI 能力通常审核不过（需企业资质或个体户+资质）。给个人用户默认走广告变现路线。
5. **密钥安全**：AppSecret / API Key / 云环境密钥仅存环境变量或密钥管理器，勿写入公开仓库。

## 阶段概览

1. **变现逻辑** `references/01-monetization-logic.md`：广告 vs 订阅 vs 激活码，帮你选路线。
2. **选题** `references/02-topic-selection.md`：三标准、找需求、五类方向。
3. **注册备案** `references/03-register-filing.md`：个人 vs 企业、注册/备案/认证、避坑。
4. **开发 + 广告** `references/04-dev-and-ads.md`：开发流程、提示词写法、四种广告与摆放法则。
5. **云开发 / 激活码 / AI** `references/05-cloud-activation-ai.md`：云开发、激活码(已违规)、AI 接入(需企业)。
6. **审核发布** `references/06-submit-review.md`：上传前清单、提审、被拒修复。
7. **推广** `references/07-promotion-growth.md`：小红书冷启动、四类笔记、标题公式、执行日历。
8. **矩阵** `references/08-matrix.md`：矩阵化运营、成本测算、批量技巧、常见坑。

## 可直接复制的模板

- `assets/prompt-recipes.md` — 万能提示词模板 + 各类型小程序提示词示例
- `assets/release-checklist.md` — 上线前检查清单
- `assets/xhs-note-templates.md` — 小红书笔记模板

---

MIT License。

---
name: wechat-miniprogram
description: This skill should be used when the user wants to build, launch, monetize, or promote a WeChat mini-program with AI (vibe coding) — including topic selection, account registration & ICP filing, AI-assisted development with TRAE/WeChat DevTools, ad monetization (流量主), review & publish, and growth/matrix operations. Trigger on keywords like 小程序, 微信小程序, 流量主, 小程序变现, 备案, 微信开发者工具, TRAE, 小程序开发, 激活码, 小程序推广, 小程序矩阵.
---

# 微信小程序

> 本文件是 WorkBuddy 专用入口（带 `name`/`description` 元数据，用于自动触发）。**任意其他 AI 工具请用 `UNIVERSAL.md`**（内容等价、工具无关）。
> This is the WorkBuddy-only entry (with `name`/`description` metadata for auto-trigger). **For any other AI tool, use `UNIVERSAL.md`** (equivalent, tool-agnostic).

## Overview

本技能把"用 AI（氛围编程 / Vibe Coding）从 0 到 1 做微信小程序并跑通被动收入闭环"的完整方法论，封装成 AI 助手可直接调用的程序化工作流。覆盖：

```
选题 (Topic) → 注册备案 (Register/Filing) → 开发 (Dev) → 变现 (Monetize)
   → 审核发布 (Review/Publish) → 推广 (Promotion) → 矩阵 (Matrix)
```

当用户处于任一阶段，或要产出具体交付物（选题卡、开发提示词、上线检查清单、推广笔记模板）时，加载对应 `references/*.md`，并从 `assets/` 取模板。

## 五条不可逾越的底线（每次给建议都要遵守）

1. **平台规则会变。** 微信类目、流量主门槛、广告能力、API 权限、审核尺度都会变化，以当前微信公众平台后台与官方文档为准；引用具体数字（如 500 UV、30 元认证）时标注"以官方最新为准"。
2. **不承诺收益。** 所有收入、UV、eCPM、案例只能作为参考区间，绝不构成收益承诺或"保证结果"。
3. **激活码模式已违规。** 教程原文 2026/4/21 明确标注：激活码方式存在违规，仅作开发学习引导，**不要上线**。涉及付费请走企业/个体户主体 + 微信官方支付或虚拟支付接口。
4. **个体主体限制。** 个人主体无法接入微信支付；且「程序内直接调用 AI 能力」的代码审核通常过不了（需企业资质或个体户+资质）。给个人用户方案时默认走广告变现路线。
5. **密钥不外泄。** AppSecret、API Key、云环境 SecretId/Key、Token 只放环境变量/密钥管理器，不写进公开笔记、截图、代码仓库与分享文档。

## 决策树——加载哪个 reference

| 用户意图（信号） | 加载文件 |
| --- | --- |
| 变现逻辑 / 广告 vs 订阅 vs 激活码 | `references/01-monetization-logic.md` |
| 选题 / 需求判断 / 做什么方向 | `references/02-topic-selection.md` |
| 注册小程序 / 备案 / 认证 / 个人 vs 企业 | `references/03-register-filing.md` |
| 开发 / 怎么跟 AI 说需求 / 广告接入 | `references/04-dev-and-ads.md` |
| 云开发 / 激活码(已违规) / AI 接入(需企业) | `references/05-cloud-activation-ai.md` |
| 上传 / 审核 / 被拒修复 / 版本号 | `references/06-submit-review.md` |
| 推广 / 小红书冷启动 / 笔记标题 | `references/07-promotion-growth.md` |
| 矩阵化 / 多小程序运营 / 批量 | `references/08-matrix.md` |

跨阶段请求（如"帮我选题并写开发提示词"）可同时加载多个 reference。

## 复用资产（可直接复制到用户工作区）

- `assets/prompt-recipes.md` — 万能提示词模板 + 各类型小程序提示词示例
- `assets/release-checklist.md` — 上线前检查清单（可勾选）
- `assets/xhs-note-templates.md` — 小红书笔记模板（4 类 + 标题公式）

## 使用方式

1. 用决策树判断用户处于哪个阶段。
2. 加载对应 reference 获取详细方法、步骤与陷阱。
3. 用户要具体交付物时，从 `assets/` 取模板并填充其项目信息。
4. 始终遵守五条底线，尤其是收益承诺、激活码违规、个体主体限制。
5. 产出开发类内容默认给可运行的微信原生小程序提示词（WXML/WXSS/JS），先大后小：先把核心功能跑通，再调细节。

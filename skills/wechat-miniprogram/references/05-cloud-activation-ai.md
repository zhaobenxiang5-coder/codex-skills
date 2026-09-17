# 05 · 云开发 / 激活码（已违规）/ AI 接入（Cloud, CDK, AI）

> 阶段目标：说明小程序后端能力（云开发）、已被判违规的激活码模式、以及 AI 能力接入的主体限制。

## 一、微信云开发（CloudBase）

- 个人主体也能开通「云开发」环境，获得数据库 + 云函数 + 存储，作为数据底座。
- 领取路径（以官方当前为准）：后台 → 行业能力 → AI 小程序成长计划 → 参与计划 → 领取云开发资源与模型 Token。
- 关键配置：
  - 复制云环境 ID 配置到 `app.js`。
  - 数据库集合在云开发控制台创建（如 `articles`、`categories`）。
  - **云函数目录坑**：须在 `project.config.json` 指定 `cloudfunctionRoot`（AI 有时误写进 `app.json`）。右击云函数目录「创建并部署：云端安装依赖」。
  - 导入数据：JSON 格式，按 AI 给的字段建集合。

## 二、激活码（CDK）模式 —— ⚠️ 已违规，仅学习

> **合规红线（务必告知用户）**：原教程 2026/4/21 标注——激活码方式存在违规，功能仅作开发学习引导，**不要上线**。
> 原理（了解即可，勿部署）：外部店铺卖 CDK → 用户回小程序输入 → 云函数 `handleActivation` 校验 → 开通权益。它试图绕过"小程序内交易"限制，但已被微信判定违规。
> **正确付费路径**：企业/个体户主体 + 微信官方支付或虚拟支付接口，不要再用激活码绕过审核。

## 三、程序内接入 AI 能力 —— 需企业资质

- 个人/个体户直接在小程序端调用 AI（如 `wx.cloud.extend.AI`）生成内容，**代码审核通常过不了**。
- 有企业资质的，可参考官方接入指引，用混元/DeepSeek 等模型流式生成内容。
- 示例调用骨架（仅企业资质可用）：

```javascript
const res = await wx.cloud.extend.AI.createModel("hunyuan-exp").streamText({
  data: {
    model: "hunyuan-turbos-latest",
    messages: [{ role: "user", content: "你好" }]
  }
});
for await (let event of res.eventStream) {
  if (event.data === "[DONE]") break;
  const data = JSON.parse(event.data);
  const text = data?.choices?.[0]?.delta?.content;
  if (text) console.log(text);
}
```

## 四、给 AI 的交付动作

- 默认不建议个人用户做"小程序内付费 + AI 生成"组合，明确告知主体限制。
- 如需后端，推"云开发"并给配置要点（环境 ID、云函数目录坑）。
- 绝对不要产出可上线的激活码逻辑；如用户坚持，明确拒绝并给合规替代方案。
- 涉及密钥（云环境 SecretId/Key、模型 Token）只放环境变量，不写进代码/仓库。

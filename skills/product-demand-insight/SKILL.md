---
name: product-demand-insight
description: 面向实体消费品和跨境电商的证据驱动产品开发需求分析。用户要求做用户画像、痛点/痒点/爽点、评论与趋势洞察、产品机会、P0/P1/P2需求排序、实体商品开发 brief、找货前需求判断，或把 MarketEvidence、TrendDemandOpportunity 转成结构化开发需求时使用。输出必须区分事实、推断和假设，绑定证据引用与反证，补充结构、材质、尺寸重量、目标成本、包装物流、认证、打样测试和验收指标，并保留人工确认及下游闸口；不能把 AI 文案直接当真实需求。
---

# Product Demand Insight

把市场信号转换为可追溯、可验证、可找货的实体商品开发需求。保留原技能中有价值的用户画像、痛点/痒点/爽点和产品机会框架，但把证据、实体商品约束和状态闸口放在文案之前。

## 硬边界

- 将每个关键结论标为 `fact`、`inference` 或 `hypothesis`。
- 只把能回查的来源写成 `fact`；每条事实必须带 `evidenceRefs`。
- 只有产品想法、商品名或类目词时，使用 `hypothesis-only`，不得宣称需求已验证。
- 不把销量、榜单、供应商标题、单条短评或 AI 常识单独当成需求证明。
- 不把 1688 当需求真相源；1688 只用于过闸口后的找产品和供应事实核验。
- 需求阶段不得创建或伪造 `ProductTruth`、商品、图片任务、Listing 或发布状态。
- 未知的价格、尺寸、材料、重量、认证、MOQ、复购率和市场规模写 `null` 或 `unknown`，不得补猜。
- 将营销文案与功能事实分开；“有画面感”不能替代可测试的产品要求。
- 默认只读分析。没有用户明确要求，不写入业务系统、不触发找货、生图、上架或发布。

## 工作流

### 1. 锁定分析范围

确定以下范围；能从上下文安全推断时直接注明假设，不为非关键问题反复询问：

- 实体商品或品类
- 目标国家、平台和用户
- 当前阶段：想法、需求验证、找货、开发、打样、上市或复盘
- 本次目标：洞察、机会排序、开发 brief、补证据计划或找货前判定

软件产品需求默认不套用实体商品约束，除非用户明确要求。

### 2. 建立证据清单

收集或读取评论、问答、趋势、搜索表达、竞品页面、售后退货、用户访谈、平台数据和内部业务数据。需要当前市场事实时使用合适工具核验，不用模型记忆代替检索。

为每条证据保留：

`id`、平台/来源、URL 或文件、原文/原始指标、采集时间、目标市场、证据类型、新鲜度和可信层级。

先读 [references/evidence-rules.md](references/evidence-rules.md)，再判断哪些结论能进入事实层。

### 3. 生成用户与场景洞察

从真实行为而不是年龄性别出发，生成 2–4 个候选用户群。每个用户群必须包含：

- 具体行为和触发场景
- 要完成的任务或避免的失败
- 购买/使用频率：有证据才写数值
- 价值判断及其证据
- `evidenceRefs`、反证和置信度

没有足够证据时，把用户群写成待验证假设，不选择“核心用户事实”。

### 4. 拆解痛点、痒点、爽点

- **痛点**：优先使用评论、问答、退货、投诉或访谈原文；形成可验证问题。
- **痒点**：表达身份投射和理想自我；通常先标为 `inference` 或 `hypothesis`。
- **爽点**：描述满足瞬间和感官/心理结果；没有直接证据时不得写成事实。

每项输出 `claim`、`claimType`、`evidenceRefs`、`counterEvidenceRefs`、`confidence` 和验证方法。

### 5. 转换为产品机会

把情绪洞察转换为产品要求，而不是只生成卖点名称：

- `P0`：直接解决重复出现的核心失败，必须给出可测试验收指标。
- `P1`：增强体验或形成有证据的差异化。
- `P2`：营销、仪式感或后续优化，不得冒充核心功能。

每个机会至少写明：

- 用户结果与对应场景
- 功能要求
- 结构/材料方向，未知时列为待验证
- 可量化验收标准和测试方法
- 证据、假设、反证
- 成本、物流、合规、知识产权、退货风险
- 最小验证实验和失败条件

### 6. 做实体商品可行性预筛

检查但不虚构：

- 结构、材料、尺寸、重量和耐久性
- 目标采购价、落地成本、售价和毛利
- 包装、运输、易碎、退货和一件代发
- MOQ、库存、贴标、供货稳定性
- 认证、禁限售、品牌/IP 和不可验证承诺
- 样品测试、质检方法和验收阈值

缺少供应商事实时，只输出方向和缺口，不生成正式规格。

### 7. 给出闸口判定

仅使用以下状态：

- `hypothesis-only`：只有想法或模型假设。
- `evidence-needed`：已有部分证据，但关键证据通道未闭合。
- `manual-review`：证据与开发方向已成形，等待人工选择或外部规则检查。
- `ready-for-domestic-sourcing`：外部/项目正式证据闸口明确通过，阻断项为空，并已取得人工确认。

本 Skill 自己不能把状态提升为 `ready-for-domestic-sourcing`。没有外部正式闸口时，最高只能到 `manual-review`。

### 8. 输出与验证

默认先给一句话结论，再给：

1. 当前状态和硬缺口
2. 证据支持的核心用户/场景
3. 痛点、痒点、爽点
4. P0/P1/P2 产品机会
5. 实体商品可行性与风险
6. 补证据/打样验证动作
7. 结构化 JSON

生成 JSON 或落盘文件前，读取 [references/output-contract.md](references/output-contract.md)。写入后运行：

```bash
python3 scripts/validate_output.py /absolute/path/to/product-demand-insight.json
```

修复所有错误后再交付。仅在对话中简答时，也要人工检查：事实有引用、未知值未猜测、状态未越级。

## `flow-task-center-pro` 接入规则

处理 `~/Documents/Playground/flow-task-center-pro` 时：

1. 先按工作区 `AGENTS.md` 读取当前标准；live API 和当前代码优先于历史文档。
2. 保持唯一顺序：

```text
MarketEvidence
-> TrendDemandOpportunity
-> evidenceGate
-> DomesticSourcingQuery
-> 真实供应事实
-> ProductTruth
```

3. 将本 Skill 的结果作为 `InsightDraft` 或开发简报附着在需求实体上，不覆盖正式闸口。
4. 映射并保留 `targetUserZh`、`sceneZh`、`painZh`、`whyNowZh`、`evidenceSources`、`trendEvidenceRefs`、`reviewEvidenceRefs`、`platformGapEvidenceRefs` 和 `counterEvidenceZh`。
5. 只有 `evidenceGate.canEnterDomesticSourcing = true` 才能生成正式找货查询。
6. 需求分析完成不等于找到商品、完成生图、可上架或已发布。

## 资源

- [references/evidence-rules.md](references/evidence-rules.md)：证据类型、事实/推断/假设和闸口规则。
- [references/output-contract.md](references/output-contract.md)：结构化 JSON 字段及示例。
- `scripts/validate_output.py`：验证字段、证据引用和状态越级。

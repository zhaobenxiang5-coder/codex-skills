---
name: 1688-differentiated-stock-mining
description: 面向实体产品开发的1688差异化现货挖掘技能。用于从1688先找可立即买样的不同版型、结构、动作、场景或材料表达，核验完整SKU价格、MOQ和库存，并生成中文候选总表与看图页；不用于证明市场需求或自动采购。
---

# 1688差异化现货挖掘

## 目标

从1688供给端找到“现在能买、值得测试”的差异化现货或微调母版。1688只证明供给，不单独证明需求、市场空白或长期趋势。

本Skill只读运行：不写ProductMaster、X、Flow或数据库，不联系供应商，不加购物车、不下单、不付款。

## 开始前

1. 把本次目标整理成版本化Brief；跨品类字段见 [输入与输出合同](references/input-output-contract.md)。
2. 狗胸背任务同时读取 [狗胸背默认规则](references/categories/dog-harness.md)。
3. 读取国外参考机制台账；狗胸背默认读取相邻Skill的 `../product-reference-mining/references/dog-harness-ledger.md`。
4. 读取本Skill对应品类的1688货源台账；狗胸背默认读取 [dog-harness-supply-ledger.json](references/ledgers/dog-harness-supply-ledger.json)。
5. 先运行 `scripts/validate_brief.py`，再执行搜索。缺少关键版型、价格、MOQ或库存口径时停止，不自行补数字。

## 固定流程

```text
产品目标
→ 整款版型和硬条件拆解
→ 版型/结构/动作/场景/材料五路搜索
→ Offer去重与疑似同图厂家聚类
→ 详情和SKU核验
→ 差异化模块初判
→ 人工看图选择
→ 选中款轻量市场复核
→ 直接买样 / 现货微调 / 转定制开发
```

### 先看整款，再看功能

- 先写清整款版型和必须结构，再写辅助功能；不能因标题出现“提手、反光、防爆冲”就判为目标款。
- 做删除测试：拿掉被提炼模块后若立刻退回普通同类，模块才可能成立。
- 做一图一句测试：必须能用一句话说清“原来做不到什么 → 触发什么结构或动作 → 现在得到什么结果”。
- 普通透气、反光、软垫、轻量、常规快扣、普通D环或只换颜色只能作辅助卖点。

## 搜索口径

- 默认全国搜索，搜索轴固定为：版型、结构、动作、场景、材料。
- 省市只作为供应商分布与备选厂家字段。只有上游请求和返回证据能证明省份在远端搜索前生效时，才写“地区前X”。
- 新品、热销只有存在真实平台筛选或排序证据时才使用；普通结果统一写“1688当前搜索召回”。
- 同一Offer多词命中只抓一次详情，但保留全部词、搜索轴和原始名次。
- 同图不同供应商不删除，归入“疑似同图厂家组”；不同Offer仍分别保留。

## 详情与SKU硬核验

搜索摘要只负责召回，完整商品条件必须从详情和SKU读取：

- Offer ID、1688直达链接、标题、供应商和至少一张真实商品图；
- 完整商品或允许的完整套装SKU，不使用单独配件的低价；
- 完整SKU最低价格符合Brief；
- MOQ符合Brief；
- 对应SKU库存符合Brief；
- 图片、颜色、尺码、价格和SKU对应。

页面库存只写“页面显示有货”；采购前仍需厂家确认。缺失事实写“待核验”，不写成通过或失败。

## 与国外参考台账的关系

- 国外参考路线中的 `accepted/delivered` 机制，在这里不阻断；标记为“已有机制的1688落地候选”。
- 只有用户明确否决了机制本身，才阻断相同机制。
- 用户否决一个具体1688 Offer，只阻断该Offer，不自动否决同款其他供应商或整个机制。
- 旧SKU保留在原国外参考或开发版本下；新的Offer和SKU快照只做ID关联，禁止覆盖旧图片、链接、SKU或产品结论。
- 使用 `scripts/check_decisions.py --mode supply` 同时检查产品、机制和Offer三级状态。

## AI初判与人工决定

AI不打综合分，只能使用：

- `开发参考`
- `边界`
- `基础款`
- `机制重复`
- `条件不合格`
- `待核验`

只自动排除错品类、错链、完全相同Offer、明确无可售SKU或伪造商品。边界款不得隐藏。用户最终填写：`我要 / 待定 / 不要`。

## 交付

每次只向用户展示：

1. `01_差异化现货候选总表.xlsx`
2. `03_差异化现货人工看图总览.html`

原始响应、请求日志、图片和失败原因放进 `技术证据（不用看）/`。字段、AI分析文件和输出约定见 [输入与输出合同](references/input-output-contract.md)。

## MVP命令

```bash
SKILL="$HOME/.codex/skills/1688-differentiated-stock-mining"

python3 "$SKILL/scripts/validate_brief.py" \
  "$SKILL/references/examples/dog-harness-saddle-brief.json"

python3 "$SKILL/scripts/run_readonly_mvp.py" \
  --brief "$SKILL/references/examples/dog-harness-saddle-brief.json" \
  --search-plan "$SKILL/references/examples/dog-harness-saddle-search-plan.json" \
  --output "/绝对路径/本次输出"
```

首次运行会保存只读搜索与详情证据；补充AI分析JSON后以同一命令重跑会优先复用缓存，不重复请求。使用 `--refresh` 才允许重新读取页面事实。

## 停止与转轨

- 详情核验后有合格现货：交给用户决定买样。
- 只有主体接近：写“现货母版＋需要修改的具体模块”。
- 独立搜索、去重和Top候选详情读回后仍无合适现货：明确写“严格同版为0，转相似母版或结构定制”，不扩大同款定义凑数。

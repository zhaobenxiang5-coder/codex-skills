# 输入与输出合同

## Brief

Brief使用UTF-8 JSON，关键字段如下：

```json
{
  "version": 1,
  "productDirectionId": "HNS-SADDLE-001",
  "categoryId": "dog-harness",
  "categoryNameZh": "狗胸背带",
  "targetValueZh": "主人使用携带方便，狗狗舒适、好看并安全遛狗",
  "formFingerprint": {
    "nameZh": "马鞍型短背胸背",
    "mustHave": ["马鞍型短背轮廓", "宽背片", "双侧快拆"],
    "preferred": ["背部宽提手", "背部金属D环"],
    "exclusions": ["普通Y形胸背", "康复吊带"]
  },
  "commercialGate": {
    "minCompleteSkuPrice": 15,
    "priceOperator": ">",
    "maxMoq": 1,
    "stockRequired": true,
    "allowedProductForms": ["complete-product", "product-plus-leash"],
    "skuAccessoryOnlyKeywords": ["单独牵引绳", "项圈", "灯", "补差价", "配件"],
    "skuCompleteProductKeywords": ["胸背", "胸背带", "套装"]
  },
  "referenceImages": ["/绝对路径/参考图.jpg"],
  "targetReviewCount": 20,
  "detailCandidateLimit": 20
}
```

`minCompleteSkuPrice`只作用于完整商品SKU。摘要价、配件价和补差价不能通过条件。

## 身份与台账

三类身份不得互相覆盖：

```text
产品方向ID
├─ 国外参考ID → 定制开发版本ID → 原有SKU
├─ 1688 Offer ID → 供应商 → 全部SKU快照
└─ 实际买样SKU ID → 来源Offer/开发版本 → 买样时间
```

- 国外参考产品和机制状态继续保存在 `product-reference-mining` 的品类台账中；旧产品名、链接、图片、SKU和结论原样保留。
- 1688货源按Offer ID记录。推荐字段：`productDirectionId`、`offerId`、`decision`、`supplierName`、`supplierLocation`、`sameImageGroup`、`searchHits`、`verifiedAt`、`skuSnapshots`。
- `skuSnapshots`保存详情页读取到的全部SKU，不只保存被AI选中的SKU。每次快照包含时间、SKU ID、名称/属性、价格、MOQ、库存和原始证据路径。
- 实际买样使用独立 `sampleSkuId`，并通过 `sourceType + sourceId + skuId` 指向国外开发版本或1688 Offer，不能改写来源SKU。
- 本MVP只读台账，不自动写入决策。用户明确选择后才把 `我要/待定/不要` 另行落账。

1688货源台账的最小结构：

```json
{
  "version": 1,
  "categoryId": "dog-harness",
  "productDirections": [
    {
      "productDirectionId": "HNS-SADDLE-001",
      "foreignReferenceIds": [],
      "developmentVersionIds": [],
      "offerIds": [],
      "sampleSkuIds": []
    }
  ],
  "offers": [
    {
      "offerId": "1042290742906",
      "productDirectionId": "HNS-SADDLE-001",
      "decision": "pending",
      "supplierName": "供应商原名",
      "sameImageGroup": "疑似同图组-001",
      "searchHits": [],
      "skuSnapshots": []
    }
  ],
  "sampleSkus": []
}
```

## 搜索计划

```json
{
  "version": 1,
  "queries": [
    {"query": "马鞍式狗胸背带", "axis": "版型"},
    {"query": "双侧快拆狗胸背", "axis": "结构"}
  ]
}
```

当前4173搜索接口不能证明远端省份、新品或销量排序，因此MVP搜索计划不接受伪造的省份榜、热销榜或新品榜标签。

## AI分析文件

AI分析是可选JSON；没有分析时输出`待核验`，不得用固定关键词冒充AI结论。

```json
{
  "version": 1,
  "items": [
    {
      "offerId": "1042290742906",
      "aiLabel": "开发参考",
      "formTypeZh": "马鞍型短背胸背",
      "visibleModules": ["宽背片", "双侧快拆", "背部宽提手"],
      "mechanismId": "saddle-short-back-dual-buckle",
      "mechanismFingerprintZh": "普通短背控制不足 → 宽背片与双侧快拆形成稳定主体 → 日常遛狗时更方便穿脱和控制",
      "borrowablePointZh": "宽背片＋双侧快拆＋背部提手的整款组合",
      "marketCheckZh": "待对选中款进行轻量市场复核"
    }
  ]
}
```

## 输出

### Excel主表

固定包含：人工判断、产品图、AI初判、条件核验、产品名称、整款版型、具体差异模块、机制指纹、搜索命中、供应商、省市、完整SKU价格、MOQ、库存、SKU证据、疑似同图厂家组、Offer ID、1688链接、市场复核、抓取时间。

### HTML看图页

支持关键词、AI初判、条件、供应商地区和疑似同图组筛选；图片使用本地缓存并延迟加载。

### 技术证据

保存搜索原始响应、详情原始响应、请求日志、候选结构化快照和本地图片。请求日志不得包含密钥。

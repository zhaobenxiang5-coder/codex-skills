# 店小秘 TEMU 半托管字段映射

Use this reference before filling or guiding the Dianxiaomi add/edit page.

## Target Page

- URL: `https://dianxiaomi.com/web/popTemu/add`
- Page title: `店小秘--添加Temu半托管产品`
- Safe action: `保存`
- Forbidden actions: `发布`, `定时发布`, bare submit/publish buttons

## Section Map

| 店小秘 section | Field | Source |
| --- | --- | --- |
| 基本信息 | 店铺账号 | configured store / pack `storeName` |
| 基本信息 | 经营站点 | template default `美国站` |
| 基本信息 | 产品分类 | pack category or product-family template |
| 基本信息 | 产品属性 | category modal; do not invent |
| 店小秘信息 | 店小秘分类 | product-family template |
| 店小秘信息 | 来源URL | supplier/1688 URL |
| 产品信息 | 产品标题 | `fields.temuY2Title`, `fields.title` |
| 产品信息 | 英文标题 | `fields.englishTitle` |
| 产品信息 | 产品货号 | `fields.sku` or `masterSku` |
| 产品信息 | 产地 | `中国大陆` unless pack says otherwise |
| 产品信息 | 站外产品链接 | leave blank by default |
| 产品信息 | 敏感属性 | `否` only when supported by ProductTruth |
| 产品信息 | 定制产品 | `否` by default |
| 产品信息 | 产品轮播图 | `01-素材图.jpg` to `06-轮播图-5.jpg` |
| 产品信息 | 产品素材图 | `01-素材图.jpg` |
| 变种属性 | 颜色 | ProductTruth color |
| 变种属性 | 尺码 | ProductTruth size or product size |
| 变种信息 | SKU货号 | pack SKU |
| 变种信息 | 申报价格 | pack value if present; otherwise leave blank |
| 变种信息 | 测试申报价格(CNY) | `draft-save-test` only: explicit `manualTestDeclarePriceCny`; never official cost |
| 变种信息 | 尺寸(cm) | product/package dimensions from ProductTruth |
| 变种信息 | 重量(g) | package weight converted from kg to g |
| 变种信息 | 建议售价 | middle-platform listing price |
| 变种信息 | 测试售价 | `draft-save-test` only: user-authorized `manualTestPriceUsd`; never official pricing |
| 变种信息 | 仓库 | configured store+site rule only |
| 产品描述 | 产品描述 | factual description/bullets |
| 产品描述 | 描述图 | `08-详情图-1.jpg`, `09-详情图-2.jpg` |
| 运输信息 | 承诺发货时效 | pack lead time or `9个工作日内发货` |
| 运输信息 | 运费模板 | visible template containing `够快` |

## Official Excel Import Columns

The current Dianxiaomi TEMU 半托管 official workbook has these importable columns:

| Excel column | Source / Rule |
| --- | --- |
| `*产品标题` | pack title |
| `*英文标题` | pack English title |
| `产品描述` | factual title/description from pack |
| `产品货号` | Parent SKU / master SKU |
| `*变种属性名称一` | `颜色` |
| `*变种属性值一` | one ProductTruth-backed color only |
| `变种属性名称二` | `尺码` when size exists |
| `变种属性值二` | ProductTruth/package size |
| `预览图` | image URL 01 |
| `*申报价格(店铺币种)` | official declare price or explicit draft-test CNY |
| `SKU货号` | master SKU |
| `*长（cm）` / `*宽（cm）` / `*高（cm）` | package dimensions |
| `*重量（g）` | package weight |
| `站外产品链接` | blank by default |
| `*轮播图` | image URLs 01-06, newline separated |
| `*产品素材图` | image URL 01 |
| `外包装图片` | image URL 07 |
| `建议售价（USD）` | official listing price or explicit draft-test USD |
| `发货时效（天）` | `9` |

The official workbook does **not** include store account, site, category, origin province, category attributes, warehouse, or freight template. These are import-page or post-import draft checks.

Real test note: the workbook also did not complete the category material enum in the edit page. Treat required category attributes as post-import checks unless a future official template exposes stable columns for them.

## Image Order

For Excel import, these must be Dianxiaomi 图片空间 URLs or other stable server-accessible URLs. Do not write local files, `127.0.0.1`, `localhost`, or `file://` paths into Excel.

Fast batch rule: use `npm run dianxiaomi:fast-bulk -- --phase prepare-upload ...` and upload the generated `image-space-upload/` directory to Dianxiaomi 图片空间. Those files are uniquely named as `<SKU>__<slot>__<original-name>.jpg`, so the album URL scraper can map URLs back to SKU/slot without confusing repeated names like `01.jpg`. After scraping URLs into `image-url-map.json`, run `npm run dianxiaomi:fast-bulk -- --phase build-import --image-url-map ...`; only that second phase should create the final Excel.

| File | Dianxiaomi use |
| --- | --- |
| `01-素材图.jpg` | carousel first image and material image |
| `02-轮播图-1.jpg` | carousel |
| `03-轮播图-2.jpg` | carousel |
| `04-轮播图-3.jpg` | carousel |
| `05-轮播图-4.jpg` | carousel |
| `06-轮播图-5.jpg` | carousel |
| `07-外包装图片.jpg` | backup / outer-package reference |
| `08-详情图-1.jpg` | product description image |
| `09-详情图-2.jpg` | product description image |

## Save Check

Before clicking `保存`, confirm:

- The final button target is exact `保存`, not `发布`.
- 9 images are visible or Dianxiaomi confirms selection.
- In `draft-save-test`, `manualTestPriceUsd` may be filled only when the user explicitly authorized it for a save test.
- In `draft-save-test`, `manualTestDeclarePriceCny` is separate from USD listing price. Do not convert or reuse USD as CNY without explicit user authorization.
- Official pricing blockers remain blockers for `production-ready` even if a manual test price was used.
- Missing dynamic values are either blank or explicitly marked for manual completion.
- 图片检测 has no visible blocker, or blockers are reported to the user.
- 仓库 rows use `GoFast_Y2-L美西_7-9` with select-all mode for the current `P V G` + 美国站 template.
- Imported images are real visible thumbnails, not broken/blank image boxes.
- `产地省份` is `广东` when the country is `中国大陆`.
- A single SKU has exactly one color value. `PM-FLOW-197M38J` should be `粉色`.
- If ProductTruth material has evidence but Dianxiaomi has no exact enum, choose the closest truthful platform fallback only when it is explicit. For `Polyester` under the tested jewelry-storage category, use `其他材料` and record the fallback in the receipt.
- If the row-level `编辑` button does not open the draft from the待发布 list, use the row `rowid` as the edit id and open `/web/popTemu/edit?id=<rowid>`.
- A draft-save success can be verified by the modal text `您的产品编辑成功！`.

## Receipt Fields

When writing a receipt, include these secret-free fields when known:

- `mode`
- `storeName`
- `categoryPath`
- `manualTestPriceUsd`
- `manualTestDeclarePriceCny`
- `warehouseSelection`
- `warehouseSelectionMode`
- `imageUrlSource`
- `temporaryImageUrl`
- `imageVisible`
- `postImportRequired`
- `saveResult`
- `validationBlockers`

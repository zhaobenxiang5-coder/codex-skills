# 店小秘铺货模板

Use this reference when deciding which values can be fixed and which must come from the AI商品上架包.

## Global Template

Safe defaults:

- 平台: `TEMU 半托管`
- 经营站点: `美国站`
- 产地: `中国大陆`
- 敏感属性: `否`, only when ProductTruth has no sensitive evidence
- 定制产品: `否`
- 承诺发货时效: `9个工作日内发货`, unless the pack supplies a stricter real value
- 运费模板: choose a visible template whose name contains `够快`; stop if not visible
- 图片策略: ignore collected/1688 images; use the 9 generated images from `01-上传图片`
- 批量图片策略: run `npm run dianxiaomi:fast-bulk -- --phase prepare-upload ...`, upload the generated `image-space-upload/` files to Dianxiaomi 图片空间, scrape stable 图片空间 URLs into `image-url-map.json`, then run `npm run dianxiaomi:fast-bulk -- --phase build-import --image-url-map ...`
- 临时链路: Cloudflare Tunnel / `trycloudflare.com` is allowed only for `draft-save-test`, never production-ready
- 价格策略: use middle-platform pricing; Dianxiaomi pricing templates are fallback only

## Store Template

User-authorized draft-save-test default:

- 店铺账号: `P V G`

For production-ready work, prefer the pack or the user's configured setting. If the visible Dianxiaomi store does not exactly match the configured value, stop and report.

Warehouse can be fixed only by a configured store+site rule. If no configured warehouse is present, leave it for manual selection.

Current user-authorized store+site warehouse rule:

- 店铺账号: `P V G`
- 经营站点: `美国站`
- 仓库: `GoFast_Y2-L美西_7-9`
- 仓库选择方式: `select-all`
- Rule: all SKU rows in the draft/import test should use this warehouse unless the user changes the store/site rule.

## Product-Family Template

`TEMU-US-半托管-珠宝首饰收纳` may supply:

- 产品分类: `家居、厨房用品 > 收纳用品 > 珠宝首饰盒和收纳`
- 类目匹配关键词: `珠宝首饰盒和收纳`, `饰品收纳`, `首饰收纳`, `jewelry organizer`
- 类目选择原则: search the category tree with the keywords above and choose the deepest visible match only when it remains jewelry/accessory storage related. Stop instead of choosing unrelated categories.
- 店小秘分类: `饰品收纳`
- 变体轴: `颜色 + 尺码`
- 单 SKU 颜色原则: one SKU can have only one color value. If ProductTruth contains `蓝色、黄色、粉色`, infer a single color only when title/English title gives stronger evidence, e.g. `Pink` -> `粉色`; otherwise stop with `color:ambiguous`.
- 材料枚举原则: do not invent material. If ProductTruth evidence says `Polyester` / `涤纶` and the visible Dianxiaomi category enum has no exact Polyester option, use `其他材料` as a platform enum fallback and record that mapping in the receipt.
- Image layout: carousel 01-06, material image 01, detail images 08-09

Do not batch products from different families into the same category template. For example, pet harness / dog leash items must not be imported under the jewelry-storage category batch.

`TEMU-US-半托管-通用` supplies only global defaults and leaves category-specific fields blank.

## Mode Policy

- `dry-run`: resolve the pack, preview fields, and do not click save.
- `draft-save-test`: the user may authorize a `manual-test-price` such as `19.99 USD` only to test Dianxiaomi draft saving. This price must not be written back as official listing price.
- `draft-save-test` also needs `申报价格(CNY)` when Dianxiaomi validates it. Use pack evidence such as `purchaseCostRmb` only when non-zero; otherwise require an explicit separate `manual-test-declare-price-cny`.
- `production-ready`: requires middle-platform pricing and all ProductTruth-backed fields; manual test prices never satisfy production readiness.

## Real-Tested Post-Import Fixes

The official TEMU 半托管 import workbook can create a待发布 draft, but the edit page still needs these checks/fixes before the draft-save-test is considered handled:

- 产地省份: set `广东省` when the product country is `中国大陆`.
- 运费模板: select the visible template containing `够快`; the tested value was `够快模版`.
- 材料: for the tested jewelry roll pack, ProductTruth/English title evidence was Polyester and the visible category enum did not contain Polyester, so `其他材料` was selected and recorded as a platform enum fallback.
- Images: success requires real `wxalbum-...dianxiaomi.com` image-space URLs and visible `800 X 800` carousel/material images in the edit page. Cloudflare/test URLs that show broken images are not acceptable.

## Never Template

Never fill these unless the pack contains evidence:

- material
- color
- dimensions
- weight
- listing price
- brand/IP authorization
- compliance certificates
- platform-required category attributes
- external product link

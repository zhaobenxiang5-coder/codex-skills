# Zhitai Field Map

Use this reference only after the skill triggers and a pack has been resolved.

## Target Page

- URL: `https://www.data.izhitai.net/#/instrument/shelving/index`
- Page title/form title: `创建产品`
- Safe final button: exact visible text `暂存`
- Forbidden buttons: `移入待发布`, `发布至TEMU`, `发布`, `提交发布`

## Image Upload Order

| Pack file | Zhitai field |
| --- | --- |
| `01-素材图.jpg` | `素材图` |
| `02-轮播图-1.jpg` | `轮播图` |
| `03-轮播图-2.jpg` | `轮播图` |
| `04-轮播图-3.jpg` | `轮播图` |
| `05-轮播图-4.jpg` | `轮播图` |
| `06-轮播图-5.jpg` | `轮播图` |
| `07-外包装图片.jpg` | `外包装图片` |
| `08-详情图-1.jpg` | `产品详情` / detail image area when available |
| `09-详情图-2.jpg` | `产品详情` / detail image area when available |

For package02/I19Y8C, the user clarified that `外包装图片` should be a carton/box image, not the local product-scene `07-外包装图片.jpg`. Prefer `~/Documents/文件整理_2026-05-21/来自桌面/图片截图/纸箱.jpg`; otherwise search local files for `纸箱`.

## Basic Information

| Zhitai label | Pack source | Rule |
| --- | --- | --- |
| `产品标题` | `fields.temuY2Title`, `fields.title`, `产品标题` | Paste exactly; do not add claims. |
| `素材图` | image slot 1 | Upload from `uploadImageFolderPath`. |
| `产品分类` | `fields.temuY2Category`, `fields.category`, `产品分类` | Use category search; ask if multiple paths are plausible. |
| `店铺名称` | `fields.storeName`, `店铺名称` | Select exact visible option only. |
| `英文标题` | `fields.englishTitle`, `英文标题` | Optional; leave blank if missing. |
| `产地` | `fields.originPlace`, `产地` | Default from pack is often `中国`; do not guess province. |
| `轮播图` | image slots 2-6 | Upload numeric order. |
| `外包装图片` | image slot 7 | Upload only if present. |
| `外包装形状` | `fields.outerPackageShape` | Leave unset if missing. |
| `外包装类型` | `fields.outerPackageType` | Leave unset if missing. |
| `产品详情` | `fields.productDescription`, `fields.description`, bullets, images 8-9 | Paste only factual text; upload details if UI supports it. |
| `主图视频` | `fields.mainVideo` | Optional; leave blank by default. |
| `产地省份` | `fields.originProvince` | Optional; leave blank if missing. |

## Product Information

| Zhitai label | Pack source | Rule |
| --- | --- | --- |
| `产品货号` | `fields.sku`, `masterSku`, `产品货号` | Paste exact SKU. |
| `敏感属性` | `fields.sensitiveAttribute`, `敏感属性` | Use `否` only when the pack says `否`. |
| `站外产品链接` / `产品外部链接` | `fields.externalProductUrl`, `fields.supplierUrl`, `供应商/站外链接` | Leave blank by default. Treat supplier/source URL as internal evidence only; paste it only if the user explicitly asks to fill this field in the current request. |
| `经营站点` | `fields.operationSite`, `经营站点` | Select exact visible value such as `美国` only if present. |
| `发货仓` | `fields.shippingWarehouse`, `发货仓` | Select exact visible warehouse only if present. |
| `是否定制品` | `fields.isCustomProduct` | Default to `否` only when the pack says it. |
| `承诺发货时间` | `fields.leadTimeHours` or mapped text | Use pack value; common text is `24小时内发货`, `48小时内发货`, or `9个工作日内发货`. |
| `运费模板` | `fields.freightTemplate` | Select exact visible template only if present. |

## Variant Information

| Zhitai label | Pack source | Rule |
| --- | --- | --- |
| `变体模板` | `fields.variantTemplate` | Optional; select exact visible value only. |
| `材质` | `fields.material`, `材质` | Do not infer from photos. |
| `颜色` | `fields.color`, `颜色` | Do not infer unless ProductTruth/pack says it. |
| `产品尺寸(cm)` | `fields.productSizeCm`, `产品尺寸` | Use only verified pack value. |
| `包装尺寸(cm)` | `fields.packageSizeCm`, `包装尺寸` | Use only verified pack value. |
| `重量(kg)` | `fields.packageWeightKg`, `重量` | Use only verified pack value. |
| `上架价格(USD)` | `fields.listingPriceUsd`, `fields.temuY2Price`, `价格` | Leave blank if missing or zero. |

## Save Check

Before clicking `暂存`, confirm:

- The page still says `创建产品`.
- The visible final action button text is exactly `暂存`.
- Any click target for `移入待发布` or `发布至TEMU` is not used.
- Missing required field messages are either resolved or reported as blockers.

## Detail Editor

- Click `编辑详情` in `产品详情`.
- Add a `图片` component in `TEMU详情页装修` for each detail image.
- Upload `08-详情图-1.jpg` and `09-详情图-2.jpg`.
- Remove any empty detail image modules before clicking the detail editor's own `确 定`.

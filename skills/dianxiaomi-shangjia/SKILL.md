---
name: dianxiaomi-shangjia
description: Turn flow-task-center-pro AI商品上架包 / listing-upload-pack artifacts into a Dianxiaomi 店小秘上架 TEMU 半托管 product draft workflow or Excel bulk import pack. Use when the user asks for 店小秘上架, 店小秘铺货, 店小秘批量导入, 店小秘草稿测试, TEMU半托管补丁包, 店小秘图片上传, 1688采集到店小秘后用中台套图覆盖, or testing a Dianxiaomi listing workflow without publishing.
---

# 店小秘上架

Use this skill to convert an AI 商品流水线上架包 into a Dianxiaomi 店小秘上架 TEMU 半托管 Excel import pack or草稿 workflow. Prefer bulk Excel import for multi-SKU铺货; use browser草稿保存 only for single-SKU validation. This is an operator-assist workflow, not a publishing adapter.

## Defaults

- Project: `~/Documents/Playground/flow-task-center-pro`
- Workspace: `default-workspace`
- Console: `http://127.0.0.1:4173/pipeline-console.html?workspaceId=default-workspace`
- Preferred manifest: `~/Documents/Playground/flow-task-center-pro/output/listing-upload-packs/default-workspace/latest/manifest.json`
- Bulk import output: `~/Documents/Playground/flow-task-center-pro/output/dianxiaomi-bulk-import/default-workspace/<batchId>/`
- Human pack root: `~/Documents/AI商品上架包`
- Dianxiaomi TEMU 半托管 add page: `https://dianxiaomi.com/web/popTemu/add`
- Human visible files: `01-上传图片/` and `02-店小秘补丁页.html`

## Hard Rules

- Never click `发布`, `定时发布`, or any equivalent final publish action.
- In browser tests, stop at dry-run or click only `保存` when the user explicitly asks for a saved draft.
- For batch铺货, generate a Dianxiaomi official-template `.xlsx` import pack first; do not automate web publishing.
- Main image path: upload the local 9 generated images to Dianxiaomi 图片空间, export/copy stable 图片空间 URLs, then pass them as `--image-url-map`.
- Never write `/Users/...`, `file://`, `localhost`, or `127.0.0.1` image paths into a Dianxiaomi import workbook. Image columns need server-accessible public URLs.
- Treat Cloudflare Tunnel / `trycloudflare.com` as draft-save-test only. It is never production-ready image hosting.
- Do not invent ProductTruth, material, color, dimensions, weight, price, category, warehouse, freight template, compliance, brand, or authorization.
- Keep `站外产品链接` blank by default. Use supplier/1688 links in 店小秘 `来源URL` only.
- Do not write receipts or system files into `~/Documents/AI商品上架包/<product>/`.
- Do not read or print credentials, cookies, runtime config, tokens, OTPs, or secrets.

## Workflow

1. Read `~/Documents/Playground/AGENTS.md` and `CURRENT_TASK.md` in a fresh thread.
2. Fast daily path for generated products:

   - Run `npm run dianxiaomi:fast-bulk -- --phase prepare-upload ...` once without `--image-url-map` to get `image-url-map.template.json` and the flat `image-space-upload/` directory.
   - Upload the files from `image-space-upload/` to Dianxiaomi 图片空间 in one multi-file upload. These files are uniquely named with SKU + slot, so URL scraping does not confuse multiple `01.jpg` files.
   - Scrape/copy the returned 图片空间 URLs back into `image-url-map.json`.
   - Rebuild the official Excel with `npm run dianxiaomi:fast-bulk -- --phase build-import --image-url-map ...`, import the whole batch to待发布, then edit only the first SKU per product family or any error rows.

3. For multi-SKU铺货 or batch import, upload generated images to Dianxiaomi 图片空间 first and create an image URL map:

   ```json
   {
     "PM-FLOW-197M38J": [
       "https://img.dianxiaomi.com/....../01.jpg",
       "https://img.dianxiaomi.com/....../02.jpg",
       "https://img.dianxiaomi.com/....../03.jpg",
       "https://img.dianxiaomi.com/....../04.jpg",
       "https://img.dianxiaomi.com/....../05.jpg",
       "https://img.dianxiaomi.com/....../06.jpg",
       "https://img.dianxiaomi.com/....../07.jpg",
       "https://img.dianxiaomi.com/....../08.jpg",
       "https://img.dianxiaomi.com/....../09.jpg"
     ]
   }
   ```

   Save it inside the project output, for example:

   ```text
   output/dianxiaomi-bulk-import/default-workspace/<batchId>/image-url-map.json
   ```

4. Build the official-template import pack:

   Preferred fast-bulk prepare command:

   ```bash
   cd ~/Documents/Playground/flow-task-center-pro
   npm run dianxiaomi:fast-bulk -- \
     --phase prepare-upload \
     --mode draft-save-test \
     --template "/path/to/店小秘TEMU半托管官方模板.xlsx" \
     --test-price-usd 19.99 \
     --test-declare-price-cny 99
   ```

   The prepare phase is considered successful when it prints `imageSpaceUploadRootPath` and `imageUrlMapTemplatePath`, even though `importReady` is still false. Upload every file in `imageSpaceUploadRootPath` to Dianxiaomi 图片空间, scrape the resulting URLs into `image-url-map.json`, then run:

   ```bash
   npm run dianxiaomi:fast-bulk -- \
     --phase build-import \
     --mode draft-save-test \
     --template "/path/to/店小秘TEMU半托管官方模板.xlsx" \
     --image-url-map "output/dianxiaomi-bulk-import/default-workspace/<batchId>/image-url-map.json" \
     --test-price-usd 19.99 \
     --test-declare-price-cny 99
   ```

   Lower-level direct builder:

   ```bash
   cd ~/Documents/Playground/flow-task-center-pro
   npm run dianxiaomi:bulk -- \
     --mode draft-save-test \
     --template "/path/to/店小秘TEMU半托管官方模板.xlsx" \
     --image-url-map "output/dianxiaomi-bulk-import/default-workspace/<batchId>/image-url-map.json" \
     --test-price-usd 19.99 \
     --test-declare-price-cny 99
   ```

   Production mode must omit test prices and use middle-platform pricing:

   ```bash
   npm run dianxiaomi:bulk -- \
     --mode production-ready \
     --template "/path/to/店小秘TEMU半托管官方模板.xlsx" \
     --image-url-map "output/dianxiaomi-bulk-import/default-workspace/<batchId>/image-url-map.json"
   ```

   If the command reports `imagePublicUrl:missing`, `imageUrlMap:*`, `template:unmatched-header`, `color:ambiguous`, `productFamily:category-mismatch`, or pricing blockers, stop and report the generated `批量预检.html` and `blockers.json`. Do not hand-edit a workbook to bypass blockers.
   When no image URL map is supplied, both commands write `image-url-map.template.json` in the batch output. Upload the listed files to Dianxiaomi 图片空间, paste the returned URLs into that template, save it as `image-url-map.json`, then rerun with `--image-url-map`.

5. Resolve one pack for single-SKU browser validation:

   ```bash
   node ~/.codex/skills/dianxiaomi-shangjia/scripts/resolve_dxm_pack.mjs --pretty
   ```

   Add `--sku <masterSku>` when multiple SKUs exist. Add `--folder "~/Documents/AI商品上架包/<folder>"` for a direct human folder.

6. Run preflight before browser work:

   ```bash
   node ~/.codex/skills/dianxiaomi-shangjia/scripts/preflight_dxm_pack.mjs --pretty
   ```

   For a user-authorized save test with a temporary price:

   ```bash
   node ~/.codex/skills/dianxiaomi-shangjia/scripts/preflight_dxm_pack.mjs \
     --sku PM-FLOW-197M38J \
     --mode draft-save-test \
     --test-price-usd 19.99 \
     --pretty
   ```

   If Dianxiaomi requires `申报价格(CNY)`, pass an explicitly authorized separate test declaration price:

   ```bash
   node ~/.codex/skills/dianxiaomi-shangjia/scripts/preflight_dxm_pack.mjs \
     --sku PM-FLOW-197M38J \
     --mode draft-save-test \
     --test-price-usd 19.99 \
     --test-declare-price-cny 99 \
     --pretty
   ```

7. Read `references/templates.md` when deciding which fields can be fixed by template. Read `references/field-map.md` before filling or guiding the 店小秘 page.
8. Distinguish the mode:
   - `dry-run`: preview and guide only; do not save.
   - `draft-save-test`: a user-authorized `manualTestPriceUsd` may satisfy Dianxiaomi save validation, but it is not official pricing.
   - `production-ready`: requires middle-platform pricing and all required evidence fields; manual test prices do not count.
9. If preflight reports missing images, missing title, missing dimensions, missing weight, missing material/color, missing `申报价格(CNY)`, or a missing user-authorized test/official price for the current mode, stop and report the exact blockers unless the user explicitly asks for a diagnostic dry-run.
10. Use the user's existing Chrome login for Dianxiaomi. Prefer semantic browser control when available; use Computer Use only for native file pickers or visually dependent confirmation.
11. Start from 店小秘 TEMU 半托管 add/edit page. If an existing product is open, do not overwrite it unless the user explicitly says it is the target draft.
12. Apply template fields first:
   - TEMU 半托管
   - 店铺账号 `P V G` only when user-authorized or configured
   - 美国站
   - 中国大陆
   - 敏感属性 `否` only when ProductTruth has no sensitive evidence
   - 定制产品 `否`
   - 9个工作日内发货 unless the pack supplies a stricter value
   - 运费模板 matching `够快` only when visible
   - 仓库全选 `GoFast_Y2-L美西_7-9` for the current `P V G` + 美国站 test/template
   - 珠宝首饰收纳类目: use the related path visible in Dianxiaomi such as `家居、厨房用品 > 收纳用品 > 珠宝首饰盒和收纳`; stop if only unrelated categories appear
13. Upload images from `01-上传图片` for single-SKU browser tests, or use Dianxiaomi 图片空间 URLs for Excel import:
   - Product carousel: `01-素材图.jpg` through `06-轮播图-5.jpg`
   - Product material image: use `01-素材图.jpg`
   - Description/detail images: use `08-详情图-1.jpg` and `09-详情图-2.jpg`
   - `07-外包装图片.jpg` is a backup/outer-package reference unless the page requires it.
14. Fill dynamic fields from `02-店小秘补丁页.html`: title, English title, SKU, price, declaration price when evidence or explicit CNY test value exists, dimensions, weight, material, color, source URL, description.
15. After import, open the draft edit page and verify:
   - product images are visible, not blank boxes
   - `产地` is `中国大陆` and province is `广东`
   - single SKU has one color only; for `PM-FLOW-197M38J` the color is `粉色`, not `蓝色、黄色、粉色`
   - category is not mixed across product families
   - warehouse rows use `GoFast_Y2-L美西_7-9`
   - if the list `编辑` button does not navigate, read the row `rowid` from the imported待发布 row and open `https://www.dianxiaomi.com/web/popTemu/edit?id=<rowid>` directly
16. Run Dianxiaomi `图片检测` when available. If the page reports image or validation failures, stop and summarize.
17. Save only when explicitly authorized:

   ```bash
   node ~/.codex/skills/dianxiaomi-shangjia/scripts/write_dxm_receipt.mjs \
     --status saved-draft \
     --mode draft-save-test \
     --store-name "P V G" \
     --warehouse-selection "GoFast_Y2-L美西_7-9" \
     --warehouse-selection-mode "select-all" \
     --manual-test-price-usd 19.99 \
     --note "Saved in Dianxiaomi only; not published"
   ```

## Real-Tested Notes

- 2026-06-25 `PM-FLOW-197M38J` draft-save-test succeeded with Dianxiaomi 图片空间 URLs.
- Fast-bulk command stages:
  - `prepare-upload`: generates `image-space-upload/`, `image-url-map.template.json`, `批量预检.html`, and `blockers.json`; it is the correct stopping point before the 图片空间 upload.
  - `build-import`: requires `--image-url-map`; it should generate `店小秘TEMU半托管批量导入.xlsx` or report real blockers.
  - `scrape-image-space`: reserved for browser/plugin execution; do not claim URL scraping succeeded unless the browser/plugin actually collected Dianxiaomi image-space URLs.
- Dianxiaomi 图片空间 upload path used in the real test: `https://www.dianxiaomi.com/web/service/uploadPic`; image management page: `https://www.dianxiaomi.com/web/service/album`.
- Successful image URLs used `https://wxalbum-10001658-file.dianxiaomi.com/...`; imported list thumbnails and edit-page carousel images showed `800 X 800` and loaded with natural size `800x800`.
- Official Excel import created a待发布 draft, but the official workbook did not persist these post-import fields: `产地省份`, `运费模板`, and category material enum. In the real test, edit page fixes were `广东省`, `够快模版`, and `其他材料` because the product evidence was Polyester and no exact Polyester option was visible.
- The product list row id for a newly imported draft is usable as the edit id. Example: row `rowid="132884090892225683"` opened with `/web/popTemu/edit?id=132884090892225683`.
- A successful edit save shows the modal text `您的产品编辑成功！`. This is still a draft-save state; it is not a publish.

## Helper Scripts

- `scripts/resolve_dxm_pack.mjs`: wraps the existing AI listing-pack resolver and prints the selected SKU, fields, images, copy page, and human folder.
- `scripts/preflight_dxm_pack.mjs`: applies 店小秘 templates, validates 9 image names/order, checks dynamic listing fields, and prints next action.
- `scripts/write_dxm_receipt.mjs`: writes a secret-free receipt under the project `output/listing-upload-packs/<workspace>/receipts/`, never in the human pack folder.

## Validation

Before treating skill changes as complete, run:

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/.codex/skills/dianxiaomi-shangjia
node ~/.codex/skills/dianxiaomi-shangjia/scripts/resolve_dxm_pack.mjs --pretty
node ~/.codex/skills/dianxiaomi-shangjia/scripts/preflight_dxm_pack.mjs --pretty
```

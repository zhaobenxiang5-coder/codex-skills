---
name: zhitai-temu-capture
description: Capture same-day Zhitai new-product data into the AI product pipeline console by using the project’s existing Chrome extension flow, Temu title jump, real Temu product-detail extraction, and default-workspace writeback. Use when the user asks to 抓蜘泰, 补今天蜘泰, 抓 TEMU 链接, 补 Temu详情, 回写项目台/中台, or work on flow-task-center-pro Zhitai/Temu capture.
---

# Zhitai Temu Capture

Use this skill to补抓当天蜘泰新品榜的合格候选，并把真实 Temu 商品详情回写到 AI 商品流水线中台。Do not build an external scraper or save a separate export unless the user explicitly asks.

## Defaults

- Project: `~/Documents/Playground/flow-task-center-pro`
- Console: `http://127.0.0.1:4173/pipeline-console.html?workspaceId=default-workspace`
- Store: `data/workspaces/default-workspace/pipeline-store.json`
- Zhitai page: `https://www.data.izhitai.net/#/usregional/newproduct/index`
- Date scope: local today only. Prefer `captureBatchDate`; fall back to `sourceSnapshotDate`.
- Item scope: only candidates that pass the project’s existing demand/risk eligibility checks and can be resolved to a real Temu product detail URL.
- Console retention: do not leave Zhitai-only candidates, pending Temu links, search-result URLs, or failed candidates in the project console as usable demand rows. Keep raw scratch data out of the main store unless it is attached to a verified Temu detail capture.

## Workflow

1. Read `~/Documents/Playground/AGENTS.md` and `CURRENT_TASK.md` if this is a new thread.
2. Work in `~/Documents/Playground/flow-task-center-pro`.
3. Run the read-only status check:

   ```bash
   node ~/.codex/skills/zhitai-temu-capture/scripts/check_today_zhitai_targets.mjs \
     --project ~/Documents/Playground/flow-task-center-pro
   ```

4. Start or reuse the console server and open the console. If the Chrome extension code changed recently, reload the unpacked extension first because this flow needs the extension content/background scripts and `tabs` permission.
5. Do not import Zhitai rows directly into `pipeline-store.json`. First screen rows into a temporary candidate file:

   ```bash
   node scripts/import-zhitai-demand-painpoints.mjs \
     --input data/research/zhitai/YYYY-MM-DD-live-newproduct/raw-visible-rows.jsonl \
     --qualified-output tmp/zhitai-qualified-YYYY-MM-DD.json \
     --screen-only \
     --limit 30
   ```

6. Only for top screened candidates, use the Zhitai page/extension to open Temu. If Temu lands on `search_result.html?search_key=PRODUCT_ID`, extract the real product detail link from the results page and continue to the `-g-PRODUCT_ID.html` or `goods_id=PRODUCT_ID` detail page.
7. Capture true Temu detail fields: product URL, product ID, title, image URLs, attributes/spec text, size text, and material text.
8. Submit only verified captures back through `/api/zhitai/product-link-captures`; failed, skipped, product-id-only, constructed, or search-result captures must not be submitted.
9. To materialize a fresh batch from temp files, commit only verified captures:

   ```bash
   node scripts/import-zhitai-demand-painpoints.mjs \
     --input data/research/zhitai/YYYY-MM-DD-live-newproduct/raw-visible-rows.jsonl \
     --qualified-output tmp/zhitai-qualified-YYYY-MM-DD.json \
     --commit-verified data/research/zhitai/YYYY-MM-DD-live-newproduct/product-link-captures.jsonl \
     --limit 30
   ```

10. Remove or avoid writing unverified Zhitai-only rows from `pipeline-store.json`; a row without a verified Temu detail URL, title, image, and spec/attribute text must not remain in the main console as pending inventory.
11. Re-run the read-only status check and verify the console shows the updated status.

## Writeback Rules

- Successful capture: store the real Temu detail URL and `sourceDetails.temuProductPage`; console should show `Temu详情已抓`.
- Success requires `captureStatus: captured`, a real Temu detail URL, a Temu title, at least one image URL, and spec/attribute text.
- Not eligible: do not retain it as a main console row. If an audit trail is required, mark `temuDetailCaptureStatus: skipped` with a concrete skip reason in a non-user-facing run/audit record.
- Jump or detail extraction failure: do not retain it as a main console row and do not fabricate a Temu detail URL.
- Never treat `search_result.html`, merchant/store pages, copied search pages, or constructed placeholders as the final product URL.
- Before finishing, audit the current store and remove same-day Zhitai records that do not have a verified Temu product URL.
- Do not process historical batches by default. Skip `06-11`, `06-08`, and any non-today batch unless the user explicitly changes scope.
- Do not create ProductTruth, supplier, listing, or publish-ready green states from Zhitai/Temu evidence alone.

## Useful Project Checks

Use these after code changes or after validating a meaningful capture milestone:

```bash
cd ~/Documents/Playground/flow-task-center-pro
npm test -- zhitaiProductLinkCapture
npm run check
npm run build
```

After a verified milestone worth recording:

```bash
cd ~/Documents/Playground/flow-task-center-pro
npm run memory:sync
```

## Troubleshooting

- If no targets appear, confirm today’s date and compare `captureBatchDate` versus `sourceSnapshotDate`.
- If Zhitai rows are not found, switch the table to 100 rows/page and rely on title, image key, rank, and page metadata.
- If Temu opens a search page, use the product ID in `search_key` to find the first matching real detail URL.
- If Chrome automation becomes unresponsive, stop live browser work and rely on store/API checks until the user refreshes the page.
- Keep secrets, cookies, credentials, and runtime config out of logs and final answers.

---
name: temu-shangjia
description: Turn AI商品上架包 / listing-upload-pack artifacts from flow-task-center-pro into a Zhitai/TEMU 创建产品 saved draft by filling fields and uploading images, then clicking only 暂存. Use when the user asks to TEMU上架, temu上架, 上架包暂存, 蜘泰创建产品, Zhitai staged listing, TEMU草稿, 用AI商品上架包填蜘泰, or convert an AI商品上架包 folder into a non-publishing draft.
---

# TEMU上架

Use this skill to take an AI 商品流水线上架包 and create a Zhitai/TEMU product draft that is saved with `暂存` only. This is an operator-assist workflow, not a platform publishing adapter.

## Defaults

- Project: `~/Documents/Playground/flow-task-center-pro`
- Workspace: `default-workspace`
- Console: `http://127.0.0.1:4173/pipeline-console.html?workspaceId=default-workspace`
- Preferred pack: `~/Documents/Playground/flow-task-center-pro/output/listing-upload-packs/default-workspace/latest/manifest.json`
- Human pack root: `~/Documents/AI商品上架包`
- Zhitai create page: `https://www.data.izhitai.net/#/instrument/shelving/index`
- Receipt name: `zhitai-staging-receipt.json`

## Hard Rules

- Click only `暂存` as the final action. Never click `移入待发布`, `发布至TEMU`, `发布`, `提交发布`, or any equivalent publish/submit action.
- Do not update `PublishPackage`, `ErpDraft`, `FinalApprovalReceipt`, platform submit evidence, or project green states.
- Do not invent ProductTruth, logistics, price, material, dimensions, store, warehouse, freight template, or compliance fields. Leave unknown values blank or `待补`.
- Do not read, print, or store cookies, tokens, passwords, OTPs, runtime config, or credential files.
- Use the user's existing Chrome login. If Chrome automation is unavailable or selectors are unstable, stop and report the exact missing manual step.

## Workflow

1. Read `~/Documents/Playground/AGENTS.md` and `CURRENT_TASK.md` in a new thread.
2. Resolve exactly one pack:

   ```bash
   node ~/.codex/skills/temu-shangjia/scripts/resolve_listing_pack.mjs \
     --project ~/Documents/Playground/flow-task-center-pro \
     --pretty
   ```

   Add `--sku <masterSku>` when multiple SKUs exist. Add `--folder "~/Documents/AI商品上架包/<folder>"` for a direct human-pack folder.

3. Run a fast preflight before live browser work:

   ```bash
   node ~/.codex/skills/temu-shangjia/scripts/preflight_staging_pack.mjs \
     --folder "~/Documents/AI商品上架包/<folder>" --pretty
   ```

   Use `--manifest <manifest.json>` instead of `--folder` for manifest packs.
   For the user-authorized package02 diagnostic profile, add `--authorized-defaults 包02`; this treats `P V G`, `美国`, all visible warehouses, `9个工作日内发货`, freight template containing `够快`, and `绒布 / 米色` as approved staging defaults while still leaving `站外产品链接` blank.

4. Inspect the resolver/preflight output before live browser work:
   - If it returns `reason: multiple-targets`, ask the user which SKU/folder to use.
   - If `imageCount` is `0` or the title is missing, do not open Zhitai unless the user explicitly wants a diagnostic dry run.
   - If `missingFields` contains Zhitai required fields, proceed only as a draft attempt and expect Zhitai validation to block until the user fills them.
   - If preflight reports `images:order-mismatch` or missing images, stop fast and write a blocked receipt when useful.

5. Read `references/field-map.md` when mapping fields, choosing category paths, or debugging validation. Read `references/diagnostics-speed.md` when the page is slow, upload fails, or the task is a diagnostic blocked-package test. Read `references/record-replay-video-notes.md` when the user provides `.mov` demonstrations, mentions Record & Replay, or upload/modal state has been demonstrated in a recording.
6. Open the Zhitai create page in Chrome with the user's logged-in session. Prefer `chrome:control-chrome` when available; use Computer Use only when Chrome tooling is unavailable or a native file picker must be handled visually.
7. Before live image upload, run:

   ```bash
   node ~/.codex/skills/temu-shangjia/scripts/check_chrome_file_access.mjs --pretty
   ```

   If it reports file access off, background upload may fail with `Not allowed`; Chrome may store this setting as either `allow_file_access` or `newAllowFileAccess`. Use the native file picker path or ask for a fresh Record & Replay capture if this needs hardening.
8. If an `编辑产品` dialog is already open, do not reuse it for a new package. Close/cancel it and start from the list unless the user explicitly asked to edit that exact draft.
9. If a first modal asks `平台类型` and shows `全托管 / 半托管`, choose `半托管` only for this TEMU/direct-ship project context. Otherwise stop and ask.
10. Verify the page is the `创建产品` form and that the footer contains the exact buttons `取消`, `暂存`, `移入待发布`, and `发布至TEMU`.
11. Fill by visible labels, ARIA labels, placeholders, and stable text. Do not rely on screen coordinates unless no semantic target exists.
12. Do not fill `站外产品链接` / product external link by default. Keep supplier URLs as internal evidence only unless the user explicitly asks to fill that field in the current request.
13. Select the target store before live image upload. On Zhitai, image uploads can appear to succeed in Chrome's file chooser but remain at `0` thumbnails when `店铺名称` is still blank.
14. Upload images from `uploadImageFolderPath` in numeric order:
   - `01-素材图.jpg`
   - `02-轮播图-1.jpg` through `06-轮播图-5.jpg`
   - `07-外包装图片.jpg`
   - `08-详情图-1.jpg`
   - `09-详情图-2.jpg`
   For package02/I19Y8C, when the user asks for a carton outer-package image, use `~/Documents/文件整理_2026-05-21/来自桌面/图片截图/纸箱.jpg` for `外包装图片` instead of the product-scene `07-外包装图片.jpg`.
15. For `产品详情`, click `编辑详情`, add `图片` components in the TEMU detail decorator, upload `08-详情图-1.jpg` and `09-详情图-2.jpg`, remove any accidental empty image modules, then confirm the detail editor.
16. Recheck the form. If required field errors remain, report them and do not click publish-related actions.
17. Save the draft by clicking only the visible button with exact text `暂存` unless the current user request is a handoff/fixed-field-only run. In handoff mode, leave the Chrome tab open, do not click `暂存`, and write a receipt with `status: handoff`.
18. After Zhitai accepts the save, visibly remains as a saved draft, or the user requested a handoff before saving, write a local receipt:

   ```bash
   node ~/.codex/skills/temu-shangjia/scripts/write_staging_receipt.mjs \
     --manifest ~/Documents/Playground/flow-task-center-pro/output/listing-upload-packs/default-workspace/latest/manifest.json \
     --status staged \
     --note "Saved with Zhitai 暂存 only"
   ```

   Use `--folder` instead of `--manifest` for a direct human-pack folder.

## Browser Automation Notes

- Treat the Zhitai flow as a state machine: list page -> optional `平台类型` -> `创建产品` -> optional category/attribute/file-picker dialogs -> final validation/saved state. Do not continue from an unexpected state.
- For category selection, search the suggested category text first. If Zhitai shows multiple paths, choose the path that visibly matches the product category; if no path is clearly correct, stop and ask the user.
- For dropdowns such as store, site, warehouse, promised ship time, freight template, variant template, material, and brand, choose only exact visible values from the pack. If the pack value is blank or `待补`, leave it unset.
- For SKU variant rows, fill dimensions, weight, price, stock, and SKU only when values exist in the pack. Keep zero or empty values blank unless the pack explicitly says the field is real.
- When Zhitai labels variant weight as `重量(g)` and the pack value is in kg, use a direct unit conversion only for a verified numeric value, such as `0.18 kg` -> `180 g`.
- Native file pickers may be filled by entering the `01-上传图片` folder path and selecting the ordered files by exact file name. Confirm selected thumbnails appear before continuing. If Chrome file chooser upload fails or times out once, stop retrying, write a blocked receipt, and report the extension/manual upload fix.
- If a save response or toast indicates validation failure, capture the visible errors in the final answer and do not write a success receipt. A dry-run receipt may be written with `--status blocked` if useful.

## Helper Scripts

- `scripts/resolve_listing_pack.mjs`: normalize the preferred manifest or a human-pack folder into one JSON target with fields, images, warnings, blockers, and copy paths.
- `scripts/preflight_staging_pack.mjs`: quickly validate SKU, title, 9-image order, missing required fields, user-authorized defaults profiles such as `--authorized-defaults 包02`, skipped fields, and whether to open Zhitai.
- `scripts/check_chrome_file_access.mjs`: check whether the Codex Chrome extension has `允许访问文件网址` enabled before background uploads, including Chrome's `allow_file_access` and `newAllowFileAccess` preference formats.
- `scripts/write_staging_receipt.mjs`: write a secret-free `zhitai-staging-receipt.json` beside the selected pack after a `暂存` attempt.

## Validation

Before treating skill changes as complete, run:

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/.codex/skills/temu-shangjia
node ~/.codex/skills/temu-shangjia/scripts/resolve_listing_pack.mjs --pretty
node ~/.codex/skills/temu-shangjia/scripts/resolve_listing_pack.mjs \
  --folder "~/Documents/AI商品上架包/<existing-folder>" --pretty
node ~/.codex/skills/temu-shangjia/scripts/preflight_staging_pack.mjs \
  --folder "~/Documents/AI商品上架包/<existing-folder>" --pretty
node ~/.codex/skills/temu-shangjia/scripts/check_chrome_file_access.mjs --pretty
```

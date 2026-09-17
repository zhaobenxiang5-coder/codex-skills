# Diagnostics And Speed Notes

Use this reference when a live Zhitai attempt is slow, blocked, or needs a repeatable diagnostic path.

## Known Slow Points

- Zhitai `创建产品` is a dynamic modal. Label text is reliable; source order is not.
- Existing rows can open `编辑产品` with old values. If the target is a new package, close `编辑产品` and restart from `创建产品`; do not overwrite a prior draft.
- The first `平台类型` modal may show `全托管 / 半托管`. For this project use `半托管` only when the task is TEMU/direct-ship/half-managed. Otherwise stop and ask.
- Chrome file uploads may fail if the Codex Chrome extension cannot open the file chooser. Try the file chooser flow once per upload area. If it times out, stop, write a blocked receipt, and report the manual upload or extension setting needed.
- A screen recording (`.mov`) is not a Record & Replay event stream. If upload selector behavior needs to become repeatable, start a fresh Record & Replay capture and build from `events.jsonl`; do not infer a replayable skill from video frames alone.
- Before live Zhitai upload work, check the Codex Chrome extension detail page for `允许访问文件网址`. Chrome may persist this as `allow_file_access` or `newAllowFileAccess`; either true value is acceptable. If it is off, `filechooser.setFiles` can fail with `Not allowed`; turning it on may require a Chrome restart before background upload works.
- Select `店铺名称` before uploading images. A Zhitai create form with no store can accept a file chooser event while the visible thumbnail count stays at `0`, which wastes time and looks like a Chrome upload failure.
- If background upload still fails, use one real-browser/native-file-picker pass to prove the package, then schedule Record & Replay capture for the next hardening pass. Do not spend more than one retry on coordinate-only upload attempts.
- Broad DOM/body dumps are expensive. Prefer one targeted form scan and one screenshot when the page shape changes.

## Fast Path

1. Run `scripts/preflight_staging_pack.mjs` before opening Chrome.
2. For package02/I19Y8C, run preflight with `--authorized-defaults 包02` so the user's approved staging defaults are not treated as unresolved unknowns.
3. Run `scripts/check_chrome_file_access.mjs --pretty` before background upload attempts.
4. If the preflight reports missing title, missing images, or image order mismatch, do not open Zhitai unless the user explicitly asks for a dry run.
5. If required Zhitai fields are still missing after authorized defaults, continue only as a diagnostic draft attempt. Expect `暂存` validation to block.
6. Confirm the current Zhitai state: list page, `平台类型`, `创建产品`, `编辑产品`, native file picker, category modal, attribute modal, or validation modal. Move to the expected next state before filling fields.
7. Fill only high-confidence fields: title, SKU, origin, sensitive/custom radio values, package dimensions, and weight.
8. Do not fill `站外产品链接` / product external link by default.
9. Leave category, store, site, warehouse, lead time, freight template, package shape/type, material, color, price, and product size blank unless exact pack values exist or the current user explicitly authorized fixed defaults.
10. If the user requests a fixed-field-only handoff for Record & Replay, fill the stable fields, upload all currently supported images, keep external links/prices unknown fields blank, and stop before `暂存`.
11. Upload images in numeric order after store selection. If upload fails once because the file chooser is unavailable, do not keep retrying in Chrome.
12. Before saving, verify exact footer buttons: `暂存`, `移入待发布`, `发布至TEMU`.
13. Click only exact `暂存`. Never click publish-related buttons.

## Package02 Authorized Defaults

- Profile: `--authorized-defaults 包02` / `package02` / `I19Y8C`.
- Applies only when the target SKU is `I19Y8C`; otherwise it is reported and not applied.
- Covers: `产品分类`, `店铺名称`, `外包装形状`, `外包装类型`, `经营站点`, `发货仓`, `承诺发货时间`, `运费模板`, `material`, and `color`.
- Does not cover: `站外产品链接`; keep it blank.
- Freight template rule: choose a visible template containing `够快`; if absent, stop and write a blocked receipt.
- If the user says the outer package image should be the carton/box icon, use the known local carton image `~/Documents/文件整理_2026-05-21/来自桌面/图片截图/纸箱.jpg` for `外包装图片`; search the local filesystem for `纸箱` if that file is missing.
- Detail images are handled through `产品详情 -> 编辑详情 -> 图片` components. Add two image modules, upload `08-详情图-1.jpg` and `09-详情图-2.jpg`, and delete accidental empty modules before confirming the detail editor.

## Video-Demonstrated State Machine

- `平台类型`: choose `半托管`, then click `确定`; if the dropdown does not open semantically, use the visible option text, not a guessed coordinate.
- `编辑产品`: old draft state; safe response is close/cancel unless the current request explicitly names that draft.
- `创建产品`: only valid draft-start state. Verify title is blank or about to be filled from the target package.
- macOS file picker: select by exact file names from `01-上传图片`; verify thumbnails appear after each upload group.
- category dialog: search target terms and choose the terminal category path; if multiple similar paths appear and no user rule exists, stop and ask.
- product attributes dialog/dropdowns: use exact or user-authorized fallback values; record actual selected values in the receipt note when fallbacks are used.
- final validation modal/toast: capture visible missing fields, write `blocked`, and stop. Do not attempt publish actions.

## Failure Handling

- For Zhitai validation errors, capture visible missing-field messages and write `zhitai-staging-receipt.json` with `status: blocked`.
- For browser upload/tooling errors, write `status: blocked` with the exact operational blocker.
- Do not turn a blocked diagnostic attempt into a production-ready state in `PublishPackage`, `ErpDraft`, or `FinalApprovalReceipt`.

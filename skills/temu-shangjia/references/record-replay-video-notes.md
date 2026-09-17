# Record And Replay Video Notes

Use this reference when the user provides screen recordings, asks to optimize this skill with Record & Replay, or a live Zhitai run gets slow around uploads or modal state.

## What The Two Videos Prove

- The `.mov` files are useful visual evidence, but they are not replayable Record & Replay event streams. They do not include AX target IDs, selected elements, file-picker events, or `events.jsonl`.
- The slow path is mostly a state-machine problem, not a copywriting problem: Zhitai can be on `暂存` list, `平台类型`, `创建产品`, `编辑产品`, macOS file picker, category modal, product-attribute modal, or final validation modal.
- Existing drafts can open as `编辑产品` and contain old values such as another title, existing images, `PU皮革`, or `黑色`. Do not overwrite those when the target is a fresh pack.
- The native file picker can remember the `01-上传图片` folder and shows files by exact names. Use file names/AX items instead of blind screen coordinates when possible.
- macOS file picker covers the main screen on a single-display Mac even if Chrome is moved to a small window. Moving the browser window is not a real background-upload solution.
- Image upload should happen after `店铺名称` is selected. In live testing, uploads before store selection could complete the file picker step but leave Zhitai thumbnail counts unchanged.

## Replayable Workflow Shape

1. Start at `https://www.data.izhitai.net/#/instrument/shelving/index` on the `智能上架` list.
2. If an `编辑产品` dialog is open, close/cancel it unless the user explicitly asked to edit that exact draft.
3. Click `创建产品`.
4. In `平台类型`, open the dropdown, choose `半托管`, click `确定`.
5. Verify the next dialog is `创建产品`, not `编辑产品`, and the footer contains `取消 / 暂存 / 移入待发布 / 发布至TEMU`.
6. Fill package values. Keep `站外产品链接` blank unless the user explicitly overrides that rule in the current request.
7. Select the store before image upload.
8. Upload images by visible field:
   - `素材图`: select only `01-素材图.jpg`.
   - `轮播图`: select `02-轮播图-1.jpg` through `06-轮播图-5.jpg`.
   - `外包装图片`: use the user-specified carton/box image when requested; for package02 this is `~/Documents/文件整理_2026-05-21/来自桌面/图片截图/纸箱.jpg`.
   - `产品详情` / detail editor: click `编辑详情`, add `图片` components, upload `08-详情图-1.jpg` and `09-详情图-2.jpg`, remove empty modules, then click the detail editor's own `确 定`.
9. For category, search/choose `饰品收纳` and the terminal path `其他（饰品收纳）` when this product-family rule is authorized by the user.
10. For package02/I19Y8C, run preflight with `--authorized-defaults 包02` and fill authorized defaults only:
   - store `P V G`
   - site `美国`
   - all visible warehouses when the user explicitly asks to select all
   - lead time `9个工作日内发货`
   - freight template containing `够快`; stop if absent
   - material/color fallback only when the user has authorized it for that pack
11. Before saving, re-read visible text and ensure the final click target is exact `暂存`. Never click `移入待发布`, `发布至TEMU`, or bare `发布`. If the user asks for a fixed-field handoff for their own Record & Replay capture, stop before `暂存` and write `status: handoff`.

## Record & Replay Capture Checklist

When the user is ready to create the durable replay version:

1. Start Record & Replay before the user opens/clicks Zhitai actions.
2. Ask the user to perform one clean pass from list page through final `暂存` result or validation blocker.
3. Ask the user to avoid entering secrets and to stop after the page shows either saved draft evidence or visible validation messages.
4. After the user says they are done, stop the recording and read `session.json` plus `events.jsonl`.
5. Convert the event stream into stable targets: window/app names, visible labels, AX element roles, selected file names, and validation text.
6. Update this skill from the event stream. Do not infer replay-critical selectors from `.mov` frames alone.

## Speed Guardrails

- Run `scripts/check_chrome_file_access.mjs --pretty` before trying background uploads.
- If the check says file access is off, enable `允许访问文件网址` for the Codex Chrome extension and restart Chrome if `setFiles` still fails.
- Limit upload experiments to one background attempt and one native-picker attempt. If both fail, write a blocked receipt with the exact failure and switch to Record & Replay capture.
- Do not continue if the visible dialog title is `编辑产品` while the target package requires a new `创建产品` draft.

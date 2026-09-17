---
name: doubao-lab
description: Use the local doubao-lab CLI for Doubao acquisition campaign rule verification, original screen-recording production, media QA, official-task attribution evidence, settlement reporting, or troubleshooting any partial/failed_stop campaign gate.
---

# Doubao Lab

Use this workflow only inside the independent `doubao-acquisition-lab` repository. Prefer `--json`
for decisions and preserve the CLI exit code.

## Start read-only

```bash
doubao-lab --root /absolute/path/to/doubao-acquisition-lab --json doctor
doubao-lab --root /absolute/path/to/doubao-acquisition-lab --json campaign verify
doubao-lab --root /absolute/path/to/doubao-acquisition-lab --json content list
```

- Treat `partial` as not ready for production.
- Treat `failed_stop` as a stop, not a retry target.
- Never infer missing official task fields from an X post or earnings screenshot.
- Never use an invitation/referral code.

## Enforce the staged workflow

1. Ask the user to read the WeChat official task page and place screenshots in local
   `data/private/`; login, QR, SMS, real-name steps, task binding, AI declaration, and final
   publication remain manual.
2. Update only facts the official page actually shows in `campaign-snapshot.json`, then run
   `campaign verify --write-status`.
3. Work only on the single `pilot=true` item until the official task page records it as
   `task_recognized`.
4. Require real current-client reproduction and explicit feature/privacy/rights checks before
   rendering.
5. Run `render`, `qa`, and `package`; use the SHA-256 in the generated checklist.
6. Record `manual_publish`, `platform_confirmed`, and `task_recognized` as distinct events with
   local evidence files.
7. Unlock the remaining nine items only after `task_recognized`.
8. Call the first round `success` only when `settleable` or `settled` has a real positive amount.

## Evidence rules

- Live evidence belongs in ignored `evidence-ledger.jsonl`; never modify old lines.
- Account screenshots, cookies, identity, earnings details, recordings, and renders stay in
  ignored local directories.
- A work ID/public URL proves publication, not task recognition.
- Do not republish an unknown/failed work with the same video hash.
- Reports must use ledger data only and retain the claim boundary that one result does not prove
  stable monthly income.

## Qianfan boundary

Evaluate the existing Qianfan uploader only after the pilot is `task_recognized`. First perform a
read-only field probe and dry-run. If it cannot select and read back the exact Doubao task, retain
manual official-task publication; generic product or mini-program links are not substitutes.

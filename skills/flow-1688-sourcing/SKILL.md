---
name: flow-1688-sourcing
description: 抓需求产品（1688） for Flow AI商品流水线 demand-to-1688 sourcing. Use when the user wants to discover demand, let the configured AI_TEXT model form structured sourcing intent, search AlphaShop/1688, verify Offer details/SKUs, or admit real products into the ProductMaster sourcing-candidate pool. This skill stops before ProductTruth, Flow9, listing, browser-runner, and publishing.
---

# 抓需求产品（1688）

Project boundary:

```text
~/Documents/Playground/flow-task-center-pro
workspaceId=default-workspace
console=http://127.0.0.1:4173/pipeline-console.html?workspaceId=default-workspace
```

This skill owns only:

```text
需求发现
→ AI理解需求
→ 1688搜索
→ Offer召回
→ 详情/SKU核验
→ ProductMaster商品池入库
```

Never call or create `ProductTruth`, `Flow9`, `Image2`, `ImageJob`, TEMU/店小秘属性映射, `ListingDraft`, Browser Runner, or publish entities.

## Product-pool meaning

`ProductMaster.productPoolStatus=sourcing-candidate` means the real 1688 product is worth retaining for later processing. It does not mean image-ready, listing-ready, or publish-ready.

Missing product size, package dimensions, package weight, logistics, profit, platform attributes, and final SKU selection are recorded but do not block this admission.

## Demand and search

1. Use current-batch evidence. A stale evidence row skips only itself; it must not stop the whole run.
2. Formal sourcing uses the configured `AI_TEXT_*` gateway (`gpt-5.6-sol` by default). A normal run has exactly two logical GPT calls; one recovery call is allowed only when the target is still short.

GPT call 1 receives every current-day product signal from `trending-new-products` and `micro-innovation` in one request, after exact product-ID/link deduplication only. It produces category allocation, structured demand, semantic replacement boundaries, `criticalMatchGroups`, and 4-8 layered Chinese search queries per demand:

```js
{
  productType,
  criticalMatchGroups,
  mustHave,
  preferred,
  exclusions,
  audience,
  useScenario,
  purchaseReason,
  evidenceIds
}
```

3. `criticalMatchGroups` is limited to product identity, key structure, explicit function, identity material, identity theme, and set form. Color, ordinary material, style, and scenario are normally `preferred`.
4. Run the pre-generated plan in stages with seven staggered AlphaShop lanes. The normal first recall executes only the first one or two core queries per demand, then builds a bounded two-round reserve. For target 100, prepare up to 250 hard-qualified candidates: at most 150 for call 2 and 100 unseen candidates for recovery, with a 350-attempt first-detail protection limit. Include `采购价7元以上 起批量1件 一件代发`; SKU detail remains authoritative. Never call GPT per search query.
5. Local code checks only Offer identity, price/MOQ/stock, supplier facts, hard brand/IP/child/DIY/component/wrong-category risk, and deduplication. It must not declare a candidate exact or similar.
6. GPT call 2 reviews at most 150 hard-fact-qualified candidates in one request. Send compact title/attribute/material/SKU evidence plus ranking references and at most five Offer-ID contact sheets. It returns `exact | similar | mismatch | risk-review` plus a real `matchScore`. The fixed score bands are `exact=85-100`, `similar=70-84`, and `<70=mismatch`; a score of 100 is not required. `exact/similar` must also have matching product identity and critical structure/function groups. Exact and similar both count toward the target.
7. If call 2 is short, execute its demand-bound `gapQueries` plus the unused synonym/soft-condition/source-title reserve queries. Reference-image recall is recovery-only, uses at most one image per under-filled demand, and is capped to 12 demands by default. Before recovery, compare the AI category allocation with accepted call-2 results, prioritize search/detail work for under-filled categories, and reserve roughly two review candidates per missing final slot. Collect unseen hard-qualified Offers and use GPT call 3 only on unseen candidates. No fourth logical call is allowed. A short result after recovery is `failed-exhausted`.

If demand planning or candidate review is unavailable/invalid, mark the run `failed-fatal`. Never silently present fixed regex, local scores, or an incomplete AI response as the semantic result.

## Offer and detail admission

Search preview is recall-only. It may immediately reject only clear brand/IP, child, DIY kit, component-as-product, wrong-category, or missing Offer identity/link. Do not reject preview rows for summary price, missing MOQ, missing supplier, title wording, or image count; read detail first.

Product-pool admission requires detail evidence for:

```text
real 1688 URL + Offer ID + supplier + title
at least one real product image
offer not explicitly unavailable
at least one SKU price >= 7 RMB
MOQ = 1
material evidence OR usable SKU specification
no hard risk
no structured-demand must-have conflict
```

## SKU and persistence

- `SupplierOffer.supplierVariants` and `Raw1688Candidate.rawDetail` retain every returned SKU.
- `ProductMaster.sourcingCandidateSkus` retains at most three demand-ranked candidates.
- Deduplicate SKU rows by `supplierSkuId + supplierSpecId`.
- Auto-lock a single eligible SKU or one unique highest-scoring SKU.
- Ties/insufficient evidence set `selectedSkuStatus=sku-selection-pending`; this does not block ProductMaster.
- Deduplicate products by normalized 1688 Offer ID/link. Different real Offer links are not removed merely for looking similar.
- Preview checkpoints retain partial results for 24 hours but do not write ProductMaster. By default a 99/100 run is not complete and cannot commit. Only `exact + similar >= targetCount` is `completed`; statuses are `running`, `completed`, `failed-exhausted`, and `failed-fatal`.
- An exhausted short batch may be committed only after the operator explicitly selects its candidates and presses the separately labelled manual short-batch action. The API requires `operator-approved-shortfall`, re-reads every selected detail, reruns hard fact/risk validation atomically, records `committed-partial`, and never relabels the target as completed. This is still ProductMaster-only and never creates downstream entities.
- Resume a failed stage only with the same explicit `runId`; do not repeat completed searches, details, or AI review rounds. A completed/committed `runId` is immutable and returns its saved result without launching another network run.
- Commit requires an explicit candidate selection. Re-read selected Offer details and repeat hard fact/risk validation without another GPT call. If any selected Offer fails, stop the entire commit.
- Commit repeats the score-band check: exact below 85, similar below 70, or an explicit product-identity/critical-group failure cannot enter ProductMaster.
- Show both the AI-recommended category allocation and the actual selected category counts.
- Expose real usage counters from the network boundaries: GPT demand/review/recovery logical calls, HTTP attempts/retries/model, plus AlphaShop ranking/text/image/detail calls, attempts, and retries. Local expansion must never increment GPT usage.

Each admitted master must contain:

```js
{
  productPoolStatus: 'sourcing-candidate',
  sourcingAdmission: {
    status: 'passed',
    demandIntentId,
    supplierOfferId,
    admittedAt,
    reasons: []
  }
}
```

## Commands

Dry-run, target 10, no write:

```bash
cd ~/Documents/Playground/flow-task-center-pro
npm run alphashop:import-1688-ready-products -- \
  --track adult-fashion-jewelry-accessories \
  --target-count 10 \
  --dry-run \
  --debug-report
```

Explicit commit:

```bash
npm run alphashop:import-1688-ready-products -- \
  --track adult-fashion-jewelry-accessories \
  --target-count 10 \
  --commit-accepted
```

Resume only when the user explicitly supplies the prior run id:

```bash
npm run alphashop:import-1688-ready-products -- \
  --track adult-fashion-jewelry-accessories \
  --target-count 10 \
  --resume-run-id <run-id> \
  --commit-accepted
```

## Credentials

The CLI reads the current runtime environment and ignored local env files for `ALPHASHOP_ACCESS_KEY`, `ALPHASHOP_SECRET_KEY`, and the existing `AI_TEXT_*` gateway configuration. Never print or persist credential values.

## Verification

```bash
npx vitest run \
  test/preciseDemandMatching.test.js \
  test/sourcingPoolAdmission.test.js \
  test/alphashop1688DemandImport.test.js \
  test/alphashop1688StrictReadyImport.test.js \
  test/alphashop1688Detail.test.js

npm run build
npm run console:check
npm run check
```

Verify the ProductMaster/Offer/source-image counts changed as expected while ProductTruth, ImageJob, ListingDraft, and publish entity counts remained unchanged.

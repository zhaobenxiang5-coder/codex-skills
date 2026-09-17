#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(args.project || '~/Documents/Playground/flow-task-center-pro');
const workspaceId = args.workspace || 'default-workspace';
const date = args.date || todayLocalDate();
const storePath = path.resolve(
  args.store || path.join(projectRoot, 'data/workspaces', workspaceId, 'pipeline-store.json')
);
const modulePath = path.join(projectRoot, 'src/saas/zhitaiProductLinkCapture.js');

if (!fs.existsSync(storePath)) {
  fail(`Store not found: ${storePath}`);
}
if (!fs.existsSync(modulePath)) {
  fail(`Zhitai capture module not found: ${modulePath}`);
}

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const { buildZhitaiProductLinkTargets } = await import(pathToFileURL(modulePath).href);
const summary = buildZhitaiProductLinkTargets(store, {
  captureDate: date,
  missingOnly: false,
  requireTemuDetail: true
});
const pending = buildZhitaiProductLinkTargets(store, {
  captureDate: date,
  missingOnly: true,
  requireTemuDetail: true,
  limit: Number(args.limit || 500)
});

const todayEvidence = (store.marketEvidence || [])
  .filter((evidence) => evidenceCaptureDate(evidence) === date)
  .filter(isZhitaiEvidence);
const statusCounts = countBy(todayEvidence, (evidence) => temuStatus(evidence));
const passedLike = pending.targets.filter((target) => likelyEligibleTarget(target));
const skippedReasons = countBy(todayEvidence, (evidence) => {
  const reason = evidence?.temuSkipReason
    || evidence?.sourceDetails?.temuProductPage?.skipReason
    || evidence?.sourceDetails?.temuProductPage?.captureError
    || '';
  return reason || '(none)';
});

console.log(`Zhitai Temu capture status`);
console.log(`Project: ${projectRoot}`);
console.log(`Workspace: ${workspaceId}`);
console.log(`Date: ${date}`);
console.log(`Store: ${storePath}`);
console.log('');
console.log(`Today Zhitai evidence: ${todayEvidence.length}`);
console.log(`Temu captured: ${statusCounts.captured || 0}`);
console.log(`Temu skipped: ${statusCounts.skipped || 0}`);
console.log(`Temu failed: ${statusCounts.failed || 0}`);
console.log(`Temu pending: ${pending.targetCount || 0}`);
console.log(`Likely eligible pending: ${passedLike.length}`);
console.log(`Linked product URLs: ${summary.linkedCount || 0}/${summary.totalEvidence || 0}`);
console.log('');

if (passedLike.length) {
  console.log(`Next likely eligible targets:`);
  for (const target of passedLike.slice(0, Number(args.show || 10))) {
    const rank = target.signals?.searchRank || target.sourceDetails?.absoluteRank || '?';
    const sales = [
      target.signals?.daySales,
      target.signals?.weekSales,
      target.signals?.monthSales,
      target.signals?.totalSales
    ].filter((value) => value !== null && value !== undefined && value !== '').join('/');
    console.log(`- ${target.evidenceId} | rank ${rank} | sales ${sales || '-'} | ${target.title}`);
  }
} else if (pending.targetCount) {
  console.log(`There are pending targets, but none look eligible by the lightweight script heuristic.`);
} else {
  console.log(`No pending Temu detail targets for ${date}.`);
}

const meaningfulReasons = Object.entries(skippedReasons)
  .filter(([reason, count]) => reason !== '(none)' && count > 0)
  .sort((a, b) => b[1] - a[1]);
if (meaningfulReasons.length) {
  console.log('');
  console.log(`Skip/failure reasons:`);
  for (const [reason, count] of meaningfulReasons.slice(0, 8)) {
    console.log(`- ${reason}: ${count}`);
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function evidenceCaptureDate(evidence = {}) {
  const details = evidence.sourceDetails || {};
  return String(
    details.captureBatchDate
    || evidence.captureBatchDate
    || details.sourceSnapshotDate
    || evidence.sourceSnapshotDate
    || ''
  ).slice(0, 10);
}

function isZhitaiEvidence(evidence = {}) {
  const details = evidence.sourceDetails || {};
  return String(evidence.sourcePlatform || evidence.platformId || '').toLowerCase() === 'zhitai'
    || String(evidence.source || '').includes('zhitai')
    || String(details.sourceType || '').includes('zhitai-live-newproduct');
}

function temuStatus(evidence = {}) {
  const details = evidence.sourceDetails || {};
  const page = details.temuProductPage || {};
  if (evidence.temuDetailCaptureStatus) return evidence.temuDetailCaptureStatus;
  if (page.captureStatus) return page.captureStatus;
  if (page.productUrl) return 'captured';
  if (evidence.productUrlSource === 'captured-from-zhitai-title-temu-detail') return 'captured';
  return 'pending';
}

function likelyEligibleTarget(target = {}) {
  const title = String(target.title || '').trim();
  const rank = Number(target.signals?.searchRank || target.sourceDetails?.absoluteRank || 0);
  const sales = [
    target.signals?.daySales,
    target.signals?.weekSales,
    target.signals?.fourteenDaySales,
    target.signals?.monthSales,
    target.signals?.totalSales
  ].map(Number).filter(Number.isFinite);
  const hasSignal = sales.some((value) => value > 0);
  return title.length >= 8 && (!rank || rank <= 5000 || hasSignal);
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = String(selector(item) || 'unknown');
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

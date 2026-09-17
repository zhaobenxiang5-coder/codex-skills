#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveDxmPack } from './resolve_dxm_pack.mjs';

const DEFAULT_PROJECT = '~/Documents/Playground/flow-task-center-pro';
const DEFAULT_WORKSPACE = 'default-workspace';

async function writeDxmReceipt(options = {}) {
  const resolved = await resolveDxmPack(options);
  if (!resolved.ok) return { ok: false, reason: resolved.reason || 'pack-resolve-failed', resolved };
  const pack = resolved.pack || {};
  const project = path.resolve(options.project || pack.project || DEFAULT_PROJECT);
  const workspaceId = options.workspaceId || pack.workspaceId || DEFAULT_WORKSPACE;
  const status = clean(options.status || 'dry-run');
  const now = options.now || new Date().toISOString();
  const validationBlockers = parseList(options.validationBlockers || '');
  const receipt = {
    entityType: 'DianxiaomiShangjiaReceipt',
    version: 'dianxiaomi-shangjia-receipt-v2',
    status,
    mode: clean(options.mode || ''),
    note: clean(options.note || ''),
    workspaceId,
    masterSku: pack.masterSku || pack.fields?.sku || '',
    productName: pack.productName || '',
    storeName: clean(options.storeName || ''),
    categoryPath: clean(options.categoryPath || ''),
    warehouseSelection: clean(options.warehouseSelection || 'GoFast_Y2-L美西_7-9'),
    warehouseSelectionMode: clean(options.warehouseSelectionMode || 'select-all'),
    imageUrlSource: clean(options.imageUrlSource || ''),
    temporaryImageUrl: parseBoolean(options.temporaryImageUrl || false),
    imageVisible: parseBoolean(options.imageVisible || false),
    postImportRequired: parseList(options.postImportRequired || ''),
    manualTestPriceUsd: normalizePrice(options.manualTestPriceUsd || options.testPriceUsd || ''),
    manualTestDeclarePriceCny: normalizePrice(options.manualTestDeclarePriceCny || options.testDeclarePriceCny || ''),
    saveResult: clean(options.saveResult || status),
    validationBlockers,
    generatedAt: now,
    sourcePath: pack.sourcePath || '',
    productFolderPath: pack.productFolderPath || '',
    copyGuidePath: pack.copyGuidePath || '',
    uploadImageFolderPath: pack.uploadImageFolderPath || '',
    safety: {
      published: false,
      clickedPublish: false,
      allowedFinalAction: status === 'saved-draft' ? '保存' : 'none'
    }
  };
  const safeSku = safeSegment(receipt.masterSku || 'unknown-sku');
  const receiptDir = path.join(project, 'output', 'listing-upload-packs', workspaceId, 'receipts');
  await mkdir(receiptDir, { recursive: true });
  const receiptPath = path.join(receiptDir, `${safeSku}-dianxiaomi-receipt.json`);
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  return { ok: true, receiptPath, receipt };
}

function safeSegment(value = '') {
  return clean(value).replace(/[\\/:*?"<>|#%{}$!`'@+=\s]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || 'sku';
}

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizePrice(value = '') {
  const text = clean(value).replace(/usd$/i, '').trim();
  if (!text) return '';
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) return '';
  return number.toFixed(2);
}

function parseList(value = '') {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  const text = clean(value);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(clean).filter(Boolean);
  } catch {
    // Fall through to simple text splitting.
  }
  return text.split(/\s*(?:\|\||;|\n)\s*/).map(clean).filter(Boolean);
}

function parseBoolean(value = false) {
  if (typeof value === 'boolean') return value;
  const text = clean(value).toLowerCase();
  return ['1', 'true', 'yes', 'y', '是', '可见', 'visible'].includes(text);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--pretty') options.pretty = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
      options[key] = argv[index + 1];
      index += 1;
    }
  }
  return options;
}

async function main() {
  const options = parseArgs();
  const result = await writeDxmReceipt(options);
  console.log(JSON.stringify(result, null, options.pretty ? 2 : 0));
  if (!result.ok) process.exitCode = 1;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });
}

export { writeDxmReceipt };

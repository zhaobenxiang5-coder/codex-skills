#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveListingPack } from '../../temu-shangjia/scripts/resolve_listing_pack.mjs';

async function resolveDxmPack(options = {}) {
  const result = await resolveListingPack(options);
  if (!result.ok && result.reason === 'manifest-has-no-skus' && result.manifestPath) {
    const diagnosticResult = await resolveDiagnosticManifest(result.manifestPath, options);
    if (diagnosticResult.ok || diagnosticResult.reason !== 'manifest-has-no-diagnostics') return diagnosticResult;
  }
  if (!result.ok) return result;
  const pack = normalizeDxmPack(result.pack || {});
  return {
    ok: true,
    pack,
    dxm: {
      templateId: pack.dianxiaomiTemplate?.id || '',
      copyGuidePath: pack.copyGuidePath || '',
      uploadImageFolderPath: pack.uploadImageFolderPath || '',
      humanVisibleItems: ['01-上传图片', '02-店小秘补丁页.html']
    }
  };
}

async function resolveDiagnosticManifest(manifestPath = '', options = {}) {
  const manifest = await readJson(manifestPath).catch(() => null);
  const diagnostics = Array.isArray(manifest?.diagnostics) ? manifest.diagnostics : [];
  if (!diagnostics.length) return { ok: false, reason: 'manifest-has-no-diagnostics', manifestPath };
  const sku = clean(options.sku || options.masterSku || '');
  const candidates = sku ? diagnostics.filter((item) => matchesSku(item, sku)) : diagnostics;
  if (!candidates.length) {
    return {
      ok: false,
      reason: 'diagnostic-sku-not-found',
      sku,
      manifestPath,
      candidates: diagnostics.map(candidateSummary)
    };
  }
  if (candidates.length > 1 && !sku) {
    return {
      ok: false,
      reason: 'multiple-diagnostic-targets',
      manifestPath,
      candidates: candidates.map(candidateSummary)
    };
  }
  const pack = normalizeDxmPack({
    ...candidates[0],
    sourceType: 'listing-upload-pack-diagnostic-manifest',
    sourcePath: manifestPath,
    manifestPath,
    workspaceId: manifest.workspaceId || options.workspaceId || 'default-workspace'
  });
  return {
    ok: true,
    pack,
    dxm: {
      templateId: pack.dianxiaomiTemplate?.id || '',
      copyGuidePath: pack.copyGuidePath || '',
      uploadImageFolderPath: pack.uploadImageFolderPath || '',
      humanVisibleItems: ['01-上传图片', '02-店小秘补丁页.html']
    }
  };
}

function normalizeDxmPack(pack = {}) {
  const fields = { ...(pack.fields || {}) };
  if (!fields.sku && pack.masterSku) fields.sku = pack.masterSku;
  if (!fields.title && !fields.temuY2Title && pack.productName) fields.title = pack.productName;
  const copyGuidePath = String(pack.copyGuidePath || pack.dianxiaomiGuidePath || pack.zhitaiGuidePath || '');
  const productFolderPath = String(pack.productFolderPath || path.dirname(pack.dianxiaomiGuidePath || pack.operatorGuidePath || pack.manifestPath || '') || '');
  const uploadImageFolderPath = String(pack.uploadImageFolderPath || pack.imageFolderPath || (productFolderPath ? path.join(productFolderPath, 'images') : ''));
  return {
    ...pack,
    entityType: 'DianxiaomiShangjiaPackTarget',
    version: 'dianxiaomi-shangjia-pack-v1',
    fields,
    productFolderPath,
    uploadImageFolderPath,
    copyGuidePath: copyGuidePath.replace(/02-标题价格属性\.html$/, '02-店小秘补丁页.html'),
    dianxiaomiGuidePath: copyGuidePath.replace(/02-标题价格属性\.html$/, '02-店小秘补丁页.html')
  };
}

async function readJson(filePath = '') {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function matchesSku(item = {}, sku = '') {
  const needle = clean(sku);
  return [
    item.masterSku,
    item.safeSku,
    item.fields?.sku,
    item.productName,
    path.basename(item.productFolderPath || '')
  ].map(clean).some((value) => value === needle || value.includes(needle));
}

function candidateSummary(item = {}) {
  return {
    masterSku: item.masterSku || item.fields?.sku || '',
    status: item.status || '',
    imageCount: item.imageCount || item.images?.length || 0,
    pricingReady: item.pricingReady === true,
    productName: item.productName || ''
  };
}

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
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
  const result = await resolveDxmPack(options);
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

export { resolveDxmPack };

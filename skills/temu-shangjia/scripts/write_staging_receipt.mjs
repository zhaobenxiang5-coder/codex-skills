#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveListingPack } from './resolve_listing_pack.mjs';

const DEFAULT_ZHITAI_URL = 'https://www.data.izhitai.net/#/instrument/shelving/index';

async function resolvePackForReceipt(options = {}) {
  if (options.packJson) {
    const parsed = JSON.parse(await readFile(path.resolve(options.packJson), 'utf8'));
    return parsed.pack || parsed;
  }
  const result = await resolveListingPack(options);
  if (!result.ok) {
    const error = new Error(result.reason || 'pack-resolve-failed');
    error.result = result;
    throw error;
  }
  return result.pack;
}

function buildReceipt(pack = {}, options = {}) {
  const status = String(options.status || 'staged').trim() || 'staged';
  const now = options.now || new Date().toISOString();
  const clickedButton = String(options.clickedButton || (status === 'staged' ? '暂存' : '')).trim();
  return {
    entityType: 'ZhitaiStagingReceipt',
    version: 'temu-shangjia-v1',
    mode: 'staged-draft-only',
    status,
    savedAt: now,
    zhitaiUrl: options.zhitaiUrl || DEFAULT_ZHITAI_URL,
    draftId: String(options.draftId || '').trim(),
    note: String(options.note || '').trim(),
    source: {
      sourceType: pack.sourceType || '',
      sourcePath: pack.sourcePath || pack.manifestPath || '',
      workspaceId: pack.workspaceId || '',
      masterSku: pack.masterSku || '',
      productName: pack.productName || '',
      status: pack.status || '',
      statusLevel: pack.statusLevel || '',
      productFolderPath: pack.productFolderPath || '',
      uploadImageFolderPath: pack.uploadImageFolderPath || '',
      copyGuidePath: pack.copyGuidePath || pack.zhitaiGuidePath || ''
    },
    evidence: {
      imageCount: Number(pack.imageCount || pack.images?.length || 0),
      imageFileNames: (pack.images || []).map((image) => image.humanFileName || image.fileName).filter(Boolean),
      missingFields: pack.missingFields || [],
      blockers: pack.blockers || [],
      warnings: pack.warnings || []
    },
    safety: {
      clickedButton,
      forbiddenButtons: ['移入待发布', '发布至TEMU', '发布', '提交发布'],
      publishPackageUpdated: false,
      erpDraftUpdated: false,
      finalApprovalReceiptUpdated: false,
      platformSubmitAttempted: false,
      containsCredentials: false
    }
  };
}

async function writeReceipt(options = {}) {
  const pack = await resolvePackForReceipt(options);
  const defaultPath = path.join(pack.productFolderPath || path.dirname(pack.copyGuidePath || pack.sourcePath || process.cwd()), 'zhitai-staging-receipt.json');
  const outputPath = path.resolve(options.out || defaultPath);
  const receipt = buildReceipt(pack, options);
  if (options.dryRun) return { ok: true, dryRun: true, outputPath, receipt };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return { ok: true, outputPath, receipt };
}

export { buildReceipt, resolvePackForReceipt, writeReceipt };

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--pretty') options.pretty = true;
    else if (arg === '--dry-run') options.dryRun = true;
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
  const result = await writeReceipt(options);
  console.log(JSON.stringify(result, null, options.pretty ? 2 : 0));
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  main().catch((error) => {
    if (error?.result) console.error(JSON.stringify(error.result, null, 2));
    else console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });
}

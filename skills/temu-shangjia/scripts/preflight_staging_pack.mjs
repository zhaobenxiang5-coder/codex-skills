#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveListingPack } from './resolve_listing_pack.mjs';
import { writeReceipt } from './write_staging_receipt.mjs';

const EXPECTED_IMAGE_NAMES = [
  '01-素材图.jpg',
  '02-轮播图-1.jpg',
  '03-轮播图-2.jpg',
  '04-轮播图-3.jpg',
  '05-轮播图-4.jpg',
  '06-轮播图-5.jpg',
  '07-外包装图片.jpg',
  '08-详情图-1.jpg',
  '09-详情图-2.jpg'
];

const AUTHORIZED_DEFAULT_PROFILES = [
  {
    id: 'package02-i19y8c',
    aliases: ['包02', 'bao02', 'package02', '02', 'I19Y8C'],
    targetSku: 'I19Y8C',
    label: '包02 黄金首饰收纳册 I19Y8C',
    defaults: {
      产品分类: '服装、鞋靴和珠宝饰品 > 鞋靴、首饰、手表配件 > 饰品配件 > 饰品收纳 > 其他（饰品收纳）',
      店铺名称: 'P V G',
      外包装形状: '打开下拉后选择第一个可用普通选项，并在回执记录实际值',
      外包装类型: '打开下拉后选择第一个可用普通选项，并在回执记录实际值',
      经营站点: '美国',
      发货仓: '美国站点下可见的 3 个发货仓全部勾选',
      承诺发货时间: '9个工作日内发货',
      运费模板: '选择名称包含“够快”的模板；如不存在则阻断',
      material: '绒布；无 exact 选项则按 布/纺织品/其他 顺序选最接近项',
      color: '米色；无 exact 选项则按 米白色/白色/多色/其他 顺序选最接近项'
    },
    notes: [
      '站外产品链接继续留空。',
      '仅用于暂存诊断/草稿，不代表中台生产绿灯。'
    ]
  }
];

async function preflight(options = {}) {
  const resolved = await resolveListingPack(options);
  if (!resolved.ok) return { ok: false, reason: resolved.reason || 'pack-resolve-failed', resolved };

  const pack = resolved.pack;
  const authorizedProfile = resolveAuthorizedProfile(options.authorizedDefaults || options.defaultsProfile, pack);
  const images = Array.isArray(pack.images) ? pack.images : [];
  const actualNames = images.map((image) => image.humanFileName || image.fileName).filter(Boolean);
  const missingImages = EXPECTED_IMAGE_NAMES.filter((name) => !actualNames.includes(name));
  const extraImages = actualNames.filter((name) => !EXPECTED_IMAGE_NAMES.includes(name));
  const orderedNames = images
    .slice()
    .sort((a, b) => Number(a.slot || 999) - Number(b.slot || 999))
    .map((image) => image.humanFileName || image.fileName)
    .filter(Boolean);
  const imageOrderOk = EXPECTED_IMAGE_NAMES.every((name, index) => orderedNames[index] === name);
  const title = pack.fields?.temuY2Title || pack.fields?.title || pack.productName || '';
  const missingFieldsBeforeDefaults = pack.missingFields || [];
  const missingZhitaiRequiredBeforeDefaults = missingFieldsBeforeDefaults.filter((field) => field.startsWith('蜘泰必填:'));
  const coveredMissingFields = authorizedProfile?.applied
    ? missingFieldsBeforeDefaults.filter((field) => authorizedProfile.coversMissingField(field))
    : [];
  const missingFieldsAfterDefaults = missingFieldsBeforeDefaults.filter((field) => !coveredMissingFields.includes(field));
  const missingZhitaiRequired = missingFieldsAfterDefaults.filter((field) => field.startsWith('蜘泰必填:'));
  const blockers = [];

  if (!title) blockers.push('title:missing');
  if (missingImages.length) blockers.push(`images:missing:${missingImages.join(',')}`);
  if (!imageOrderOk) blockers.push('images:order-mismatch');

  const diagnosticOnly = missingZhitaiRequired.length > 0;
  const readyForStaging = blockers.length === 0 && images.length >= 9 && Boolean(title);
  const warnings = normalizeWarnings(pack.warnings || [], missingFieldsAfterDefaults, authorizedProfile);
  const result = {
    ok: true,
    mode: diagnosticOnly ? 'diagnostic-staging-attempt' : authorizedProfile?.applied ? 'authorized-default-staging-attempt' : 'staging-attempt',
    sourcePath: pack.sourcePath,
    masterSku: pack.masterSku,
    title,
    imageCount: images.length,
    expectedImageNames: EXPECTED_IMAGE_NAMES,
    actualImageNames: actualNames,
    imageOrderOk,
    missingImages,
    extraImages,
    missingZhitaiRequiredBeforeDefaults,
    missingZhitaiRequired,
    missingFieldsBeforeDefaults,
    missingFieldsAfterAuthorizedDefaults: missingFieldsAfterDefaults,
    authorizedDefaults: authorizedProfile
      ? {
          requested: authorizedProfile.requested,
          applied: authorizedProfile.applied,
          profileId: authorizedProfile.id,
          label: authorizedProfile.label,
          mismatch: authorizedProfile.mismatch || null,
          coveredMissingFields,
          defaults: authorizedProfile.defaults || {},
          notes: authorizedProfile.notes || []
        }
      : null,
    skippedByRule: [
      {
        field: '站外产品链接',
        reason: '产品外部链接默认不填；供应商链接只作为内部证据保留。'
      }
    ],
    readyForStaging,
    diagnosticOnly,
    blockers,
    warnings,
    fastBrowserRules: {
      platformType: 'TEMU/direct-ship tasks use 半托管 only; otherwise stop and ask.',
      uploadRetryLimit: 1,
      externalProductLink: 'skip',
      finalButton: 'click exact 暂存 only'
    },
    nextAction: blockers.length
      ? 'do-not-open-zhitai-unless-user-asks-dry-run'
      : diagnosticOnly
        ? 'open-zhitai-for-diagnostic-暂存-validation'
        : 'open-zhitai-and-save-暂存'
  };

  if (options.writeBlockedReceipt && blockers.length) {
    const note = options.note || `Preflight blocked: ${blockers.join('; ')}`;
    result.receipt = await writeReceipt({ ...options, status: 'blocked', note });
  }

  return result;
}

function resolveAuthorizedProfile(requestedValue = '', pack = {}) {
  const requested = clean(requestedValue);
  if (!requested) return null;
  const profile = AUTHORIZED_DEFAULT_PROFILES.find((item) => {
    const keys = [item.id, item.targetSku, ...(item.aliases || [])].map(clean);
    return keys.includes(requested);
  });
  if (!profile) {
    return {
      requested,
      applied: false,
      id: 'unknown',
      label: 'Unknown authorized defaults profile',
      defaults: {},
      notes: [`Unknown authorized defaults profile: ${requested}`],
      coversMissingField: () => false
    };
  }
  const targetSku = clean(profile.targetSku);
  const packSku = clean(pack.masterSku || pack.fields?.sku || '');
  const mismatch = targetSku && packSku && targetSku !== packSku ? `profile target ${targetSku} does not match pack SKU ${packSku}` : '';
  const coveredLabels = new Set(Object.keys(profile.defaults || {}));
  return {
    ...profile,
    requested,
    applied: !mismatch,
    mismatch,
    coversMissingField(field = '') {
      const normalized = clean(field);
      if (coveredLabels.has(normalized)) return true;
      if (normalized.startsWith('蜘泰必填:')) {
        return coveredLabels.has(normalized.replace(/^蜘泰必填:/, ''));
      }
      return false;
    }
  };
}

function normalizeWarnings(warnings = [], missingFieldsAfterDefaults = [], authorizedProfile = null) {
  const normalized = [];
  for (const warning of warnings || []) {
    if (/missing fields remain/i.test(warning)) continue;
    normalized.push(warning);
  }
  if (missingFieldsAfterDefaults.length) normalized.push(`${missingFieldsAfterDefaults.length} missing fields remain after authorized defaults.`);
  if (authorizedProfile && !authorizedProfile.applied) normalized.push(`Authorized defaults not applied: ${authorizedProfile.mismatch || authorizedProfile.notes?.[0] || authorizedProfile.requested}`);
  return Array.from(new Set(normalized.filter(Boolean)));
}

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--pretty') options.pretty = true;
    else if (arg === '--write-blocked-receipt') options.writeBlockedReceipt = true;
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
  const result = await preflight(options);
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

export { preflight };

#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_PROJECT = '~/Documents/Playground/flow-task-center-pro';
const DEFAULT_WORKSPACE = 'default-workspace';
const DEFAULT_HUMAN_ROOT = path.join(os.homedir(), 'Documents', 'AI商品上架包');
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

export async function resolveListingPack(options = {}) {
  const project = path.resolve(options.project || DEFAULT_PROJECT);
  const workspaceId = options.workspaceId || DEFAULT_WORKSPACE;
  const manifestPath = path.resolve(options.manifest || path.join(project, 'output', 'listing-upload-packs', workspaceId, 'latest', 'manifest.json'));
  const folder = options.folder ? path.resolve(options.folder) : '';
  const sku = clean(options.sku || options.masterSku || '');
  if (folder) return resolveFolder(folder, { project, workspaceId, sku });
  if (!existsSync(manifestPath)) {
    return {
      ok: false,
      reason: 'manifest-not-found',
      manifestPath,
      fallbackHint: `Pass --folder "${DEFAULT_HUMAN_ROOT}/<product-folder>" for a human-pack folder.`
    };
  }
  return resolveManifest(manifestPath, { project, workspaceId, sku });
}

async function resolveManifest(manifestPath, context = {}) {
  const manifest = await readJson(manifestPath);
  const skus = Array.isArray(manifest.skus) ? manifest.skus : [];
  if (!skus.length) {
    return { ok: false, reason: 'manifest-has-no-skus', manifestPath, workspaceId: manifest.workspaceId || context.workspaceId };
  }
  let candidates = skus;
  if (context.sku) {
    candidates = skus.filter((item) => matchesSku(item, context.sku));
  }
  if (!candidates.length) {
    return {
      ok: false,
      reason: 'sku-not-found',
      sku: context.sku,
      manifestPath,
      candidates: skus.map(candidateSummary)
    };
  }
  if (candidates.length > 1 && !context.sku) {
    return {
      ok: false,
      reason: 'multiple-targets',
      manifestPath,
      candidates: candidates.map(candidateSummary)
    };
  }
  const item = candidates[0];
  const normalized = normalizeManifestItem(item, {
    manifest,
    manifestPath,
    project: context.project,
    workspaceId: manifest.workspaceId || context.workspaceId || DEFAULT_WORKSPACE
  });
  return { ok: true, pack: normalized };
}

async function resolveFolder(folder, context = {}) {
  const info = await stat(folder).catch(() => null);
  if (!info?.isDirectory()) return { ok: false, reason: 'folder-not-found', folder };
  const imageDir = path.join(folder, '01-上传图片');
  const dxmGuidePath = path.join(folder, '02-店小秘补丁页.html');
  const legacyGuidePath = path.join(folder, '02-标题价格属性.html');
  const copyGuidePath = existsSync(dxmGuidePath) ? dxmGuidePath : legacyGuidePath;
  const guide = existsSync(copyGuidePath) ? await readFile(copyGuidePath, 'utf8') : '';
  const imageEntries = existsSync(imageDir) ? await readdir(imageDir, { withFileTypes: true }) : [];
  const images = imageEntries
    .filter((entry) => entry.isFile() && IMAGE_RE.test(entry.name))
    .map((entry) => {
      const slot = numericPrefix(entry.name);
      const localPath = path.join(imageDir, entry.name);
      return {
        slot,
        fileName: entry.name,
        humanFileName: entry.name,
        humanLocalPath: localPath,
        localPath,
        exists: true,
        uploadPurpose: slotUploadPurpose(slot)
      };
    })
    .sort((a, b) => Number(a.slot || 999) - Number(b.slot || 999) || a.fileName.localeCompare(b.fileName, 'zh-Hans-CN'));
  const copyFields = sanitizeCopyFields(parseSimpleCopyGuide(guide));
  const fields = fieldsFromCopyFields(copyFields);
  const folderName = path.basename(folder);
  const masterSku = fields.sku || inferSku(folderName);
  if (!fields.sku && masterSku) fields.sku = masterSku;
  const zhitaiForm = buildFallbackZhitaiForm(fields, images);
  const missingFields = collectMissingFields(zhitaiForm, fields);
  const normalized = {
    entityType: 'ZhitaiStagingPackTarget',
    version: 'temu-shangjia-pack-v1',
    sourceType: 'human-folder',
    sourcePath: folder,
    project: context.project || DEFAULT_PROJECT,
    workspaceId: context.workspaceId || DEFAULT_WORKSPACE,
    masterSku,
    safeSku: safeSegment(masterSku || folderName),
    productName: fields.productName || parseHtmlTitle(guide) || folderName,
    displayTitle: fields.productName || parseHtmlTitle(guide) || folderName,
    status: folderName.includes('缺') ? '诊断包' : '待暂存',
    statusLevel: folderName.includes('缺') ? 'warn' : 'good',
    statusDetail: '从 AI商品上架包 人用目录解析；没有项目 manifest 时使用。',
    generatedAt: '',
    productFolderPath: folder,
    uploadImageFolderPath: imageDir,
    copyGuidePath,
    zhitaiGuidePath: copyGuidePath,
    imageCount: images.length,
    images,
    fields,
    copyFields,
    zhitaiForm,
    missingFields,
    blockers: images.length ? [] : ['slotImage:missing:all'],
    warnings: warningList({ imageCount: images.length, missingFields, blockers: images.length ? [] : ['slotImage:missing:all'], fields, sourceType: 'human-folder' }),
    readyForStaging: images.length > 0 && hasValue(fields.title || fields.temuY2Title || fields.productName)
  };
  return { ok: true, pack: normalized };
}

function normalizeManifestItem(item = {}, context = {}) {
  const fields = item.fields || {};
  const images = (item.images || []).map((image) => ({
    slot: numberOrNull(image.slot),
    fileName: image.fileName || path.basename(image.relativePath || image.humanLocalPath || ''),
    humanFileName: image.humanFileName || image.fileName || path.basename(image.humanLocalPath || ''),
    uploadPurpose: image.uploadPurpose || slotUploadPurpose(image.slot),
    humanUploadPurpose: image.humanUploadPurpose || slotUploadPurpose(image.slot),
    status: clean(image.status || ''),
    assetId: clean(image.assetId || ''),
    relativePath: clean(image.relativePath || ''),
    localPath: clean(image.localPath || ''),
    humanLocalPath: clean(image.humanLocalPath || ''),
    exists: Boolean((image.humanLocalPath && existsSync(image.humanLocalPath)) || (image.localPath && existsSync(image.localPath)))
  })).sort((a, b) => Number(a.slot || 999) - Number(b.slot || 999));
  const copyFields = sanitizeCopyFields(item.copyFields || []);
  const zhitaiForm = sanitizeZhitaiForm(item.zhitaiForm || []);
  const missingFields = unique([...(item.missingFields || []), ...collectMissingFields(zhitaiForm, fields)]);
  const blockers = unique(item.blockers || []);
  return {
    entityType: 'ZhitaiStagingPackTarget',
    version: 'temu-shangjia-pack-v1',
    sourceType: 'listing-upload-pack-manifest',
    sourcePath: context.manifestPath,
    manifestPath: context.manifestPath,
    project: context.project || DEFAULT_PROJECT,
    workspaceId: context.workspaceId || DEFAULT_WORKSPACE,
    latestUrl: context.manifest?.latestUrl || '',
    sourceGeneratedAt: context.manifest?.generatedAt || '',
    sourceMaterialBatchId: context.manifest?.sourceMaterialBatchId || '',
    masterSku: clean(item.masterSku || fields.sku || ''),
    safeSku: clean(item.safeSku || safeSegment(item.masterSku || fields.sku || '')),
    productName: clean(item.productName || fields.productName || fields.title || fields.temuY2Title || ''),
    displayTitle: clean(item.displayTitle || item.productName || fields.productName || ''),
    status: clean(item.status || ''),
    statusLevel: clean(item.statusLevel || ''),
    statusDetail: clean(item.statusDetail || ''),
    generatedAt: clean(item.generatedAt || context.manifest?.generatedAt || ''),
    productFolderPath: clean(item.productFolderPath || ''),
    uploadImageFolderPath: clean(item.uploadImageFolderPath || ''),
    copyGuidePath: clean(item.copyGuidePath || item.zhitaiGuidePath || ''),
    zhitaiGuidePath: clean(item.zhitaiGuidePath || item.copyGuidePath || ''),
    operatorGuideUrl: clean(item.operatorGuideUrl || ''),
    imageFolderUrl: clean(item.imageFolderUrl || ''),
    manifestUrl: clean(item.manifestUrl || ''),
    imageCount: Number(item.imageCount || images.length || 0),
    images,
    fields,
    copyFields,
    zhitaiForm,
    missingFields,
    blockers,
    warnings: warningList({ imageCount: Number(item.imageCount || images.length || 0), missingFields, blockers, fields, status: item.status, statusLevel: item.statusLevel, sourceType: 'listing-upload-pack-manifest' }),
    readyForStaging: Number(item.imageCount || images.length || 0) > 0 && hasValue(fields.temuY2Title || fields.title || fields.productName)
  };
}

function warningList(context = {}) {
  const warnings = [];
  if (!context.imageCount) warnings.push('No uploadable images found; live Zhitai save will likely be blocked.');
  if (context.imageCount > 0 && context.imageCount < 9) warnings.push(`Only ${context.imageCount}/9 images found; use as diagnostic draft only.`);
  if (!hasValue(context.fields?.temuY2Title || context.fields?.title || context.fields?.productName)) warnings.push('Product title is missing.');
  if (String(context.statusLevel || '').toLowerCase() === 'danger') warnings.push(`Pack status is danger: ${context.status || 'unknown'}.`);
  if ((context.missingFields || []).length) warnings.push(`${context.missingFields.length} missing fields remain.`);
  if ((context.blockers || []).length) warnings.push(`${context.blockers.length} blockers remain.`);
  if (context.sourceType === 'human-folder') warnings.push('Parsed from human folder fallback; manifest-only fields may be unavailable.');
  return unique(warnings);
}

function parseSimpleCopyGuide(html = '') {
  const fields = [];
  const addFieldFromBlock = (block = '') => {
    const label = stripTags(firstMatch(block, /<b\b[^>]*>([\s\S]*?)<\/b>/i));
    const value = stripTags(firstMatch(block, /<span\b[^>]*>([\s\S]*?)<\/span>/i));
    if (label) fields.push({ label: decodeHtml(label), value: decodeHtml(value || '待补'), copyable: value && value !== '待补' });
  };
  for (const match of html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)) {
    addFieldFromBlock(match[1]);
  }
  for (const match of html.matchAll(/<div\b[^>]*class="[^"]*\bfield\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)) {
    addFieldFromBlock(match[1]);
  }
  return fields;
}

function fieldsFromCopyFields(copyFields = []) {
  const byLabel = new Map(copyFields.map((item) => [clean(item.label), clean(item.value)]));
  const field = (...labels) => labels.map((label) => byLabel.get(label)).find(hasValue) || '';
  return {
    sku: field('产品货号', 'SKU'),
    productName: field('标题', '产品标题'),
    title: field('标题', '产品标题'),
    temuY2Title: field('标题', '产品标题'),
    englishTitle: field('英文标题'),
    productSizeCm: field('产品尺寸', '产品尺寸(cm)'),
    packageSizeCm: field('包装尺寸', '包装尺寸(cm)'),
    packageWeightKg: field('重量', '重量(kg)'),
    material: field('材质'),
    color: field('颜色'),
    supplierUrl: field('供应商/站外链接', '供应商链接', '站外产品链接'),
    externalProductUrl: field('供应商/站外链接', '供应商链接', '站外产品链接'),
    listingPriceUsd: field('价格', '上架价格(USD)'),
    temuY2Price: field('价格', '上架价格(USD)'),
    originPlace: field('产地') || '中国',
    sensitiveAttribute: field('敏感属性') || '否',
    isCustomProduct: field('是否定制品') || '否'
  };
}

function buildFallbackZhitaiForm(fields = {}, images = []) {
  return [
    {
      title: '基本信息',
      fields: [
        formField('产品标题', fields.temuY2Title || fields.title || fields.productName, true),
        formField('素材图', slotImageText(images, 1), true, 'image'),
        formField('产品分类', fields.temuY2Category || fields.category, true),
        formField('店铺名称', fields.storeName, true),
        formField('英文标题', fields.englishTitle),
        formField('产地', fields.originPlace, true),
        formField('轮播图', slotImageRangeText(images, 2, 6), true, 'image'),
        formField('外包装图片', slotImageText(images, 7), true, 'image'),
        formField('外包装形状', fields.outerPackageShape, true),
        formField('外包装类型', fields.outerPackageType, true),
        formField('产品详情', fields.productDescription || fields.description || fields.bulletPoints)
      ]
    },
    {
      title: '产品信息',
      fields: [
        formField('产品货号', fields.sku, true),
        formField('敏感属性', fields.sensitiveAttribute || '否', true),
        formField('站外产品链接', ''),
        formField('经营站点', fields.operationSite, true),
        formField('发货仓', fields.shippingWarehouse, true),
        formField('是否定制品', fields.isCustomProduct || '否'),
        formField('承诺发货时间', fields.promisedShipTime || fields.leadTimeHours, true),
        formField('运费模板', fields.freightTemplate, true)
      ]
    },
    {
      title: '变体信息',
      fields: [
        formField('变体模板', fields.variantTemplate),
        formField('材质', fields.material),
        formField('颜色', fields.color),
        formField('产品尺寸(cm)', fields.productSizeCm),
        formField('包装尺寸(cm)', fields.packageSizeCm),
        formField('重量(kg)', fields.packageWeightKg),
        formField('上架价格(USD)', fields.listingPriceUsd || fields.temuY2Price)
      ]
    }
  ];
}

function formField(label, value = '', required = false, type = 'text') {
  const display = hasValue(value) ? clean(value) : '待补';
  return { label, value: display, required, type, copyable: display !== '待补' && type !== 'image', missing: required && display === '待补' };
}

function sanitizeCopyFields(copyFields = []) {
  return (copyFields || []).map((field) => {
    if (!isExternalProductLinkLabel(field.label)) return field;
    return { ...field, copyable: false, skipForZhitai: true };
  });
}

function sanitizeZhitaiForm(sections = []) {
  return (sections || []).map((section) => ({
    ...section,
    fields: (section.fields || []).map((field) => {
      if (!isExternalProductLinkLabel(field.label)) return field;
      return {
        ...field,
        value: '待补',
        copyable: false,
        missing: false,
        skipForZhitai: true,
        skipReason: '产品外部链接默认不填；供应商链接只作为内部证据保留。'
      };
    })
  }));
}

function isExternalProductLinkLabel(label = '') {
  return /(站外产品链接|产品外部链接|外部链接|供应商\/站外链接|供应商链接)/.test(clean(label));
}

function collectMissingFields(sections = [], fields = {}) {
  const missing = [];
  for (const section of sections || []) {
    for (const field of section.fields || []) {
      if (field.required && (field.missing || !hasValue(field.value))) missing.push(`蜘泰必填:${field.label}`);
    }
  }
  if (!hasValue(fields.material)) missing.push('material');
  if (!hasValue(fields.color)) missing.push('color');
  return unique(missing);
}

function slotImageText(images = [], slot = 0) {
  const image = images.find((item) => Number(item.slot) === Number(slot));
  return image?.humanFileName || image?.fileName || '';
}

function slotImageRangeText(images = [], start = 0, end = 0) {
  const names = [];
  for (let slot = start; slot <= end; slot += 1) names.push(slotImageText(images, slot));
  return names.filter(Boolean).join(' / ');
}

function candidateSummary(item = {}) {
  return {
    masterSku: item.masterSku || item.fields?.sku || '',
    status: item.status || '',
    imageCount: item.imageCount || item.images?.length || 0,
    productFolderPath: item.productFolderPath || '',
    copyGuidePath: item.copyGuidePath || item.zhitaiGuidePath || ''
  };
}

function matchesSku(item = {}, sku = '') {
  const haystack = [
    item.masterSku,
    item.safeSku,
    item.fields?.sku,
    item.productName,
    path.basename(item.productFolderPath || '')
  ].map(clean);
  return haystack.some((value) => value === sku || value.includes(sku));
}

function slotUploadPurpose(slot = 0) {
  const n = Number(slot);
  if (n === 1) return '素材图/主图';
  if (n >= 2 && n <= 6) return `轮播图${n - 1}`;
  if (n === 7) return '外包装图片';
  if (n === 8) return '详情/卖点图';
  if (n === 9) return '备用/详情图';
  return '图片';
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function parseHtmlTitle(html = '') {
  return decodeHtml(stripTags(firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i))).replace(/\s*(标题价格属性|店小秘补丁页)\s*$/, '');
}

function firstMatch(value = '', re) {
  const match = re.exec(value);
  return match ? match[1] || '' : '';
}

function stripTags(value = '') {
  return clean(String(value).replace(/<[^>]+>/g, ' '));
}

function decodeHtml(value = '') {
  const text = String(value || '');
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .trim();
}

function inferSku(folderName = '') {
  const parts = clean(folderName).split('-').filter(Boolean);
  return parts.at(-1) || safeSegment(folderName);
}

function numericPrefix(fileName = '') {
  const match = /^(\d{1,2})/.exec(path.basename(fileName));
  return match ? Number(match[1]) : null;
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function safeSegment(value = '') {
  return clean(value).replace(/[\\/:*?"<>|#%{}$!`'@+=\s]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || 'sku';
}

function hasValue(value) {
  const text = clean(value);
  return Boolean(text && !/^(0|0\.0+|待补|待确认|未确认|缺|--|-|none|null|undefined)$/i.test(text));
}

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function unique(values = []) {
  return Array.from(new Set((values || []).map(clean).filter(Boolean)));
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--pretty') options.pretty = true;
    else if (arg === '--list') options.list = true;
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
  const result = await resolveListingPack(options);
  if (options.list && result.ok && result.pack) {
    const output = { ok: true, candidates: [candidateSummary(result.pack)] };
    console.log(JSON.stringify(output, null, options.pretty ? 2 : 0));
    return;
  }
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

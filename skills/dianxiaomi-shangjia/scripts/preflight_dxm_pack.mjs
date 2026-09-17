#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveDxmPack } from './resolve_dxm_pack.mjs';

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

async function preflightDxmPack(options = {}) {
  const resolved = await resolveDxmPack(options);
  if (!resolved.ok) return { ok: false, reason: resolved.reason || 'pack-resolve-failed', resolved };

  const mode = normalizeMode(options.mode || 'dry-run');
  const manualTestPriceUsd = normalizePrice(options.testPriceUsd || options.manualTestPriceUsd || '');
  const manualTestDeclarePriceCny = normalizePrice(options.testDeclarePriceCny || options.manualTestDeclarePriceCny || '');
  const draftSaveTest = mode === 'draft-save-test';
  const pack = resolved.pack || {};
  const fields = pack.fields || {};
  const images = Array.isArray(pack.images) ? pack.images : [];
  const template = mergeTemplate(selectTemplate(fields, pack), pack.dianxiaomiTemplate || {});
  const orderedNames = images
    .slice()
    .sort((left, right) => Number(left.slot || 999) - Number(right.slot || 999))
    .map((image) => image.humanFileName || image.fileName)
    .filter(Boolean);
  const missingImages = EXPECTED_IMAGE_NAMES.filter((name) => !orderedNames.includes(name));
  const imageOrderOk = EXPECTED_IMAGE_NAMES.every((name, index) => orderedNames[index] === name);
  const dynamicFields = dynamicFieldChecks(fields, pack, { draftSaveTest, manualTestPriceUsd, manualTestDeclarePriceCny });
  const productionDynamicFields = dynamicFieldChecks(fields, pack, { draftSaveTest: false, manualTestPriceUsd: '' });
  const missingDynamicFields = dynamicFields.filter((item) => !item.ok).map((item) => item.field);
  const missingProductionDynamicFields = productionDynamicFields.filter((item) => !item.ok).map((item) => item.field);
  const templateWarnings = templateFieldWarnings(fields, template);
  const baseBlockers = [
    !hasValue(fields.temuY2Title || fields.title || pack.productName) ? 'title:missing' : '',
    missingImages.length ? `images:missing:${missingImages.join(',')}` : '',
    !imageOrderOk ? 'images:order-mismatch' : ''
  ].filter(Boolean);
  const productionBlockers = [
    ...baseBlockers,
    pack.pricingReady === false ? 'pricing:not-ready' : '',
    ...missingProductionDynamicFields.map((field) => `dynamic:${field}:missing`)
  ].filter(Boolean);
  const draftSaveBlockers = [
    ...baseBlockers,
    ...dynamicFields
      .filter((item) => !item.ok && !(item.field === '最终上架价USD' && draftSaveTest && manualTestPriceUsd))
      .map((item) => `dynamic:${item.field}:missing`)
  ].filter(Boolean);
  const readyForDryRun = !missingImages.length && imageOrderOk && hasValue(fields.temuY2Title || fields.title || pack.productName);
  const readyForSave = readyForDryRun && productionBlockers.length === 0;
  const readyForDraftSaveTest = draftSaveTest && readyForDryRun && draftSaveBlockers.length === 0;
  const readyForProduction = readyForSave;

  return {
    ok: true,
    entityType: 'DianxiaomiShangjiaPreflight',
    mode,
    testMode: draftSaveTest ? 'draft-save-test' : '',
    manualTestPriceUsd,
    manualTestDeclarePriceCny,
    officialPricingReady: pack.pricingReady !== false && hasValue(fields.listingPriceUsd || fields.temuY2Price),
    masterSku: pack.masterSku || fields.sku || '',
    productName: pack.productName || fields.title || '',
    sourcePath: pack.sourcePath || pack.manifestPath || '',
    productFolderPath: pack.productFolderPath || '',
    uploadImageFolderPath: pack.uploadImageFolderPath || '',
    copyGuidePath: pack.copyGuidePath || '',
    template: {
      id: template.id,
      label: template.label,
      appliedDefaults: template.appliedDefaults,
      storeName: template.storeName || '',
      storeSource: template.storeSource || '',
      categoryPath: template.categoryPath || '',
      categoryKeywords: template.categoryKeywords || []
    },
    imageCheck: {
      expectedImageNames: EXPECTED_IMAGE_NAMES,
      actualImageNames: orderedNames,
      imageCount: images.length,
      imageOrderOk,
      missingImages
    },
    dynamicFields,
    productionDynamicFields,
    missingDynamicFields,
    missingProductionDynamicFields,
    templateWarnings,
    manualSequentialFill: {
      status: 'manualSequentialFill:ready',
      useVariantTemplate: false,
      variantAxes: [
        {
          label: '颜色',
          value: clean(fields.color || '黄色')
        },
        {
          label: '尺码/尺寸；页面为风格/款式时改填风格',
          value: clean(fields.sizeName || fields.variantSize || '均码'),
          alternateValue: clean(fields.styleName || fields.variantStyle || '通勤')
        }
      ],
      variantInfoTable: {
        sku: clean(fields.sku || pack.masterSku || ''),
        ean: '',
        declarePriceCny: clean(fields.declarePriceCny || fields.declarationPriceCny || fields.purchaseCostRmb || fields.rawPrice || manualTestDeclarePriceCny || ''),
        dimensionsCm: clean(fields.productSizeCm || fields.packageSizeCm || ''),
        weightG: clean(fields.packageWeightG || fields.weightG || fields.packageWeightKg || ''),
        suggestedPriceUsd: clean(fields.listingPriceUsd || fields.temuY2Price || manualTestPriceUsd || ''),
        warehouseStock: '10',
        skuCategory: '实际商品 / 单品 / 1件',
        packagingList: ''
      }
    },
    skippedByRule: [
      {
        field: 'EAN',
        reason: '按当前直填规则不写。'
      },
      {
        field: '包装清单',
        reason: '按当前直填规则不写。'
      },
      {
        field: '站外产品链接',
        reason: '默认不填；供应商/1688 链接只写店小秘 来源URL。'
      },
      {
        field: '发布',
        reason: '技能禁止点击发布，只允许 dry-run 或用户明确授权后的保存。'
      }
    ],
    blockers: productionBlockers,
    productionBlockers,
    draftSaveBlockers,
    readyForDryRun,
    readyForSave,
    readyForDraftSaveTest,
    readyForProduction,
    nextAction: draftSaveTest && readyForDraftSaveTest
      ? 'open-dianxiaomi-and-save-draft-test-only'
      : productionBlockers.length
      ? 'fix-pack-before-dianxiaomi-save'
      : 'open-dianxiaomi-dry-run-or-save-when-user-authorizes'
  };
}

function selectTemplate(fields = {}, pack = {}) {
  const haystack = [
    fields.productName,
    fields.temuY2Title,
    fields.title,
    fields.englishTitle,
    fields.category,
    fields.temuY2Category,
    pack.productName
  ].join(' ');
  const jewelry = /首饰|珠宝|饰品|jewelry|bracelet|necklace|ring|earring/i.test(haystack);
  const id = jewelry ? 'TEMU-US-半托管-珠宝首饰收纳' : 'TEMU-US-半托管-通用';
  const template = {
    id,
    label: id,
    storeName: clean(fields.storeName || 'P V G'),
    storeSource: fields.storeName ? 'pack' : 'user-authorized-default',
    appliedDefaults: {
      platformType: 'TEMU 半托管',
      operationSite: '美国站',
      originCountry: '中国大陆',
      sensitiveAttribute: '否',
      isCustomProduct: '否',
      promisedShipTime: '9个工作日内发货',
      freightTemplateHint: '优先选择名称包含“够快”的运费模板',
      warehouseSelection: '全选',
      warehouseSelectionMode: 'select-all',
      imagePolicy: '不用采集图，上传中台生成的 9 图',
      pricingPolicy: '中台核价为准，店小秘定价模板只做兜底参考'
    }
  };
  if (jewelry) {
    template.categoryPath = '家居、厨房用品 > 收纳用品 > 珠宝首饰盒和收纳';
    template.categoryKeywords = ['珠宝首饰盒和收纳', '饰品收纳', '首饰收纳', 'jewelry organizer'];
    template.categorySelectionRule = '选择最深且仍与首饰/饰品收纳相关的可见类目；无相关匹配时停止。';
  } else {
    template.categoryPath = '';
    template.categoryKeywords = [];
    template.categorySelectionRule = '通用模板不自动选类目。';
  }
  return template;
}

function mergeTemplate(base = {}, override = {}) {
  if (!override || !Object.keys(override).length) return base;
  return {
    ...base,
    ...override,
    id: override.id || base.id,
    label: override.label || override.id || base.label,
    storeName: override.storeName || base.storeName,
    storeSource: override.storeSource || base.storeSource,
    categoryPath: override.categoryPath || base.categoryPath,
    categoryKeywords: Array.isArray(override.categoryKeywords) && override.categoryKeywords.length
      ? override.categoryKeywords
      : base.categoryKeywords,
    categorySelectionRule: override.categorySelectionRule || base.categorySelectionRule,
    appliedDefaults: {
      ...(base.appliedDefaults || {}),
      ...(override.appliedDefaults || {})
    }
  };
}

function dynamicFieldChecks(fields = {}, pack = {}, options = {}) {
  const officialPrice = fields.listingPriceUsd || fields.temuY2Price;
  const manualTestPrice = normalizePrice(options.manualTestPriceUsd || '');
  const effectivePrice = hasValue(officialPrice) ? officialPrice : (options.draftSaveTest && manualTestPrice ? manualTestPrice : '');
  const priceSource = hasValue(officialPrice) ? 'middle-platform' : (options.draftSaveTest && manualTestPrice ? 'manual-test-price' : '');
  const officialDeclarePrice = fields.declarePriceCny || fields.declarationPriceCny || fields.purchaseCostRmb || fields.rawPrice;
  const manualDeclarePrice = normalizePrice(options.manualTestDeclarePriceCny || '');
  const effectiveDeclarePrice = hasValue(officialDeclarePrice) ? officialDeclarePrice : (options.draftSaveTest && manualDeclarePrice ? manualDeclarePrice : '');
  const declarePriceSource = hasValue(officialDeclarePrice) ? 'supplier-cost-evidence' : (options.draftSaveTest && manualDeclarePrice ? 'manual-test-declare-price' : '');
  return [
    ['产品标题', fields.temuY2Title || fields.title || pack.productName, 'pack'],
    ['英文标题', fields.englishTitle, 'pack'],
    ['产品货号', fields.sku || pack.masterSku, 'pack'],
    ['最终上架价USD', effectivePrice, priceSource],
    ['申报价格(CNY)', effectiveDeclarePrice, declarePriceSource],
    ['尺寸(cm)', fields.productSizeCm || fields.packageSizeCm, 'ProductTruth/package'],
    ['重量(g)', fields.packageWeightG || fields.weightG || fields.packageWeightKg, 'ProductTruth/package'],
    ['材质', fields.material, 'ProductTruth'],
    ['颜色', fields.color, 'ProductTruth'],
    ['供应商/1688链接', fields.supplierUrl, 'supplier-evidence']
  ].map(([field, value, source]) => ({ field, value: clean(value), source: source || '', ok: hasValue(value) }));
}

function templateFieldWarnings(fields = {}, template = {}) {
  const warnings = [];
  if (!hasValue(fields.storeName) && !hasValue(template.storeName)) warnings.push('店铺账号没有在包里固定；需要从店小秘可见店铺中人工选择或配置。');
  if (!hasValue(fields.shippingWarehouse)) warnings.push('仓库没有证据；只能按店铺+站点配置模板选择，不能猜。');
  if (!hasValue(fields.freightTemplate)) warnings.push(template.appliedDefaults?.freightTemplateHint || '运费模板未固定。');
  if (!hasValue(fields.temuY2Category || fields.category) && template.id === 'TEMU-US-半托管-通用') warnings.push('通用模板没有类目，店小秘产品分类需要人工补。');
  return warnings;
}

function hasValue(value) {
  const text = clean(value);
  return Boolean(text && !/^(0|0\.0+|待补|待确认|未确认|缺|--|-|none|null|undefined)$/i.test(text));
}

function normalizeMode(value = '') {
  const mode = clean(value || 'dry-run').toLowerCase();
  return ['dry-run', 'draft-save-test', 'production-ready'].includes(mode) ? mode : 'dry-run';
}

function normalizePrice(value = '') {
  const text = clean(value).replace(/usd$/i, '').trim();
  if (!text) return '';
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) return '';
  return number.toFixed(2);
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
  const result = await preflightDxmPack(options);
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

export { preflightDxmPack };

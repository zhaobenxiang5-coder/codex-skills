# Product Demand Insight 输出契约

## 目录

1. 顶层结构
2. 证据和用户群
3. 情绪洞察
4. 产品机会
5. 实体商品可行性
6. 决策状态
7. 最小示例

## 1. 顶层结构

输出 JSON 使用 `product-demand-insight-v1`：

```json
{
  "schemaVersion": "product-demand-insight-v1",
  "analysisId": "stable-analysis-id",
  "mode": "evidence-backed",
  "scope": {},
  "evidenceSummary": {},
  "targetSegments": [],
  "emotionalInsights": {},
  "opportunities": [],
  "feasibility": {},
  "missingEvidenceTasks": [],
  "decision": {}
}
```

`mode` 只能是：

- `evidence-backed`
- `hypothesis-only`

## 2. 证据和用户群

```json
{
  "scope": {
    "productCategoryZh": "Y型宠物胸背带",
    "targetMarkets": ["US"],
    "targetPlatforms": ["temu-us"],
    "developmentStage": "demand-validation",
    "analysisGoal": "development-brief"
  },
  "evidenceSummary": {
    "evidenceIds": ["ev_review_001", "ev_trend_001"],
    "sourceCount": 2,
    "freshnessStatus": "current",
    "gaps": []
  },
  "targetSegments": [
    {
      "id": "segment_01",
      "nameZh": "夜间通勤遛狗用户",
      "behaviorSceneZh": "下班后单手牵引并频繁调节胸背带",
      "jobToBeDoneZh": "快速穿脱且避免勒颈和松脱",
      "claimType": "inference",
      "evidenceRefs": ["ev_review_001"],
      "counterEvidenceRefs": [],
      "confidence": 0.68
    }
  ]
}
```

规则：

- `evidence-backed` 至少有一个证据 ID。
- 用户群如果没有证据引用，只能放在 `hypothesis-only`。
- 置信度为 `0–1`，不是市场规模或通过分。

## 3. 情绪洞察

`pain`、`itch`、`pleasure` 必须都是数组：

```json
{
  "emotionalInsights": {
    "pain": [
      {
        "claim": "用户担心前胸勒压和后退挣脱",
        "claimType": "fact",
        "evidenceRefs": ["ev_review_001"],
        "counterEvidenceRefs": [],
        "confidence": 0.82,
        "validationMethodZh": "复核更多评论并做样品受力测试"
      }
    ],
    "itch": [],
    "pleasure": []
  }
}
```

`claimType` 只能为 `fact`、`inference`、`hypothesis`。`fact` 必须有证据引用。

## 4. 产品机会

```json
{
  "opportunities": [
    {
      "id": "opp_p0_01",
      "priority": "P0",
      "titleZh": "低勒压防挣脱结构",
      "requirementType": "functional",
      "userOutcomeZh": "正常牵引时减少颈部受力，后退时不易挣脱",
      "functionalRequirementZh": "采用胸前分压和多点调节结构",
      "structureOrMaterialDirectionZh": [
        "Y型前胸结构",
        "调节范围与扣具规格待供应商事实确认"
      ],
      "acceptanceCriteria": [
        {
          "metricZh": "后退挣脱测试",
          "target": null,
          "methodZh": "样品测试方案待定义",
          "evidenceState": "unknown"
        }
      ],
      "evidenceRefs": ["ev_review_001"],
      "assumptionRefs": [],
      "counterEvidenceRefs": [],
      "risksZh": ["不同犬型适配范围未知"],
      "validationPlanZh": "先核验真实 SKU 尺码和扣具，再做样品试穿",
      "failureConditionZh": "无法覆盖目标犬型或样品出现明显勒颈/松脱"
    }
  ]
}
```

规则：

- `priority` 只能为 `P0`、`P1`、`P2`。
- `requirementType` 使用 `functional`、`experience`、`marketing` 或 `constraint`。
- P0 必须有验收指标；目标未知时写 `null` 并建立证据任务。
- 不把广告文案写进 `functionalRequirementZh`。

## 5. 实体商品可行性

```json
{
  "feasibility": {
    "maturity": "direction-only",
    "structureDirectionsZh": [],
    "materialDirectionsZh": [],
    "dimensionConstraints": {
      "known": [],
      "unknown": ["目标犬型对应尺码范围"]
    },
    "costConstraints": {
      "targetPurchaseCostRmb": null,
      "targetLandedCostRmb": null,
      "targetRetailPrice": null,
      "targetGrossMargin": null,
      "evidenceRefs": []
    },
    "fulfillmentConstraints": {
      "maxPackageSizeCm": null,
      "maxPackageWeightKg": null,
      "moq": null,
      "directShipRequired": true,
      "evidenceRefs": []
    },
    "complianceRisksZh": [],
    "ipAndClaimsRisksZh": [],
    "sampleTestPlan": []
  }
}
```

`maturity` 推荐使用：

- `direction-only`
- `supplier-facts-needed`
- `sample-test-needed`
- `development-brief-ready`

需求证据不能证明供应事实。材料、尺寸、重量、采购价和 MOQ 要等真实详情或样品。

## 6. 决策状态

```json
{
  "decision": {
    "status": "evidence-needed",
    "externalGatePassed": false,
    "humanApprovalStatus": "pending",
    "blockers": ["missing-trend-velocity-evidence"],
    "nextActionZh": "补近期趋势和跨平台评论证据"
  }
}
```

`status`：

- `hypothesis-only`
- `evidence-needed`
- `manual-review`
- `ready-for-domestic-sourcing`

`humanApprovalStatus`：

- `not-requested`
- `pending`
- `approved`
- `rejected`

`ready-for-domestic-sourcing` 必须同时满足：

- `mode = evidence-backed`
- `externalGatePassed = true`
- `humanApprovalStatus = approved`
- `blockers = []`
- 存在可回查的证据 ID

## 7. 最小示例

```json
{
  "schemaVersion": "product-demand-insight-v1",
  "analysisId": "analysis_demo_001",
  "mode": "hypothesis-only",
  "scope": {
    "productCategoryZh": "折叠旅行收纳产品",
    "targetMarkets": [],
    "targetPlatforms": [],
    "developmentStage": "idea",
    "analysisGoal": "evidence-plan"
  },
  "evidenceSummary": {
    "evidenceIds": [],
    "sourceCount": 0,
    "freshnessStatus": "unknown",
    "gaps": ["没有市场证据"]
  },
  "targetSegments": [],
  "emotionalInsights": {
    "pain": [],
    "itch": [],
    "pleasure": []
  },
  "opportunities": [],
  "feasibility": {
    "maturity": "direction-only",
    "structureDirectionsZh": [],
    "materialDirectionsZh": [],
    "dimensionConstraints": {"known": [], "unknown": []},
    "costConstraints": {
      "targetPurchaseCostRmb": null,
      "targetLandedCostRmb": null,
      "targetRetailPrice": null,
      "targetGrossMargin": null,
      "evidenceRefs": []
    },
    "fulfillmentConstraints": {
      "maxPackageSizeCm": null,
      "maxPackageWeightKg": null,
      "moq": null,
      "directShipRequired": null,
      "evidenceRefs": []
    },
    "complianceRisksZh": [],
    "ipAndClaimsRisksZh": [],
    "sampleTestPlan": []
  },
  "missingEvidenceTasks": [
    {
      "id": "task_001",
      "questionZh": "目标用户在什么场景反复遇到什么问题？",
      "preferredSourcesZh": ["评论", "问答", "访谈"],
      "completionRuleZh": "取得可回查的多条原始证据"
    }
  ],
  "decision": {
    "status": "hypothesis-only",
    "externalGatePassed": false,
    "humanApprovalStatus": "not-requested",
    "blockers": ["no-market-evidence"],
    "nextActionZh": "先采集评论、趋势和跨平台表达证据"
  }
}
```

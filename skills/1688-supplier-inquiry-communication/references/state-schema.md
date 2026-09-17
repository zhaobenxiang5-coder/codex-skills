# 通用状态契约

找货策略版本：`stock-first-custom-fallback-v1`。  
定制沟通策略版本：`human-staged-v3`。  
供应商网络策略版本：`core-pool-first-v1`。  
X运行环境的 `FACTORY_SOURCING_POLICY_VERSION`、`FACTORY_DIALOGUE_POLICY_VERSION` 和 `FACTORY_SUPPLIER_NETWORK_POLICY_VERSION` 必须分别与此一致。

每个产品使用独立项目/批次。X接入时X数据库是唯一业务状态源；独立脚本可在 `~/.1688/batches/<batchId>/` 保留CLI原始证据。

## UnifiedSourcing

- `sourcingStrategy=stock-first-custom-fallback`
- `sourcingState=draft | searching | ready-product-review | custom-supplier-review | sampling | completed | paused`
- `readyProductStatus=not-started | searching | review | handed-off | no-match`
- `customDevelopmentStatus=not-started | preparing | ready | active | paused | completed`
- 同一项目同时保留 `ReadyProductCandidate[]` 和 `ProductSupplierCandidate[]`，两类证据不互相升级。
- 定制新厂候选还要保存粗筛/细筛状态（可放在 `factoryEvidence`）：`coarseScreenStatus=rough_pool`、`fineScreenStatus=pending | dialogue_wave_1 | fine_screen_hold`，以及 `fineScreenRank/fineScreenTarget`。流程是原始召回池→项目目标规模的粗筛池→粗筛池约一半进入首轮能力沟通；`qualifiedTarget` 只用于最终样品目标，不得作为首轮外发数量闸门。

`OutputAcceptanceBrief` 是现货判断、定制交付和样品验收的同一份输出标准，包含 `coreFunctions / lockedDesignFacts / dimensions / appearance / safetyAndPerformance / sampleTests / supplierMayDecide / materialComparisonRequired`。

`ReadyProductCandidate` 只表示商品机会：保存Offer、卖家、页面声称、符合项、差异、硬冲突、未验证项和交接状态。它不要求卖家是工厂，也不证明其定制能力。

`FactorySampleAssessment` 必须指向现货候选或定制供应商之一；书面“能做”最多是 `qualified-for-sample`，所有必填验收项实测通过才是 `sample-passed`。

## SupplierNetwork

- `SupplierMaster`仍是跨项目唯一厂家身份。
- `manufacturingModel=self-manufacturer | hybrid-integrator | trader | unknown`。
- `verificationGrade=unknown | platform-indicated | corroborated | audited`。
- `relationshipTier=discovered | verified | trial | preferred | core | watch | blocked`。
- 历史主档首次初始化只能是`discovered/unknown`，不得从平台标签、旧聊天或旧判定自动晋级。
- 制造证据、合作事件、样品、履约、事故和不可变评分快照均绑定`supplierId`；项目Brief和厂家回复证据仍绑定各自project/candidate，不跨产品串用。
- 履约使用`supplierId + eventKey`去重；事故使用`supplierId + incidentKey`去重。账号身份合并时迁移记录并先去重，不能重复计分或丢失事故。
- `preferred`至少要求样品实测通过与合作健康度70；`core`还要求制造等级至少corroborated、合作健康度80、两次独立真实履约且无重大未解决事故。系统只给建议，层级变化必须由用户写原因确认。

## ProjectSupplierReuse

- 匹配记录区分`origin=pool-reuse | new-search`。
- 推荐只包含`preferred/core`、制造证据仍有效、项目匹配度不低于70且联系有效的1～3家。
- `newSupplierOutreachUnlocked=false`时，新厂只读任务可运行，但询盘预览/审批/执行均拒绝。
- 老厂使用`seller chat --no-card`；新厂才使用绑定当前Offer的`seller inquire`。
- 老厂全部拒绝/超时/不匹配后自动解锁；人工提前解锁必须保存原因。

## ProductContactBrief V2

- `contactIntent.coreConcept`：用户确认的一句话联系目的。
- `designIntent`：`mode / approvedAssetIds / lockedFacts / adjustmentPolicy`；mode只能是 `locked-drawing` 或 `collaborative-design`。
- `components[]`：`componentKey / label / materialMode / materialCritical`。
- `confirmed / unknown / supplierToPropose / forbiddenToAssume`。
- `typedSpecs`、Brief版本、content hash、附件权限hash和用户审批。

## ConversationPlan V3

- `schemaVersion=2`
- `contractVersion=human-staged-v3`
- `PromptGroup`：`id / phase / intent / text / askedFieldIds / askedPaths`
- 每条出站最多2个PromptGroup；一个自然问题可以映射多个内部字段。
- 旧 `staged-conversation-v1` 只读；旧审批和待发任务必须过期并重新预览。

## ConversationBatch V3

- `conversationMode=batch-autopilot`，首轮目标按粗筛池约一半计算，与`qualifiedTarget`分离。
- 快照冻结`candidateIds / supplier identities / offerId / sellerLoginId / perCandidateAction / exactText / conversationPlanHash / compatibilityHash / drawingAssetId / drawingSha256 / monitoringPolicy`。
- 历史exact首询保存为`historical_reuse` turn，并保留原平台`messageId`；不能生成第二条首询。
- 批次状态：`pending | approved | active | target-reached | completed | canceled | stale`。
- 每个会话同一计划时间最多一个active `sync_replies`；卡片、营销和系统消息不更新`lastHumanReplyAt`。
- 达到`qualifiedTarget`后写任务全部停止，`sync_replies`继续只读回收迟到回复。

## ProjectRoutineAutopilot

- 项目级代批授权必须绑定当前Brief版本/哈希、supplier-drawing的assetId/SHA、首轮15家、累计最多30家和最终目标2家。
- `send_inquiry / send_followup / reminder / send_approved_drawing`只在该项目、该厂家、该批次快照内有效；不覆盖其他项目或敏感动作。
- 首轮已联系厂家只复用历史原话和服务器`messageId`，不得重发首询。只要当前有效活动会话少于`dialogueWaveTarget`且`qualifiedTarget`未达到，就按缺口并行补位；不得因为仍有1—2家活动会话而阻塞其余席位。累计真实联系仍不得超过`maxContacted`。
- 历史partial/engaged会话可在7天硬窗口内恢复，不重复计算新联系名额；新厂家才消耗`maxContacted`。
- 达到2家后新增写任务必须为0，迟到回复只读同步仍可继续。

## ConversationPhaseState

- 身份：`candidateId / briefVersionId / conversationPlanHash`
- 阶段：`currentPhase / phaseOrdinal / resumePhaseAfterAttachment / resumePhaseOrdinal`
- 评估：`technicalUnderstanding / quoteComparability / qualificationBlockers / sampleTestRequired`
- 窗口：`startedAt / replyWindowEndsAt / hardDeadlineAt / lastHumanReplyAt`
- 整理：`unresolvedFields / ambiguities / finalSummary / stoppedReason`

阶段：
`cooperation → awaiting-attachment-approval → core-feasibility → material-options → commercial-terms → final-review → stopped`。

## ConversationTurn

唯一键：`candidateId + briefVersionId + phase + ordinal`。

- ordinal只允许1或2；
- `phase / kind / questionItems / askedFieldIds / message / messageHash / platformMessageId / status`；
- 无回复提醒占1条；附件不新建turn、不重置ordinal；
- exact文字＋全新messageId才是verified。

## MaterialProposalV2

```text
baselineComponents[]
tiers.cost[]
tiers.durable[]
sharedCommercial
tierCommercial.cost / tierCommercial.durable
technicalComparable
commercialComplete
acceptanceEligible
```

每个基线/变化字段都绑定原话和messageId。两次材料沟通后仍含糊：
`technicalUnderstanding=insufficient`、`quoteComparability=not-comparable`、`qualificationBlocker=material_mapping_unclear`。

## CanonicalSupplierClaim

- `fieldId / semanticType / scope / stance`
- `rawValue / rawUnit / canonicalValue / canonicalUnit`
- `evidenceText / messageId / confidence / conflictsWith`
- `verificationStatus / requiredAction`

厂家书面“按图可做”保存为supplier claim并标 `sample_test_required`，不代表实物验证。

## Evidence与安全

- 候选身份、Offer、工厂证据、消息和审批全部按project/candidate隔离。
- 附件grant是一份asset×一家candidate；未知发送状态不重发。
- v1历史项目只读；新产品不得继承旧项目字段或话术。
- 产品参数禁止写入Skill。

# 🚀 Codex & AI Agent 历史技能全集 (Skills Collection)

本仓库完整收录并整理了作者在日常生产与研发中沉淀的 **64 个高价值 AI Agent 技能（Skills）**。
所有技能均遵循统一的标准规范（包含完整 `SKILL.md` 元数据定义），不仅原生支持 **OpenAI Codex**，同时无缝兼容 **Claude Code** 与 **Google Antigravity** 等现代智能体编程环境。


> [!TIP]
> 📖 **重磅推荐阅读**：我们在仓库根目录整理并沉淀了长年生产实践总结的 **[《Codex 实战进阶与完全使用心法：从新手到生产级 Agent 架构师指南》(CODEX_GUIDE.md)](./CODEX_GUIDE.md)**！
> 涵盖 Agent 协作四大铁律、Skill 黄金架构设计、人机双模协同、GPT+Codex 跨模型闭环、电商/视频/前端实操心法与高频避坑大全。强烈建议在查阅具体技能前先行阅读！

## 📦 技能特性与设计亮点

- **原生多 Agent 兼容**：标准化目录结构与 YAML 元数据，可即插即用在任意支持 Skill 规范的 Agent 环境。
- **独立物理文件（无外部软链死链）**：已完成全量外部依赖的解引用与独立物理化，脱机或跨机器即下即用。
- **安全与纯净**：全量排查并清除了 `.git` 内部仓库、系统缓存（`.DS_Store`）、编译垃圾及真实私有密钥凭证。
- **开箱即用的一键部署**：内置 `install.sh` 脚本，一条命令即可软链接或拷贝至您的开发环境。

## ⚡ 快速开始 (Quick Start)

### 1. 克隆本仓库
```bash
git clone https://github.com/zhaobenxiang5-coder/codex-skills.git
cd codex-skills
```

### 2. 一键安装到您的 Agent
```bash
# 交互式菜单选择安装
./install.sh

# 或直接指定平台软链部署
./install.sh --target codex        # 部署到 ~/.codex/skills
./install.sh --target claude       # 部署到 ~/.claude/skills
./install.sh --target antigravity  # 部署到 ~/.gemini/config/skills
./install.sh --target all          # 一键挂载到上述全部环境
```

## 📑 技能分类索引表 (Index of 64 Skills)

### 🧠 核心思维孪生中枢 (Soul & Mindset Skill)

> **本仓库最核心的灵魂技能**：将作者（Zhuanz / 本像）从开始到现在使用 Codex 的所有个人习惯风格、审美哲学、严苛思维与商业落地直觉完全蒸馏而成的数字孪生体。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`本像`](./skills/本像) | **《本像》数字思维孪生与智力引擎** | 深度蒸馏个人认知脑子（认识论五分法、四层终审观）、商业穿透漏斗（刺破展示价）、底层存储物理直觉（流式防爆盘）、反AI油腻审美哲学、物理级连续动效与法律维权防线 | 10 | 48 KB |



### 🛒 电商与跨境供应链 (E-Commerce & Supply Chain)

> 涵盖 1688 批发采购、现货挖掘、供应商沟通、Temu 发品与价格管理、店小秘自动化等全链路电商智能体能力。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`1688-differentiated-stock-mining`](./skills/1688-differentiated-stock-mining) | **1688 差异化现货挖掘** | 从 1688 快速筛选可立即买样的差异化现货与开款方案 | 17 | 222.2 KB |
| [`1688-product-search`](./skills/1688-product-search) | **1688 智能搜品与货源分析** | 1688 平台商品检索、价格带分布、销量榜分析及源头工厂挖掘 | 22 | 196.4 KB |
| [`1688-supplier-inquiry-communication`](./skills/1688-supplier-inquiry-communication) | **1688 供应商询盘与沟通** | 工厂资质评估、自动打样沟通策略、起订量(MOQ)及账期商务谈判 | 7 | 35.5 KB |
| [`flow-1688-sourcing`](./skills/flow-1688-sourcing) | **Flow 1688 自动化抓货流水线** | 针对 Flow AI 商品流水线的全自动选品与需求对接插件 | 2 | 8.9 KB |
| [`linkfox-1688-product-detail`](./skills/linkfox-1688-product-detail) | **LinkFox 1688 商品详情查询** | 通过 offerId 高速获取商品规格属性、SKU 库存与批发阶梯价 | 7 | 125.9 KB |
| [`linkfox-dld-product-billboard`](./skills/linkfox-dld-product-billboard) | **LinkFox 1688 热销榜单** | 实时查询 1688 热卖风向标、爆款榜单与飙升商品，用于选品决策 | 7 | 121.5 KB |
| [`linkfox-dld-product-search`](./skills/linkfox-dld-product-search) | **LinkFox 1688 网关搜索** | 基于 LinkFox API 网关的高并发 1688 现货与货源搜索 | 7 | 120.9 KB |
| [`linkfox-temu-add-product-us`](./skills/linkfox-temu-add-product-us) | **Temu 美国站自动化发品** | 调用 LinkFox 转发 Temu Partner API 完成商品信息批量上传 | 76 | 141.8 KB |
| [`linkfox-temu-manage-product-us`](./skills/linkfox-temu-manage-product-us) | **Temu 美国站商品管理** | Temu 在售商品状态监控、SKU 管理、库存更新与下架处理 | 110 | 239.0 KB |
| [`linkfox-temu-price-us`](./skills/linkfox-temu-price-us) | **Temu 美国站价格智能管理** | Temu 核价单跟踪、申报价调整与自动化价格申报维护 | 31 | 119.2 KB |
| [`product-demand-insight`](./skills/product-demand-insight) | **产品需求洞察与用户画像** | 实体消费品与跨境电商的痛点/痒点挖掘、竞品评论拆解与开发建议 | 6 | 44.6 KB |
| [`product-reference-mining`](./skills/product-reference-mining) | **海外差异化参考款挖掘** | 从海外 Kickstarter、Amazon 榜单、设计奖与专利中挖掘创新灵感 | 4 | 17.2 KB |
| [`temu-shangjia`](./skills/temu-shangjia) | **Temu 智能商品上架助手** | 将 AI 商品上架包无缝转换为 Temu 官方规格并自动化刊登 | 9 | 61.7 KB |
| [`dianxiaomi-shangjia`](./skills/dianxiaomi-shangjia) | **店小秘跨平台批量上架** | 基于店小秘平台的跨渠道（Shopee/Lazada/Temu等）商品批量铺货 | 7 | 48.3 KB |
| [`zhitai-temu-capture`](./skills/zhitai-temu-capture) | **智态 Temu 新品数据捕获** | 每日采集与分析 Temu 平台同品类最新上线商品及趋势动态 | 3 | 12.0 KB |

### 🎬 视频创作与多媒体生成 (Video & Media Production)

> 包含 HyperFrames 动效体系、本象动画连续制作、无脸解说视频、手绘故事视频与短视频内容工业化生产工具链。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`ancient-mystery-video`](./skills/ancient-mystery-video) | **古代奇闻短视频流水线** | 60-90 秒中国风历史奇闻/悬疑类竖屏短视频全流程工业化生产 | 10 | 6076.9 KB |
| [`benxiang-motion-video`](./skills/benxiang-motion-video) | **本象高帧率连续动画制作** | 复用平滑连续动画制作方法：逐帧形变、镜头跟随、视差与转场 | 9 | 17.6 KB |
| [`doubao-lab`](./skills/doubao-lab) | **豆包广告投放与投放实验室** | 通过本地 doubao-lab 自动化投放、监控与批量管理素材 | 2 | 2.9 KB |
| [`faceless-explainer`](./skills/faceless-explainer) | **无脸解说短视频生成** | 将任意长文章、笔记或行业研报自动化转换为高质量口播解说视频 | 24 | 261.9 KB |
| [`general-video`](./skills/general-video) | **HyperFrames 通用视频合成** | 当无特定垂直类型时，快速搭建通用交互式与图文视频结构 | 4 | 27.6 KB |
| [`handdraw-story-video`](./skills/handdraw-story-video) | **手绘故事视频工作流** | 中国传统故事/叙事散文的手绘分镜生成、配音对齐与视频渲染 | 20 | 7448.2 KB |
| [`hyperframes`](./skills/hyperframes) | **HyperFrames 动效引擎总入口** | HyperFrames 框架核心入口，规范画布契约与所有视频组件协同 | 26 | 136.4 KB |
| [`hyperframes-animation`](./skills/hyperframes-animation) | **HyperFrames 动效设计原子库** | 原子级动画规则、缓动曲线、图层嵌套与复杂动效编排 | 121 | 1185.9 KB |
| [`hyperframes-audio`](./skills/hyperframes-audio) | **HyperFrames 音频节奏编排** | BGM、音效 (SFX) 与旁白字幕的时间轴对齐与波形同步 | 7 | 97.7 KB |
| [`hyperframes-cli`](./skills/hyperframes-cli) | **HyperFrames 命令行开发环** | 支持 init、add、catalog、render 等本地动效调试与渲染命令 | 11 | 105.9 KB |
| [`hyperframes-core`](./skills/hyperframes-core) | **HyperFrames 核心组件协议** | 定义帧率、尺寸规范、组件生命周期与渲染管线契约 | 11 | 84.3 KB |
| [`hyperframes-creative`](./skills/hyperframes-creative) | **HyperFrames 视觉与创意指引** | 色彩系统、排版美学、转场质感与非动效层面的创意设计规范 | 78 | 1171.4 KB |
| [`hyperframes-keyframes`](./skills/hyperframes-keyframes) | **HyperFrames 关键帧变换系统** | 镜头推拉摇移（Punch-in/Punch-out）、动态缩放与焦点跟踪 | 3 | 22.3 KB |
| [`hyperframes-registry`](./skills/hyperframes-registry) | **HyperFrames 动效组件仓库** | 开箱即用的预制动画块、转场特效与注册表组件库检索 | 12 | 80.4 KB |
| [`media-use`](./skills/media-use) | **Agent 媒体资源操作系统 (Media OS)** | 统一管理生图模型、TTS 配音、BGM 检索与多媒体资产调用 | 158 | 2067.5 KB |
| [`motion-graphics`](./skills/motion-graphics) | **MG 动态图形设计与表达** | 以现代设计理念驱动的短篇 MG 动画（Motion Graphics）制作指南 | 23 | 113.5 KB |
| [`xingxing-emotion-video`](./skills/xingxing-emotion-video) | **醒醒情感短剧全流程引擎** | 情感类微短剧流水线：剧本生成、情绪起伏控制与视频合成 | 5 | 29.5 KB |
| [`xingxing-relationship-micro-story`](./skills/xingxing-relationship-micro-story) | **17秒情感微故事制作** | 高完播率 17 秒男女情感微短剧创作与节奏黄金法则 | 18 | 2786.4 KB |

### 🎨 前端动效与UI组件开发 (Frontend & Animation)

> 涵盖 GSAP 官方动效开发规范、React 性能优化、现代视图转场与高品质无垃圾（Anti-slop）前端设计法则。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`composition-patterns`](./skills/composition-patterns) | **React 高可扩展组合模式** | 大型 React 应用的组件设计模式、Headless 组合与性能解耦 | 14 | 49.2 KB |
| [`frontend-slides`](./skills/frontend-slides) | **动画级交互式 HTML 幻灯片** | 从零构建高表现力、带丰富微交互与动效的网页演示文稿 | 163 | 3449.4 KB |
| [`gsap-core`](./skills/gsap-core) | **GSAP 核心动画 API 规范** | 涵盖 gsap.to(), from(), fromTo(), set() 的最佳实践与踩坑指引 | 1 | 14.4 KB |
| [`gsap-frameworks`](./skills/gsap-frameworks) | **GSAP 现代前端框架集成** | 在 Vue 3、Svelte、Solid 等现代框架中正确管理 GSAP 实例与销毁 | 1 | 10.4 KB |
| [`gsap-performance`](./skills/gsap-performance) | **GSAP 性能极致优化指南** | 图层合成、强制 GPU 硬件加速 (will-change) 与重排重绘优化 | 1 | 4.0 KB |
| [`gsap-plugins`](./skills/gsap-plugins) | **GSAP 官方插件全景指南** | ScrollTo, Flip, SplitText, MorphSVG, Observer 等专业插件用法 | 1 | 21.1 KB |
| [`gsap-react`](./skills/gsap-react) | **GSAP React 专属开发规范** | 配合 @gsap/react 和 useGSAP Hook 实现无泄漏动效 | 1 | 6.4 KB |
| [`gsap-scrolltrigger`](./skills/gsap-scrolltrigger) | **GSAP 滚动驱动动画 (ScrollTrigger)** | 视差滚动、固定锁定 (pin)、进度触发与响应式断点控制 | 1 | 18.0 KB |
| [`gsap-timeline`](./skills/gsap-timeline) | **GSAP 复杂时间轴编排** | 多轨道动画编排、标签定位、相对位移与重叠时间控制 | 1 | 4.3 KB |
| [`gsap-utils`](./skills/gsap-utils) | **GSAP 实用工具函数集** | clamp, mapRange, normalize, wrap, interpolate 等数学工具 | 1 | 11.8 KB |
| [`react-best-practices`](./skills/react-best-practices) | **React / Next.js 最佳性能实践** | Vercel / Next.js 性能指导原则：服务端组件、水合优化与渲染控制 | 76 | 225.0 KB |
| [`react-view-transitions`](./skills/react-view-transitions) | **原生级平滑页面转场 (View Transitions)** | 基于 View Transitions API 构建丝滑原生感页面路由跳转 | 8 | 75.6 KB |
| [`taste-skill`](./skills/taste-skill) | **高级前端品味与防流水线规范 (Anti-slop)** | 抵制千篇一律的 AI 模板UI，输出克制、高级、有质感的前端界面 | 1 | 85.2 KB |
| [`web-design-guidelines`](./skills/web-design-guidelines) | **Web 设计规范与无障碍审计** | W3C 可访问性 (A11y)、响应式间距与现代网页交互规范检查 | 1 | 1.2 KB |

### 🌐 浏览器与自动化交互 (Browser & Automation)

> 双模人机协同浏览器、Playwright 高阶自动化、无头测试与高保真桌面/网页截图工具。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`ego-browser`](./skills/ego-browser) | **Ego-Browser 双模人机协同浏览器** | 专为 Agent 与人类协作设计的 Chromium 自动化浏览器，支持复用登录态 | 17 | 50.2 KB |
| [`playwright`](./skills/playwright) | **Playwright 端到端浏览器自动化** | 利用 Playwright CLI/API 实现全自动网页爬取、表单填写与回归测试 | 9 | 22.3 KB |
| [`playwright-interactive`](./skills/playwright-interactive) | **Playwright 交互式会话控制器** | 通过持久化 REPL 会话动态调试并与页面/Electron 容器深度交互 | 6 | 45.6 KB |
| [`screenshot`](./skills/screenshot) | **多分辨率与全屏截图捕获** | 支持网页全长截图、视口捕捉与系统桌面区域高精度截屏 | 11 | 50.8 KB |

### 🎙️ 音频、语音与文档工具 (Speech, Audio & Docs)

> 文档视觉解析、高自然度语音合成 (TTS)、语音转写 (STT) 与多发言人自动分离。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`pdf`](./skills/pdf) | **PDF 深度解析与视觉渲染校验** | 结合 Poppler、pdfplumber 与 visual check 实现排版与文字精确提取 | 4 | 14.5 KB |
| [`speech`](./skills/speech) | **高质量多音色语音合成 (TTS)** | 调用 OpenAI / 现代 TTS 引擎实现多种情感、语速与音色风格的旁白配音 | 16 | 47.6 KB |
| [`transcribe`](./skills/transcribe) | **音频精确转录与说话人分离** | 基于 Whisper 与 Diarization 技术的会议录音/访谈转文字 | 7 | 24.6 KB |

### 🛠️ 开发辅助与安全工程 (Dev Tools & Security)

> 命令行生成器、GitHub CI 自动化修复、GPT-Codex 协作、小程序开发及逆向与安全工具集合。

| 技能标识 (ID) | 中文名称 | 核心能力与适用场景 | 文件数 | 体积 |
| :--- | :--- | :--- | :---: | :---: |
| [`cli-creator`](./skills/cli-creator) | **Codex 组合式 CLI 工具脚手架** | 从 OpenAPI 或文档快速生成标准、模块化可执行 CLI | 4 | 26.2 KB |
| [`gh-fix-ci`](./skills/gh-fix-ci) | **GitHub Actions CI 故障诊断与修复** | 智能拉取失败 Actions 日志、定位断言错误并自动提出修复方案 | 6 | 31.9 KB |
| [`gpt-codex-collab`](./skills/gpt-codex-collab) | **GPT 与 Codex 协同工作流** | 打通 ChatGPT 网页端与本地 Codex 终端，实现架构设计与代码落地分工 | 3 | 8.6 KB |
| [`hatch-pet`](./skills/hatch-pet) | **Codex 宠物/容器管理助手** | 创建、修复、验证及视觉 QA 符合 Codex 标准的开发沙盒与伴侣 | 14 | 129.5 KB |
| [`jupyter-notebook`](./skills/jupyter-notebook) | **Jupyter Notebook 自动化维护** | 交互式数据分析笔记本的脚本化生成、单元格清理与格式规范化 | 12 | 30.1 KB |
| [`security-best-practices`](./skills/security-best-practices) | **多语言安全编码最佳实践** | 覆盖 Python、Go、TypeScript/JavaScript 的安全编码与漏洞防御规范 | 13 | 402.1 KB |
| [`wechat-miniprogram`](./skills/wechat-miniprogram) | **微信小程序开发标准指南** | 原生微信小程序架构、组件封装、分包加载与发布最佳实践 | 22 | 58.6 KB |
| [`zhuanz-codex`](./skills/zhuanz-codex) | **个人专属 Codex 上下文与规范** | Zhuanz 个性化工作流、提示词偏好与通用工程约定 | 1 | 3.9 KB |
| [`reverse-skill`](./skills/reverse-skill) | **安全与逆向工程全套武器库 (35+ 合集)** | 涵盖 APK 反编译、JS 反混淆、Ghidra/IDA、二进制比对、代码审计与渗透测试 | 322 | 5087.4 KB |

## 🛡️ 仓库目录结构规范

```text
codex-skills/
├── README.md               # 本索引与使用指南
├── .gitignore              # Git 忽略配置
├── install.sh              # 跨平台一键部署脚本
└── skills/                 # 64 个技能集合
    ├── 1688-differentiated-stock-mining/
    ├── ego-browser/
    ├── gsap-core/
    ├── hyperframes/
    ├── reverse-skill/
    └── ...
```

## 📝 贡献与维护

欢迎在日常开发中持续扩充与迭代个人工作流技能。编写新技能时，请确保：

1. 每个技能目录下包含规范的 `SKILL.md`，并在顶部提供 `name` 与 `description` 的 YAML Frontmatter。
2. 外部脚本存放在对应技能的 `scripts/` 目录下，参考资料置于 `references/` 目录中。
3. 严禁提交任何真实的 API Token、密钥或私有凭据。

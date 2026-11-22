---
name: repo-mastery-html
description: >-
  Generates a standalone, offline, interactive "Zero-to-Mastery" single-file HTML
  source-code learning system for any GitHub open-source repository (local directory
  or GitHub URL). Builds a complete 4-view interactive learning architecture: 3 interactive
  overview blueprints (Full-Chain Dataflow with upstream/downstream highlight, Tech
  Architecture Boundaries, End-to-End Business Workflow Swimlanes) backed by full-node
  6-dimension overview dossiers (dual-mode inline 2-column deck + fullscreen modal,
  anti-misclick single-click vs double-click/CTA navigation, neighbor capsule jumps,
  keyboard arrow roaming, and collapsible interview Q&As), progressive station-by-station
  learning studio with "Why This Code Exists" pedagogy (pain point, beginner analogy,
  anti-rabbit-hole tip), concrete Input/Transform/Output data contracts with parameter
  tables and real payload samples, 100% per-line Chinese source annotations (below/inline/hidden
  modes), Chinese-annotated project directory tree with module drill-down flow diagrams,
  interview sprint & exam, global search, dark/light themes, and Headless CDP 0-overflow
  verification. Use when the user asks to create an interactive HTML learning guide,
  zero-to-mastery tutorial, or code-linked architecture workbench for any GitHub repo
  or codebase.
---

# Repo Mastery HTML — 开源项目 0 基础到精通交互式学习系统生成器

将任意 GitHub 开源仓库（本地目录或 GitHub URL，任意编程语言与项目规模）转化为**单文件离线、可双向交互、全源码 100% 逐行中文精注**的「从 0 基础到精通」HTML 学习系统（完整覆盖 4 大视图、11 大核心学习支柱，零遗漏）。

## Dependencies & Prerequisites
- **Runtime**: Node.js `>= 20`（零外部 npm 依赖，使用内置 `fetch` 与 `WebSocket` 进行 Headless CDP 校验）。
- **Headless Browser**: 本机 Microsoft Edge 或 Google Chrome（用于 `verify-html` 渲染测绘与截图目检）。
- **Optional Synergy Skill**: `archify`（若目标项目尚未生成架构/数据流/业务泳道蓝图，可优先结合 `archify` 生成并复用其 `candidate.json`，或直接按 [schema_spec.md](./references/schema_spec.md) 产出三张蓝图数据）。

## Core References (Read Before Authoring)
- 完整数据结构、视角分工与 SVG 防溢出字数规范：[references/schema_spec.md](./references/schema_spec.md)
- v6 零遗漏 11 大支柱验收清单：[references/v6_parity_checklist.md](./references/v6_parity_checklist.md)
- 并行 `dossier_author` 3 路子代理视角编写规范（中大型仓库推荐）：[references/dossier_author_prompt.md](./references/dossier_author_prompt.md)
- 并行 `code_annotator` 子代理逐行中文注释规范：[references/annotator_prompt.md](./references/annotator_prompt.md)
- 最小可运行示例：`examples/minimal_curriculum.example.json`

## Utility CLI (`scripts/repo_mastery_cli.mjs`)
所有构建、拆包、校验与 CDP 自动化测试均由统一 CLI 执行（默认文件输出，stdout 仅输出精简状态，避免撑爆上下文）：

```bash
# Relative to this skill directory (e.g. ~/.gemini/config/skills/repo-mastery-html/scripts/repo_mastery_cli.mjs)
CLI="<SKILL_DIR>/scripts/repo_mastery_cli.mjs"

# 1. 扫描本地仓库或浅克隆 GitHub URL -> 输出结构化 scan.json
node "$CLI" scan --repo "<repoPath>" --output "<outDir>/scan.json"
# 或从 GitHub URL 浅克隆：
node "$CLI" scan --github "https://github.com/owner/repo" --clone-dir "<cloneDir>" --output "<outDir>/scan.json"

# 2. 校验 View 1 三图全节点 6 维深度档案（支持内联或外部 --dossiers-dir 3 路合并，强制 role 全局唯一）
node "$CLI" verify-dossiers --curriculum "<outDir>/curriculum.json" --dossiers-dir "<outDir>/dossiers" --output "<outDir>/dossiers_report.json"

# 3. 按 curriculum.json 真实切片去重，拆分为 N 个均衡批次供并行逐行注释
node "$CLI" prepare-notes --repo "<repoPath>" --curriculum "<outDir>/curriculum.json" --out-dir "<outDir>/work" --batches 8

# 4. 合并并严格校验 100% 非空源码行中文备注覆盖（MISSING=0 方可通过）
node "$CLI" verify-notes --repo "<repoPath>" --curriculum "<outDir>/curriculum.json" --annotations-dir "<outDir>/annotations" --output "<outDir>/notes_report.json"

# 5. 编译生成单文件离线 HTML（内置防覆盖保护；默认强制校验 overviewDossiers，可传 --dossiers-dir 或旧版兼容开关 --allow-legacy-overview）
node "$CLI" build --repo "<repoPath>" --curriculum "<outDir>/curriculum.json" --dossiers-dir "<outDir>/dossiers" --annotations-dir "<outDir>/annotations" --output "<outDir>/<slug>-mastery-v1.html"

# 6. Headless Edge/Chrome CDP 全量校验 + 9 张深浅色截图采集（含 View 1 导读面板、全屏弹层与交互断言）
node "$CLI" verify-html --html "<outDir>/<slug>-mastery-v1.html" --shots-dir "<outDir>/screenshots" --port 9345 --output "<outDir>/cdp_report.json"
```

---

## 7-Phase Production Workflow (STRICT — Zero Omissions)

### Phase 0: 输出目录与版本留存规则
1. **绝不修改目标仓库的任何上游业务代码**；所有产物统一放入独立输出目录（默认 `<repo>/.repo-mastery/<slug>-mastery-v1/`，或若项目已使用 `.archify/` 可对齐放入 `<repo>/.archify/<slug>-mastery-v1/`，亦可由用户指定路径）。
2. **版本留存铁律**：如果目录下已存在旧版 HTML，升级时必须新建版本号目录/文件名（如 `-v2.html`），绝不覆盖旧版（`build` 命令默认拒绝覆盖已存在 HTML）。

### Phase 1: 仓库采集与全域摸底 (`scan`)
1. 若用户提供 GitHub URL，先用 `scan --github <url>` 自动浅克隆（`git clone --depth 1`）；若为本地仓库，直接 `scan --repo <path>`。
2. 阅读输出的 `scan.json`、仓库 `README`、构建配置（`go.mod` / `package.json` / `pyproject.toml` / `Cargo.toml` / `pom.xml` / `build.gradle` / `CMakeLists.txt` / `Gemfile` / `composer.json` / `Package.swift` / `docker-compose.yml`）与核心入口源码，判断项目所属**工程原型（Web 后端 / 前端 UI / CLI 编译器 / SDK 与 AI 引擎）**并参照 [schema_spec.md](./references/schema_spec.md) §5 多类型映射指南，精准识别：
   - 项目的 **2–3 条核心端到端主线**（例如：在线请求主线、离线生产/构建主线、安全/异步/插件扩展主线）
   - 项目的 **核心架构分层与边界**（用于图二）
   - 项目的 **跨角色/跨模块业务泳道与异常分支**（用于图三）
   - 项目的 **核心代码目录结构**（用于 View 3 中文备注目录树 ↔ 5–9 大模块下钻图谱）

### Phase 2: 蓝图架构设计与规模自适应
1. 依据项目体量自适应站点规模（能力 100% 对齐 v6 11 大核心支柱，绝不删减模块；蓝图视角按 [schema_spec.md](./references/schema_spec.md) §5「4 类开源原型映射指南」适配目标仓库）：
   - **中大型仓库**：`5 阶段 × 3 主线 = 15 站` + `9 大目录模块` + `10 题总考`
   - **中型仓库**：`4 阶段 × 2–3 主线 = 8–12 站` + `6–9 大目录模块` + `8–10 题总考`
   - **小型库/工具**：`3–4 阶段 × 2 主线 = 6–8 站` + `4–6 大目录模块` + `6–8 题总考`
2. 若目标仓库已有 `.archify/` 下生成的架构图 / 数据流图 / 业务泳道图 `candidate.json`，**直接对齐复用其节点、边界与连线**；否则通过阅读真实源码先敲定三大蓝图坐标与源码锚点（行号必须实测核实，严禁编造！）。

### Phase 3: 编写完整 `curriculum.json` 与 `overviewDossiers`（严格对照 v6 11 大支柱）
严格依照 [references/schema_spec.md](./references/schema_spec.md) 与 [references/v6_parity_checklist.md](./references/v6_parity_checklist.md) 编写 `<outDir>/curriculum.json`（及可选 `<outDir>/dossiers/`），确保以下 **11 项核心内容零遗漏**：
1. **View 1 三大交互蓝图**：
   - `dataFlow` + `stages` + `flows`（图一：全链路数据流网格 + 主线筛选 + 选中节点上下游连线高亮与无关淡化）
   - `techArch`（图二：组件 + 虚线边界 + 正交连线 + `compToStation` 映射）
   - `businessFlow`（图三：阶段 + 泳道 + 分组 + `mainPath` + 业务连线 + `nodeToLearn` 含主/次站点与模块图谱跳转）
2. **View 1 三图全节点 6 维独立深度档案（`overviewDossiers`）**：
   - 必须 1-to-1 覆盖图一全站点（`dataflow`）、图二全架构组件（`techarch`）与图三全业务泳道节点（`businessflow`）。
   - **视角严格独立、严禁套壳复用**：图一聚焦「数据流加工与字段演化」、图二聚焦「架构分层边界/中间件选型/宕机爆炸半径」、图三聚焦「业务泳道职责/用户体验与 SLA 故障表象/异常分支」；所有节点 `role` 必须跨三图全局互不重复。
   - 每个节点包含 6 大维度：`role` + `whyNeed` + `problemsSolved[]`（≥2）+ `principles[]`（≥3，含真实源码 `anchor`）+ `failureScenarios[]`（固定 2 组 `P0/P1`：`trigger`/`prodImpact`/`fallbackOrCheck`）+ `io`（`inSummary/inFields(≥2)/transform/outSummary/outFields(≥2)`）+ `examPoints[]`（3–5）+ `interviewQuestions[]`（2 题含 `q/focus/a`）。
   - **规模自适应编写策略**：小型仓库（总节点 ≤ 15）可直接内联写入 `curriculum.json`；**中大型仓库（如 30–40+ 节点）强烈建议按 [references/dossier_author_prompt.md](./references/dossier_author_prompt.md) 启动 3 个并行 `dossier_author` 子代理**按图分工输出 `dossiers/dataflow.json`、`dossiers/techarch.json`、`dossiers/businessflow.json`，再跑 `verify-dossiers` 强制校验 `ERRORS=0`。
3. **View 2 每站 5-STEP 完整内容**（逐站检查，缺一不可）：
   - `whyBlock`：**STEP 1 痛点引导**（`painPoint` 真实痛点 + `analogy` 0基础生活化类比 + `avoidRabbitHole` 新手防偏提示）
   - `files` + `steps`：**STEP 2 源码切片与 2–4 步微流转图**（每个 `sliceStart..sliceEnd` 必须通过真实读取核对，`explain` 精讲 + `pitfall` 线上避坑）
   - `ioContract`：**STEP 3 完整数据流转契约**（`inType` + `inFields[]` 参数表 + `inSample` 真实进入报文 + `transformSteps[]` 加工变化 + `outType` + `outFields[]` 参数表 + `outSample` 真实传出报文）
   - `quiz`：**STEP 4 闯关自测**（1 题 4 选 1 + 解析，答对自动点亮全站绿灯）
   - `interviewQ` / `interviewA`：**STEP 5 面试官高频追问 & 30 秒口述模板**
4. **View 3 全景中文目录树 ↔ 模块下钻图谱** (`workbenchModules`)：
   - 第 0 项为 `dir_tree`（`kind: "tree"`，`virtualLines` 每一行目录/文件/关键接口均有中文 `# ...` 备注，右侧 5–9 张模块卡片均配置 `jumpTo` 一键下钻）
   - 第 1..K 项为各核心模块专属流程图（均配置 `parentOverviewNodeId` 返回聚焦、`stationId` 双向穿梭至全链路站点、以及真实源码切片与节点三卡精讲）
5. **View 4 面试总考与避坑**：
   - `pitch`（3 分钟 4 段式提词器）+ `skipGuide`（外围胶水红黑榜）+ `exam`（6–10 题结业总考，每题绑定 `stationId` 一键跳回对应站点复习）

### Phase 4: 全源码 100% 逐行中文备注（并行子代理流水线）
1. 运行 `prepare-notes` 将 View 2 + View 3 全部非目录树源码切片去重拆分为均衡批次 `work/batch_1.json .. batch_N.json`。
2. 严格按 [references/annotator_prompt.md](./references/annotator_prompt.md) 定义 `code_annotator` 子代理并**单轮并行启动全部批次**（`Model: "flash"`），为**每一行非空代码（含原注释翻译与 `}` 结束说明）**撰写精准、语义化的中文备注，输出至 `annotations/batch_k.json`。
3. 所有批次完成后运行 `verify-notes` 强制校验 **`MISSING=0`**，随后清理已完成子代理（`manage_subagents(kill_all)`）。

### Phase 5: 构建离线单文件 HTML (`build`)
运行 `build` 子命令（如使用外部 3 路档案目录请加 `--dossiers-dir <outDir>/dossiers`）：
- 自动校验 `curriculum.json` 必填字段完整性（缺失 `whyBlock` / `ioContract` / `quiz` 立即阻断报错）
- 默认强制校验 `overviewDossiers` 三图全节点覆盖率、全部字段阈值与跨图 `role` 全局唯一性（缺失或超限立即阻断；若确需重编无 Dossier 的旧版 v5 JSON，可显式传入 `--allow-legacy-overview` 降级）
- 自动逐字从 `--repo` 读取真实源码（绝不伪造代码）
- 自动校验 100% 非空源码行中文注释覆盖率（缺失 1 行即阻断构建）
- 生成零依赖单文件 HTML（支持图下常驻 2 列可收起导读 + `⛶ 全屏深读` 弹层、防误触单击/双击、键盘 `←/→/Esc` 漫游、上下游胶囊跳转、`💬 行下备注 / 行尾 / 隐藏` 三模式、18+ 语言语法高亮与 `plain` 回退、深浅色主题、`Ctrl+K` 全域搜索含图二组件与考点检索、`localStorage` 进度持久化）

### Phase 6: Headless CDP 自动化校验 + 强制截图目检 (`verify-html`)
1. 运行 `verify-html` 执行全自动 Headless Edge/Chrome CDP 检查：
   - 断言 `ConsoleErrors === 0`
   - 断言全部 SVG（图一 + 图二 + 图三 + 所有站微流转图 + 所有工作台模块图）`getBBox()` **`0` 文本溢出 / `0` 标签碰撞**
   - 断言 View 1 v6 全部交互与视觉契约：图一 `单击看详解` 与上下游连线高亮/无关节点淡化、三图节点二次单击不误跳、双形态导读面板（5 张卡片）展开/收起与 `#dossierModal` 全屏弹层开合 + `Esc` 关闭、上下游胶囊跳转（含跨链路筛选自动复原）、`←/→` 键盘与按钮漫游、面试题答案单题/一键折叠展开、`Ctrl+K` 检索图二组件直达并展开档案
   - 断言所有站点的 `STEP 1` 痛点卡、`STEP 3` 完整 I/O 数据契约、100% 逐行中文备注、图三全部业务节点跳转、`dir_tree` 以外所有工作台模块逐行备注与浅色主题均正常
2. **强制视觉目检**：使用 `read_file` 逐张查看 `screenshots/` 下生成的 **9 张 PNG 截图**（`shot_01_dark_dataflow`、**`shot_02_dark_dossier_deck`**、**`shot_03_dark_dossier_modal`**、`shot_04_dark_techarch`、`shot_05_dark_businessflow`、`shot_06_dark_station_top`、`shot_07_dark_station_io`、**`shot_08_light_dossier_modal`**、`shot_09_light_station`）。若发现任何边标签拥挤、卡片重叠、对比度异常或文本截断，必须修正后重跑 `build` + `verify-html` 直至视觉无瑕！

---

## Common Pitfalls & Guardrails
- **禁止编造源码与行号**：所有 `sliceStart..sliceEnd` 与图三 `sources` 必须来自实际读取过的仓库文件；`build` 会在行号越界时直接失败。
- **严防 SVG 文本碰撞**：严格遵守 `schema_spec.md` 的卡片字符长度上限（主标题 ≤ 8–10 中文字，Tag ≤ 5 中文字），并在 `verify-html` 报 `overflow` 或 `collides` 时缩短文案而非跳过测试。
- **严禁使用粗糙正则凑逐行注释**：务必通过 `prepare-notes` + 并行 `code_annotator` 子代理产出贴合项目真实业务的中文逐行注释，并用 `verify-notes` 保证 `MISSING=0`。
- **Windows PowerShell 命令分隔**：在 PowerShell 5.x 中使用 `;` 连接多条命令，勿使用 `&&`；单行脚本含复杂引号时优先使用单引号 here-string `@' ... '@ | node --input-type=module`。

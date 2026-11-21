---
name: repo-mastery-html
description: >-
  Generates a standalone, offline, interactive "Zero-to-Mastery" single-file HTML
  source-code learning system for any GitHub open-source repository (local directory
  or GitHub URL). Faithfully replicates the full WeKnora v5 architecture: 3 interactive
  overview blueprints (Full-Chain Dataflow, Tech Architecture Boundaries, End-to-End
  Business Workflow Swimlanes), progressive station-by-station learning studio with
  "Why This Code Exists" pedagogy (pain point, beginner analogy, anti-rabbit-hole tip),
  concrete Input/Transform/Output data contracts with parameter tables and real payload
  samples, 100% per-line Chinese source annotations (below/inline/hidden modes),
  Chinese-annotated project directory tree with module drill-down flow diagrams,
  interview sprint & exam, global search, dark/light themes, and Headless CDP
  0-overflow verification. Use when the user asks to create an interactive HTML
  learning guide, zero-to-mastery tutorial, or code-linked architecture workbench
  for any GitHub repo or codebase.
---

# Repo Mastery HTML — 开源项目 0 基础到精通交互式学习系统生成器

将任意 GitHub 开源仓库（本地目录或 GitHub URL，任意编程语言与项目规模）转化为**单文件离线、可双向交互、全源码 100% 逐行中文精注**的「从 0 基础到精通」HTML 学习系统（完整复刻 WeKnora v5 全部 10 大核心模块，绝不遗漏）。

## Dependencies & Prerequisites
- **Runtime**: Node.js `>= 20`（零外部 npm 依赖，使用内置 `fetch` 与 `WebSocket` 进行 Headless CDP 校验）。
- **Headless Browser**: 本机 Microsoft Edge 或 Google Chrome（用于 `verify-html` 渲染测绘与截图目检）。
- **Optional Synergy Skill**: `archify`（若目标项目尚未生成架构/数据流/业务泳道蓝图，可优先结合 `archify` 生成并复用其 `candidate.json`，或直接按 [schema_spec.md](./references/schema_spec.md) 产出三张蓝图数据）。

## Core References (Read Before Authoring)
- 完整数据结构与 SVG 防溢出字数规范：[references/schema_spec.md](./references/schema_spec.md)
- v5 零遗漏 10 大支柱验收清单：[references/v5_parity_checklist.md](./references/v5_parity_checklist.md)
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

# 2. 按 curriculum.json 真实切片去重，拆分为 N 个均衡批次供并行逐行注释
node "$CLI" prepare-notes --repo "<repoPath>" --curriculum "<outDir>/curriculum.json" --out-dir "<outDir>/work" --batches 8

# 3. 合并并严格校验 100% 非空源码行中文备注覆盖（MISSING=0 方可通过）
node "$CLI" verify-notes --repo "<repoPath>" --curriculum "<outDir>/curriculum.json" --annotations-dir "<outDir>/annotations" --output "<outDir>/notes_report.json"

# 4. 编译生成单文件离线 HTML（内置防覆盖保护，不覆写旧版）
node "$CLI" build --repo "<repoPath>" --curriculum "<outDir>/curriculum.json" --annotations-dir "<outDir>/annotations" --output "<outDir>/<slug>-mastery-v1.html"

# 5. Headless Edge/Chrome CDP 全量校验 + 6 张深浅色截图采集
node "$CLI" verify-html --html "<outDir>/<slug>-mastery-v1.html" --shots-dir "<outDir>/screenshots" --port 9345 --output "<outDir>/cdp_report.json"
```

---

## 7-Phase Production Workflow (STRICT — Zero Omissions)

### Phase 0: 输出目录与版本留存规则
1. **绝不修改目标仓库的任何上游业务代码**；所有产物统一放入独立输出目录（如 `<repo>/.archify/<slug>-mastery-v1/` 或用户指定目录）。
2. **版本留存铁律**：如果目录下已存在旧版 HTML，升级时必须新建版本号目录/文件名（如 `-v2.html`），绝不覆盖旧版（`build` 命令默认拒绝覆盖已存在 HTML）。

### Phase 1: 仓库采集与全域摸底 (`scan`)
1. 若用户提供 GitHub URL，先用 `scan --github <url>` 自动浅克隆（`git clone --depth 1`）；若为本地仓库，直接 `scan --repo <path>`。
2. 阅读输出的 `scan.json`、仓库 `README`、构建配置（`go.mod` / `package.json` / `pyproject.toml` / `Cargo.toml` / `docker-compose.yml`）与核心入口源码，精准识别：
   - 项目的 **2–3 条核心端到端主线**（例如：在线请求主线、离线生产/构建主线、安全/异步/插件扩展主线）
   - 项目的 **核心架构分层与边界**（用于图二）
   - 项目的 **跨角色/跨模块业务泳道与异常分支**（用于图三）
   - 项目的 **核心代码目录结构**（用于 View 3 中文备注目录树 ↔ 5–9 大模块下钻图谱）

### Phase 2: 蓝图架构设计与规模自适应
1. 依据项目体量自适应站点规模（结构与能力 100% 保持 v5 完整，绝不删减模块）：
   - **中大型仓库**：`5 阶段 × 3 主线 = 15 站` + `9 大目录模块` + `10 题总考`
   - **中型仓库**：`4 阶段 × 2–3 主线 = 8–12 站` + `6–9 大目录模块` + `8–10 题总考`
   - **小型库/工具**：`3–4 阶段 × 2 主线 = 6–8 站` + `4–6 大目录模块` + `6–8 题总考`
2. 若目标仓库已有 `.archify/` 下生成的架构图 / 数据流图 / 业务泳道图 `candidate.json`，**直接对齐复用其节点、边界与连线**；否则通过阅读真实源码先敲定三大蓝图坐标与源码锚点（行号必须实测核实，严禁编造！）。

### Phase 3: 编写完整 `curriculum.json`（严格对照 v5 10 大支柱）
严格依照 [references/schema_spec.md](./references/schema_spec.md) 与 [references/v5_parity_checklist.md](./references/v5_parity_checklist.md) 编写 `<outDir>/curriculum.json`，确保以下 **10 项内容零遗漏**：
1. **View 1 三大交互蓝图**：
   - `dataFlow` + `stages` + `flows`（图一：全链路数据流网格 + 主线筛选）
   - `techArch`（图二：组件 + 虚线边界 + 正交连线 + `compToStation` 映射）
   - `businessFlow`（图三：阶段 + 泳道 + 分组 + `mainPath` + 业务连线 + `nodeToLearn` 含主/次站点与模块图谱跳转）
2. **View 2 每站 5-STEP 完整内容**（逐站检查，缺一不可）：
   - `whyBlock`：**STEP 1 痛点引导**（`painPoint` 真实痛点 + `analogy` 0基础生活化类比 + `avoidRabbitHole` 新手防偏提示）
   - `files` + `steps`：**STEP 2 源码切片与 2–4 步微流转图**（每个 `sliceStart..sliceEnd` 必须通过真实读取核对，`explain` 精讲 + `pitfall` 线上避坑）
   - `ioContract`：**STEP 3 完整数据流转契约**（`inType` + `inFields[]` 参数表 + `inSample` 真实进入报文 + `transformSteps[]` 加工变化 + `outType` + `outFields[]` 参数表 + `outSample` 真实传出报文）
   - `quiz`：**STEP 4 闯关自测**（1 题 4 选 1 + 解析，答对自动点亮全站绿灯）
   - `interviewQ` / `interviewA`：**STEP 5 面试官高频追问 & 30 秒口述模板**
3. **View 3 全景中文目录树 ↔ 模块下钻图谱** (`workbenchModules`)：
   - 第 0 项为 `dir_tree`（`kind: "tree"`，`virtualLines` 每一行目录/文件/关键接口均有中文 `# ...` 备注，右侧 5–9 张模块卡片均配置 `jumpTo` 一键下钻）
   - 第 1..K 项为各核心模块专属流程图（均配置 `parentOverviewNodeId` 返回聚焦、`stationId` 双向穿梭至全链路站点、以及真实源码切片与节点三卡精讲）
4. **View 4 面试总考与避坑**：
   - `pitch`（3 分钟 4 段式提词器）+ `skipGuide`（外围胶水红黑榜）+ `exam`（6–10 题结业总考，每题绑定 `stationId` 一键跳回对应站点复习）

### Phase 4: 全源码 100% 逐行中文备注（并行子代理流水线）
1. 运行 `prepare-notes` 将 View 2 + View 3 全部非目录树源码切片去重拆分为均衡批次 `work/batch_1.json .. batch_N.json`。
2. 严格按 [references/annotator_prompt.md](./references/annotator_prompt.md) 定义 `code_annotator` 子代理并**单轮并行启动全部批次**（`Model: "flash"`），为**每一行非空代码（含原注释翻译与 `}` 结束说明）**撰写精准、语义化的中文备注，输出至 `annotations/batch_k.json`。
3. 所有批次完成后运行 `verify-notes` 强制校验 **`MISSING=0`**，随后清理已完成子代理（`manage_subagents(kill_all)`）。

### Phase 5: 构建离线单文件 HTML (`build`)
运行 `build` 子命令：
- 自动校验 `curriculum.json` 必填字段完整性（缺失 `whyBlock` / `ioContract` / `quiz` 立即阻断报错）
- 自动逐字从 `--repo` 读取真实源码（绝不伪造代码）
- 自动校验 100% 非空源码行中文注释覆盖率（缺失 1 行即阻断构建）
- 生成零依赖单文件 HTML（支持 `💬 行下备注 / 行尾 / 隐藏` 三模式、11+ 语言语法高亮、深浅色主题、`Ctrl+K` 全域搜索、`localStorage` 进度持久化）

### Phase 6: Headless CDP 自动化校验 + 强制截图目检 (`verify-html`)
1. 运行 `verify-html` 执行全自动 Headless Edge/Chrome CDP 检查：
   - 断言 `ConsoleErrors === 0`
   - 断言全部 SVG（图一 + 图二 + 图三 + 所有站微流转图 + 所有工作台模块图）`getBBox()` **`0` 文本溢出 / `0` 标签碰撞**
   - 断言所有站点的 `STEP 1` 痛点卡、`STEP 3` 完整 I/O 数据契约与 100% 逐行中文备注全部正确渲染
   - 断言图三全部业务节点跳转、`dir_tree` 以外所有工作台模块逐行备注与浅色主题均正常
2. **强制视觉目检**：使用 `read_file` 逐张查看 `screenshots/` 下生成的 6 张 PNG 截图（图一/图二/图三 + 精读页顶部与逐行备注 + STEP 3 数据契约 + 浅色模式）。若发现任何边标签拥挤、卡片重叠或文本截断，必须修正 `curriculum.json` 或走线坐标并重跑 `build` + `verify-html` 直至视觉无瑕！

---

## Common Pitfalls & Guardrails
- **禁止编造源码与行号**：所有 `sliceStart..sliceEnd` 与图三 `sources` 必须来自实际读取过的仓库文件；`build` 会在行号越界时直接失败。
- **严防 SVG 文本碰撞**：严格遵守 `schema_spec.md` 的卡片字符长度上限（主标题 ≤ 8–10 中文字，Tag ≤ 5 中文字），并在 `verify-html` 报 `overflow` 或 `collides` 时缩短文案而非跳过测试。
- **严禁使用粗糙正则凑逐行注释**：务必通过 `prepare-notes` + 并行 `code_annotator` 子代理产出贴合项目真实业务的中文逐行注释，并用 `verify-notes` 保证 `MISSING=0`。
- **Windows PowerShell 命令分隔**：在 PowerShell 5.x 中使用 `;` 连接多条命令，勿使用 `&&`；单行脚本含复杂引号时优先使用单引号 here-string `@' ... '@ | node --input-type=module`。

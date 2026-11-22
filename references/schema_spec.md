# `curriculum.json` Complete Schema Specification

Every project analyzed by `repo-mastery-html` produces one canonical `curriculum.json` file that feeds `prepare-notes`, `verify-notes`, and `build`. All line slices MUST be read verbatim from the target repository by the CLI (never pasted or fabricated inside `curriculum.json`, except the human-authored Chinese directory tree `virtualLines`).

## Top-Level Structure

```json
{
  "meta": { ... },
  "stages": [ ... ],
  "flows": [ ... ],
  "techArch": { ... },
  "dataFlow": { ... },
  "businessFlow": { ... },
  "overviewDossiers": {
    "dataflow": { "<station_id>": { ... } },
    "techarch": { "<comp_id>": { ... } },
    "businessflow": { "<biz_node_id>": { ... } }
  },
  "stations": [ ... ],
  "workbenchModules": [ ... ],
  "pitch": [ ... ],
  "skipGuide": [ ... ],
  "exam": [ ... ]
}
```
> **Note for Large Repos**: For large codebases (e.g., 30–50+ total blueprint nodes), `overviewDossiers` may alternatively be authored externally in three parallel files under `--dossiers-dir <dir>`: `dataflow.json`, `techarch.json`, and `businessflow.json`, then validated via `verify-dossiers` and merged automatically during `build`.

## 1. `meta`
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `projectName` | string | Yes | Display name (e.g. `"WeKnora"`, `"Dify"`, `"vLLM"`) |
| `logoChar` | string | No | Single character shown in top-left square badge (e.g. `"链"`) |
| `version` | string | Yes | Release tag or branch (e.g. `"v0.9.0"`, `"main"`) |
| `commit` | string | Yes | Short git SHA (`git rev-parse --short=9 HEAD`) |
| `storageKey` | string | Yes | Unique `localStorage` key (e.g. `"repo_mastery_dify_v1"`) |
| `title` | string | No | Browser `<title>` |
| `heroKicker` | string | No | Top hero pill kicker text |
| `heroTitle` | string | No | Main H1 title on Overview |
| `heroSubtitle` | string | No | Subtitle under H1 (supports `**bold**` and `` `code` ``) |
| `workbenchNavLabel` | string | No | Tab 3 label (defaults to `🗂️ 3. 目录与 N 模块图谱`) |
| `workbenchBtnLabel` | string | No | Hero secondary CTA button label |
| `searchPlaceholder` | string | No | `Ctrl+K` modal search input placeholder |

## 2. `stages` & `flows` & `dataFlow` (Map 1: Full-Chain Dataflow)
- **Adaptive Scale**:
  - Large repos (e.g. WeKnora, Dify, Kubernetes): `5 stages × 3 flows = 15 stations`
  - Medium repos: `4 stages × 2–3 flows = 8–12 stations`
  - Small repos / libraries: `3–4 stages × 2 flows = 6–8 stations`
- `stages[]`: `[{ "idx": 0, "label": "Stage 1 · 接入与入口" }, ...]`
- `flows[]`:
  ```json
  {
    "id": "flow_main",
    "badge": "主线一 · 推荐首学",
    "name": "请求进入 → 结果返回（在线核心全链路）",
    "shortName": "💬 在线核心全链路 (5站)",
    "chipLabel": "💬 在线核心",
    "filterLabel": "💬 请求进入→结果返回",
    "color": "accent",
    "summary": "一句话概括本主线端到端职责",
    "stationIds": ["q1", "q2", "q3", "q4", "q5"]
  }
  ```
  `color`: `"accent"` | `"emerald"` | `"rose"`.
- `dataFlow`:
  ```json
  {
    "flows": [
      { "id": "df_1", "from": "df_node_a", "to": "df_node_b", "label": "流向短标签", "variant": "emphasis" }
    ]
  }
  ```
  `from` / `to` match `station.dfNodeId`. `variant`: `"emphasis"` | `"security"` | `"dashed"` | `"default"`. Optional `label` is rendered inside upstream/downstream neighbor pills in View 1's dossier deck.

## 3. `techArch` (Map 2: Tech Architecture & Boundaries)
- Directly compatible with `archify` architecture `candidate.json`!
- `components[]`:
  ```json
  {
    "id": "gateway",
    "type": "security",
    "label": "网关与鉴权",
    "sublabel": "JWT · API Key · RBAC",
    "tag": "核心门禁",
    "pos": [295, 60],
    "size": [188, 74]
  }
  ```
  - `type`: `"frontend"` | `"backend"` | `"database"` | `"security"` | `"messagebus"` | `"cloud"` | `"external"`.
  - Keep `label` ≤ 10 CJK chars (or ≤ 18 ASCII chars), `sublabel` ≤ 22 ASCII/12 CJK chars, `tag` ≤ 5 CJK / 10 ASCII chars to guarantee `0` SVG overflow!
  - Organize `pos` onto a clean grid (e.g. 3–4 columns × 2–4 rows); `render_template.mjs` auto-normalizes column/row spacing cleanly!
- `boundaries[]`: `[{ "kind": "security-group" | "region", "label": "边界名称", "wraps": ["comp_id_1", ...] }]`
- `connections[]`: `[{ "id": "c1", "from": "comp_a", "to": "comp_b", "label": "HTTPS", "variant": "emphasis" }]`
- `compToStation`: `{ "<comp_id>": { "stationId": "q1", "role": "该组件在全链路中的职责说明" } }`

## 4. `businessFlow` (Map 3: End-to-End Business Swimlane Workflow)
- Directly compatible with `archify` workflow `candidate.json`!
- `lanes[]`: `[{ "id": "lane_id", "label": "泳道全名", "shortLabel": "泳道短名", "variant": "default" | "exception" }]` (2–4 lanes)
- `phases[]`: `[{ "id": "p1", "label": "阶段名", "fromCol": 0, "toCol": 1, "variant": "default" | "emphasis" | "dashed" }]`
- `groups[]`: `[{ "id": "g1", "label": "分组框名", "lane": "lane_id", "fromCol": 0, "toCol": 2, "variant": "dashed" | "emphasis" | "security" }]`
- `mainPath`: `["node_1", "node_2", ...]` (highlighted when user clicks the `main` filter pill)
- `nodes[]`:
  ```json
  {
    "id": "route_mode",
    "lane": "rag_agent",
    "col": 3,
    "type": "backend",
    "label": "模式路由与规划",
    "sublabel": "快速 RAG / ReAct",
    "tag": "分流枢纽",
    "sources": [
      { "path": "internal/service/qa.go", "line": 200, "end_line": 242, "label": "装配入口" }
    ]
  }
  ```
  Keep `label` ≤ 8 CJK chars, `sublabel` ≤ 20 ASCII/11 CJK chars, `tag` ≤ 5 CJK chars (card width `166px`).
- `edges[]`: `[{ "id": "e1", "from": "n1", "to": "n2", "label": "流向说明", "variant": "emphasis" | "security" | "dashed" | "default", "via": [[x,y], ...] (optional) }]`
- `nodeToLearn`:
  ```json
  {
    "route_mode": {
      "stationId": "q4",
      "altStationId": "a4",
      "wbModuleId": "agent",
      "tracks": ["main", "guard"],
      "role": "该业务节点的中文说明"
    }
  }
  ```
- `trackFilters[]`: `[{ "id": "all", "label": "全部业务流 (N 节点)" }, { "id": "main", "label": "⚡ 主干路径" }, ...]`

## 5. `overviewDossiers` (View 1: Full-Node 6-Dimension Deep Dossiers)
Every node across all 3 View 1 blueprints MUST have an independent, non-duplicated 6-dimension dossier entry:
- `overviewDossiers.dataflow`: keyed by **every** `station.id` (1-to-1 exact match, 0 missing, 0 orphan keys)
- `overviewDossiers.techarch`: keyed by **every** `techArch.components[].id` (1-to-1 exact match)
- `overviewDossiers.businessflow`: keyed by **every** `businessFlow.nodes[].id` (1-to-1 exact match)

### Strict Perspective Separation (Zero Copy-Paste Rule)
Even when two nodes across different maps touch the same underlying subsystem, their dossiers **MUST NEVER** copy-paste or share identical `role` / prose:
| Map | Key Space | Mandatory Perspective & Prefix Convention |
| :--- | :--- | :--- |
| **图一 · `dataflow`** | `station.id` | Focus on **data payload transformation, field evolution, serialization & protocol handoffs** (e.g. `【数据流 1-1 站】...`) |
| **图二 · `techarch`** | `component.id` | Focus on **architectural layering, middleware choices, trust boundaries & outage blast radius** (e.g. `【技术组件 · ...】...`) |
| **图三 · `businessflow`** | `bizNode.id` | Focus on **swimlane ownership, user-facing SLA/symptoms & exception routing branches** (e.g. `【<泳道名> · Phase N】...`) |

### Multi-Archetype Mapping Guide (4-Archetype Open-Source Adaptation)
To ensure `repo-mastery-html` works seamlessly across ANY open-source project (not just backend web services), adapt the terminology of Maps 1–3, `io` contracts, and `P0 / P1` failure scenarios to the target repository's archetype:

| Archetype (Examples) | Map 1 · `dataflow` (Data / State Evolution) | Map 2 · `techarch` (Boundaries & Blast Radius) | Map 3 · `businessflow` (Caller Lanes & SLA) | Typical `P0 / P1` Failure Semantics |
| :--- | :--- | :--- | :--- | :--- |
| **Web / Backend Service**<br/>(API · 微服务 · RAG · DB) | HTTP/gRPC/MQ 入参 → Context/DTO → 查询/计算 → 落库/SSE 输出 | 网关层 / 编排层 / 存储层 / 外部依赖边界 / 多副本一致性半径 | 前端/调用端 → 路由鉴权 → 核心处理 → 降级/异常重试泳道 | **P0**: 越权泄漏、主链路 500、数据损坏<br/>**P1**: 缓存穿透、降级超时、队列积压 |
| **Frontend Framework / UI**<br/>(React · Vue · Editor · State) | Props/Event/Action → Virtual DOM/AST → Fiber/Reconciler → DOM Commit | DSL/编译期层 / 运行时调度层 / 渲染器适配层 / Hooks 状态边界 | 用户交互事件 → 状态派生/Diff → 帧调度提交 → ErrorBoundary 回退 | **P0**: 白屏崩溃、状态死循环、XSS 注入<br/>**P1**: 掉帧卡顿、水合不一致、内存泄漏 |
| **CLI / Compiler / Build Tool**<br/>(Vite · esbuild · CLI · Linter) | CLI Flags/源文件 → Lexer/AST/IR → 优化/Resolve/Bundle → 产物/退出码 | CLI 入口层 / 插件管线 / AST 编译器 / 打包产物与缓存边界 | 命令行触发 → 配置合并与插件钩子 → 核心编译 → 报错诊断与清理 | **P0**: 静默产出错误代码、破坏源码、退出码失真<br/>**P1**: 增量缓存失效、源码映射偏移、报错模糊 |
| **SDK / Algorithm / AI Engine**<br/>(vLLM · PyTorch · Client · Crypto) | Raw Tensor/Byte/Config → Batch/Schedule → Kernel/Algorithm → Output/Stream | Public API 门面 / 调度与内存池 / 底层算子/FFI / 硬件或网络边界 | 调用方初始化 → 批处理调度与显存/连接分配 → 推理/计算 → 取消与降级 | **P0**: OOM 崩溃、数值错乱/NaN、并发竞争损坏<br/>**P1**: 尾延迟抖动、连接/显存碎片化、降级退化 |

### Per-Node Dossier Schema & Hard Thresholds (`verify-dossiers` & `build` enforced)
```json
{
  "role": "全局唯一的一句话模块定位与职责（严禁跨三图任何节点重复，支持 **加粗** 与 `代码`）",
  "whyNeed": "为什么架构/链路/业务上必须独立存在这个模块？如果删掉或耦合进其他层会发生什么系统性问题？",
  "problemsSolved": [
    "重点解决的 **工程痛点 1**（至少 2 条非空条目）",
    "重点解决的 **工程痛点 2**"
  ],
  "principles": [
    {
      "title": "核心实现机制 1（至少 3 条）",
      "detail": "紧扣源码内部结构、算法、锁/并发策略或状态机流转的深度解释。",
      "anchor": "path/to/file.go:L10-L45"
    },
    { "title": "核心实现机制 2", "detail": "...", "anchor": "path/to/file2.go:L20-L60" },
    { "title": "核心实现机制 3", "detail": "...", "anchor": "path/to/file3.go:L5-L35" }
  ],
  "failureScenarios": [
    {
      "severity": "P0",
      "trigger": "典型故障诱因（P0 致命阻断/安全事故，固定 2 组）",
      "prodImpact": "上线后的真实故障表象、影响面与 SLA/爆炸半径",
      "fallbackOrCheck": "线上兜底策略、熔断保护与一线日志/指标排查入口"
    },
    {
      "severity": "P1",
      "trigger": "典型故障诱因（P1 降级/积压/局部异常）",
      "prodImpact": "降级表现与受影响边界",
      "fallbackOrCheck": "降级回退与定位排查方式"
    }
  ],
  "io": {
    "inSummary": "一句话总结传入结构/请求/事件",
    "inFields": [
      { "name": "field_a", "type": "string", "desc": "传入字段含义（至少 2 个字段）" },
      { "name": "field_b", "type": "object", "desc": "传入字段含义" }
    ],
    "transform": "概括本模块对输入到输出的加工转换核心动作",
    "outSummary": "一句话总结传出结构/产物/响应",
    "outFields": [
      { "name": "out_a", "type": "string", "desc": "传出字段含义（至少 2 个字段）" },
      { "name": "out_b", "type": "int", "desc": "传出字段含义" }
    ]
  },
  "examPoints": [
    "高频考点标签1（严格 3–5 个）",
    "高频考点标签2",
    "高频考点标签3"
  ],
  "interviewQuestions": [
    {
      "q": "面试官高频追问 1（固定 2 道）",
      "focus": "考察的核心工程/架构能力维度",
      "a": "结构化、有源码与指标依据的高分参考答法（UI 默认折叠，点击展开自测）"
    },
    {
      "q": "面试官高频追问 2",
      "focus": "考察维度",
      "a": "高分参考答法"
    }
  ]
}
```
> **Validation Rules Summary**:
> - `role`: non-empty string, **100% globally unique across all 3 maps**
> - `whyNeed`: non-empty string
> - `problemsSolved[]`: length `>= 2`
> - `principles[]`: length `>= 3`, each with non-empty `title`, `detail`, `anchor`
> - `failureScenarios[]`: exact length `2`, each with `severity` in `["P0", "P1"]` and non-empty `trigger`, `prodImpact`, `fallbackOrCheck`
> - `io`: non-empty `inSummary`, `transform`, `outSummary`, `inFields.length >= 2`, `outFields.length >= 2`
> - `examPoints[]`: length `3..5`
> - `interviewQuestions[]`: exact length `2`, each with non-empty `q`, `focus`, `a`

## 6. `stations[]` (View 2: Progressive Station-by-Station Studio)
Every station MUST include ALL of the following fields (strictly validated by `build`):
```json
{
  "id": "q1",
  "codeLabel": "1-1",
  "flowId": "flow_qa",
  "stage": 0,
  "row": 1,
  "dfNodeId": "user_query",
  "dfLabel": "多端提问请求",
  "dfSublabel": "Web · CLI · MCP",
  "dfTag": "问答入口",
  "nodeType": "frontend",
  "title": "多端提问接入：一条消息是怎么发进系统的？",
  "duration": "15 分钟",
  "stars": 5,
  "techCompIds": ["clients", "gateway"],
  "wbTarget": { "moduleId": "m_router", "nodeId": "r_entry" },
  "inputSpec": "简明一句话：上一站传来的输入",
  "outputSpec": "简明一句话：加工后吐给下一站",
  "analogy": "简明类比摘要",
  "whyBlock": {
    "painPoint": "❓ 解决什么真实痛点（线上事故/工程矛盾）",
    "analogy": "🧠 0 基础生活化类比（支持 **加粗** 和 `代码`）",
    "avoidRabbitHole": "🛑 新手防偏提示（指明必看文件与先跳过的外围胶水）"
  },
  "ioContract": {
    "inType": "进入协议 / 结构体名",
    "inFields": [
      { "name": "field_name", "type": "string", "desc": "字段含义" }
    ],
    "inSample": "真实、具体的 JSON / HTTP / Struct / SQL 进入报文样例",
    "transformSteps": [
      "第 1 步核心变换说明",
      "第 2 步核心变换说明",
      "第 3 步核心变换说明"
    ],
    "outType": "传出协议 / 结构体名",
    "outFields": [
      { "name": "out_field", "type": "object", "desc": "输出字段含义" }
    ],
    "outSample": "真实、具体的 JSON / SSE / Struct / SQL 传出报文样例"
  },
  "files": [
    {
      "id": "f1",
      "label": "router.go",
      "path": "internal/router/router.go",
      "syntax": "go", // optional; auto-inferred: go, py, ts/tsx, js/jsx, rs, java, kt, cpp/c, rb, php, cs, swift, proto, html/vue/svelte, css/scss, sql, yaml, sh, toml, makefile, or plain
      "sliceStart": 174,
      "sliceEnd": 211
    }
  ],
  "steps": [
    {
      "id": "q1_s1",
      "order": 1,
      "label": "短标题(≤8字)",
      "sublabel": "短副标题(≤18字符)",
      "tag": "短标签(≤5字)",
      "type": "frontend",
      "edgeLabel": "短边标(≤4字)",
      "fileId": "f1",
      "startLine": 174,
      "endLine": 195,
      "explain": "🔍 本步源码精讲",
      "pitfall": "⚠️ 线上避坑与事故边界"
    }
  ],
  "quiz": {
    "question": "基于真实源码设计的 1 题闯关自测",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctIndex": 1,
    "explanation": "解析说明"
  },
  "interviewQ": "面试官高频追问",
  "interviewA": "30 秒高分口述模板"
}
```
> **SVG Sizing Guardrails** (`0` overflow guarantee):
> - Station card in Map 1 (`w=196`): `dfLabel` ≤ 8 CJK chars, `dfSublabel` ≤ 22 ASCII/12 CJK chars, `dfTag` ≤ 5 CJK chars.
> - Micro-step card in View 2 (`w=204`): `label` ≤ 8 CJK chars, `sublabel` ≤ 22 ASCII/12 CJK chars, `tag` ≤ 5 CJK chars.

## 7. `workbenchModules[]` (View 3: Annotated Directory Tree + Module Drill-Down)
- Module `0` (`id: "dir_tree"`, `kind: "tree"`, `pinnedTab: true`):
  - Single file with `syntax: "tree"` and `virtualLines: [...]` — the complete Chinese-annotated project directory tree (with `# 中文说明` on every directory, file, and key HTTP/CLI route!).
  - `nodes[]`: 5–9 overview module cards arranged in a clean 3-column grid (`w=228, h=86`, `x: 34 / 316 / 598`, `y: 44 / 194 / 344`, `viewBox: [860, 474]`), each mapping a line range (`startLine..endLine`) in `virtualLines` AND holding `jumpTo: { moduleId, nodeId, label }` for 1-click drill-down!
- Modules `1..K` (dedicated flow diagrams for each overview module):
  - `parentOverviewNodeId`: matching overview card ID so `← 返回全景` re-focuses it.
  - `stationId`: paired Flow Station ID for the `🚆 配套全链路第 X-Y 站` top-bar bridge.
  - `files[]`: real verbatim source slices (`path`, `sliceStart`, `sliceEnd`, `syntax`) — automatically hydrated AND annotated line-by-line in Chinese!
  - `nodes[]` & `edges[]`: clean orthogonal flow diagram (`node.w = 228, node.h = 86`), each node having `deepDive`, `pitfall`, `interviewQ`, `interviewA`.

## 8. `pitch[]`, `skipGuide[]`, `exam[]` (View 4: Interview Sprint)
- `pitch[]`: 4 structured cards (`step`, `title`, `time`, `goal`, `script`) covering a 3-minute project overview.
- `skipGuide[]`: 3–6 rows (`module`, `skip`, `keep`) telling learners which peripheral glue code to skip vs which core abstractions/stations to master.
- `exam[]`: 6–10 mastery exam questions (`id`, `q`, `a`, `stationId`) with 1-click jump back to the exact station!

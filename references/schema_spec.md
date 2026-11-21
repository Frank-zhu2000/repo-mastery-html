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
  "stations": [ ... ],
  "workbenchModules": [ ... ],
  "pitch": [ ... ],
  "skipGuide": [ ... ],
  "exam": [ ... ]
}
```

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
      { "from": "df_node_a", "to": "df_node_b", "variant": "emphasis" }
    ]
  }
  ```
  `from` / `to` match `station.dfNodeId`. `variant`: `"emphasis"` | `"security"` | `"dashed"` | `"default"`.

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

## 5. `stations[]` (View 2: Progressive Station-by-Station Studio)
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
      "syntax": "go",
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

## 6. `workbenchModules[]` (View 3: Annotated Directory Tree + Module Drill-Down)
- Module `0` (`id: "dir_tree"`, `kind: "tree"`, `pinnedTab: true`):
  - Single file with `syntax: "tree"` and `virtualLines: [...]` — the complete Chinese-annotated project directory tree (with `# 中文说明` on every directory, file, and key HTTP/CLI route!).
  - `nodes[]`: 5–9 overview module cards arranged in a clean 3-column grid (`w=228, h=86`, `x: 34 / 316 / 598`, `y: 44 / 194 / 344`, `viewBox: [860, 474]`), each mapping a line range (`startLine..endLine`) in `virtualLines` AND holding `jumpTo: { moduleId, nodeId, label }` for 1-click drill-down!
- Modules `1..K` (dedicated flow diagrams for each overview module):
  - `parentOverviewNodeId`: matching overview card ID so `← 返回全景` re-focuses it.
  - `stationId`: paired Flow Station ID for the `🚆 配套全链路第 X-Y 站` top-bar bridge.
  - `files[]`: real verbatim source slices (`path`, `sliceStart`, `sliceEnd`, `syntax`) — automatically hydrated AND annotated line-by-line in Chinese!
  - `nodes[]` & `edges[]`: clean orthogonal flow diagram (`node.w = 228, node.h = 86`), each node having `deepDive`, `pitfall`, `interviewQ`, `interviewA`.

## 7. `pitch[]`, `skipGuide[]`, `exam[]` (View 4: Interview Sprint)
- `pitch[]`: 4 structured cards (`step`, `title`, `time`, `goal`, `script`) covering a 3-minute project overview.
- `skipGuide[]`: 3–6 rows (`module`, `skip`, `keep`) telling learners which peripheral glue code to skip vs which core abstractions/stations to master.
- `exam[]`: 6–10 mastery exam questions (`id`, `q`, `a`, `stationId`) with 1-click jump back to the exact station!

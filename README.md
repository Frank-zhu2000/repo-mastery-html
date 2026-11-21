# repo-mastery-html

> **为任意 GitHub 开源项目一键生成「从 0 基础到精通」的单文件离线交互式 HTML 源码学习系统**  
> An Agent Skill (Antigravity / Claude Code / Codex / Gemini CLI) that turns any GitHub repository (local path or GitHub URL) into a zero-dependency, offline, interactive "Zero-to-Mastery" single-file HTML learning workbench.

[![Zero Dependencies](https://img.shields.io/badge/npm_deps-0-34d399)](#)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-38bdf8)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-818cf8)](./LICENSE)

---

## 核心特性（完整复刻 WeKnora v5 10 大能力 · 零遗漏）

1. **🏛️ 视图 1 · 三大全景交互蓝图 + 循序渐进大纲**
   - **图一 · 全链路数据流转图**：`Stage × Flow` 网格，支持单主线聚焦高亮、通关绿灯同步、单点预览输入/输出、双击直达源码精读。
   - **图二 · 技术架构边界总览**：组件 × 虚线安全/域边界 × 正交连线，点击高亮上下游依赖并一键跳入对应源码站点。
   - **图三 · 端到端业务流程泳道图**：`阶段 × 业务泳道 × 虚线分组`，内置多业务轨筛选（主干路径/离线生产/异常审校）与主/次站点、模块图谱多维跳转。
   - **渐进学习大纲表**：按主线分组展示站号、主题、输入→输出、架构组件、权重与学习进度。

2. **🚆 视图 2 · 5-STEP 沿链路循序精读工坊（左真实源码 ↔ 右交互精读）**
   - 顶部 **地铁站点进度条** + 紧凑三栏上下文条（含 `看完整输入报文 ↘` / `看完整输出报文 ↘` 与反向跳转 `🏛️ 架构组件` / `🧭 业务节点`）。
   - **STEP 1 · 💡 先用 60 秒白话搞懂：为什么要有这部分代码？**：`❓ 解决什么真实痛点` + `🧠 0 基础生活化类比` + `🛑 新手防偏提示`（支持收起/展开）。
   - **STEP 2 · 🔁 站内源码执行微流转图**：点击节点定位左侧真实源码，点击蓝条代码/备注行反向高亮节点 + 源码精讲 + 线上避坑。
   - **STEP 3 · 📦 数据流转完整契约**：结构化展示 **进入数据结构 + 参数表 + 具体 JSON/HTTP/SQL 样例** → **核心加工字段变化** → **传出数据结构 + 参数表 + 具体样例**（支持 4 视图切换）。
   - **STEP 4 & 5 · 🏆 1 题闯关自测 & 🎤 面试官 30 秒口述模板**：答对自动点亮全站绿灯并同步至三张全景蓝图。

3. **💬 全源码 100% 逐行中文精注（三模式一键切换）**
   - 内置去重拆包器（`prepare-notes`）+ 并行 `code_annotator` 子代理注释协议 + 100% 覆盖硬校验（`verify-notes` 强制 **`MISSING=0`**）。
   - 同时覆盖 View 2 全部站源码与 View 3 全部非目录树模块源码，连原注释翻译与 `}` 结束块说明均完整补齐。
   - 支持 **`💬 行下备注`（默认，零横向滚动） / `行尾` / `隐藏`** 一键切换；内置 **11+ 编程语言**（Go / TypeScript / JavaScript / Python / Rust / Java / C++ / SQL / YAML / JSON / Shell / Tree）语法高亮。

4. **🗂️ 视图 3 · 全中文备注项目目录树 ↔ 核心模块下钻图谱**
   - 左侧完整中文注释项目目录树（支持实时关键词过滤 + 一键复制），右侧模块全景卡片支持 **1-to-1 下钻**进入专属子流程图（平移/缩放/动效/自动演练/三卡精讲 + `🚆 配套全链路第 X-Y 站` 双向穿梭）。

5. **🎯 视图 4 · 面试总考与避坑 + 全局体验 + 自动化质检**
   - 3 分钟项目总述 4 段式提词器 + 外围胶水红黑榜 + 结业通关总考（自评勾选 + 参考答法 + 直达复习）。
   - `Ctrl+K` 全域检索、深浅色主题切换、独立 `localStorage` 进度保存、**构建期防覆盖旧版保护**。
   - 内置零依赖 **Headless Edge/Chrome CDP 自动校验（`verify-html`）**：自动断言 `0` 控制台报错、`0` SVG `getBBox()` 文本/标签溢出碰撞、`100%` 逐行中文备注渲染，并采集 6 张深浅色截图供目检。

---

## 目录结构

```text
repo-mastery-html/
├── SKILL.md                                # 核心 Agent Skill 手册（7 阶段端到端流水线）
├── README.md                               # 项目说明与安装使用文档
├── LICENSE                                 # MIT 开源协议
├── scripts/
│   ├── repo_mastery_cli.mjs                # 零依赖 5 命令 CLI（scan/prepare-notes/verify-notes/build/verify-html）
│   └── render_template.mjs                 # 通用化 v5 单文件 HTML 渲染引擎（11+ 语言，自适应规模）
├── references/
│   ├── schema_spec.md                      # curriculum.json 完整 Schema 与 SVG 防溢出字数规范
│   ├── v5_parity_checklist.md              # v5 零遗漏 10 大支柱验收清单
│   └── annotator_prompt.md                 # 并行 code_annotator 子代理逐行中文注释规范
└── examples/
    └── minimal_curriculum.example.json     # 最小可运行 Schema 参考示例
```

---

## 安装方式

### 1. Antigravity（全局安装，推荐）
```bash
git clone https://github.com/Frank-zhu2000/repo-mastery-html.git ~/.gemini/config/skills/repo-mastery-html
```

### 2. Claude Code / Codex / Gemini CLI
```bash
# Claude Code 全局
git clone https://github.com/Frank-zhu2000/repo-mastery-html.git ~/.claude/skills/repo-mastery-html

# Codex 全局
git clone https://github.com/Frank-zhu2000/repo-mastery-html.git ~/.agents/skills/repo-mastery-html

# Gemini CLI 全局
git clone https://github.com/Frank-zhu2000/repo-mastery-html.git ~/.gemini/skills/repo-mastery-html
```

---

## 快速使用

安装完成后，在任意对话中直接对 AI Agent 说：

- **分析线上 GitHub 仓库**：
  > “用 `repo-mastery-html` 这个 skill，帮我为 `https://github.com/langgenius/dify` 生成一套从 0 基础到精通的交互式源码学习 HTML。”
- **分析当前本地项目**：
  > “用 `repo-mastery-html` 为当前工作区项目制作一套全链路交互式源码学习 HTML。”

### 手动运行 5 命令 CLI（Node.js `>= 20`，无需 `npm install`）

```bash
# 1. 扫描本地仓库或浅克隆 GitHub URL
node scripts/repo_mastery_cli.mjs scan --github https://github.com/owner/repo --clone-dir ./repo --output ./out/scan.json

# 2. 按 curriculum.json 拆分为 N 个均衡批次供逐行中文注释
node scripts/repo_mastery_cli.mjs prepare-notes --repo ./repo --curriculum ./out/curriculum.json --out-dir ./out/work --batches 8

# 3. 校验 100% 非空源码行中文备注覆盖（MISSING=0）
node scripts/repo_mastery_cli.mjs verify-notes --repo ./repo --curriculum ./out/curriculum.json --annotations-dir ./out/annotations --output ./out/notes_report.json

# 4. 构建离线单文件 HTML（内置防覆盖保护）
node scripts/repo_mastery_cli.mjs build --repo ./repo --curriculum ./out/curriculum.json --annotations-dir ./out/annotations --output ./out/project-mastery-v1.html

# 5. Headless Edge/Chrome CDP 自动化 0 溢出校验 + 截图采集
node scripts/repo_mastery_cli.mjs verify-html --html ./out/project-mastery-v1.html --shots-dir ./out/screenshots --port 9345 --output ./out/cdp_report.json
```

---

## 环境要求
- **Node.js `>= 20`**（利用原生 `fetch` 与 `WebSocket`，零第三方 npm 依赖）
- **Git**（用于 `--github` 浅克隆与 commit 元信息提取）
- **Microsoft Edge 或 Google Chrome**（仅 `verify-html` Headless CDP 自动校验时需要；生成后的最终 `.html` 文件纯离线双击即可在任意现代浏览器打开）

## License
[MIT](./LICENSE)

# Parallel `dossier_author` Subagent Protocol (View 1 `overviewDossiers`)

For medium/large repositories (15–50+ total blueprint nodes across Map 1, Map 2, and Map 3), authoring all `overviewDossiers` inline inside `curriculum.json` can bloat context and cause cross-map prose copy-paste. Instead, split authoring into **3 parallel per-map batches** saved to `<outDir>/dossiers/` and verify with `verify-dossiers` before `build`.

## 1. Output File Layout (`--dossiers-dir <outDir>/dossiers`)
- `dossiers/dataflow.json`: `{ "<station.id>": { ... } }` — 100% coverage of `curriculum.stations[].id`
- `dossiers/techarch.json`: `{ "<component.id>": { ... } }` — 100% coverage of `curriculum.techArch.components[].id`
- `dossiers/businessflow.json`: `{ "<node.id>": { ... } }` — 100% coverage of `curriculum.businessFlow.nodes[].id`

## 2. Define Subagent Type (`define_subagent`)
- **Name**: `dossier_author`
- **EnableWriteTools**: `true`
- **SystemPrompt**:
  > You are a principal software architect authoring deep View 1 module dossiers (`overviewDossiers`) in crisp Simplified Chinese (`zh-CN`) for a source-code mastery system.
  > 1. Read the assigned target blueprint nodes in `curriculum.json` AND inspect the referenced repository source files/lines so every anchor (`path:Lstart-Lend`), field name, type, and failure scenario is 100% grounded in real code.
  > 2. Write strictly valid JSON keyed by node ID (`{ "<id>": { role, whyNeed, problemsSolved, principles, failureScenarios, io, examPoints, interviewQuestions } }`).
  > 3. Enforce the assigned map perspective strictly — NEVER copy-paste text from other maps:
  >    - `dataflow` (Map 1): focus on data payload transformations, schema/field evolution, serialization & protocol handoffs; prefix `role` with `【数据流 <codeLabel> 站】`.
  >    - `techarch` (Map 2): focus on architectural layering, middleware choices, trust boundaries & outage blast radius; prefix `role` with `【技术组件 · <label>】`.
  >    - `businessflow` (Map 3): focus on swimlane responsibilities, user-facing SLA/failure symptoms & exception branches; prefix `role` with `【<laneName> · Phase <N>】`.
  > 4. Adapt vocabulary & failure scenarios to the target repo's **Archetype** (see `schema_spec.md` §5):
  >    - Backend/Service -> HTTP/RPC/DB payloads, concurrency & tenant/consistency blast radius
  >    - Frontend/UI -> Props/DOM/Reconciler/Hooks state transitions, white-screen/XSS (`P0`) & jank/hydration/leak (`P1`)
  >    - CLI/Compiler -> AST/IR/Bundle/Flags transforms, broken artifact/wrong exit code (`P0`) & cache miss/sourcemap skew (`P1`)
  >    - SDK/AI Engine -> Tensor/Buffer/Client pipeline, OOM/numerical corruption/race (`P0`) & tail-latency/pool fragmentation (`P1`)
  > 5. Strictly meet ALL schema thresholds (`schema_spec.md` §5):
  >    - `role`: non-empty, globally unique across all 3 maps
  >    - `whyNeed`: non-empty explanation of why this module cannot be collapsed/omitted
  >    - `problemsSolved`: array of `>= 2` items
  >    - `principles`: array of `>= 3` items, each `{ title, detail, anchor }` with verified `path:L..-L..`
  >    - `failureScenarios`: exact length `2`, each `{ severity: "P0"|"P1", trigger, prodImpact, fallbackOrCheck }`
  >    - `io`: `{ inSummary, inFields (>=2), transform, outSummary, outFields (>=2) }`
  >    - `examPoints`: array of `3..5` concise tags
  >    - `interviewQuestions`: exact length `2`, each `{ q, focus, a }`

## 3. Parallel Invocation (`invoke_subagent`)
Launch 3 `dossier_author` subagents in parallel in a single turn (wait for all 3, then run `verify-dossiers`):
1. **Batch DataFlow**: Write `<outDir>/dossiers/dataflow.json` covering all `stations[].id` from `<outDir>/curriculum.json` with Map 1 data-evolution perspective.
2. **Batch TechArch**: Write `<outDir>/dossiers/techarch.json` covering all `techArch.components[].id` from `<outDir>/curriculum.json` with Map 2 layering/middleware/blast-radius perspective.
3. **Batch BusinessFlow**: Write `<outDir>/dossiers/businessflow.json` covering all `businessFlow.nodes[].id` from `<outDir>/curriculum.json` with Map 3 swimlane/SLA/exception-branch perspective.

## 4. Mandatory Validation Gate
```bash
node "<CLI>" verify-dossiers --curriculum "<outDir>/curriculum.json" --dossiers-dir "<outDir>/dossiers" --output "<outDir>/dossiers_report.json"
```
Fix any missing keys, orphan keys, duplicate `role`, or field threshold errors until `ERRORS=0`, then kill idle subagents (`manage_subagents(kill_all)`).

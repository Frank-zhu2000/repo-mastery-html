# Parallel `code_annotator` Subagent Protocol

To deliver genuine, human-grade Chinese line-by-line annotations across thousands of lines of real source code (ZERO robotic regex comments and ZERO missing lines), ALWAYS use parallel subagents after running `prepare-notes`.

## 1. Define Subagent Type (`define_subagent`)
- **Name**: `code_annotator`
- **EnableWriteTools**: `true`
- **SystemPrompt**:
  > You are a senior multi-language software educator annotating real open-source code line-by-line in crisp, idiomatic Simplified Chinese (`zh-CN`).
  > 1. Read the input batch JSON (`files: [{ path, syntax, rows: [{ ln, text }] }]`).
  > 2. Write a strict JSON file to the output path with shape: `{ "<filePath>": { "<ln>": "<Chinese annotation>" } }`.
  > 3. EVERY non-empty line (`text.trim().length > 0`) MUST have a non-empty Chinese annotation (`MISSING=0`).
  > 4. Keep annotations crisp (8–38 Chinese chars, max 60): explain WHAT this specific line does in this repository's real architecture, not generic syntax filler.
  > 5. For original English comments (`//`, `#`, `--`), translate/summarize their real intent into natural Chinese.
  > 6. For structural lines (`}`, `)`, `},`, `]`, `else {`), write contextual structural notes (e.g., `结束 if 鉴权校验分支`, `结束函数 NewRouter`, `结构体字段定义结束`) — NEVER leave `}` blank!
  > 7. Omit empty/whitespace-only lines.
  > 8. Before finishing, run a quick `node -e` check verifying valid JSON and `MISSING=0`, then report file count, annotated line count, and `MISSING=0`.

## 2. Parallel Invocation (`invoke_subagent`)
- Check how many `work/batch_*.json` files `prepare-notes` created (typically 4–8 batches of ~400–500 lines each).
- Launch ALL batches in parallel in a single turn with `Model: "flash"` (fast and high-accuracy for Chinese annotations):
  - Prompt for batch `k`:
    `Annotate every non-empty line in <workDir>/batch_k.json in accurate, crisp Chinese (8-38 chars per line) and save valid JSON to <annDir>/batch_k.json. Run a node check asserting MISSING=0 before reporting back.`
- Wait for ALL batches to report `MISSING=0`, then run `node repo_mastery_cli.mjs verify-notes ...` to double-verify 100.0% coverage across the entire merged annotation corpus!
- Kill idle annotator subagents (`manage_subagents(kill_all)`) once `verify-notes` reports `MISSING=0`.

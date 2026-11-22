#!/usr/bin/env node
// repo-mastery-html CLI Engine (Node.js >= 20, zero npm dependencies)
// Subcommands: scan | prepare-notes | verify-notes | verify-dossiers | build | verify-html

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { renderMasteryHtml } from './render_template.mjs';

function parseArgs(argv) {
  const cmd = argv[2];
  const opts = {};
  for (let i = 3; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith('--')) {
      const key = tok.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) opts[key] = true;
      else { opts[key] = next; i++; }
    }
  }
  return { cmd, opts };
}

function die(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

function readJson(p) {
  if (!fs.existsSync(p)) die(`File not found: ${p}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readRepoLines(repoRoot, relPath, startLine, endLine) {
  const full = path.join(repoRoot, relPath);
  if (!fs.existsSync(full)) die(`Missing source file in repo: ${full}`);
  const all = fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const s = Math.max(1, Number(startLine));
  const e = Math.min(all.length, Number(endLine));
  if (!Number.isFinite(s) || !Number.isFinite(e) || s > e) {
    die(`Invalid line range ${startLine}-${endLine} for ${relPath} (total lines: ${all.length})`);
  }
  return { relPath, startLine: s, endLine: e, lines: all.slice(s - 1, e) };
}

function inferSyntax(filePath, explicit) {
  if (explicit) return explicit;
  const ext = path.extname(filePath).toLowerCase().slice(1);
  if ([
    'go', 'py', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'rs', 'java', 'kt',
    'cpp', 'c', 'cc', 'cxx', 'h', 'hpp', 'rb', 'php', 'cs', 'swift', 'proto',
    'html', 'xml', 'vue', 'svelte', 'css', 'scss', 'less', 'sql', 'yaml', 'yml',
    'json', 'sh', 'bash', 'zsh', 'toml',
  ].includes(ext)) return ext;
  const base = path.basename(filePath).toLowerCase();
  if (base.startsWith('dockerfile') || base === 'cmakelists.txt') return 'sh';
  if (base === 'makefile' || base === 'gnumakefile' || base === 'justfile') return 'makefile';
  return 'plain';
}

function collectUniqueFileSlices(repoRoot, curriculum) {
  const fileMap = new Map();
  const addFile = (f) => {
    if (!f || f.virtualLines || f.syntax === 'tree') return;
    const syntax = inferSyntax(f.path, f.syntax);
    if (!fileMap.has(f.path)) fileMap.set(f.path, { path: f.path, syntax, lineSet: new Set() });
    const entry = fileMap.get(f.path);
    const sliced = readRepoLines(repoRoot, f.path, f.sliceStart, f.sliceEnd);
    for (let ln = sliced.startLine; ln <= sliced.endLine; ln++) entry.lineSet.add(ln);
  };
  (curriculum.stations || []).forEach((st) => (st.files || []).forEach(addFile));
  (curriculum.workbenchModules || []).forEach((m) => (m.files || []).forEach(addFile));
  return fileMap;
}

function loadAnnotationsDir(annDir) {
  const merged = {};
  if (!annDir || !fs.existsSync(annDir)) return merged;
  const files = fs.readdirSync(annDir).filter((f) => f.endsWith('.json')).sort();
  for (const bf of files) {
    const full = path.join(annDir, bf);
    let obj;
    try { obj = JSON.parse(fs.readFileSync(full, 'utf8')); }
    catch (err) { die(`Invalid JSON in annotation file ${full}: ${err.message}`); }
    for (const [filePath, lineMap] of Object.entries(obj)) {
      if (!merged[filePath]) merged[filePath] = {};
      Object.assign(merged[filePath], lineMap);
    }
  }
  return merged;
}

function mergeOverviewDossiers(curriculum, dossiersDir) {
  let hasAny = Boolean(curriculum.overviewDossiers && typeof curriculum.overviewDossiers === 'object');
  const merged = {
    dataflow: { ...(curriculum.overviewDossiers?.dataflow || {}) },
    techarch: { ...(curriculum.overviewDossiers?.techarch || {}) },
    businessflow: { ...(curriculum.overviewDossiers?.businessflow || {}) },
  };
  if (dossiersDir) {
    const dir = path.resolve(dossiersDir);
    if (!fs.existsSync(dir)) die(`Dossiers directory not found: ${dir}`);
    let loadedFiles = 0;
    for (const key of ['dataflow', 'techarch', 'businessflow']) {
      const fp = path.join(dir, `${key}.json`);
      if (!fs.existsSync(fp)) continue;
      let obj;
      try { obj = JSON.parse(fs.readFileSync(fp, 'utf8')); }
      catch (err) { die(`Invalid JSON in dossier file ${fp}: ${err.message}`); }
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        die(`Dossier file ${fp} must export a top-level JSON object keyed by node ID`);
      }
      Object.assign(merged[key], obj);
      loadedFiles++;
      hasAny = true;
    }
    if (loadedFiles === 0) {
      die(`Dossiers directory "${dir}" contains none of dataflow.json, techarch.json, businessflow.json`);
    }
  }
  return hasAny ? merged : null;
}

function isNonEmptyStr(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateOverviewDossiers(curriculum, dossiers, { allowLegacyOverview = false } = {}) {
  const specs = [
    { name: 'dataflow', expectedIds: (curriculum.stations || []).map((s) => s.id) },
    { name: 'techarch', expectedIds: (curriculum.techArch?.components || []).map((c) => c.id) },
    { name: 'businessflow', expectedIds: (curriculum.businessFlow?.nodes || []).map((n) => n.id) },
  ];
  const expectedCounts = {
    dataflow: specs[0].expectedIds.length,
    techarch: specs[1].expectedIds.length,
    businessflow: specs[2].expectedIds.length,
  };
  const totalExpected = expectedCounts.dataflow + expectedCounts.techarch + expectedCounts.businessflow;

  if (!dossiers) {
    if (allowLegacyOverview) {
      console.warn('WARNING: --allow-legacy-overview enabled; building without overviewDossiers (legacy View 1 detail bar).');
      return {
        skipped: true,
        expectedCounts,
        actualCounts: { dataflow: 0, techarch: 0, businessflow: 0 },
        totalExpected,
        uniqueRoles: 0,
        errors: [],
      };
    }
    return {
      skipped: false,
      expectedCounts,
      actualCounts: { dataflow: 0, techarch: 0, businessflow: 0 },
      totalExpected,
      uniqueRoles: 0,
      errors: ['Missing overviewDossiers! Provide overviewDossiers.{dataflow,techarch,businessflow} in curriculum.json, pass --dossiers-dir <dir>, or pass --allow-legacy-overview for legacy v5 JSON.'],
    };
  }

  const errors = [];
  const seenRoles = new Map();
  const actualCounts = { dataflow: 0, techarch: 0, businessflow: 0 };

  for (const spec of specs) {
    const map = dossiers[spec.name];
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      errors.push(`[${spec.name}] missing object map (expected ${spec.expectedIds.length} entries)`);
      continue;
    }
    const mapKeys = Object.keys(map);
    actualCounts[spec.name] = mapKeys.length;
    const expectedSet = new Set(spec.expectedIds);
    const orphanKeys = mapKeys.filter((k) => !expectedSet.has(k));
    if (orphanKeys.length > 0) {
      errors.push(`[${spec.name}] unexpected orphan dossier key(s): ${orphanKeys.join(', ')}`);
    }
    if (mapKeys.length !== spec.expectedIds.length) {
      errors.push(`[${spec.name}] expected ${spec.expectedIds.length} entries, got ${mapKeys.length}`);
    }

    for (const id of spec.expectedIds) {
      const d = map[id];
      const tag = `${spec.name}:${id}`;
      if (!d || typeof d !== 'object') {
        errors.push(`${tag} missing dossier`);
        continue;
      }
      if (!isNonEmptyStr(d.role)) {
        errors.push(`${tag} missing role`);
      } else {
        const trimmed = d.role.trim();
        if (seenRoles.has(trimmed)) {
          errors.push(`${tag} duplicate role (conflicts with ${seenRoles.get(trimmed)})`);
        } else {
          seenRoles.set(trimmed, tag);
        }
      }
      if (!isNonEmptyStr(d.whyNeed)) errors.push(`${tag} missing whyNeed`);
      if (!Array.isArray(d.problemsSolved) || d.problemsSolved.length < 2 || d.problemsSolved.some((p) => !isNonEmptyStr(p))) {
        errors.push(`${tag} problemsSolved must have >= 2 non-empty strings`);
      }
      if (!Array.isArray(d.principles) || d.principles.length < 3) {
        errors.push(`${tag} principles must have >= 3 items`);
      } else {
        d.principles.forEach((p, idx) => {
          if (!isNonEmptyStr(p?.title) || !isNonEmptyStr(p?.detail) || !isNonEmptyStr(p?.anchor)) {
            errors.push(`${tag} principles[${idx}] missing title/detail/anchor`);
          }
        });
      }
      if (!Array.isArray(d.failureScenarios) || d.failureScenarios.length !== 2) {
        errors.push(`${tag} failureScenarios must have length 2`);
      } else {
        d.failureScenarios.forEach((f, idx) => {
          if (!['P0', 'P1'].includes(f?.severity) || !isNonEmptyStr(f?.trigger) || !isNonEmptyStr(f?.prodImpact) || !isNonEmptyStr(f?.fallbackOrCheck)) {
            errors.push(`${tag} failureScenarios[${idx}] invalid severity(P0|P1)/trigger/prodImpact/fallbackOrCheck`);
          }
        });
      }
      const io = d.io;
      if (!io || !isNonEmptyStr(io.inSummary) || !isNonEmptyStr(io.transform) || !isNonEmptyStr(io.outSummary) ||
          !Array.isArray(io.inFields) || io.inFields.length < 2 || io.inFields.some((f) => !isNonEmptyStr(f?.name) || !isNonEmptyStr(f?.type) || !isNonEmptyStr(f?.desc)) ||
          !Array.isArray(io.outFields) || io.outFields.length < 2 || io.outFields.some((f) => !isNonEmptyStr(f?.name) || !isNonEmptyStr(f?.type) || !isNonEmptyStr(f?.desc))) {
        errors.push(`${tag} invalid io contract (inSummary/transform/outSummary + >=2 valid inFields & outFields)`);
      }
      if (!Array.isArray(d.examPoints) || d.examPoints.length < 3 || d.examPoints.length > 5 || d.examPoints.some((x) => !isNonEmptyStr(x))) {
        errors.push(`${tag} examPoints must have 3-5 non-empty items`);
      }
      if (!Array.isArray(d.interviewQuestions) || d.interviewQuestions.length !== 2) {
        errors.push(`${tag} interviewQuestions must have length 2`);
      } else {
        d.interviewQuestions.forEach((qa, idx) => {
          if (!isNonEmptyStr(qa?.q) || !isNonEmptyStr(qa?.focus) || !isNonEmptyStr(qa?.a)) {
            errors.push(`${tag} interviewQuestions[${idx}] missing q/focus/a`);
          }
        });
      }
    }
  }

  if (seenRoles.size !== totalExpected) {
    errors.push(`Expected ${totalExpected} globally unique dossier role strings, got ${seenRoles.size}`);
  }

  return {
    skipped: false,
    expectedCounts,
    actualCounts,
    totalExpected,
    uniqueRoles: seenRoles.size,
    errors,
  };
}

// =========================================================================
// SUBCOMMAND 1: scan
// =========================================================================
function cmdScan(opts) {
  let repoRoot = opts.repo ? path.resolve(opts.repo) : null;
  if (opts.github) {
    const repoName = opts.github.replace(/\.git$/, '').replace(/\/+$/, '').split('/').pop() || 'repo';
    const cloneDir = path.resolve(opts['clone-dir'] || path.join(process.cwd(), repoName));
    if (!fs.existsSync(cloneDir)) {
      fs.mkdirSync(path.dirname(cloneDir), { recursive: true });
      execFileSync('git', ['clone', '--depth', '1', opts.github, cloneDir], { stdio: 'inherit' });
    }
    repoRoot = cloneDir;
  }
  if (!repoRoot || !fs.existsSync(repoRoot)) die('Provide valid --repo <path> or --github <url>');

  const IGNORE = new Set(['.git', 'node_modules', 'dist', 'build', 'target', '__pycache__', '.venv', 'venv', '.next', '.nuxt', '.archify', '.repo-mastery', 'vendor', '.idea', '.vscode']);
  const extCounts = {};
  const topDirs = {};
  const entryCandidates = [];
  let totalFiles = 0;

  function walk(dir, depth) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      if (IGNORE.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
      if (ent.isDirectory()) {
        if (depth === 0) topDirs[ent.name] = { files: 0, subdirs: [] };
        else if (depth === 1) {
          const top = rel.split('/')[0];
          if (topDirs[top] && topDirs[top].subdirs.length < 25) topDirs[top].subdirs.push(ent.name);
        }
        if (depth < 5) walk(full, depth + 1);
      } else {
        totalFiles++;
        const ext = (path.extname(ent.name).toLowerCase() || '(no-ext)');
        extCounts[ext] = (extCounts[ext] || 0) + 1;
        const top = rel.includes('/') ? rel.split('/')[0] : '(root)';
        if (topDirs[top]) topDirs[top].files++;
        if (
          depth <= 3 && (
            /^(main|app|server|index|router|routes|cli|engine|pipeline|config|docker-compose|makefile|justfile|go\.mod|package\.json|pyproject\.toml|cargo\.toml|pom\.xml|build\.gradle(\.kts)?|cmakelists\.txt|gemfile|composer\.json|package\.swift|setup\.py)/i.test(ent.name) ||
            /\.csproj$/i.test(ent.name)
          )
        ) {
          entryCandidates.push(rel);
        }
      }
    }
  }
  walk(repoRoot, 0);

  let commit = '', branch = '', tag = '', remoteUrl = '';
  const gitTry = (args) => { try { return execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
  commit = gitTry(['rev-parse', '--short=9', 'HEAD']);
  branch = gitTry(['rev-parse', '--abbrev-ref', 'HEAD']);
  tag = gitTry(['describe', '--tags', '--abbrev=0']);
  remoteUrl = gitTry(['remote', 'get-url', 'origin']);

  let readmeHead = '';
  for (const cand of ['README.md', 'README_CN.md', 'readme.md']) {
    const p = path.join(repoRoot, cand);
    if (fs.existsSync(p)) { readmeHead = fs.readFileSync(p, 'utf8').slice(0, 2500); break; }
  }

  const langs = Object.entries(extCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const report = {
    repoRoot,
    repoName: path.basename(repoRoot),
    remoteUrl: remoteUrl || opts.github || '',
    branch,
    tag,
    commit,
    totalFiles,
    topExtensions: langs,
    topDirectories: topDirs,
    entryCandidates: entryCandidates.slice(0, 80),
    readmeHead,
  };

  const outPath = path.resolve(opts.output || path.join(repoRoot, '.repo-mastery', 'scan.json'));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Scan complete: ${report.repoName} (${totalFiles} files, commit=${commit || 'n/a'}) -> ${outPath}`);
}

// =========================================================================
// SUBCOMMAND 2: prepare-notes
// =========================================================================
function cmdPrepareNotes(opts) {
  const repoRoot = path.resolve(opts.repo || '.');
  const curriculum = readJson(path.resolve(opts.curriculum || die('Missing --curriculum')));
  const outDir = path.resolve(opts['out-dir'] || die('Missing --out-dir'));
  fs.mkdirSync(outDir, { recursive: true });

  const fileMap = collectUniqueFileSlices(repoRoot, curriculum);
  const files = [];
  let totalNonEmpty = 0;
  for (const [p, info] of fileMap) {
    const all = fs.readFileSync(path.join(repoRoot, p), 'utf8').replace(/\r\n/g, '\n').split('\n');
    const sorted = [...info.lineSet].sort((a, b) => a - b);
    const rows = sorted.map((ln) => ({ ln, text: all[ln - 1] ?? '' }));
    const nonEmpty = rows.filter((r) => r.text.trim().length > 0).length;
    totalNonEmpty += nonEmpty;
    files.push({ path: p, syntax: info.syntax, nonEmpty, rows });
  }
  files.sort((a, b) => b.nonEmpty - a.nonEmpty);

  const defaultBatches = Math.max(1, Math.min(8, Math.ceil(totalNonEmpty / 450)));
  const numBatches = Math.max(1, Number(opts.batches || defaultBatches));
  const batches = Array.from({ length: numBatches }, (_, i) => ({ id: i + 1, nonEmpty: 0, files: [] }));
  for (const f of files) {
    batches.sort((a, b) => a.nonEmpty - b.nonEmpty);
    batches[0].files.push(f);
    batches[0].nonEmpty += f.nonEmpty;
  }
  batches.sort((a, b) => a.id - b.id);

  const summary = [];
  for (const b of batches) {
    if (b.files.length === 0) continue;
    const bp = path.join(outDir, `batch_${b.id}.json`);
    fs.writeFileSync(bp, JSON.stringify(b, null, 2), 'utf8');
    summary.push(`batch_${b.id}: ${b.files.length} files, ${b.nonEmpty} lines`);
  }
  console.log(`Prepared ${summary.length} batches (${files.length} unique files, ${totalNonEmpty} non-empty lines) in ${outDir}`);
  summary.forEach((s) => console.log('  ' + s));
}

// =========================================================================
// SUBCOMMAND 3: verify-notes
// =========================================================================
function cmdVerifyNotes(opts) {
  const repoRoot = path.resolve(opts.repo || '.');
  const curriculum = readJson(path.resolve(opts.curriculum || die('Missing --curriculum')));
  const annDir = path.resolve(opts['annotations-dir'] || die('Missing --annotations-dir'));
  const lineNotes = loadAnnotationsDir(annDir);

  const fileMap = collectUniqueFileSlices(repoRoot, curriculum);
  let totalNonEmpty = 0;
  const missing = [];
  const nonChinese = [];
  const tooLong = [];

  for (const [p, info] of fileMap) {
    const all = fs.readFileSync(path.join(repoRoot, p), 'utf8').replace(/\r\n/g, '\n').split('\n');
    const noteMap = lineNotes[p] || {};
    for (const ln of [...info.lineSet].sort((a, b) => a - b)) {
      if ((all[ln - 1] || '').trim().length === 0) continue;
      totalNonEmpty++;
      const note = noteMap[String(ln)];
      if (!note || !String(note).trim()) {
        missing.push(`${p}:${ln}`);
      } else {
        const s = String(note).trim();
        if (!/[\u4e00-\u9fff]/.test(s)) nonChinese.push(`${p}:${ln} -> "${s}"`);
        if (s.length > 75) tooLong.push(`${p}:${ln} (len=${s.length})`);
      }
    }
  }

  const report = {
    uniqueFiles: fileMap.size,
    totalNonEmpty,
    missingCount: missing.length,
    nonChineseCount: nonChinese.length,
    tooLongCount: tooLong.length,
    missingSample: missing.slice(0, 30),
    nonChineseSample: nonChinese.slice(0, 15),
    tooLongSample: tooLong.slice(0, 15),
  };

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  }

  console.log(`Notes verification: files=${report.uniqueFiles} lines=${totalNonEmpty} MISSING=${missing.length} NON_ZH=${nonChinese.length} TOO_LONG=${tooLong.length}`);
  if (missing.length > 0) {
    console.error('Missing sample:', missing.slice(0, 15).join(', '));
    process.exit(1);
  }
}

// =========================================================================
// SUBCOMMAND 4: verify-dossiers
// =========================================================================
function cmdVerifyDossiers(opts) {
  const curriculum = readJson(path.resolve(opts.curriculum || die('Missing --curriculum')));
  const mergedDossiers = mergeOverviewDossiers(curriculum, opts['dossiers-dir']);
  const res = validateOverviewDossiers(curriculum, mergedDossiers, { allowLegacyOverview: false });

  const report = {
    expectedCounts: res.expectedCounts,
    actualCounts: res.actualCounts,
    totalExpected: res.totalExpected,
    uniqueRoles: res.uniqueRoles,
    errorCount: res.errors.length,
    errors: res.errors,
  };

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  }

  console.log(
    `Dossiers verification: dataflow=${res.actualCounts.dataflow}/${res.expectedCounts.dataflow} techarch=${res.actualCounts.techarch}/${res.expectedCounts.techarch} businessflow=${res.actualCounts.businessflow}/${res.expectedCounts.businessflow} uniqueRoles=${res.uniqueRoles}/${res.totalExpected} ERRORS=${res.errors.length}`
  );
  if (res.errors.length > 0) {
    res.errors.slice(0, 30).forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }
}

// =========================================================================
// SUBCOMMAND 5: build
// =========================================================================
function validateCurriculumSchema(c) {
  const req = ['meta', 'stages', 'flows', 'techArch', 'dataFlow', 'businessFlow', 'stations', 'workbenchModules', 'pitch', 'skipGuide', 'exam'];
  for (const k of req) if (!c[k]) die(`curriculum.json missing required top-level key: "${k}"`);
  if (!c.stations.length) die('curriculum.json has 0 stations');
  for (const st of c.stations) {
    if (!st.whyBlock?.painPoint || !st.whyBlock?.analogy || !st.whyBlock?.avoidRabbitHole) {
      die(`Station ${st.id} missing required whyBlock.{painPoint, analogy, avoidRabbitHole}`);
    }
    const io = st.ioContract;
    if (!io?.inType || !io?.inFields?.length || !io?.inSample || !io?.transformSteps?.length || !io?.outType || !io?.outFields?.length || !io?.outSample) {
      die(`Station ${st.id} missing required ioContract fields (inType/inFields/inSample/transformSteps/outType/outFields/outSample)`);
    }
    if (!st.steps?.length) die(`Station ${st.id} has 0 micro-flow steps`);
    if (!st.quiz?.question || !st.quiz?.options?.length) die(`Station ${st.id} missing quiz`);
  }
}

function cmdBuild(opts) {
  const repoRoot = path.resolve(opts.repo || '.');
  const curriculum = readJson(path.resolve(opts.curriculum || die('Missing --curriculum')));
  const annDir = path.resolve(opts['annotations-dir'] || die('Missing --annotations-dir'));
  const outputHtml = path.resolve(opts.output || die('Missing --output'));

  if (fs.existsSync(outputHtml) && !opts.force) {
    die(`Refusing to overwrite existing HTML "${outputHtml}" (version preservation rule!). Use a new versioned filename (e.g. -v2.html) or pass --force.`);
  }

  validateCurriculumSchema(curriculum);
  const mergedDossiers = mergeOverviewDossiers(curriculum, opts['dossiers-dir']);
  const dossierRes = validateOverviewDossiers(curriculum, mergedDossiers, {
    allowLegacyOverview: Boolean(opts['allow-legacy-overview']),
  });
  if (dossierRes.errors.length > 0) {
    dossierRes.errors.slice(0, 30).forEach((e) => console.error('  DOSSIER ERR:', e));
    die(`Build blocked: ${dossierRes.errors.length} overviewDossiers validation error(s).`);
  }

  const lineNotes = loadAnnotationsDir(annDir);

  // Hydrate all Stations with real verbatim repo code
  const hydratedStations = curriculum.stations.map((st) => ({
    ...st,
    files: (st.files || []).map((f) => ({
      ...f,
      syntax: inferSyntax(f.path, f.syntax),
      ...readRepoLines(repoRoot, f.path, f.sliceStart, f.sliceEnd),
    })),
  }));

  // Hydrate all Workbench modules
  const hydratedWorkbench = curriculum.workbenchModules.map((mod) => ({
    ...mod,
    files: (mod.files || []).map((f) =>
      f.virtualLines
        ? { ...f, relPath: f.path, syntax: f.syntax || 'tree', startLine: 1, endLine: f.virtualLines.length, lines: f.virtualLines }
        : { ...f, syntax: inferSyntax(f.path, f.syntax), ...readRepoLines(repoRoot, f.path, f.sliceStart, f.sliceEnd) }
    ),
  }));

  // Strictly enforce 100% per-line Chinese annotation coverage before rendering
  let checkedLines = 0;
  const missing = [];
  const checkFile = (f) => {
    if (f.syntax === 'tree' || f.virtualLines) return;
    const noteMap = lineNotes[f.path] || {};
    for (let i = 0; i < f.lines.length; i++) {
      const ln = f.startLine + i;
      if ((f.lines[i] || '').trim().length === 0) continue;
      checkedLines++;
      if (!noteMap[String(ln)] || !String(noteMap[String(ln)]).trim()) {
        missing.push(`${f.path}:${ln}`);
      }
    }
  };
  hydratedStations.forEach((st) => st.files.forEach(checkFile));
  hydratedWorkbench.forEach((m) => m.files.forEach(checkFile));
  if (missing.length > 0) {
    die(`Build blocked: ${missing.length} non-empty code lines lack Chinese annotations! First 10: ${missing.slice(0, 10).join(', ')}`);
  }

  const PAYLOAD = {
    ...curriculum,
    stations: hydratedStations,
    workbenchModules: hydratedWorkbench,
    lineNotes,
  };
  if (mergedDossiers) PAYLOAD.overviewDossiers = mergedDossiers;
  else delete PAYLOAD.overviewDossiers;

  const html = renderMasteryHtml(PAYLOAD);
  fs.mkdirSync(path.dirname(outputHtml), { recursive: true });
  fs.writeFileSync(outputHtml, html, 'utf8');
  console.log(`Generated: ${outputHtml} (${Buffer.byteLength(html, 'utf8')} bytes)`);
  console.log(
    `Summary: DataFlow=${hydratedStations.length} stations | TechArch=${curriculum.techArch.components.length} comps | BusinessFlow=${curriculum.businessFlow.nodes.length} nodes | Dossiers=${dossierRes.skipped ? 'legacy' : dossierRes.totalExpected} | Workbench=${hydratedWorkbench.length} views | AnnotatedLines=${checkedLines} (100%)`
  );
}

// =========================================================================
// SUBCOMMAND 5: verify-html (Headless Edge/Chrome CDP)
// =========================================================================
function findBrowserBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/bin/microsoft-edge',
  ].filter(Boolean);
  for (const p of candidates) if (fs.existsSync(p)) return p;
  const locator = process.platform === 'win32' ? 'where' : 'which';
  for (const cmd of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'msedge']) {
    try {
      const out = execFileSync(locator, [cmd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split(/\r?\n/)[0];
      if (out && fs.existsSync(out)) return out;
    } catch {}
  }
  die('Could not locate Headless Edge/Chrome binary. Set CHROME_PATH env var.');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForCdp(port, retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
        if (page) return page;
      }
    } catch {}
    await sleep(250);
  }
  throw new Error('CDP endpoint did not become ready');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
    });
    this.ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const ex = msg.params.exceptionDetails;
        this.consoleErrors.push(`EXCEPTION: ${ex.text} ${ex.exception?.description || ''}`);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        this.consoleErrors.push(`CONSOLE.ERROR: ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`);
      }
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(`Eval error: ${res.exceptionDetails.text} ${res.exceptionDetails.exception?.description || ''}`);
    return res.result?.value;
  }
  async shot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  }
  close() { try { this.ws.close(); } catch {} }
}

const INSPECT_SVG_JS = `
function inspectSvgOverflow(svgSelector, label) {
  const svg = document.querySelector(svgSelector);
  if (!svg) return { label, missing: true, issues: ['SVG not found: ' + svgSelector], nodeCount: 0 };
  const issues = [];
  const nodes = svg.querySelectorAll('g.arch-node');
  nodes.forEach((g) => {
    const box = g.querySelector('rect.node-box');
    if (!box) return;
    const bw = parseFloat(box.getAttribute('width'));
    const title = g.querySelector('text.node-title');
    const sub = g.querySelector('text.node-sub');
    const chip = g.querySelector('text.node-src-chip');
    const tagBg = g.querySelector('rect.node-tag-bg');
    const tagTx = g.querySelector('text.node-tag-tx');
    const nid = g.dataset.stid || g.dataset.compId || g.dataset.bizId || g.dataset.stepId || g.dataset.nodeId || title?.textContent || '?';

    if (title) {
      const tb = title.getBBox();
      if (tb.x + tb.width > bw - 4) issues.push(nid + ': title overflow right "' + title.textContent + '"');
      if (tagBg) {
        const rb = tagBg.getBBox();
        const sameRow = !(tb.y + tb.height < rb.y || rb.y + rb.height < tb.y);
        if (sameRow && tb.x + tb.width > rb.x - 4) issues.push(nid + ': title collides tagBg "' + title.textContent + '"');
      }
    }
    if (sub) {
      const sb = sub.getBBox();
      if (sb.x + sb.width > bw - 4) issues.push(nid + ': sub overflow right "' + sub.textContent + '"');
    }
    if (chip && tagBg) {
      const cb = chip.getBBox();
      const rb = tagBg.getBBox();
      const sameRow = !(cb.y + cb.height < rb.y || rb.y + rb.height < cb.y);
      if (sameRow && cb.x + cb.width > rb.x - 3) issues.push(nid + ': chip collides tagBg "' + chip.textContent + '" vs "' + (tagTx?.textContent || '') + '"');
    }
    if (tagBg && tagTx) {
      const rb = tagBg.getBBox();
      const ttb = tagTx.getBBox();
      if (ttb.width > rb.width - 2) issues.push(nid + ': tagTx wider than tagBg "' + tagTx.textContent + '"');
    }
  });
  return { label, nodeCount: nodes.length, issues };
}
`;

async function cmdVerifyHtml(opts) {
  const htmlPath = path.resolve(opts.html || die('Missing --html'));
  if (!fs.existsSync(htmlPath)) die(`HTML not found: ${htmlPath}`);
  const shotsDir = path.resolve(opts['shots-dir'] || path.join(path.dirname(htmlPath), 'screenshots'));
  fs.mkdirSync(shotsDir, { recursive: true });
  const port = Number(opts.port || 9345);
  const browserBin = findBrowserBinary();
  const profileDir = path.join(os.tmpdir(), `repo_mastery_cdp_profile_${port}_${process.pid}`);
  fs.rmSync(profileDir, { recursive: true, force: true });

  const browserArgs = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, '--window-size=1440,920',
  ];
  if (process.platform === 'linux') browserArgs.push('--no-sandbox', '--disable-dev-shm-usage');
  browserArgs.push('about:blank');

  const proc = spawn(browserBin, browserArgs, { stdio: 'ignore' });

  let cdp;
  const issues = [];
  const shots = [];
  try {
    const page = await waitForCdp(port);
    cdp = new CdpClient(page.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 920, deviceScaleFactor: 1, mobile: false });

    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await cdp.send('Page.navigate', { url: fileUrl });
    await sleep(750);
    await cdp.eval('localStorage.clear(); location.reload();');
    await sleep(750);
    await cdp.eval(INSPECT_SVG_JS);

    const checkSvg = async (sel, label) => {
      const r = await cdp.eval(`inspectSvgOverflow(${JSON.stringify(sel)}, ${JSON.stringify(label)})`);
      if (r.issues.length) issues.push(...r.issues.map((x) => `[${label}] ${x}`));
      return r;
    };
    const saveShot = async (name) => {
      const p = path.join(shotsDir, name);
      await cdp.shot(p);
      shots.push(p);
    };

    // 1. Overview 3 Maps + v6 Dossier Deck / Fullscreen Modal / Anti-misclick / Topology Highlighting
    const hasDossiers = await cdp.eval(`Boolean(DATA.overviewDossiers && DATA.overviewDossiers.dataflow && DATA.overviewDossiers.techarch && DATA.overviewDossiers.businessflow)`);
    const stationIds = await cdp.eval(`(DATA.stations || []).map(s => s.id)`);
    const dfRes = await checkSvg('#dfBlueprintSvg', 'Map1:DataFlow');
    await saveShot('shot_01_dark_dataflow.png');

    let dossierChecks = { enabled: hasDossiers, passed: 0, total: 0 };
    const recordCheck = (ok, errMsg) => {
      dossierChecks.total++;
      if (ok) dossierChecks.passed++;
      else issues.push(errMsg);
    };

    if (hasDossiers) {
      // Check Map 1 bottom-left chips say "单击看详解" and adjacent highlighting works
      const dfUiRes = await cdp.eval(`(() => {
        const chips = [...document.querySelectorAll('#dfBlueprintSvg .node-src-chip')].map(el => el.textContent.trim());
        const allChipsOk = chips.length > 0 && chips.every(c => c === '单击看详解');
        const selSt = getStation(ui.selectedDfStationId);
        const selDfId = selSt ? selSt.dfNodeId : null;
        const flows = DATA.dataFlow?.flows || [];
        const adj = new Set(selDfId ? [selDfId] : []);
        let hasAdjEdge = false, hasUnrelEdge = false;
        flows.forEach(fl => {
          if (selDfId && (fl.from === selDfId || fl.to === selDfId)) {
            hasAdjEdge = true; adj.add(fl.from); adj.add(fl.to);
          } else {
            hasUnrelEdge = true;
          }
        });
        const hasUnrelNode = (DATA.stations || []).some(s => !adj.has(s.dfNodeId));
        const actEdgeCnt = document.querySelectorAll('#dfBlueprintSvg .arch-edge.active').length;
        const dimEdgeCnt = document.querySelectorAll('#dfBlueprintSvg .arch-edge.dimmed').length;
        const dimNodeCnt = document.querySelectorAll('#dfBlueprintSvg .arch-node.dimmed').length;
        const hlOk = (!hasAdjEdge || actEdgeCnt > 0) && (!hasUnrelEdge || dimEdgeCnt > 0) && (!hasUnrelNode || dimNodeCnt > 0);
        return { allChipsOk, hlOk, actEdgeCnt, dimEdgeCnt, dimNodeCnt };
      })()`);
      recordCheck(dfUiRes.allChipsOk, 'Map1:DataFlow node-src-chip should all be "单击看详解"');
      recordCheck(dfUiRes.hlOk, `Map1:DataFlow adjacent edge/node highlight check failed: ${JSON.stringify(dfUiRes)}`);

      // Anti-misclick on Map 1 (2 single-clicks keep ui.view === 'overview' and render 5 dossier cards)
      const dfClickRes = await cdp.eval(`(() => {
        const sid = ${JSON.stringify(stationIds[0])};
        const g1 = document.querySelector('#dfBlueprintSvg .arch-node[data-stid="' + sid + '"]');
        if (!g1) return { ok: false, reason: 'node not found' };
        g1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const g2 = document.querySelector('#dfBlueprintSvg .arch-node[data-stid="' + sid + '"]');
        g2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const cards = document.querySelectorAll('#overviewDossierDeck .dos-card').length;
        const roleRaw = (DATA.overviewDossiers.dataflow[sid]?.role || '').replace(/[\`*]/g, '').replace(/\\s+/g, ' ').trim();
        const roleBox = (document.querySelector('#overviewDossierDeck .dos-role-box')?.textContent || '').replace(/\\s+/g, ' ').trim();
        return { ok: ui.view === 'overview' && cards === 5 && roleBox.includes(roleRaw.slice(0, 20)), view: ui.view, cards };
      })()`);
      recordCheck(dfClickRes.ok, `Map1:DataFlow anti-misclick/dossier render failed: ${JSON.stringify(dfClickRes)}`);

      // Neighbor chip jump (+ auto-reset filter when cross-flow if multiple flows exist)
      const dfNbRes = await cdp.eval(`(() => {
        const chip = document.querySelector('#overviewDossierDeck .dos-neighbor-chip[data-dos-jump-id]');
        if (!chip) return { ok: true, skipped: true };
        const targetId = chip.dataset.dosJumpId;
        const targetSt = getStation(targetId);
        const otherFlow = (DATA.flows || []).find(f => f.id !== targetSt?.flowId);
        if (otherFlow) ui.flowFilter = otherFlow.id;
        chip.click();
        return { ok: ui.view === 'overview' && ui.selectedDfStationId === targetId && ui.flowFilter === 'all', selected: ui.selectedDfStationId, targetId, flowFilter: ui.flowFilter };
      })()`);
      recordCheck(dfNbRes.ok, `Map1:DataFlow neighbor chip jump failed: ${JSON.stringify(dfNbRes)}`);

      // Prev / Next button + ArrowLeft / ArrowRight keyboard navigation
      const dfNavRes = await cdp.eval(`(() => {
        if ((DATA.stations || []).length <= 1) return { ok: true };
        const startId = ui.selectedDfStationId;
        document.querySelector('#overviewDossierDeck [data-dos-nav="next"]')?.click();
        const afterNext = ui.selectedDfStationId;
        document.querySelector('#overviewDossierDeck [data-dos-nav="prev"]')?.click();
        const backPrev = ui.selectedDfStationId;
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        const afterKeyR = ui.selectedDfStationId;
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        const afterKeyL = ui.selectedDfStationId;
        return { ok: afterNext !== startId && backPrev === startId && afterKeyR !== startId && afterKeyL === startId, startId, afterNext, backPrev, afterKeyR, afterKeyL };
      })()`);
      recordCheck(dfNavRes.ok, `Map1:DataFlow prev/next or keyboard nav failed: ${JSON.stringify(dfNavRes)}`);

      // Interview Q&A single toggle + expand/collapse all (leave Q1 open for deck/modal screenshots)
      const qaRes = await cdp.eval(`(() => {
        const initOpen = document.querySelectorAll('#overviewDossierDeck .dos-qa-ans.open').length;
        document.querySelector('#overviewDossierDeck [data-dos-toggle-qa="0"]')?.click();
        const afterOne = document.querySelectorAll('#overviewDossierDeck .dos-qa-ans.open').length;
        document.querySelector('#overviewDossierDeck [data-dos-toggle-all-qa="1"]')?.click();
        const afterAll = document.querySelectorAll('#overviewDossierDeck .dos-qa-ans.open').length;
        document.querySelector('#overviewDossierDeck [data-dos-toggle-all-qa="1"]')?.click();
        const afterCollapse = document.querySelectorAll('#overviewDossierDeck .dos-qa-ans.open').length;
        document.querySelector('#overviewDossierDeck [data-dos-toggle-qa="0"]')?.click();
        return { ok: initOpen === 0 && afterOne === 1 && afterAll === 2 && afterCollapse === 0, initOpen, afterOne, afterAll, afterCollapse };
      })()`);
      recordCheck(qaRes.ok, `Map1:Dossier Q&A toggle check failed: ${JSON.stringify(qaRes)}`);

      // Scroll deck into view and capture shot_02
      await cdp.eval(`document.getElementById('overviewDossierDeck')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
      await sleep(150);
      await saveShot('shot_02_dark_dossier_deck.png');

      // Deck collapse / expand toggle
      const colRes = await cdp.eval(`(() => {
        document.querySelector('#overviewDossierDeck [data-dos-toggle-collapse="1"]')?.click();
        const collapsed = Boolean(document.querySelector('#overviewDossierDeck .dos-collapsed-bar')) && !document.querySelector('#overviewDossierDeck .dos-body');
        document.querySelector('#overviewDossierDeck [data-dos-toggle-collapse="1"]')?.click();
        const restored = Boolean(document.querySelector('#overviewDossierDeck .dos-body')) && !document.querySelector('#overviewDossierDeck .dos-collapsed-bar');
        return { ok: collapsed && restored, collapsed, restored };
      })()`);
      recordCheck(colRes.ok, `Map1:Dossier deck collapse/expand failed: ${JSON.stringify(colRes)}`);

      // Fullscreen modal open -> capture shot_03 -> Esc close
      const modOpenOk = await cdp.eval(`(() => {
        document.querySelector('#overviewDossierDeck [data-dos-open-modal="1"]')?.click();
        const m = document.getElementById('dossierModal');
        return Boolean(m && m.classList.contains('open') && document.querySelectorAll('#dossierModalBox .dos-card').length === 5);
      })()`);
      recordCheck(modOpenOk, 'Map1:Dossier fullscreen modal failed to open with 5 cards');
      await sleep(180);
      await saveShot('shot_03_dark_dossier_modal.png');

      const modCloseOk = await cdp.eval(`(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return !document.getElementById('dossierModal')?.classList.contains('open');
      })()`);
      recordCheck(modCloseOk, 'Map1:Dossier fullscreen modal failed to close on Escape');

      // Double-click enters View 2 station
      const dblOk = await cdp.eval(`(() => {
        const sid = ${JSON.stringify(stationIds[0])};
        const g = document.querySelector('#dfBlueprintSvg .arch-node[data-stid="' + sid + '"]');
        g?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        const ok = ui.view === 'station' && progress.currentStationId === sid;
        setView('overview');
        return ok;
      })()`);
      recordCheck(dblOk, 'Map1:DataFlow double-click did not navigate to View 2 station');
    }

    // Map 2: TechArch
    await cdp.eval(`document.querySelector('.bp-tab[data-bp="techarch"]').click()`);
    await sleep(200);
    const taRes = await checkSvg('#techArchSvg', 'Map2:TechArch');
    await saveShot('shot_04_dark_techarch.png');

    if (hasDossiers) {
      const taCheck = await cdp.eval(`(() => {
        const comps = DATA.techArch?.components || [];
        if (!comps.length) return { ok: false, reason: 'no tech components' };
        const cid = comps[0].id;
        const g1 = document.querySelector('#techArchSvg .arch-node[data-comp-id="' + cid + '"]');
        g1?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const g2 = document.querySelector('#techArchSvg .arch-node[data-comp-id="' + cid + '"]');
        g2?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const cards = document.querySelectorAll('#overviewDossierDeck .dos-card').length;
        const roleRaw = (DATA.overviewDossiers.techarch[cid]?.role || '').replace(/[\`*]/g, '').replace(/\\s+/g, ' ').trim();
        const roleBox = (document.querySelector('#overviewDossierDeck .dos-role-box')?.textContent || '').replace(/\\s+/g, ' ').trim();
        let nbOk = true;
        const chip = document.querySelector('#overviewDossierDeck .dos-neighbor-chip[data-dos-jump-id]');
        if (chip) {
          const tid = chip.dataset.dosJumpId;
          chip.click();
          nbOk = ui.selectedTechCompId === tid && ui.view === 'overview';
        }
        return { ok: ui.view === 'overview' && cards === 5 && roleBox.includes(roleRaw.slice(0, 20)) && nbOk, view: ui.view, cards, nbOk };
      })()`);
      recordCheck(taCheck.ok, `Map2:TechArch click/dossier/neighbor check failed: ${JSON.stringify(taCheck)}`);

      // Ctrl+K global search for Map 2 component by examPoints / role -> jump to Map 2 & expand dossier
      const searchTechOk = await cdp.eval(`(() => {
        const comps = DATA.techArch?.components || [];
        const target = comps.find(c => c.id !== ui.selectedTechCompId) || comps[0];
        const dos = DATA.overviewDossiers.techarch[target.id];
        const kw = (dos?.examPoints?.[0] || target.label || '').trim();
        document.getElementById('btnSearch')?.click();
        const inp = document.getElementById('searchInput');
        inp.value = kw;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        const item = document.querySelector('#searchResults .search-item[data-kind="tech"][data-id="' + target.id + '"]');
        if (!item) return { ok: false, reason: 'missing tech search item for kw=' + kw };
        item.click();
        return {
          ok: ui.view === 'overview' && ui.blueprintMode === 'techarch' && ui.selectedTechCompId === target.id && !ui.dossierCollapsed && Boolean(document.querySelector('#overviewDossierDeck .dos-body')),
          view: ui.view, mode: ui.blueprintMode, selected: ui.selectedTechCompId, target: target.id
        };
      })()`);
      recordCheck(searchTechOk.ok, `Ctrl+K search for Map2 TechArch component failed: ${JSON.stringify(searchTechOk)}`);
    }

    // Map 3: BusinessFlow
    await cdp.eval(`document.querySelector('.bp-tab[data-bp="businessflow"]').click()`);
    await sleep(200);
    const bfRes = await checkSvg('#businessFlowSvg', 'Map3:BusinessFlow');
    await saveShot('shot_05_dark_businessflow.png');

    // Verify all BusinessFlow nodes: single-click updates overview without accidental jump; CTA enters View 2 cleanly
    const bizIds = await cdp.eval(`(DATA.businessFlow?.nodes || []).map(n => n.id)`);
    let bizPass = 0;
    for (let bi = 0; bi < bizIds.length; bi++) {
      const bid = bizIds[bi];
      const ok = await cdp.eval(`(() => {
        ui.blueprintMode = 'businessflow'; ui.bizFilter = 'all'; setView('overview');
        const bid = ${JSON.stringify(bid)};
        const g = document.querySelector('#businessFlowSvg .arch-node[data-biz-id="' + bid + '"]');
        if (!g) return false;
        g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        if (ui.view !== 'overview' || ui.selectedBizNodeId !== bid) return false;
        // Repeated single click must NOT jump
        const g2 = document.querySelector('#businessFlowSvg .arch-node[data-biz-id="' + bid + '"]');
        g2?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        if (ui.view !== 'overview') return false;
        const hasDos = Boolean(DATA.overviewDossiers?.businessflow?.[bid]);
        if (hasDos) {
          const cards = document.querySelectorAll('#overviewDossierDeck .dos-card').length;
          const roleRaw = (DATA.overviewDossiers.businessflow[bid]?.role || '').replace(/[\`*]/g, '').replace(/\\s+/g, ' ').trim();
          const roleBox = (document.querySelector('#overviewDossierDeck .dos-role-box')?.textContent || '').replace(/\\s+/g, ' ').trim();
          if (cards !== 5 || !roleBox.includes(roleRaw.slice(0, 20))) return false;
          const cta = document.querySelector('#overviewDossierDeck [data-dos-go-st]');
          if (!cta) return false;
          cta.click();
        } else {
          const cta = document.getElementById('btnEnterBizStation');
          if (!cta) return false;
          cta.click();
        }
        return ui.view === 'station';
      })()`);
      if (ok) bizPass++;
      else issues.push(`BusinessFlow node ${bid} anti-misclick/CTA jump failed`);
    }

    // 2. Verify ALL Stations (WhyBlock + I/O Contract + 100% per-line Chinese notes + Micro-Flow SVG)
    let stationPass = 0;
    for (let idx = 0; idx < stationIds.length; idx++) {
      const sid = stationIds[idx];
      await cdp.eval(`openStation(${JSON.stringify(sid)})`);
      await sleep(80);
      await checkSvg('#stationMicroSvg', `Station:${sid}`);
      const audit = await cdp.eval(`(() => {
        const pain = document.querySelector('#stWhyPanel .why-box.pain .why-box-body')?.textContent?.trim() || '';
        const ana = document.querySelector('#stWhyPanel .why-box.analogy .why-box-body')?.textContent?.trim() || '';
        const avoid = document.querySelector('#stWhyPanel .why-avoid')?.textContent?.trim() || '';
        const inPre = document.querySelector('#stIoPanel .io-pre.in')?.textContent?.trim() || '';
        const outPre = document.querySelector('#stIoPanel .io-pre.out')?.textContent?.trim() || '';
        const rows = document.querySelectorAll('#stCodeScroll tr.code-row');
        let ne = 0; rows.forEach(r => { if ((r.querySelector('.code-cell')?.textContent || '').trim().length > 0) ne++; });
        const notes = document.querySelectorAll('#stCodeScroll tr.code-note-row').length;
        return { ok: pain.length > 5 && ana.length > 5 && avoid.length > 5 && inPre.length > 5 && outPre.length > 5 && notes === ne, ne, notes };
      })()`);
      if (audit.ok) stationPass++;
      else issues.push(`Station ${sid} audit failed: ${JSON.stringify(audit)}`);

      if (idx === 0) {
        await saveShot('shot_06_dark_station_top.png');
        await cdp.eval(`document.getElementById('stIoPanel').scrollIntoView({ behavior: 'instant', block: 'start' })`);
        await sleep(100);
        await saveShot('shot_07_dark_station_io.png');
      }
    }

    // 3. Verify Workbench SVGs + non-tree per-line Chinese notes
    await cdp.eval(`setView('workbench')`);
    await sleep(150);
    const wbCount = await cdp.eval(`WB_MODULES.length`);
    let wbNotesOk = 0;
    for (let i = 0; i < wbCount; i++) {
      await cdp.eval(`wbLoadModule(${i})`);
      await sleep(70);
      const info = await cdp.eval(`({ id: WB_MODULES[${i}].id, isTree: WB_MODULES[${i}].kind === 'tree' })`);
      await checkSvg('#wbSvg', `Workbench:${info.id}`);
      if (!info.isTree) {
        const nres = await cdp.eval(`(() => {
          const rows = document.querySelectorAll('#wbCodeTable tr.code-row');
          let ne = 0; rows.forEach(r => { if ((r.querySelector('.code-cell')?.textContent || '').trim().length > 0) ne++; });
          const notes = document.querySelectorAll('#wbCodeTable tr.code-note-row').length;
          return { ne, notes };
        })()`);
        if (nres.ne === nres.notes) wbNotesOk++;
        else issues.push(`Workbench ${info.id} note mismatch: ${nres.notes}/${nres.ne}`);
      }
    }

    // 4. Light mode screenshots (View 1 dossier modal + View 2 station)
    await cdp.eval(`document.getElementById('btnTheme').click(); ui.blueprintMode = 'dataflow'; setView('overview');`);
    await sleep(150);
    if (hasDossiers) {
      await cdp.eval(`openDossierModal()`);
      await sleep(180);
      await saveShot('shot_08_light_dossier_modal.png');
      await cdp.eval(`closeDossierModal()`);
    } else {
      await saveShot('shot_08_light_overview.png');
    }
    await cdp.eval(`openStation(${JSON.stringify(stationIds[0])})`);
    await sleep(220);
    await saveShot('shot_09_light_station.png');

    const report = {
      htmlPath,
      mapCounts: { dataflow: dfRes.nodeCount, techarch: taRes.nodeCount, businessflow: bfRes.nodeCount },
      dossierChecks: hasDossiers ? `${dossierChecks.passed}/${dossierChecks.total}` : 'legacy',
      businessJumps: `${bizPass}/${bizIds.length}`,
      stationsAudited: `${stationPass}/${stationIds.length}`,
      workbenchViews: wbCount,
      workbenchNotesVerified: wbNotesOk,
      consoleErrors: cdp.consoleErrors,
      issues,
      screenshots: shots,
    };

    if (opts.output) {
      const outPath = path.resolve(opts.output);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
    }

    console.log(`CDP Verify complete: ConsoleErrors=${cdp.consoleErrors.length} Issues=${issues.length} Dossiers=${report.dossierChecks} Stations=${stationPass}/${stationIds.length} BizJumps=${bizPass}/${bizIds.length} Shots=${shots.length}`);
    if (cdp.consoleErrors.length > 0 || issues.length > 0) {
      cdp.consoleErrors.forEach((e) => console.error('  ERR:', e));
      issues.forEach((x) => console.error('  ISSUE:', x));
      process.exitCode = 1;
    }
  } finally {
    if (cdp) cdp.close();
    try { proc.kill(); } catch {}
    await sleep(300);
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
}

// =========================================================================
// Main Dispatch
// =========================================================================
const { cmd, opts } = parseArgs(process.argv);
if (cmd === 'scan') cmdScan(opts);
else if (cmd === 'prepare-notes') cmdPrepareNotes(opts);
else if (cmd === 'verify-notes') cmdVerifyNotes(opts);
else if (cmd === 'verify-dossiers') cmdVerifyDossiers(opts);
else if (cmd === 'build') cmdBuild(opts);
else if (cmd === 'verify-html') await cmdVerifyHtml(opts);
else {
  console.error('Usage: node repo_mastery_cli.mjs <scan|prepare-notes|verify-notes|verify-dossiers|build|verify-html> [--options]');
  process.exit(1);
}

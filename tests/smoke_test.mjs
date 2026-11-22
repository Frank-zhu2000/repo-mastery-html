#!/usr/bin/env node
// Zero-dependency end-to-end smoke & Headless CDP regression test for repo-mastery-html

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(REPO_ROOT, 'scripts', 'repo_mastery_cli.mjs');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'scripts', 'render_template.mjs');
const EXAMPLE_CURRICULUM = path.join(REPO_ROOT, 'examples', 'minimal_curriculum.example.json');

const skipCdp = process.argv.includes('--skip-cdp');
const keepTmp = process.argv.includes('--keep-tmp');

function runNode(args, expectFailure = false) {
  const res = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (expectFailure) {
    assert.notEqual(res.status, 0, `Expected failure but exited 0: node ${args.join(' ')}`);
    return res;
  }
  if (res.status !== 0) {
    throw new Error(
      `Command failed (exit=${res.status}): node ${args.join(' ')}\nSTDOUT:\n${res.stdout}\nSTDERR:\n${res.stderr}`
    );
  }
  return res;
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 9361;
      srv.close(() => resolve(port));
    });
  });
}

function buildMockRepo(mockRepo) {
  const files = {
    'README.md': '# DemoService\nMinimal fixture repository for repo-mastery-html CI.\n',
    'Gemfile': 'source "https://rubygems.org"\n',
    'pom.xml': '<project><modelVersion>4.0.0</modelVersion></project>\n',
    'src/app.rb': 'def greet(name)\n  "hello #{name}"\nend\n',
    'src/widget.vue': '<template><div class="card">ok</div></template>\n',
    'src/notes.unknownext': 'raw plain config line\n',
    '.repo-mastery/ignored.txt': 'should be ignored by scan\n',
    'src/gateway.go': [
      'package gateway',
      '',
      'import (',
      '  "net/http"',
      ')',
      '',
      'type ChatContext struct { TenantID, RequestID, Query string }',
      '',
      'func HandleChat(w http.ResponseWriter, r *http.Request) ChatContext {',
      '  tenant := r.Header.Get("X-Tenant-ID")',
      '  if tenant == "" {',
      '    http.Error(w, "missing tenant", http.StatusBadRequest)',
      '  }',
      '  reqID := r.Header.Get("X-Request-ID")',
      '  if reqID == "" {',
      '    reqID = "req_generated"',
      '  }',
      '  q := r.URL.Query().Get("q")',
      '  return ChatContext{TenantID: tenant, RequestID: reqID, Query: q}',
      '}',
    ].join('\n'),
    'src/factory.go': [
      'package factory',
      '',
      'import "strings"',
      '',
      'type StreamManager interface {',
      '  Publish(key, msg string) error',
      '}',
      '',
      'type RedisStreamManager struct{}',
      'func (RedisStreamManager) Publish(k, m string) error { return nil }',
      'type MemoryStreamManager struct{}',
      'func (MemoryStreamManager) Publish(k, m string) error { return nil }',
      '',
      'func NewStreamManager(driver string) StreamManager {',
      '  switch strings.ToLower(strings.TrimSpace(driver)) {',
      '  case "redis":',
      '    return RedisStreamManager{}',
      '  case "memory":',
      '    return MemoryStreamManager{}',
      '  default:',
      '    // safe fallback avoids nil dereference',
      '    return MemoryStreamManager{}',
      '  }',
      '}',
      '// end factory',
    ].join('\n'),
    'migrations/001.sql': [
      '-- Tenant-scoped unique items table',
      'CREATE TABLE IF NOT EXISTS items (',
      '  id INTEGER PRIMARY KEY,',
      '  tenant_id VARCHAR(64) NOT NULL,',
      '  item_name VARCHAR(128) NOT NULL,',
      '  status VARCHAR(32) NOT NULL,',
      '  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,',
      '  UNIQUE(tenant_id, item_name)',
      ');',
      '',
      '-- Ensure composite lookup prefix',
      'CREATE INDEX IF NOT EXISTS idx_items_tenant ON items (',
      '  tenant_id,',
      '  created_at DESC',
      ');',
      '',
      '-- End migration 001',
      'SELECT 1;',
    ].join('\n'),
  };

  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(mockRepo, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }

  const lineNotes = {};
  for (const rel of ['src/gateway.go', 'src/factory.go', 'migrations/001.sql']) {
    const lines = files[rel].split('\n');
    lineNotes[rel] = {};
    lines.forEach((raw, idx) => {
      if (raw.trim().length > 0) {
        lineNotes[rel][String(idx + 1)] = `第 ${idx + 1} 行中文精注：${raw.trim().slice(0, 32)}`;
      }
    });
  }
  return lineNotes;
}

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-mastery-smoke-'));
  console.log(`=== repo-mastery-html smoke test (${tmpDir}) ===`);
  try {
    // 1. JS syntax checks
    execFileSync(process.execPath, ['--check', TEMPLATE_PATH], { stdio: 'inherit' });
    execFileSync(process.execPath, ['--check', CLI_PATH], { stdio: 'inherit' });
    console.log('[1/8] Syntax checks passed.');

    // 2. Fixture repo + scan
    const mockRepo = path.join(tmpDir, 'mock-repo');
    const lineNotes = buildMockRepo(mockRepo);
    const scanOut = path.join(tmpDir, 'scan.json');
    runNode([CLI_PATH, 'scan', '--repo', mockRepo, '--output', scanOut]);
    const scanReport = JSON.parse(fs.readFileSync(scanOut, 'utf8'));
    assert.ok(scanReport.totalFiles >= 9, 'scan should count fixture files');
    assert.ok(scanReport.entryCandidates.includes('Gemfile'), 'scan should detect Gemfile');
    assert.ok(scanReport.entryCandidates.includes('pom.xml'), 'scan should detect pom.xml');
    assert.ok(!scanReport.entryCandidates.some((p) => p.includes('.repo-mastery')), 'scan must ignore .repo-mastery');
    console.log(`[2/8] Scan passed (totalFiles=${scanReport.totalFiles}, entryCandidates=${scanReport.entryCandidates.length}).`);

    // 3. verify-dossiers
    const dossierOut = path.join(tmpDir, 'dossiers_report.json');
    runNode([CLI_PATH, 'verify-dossiers', '--curriculum', EXAMPLE_CURRICULUM, '--output', dossierOut]);
    const dossierReport = JSON.parse(fs.readFileSync(dossierOut, 'utf8'));
    assert.deepEqual(dossierReport.actualCounts, { dataflow: 3, techarch: 3, businessflow: 3 });
    assert.equal(dossierReport.uniqueRoles, 9);
    assert.equal(dossierReport.errors.length, 0);
    console.log('[3/8] verify-dossiers passed (9/9 unique roles, 0 errors).');

    // 4. prepare-notes + verify-notes
    const workDir = path.join(tmpDir, 'work');
    runNode([CLI_PATH, 'prepare-notes', '--repo', mockRepo, '--curriculum', EXAMPLE_CURRICULUM, '--out-dir', workDir, '--batches', '2']);
    assert.ok(fs.existsSync(path.join(workDir, 'batch_1.json')));
    const annDir = path.join(tmpDir, 'annotations');
    fs.mkdirSync(annDir, { recursive: true });
    fs.writeFileSync(path.join(annDir, 'batch_1.json'), JSON.stringify(lineNotes, null, 2), 'utf8');
    const notesOut = path.join(tmpDir, 'notes_report.json');
    runNode([CLI_PATH, 'verify-notes', '--repo', mockRepo, '--curriculum', EXAMPLE_CURRICULUM, '--annotations-dir', annDir, '--output', notesOut]);
    const notesReport = JSON.parse(fs.readFileSync(notesOut, 'utf8'));
    assert.equal(notesReport.missingCount, 0);
    console.log(`[4/8] prepare-notes & verify-notes passed (0 missing of ${notesReport.totalNonEmpty} lines).`);

    // 5. build v6 HTML + validate inline script compilation + overwrite protection
    const htmlV6 = path.join(tmpDir, 'out', 'demo-v6.html');
    runNode([CLI_PATH, 'build', '--repo', mockRepo, '--curriculum', EXAMPLE_CURRICULUM, '--annotations-dir', annDir, '--output', htmlV6]);
    const htmlStr = fs.readFileSync(htmlV6, 'utf8');
    assert.ok(htmlStr.includes('overviewDossiers'), 'built HTML should include overviewDossiers');
    const scriptMatches = [...htmlStr.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.ok(scriptMatches.length >= 1, 'built HTML should contain inline script');
    const mainScript = scriptMatches[scriptMatches.length - 1][1];
    new Function(mainScript);
    runNode([CLI_PATH, 'build', '--repo', mockRepo, '--curriculum', EXAMPLE_CURRICULUM, '--annotations-dir', annDir, '--output', htmlV6], true);
    console.log('[5/8] build v6 + inline JS parse + overwrite guard passed.');

    // 6. Negative & opt-in legacy tests
    const legacyJson = JSON.parse(fs.readFileSync(EXAMPLE_CURRICULUM, 'utf8'));
    delete legacyJson.overviewDossiers;
    const legacyCurrPath = path.join(tmpDir, 'legacy_curriculum.json');
    fs.writeFileSync(legacyCurrPath, JSON.stringify(legacyJson, null, 2), 'utf8');
    const htmlLegacyBlocked = path.join(tmpDir, 'out', 'demo-legacy-blocked.html');
    runNode([CLI_PATH, 'build', '--repo', mockRepo, '--curriculum', legacyCurrPath, '--annotations-dir', annDir, '--output', htmlLegacyBlocked], true);
    const htmlLegacyOk = path.join(tmpDir, 'out', 'demo-legacy-ok.html');
    runNode([CLI_PATH, 'build', '--repo', mockRepo, '--curriculum', legacyCurrPath, '--annotations-dir', annDir, '--output', htmlLegacyOk, '--allow-legacy-overview']);
    assert.ok(fs.existsSync(htmlLegacyOk));
    console.log('[6/8] Missing-dossier block & --allow-legacy-overview passed.');

    // 7. Render check for multi-language & plain fallback syntax highlighting
    const { renderMasteryHtml } = await import(new URL('../scripts/render_template.mjs', import.meta.url));
    const multiCurr = JSON.parse(fs.readFileSync(EXAMPLE_CURRICULUM, 'utf8'));
    multiCurr.stations[0].files.push(
      { id: 'f_rb', label: 'app.rb', path: 'src/app.rb', syntax: 'rb', sliceStart: 1, sliceEnd: 3, lines: ['def greet(name)', '  "hello #{name}"', 'end'] },
      { id: 'f_vue', label: 'widget.vue', path: 'src/widget.vue', syntax: 'vue', sliceStart: 1, sliceEnd: 1, lines: ['<template><div class="card">ok</div></template>'] },
      { id: 'f_plain', label: 'notes.unknownext', path: 'src/notes.unknownext', syntax: 'plain', sliceStart: 1, sliceEnd: 1, lines: ['raw plain config line'] }
    );
    multiCurr.stations[0].files[0].lines = fs.readFileSync(path.join(mockRepo, 'src/gateway.go'), 'utf8').split('\n');
    multiCurr.stations[1].files[0].lines = fs.readFileSync(path.join(mockRepo, 'src/factory.go'), 'utf8').split('\n');
    multiCurr.stations[2].files[0].lines = fs.readFileSync(path.join(mockRepo, 'migrations/001.sql'), 'utf8').split('\n');
    multiCurr.workbenchModules[1].files[0].lines = multiCurr.stations[1].files[0].lines;
    multiCurr.workbenchModules[1].files[1].lines = multiCurr.stations[2].files[0].lines;
    multiCurr.lineNotes = lineNotes;
    const multiHtml = renderMasteryHtml(multiCurr);
    const mScripts = [...multiHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    new Function(mScripts[mScripts.length - 1][1]);
    console.log('[7/8] Multi-language (rb/vue/plain) template render & syntax check passed.');

    // 8. Headless CDP verify-html
    if (skipCdp) {
      console.log('[8/8] Skipping Headless CDP (--skip-cdp).');
    } else {
      const port = await getFreePort();
      const shotsDir = path.join(tmpDir, 'screenshots');
      const cdpOut = path.join(tmpDir, 'cdp_report.json');
      runNode([CLI_PATH, 'verify-html', '--html', htmlV6, '--shots-dir', shotsDir, '--port', String(port), '--output', cdpOut]);
      const cdp = JSON.parse(fs.readFileSync(cdpOut, 'utf8'));
      assert.equal(cdp.consoleErrors.length, 0, `CDP console errors: ${JSON.stringify(cdp.consoleErrors)}`);
      assert.equal(cdp.issues.length, 0, `CDP issues: ${JSON.stringify(cdp.issues)}`);
      assert.equal(cdp.dossierChecks, '12/12');
      assert.equal(cdp.businessJumps, '3/3');
      assert.equal(cdp.stationsAudited, '3/3');
      assert.equal(cdp.screenshots.length, 9);
      console.log(`[8/8] Headless CDP passed (0 errors, 0 overflow, Dossiers=${cdp.dossierChecks}, Shots=${cdp.screenshots.length}).`);
    }

    console.log('ALL SMOKE TESTS PASSED.');
  } finally {
    if (!keepTmp) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    } else {
      console.log(`Preserved tmpDir: ${tmpDir}`);
    }
  }
}

main().catch((err) => {
  console.error('SMOKE TEST FAILED:', err);
  process.exit(1);
});

// Generic v6 Single-File Interactive Mastery HTML Renderer
// Zero external dependencies. Supports any GitHub repository, any scale, and 11+ languages.

export function renderMasteryHtml(PAYLOAD) {
  const payloadJSON = JSON.stringify(PAYLOAD).replace(/<\//g, '<\\/');
  const meta = PAYLOAD.meta || {};
  const projectName = meta.projectName || 'OpenSource Repo';
  const logoChar = meta.logoChar || projectName.slice(0, 1).toUpperCase();
  const version = meta.version || 'main';
  const commit = meta.commit || '';
  const badgeText = commit ? `${version} · ${commit}` : version;
  const pageTitle = meta.title || `${projectName} 架构驱动 · 全链路源码学习系统 (${badgeText})`;
  const nav3Label = meta.workbenchNavLabel || `🗂️ 3. 目录与 ${Math.max(1, (PAYLOAD.workbenchModules?.length || 2) - 1)} 模块图谱`;
  const searchPlaceholder = meta.searchPlaceholder || `搜索 ${PAYLOAD.stations?.length || 0} 站全链路站点、${PAYLOAD.techArch?.components?.length || 0} 个架构组件、${PAYLOAD.businessFlow?.nodes?.length || 0} 个业务节点、高频考点或源码关键词 (Ctrl+K)...`;

  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle}</title>
<style>
  :root {
    --bg: #080d16;
    --bg-elev: #0e1625;
    --bg-panel: #121c2e;
    --bg-card: #10192a;
    --bg-hover: #1a2740;
    --border: #1d2b44;
    --border-strong: #2e4369;
    --text: #eaf1fb;
    --text-muted: #92a6c4;
    --text-dim: #647999;
    --accent: #38bdf8;
    --accent-2: #818cf8;
    --accent-soft: rgba(56, 189, 248, 0.14);
    --accent-ring: rgba(56, 189, 248, 0.45);
    --emerald: #34d399;
    --emerald-soft: rgba(52, 211, 153, 0.14);
    --amber: #fbbf24;
    --amber-soft: rgba(251, 191, 36, 0.14);
    --rose: #fb7185;
    --rose-soft: rgba(251, 113, 133, 0.14);
    --code-bg: #070b12;
    --gutter-bg: #0b111c;
    --line-hl: rgba(56, 189, 248, 0.15);
    --line-hover: rgba(148, 163, 184, 0.08);
    --canvas-dot: rgba(148, 163, 184, 0.13);

    --c-frontend-bg: #0c2638; --c-frontend-bd: #38bdf8; --c-frontend-tx: #bae6fd;
    --c-backend-bg:  #14203b; --c-backend-bd:  #60a5fa; --c-backend-tx:  #dbeafe;
    --c-database-bg: #0b2b24; --c-database-bd: #34d399; --c-database-tx: #d1fae5;
    --c-security-bg: #321322; --c-security-bd: #fb7185; --c-security-tx: #ffe4e6;
    --c-messagebus-bg:#2f200c;--c-messagebus-bd:#fbbf24;--c-messagebus-tx:#fef3c7;
    --c-cloud-bg:    #22163b; --c-cloud-bd:    #a78bfa; --c-cloud-tx:    #ede9fe;
    --c-external-bg: #1e293b; --c-external-bd: #94a3b8; --c-external-tx: #e2e8f0;

    --syn-kw: #c084fc; --syn-ty: #38bdf8; --syn-fn: #60a5fa;
    --syn-str: #34d399; --syn-num: #fbbf24; --syn-cmt: #64748b;
  }

  [data-theme="light"] {
    --bg: #f3f6fb;
    --bg-elev: #ffffff;
    --bg-panel: #f8fafd;
    --bg-card: #ffffff;
    --bg-hover: #edf2fa;
    --border: #dce4f0;
    --border-strong: #c0cde0;
    --text: #0f172a;
    --text-muted: #475569;
    --text-dim: #73849c;
    --accent: #0284c7;
    --accent-2: #4f46e5;
    --accent-soft: rgba(2, 132, 199, 0.10);
    --accent-ring: rgba(2, 132, 199, 0.35);
    --emerald: #059669;
    --emerald-soft: rgba(5, 150, 105, 0.11);
    --amber: #d97706;
    --amber-soft: rgba(217, 119, 6, 0.11);
    --rose: #e11d48;
    --rose-soft: rgba(225, 29, 72, 0.10);
    --code-bg: #ffffff;
    --gutter-bg: #f8fafc;
    --line-hl: rgba(2, 132, 199, 0.11);
    --line-hover: rgba(15, 23, 42, 0.04);
    --canvas-dot: rgba(15, 23, 42, 0.09);

    --c-frontend-bg: #e0f2fe; --c-frontend-bd: #0284c7; --c-frontend-tx: #075985;
    --c-backend-bg:  #eff6ff; --c-backend-bd:  #2563eb; --c-backend-tx:  #1e40af;
    --c-database-bg: #ecfdf5; --c-database-bd: #059669; --c-database-tx: #065f46;
    --c-security-bg: #fff1f2; --c-security-bd: #e11d48; --c-security-tx: #9f1239;
    --c-messagebus-bg:#fffbeb;--c-messagebus-bd:#d97706;--c-messagebus-tx:#92400e;
    --c-cloud-bg:    #f5f3ff; --c-cloud-bd:    #7c3aed; --c-cloud-tx:    #5b21b6;
    --c-external-bg: #f1f5f9; --c-external-bd: #64748b; --c-external-tx: #334155;

    --syn-kw: #7c3aed; --syn-ty: #0369a1; --syn-fn: #1d4ed8;
    --syn-str: #047857; --syn-num: #b45309; --syn-cmt: #64748b;
  }

  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 7px; height: 7px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 999px; }

  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 13.5px; line-height: 1.55;
  }

  .app { display: flex; flex-direction: column; height: 100vh; width: 100vw; }

  /* Top Bar */
  .topbar {
    height: 52px; padding: 0 16px; flex-shrink: 0; z-index: 40;
    background: var(--bg-elev); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .brand-logo {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 13px;
  }
  .brand-title { font-weight: 800; font-size: 14px; white-space: nowrap; }
  .brand-badge {
    font-size: 10.5px; padding: 2px 7px; border-radius: 999px; white-space: nowrap;
    background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring);
    font-family: ui-monospace, Consolas, monospace;
  }

  .nav-tabs {
    display: flex; align-items: center; gap: 3px;
    background: var(--bg); padding: 3px; border-radius: 9px; border: 1px solid var(--border);
  }
  .nav-tab {
    border: none; background: transparent; color: var(--text-muted);
    padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 600;
    white-space: nowrap; transition: all 0.15s;
  }
  .nav-tab:hover { color: var(--text); background: var(--bg-hover); }
  .nav-tab.active { background: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(56,189,248,0.28); }

  .top-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
  .rank-pill {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
    border-radius: 999px; font-size: 11.5px; font-weight: 700;
    background: var(--emerald-soft); color: var(--emerald); border: 1px solid rgba(52,211,153,0.35);
    white-space: nowrap; cursor: pointer;
  }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 5px;
    padding: 5px 11px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: var(--bg-panel); color: var(--text); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.14s; white-space: nowrap;
  }
  .btn:hover { background: var(--bg-hover); border-color: var(--border-strong); }
  .btn.cta {
    background: linear-gradient(135deg, #0284c7, #4f46e5); color: #fff; border: none;
    padding: 8px 16px; font-size: 13px; font-weight: 700; border-radius: 9px;
    box-shadow: 0 4px 14px rgba(56,189,248,0.26);
  }
  .btn.cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn.primary { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-ring); }
  .btn.success { background: var(--emerald-soft); color: var(--emerald); border-color: rgba(52,211,153,0.45); }
  .btn.success.done { background: var(--emerald); color: #052e16; border-color: var(--emerald); }
  .btn.active-toggle { background: var(--accent); color: #fff; border-color: var(--accent); }

  /* Main Stage */
  .stage { flex: 1; min-height: 0; overflow-y: auto; padding: 18px 24px 48px; }
  .stage.full-bleed { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
  .view { display: none; max-width: 1240px; margin: 0 auto; }
  .view.active { display: block; }
  .view.full-view { max-width: none; margin: 0; height: 100%; width: 100%; }
  .view.full-view.active { display: flex; flex-direction: column; }

  /* ===== VIEW 1: OVERVIEW (TECH ARCH + DATAFLOW + 3-FLOW SYLLABUS) ===== */
  .hero {
    background: linear-gradient(135deg, rgba(56,189,248,0.12), rgba(99,102,241,0.12));
    border: 1px solid var(--accent-ring); border-radius: 15px; padding: 18px 22px;
    margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; gap: 18px; flex-wrap: wrap;
  }
  .hero-left { flex: 1; min-width: 320px; }
  .hero-kicker {
    display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
    color: var(--accent); background: var(--accent-soft); padding: 2px 10px; border-radius: 999px; margin-bottom: 6px;
  }
  .hero h1 { margin: 0 0 6px; font-size: 20px; line-height: 1.3; }
  .hero p { margin: 0 0 12px; color: var(--text-muted); font-size: 13px; max-width: 720px; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

  .flow-progress-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .fp-chip {
    background: var(--bg-elev); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 12px; min-width: 145px; cursor: pointer; transition: all 0.14s;
  }
  .fp-chip:hover { border-color: var(--accent); }
  .fp-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 4px; }
  .fp-bar { height: 5px; background: var(--bg); border-radius: 999px; overflow: hidden; }
  .fp-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--emerald)); }

  .blueprint-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
    overflow: hidden; margin-bottom: 16px;
  }
  .bp-header {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 14px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-wrap: wrap;
  }
  .bp-tabs { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
  .bp-tab {
    border: 1px solid var(--border); background: var(--bg-elev); color: var(--text-muted);
    padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 700; transition: all 0.14s;
  }
  .bp-tab:hover { color: var(--text); border-color: var(--border-strong); }
  .bp-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  .bp-filters { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
  .flt-pill {
    border: 1px solid var(--border); background: var(--bg-elev); color: var(--text-muted);
    padding: 4px 10px; border-radius: 999px; cursor: pointer; font-size: 11.5px; font-weight: 600; transition: all 0.14s;
  }
  .flt-pill:hover { color: var(--text); }
  .flt-pill.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-ring); }

  .bp-canvas {
    padding: 10px 12px; background: var(--bg);
    background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .bp-svg { width: 100%; height: auto; display: block; user-select: none; }
  .bp-detail-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 16px; background: var(--bg-panel); border-top: 1px solid var(--border); flex-wrap: wrap;
  }

  /* ===== v6 Overview Module Dossier Deck & Fullscreen Modal ===== */
  .dos-deck { border-top: 1px solid var(--border); background: var(--bg-panel); }
  .dos-head {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 11px 16px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-wrap: wrap;
  }
  .dos-head-left { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
  .dos-title-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .dos-mode-badge {
    font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 999px;
    background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring); white-space: nowrap;
  }
  .dos-idx-pill {
    font-family: ui-monospace, Consolas, monospace; font-size: 10.5px; font-weight: 700;
    padding: 1px 7px; border-radius: 6px; background: var(--bg-elev); color: var(--text-muted);
    border: 1px solid var(--border); white-space: nowrap;
  }
  .dos-title-txt { font-size: 14px; font-weight: 800; color: var(--text); }
  .dos-sub-txt { font-size: 11.5px; color: var(--text-muted); }
  .dos-nav-grp { display: inline-flex; align-items: center; gap: 4px; }
  .dos-head-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }
  .dos-collapsed-bar {
    padding: 9px 16px; background: var(--bg-card); font-size: 12px; color: var(--text-muted);
    display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
  }
  .dos-collapsed-bar code {
    font-family: ui-monospace, Consolas, monospace; font-size: 11px;
    background: var(--bg); padding: 1px 4px; border-radius: 4px; color: var(--accent); border: 1px solid var(--border);
  }
  .dos-body {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
    padding: 14px 16px 16px; background: var(--bg-card);
  }
  .dos-card {
    background: var(--bg-panel); border: 1px solid var(--border); border-radius: 11px;
    padding: 12px 14px; display: flex; flex-direction: column; gap: 9px; min-width: 0;
  }
  .dos-card.full { grid-column: 1 / -1; }
  .dos-card-head {
    display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
    padding-bottom: 6px; border-bottom: 1px solid var(--border);
  }
  .dos-card-title { font-size: 12.5px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 6px; }
  .dos-card-sub { font-size: 11px; color: var(--text-dim); }
  .dos-deck code, .dos-modal-box code {
    font-family: ui-monospace, Consolas, monospace; font-size: 11px;
    background: var(--bg); padding: 1px 4px; border-radius: 4px; color: var(--accent); border: 1px solid var(--border);
  }
  .dos-role-box {
    background: var(--bg-elev); border: 1px solid var(--border); border-left: 3px solid var(--accent);
    border-radius: 8px; padding: 8px 11px; font-size: 12.2px; line-height: 1.56; color: var(--text);
  }
  .dos-why-box {
    background: var(--bg-elev); border: 1px solid var(--border); border-left: 3px solid var(--accent-2);
    border-radius: 8px; padding: 8px 11px; font-size: 12px; line-height: 1.55; color: var(--text-muted);
  }
  .dos-sub-lbl { font-size: 11px; font-weight: 800; color: var(--text-muted); margin-bottom: 3px; }
  .dos-problem-list { margin: 0; padding-left: 17px; font-size: 12px; line-height: 1.54; color: var(--text); }
  .dos-problem-list li { margin-bottom: 4px; }
  .dos-prin-item {
    background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px;
    padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;
  }
  .dos-prin-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .dos-prin-title { font-size: 12px; font-weight: 700; color: var(--text); }
  .dos-anchor-badge {
    font-family: ui-monospace, Consolas, monospace; font-size: 10.5px; padding: 1px 6px; border-radius: 5px;
    background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring);
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dos-prin-detail { font-size: 11.8px; color: var(--text-muted); line-height: 1.52; }
  .dos-incident {
    background: var(--bg-elev); border: 1px solid var(--border); border-radius: 9px;
    padding: 9px 11px; display: flex; flex-direction: column; gap: 5px;
  }
  .dos-incident.sev-p0 { border-left: 3px solid var(--rose); }
  .dos-incident.sev-p1 { border-left: 3px solid var(--amber); }
  .dos-sev-badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 1px 7px; border-radius: 999px;
    font-family: ui-monospace, Consolas, monospace; font-size: 10.5px; font-weight: 800;
  }
  .dos-sev-badge.p0 { background: var(--rose-soft); color: var(--rose); border: 1px solid rgba(251,113,133,0.42); }
  .dos-sev-badge.p1 { background: var(--amber-soft); color: var(--amber); border: 1px solid rgba(251,191,36,0.42); }
  .dos-inc-line { font-size: 11.8px; line-height: 1.5; color: var(--text); }
  .dos-inc-tag { font-weight: 800; color: var(--text-muted); margin-right: 4px; }
  .dos-neighbors-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .dos-nb-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); white-space: nowrap; }
  .dos-neighbor-chip {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px;
    border: 1px solid var(--border-strong); background: var(--bg-elev); color: var(--text);
    font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.14s;
  }
  .dos-neighbor-chip:hover { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
  .dos-neighbor-chip .nb-edge { font-size: 10px; color: var(--text-dim); }
  .dos-neighbor-chip:hover .nb-edge { color: var(--accent); }
  .dos-io-box {
    background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;
  }
  .dos-io-box.in { border-left: 3px solid var(--accent); }
  .dos-io-box.out { border-left: 3px solid var(--emerald); }
  .dos-io-sum { font-size: 11.8px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .dos-io-tbl { width: 100%; border-collapse: collapse; font-size: 11.3px; }
  .dos-io-tbl th, .dos-io-tbl td { padding: 4px 6px; border-top: 1px solid var(--border); text-align: left; vertical-align: top; }
  .dos-io-tbl th { border-top: none; color: var(--text-dim); font-size: 10.3px; background: var(--bg-panel); }
  .dos-io-transform {
    background: var(--accent-soft); border: 1px dashed var(--accent-ring); border-radius: 8px;
    padding: 7px 10px; font-size: 11.7px; color: var(--text); line-height: 1.5;
  }
  .dos-tag-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .dos-exam-tag {
    display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 999px;
    font-size: 11px; font-weight: 700; background: var(--emerald-soft); color: var(--emerald);
    border: 1px solid rgba(52,211,153,0.38);
  }
  .dos-qa-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .dos-qa-item {
    background: var(--bg-elev); border: 1px solid var(--border); border-radius: 9px;
    padding: 10px 12px; display: flex; flex-direction: column; gap: 7px;
  }
  .dos-qa-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .dos-qa-focus { font-size: 11px; color: var(--amber); font-weight: 700; }
  .dos-qa-q { font-size: 12.4px; font-weight: 700; color: var(--text); line-height: 1.5; }
  .dos-qa-ans {
    display: none; padding: 8px 10px; border-radius: 7px; background: var(--bg-panel);
    border-left: 3px solid var(--emerald); font-size: 12px; color: var(--text-muted); line-height: 1.58;
  }
  .dos-qa-ans.open { display: block; }

  /* Fullscreen Module Dossier Modal */
  .dos-modal {
    position: fixed; inset: 0; z-index: 210; display: none; align-items: center; justify-content: center;
    padding: 20px; background: rgba(4, 8, 16, 0.68); backdrop-filter: blur(4px);
  }
  .dos-modal.open { display: flex; }
  .dos-modal-box {
    width: 1140px; max-width: 94vw; max-height: 88vh; display: flex; flex-direction: column;
    border-radius: 14px; overflow: hidden; border: 1px solid var(--border-strong);
    background: var(--bg-card); box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  }
  .dos-modal-scroll { flex: 1; min-height: 0; overflow-y: auto; }

  /* Blueprint SVG styles */
  .stage-band-bg { fill: var(--bg-elev); fill-opacity: 0.45; stroke: var(--border); stroke-width: 1; rx: 8; }
  .stage-band-tx { fill: var(--text-muted); font-size: 11px; font-weight: 800; text-anchor: middle; }
  .row-lane-lbl { fill: var(--text-dim); font-size: 10.5px; font-weight: 800; }
  .boundary-rect { fill: rgba(56,189,248,0.035); stroke: var(--border-strong); stroke-width: 1.5; stroke-dasharray: 6 4; rx: 12; }
  .boundary-rect.sec { fill: rgba(251,113,133,0.045); stroke: rgba(251,113,133,0.45); }
  .boundary-lbl { fill: var(--text-muted); font-size: 11px; font-weight: 700; }
  .wf-phase-bg { fill: var(--bg-elev); stroke: var(--border-strong); stroke-width: 1; rx: 6; }
  .wf-phase-bg.emphasis { fill: var(--accent-soft); stroke: var(--accent-ring); }
  .wf-phase-bg.dashed { stroke-dasharray: 5 3; }
  .wf-phase-tx { fill: var(--text); font-size: 11px; font-weight: 800; text-anchor: middle; dominant-baseline: central; }
  .wf-lane-bg { fill: var(--bg-elev); fill-opacity: 0.36; stroke: var(--border); stroke-width: 1; rx: 10; }
  .wf-lane-bg.exception { fill: rgba(251,113,133,0.04); stroke: rgba(251,113,133,0.32); }
  .wf-lane-hdr { fill: var(--bg-panel); stroke: var(--border-strong); stroke-width: 1; rx: 8; }
  .wf-lane-hdr.exception { fill: var(--rose-soft); stroke: rgba(251,113,133,0.45); }
  .wf-lane-tx { fill: var(--text); font-size: 11px; font-weight: 800; text-anchor: middle; }
  .wf-lane-tx.exception { fill: var(--rose); }
  .wf-grp-rect { fill: rgba(56,189,248,0.03); stroke: var(--border-strong); stroke-width: 1.3; stroke-dasharray: 5 4; rx: 10; }
  .wf-grp-rect.emphasis { fill: rgba(56,189,248,0.055); stroke: rgba(56,189,248,0.45); stroke-dasharray: none; }
  .wf-grp-rect.security { fill: rgba(251,113,133,0.055); stroke: rgba(251,113,133,0.45); }
  .wf-grp-lbl { fill: var(--text-muted); font-size: 10px; font-weight: 700; }
  .src-chip-inline {
    display: inline-flex; align-items: center; gap: 4px; padding: 1px 6px; border-radius: 5px;
    font-family: ui-monospace, Consolas, monospace; font-size: 10.5px;
    background: var(--bg); border: 1px solid var(--border); color: var(--accent); margin-right: 5px;
  }

  .arch-node { cursor: pointer; transition: opacity 0.18s; }
  .arch-node .node-box { stroke-width: 1.5; transition: stroke-width 0.15s, filter 0.15s; }
  .arch-node:hover .node-box { stroke-width: 2.5; filter: drop-shadow(0 4px 12px rgba(56,189,248,0.28)); }
  .arch-node.active .node-box { stroke-width: 2.8; filter: drop-shadow(0 0 16px rgba(56,189,248,0.46)); }
  .arch-node.dimmed { opacity: 0.32; }
  .arch-node.peek .node-box { stroke-width: 2.6; stroke-dasharray: 5 3; }
  .arch-node .node-pulse { fill: none; stroke: var(--accent); stroke-width: 2; opacity: 0; pointer-events: none; }
  .arch-node.active .node-pulse { opacity: 0.8; animation: ringPulse 1.8s ease-out infinite; }
  @keyframes ringPulse { 0% { stroke-width: 2.5; opacity: 0.85; } 100% { stroke-width: 9; opacity: 0; } }
  .arch-node .node-title { font-size: 12.5px; font-weight: 700; pointer-events: none; }
  .arch-node .node-sub { font-size: 10px; opacity: 0.86; pointer-events: none; }
  .arch-node .node-src-chip { font-size: 9px; font-family: ui-monospace, Consolas, monospace; opacity: 0.82; pointer-events: none; }
  .arch-node .node-tag-bg { opacity: 0.22; pointer-events: none; }
  .arch-node .node-tag-tx { font-size: 9.2px; font-weight: 700; pointer-events: none; }
  .arch-node .node-step-badge { font-size: 9.5px; font-weight: 800; pointer-events: none; }

  .arch-edge { cursor: pointer; transition: opacity 0.2s; }
  .arch-edge .edge-hit { fill: none; stroke: transparent; stroke-width: 14; }
  .arch-edge .edge-path { fill: none; stroke-width: 1.8; transition: stroke-width 0.15s; }
  .arch-edge.variant-emphasis .edge-path { stroke: #38bdf8; stroke-width: 2.1; }
  .arch-edge.variant-security .edge-path { stroke: #fb7185; stroke-width: 2.1; }
  .arch-edge.variant-dashed .edge-path { stroke: #94a3b8; stroke-dasharray: 5 4; }
  .arch-edge.variant-default .edge-path { stroke: #64748b; }
  .arch-edge.active .edge-path, .arch-edge:hover .edge-path { stroke-width: 3; }
  .arch-edge.dimmed { opacity: 0.2; }
  .edge-label-bg { fill: var(--bg); stroke: var(--border); stroke-width: 1; rx: 4; }
  .edge-label-tx { fill: var(--text-muted); font-size: 9.5px; font-weight: 700; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  .flow-dot { fill: #38bdf8; pointer-events: none; }
  .flow-dot.security { fill: #fb7185; }
  .flow-dot.dashed { fill: #fbbf24; }
  body.still-motion .flow-dot { display: none; }

  /* 3-Flow Syllabus Table Section */
  .syllabus-flow {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
    padding: 14px 16px; margin-bottom: 14px;
  }
  .sf-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .sf-badge {
    font-size: 10.5px; font-weight: 800; padding: 2px 9px; border-radius: 999px;
    background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring);
  }
  .sf-badge.emerald { background: var(--emerald-soft); color: var(--emerald); border-color: rgba(52,211,153,0.4); }
  .sf-badge.rose { background: var(--rose-soft); color: var(--rose); border-color: rgba(251,113,133,0.4); }
  .sf-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .sf-table th, .sf-table td { padding: 9px 10px; border-top: 1px solid var(--border); text-align: left; vertical-align: middle; }
  .sf-table th { color: var(--text-dim); font-size: 11px; font-weight: 700; border-top: none; background: var(--bg-panel); }
  .sf-row { cursor: pointer; transition: background 0.12s; }
  .sf-row:hover { background: var(--bg-hover); }
  .st-code {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 8px; border-radius: 6px; font-family: ui-monospace, Consolas, monospace;
    font-size: 11px; font-weight: 800; background: var(--accent-soft); color: var(--accent);
  }
  .st-code.done { background: var(--emerald); color: #052e16; }

  /* ===== VIEW 2: STATION-BY-STATION PROGRESSIVE STUDIO (METRO + LEFT CODE <-> RIGHT FLOW) ===== */
  .metro-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 8px 14px; background: var(--bg-elev); border-bottom: 1px solid var(--border);
    flex-shrink: 0; flex-wrap: wrap;
  }
  .metro-flow-tabs { display: flex; gap: 4px; }
  .metro-flow-btn {
    border: 1px solid var(--border); background: var(--bg-panel); color: var(--text-muted);
    padding: 4px 10px; border-radius: 7px; cursor: pointer; font-size: 11.5px; font-weight: 700;
  }
  .metro-flow-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  .metro-track { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; flex-wrap: wrap; }
  .metro-stop {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px;
    border: 1px solid var(--border); background: var(--bg-panel); color: var(--text-muted);
    cursor: pointer; font-size: 11.5px; font-weight: 600; transition: all 0.14s;
  }
  .metro-stop:hover { color: var(--text); border-color: var(--border-strong); }
  .metro-stop.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); font-weight: 800; }
  .metro-stop.done { border-color: rgba(52,211,153,0.45); color: var(--emerald); }
  .metro-arrow { color: var(--text-dim); font-size: 11px; user-select: none; }

  .station-context {
    display: grid; grid-template-columns: 1fr 1.35fr 1fr; gap: 10px;
    padding: 10px 14px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .ctx-box { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 9px; padding: 8px 11px; }
  .ctx-box.in { border-left: 3px solid var(--accent); }
  .ctx-box.mid { border-left: 3px solid var(--emerald); }
  .ctx-box.out { border-left: 3px solid var(--amber); }
  .ctx-lbl { font-size: 10.5px; font-weight: 800; color: var(--text-muted); margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center; }
  .ctx-txt { font-size: 12px; color: var(--text); line-height: 1.48; }
  .ctx-txt code, .exp-body code, .quiz-exp code, .ins-body code, .pitch-script code, .exam-ans code {
    font-family: ui-monospace, Consolas, monospace; font-size: 11px;
    background: var(--bg); padding: 1px 4px; border-radius: 4px; color: var(--accent); border: 1px solid var(--border);
  }

  .station-split { display: flex; flex: 1; min-height: 0; overflow: hidden; }
  .st-left {
    width: 50%; min-width: 340px; display: flex; flex-direction: column;
    background: var(--code-bg); border-right: 1px solid var(--border); min-height: 0;
  }
  .st-right {
    flex: 1; min-width: 340px; display: flex; flex-direction: column;
    background: var(--bg); min-height: 0; overflow-y: auto; padding: 12px 14px 20px;
  }

  .st-code-head {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 6px 10px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .st-file-tabs { display: flex; gap: 4px; overflow-x: auto; }
  .st-file-tab {
    border: 1px solid transparent; background: transparent; color: var(--text-muted);
    padding: 4px 9px; border-radius: 6px; cursor: pointer; font-size: 11.5px;
    font-family: ui-monospace, Consolas, monospace; white-space: nowrap;
  }
  .st-file-tab:hover { background: var(--bg-hover); color: var(--text); }
  .st-file-tab.active { background: var(--code-bg); color: var(--accent); border-color: var(--border-strong); font-weight: 700; }

  .st-path-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 4px 12px; background: var(--gutter-bg); border-bottom: 1px solid var(--border);
    font-size: 11px; color: var(--text-muted); flex-shrink: 0; font-family: ui-monospace, Consolas, monospace;
  }
  .st-path-bar > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .st-code-scroll { flex: 1; overflow: auto; scroll-behavior: smooth; padding-bottom: 36px; }

  .code-table { width: 100%; border-collapse: collapse; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.2px; line-height: 1.58; }
  .code-row.mapped { cursor: pointer; }
  .code-row.mapped:hover { background: var(--line-hover); }
  .code-row.active-line { background: var(--line-hl) !important; }
  .ln-cell {
    width: 50px; min-width: 50px; text-align: right; padding: 0 9px 0 6px;
    color: var(--text-dim); user-select: none; background: var(--gutter-bg);
    border-left: 3px solid transparent; position: sticky; left: 0;
  }
  .code-row.mapped .ln-cell { border-left-color: rgba(56,189,248,0.35); color: var(--text-muted); }
  .code-row.active-line .ln-cell { border-left-color: var(--accent); color: var(--accent); font-weight: 800; }
  .code-cell { padding: 0 12px 0 10px; white-space: pre; tab-size: 4; color: var(--text); }
  .syn-kw { color: var(--syn-kw); font-weight: 500; }
  .syn-ty { color: var(--syn-ty); }
  .syn-fn { color: var(--syn-fn); }
  .syn-str { color: var(--syn-str); }
  .syn-num { color: var(--syn-num); }
  .syn-cmt { color: var(--syn-cmt); font-style: italic; }

  /* Per-line Chinese Code Annotations (v5) */
  .note-mode-group {
    display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;
    background: var(--bg); padding: 2px; border-radius: 6px; border: 1px solid var(--border);
  }
  .note-mode-btn {
    border: none; background: transparent; color: var(--text-muted);
    padding: 2px 7px; border-radius: 4px; cursor: pointer; font-size: 10.5px; font-weight: 700; white-space: nowrap;
  }
  .note-mode-btn:hover { color: var(--text); }
  .note-mode-btn.active { background: var(--emerald-soft); color: var(--emerald); }
  .code-note-inline {
    margin-left: 14px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
    font-size: 11px; color: var(--emerald); opacity: 0.88; font-style: normal; user-select: none;
  }
  .code-note-row td { padding-top: 0; padding-bottom: 3px; }
  .code-note-row.mapped { cursor: pointer; }
  .code-note-row.active-line { background: var(--line-hl) !important; }
  .code-note-ln {
    width: 50px; min-width: 50px; background: var(--gutter-bg);
    border-left: 3px solid transparent; position: sticky; left: 0;
  }
  .code-note-row.mapped .code-note-ln { border-left-color: rgba(56,189,248,0.22); }
  .code-note-row.active-line .code-note-ln { border-left-color: var(--accent); }
  .code-note-cell {
    padding: 0 12px 2px 10px; white-space: pre-wrap; word-break: break-word;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
    font-size: 11px; line-height: 1.38; color: var(--emerald); opacity: 0.88;
  }
  .code-note-indent { font-family: ui-monospace, Consolas, monospace; white-space: pre; opacity: 0.45; }

  /* STEP 1: Why This Code Exists (v2 Pedagogy brought into v5) */
  .why-panel {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px;
    padding: 11px 13px; margin-bottom: 10px;
  }
  .why-head {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    margin-bottom: 9px;
  }
  .step-pill {
    display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px;
    font-family: ui-monospace, Consolas, monospace; font-size: 10px; font-weight: 800;
    background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring);
    margin-right: 6px;
  }
  .why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .why-box {
    background: var(--bg-panel); border: 1px solid var(--border); border-radius: 9px;
    padding: 9px 11px;
  }
  .why-box.pain { border-left: 3px solid var(--accent); }
  .why-box.analogy { border-left: 3px solid var(--emerald); }
  .why-box-title { font-size: 11px; font-weight: 800; margin-bottom: 4px; }
  .why-box.pain .why-box-title { color: var(--accent); }
  .why-box.analogy .why-box-title { color: var(--emerald); }
  .why-box-body { font-size: 12px; color: var(--text); line-height: 1.54; }
  .why-avoid {
    margin-top: 8px; padding: 8px 11px; border-radius: 8px; font-size: 11.8px; line-height: 1.5;
    background: var(--amber-soft); border: 1px solid rgba(251,191,36,0.36); color: var(--text);
  }
  .why-avoid strong { color: var(--amber); }
  .why-box-body code, .why-avoid code, .io-transform-list code, .io-table code {
    font-family: ui-monospace, Consolas, monospace; font-size: 11px;
    background: var(--bg); padding: 1px 4px; border-radius: 4px; color: var(--accent); border: 1px solid var(--border);
  }
  .why-panel.collapsed .why-body-wrap { display: none; }
  .why-panel.collapsed .why-head { margin-bottom: 0; }

  /* STEP 3: Concrete Input / Transform / Output Data Contract Inspector (v5) */
  .io-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
  .io-tab {
    border: 1px solid var(--border); background: var(--bg-panel); color: var(--text-muted);
    padding: 3px 9px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700;
  }
  .io-tab:hover { color: var(--text); }
  .io-tab.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-ring); }
  .io-block {
    margin-top: 8px; background: var(--bg-panel); border: 1px solid var(--border);
    border-radius: 9px; padding: 9px 11px;
  }
  .io-block.in { border-left: 3px solid var(--accent); }
  .io-block.tr { border-left: 3px solid var(--accent-2); }
  .io-block.out { border-left: 3px solid var(--emerald); }
  .io-block-head {
    display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .io-block-title { font-size: 11.5px; font-weight: 800; }
  .io-block.in .io-block-title { color: var(--accent); }
  .io-block.tr .io-block-title { color: var(--accent-2); }
  .io-block.out .io-block-title { color: var(--emerald); }
  .io-type-badge {
    font-family: ui-monospace, Consolas, monospace; font-size: 10.5px; padding: 2px 7px;
    border-radius: 5px; background: var(--bg); border: 1px solid var(--border); color: var(--text-muted);
  }
  .io-table { width: 100%; border-collapse: collapse; font-size: 11.3px; margin-bottom: 7px; }
  .io-table th, .io-table td { padding: 4px 7px; border-top: 1px solid var(--border); text-align: left; vertical-align: top; }
  .io-table th { color: var(--text-dim); font-size: 10.5px; border-top: none; background: var(--bg-elev); }
  .io-transform-list { margin: 0; padding-left: 18px; font-size: 11.8px; line-height: 1.56; color: var(--text); }
  .io-transform-list li { margin-bottom: 3px; }
  .io-pre {
    margin: 0; padding: 8px 10px; border-radius: 7px;
    background: var(--code-bg); border: 1px solid var(--border);
    font-family: ui-monospace, Consolas, monospace; font-size: 11px; line-height: 1.48;
    white-space: pre-wrap; word-break: break-word; overflow-x: auto;
  }
  .io-pre.in { color: var(--accent); }
  .io-pre.out { color: var(--emerald); }
  .ctx-jump-link {
    border: none; background: transparent; color: var(--accent); cursor: pointer;
    font-size: 10.5px; font-weight: 700; padding: 0; text-decoration: underline;
  }
  .ctx-box.out .ctx-jump-link { color: var(--amber); }

  .mini-panel {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px;
    padding: 11px 13px; margin-bottom: 10px;
  }
  .mp-title { font-size: 12.5px; font-weight: 800; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .st-mini-svg { width: 100%; height: auto; display: block; user-select: none; background: var(--bg); border-radius: 8px; border: 1px solid var(--border); }
  .exp-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px; margin-top: 9px; }
  .exp-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
  .exp-box.info { border-left: 3px solid var(--accent); }
  .exp-box.warn { border-left: 3px solid var(--rose); }
  .exp-head { font-size: 10.5px; font-weight: 800; color: var(--accent); margin-bottom: 3px; }
  .exp-box.warn .exp-head { color: var(--rose); }
  .exp-body { font-size: 12px; color: var(--text); line-height: 1.5; }
  .packet-pre {
    margin: 5px 0 0; padding: 7px 10px; border-radius: 7px;
    background: var(--code-bg); border: 1px solid var(--border);
    font-family: ui-monospace, Consolas, monospace; font-size: 11px; color: var(--emerald);
    white-space: pre-wrap; word-break: break-word;
  }

  .quiz-opts { display: grid; gap: 6px; }
  .quiz-opt {
    width: 100%; text-align: left; padding: 7px 11px; border-radius: 8px;
    border: 1px solid var(--border-strong); background: var(--bg-panel); color: var(--text);
    cursor: pointer; font-size: 12px; display: flex; align-items: flex-start; gap: 8px;
  }
  .quiz-opt:hover { border-color: var(--accent); background: var(--bg-hover); }
  .quiz-opt.correct { background: var(--emerald-soft); border-color: var(--emerald); font-weight: 600; }
  .quiz-opt.wrong { background: var(--rose-soft); border-color: var(--rose); }
  .opt-letter {
    width: 19px; height: 19px; border-radius: 50%; flex-shrink: 0;
    display: grid; place-items: center; font-size: 10.5px; font-weight: 800;
    background: var(--bg-elev); border: 1px solid var(--border-strong); color: var(--text-muted);
  }
  .quiz-opt.correct .opt-letter { background: var(--emerald); color: #052e16; border-color: var(--emerald); }
  .quiz-opt.wrong .opt-letter { background: var(--rose); color: #fff; border-color: var(--rose); }
  .quiz-exp {
    margin-top: 8px; padding: 8px 11px; border-radius: 8px; font-size: 12px; display: none;
    background: var(--emerald-soft); border: 1px solid rgba(52,211,153,0.4);
  }
  .quiz-exp.show { display: block; }
  .quiz-exp.fail { background: var(--rose-soft); border-color: rgba(251,113,133,0.4); }

  .station-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 7px 14px; background: var(--bg-elev); border-top: 1px solid var(--border); flex-shrink: 0;
  }

  /* ===== VIEW 3: INTEGRATED PANORAMIC WORKBENCH ===== */
  .wb-subbar {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 6px 12px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .wb-nav-left { display: flex; align-items: center; gap: 6px; }
  .wb-module-tabs { display: flex; align-items: center; gap: 3px; background: var(--bg); padding: 2px; border-radius: 8px; border: 1px solid var(--border); }
  .wb-module-tab { border: none; background: transparent; color: var(--text-muted); padding: 4px 9px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .wb-module-tab:hover { color: var(--text); background: var(--bg-hover); }
  .wb-module-tab.active { background: var(--accent); color: #fff; }
  .wb-picker { position: relative; }
  .wb-picker-btn { border: 1px solid var(--border-strong); background: var(--bg-elev); color: var(--text); padding: 4px 10px; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .wb-picker-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .wb-menu { display: none; position: absolute; top: calc(100% + 6px); left: 0; z-index: 140; width: 280px; background: var(--bg-elev); border: 1px solid var(--border-strong); border-radius: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.48); padding: 6px; }
  .wb-menu.open { display: block; }
  .wb-menu-item { width: 100%; border: none; background: transparent; color: var(--text); text-align: left; padding: 6px 8px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; font-size: 12px; }
  .wb-menu-item:hover { background: var(--bg-hover); }
  .wb-menu-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; }

  .wb-split { display: flex; flex: 1; min-height: 0; overflow: hidden; }
  .wb-pane-code { width: 48%; min-width: 320px; display: flex; flex-direction: column; background: var(--code-bg); border-right: 1px solid var(--border); min-height: 0; }
  .wb-code-header { display: flex; padding: 5px 10px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .wb-file-tabs { display: flex; gap: 4px; overflow-x: auto; flex: 1; }
  .wb-file-tab { border: 1px solid transparent; background: transparent; color: var(--text-muted); padding: 4px 9px; border-radius: 6px; cursor: pointer; font-size: 11.5px; font-family: ui-monospace, Consolas, monospace; white-space: nowrap; }
  .wb-file-tab.active { background: var(--code-bg); color: var(--text); border-color: var(--border-strong); font-weight: 700; }
  .wb-file-tab.peek { border-color: var(--accent); color: var(--accent); }
  .wb-tree-toolbar { display: none; align-items: center; gap: 6px; padding: 6px 10px; background: var(--gutter-bg); border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .wb-tree-toolbar.visible { display: flex; }
  .wb-tree-filter { flex: 1; padding: 4px 9px; border-radius: 6px; font-size: 12px; background: var(--code-bg); color: var(--text); border: 1px solid var(--border-strong); outline: none; }
  .wb-path-bar { display: flex; justify-content: space-between; gap: 10px; padding: 4px 12px; background: var(--gutter-bg); border-bottom: 1px solid var(--border); font-size: 11px; color: var(--text-muted); flex-shrink: 0; font-family: ui-monospace, Consolas, monospace; }
  .wb-path-bar > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wb-code-scroll { flex: 1; overflow: auto; padding: 6px 0 48px; scroll-behavior: smooth; }
  .region-banner-row td { padding: 6px 12px 3px 10px; background: var(--code-bg); }
  .region-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring); cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; }
  .region-pill.active, .region-pill:hover { background: var(--accent); color: #fff; }
  .jump-chip { display: inline-flex; align-items: center; gap: 4px; margin-left: 6px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: var(--emerald-soft); color: var(--emerald); border: 1px solid rgba(52,211,153,0.42); cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; }
  .jump-chip:hover { background: var(--emerald); color: #052e16; }
  .code-row.filter-hidden, .region-banner-row.filter-hidden { display: none; }
  .tree-branch { color: var(--text-dim); }
  .tree-dir { color: var(--accent); font-weight: 700; }
  .tree-route { color: var(--syn-num); font-weight: 600; }
  .tree-file { color: var(--text); }
  .tree-cmt { color: var(--syn-str); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif; font-size: 12px; }

  .splitter { width: 6px; cursor: col-resize; background: var(--bg); border-left: 1px solid var(--border); border-right: 1px solid var(--border); flex-shrink: 0; }
  .splitter:hover, .splitter.dragging { background: var(--accent); }

  .wb-pane-diagram { flex: 1; min-width: 320px; display: flex; flex-direction: column; background: var(--bg); min-height: 0; }
  .wb-diag-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 12px; background: var(--bg-panel); border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .wb-diag-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
  .wb-back-btn { display: none; padding: 4px 9px; border-radius: 7px; font-size: 11.5px; font-weight: 700; background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-ring); cursor: pointer; white-space: nowrap; }
  .wb-back-btn.visible { display: inline-flex; }
  .wb-canvas-wrap { flex: 1; position: relative; overflow: hidden; cursor: grab; background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1px); background-size: 20px 20px; }
  .wb-canvas-svg { width: 100%; height: 100%; display: block; user-select: none; }
  .icon-btn { padding: 4px 8px; border-radius: 5px; border: 1px solid var(--border); background: var(--bg-elev); color: var(--text-muted); cursor: pointer; font-size: 11.5px; white-space: nowrap; }
  .icon-btn.on { color: var(--accent); border-color: var(--accent-ring); background: var(--accent-soft); }
  .wb-inspector { flex-shrink: 0; background: var(--bg-elev); border-top: 1px solid var(--border); }
  .wb-ins-bar { display: flex; justify-content: space-between; align-items: center; padding: 5px 14px; border-bottom: 1px solid var(--border); background: var(--bg-panel); }
  .wb-ins-grid { display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 10px; padding: 9px 14px; max-height: 138px; overflow-y: auto; }
  .wb-inspector.collapsed .wb-ins-grid { display: none; }
  .ins-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; padding: 8px 11px; }
  .ins-body { font-size: 12px; line-height: 1.5; color: var(--text-muted); }

  /* ===== VIEW 4: INTERVIEW ===== */
  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; margin-bottom: 14px; }
  .card-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 9px; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
  .pitch-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .pitch-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; }
  .pitch-script { font-size: 12.5px; line-height: 1.6; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border); }
  .skip-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .skip-table th, .skip-table td { padding: 9px 11px; border-bottom: 1px solid var(--border); text-align: left; }
  .skip-table th { background: var(--bg-panel); color: var(--text-muted); font-size: 11.5px; }
  .exam-list { display: grid; gap: 8px; }
  .exam-item { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; }
  .exam-item.checked { border-color: rgba(52,211,153,0.45); }
  .exam-ans { display: none; margin-top: 8px; padding: 8px 12px; border-radius: 8px; background: var(--bg-elev); border-left: 3px solid var(--emerald); font-size: 12.5px; color: var(--text-muted); }
  .exam-ans.open { display: block; }

  /* Search Modal */
  .search-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.58); z-index: 200; display: none; align-items: flex-start; justify-content: center; padding-top: 9vh; }
  .search-modal.open { display: flex; }
  .search-box { width: 600px; max-width: 92vw; background: var(--bg-elev); border: 1px solid var(--border-strong); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
  .search-input { width: 100%; padding: 12px 15px; border: none; outline: none; background: transparent; color: var(--text); font-size: 14px; border-bottom: 1px solid var(--border); }
  .search-results { max-height: 380px; overflow-y: auto; padding: 6px; }
  .search-item { padding: 8px 11px; border-radius: 7px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .search-item:hover { background: var(--bg-hover); }

  @media (max-width: 980px) {
    .station-context, .exp-grid, .pitch-grid, .wb-ins-grid, .dos-body, .dos-qa-grid { grid-template-columns: 1fr; }
    .station-split, .wb-split { flex-direction: column; }
    .st-left, .wb-pane-code { width: 100% !important; height: 45%; border-right: none; border-bottom: 1px solid var(--border); }
    .splitter { display: none; }
    .brand-badge { display: none; }
  }
</style>
</head>
<body>
<div class="app">
  <!-- Top Bar -->
  <header class="topbar">
    <div class="brand">
      <div class="brand-logo">${logoChar}</div>
      <div class="brand-title">${projectName} 架构驱动 · 全链路源码学习系统</div>
      <span class="brand-badge">${badgeText}</span>
    </div>

    <nav class="nav-tabs" id="navTabs">
      <button class="nav-tab active" data-view="overview">🏛️ 1. 架构与全链路总览</button>
      <button class="nav-tab" data-view="station">🚆 2. 沿链路循序精读</button>
      <button class="nav-tab" data-view="workbench">${nav3Label}</button>
      <button class="nav-tab" data-view="interview">🎯 4. 面试总考与避坑</button>
    </nav>

    <div class="top-right">
      <span class="rank-pill" id="rankPill" title="查看全链路通关进度">已通关 0 / ${PAYLOAD.stations?.length || 0} 站</span>
      <button class="btn" id="btnSearch" title="全局搜索 (Ctrl+K)">🔍 搜索</button>
      <button class="btn" id="btnTheme" title="切换深浅色主题">☀ 浅色</button>
    </div>
  </header>

  <main class="stage" id="stage">
    <!-- VIEW 1: ARCHITECTURE + 3-FLOW DATAFLOW OVERVIEW + SYLLABUS -->
    <section class="view active" id="viewOverview"></section>

    <!-- VIEW 2: STATION-BY-STATION PROGRESSIVE LEARNING STUDIO (METRO + LEFT CODE <-> RIGHT FLOW) -->
    <section class="view full-view" id="viewStation"></section>

    <!-- VIEW 3: INTEGRATED FULL-SCREEN DIRECTORY TREE + 9-MODULE WORKBENCH -->
    <section class="view full-view" id="viewWorkbench">
      <div class="wb-subbar">
        <div class="wb-nav-left">
          <div class="wb-module-tabs" id="wbModuleTabs"></div>
          <div class="wb-picker" id="wbPicker">
            <button class="wb-picker-btn" id="wbBtnPicker">📂 全部模块 ▾</button>
            <div class="wb-menu" id="wbMenu"></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn success" id="wbBtnGoStation">🚆 回到对应链路站点</button>
          <button class="btn" id="wbBtnPrev">◀ 上一步</button>
          <span style="font-family:ui-monospace,Consolas,monospace;font-size:11px;color:var(--text-muted)" id="wbStepCounter">1/9</span>
          <button class="btn primary" id="wbBtnNext">下一步 ▶</button>
          <button class="btn" id="wbBtnPlay">▶ 自动演练</button>
        </div>
      </div>
      <div class="wb-split">
        <section class="wb-pane-code" id="wbPaneCode">
          <div class="wb-code-header" style="align-items:center;justify-content:space-between;gap:8px">
            <div class="wb-file-tabs" id="wbFileTabs"></div>
            <div class="note-mode-group" id="wbNoteModeGroup" style="display:none" title="切换源码中文逐行备注展示方式">
              <button class="note-mode-btn active" data-nmode="below">💬 行下备注</button>
              <button class="note-mode-btn" data-nmode="inline">行尾</button>
              <button class="note-mode-btn" data-nmode="off">隐藏</button>
            </div>
          </div>
          <div class="wb-tree-toolbar" id="wbTreeToolbar">
            <input class="wb-tree-filter" id="wbTreeFilter" placeholder="过滤目录、文件名、路由或中文备注..." />
            <button class="icon-btn" id="wbBtnCopyTree">📋 复制目录树</button>
          </div>
          <div class="wb-path-bar"><span id="wbActiveFilePath">—</span><span id="wbCodeLinkStatus">双向点击定位</span></div>
          <div class="wb-code-scroll" id="wbCodeScroll"><table class="code-table" id="wbCodeTable"></table></div>
        </section>
        <div class="splitter" id="wbSplitter" title="拖动调整左右宽度"></div>
        <section class="wb-pane-diagram">
          <div class="wb-diag-header">
            <div class="wb-diag-left">
              <button class="wb-back-btn" id="wbBtnBackOverview">← 返回全景</button>
              <div style="min-width:0">
                <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="wbDiagramTitle">—</div>
                <div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="wbDiagramSub">—</div>
              </div>
            </div>
            <div style="display:flex;gap:4px;align-items:center">
              <button class="icon-btn on" id="wbBtnOverviewMode" style="display:none">🚀 点击进图</button>
              <button class="icon-btn" id="wbBtnZoomOut">−</button>
              <button class="icon-btn" id="wbBtnZoomReset">适配</button>
              <button class="icon-btn" id="wbBtnZoomIn">+</button>
              <button class="icon-btn on" id="wbBtnMotion">⚡ 动效</button>
              <button class="icon-btn" id="wbBtnClearFocus">全部</button>
            </div>
          </div>
          <div class="wb-canvas-wrap" id="wbCanvasWrap">
            <svg class="wb-canvas-svg" id="wbSvg" xmlns="http://www.w3.org/2000/svg"></svg>
          </div>
        </section>
      </div>
      <footer class="wb-inspector" id="wbInspector">
        <div class="wb-ins-bar">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <strong id="wbInsNodeName" style="font-size:13px">—</strong>
            <span style="font-family:ui-monospace,Consolas,monospace;font-size:11px;padding:2px 7px;border-radius:5px;background:var(--accent-soft);color:var(--accent);cursor:pointer" id="wbInsLoc">—</span>
            <button class="jump-chip" id="wbInsJumpBtn" style="display:none">↗ 进入流程图</button>
          </div>
          <button class="icon-btn" id="wbBtnToggleIns">收起精讲 ▾</button>
        </div>
        <div class="wb-ins-grid">
          <div class="ins-card"><div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:4px">⚙ 核心源码机制</div><div class="ins-body" id="wbInsDeepDive"></div></div>
          <div class="ins-card"><div style="font-size:11px;font-weight:700;color:var(--amber);margin-bottom:4px">⚠ 线上避坑与边界</div><div class="ins-body" id="wbInsPitfall"></div></div>
          <div class="ins-card"><div style="font-size:11px;font-weight:700;color:var(--rose);margin-bottom:4px">🎯 面试高频追问与答法</div><div class="ins-body" id="wbInsInterview"></div></div>
        </div>
      </footer>
    </section>

    <!-- VIEW 4: INTERVIEW SPRINT & 10-QUESTION EXAM -->
    <section class="view" id="viewInterview"></section>
  </main>
</div>

<!-- Search Modal -->
<div class="search-modal" id="searchModal">
  <div class="search-box">
    <input class="search-input" id="searchInput" placeholder="${searchPlaceholder}" />
    <div class="search-results" id="searchResults"></div>
  </div>
</div>

<!-- Overview Module Fullscreen Dossier Modal -->
<div class="dos-modal" id="dossierModal">
  <div class="dos-modal-box" id="dossierModalBox"></div>
</div>

<script>
const DATA = ${payloadJSON};
const WB_MODULES = DATA.workbenchModules || [];
const FIRST_STATION_ID = (DATA.flows?.[0]?.stationIds?.[0]) || (DATA.stations?.[0]?.id) || '';
const STORAGE_KEY = (DATA.meta && DATA.meta.storageKey) || ('repo_mastery_' + String(DATA.meta?.projectName || 'repo').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_v1');

const TYPE_VAR = {
  frontend: 'frontend', backend: 'backend', database: 'database',
  security: 'security', messagebus: 'messagebus', cloud: 'cloud', external: 'external',
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    currentStationId: FIRST_STATION_ID,
    completed: [],
    quizChoice: {},
    quizPassed: {},
    examChecked: {},
  };
}
const progress = loadProgress();
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
}

const ui = {
  view: 'overview', // overview | station | workbench | interview
  blueprintMode: 'dataflow', // dataflow | techarch | businessflow
  flowFilter: 'all',
  bizFilter: 'all',
  selectedTechCompId: (DATA.techArch?.components?.[0]?.id) || '',
  selectedDfStationId: FIRST_STATION_ID,
  selectedBizNodeId: (DATA.businessFlow?.nodes?.[0]?.id) || '',
  dossierCollapsed: false,
  dossierModalOpen: false,
  dossierOpenAns: {},
  activeStepId: null,
  activeFileId: null,
  noteMode: 'below', // below | inline | off
  ioTab: 'all', // all | in | tr | out
  whyCollapsed: false,
};

const wb = {
  moduleIdx: 0, activeFileId: null, activeNodeId: null, activeEdgeId: null,
  playing: false, playTimer: null, motionOn: true,
  zoom: 1, panX: 0, panY: 0, treeFilter: '',
  overviewClickMode: 'drill', lastOverviewNodeId: (WB_MODULES[0]?.nodes?.[0]?.id) || null, initialized: false,
};

const $ = (id) => document.getElementById(id);
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function formatInline(s) {
  return escapeHtml(s)
    .replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>');
}
function textUnits(s) {
  let u = 0; for (const ch of s) u += ch.charCodeAt(0) > 127 ? 1.85 : 1.0; return u;
}

// ===== Shared Multi-language Syntax Highlighter (18+ Languages + Plain Fallback) =====
const GO_KW = new Set(['package','import','func','return','if','else','for','range','switch','case','default','type','struct','interface','map','chan','go','defer','select','break','continue','const','var']);
const GO_TY = new Set(['string','int','int64','uint64','float64','bool','byte','rune','error','any','nil','true','false']);
const PY_KW = new Set(['def','class','return','if','elif','else','for','in','while','try','except','finally','with','as','import','from','yield','raise','pass','and','or','not','is','lambda','async','await','match','case']);
const PY_TY = new Set(['None','True','False','str','int','float','bool','dict','list','tuple','bytes','Optional','Any','Union','Callable']);
const TS_KW = new Set(['import','export','from','type','interface','const','let','var','function','async','await','return','if','else','for','of','in','new','try','catch','finally','throw','switch','case','default','class','extends','implements','private','public','readonly','typeof','keyof','as']);
const TS_TY = new Set(['string','number','boolean','any','void','null','undefined','true','false','Record','Array','Promise','Map','Set','Partial']);
const RS_KW = new Set(['fn','let','mut','pub','use','mod','struct','enum','impl','trait','for','in','if','else','match','loop','while','return','async','await','move','ref','where','type','const','static','unsafe','crate','self','Self']);
const RS_TY = new Set(['String','str','usize','isize','i32','i64','u32','u64','f32','f64','bool','Option','Result','Some','None','Ok','Err','Vec','Box','Arc','true','false']);
const JAVA_KW = new Set(['package','import','public','private','protected','class','interface','extends','implements','static','final','void','return','if','else','for','while','switch','case','default','new','try','catch','finally','throw','throws','this','super','synchronized','abstract','record','var']);
const JAVA_TY = new Set(['String','int','long','double','float','boolean','byte','char','Integer','Long','Boolean','List','Map','Set','Optional','Object','null','true','false']);
const CPP_KW = new Set(['include','define','namespace','using','class','struct','public','private','protected','template','typename','virtual','override','const','constexpr','auto','return','if','else','for','while','switch','case','default','new','delete','try','catch','throw','sizeof','static','extern','inline','enum']);
const CPP_TY = new Set(['void','int','long','double','float','bool','char','size_t','uint32_t','uint64_t','int64_t','std','string','vector','map','unique_ptr','shared_ptr','nullptr','true','false']);
const RB_KW = new Set(['def','class','module','end','do','if','elsif','else','unless','case','when','while','until','for','in','return','yield','begin','rescue','ensure','raise','require','require_relative','include','extend','attr_reader','attr_accessor','attr_writer','self','super','and','or','not','then']);
const RB_TY = new Set(['nil','true','false','String','Integer','Float','Array','Hash','Symbol','Object']);
const PHP_KW = new Set(['namespace','use','class','interface','trait','extends','implements','public','private','protected','static','final','abstract','function','fn','return','if','elseif','else','foreach','for','while','switch','case','default','match','new','try','catch','finally','throw','const','echo','as','yield']);
const PHP_TY = new Set(['string','int','float','bool','array','object','mixed','void','null','true','false','self','parent']);
const CS_KW = new Set(['namespace','using','public','private','protected','internal','class','struct','record','interface','enum','static','readonly','const','sealed','abstract','virtual','override','async','await','return','if','else','for','foreach','in','while','switch','case','default','new','try','catch','finally','throw','var','get','set','init','this','base']);
const CS_TY = new Set(['void','string','int','long','double','float','decimal','bool','byte','char','object','Task','List','Dictionary','IEnumerable','null','true','false']);
const SWIFT_KW = new Set(['import','struct','class','enum','protocol','extension','actor','func','init','deinit','let','var','public','private','fileprivate','internal','open','static','final','override','async','await','throws','rethrows','try','catch','throw','return','if','else','guard','for','in','while','switch','case','default','where','self','Self','super','typealias']);
const SWIFT_TY = new Set(['String','Int','Double','Float','Bool','Array','Dictionary','Set','Optional','Result','Void','Any','nil','true','false']);
const PROTO_KW = new Set(['syntax','edition','package','import','public','option','message','enum','service','rpc','returns','stream','oneof','map','repeated','optional','required','reserved','extensions','extend','to','max']);
const PROTO_TY = new Set(['string','bytes','bool','int32','int64','uint32','uint64','sint32','sint64','fixed32','fixed64','float','double','google']);
const SH_KW = new Set(['if','then','else','elif','fi','for','do','done','while','case','esac','in','function','return','export','local','set','exit','echo','cd','trap']);
const SH_TY = new Set(['true','false']);
const SQL_KW = new Set(['CREATE','TABLE','IF','NOT','EXISTS','PRIMARY','KEY','NULL','DEFAULT','UNIQUE','INDEX','ON','WHERE','IS','AND','OR','SELECT','FROM','JOIN','LEFT','INNER','ORDER','BY','GROUP','HAVING','CASE','WHEN','THEN','ELSE','END','LIMIT','INSERT','INTO','VALUES','UPDATE','SET','DELETE','ALTER','ADD','COLUMN','CONCURRENTLY','USING']);
const SQL_TY = new Set(['VARCHAR','BIGINT','TEXT','JSONB','TIMESTAMPTZ','DATETIME','INTEGER','BOOLEAN','SERIAL','UUID','VECTOR','HALFVEC','FLOAT','REAL','BLOB']);

function highlightGeneric(raw, cmt2, cmt1, kwSet, tySet, allowBacktick, ci) {
  let out = '', i = 0, n = raw.length;
  while (i < n) {
    if (cmt2 && raw[i] === cmt2[0] && raw[i + 1] === cmt2[1]) { out += '<span class="syn-cmt">' + escapeHtml(raw.slice(i)) + '</span>'; break; }
    if (cmt1 && raw[i] === cmt1) { out += '<span class="syn-cmt">' + escapeHtml(raw.slice(i)) + '</span>'; break; }
    if (raw[i] === '"' || raw[i] === "'" || (allowBacktick && raw[i] === '\`')) {
      const q = raw[i]; let j = i + 1;
      while (j < n) { if (q !== '\`' && raw[j] === '\\\\') { j += 2; continue; } if (raw[j] === q) { j++; break; } j++; }
      out += '<span class="syn-str">' + escapeHtml(raw.slice(i, j)) + '</span>'; i = j; continue;
    }
    if (/[0-9]/.test(raw[i]) && (i === 0 || !/[A-Za-z0-9_]/.test(raw[i - 1]))) {
      let j = i; while (j < n && /[0-9a-fA-FxX._]/.test(raw[j])) j++;
      out += '<span class="syn-num">' + escapeHtml(raw.slice(i, j)) + '</span>'; i = j; continue;
    }
    if (/[A-Za-z_]/.test(raw[i])) {
      let j = i; while (j < n && /[A-Za-z0-9_]/.test(raw[j])) j++;
      const w = raw.slice(i, j), cmp = ci ? w.toUpperCase() : w;
      if (kwSet.has(cmp)) out += '<span class="syn-kw">' + w + '</span>';
      else if (tySet.has(cmp)) out += '<span class="syn-ty">' + w + '</span>';
      else if (!ci && raw[j] === '(') out += '<span class="syn-fn">' + w + '</span>';
      else out += w;
      i = j; continue;
    }
    out += escapeHtml(raw[i]); i++;
  }
  return out || ' ';
}
function highlightYaml(raw) {
  if (raw.trim().startsWith('#')) return '<span class="syn-cmt">' + escapeHtml(raw) + '</span>';
  const m = raw.match(/^(\\s*-?\\s*)([A-Za-z0-9_.-]+)(:)(.*)$/);
  if (!m) return escapeHtml(raw) || ' ';
  const rest = m[4], hi = rest.indexOf(' #');
  const vp = hi >= 0 ? rest.slice(0, hi) : rest;
  const cp = hi >= 0 ? '<span class="syn-cmt">' + escapeHtml(rest.slice(hi)) + '</span>' : '';
  const vt = vp.trim();
  let vh = escapeHtml(vp);
  if (/^(true|false|null)$/i.test(vt)) vh = '<span class="syn-kw">' + escapeHtml(vp) + '</span>';
  else if (/^[0-9]+(\\.[0-9]+)?(h|m|s)?$/.test(vt)) vh = '<span class="syn-num">' + escapeHtml(vp) + '</span>';
  else if (vt.startsWith('"') || vt.startsWith("'")) vh = '<span class="syn-str">' + escapeHtml(vp) + '</span>';
  return escapeHtml(m[1]) + '<span class="syn-ty">' + escapeHtml(m[2]) + '</span>:' + vh + cp;
}
function highlightTree(raw) {
  const hashIdx = raw.indexOf('#');
  const left = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const comment = hashIdx >= 0 ? raw.slice(hashIdx) : '';
  const m = left.match(/^([│├└─\\s]*)(.*)$/);
  const branch = m ? m[1] : '', body = m ? m[2] : left, trimmed = body.trim();
  let bodyHtml = '';
  if (/^(GET|POST|PUT|PATCH|DELETE)\\s+\\//.test(trimmed)) bodyHtml = '<span class="tree-route">' + escapeHtml(body) + '</span>';
  else if (/\\/(\\s|$)/.test(trimmed) || trimmed.endsWith('/')) bodyHtml = '<span class="tree-dir">' + escapeHtml(body) + '</span>';
  else bodyHtml = '<span class="tree-file">' + escapeHtml(body) + '</span>';
  return '<span class="tree-branch">' + escapeHtml(branch) + '</span>' + bodyHtml + (comment ? '<span class="tree-cmt">' + escapeHtml(comment) + '</span>' : '');
}
function highlightMarkup(raw) {
  let out = '', i = 0, n = raw.length;
  while (i < n) {
    if (raw.startsWith('<!--', i)) {
      const end = raw.indexOf('-->', i + 4);
      const j = end >= 0 ? end + 3 : n;
      out += '<span class="syn-cmt">' + escapeHtml(raw.slice(i, j)) + '</span>';
      i = j; continue;
    }
    if (raw[i] === '<') {
      let j = i + 1;
      if (raw[j] === '/') j++;
      let t = j;
      while (t < n && /[A-Za-z0-9_:-]/.test(raw[t])) t++;
      out += escapeHtml(raw.slice(i, j)) + (t > j ? '<span class="syn-kw">' + escapeHtml(raw.slice(j, t)) + '</span>' : '');
      i = t;
      while (i < n && raw[i] !== '>') {
        if (raw[i] === '"' || raw[i] === "'") {
          const q = raw[i]; let k = i + 1;
          while (k < n && raw[k] !== q) k++;
          if (k < n) k++;
          out += '<span class="syn-str">' + escapeHtml(raw.slice(i, k)) + '</span>';
          i = k; continue;
        }
        if (/[A-Za-z_@:.]/.test(raw[i])) {
          let k = i; while (k < n && /[A-Za-z0-9_@:.-]/.test(raw[k])) k++;
          out += '<span class="syn-ty">' + escapeHtml(raw.slice(i, k)) + '</span>';
          i = k; continue;
        }
        out += escapeHtml(raw[i]); i++;
      }
      if (i < n && raw[i] === '>') { out += escapeHtml('>'); i++; }
      continue;
    }
    out += escapeHtml(raw[i]); i++;
  }
  return out || ' ';
}
function highlightCss(raw) {
  let out = '', i = 0, n = raw.length;
  while (i < n) {
    if (raw[i] === '/' && raw[i + 1] === '*') {
      const end = raw.indexOf('*/', i + 2);
      const j = end >= 0 ? end + 2 : n;
      out += '<span class="syn-cmt">' + escapeHtml(raw.slice(i, j)) + '</span>';
      i = j; continue;
    }
    if (raw[i] === '/' && raw[i + 1] === '/') {
      out += '<span class="syn-cmt">' + escapeHtml(raw.slice(i)) + '</span>';
      break;
    }
    if (raw[i] === '"' || raw[i] === "'") {
      const q = raw[i]; let j = i + 1;
      while (j < n && raw[j] !== q) j++;
      if (j < n) j++;
      out += '<span class="syn-str">' + escapeHtml(raw.slice(i, j)) + '</span>';
      i = j; continue;
    }
    if (raw[i] === '@' || raw[i] === '.') {
      let j = i + 1; while (j < n && /[A-Za-z0-9_-]/.test(raw[j])) j++;
      out += '<span class="' + (raw[i] === '@' ? 'syn-kw' : 'syn-fn') + '">' + escapeHtml(raw.slice(i, j)) + '</span>';
      i = j; continue;
    }
    if (raw[i] === '#' && /[0-9a-fA-F]/.test(raw[i + 1] || '')) {
      let j = i + 1; while (j < n && /[0-9a-fA-F]/.test(raw[j])) j++;
      out += '<span class="syn-num">' + escapeHtml(raw.slice(i, j)) + '</span>';
      i = j; continue;
    }
    if (/[0-9]/.test(raw[i]) && (i === 0 || !/[A-Za-z_-]/.test(raw[i - 1]))) {
      let j = i; while (j < n && /[0-9.%a-zA-Z]/.test(raw[j])) j++;
      out += '<span class="syn-num">' + escapeHtml(raw.slice(i, j)) + '</span>';
      i = j; continue;
    }
    if (/[A-Za-z-]/.test(raw[i])) {
      let j = i; while (j < n && /[A-Za-z0-9_-]/.test(raw[j])) j++;
      const w = raw.slice(i, j);
      if (raw[j] === ':') out += '<span class="syn-ty">' + escapeHtml(w) + '</span>';
      else out += escapeHtml(w);
      i = j; continue;
    }
    out += escapeHtml(raw[i]); i++;
  }
  return out || ' ';
}
function highlightLine(raw, syntax) {
  const s = (syntax || 'plain').toLowerCase();
  if (s === 'tree') return highlightTree(raw);
  if (s === 'go' || s === 'golang') return highlightGeneric(raw, '//', null, GO_KW, GO_TY, true, false);
  if (s === 'py' || s === 'python') return highlightGeneric(raw, null, '#', PY_KW, PY_TY, false, false);
  if (s === 'ts' || s === 'tsx' || s === 'js' || s === 'jsx' || s === 'mjs' || s === 'cjs' || s === 'json') return highlightGeneric(raw, '//', null, TS_KW, TS_TY, true, false);
  if (s === 'rs' || s === 'rust') return highlightGeneric(raw, '//', null, RS_KW, RS_TY, false, false);
  if (s === 'java' || s === 'kt' || s === 'kotlin') return highlightGeneric(raw, '//', null, JAVA_KW, JAVA_TY, false, false);
  if (s === 'cpp' || s === 'c' || s === 'cc' || s === 'cxx' || s === 'h' || s === 'hpp') return highlightGeneric(raw, '//', null, CPP_KW, CPP_TY, false, false);
  if (s === 'rb' || s === 'ruby') return highlightGeneric(raw, null, '#', RB_KW, RB_TY, false, false);
  if (s === 'php') return highlightGeneric(raw, '//', '#', PHP_KW, PHP_TY, false, false);
  if (s === 'cs' || s === 'csharp') return highlightGeneric(raw, '//', null, CS_KW, CS_TY, false, false);
  if (s === 'swift') return highlightGeneric(raw, '//', null, SWIFT_KW, SWIFT_TY, false, false);
  if (s === 'proto' || s === 'protobuf') return highlightGeneric(raw, '//', null, PROTO_KW, PROTO_TY, false, false);
  if (s === 'html' || s === 'xml' || s === 'vue' || s === 'svelte') return highlightMarkup(raw);
  if (s === 'css' || s === 'scss' || s === 'less') return highlightCss(raw);
  if (s === 'sh' || s === 'bash' || s === 'zsh' || s === 'dockerfile' || s === 'toml' || s === 'makefile') return highlightGeneric(raw, null, '#', SH_KW, SH_TY, true, false);
  if (s === 'sql') return highlightGeneric(raw, '--', null, SQL_KW, SQL_TY, false, true);
  if (s === 'yaml' || s === 'yml') return highlightYaml(raw);
  return escapeHtml(raw) || ' ';
}

// ===== Helpers =====
function getStation(id) { return DATA.stations.find(s => s.id === id) || DATA.stations[0]; }
function getFlow(id) { return DATA.flows.find(f => f.id === id) || DATA.flows[0]; }
function isDone(id) { return progress.completed.includes(id); }

function getOrderedStations() {
  const ids = (DATA.flows || []).flatMap(f => f.stationIds || []);
  const seen = new Set(), out = [];
  ids.forEach(id => { if (!seen.has(id)) { seen.add(id); const st = DATA.stations.find(x => x.id === id); if (st) out.push(st); } });
  DATA.stations.forEach(st => { if (!seen.has(st.id)) { seen.add(st.id); out.push(st); } });
  return out;
}
function getNextStation() {
  for (const s of getOrderedStations()) if (!isDone(s.id)) return s;
  return getStation(progress.currentStationId || FIRST_STATION_ID);
}
function updateRankPill() {
  $('rankPill').textContent = \`已通关 \${progress.completed.length} / \${DATA.stations.length} 站\`;
}
function toggleStationDone(stationId, force) {
  const idx = progress.completed.indexOf(stationId);
  if (force === true) { if (idx < 0) progress.completed.push(stationId); }
  else if (force === false) { if (idx >= 0) progress.completed.splice(idx, 1); }
  else { if (idx >= 0) progress.completed.splice(idx, 1); else progress.completed.push(stationId); }
  saveProgress();
  updateRankPill();
  if (ui.view === 'overview') renderOverview();
  if (ui.view === 'station') renderStation(false);
}

function setView(v) {
  wbStopPlay();
  if (v !== 'overview' && ui.dossierModalOpen) closeDossierModal();
  ui.view = v;
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  const map = { overview: 'viewOverview', station: 'viewStation', workbench: 'viewWorkbench', interview: 'viewInterview' };
  Object.entries(map).forEach(([k, id]) => $(id).classList.toggle('active', k === v));
  const fullBleed = v === 'station' || v === 'workbench';
  $('stage').classList.toggle('full-bleed', fullBleed);

  if (v === 'overview') renderOverview();
  if (v === 'station') renderStation(true);
  if (v === 'workbench') {
    if (!wb.initialized) { wb.initialized = true; wbLoadModule(0); }
    else wbRenderDiagram();
  }
  if (v === 'interview') renderInterview();
  if (!fullBleed) $('stage').scrollTop = 0;
}

function openStation(stationId) {
  progress.currentStationId = stationId;
  saveProgress();
  const st = getStation(stationId);
  ui.activeStepId = st.steps[0].id;
  ui.activeFileId = st.steps[0].fileId;
  setView('station');
}

function openWorkbenchAt(moduleId, nodeId) {
  if (!WB_MODULES.length) return;
  setView('workbench');
  wbJumpToModuleNode(moduleId || WB_MODULES[0].id, nodeId);
}

// =========================================================================
// VIEW 1: INTERACTIVE DATAFLOW (15 STATIONS) + TECH ARCHITECTURE (13 COMPS)
// =========================================================================
function buildDataflowBlueprintSvg() {
  const numStages = Math.max(1, (DATA.stages || []).length);
  const numRows = Math.max(1, ...DATA.stations.map(s => (s.row ?? 0) + 1));
  const nodeW = 196, nodeH = 82, colStride = 230, rowStride = 124;
  const colX = Array.from({ length: numStages }, (_, i) => 20 + i * colStride);
  const rowY = Array.from({ length: numRows }, (_, r) => 54 + r * rowStride);
  const vbW = 20 + (numStages - 1) * colStride + nodeW + 20;
  const vbH = 54 + (numRows - 1) * rowStride + nodeH + 31;

  const byDfId = {};
  DATA.stations.forEach(st => { byDfId[st.dfNodeId] = st; });

  const defs = \`<defs>
    <marker id="df-arr-emphasis" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/></marker>
    <marker id="df-arr-security" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fb7185"/></marker>
    <marker id="df-arr-dashed" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8"/></marker>
    <marker id="df-arr-default" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b"/></marker>
  </defs>\`;

  // 5 Stage column backdrops
  let stageBands = '';
  DATA.stages.forEach((sg, idx) => {
    const x = colX[idx] - 8;
    stageBands += \`<rect class="stage-band-bg" x="\${x}" y="10" width="\${nodeW + 16}" height="\${vbH - 20}" />
      <text class="stage-band-tx" x="\${colX[idx] + nodeW / 2}" y="32">\${escapeHtml(sg.label)}</text>\`;
  });

  // Flow edges (with adjacent highlighting for selected node)
  const filterFlow = ui.flowFilter;
  const selSt = getStation(ui.selectedDfStationId);
  const selDfId = selSt ? selSt.dfNodeId : null;
  const relDfNodes = new Set(selDfId ? [selDfId] : []);
  const relDfEdges = new Set();
  (DATA.dataFlow?.flows || []).forEach((fl, idx) => {
    const ek = fl.id ?? idx;
    if (selDfId && (fl.from === selDfId || fl.to === selDfId)) {
      relDfEdges.add(ek);
      relDfNodes.add(fl.from);
      relDfNodes.add(fl.to);
    }
  });

  let edgesMarkup = '';
  (DATA.dataFlow?.flows || []).forEach((fl, idx) => {
    const srcSt = byDfId[fl.from], dstSt = byDfId[fl.to];
    if (!srcSt || !dstSt) return;
    const sx = colX[srcSt.stage] + nodeW, sy = rowY[srcSt.row] + nodeH / 2;
    const tx = colX[dstSt.stage], ty = rowY[dstSt.row] + nodeH / 2;
    const midX = (sx + tx) / 2;
    const d = sy === ty ? \`M\${sx} \${sy} L\${tx} \${ty}\` : \`M\${sx} \${sy} L\${midX} \${sy} L\${midX} \${ty} L\${tx} \${ty}\`;
    const variant = fl.variant || 'default';
    const ek = fl.id ?? idx;
    const matchFilter = filterFlow === 'all' || (srcSt.flowId === filterFlow && dstSt.flowId === filterFlow);
    const isAct = filterFlow === 'all' ? relDfEdges.has(ek) : (matchFilter && relDfEdges.has(ek));
    const isDim = filterFlow === 'all' ? (Boolean(selDfId) && !isAct) : !matchFilter;
    const showDot = filterFlow === 'all' ? (selDfId ? isAct : true) : matchFilter;
    const pid = \`dfp-\${idx}\`;
    const dotCls = variant === 'security' ? 'flow-dot security' : (variant === 'dashed' ? 'flow-dot dashed' : 'flow-dot');
    edgesMarkup += \`<g class="arch-edge variant-\${variant} \${isAct ? 'active' : ''} \${isDim ? 'dimmed' : ''}">
      <path id="\${pid}" class="edge-path" d="\${d}" marker-end="url(#df-arr-\${variant})" />
      \${showDot ? \`<circle class="\${dotCls}" r="2.8"><animateMotion dur="\${(2.2 + (idx % 3) * 0.4).toFixed(1)}s" repeatCount="indefinite"><mpath href="#\${pid}" /></animateMotion></circle>\` : ''}
    </g>\`;
  });

  // Station Nodes
  let nodesMarkup = '';
  DATA.stations.forEach((st) => {
    const x = colX[st.stage], y = rowY[st.row];
    const v = TYPE_VAR[st.nodeType] || 'backend';
    const done = isDone(st.id);
    const isAct = st.id === ui.selectedDfStationId;
    const dimmed = filterFlow === 'all' ? (Boolean(selDfId) && !relDfNodes.has(st.dfNodeId)) : (st.flowId !== filterFlow);
    const tagW = Math.max(46, Math.round(textUnits(st.dfTag) * 5.6 + 10));
    const tagX = nodeW - tagW - 8;

    nodesMarkup += \`<g class="arch-node \${isAct ? 'active' : ''} \${dimmed ? 'dimmed' : ''}" data-stid="\${st.id}" transform="translate(\${x}, \${y})">
      <rect class="node-pulse" x="-3" y="-3" width="\${nodeW + 6}" height="\${nodeH + 6}" rx="12" />
      <rect class="node-box" x="0" y="0" width="\${nodeW}" height="\${nodeH}" rx="10"
        fill="var(--c-\${v}-bg)" stroke="\${done ? '#34d399' : \`var(--c-\${v}-bd)\`}" />
      <rect x="9" y="10" width="26" height="17" rx="8.5" fill="\${done ? '#34d399' : \`var(--c-\${v}-bd)\`}" />
      <text class="node-step-badge" x="22" y="21.5" text-anchor="middle" fill="#080d16">\${done ? '✓' : st.codeLabel}</text>
      <text class="node-title" x="41" y="23" fill="var(--c-\${v}-tx)">\${escapeHtml(st.dfLabel)}</text>
      <text class="node-sub" x="10" y="45" fill="var(--c-\${v}-tx)">\${escapeHtml(st.dfSublabel)}</text>
      <text class="node-src-chip" x="10" y="68" fill="var(--c-\${v}-bd)">单击看详解</text>
      <rect class="node-tag-bg" x="\${tagX}" y="57" width="\${tagW}" height="16" rx="8" fill="var(--c-\${v}-bd)" />
      <text class="node-tag-tx" x="\${tagX + tagW / 2}" y="68" text-anchor="middle" fill="var(--c-\${v}-tx)">\${escapeHtml(st.dfTag)}</text>
    </g>\`;
  });

  return \`<svg class="bp-svg" id="dfBlueprintSvg" viewBox="0 0 \${vbW} \${vbH}" xmlns="http://www.w3.org/2000/svg">\${defs}\${stageBands}\${edgesMarkup}\${nodesMarkup}</svg>\`;
}

function buildTechArchBlueprintSvg() {
  // Generic auto-normalizing component + boundary layout: maps any component grid cleanly to 3-row cards (h=74) with 0 text/tag collisions
  const rawComps = DATA.techArch.components || [];
  const xs = [...new Set(rawComps.map(c => c.pos[0]))].sort((a, b) => a - b);
  const ys = [...new Set(rawComps.map(c => c.pos[1]))].sort((a, b) => a - b);
  const colStride = 278, rowStride = 146;
  const colMap = {}; xs.forEach((v, i) => { colMap[v] = 16 + i * colStride; });
  const rowMap = {}; ys.forEach((v, i) => { rowMap[v] = 42 + i * rowStride; });
  const comps = rawComps.map(c => ({
    ...c,
    rx: colMap[c.pos[0]] ?? c.pos[0],
    ry: rowMap[c.pos[1]] ?? c.pos[1],
    rw: Math.max(c.size?.[0] || 184, 184),
    rh: 74,
  }));
  const byId = {};
  comps.forEach(c => { byId[c.id] = c; });
  const maxRight = Math.max(820, ...comps.map(c => c.rx + c.rw));
  const maxBot = Math.max(380, ...comps.map(c => c.ry + c.rh));
  const vbW = maxRight + 32, vbH = maxBot + 28;

  const defs = \`<defs>
    <marker id="ta-arr-emphasis" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/></marker>
    <marker id="ta-arr-security" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fb7185"/></marker>
    <marker id="ta-arr-dashed" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8"/></marker>
    <marker id="ta-arr-default" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b"/></marker>
  </defs>\`;

  // Compute tight bounding boxes for architecture boundaries
  let boundsMarkup = '';
  (DATA.techArch.boundaries || []).forEach((b) => {
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    (b.wraps || []).forEach(id => {
      const c = byId[id]; if (!c) return;
      minX = Math.min(minX, c.rx);
      minY = Math.min(minY, c.ry);
      maxX = Math.max(maxX, c.rx + c.rw);
      maxY = Math.max(maxY, c.ry + c.rh);
    });
    if (minX > maxX) return;
    const padX = 14, padTop = 26, padBot = 12;
    const isSec = b.kind === 'security-group';
    boundsMarkup += \`<rect class="boundary-rect \${isSec ? 'sec' : ''}" x="\${minX - padX}" y="\${minY - padTop}" width="\${maxX - minX + padX * 2}" height="\${maxY - minY + padTop + padBot}" />
      <text class="boundary-lbl" x="\${minX - padX + 10}" y="\${minY - 10}">\${escapeHtml(b.label)}</text>\`;
  });

  // Determine highlighted connections for selected tech component
  const selId = ui.selectedTechCompId;
  const relComps = new Set([selId]);
  const relConns = new Set();
  (DATA.techArch.connections || []).forEach((cn, idx) => {
    const ek = cn.id ?? idx;
    if (cn.from === selId || cn.to === selId) {
      relConns.add(ek); relComps.add(cn.from); relComps.add(cn.to);
    }
  });

  // Count incoming connections per target node to separate multi-entry vertical/elbow ports
  const incomingCounts = {};
  (DATA.techArch.connections || []).forEach(cn => { incomingCounts[cn.to] = (incomingCounts[cn.to] || 0) + 1; });

  // Orthogonal connections with separated entry ports to avoid label/line collisions
  let connsMarkup = '';
  (DATA.techArch.connections || []).forEach((cn, idx) => {
    const a = byId[cn.from], b = byId[cn.to];
    if (!a || !b) return;
    const ax = a.rx + a.rw / 2, ay = a.ry + a.rh / 2;
    const bx = b.rx + b.rw / 2, by = b.ry + b.rh / 2;
    let sx, sy, tx, ty, d, lx, ly;
    if (Math.abs(ay - by) < 20) {
      sx = bx > ax ? a.rx + a.rw : a.rx; sy = ay;
      tx = bx > ax ? b.rx : b.rx + b.rw; ty = by;
      d = \`M\${sx} \${sy} L\${tx} \${ty}\`; lx = (sx + tx) / 2; ly = sy - 11;
    } else if (Math.abs(ax - bx) < 35) {
      const shiftX = (typeof cn.shiftX === 'number') ? cn.shiftX : ((incomingCounts[cn.to] || 0) > 1 ? -22 : 0);
      sx = ax + shiftX; sy = by > ay ? a.ry + a.rh : a.ry;
      tx = bx + shiftX; ty = by > ay ? b.ry : b.ry + b.rh;
      d = \`M\${sx} \${sy} L\${tx} \${ty}\`;
      lx = sx;
      ly = by > ay ? sy + Math.round((ty - sy) * 0.44) : ty + Math.round((sy - ty) * 0.50);
    } else {
      const isLeft = bx < ax;
      sx = ax + (isLeft ? -36 : 36);
      sy = by > ay ? a.ry + a.rh : a.ry;
      tx = bx + (isLeft ? 34 : 0);
      ty = by > ay ? b.ry : b.ry + b.rh;
      const midY = by > ay ? sy + 24 : ty + 24;
      d = \`M\${sx} \${sy} L\${sx} \${midY} L\${tx} \${midY} L\${tx} \${ty}\`;
      lx = (sx + tx) / 2; ly = midY;
    }
    const variant = cn.variant || 'default';
    const act = relConns.has(cn.id ?? idx);
    const dim = selId && !act;
    const lw = Math.max(44, Math.round(textUnits(cn.label || '') * 5.6 + 10));
    const pid = \`tap-\${idx}\`;
    connsMarkup += \`<g class="arch-edge variant-\${variant} \${act ? 'active' : ''} \${dim ? 'dimmed' : ''}">
      <path id="\${pid}" class="edge-path" d="\${d}" marker-end="url(#ta-arr-\${variant})" />
      \${act ? \`<circle class="flow-dot" r="2.8"><animateMotion dur="2.1s" repeatCount="indefinite"><mpath href="#\${pid}" /></animateMotion></circle>\` : ''}
      \${cn.label ? \`<rect class="edge-label-bg" x="\${lx - lw / 2}" y="\${ly - 8.5}" width="\${lw}" height="17" />
      <text class="edge-label-tx" x="\${lx}" y="\${ly}">\${escapeHtml(cn.label)}</text>\` : ''}
    </g>\`;
  });

  // Component Nodes (3-row cards: Row1 full-width title, Row2 sublabel, Row3 station link + tag pill)
  let nodesMarkup = '';
  comps.forEach((c) => {
    const x = c.rx, y = c.ry, w = c.rw, h = c.rh;
    const v = TYPE_VAR[c.type] || 'backend';
    const isAct = c.id === selId;
    const isDim = selId && !relComps.has(c.id);
    const mapInfo = (DATA.techArch.compToStation || {})[c.id];
    const st = mapInfo ? getStation(mapInfo.stationId) : null;
    const done = st ? isDone(st.id) : false;
    const chipTxt = st ? (done ? \`✓ 第 \${st.codeLabel} 站\` : \`→ 第 \${st.codeLabel} 站\`) : '点击查看';
    const tagTxt = c.tag || c.type || '';
    const tagW = tagTxt ? Math.max(44, Math.round(textUnits(tagTxt) * 5.4 + 10)) : 0;

    nodesMarkup += \`<g class="arch-node \${isAct ? 'active' : ''} \${isDim ? 'dimmed' : ''}" data-comp-id="\${c.id}" transform="translate(\${x}, \${y})">
      <rect class="node-pulse" x="-3" y="-3" width="\${w + 6}" height="\${h + 6}" rx="12" />
      <rect class="node-box" x="0" y="0" width="\${w}" height="\${h}" rx="10" fill="var(--c-\${v}-bg)" stroke="\${done ? '#34d399' : \`var(--c-\${v}-bd)\`}" />
      <text class="node-title" x="11" y="22" fill="var(--c-\${v}-tx)">\${escapeHtml(c.label)}</text>
      <text class="node-sub" x="11" y="41" fill="var(--c-\${v}-tx)">\${escapeHtml(c.sublabel || '')}</text>
      <text class="node-src-chip" x="11" y="62" fill="\${done ? '#34d399' : \`var(--c-\${v}-bd)\`}">\${escapeHtml(chipTxt)}</text>
      \${tagTxt ? \`<rect class="node-tag-bg" x="\${w - tagW - 8}" y="51" width="\${tagW}" height="16" rx="8" fill="var(--c-\${v}-bd)" />
        <text class="node-tag-tx" x="\${w - tagW / 2 - 8}" y="62" text-anchor="middle" fill="var(--c-\${v}-tx)">\${escapeHtml(tagTxt)}</text>\` : ''}
    </g>\`;
  });

  return \`<svg class="bp-svg" id="techArchSvg" viewBox="0 0 \${vbW} \${vbH}" xmlns="http://www.w3.org/2000/svg">\${defs}\${boundsMarkup}\${connsMarkup}\${nodesMarkup}</svg>\`;
}

function buildBusinessFlowBlueprintSvg() {
  // Generic N-lane x M-phase x K-node Business Workflow Swimlane SVG
  const bf = DATA.businessFlow || { lanes: [], phases: [], groups: [], nodes: [], edges: [], nodeToLearn: {} };
  const numCols = Math.max(1, ...(bf.nodes || []).map(n => (n.col ?? 0) + 1));
  const nodeW = 166, nodeH = 74, colStride = 230, laneH = 114, laneGap = 14;
  const colX = Array.from({ length: numCols }, (_, i) => 104 + i * colStride);
  const laneTop = {}, cardY = {}, laneIndex = {};
  (bf.lanes || []).forEach((ln, idx) => {
    laneIndex[ln.id] = idx;
    laneTop[ln.id] = 44 + idx * (laneH + laneGap);
    cardY[ln.id] = laneTop[ln.id] + 24;
  });
  const vbW = 104 + (numCols - 1) * colStride + nodeW + 20;
  const vbH = 44 + (bf.lanes || []).length * (laneH + laneGap) + 6;

  function splitLaneLabel(label) {
    if (!label) return [''];
    if (textUnits(label) <= 9) return [label];
    // Prefer splitting cleanly at spaces, '、', '与', '和', never mid-ASCII-word
    const tokens = label.match(/[A-Za-z0-9_-]+|[^A-Za-z0-9_\s-]+/g) || [label];
    let bestSplit = Math.ceil(label.length / 2), bestScore = 1e9;
    let acc = '';
    const pieces = [];
    for (const tk of tokens) {
      if (/^[A-Za-z0-9_-]+$/.test(tk)) pieces.push(tk);
      else for (const ch of tk) pieces.push(ch);
    }
    const totalU = textUnits(label);
    let left = '';
    for (let i = 0; i < pieces.length - 1; i++) {
      left += pieces[i];
      const right = pieces.slice(i + 1).join('');
      const score = Math.abs(textUnits(left) - totalU / 2) - (/[与、和·\s]$/.test(left) ? 1.5 : 0);
      if (score < bestScore) { bestScore = score; bestSplit = i + 1; }
    }
    return [pieces.slice(0, bestSplit).join('').trim(), pieces.slice(bestSplit).join('').trim()].filter(Boolean);
  }

  const posById = {};
  (bf.nodes || []).forEach((n) => {
    posById[n.id] = { x: colX[n.col ?? 0], y: cardY[n.lane] ?? 68, w: nodeW, h: nodeH, node: n, laneIdx: laneIndex[n.lane] ?? 0, col: n.col ?? 0 };
  });

  const defs = \`<defs>
    <marker id="wf-arr-emphasis" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/></marker>
    <marker id="wf-arr-security" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fb7185"/></marker>
    <marker id="wf-arr-dashed" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8"/></marker>
    <marker id="wf-arr-default" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b"/></marker>
  </defs>\`;

  // 1. Top Phase header bands
  let phasesMarkup = '';
  (bf.phases || []).forEach((p, idx) => {
    const x1 = colX[p.fromCol] ?? colX[0], x2 = (colX[p.toCol] ?? colX[0]) + nodeW;
    const cls = p.variant === 'emphasis' ? 'emphasis' : (p.variant === 'dashed' ? 'dashed' : '');
    phasesMarkup += \`<rect class="wf-phase-bg \${cls}" x="\${x1}" y="8" width="\${x2 - x1}" height="24" />
      <text class="wf-phase-tx" x="\${(x1 + x2) / 2}" y="20">Phase \${idx + 1} · \${escapeHtml(p.label)}</text>\`;
  });

  // 2. Horizontal Swimlanes + Left Lane Headers
  let lanesMarkup = '';
  (bf.lanes || []).forEach((ln) => {
    const top = laneTop[ln.id];
    const isExc = ln.variant === 'exception';
    const lines = splitLaneLabel(ln.shortLabel || ln.label);
    lanesMarkup += \`<rect class="wf-lane-bg \${isExc ? 'exception' : ''}" x="96" y="\${top}" width="\${vbW - 106}" height="\${laneH}" />
      <rect class="wf-lane-hdr \${isExc ? 'exception' : ''}" x="10" y="\${top}" width="78" height="\${laneH}" />
      <text class="wf-lane-tx \${isExc ? 'exception' : ''}" x="49" y="\${top + laneH / 2 + (lines[1] ? -5 : 4)}">\${escapeHtml(lines[0])}</text>
      \${lines[1] ? \`<text class="wf-lane-tx \${isExc ? 'exception' : ''}" x="49" y="\${top + laneH / 2 + 12}">\${escapeHtml(lines[1])}</text>\` : ''}\`;
  });

  // 3. Dashed Process Groups inside lanes
  let groupsMarkup = '';
  (bf.groups || []).forEach((g) => {
    const x1 = (colX[g.fromCol] ?? colX[0]) - 8, x2 = (colX[g.toCol] ?? colX[0]) + nodeW + 8;
    const y1 = (cardY[g.lane] ?? 68) - 20, y2 = (cardY[g.lane] ?? 68) + nodeH + 8;
    const cls = g.variant === 'emphasis' ? 'emphasis' : (g.variant === 'security' ? 'security' : '');
    groupsMarkup += \`<rect class="wf-grp-rect \${cls}" x="\${x1}" y="\${y1}" width="\${x2 - x1}" height="\${y2 - y1}" />
      <text class="wf-grp-lbl" x="\${x1 + 9}" y="\${y1 + 13}">\${escapeHtml(g.label)}</text>\`;
  });

  // Filter / Selection state
  const track = ui.bizFilter;
  const selId = ui.selectedBizNodeId;
  const mainSet = new Set(bf.mainPath || []);
  const trackMatchNode = (nid) => {
    if (track === 'all') return true;
    if (track === 'main') return mainSet.has(nid);
    const info = (bf.nodeToLearn || {})[nid];
    return info && info.tracks && info.tracks.includes(track);
  };
  const relNodes = new Set([selId]);
  const relEdges = new Set();
  (bf.edges || []).forEach((e, idx) => {
    const ek = e.id ?? idx;
    if (e.from === selId || e.to === selId) {
      relEdges.add(ek); relNodes.add(e.from); relNodes.add(e.to);
    }
  });

  // 4. General clean orthogonal router (supports optional explicit edge.via or smart lane-corridor routing)
  function routeBizEdge(e) {
    const a = posById[e.from], b = posById[e.to];
    if (!a || !b) return null;
    if (Array.isArray(e.via) && e.via.length) {
      const pts = e.via;
      const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ');
      const mid = pts[Math.floor(pts.length / 2)];
      return { d, lx: e.lx ?? mid[0], ly: e.ly ?? mid[1] };
    }
    if (a.laneIdx === b.laneIdx) {
      const sx = b.col >= a.col ? a.x + a.w : a.x, sy = a.y + a.h / 2;
      const tx = b.col >= a.col ? b.x : b.x + b.w, ty = b.y + b.h / 2;
      return { d: \`M\${sx} \${sy} L\${tx} \${ty}\`, lx: Math.round((sx + tx) / 2), ly: sy - 13 };
    }
    if (a.col === b.col) {
      const goingDown = b.laneIdx > a.laneIdx;
      const sx = a.x + a.w / 2, sy = goingDown ? a.y + a.h : a.y;
      const tx = b.x + b.w / 2, ty = goingDown ? b.y : b.y + b.h;
      return { d: \`M\${sx} \${sy} L\${tx} \${ty}\`, lx: sx, ly: Math.round((sy + ty) / 2) };
    }
    const goingDown = b.laneIdx > a.laneIdx;
    const goingRight = b.col > a.col;
    if (goingRight && goingDown) {
      const sx = a.x + a.w, sy = a.y + a.h / 2;
      const tx = b.x, ty = b.y + b.h / 2;
      const midX = a.x + a.w + 32;
      return { d: \`M\${sx} \${sy} L\${midX} \${sy} L\${midX} \${ty} L\${tx} \${ty}\`, lx: midX, ly: Math.round((sy + ty) / 2) };
    }
    if (goingRight && !goingDown) {
      if (b.col - a.col > 1) {
        // Long upward jump across intermediate columns: rise first to destination lane, then go right
        const sx = a.x + Math.round(a.w * 0.72), sy = a.y;
        const tx = b.x, ty = b.y + b.h / 2;
        return { d: \`M\${sx} \${sy} L\${sx} \${ty} L\${tx} \${ty}\`, lx: Math.round((sx + tx) / 2), ly: ty - 11 };
      }
      const sx = a.x + a.w, sy = a.y + a.h / 2;
      const tx = b.x + Math.round(b.w * 0.35), ty = b.y + b.h;
      return { d: \`M\${sx} \${sy} L\${tx} \${sy} L\${tx} \${ty}\`, lx: Math.round((sx + tx) / 2), ly: sy - 12 };
    }
    const sx = a.x + a.w / 2, sy = goingDown ? a.y + a.h : a.y;
    const tx = b.x + b.w / 2, ty = goingDown ? b.y : b.y + b.h;
    const midY = Math.round((sy + ty) / 2);
    return { d: \`M\${sx} \${sy} L\${sx} \${midY} L\${tx} \${midY} L\${tx} \${ty}\`, lx: Math.round((sx + tx) / 2), ly: midY };
  }

  let edgesMarkup = '';
  (bf.edges || []).forEach((e, idx) => {
    const geom = routeBizEdge(e);
    if (!geom) return;
    const variant = e.variant || 'default';
    const ek = e.id ?? idx;
    const trackOk = track === 'all' || (trackMatchNode(e.from) && trackMatchNode(e.to));
    const isAct = track === 'all' ? relEdges.has(ek) : trackOk;
    const isDim = track === 'all' ? (selId && !relEdges.has(ek)) : !trackOk;
    const dispLabel = (e.label || '').replace(/\\s+/g, '');
    const lw = Math.max(40, Math.round(textUnits(dispLabel) * 5.0 + 9));
    const pid = \`wfp-\${idx}\`;
    const dotCls = variant === 'security' ? 'flow-dot security' : (variant === 'dashed' ? 'flow-dot dashed' : 'flow-dot');
    edgesMarkup += \`<g class="arch-edge variant-\${variant} \${isAct ? 'active' : ''} \${isDim ? 'dimmed' : ''}">
      <path id="\${pid}" class="edge-path" d="\${geom.d}" marker-end="url(#wf-arr-\${variant})" />
      \${isAct ? \`<circle class="\${dotCls}" r="2.7"><animateMotion dur="\${(2.1 + (idx % 3) * 0.35).toFixed(2)}s" repeatCount="indefinite"><mpath href="#\${pid}" /></animateMotion></circle>\` : ''}
      \${dispLabel ? \`<rect class="edge-label-bg" x="\${geom.lx - lw / 2}" y="\${geom.ly - 8}" width="\${lw}" height="16" />
      <text class="edge-label-tx" x="\${geom.lx}" y="\${geom.ly}">\${escapeHtml(dispLabel)}</text>\` : ''}
    </g>\`;
  });

  // 5. Interactive Business Flow Cards (3-row cards, 0 overlap, synced with completion state)
  let nodesMarkup = '';
  (bf.nodes || []).forEach((n) => {
    const p = posById[n.id];
    const v = TYPE_VAR[n.type] || 'backend';
    const info = (bf.nodeToLearn || {})[n.id];
    const st = info ? getStation(info.stationId) : null;
    const done = st ? isDone(st.id) : false;
    const isAct = n.id === selId;
    const isDim = track === 'all' ? (selId && !relNodes.has(n.id)) : !trackMatchNode(n.id);
    const chipTxt = st ? (done ? \`✓ 第 \${st.codeLabel} 站\` : \`→ 第 \${st.codeLabel} 站\`) : '点击学习';
    const tagTxt = n.tag || '';
    const tagW = tagTxt ? Math.max(44, Math.round(textUnits(tagTxt) * 5.2 + 10)) : 0;

    nodesMarkup += \`<g class="arch-node \${isAct ? 'active' : ''} \${isDim ? 'dimmed' : ''}" data-biz-id="\${n.id}" transform="translate(\${p.x}, \${p.y})">
      <rect class="node-pulse" x="-3" y="-3" width="\${p.w + 6}" height="\${p.h + 6}" rx="12" />
      <rect class="node-box" x="0" y="0" width="\${p.w}" height="\${p.h}" rx="10" fill="var(--c-\${v}-bg)" stroke="\${done ? '#34d399' : \`var(--c-\${v}-bd)\`}" />
      <text class="node-title" x="10" y="22" fill="var(--c-\${v}-tx)">\${escapeHtml(n.label)}</text>
      <text class="node-sub" x="10" y="41" fill="var(--c-\${v}-tx)">\${escapeHtml(n.sublabel || '')}</text>
      <text class="node-src-chip" x="10" y="62" fill="\${done ? '#34d399' : \`var(--c-\${v}-bd)\`}">\${escapeHtml(chipTxt)}</text>
      \${tagTxt ? \`<rect class="node-tag-bg" x="\${p.w - tagW - 8}" y="51" width="\${tagW}" height="16" rx="8" fill="var(--c-\${v}-bd)" />
        <text class="node-tag-tx" x="\${p.w - tagW / 2 - 8}" y="62" text-anchor="middle" fill="var(--c-\${v}-tx)">\${escapeHtml(tagTxt)}</text>\` : ''}
    </g>\`;
  });

  return \`<svg class="bp-svg" id="businessFlowSvg" viewBox="0 0 \${vbW} \${vbH}" xmlns="http://www.w3.org/2000/svg">\${defs}\${phasesMarkup}\${lanesMarkup}\${groupsMarkup}\${edgesMarkup}\${nodesMarkup}</svg>\`;
}

function getActiveOverviewContext() {
  if (ui.blueprintMode === 'dataflow') {
    const list = getOrderedStations();
    if (!list.length) return null;
    const st = getStation(ui.selectedDfStationId);
    const index = Math.max(0, list.findIndex(x => x.id === st.id));
    const prevId = list[(index - 1 + list.length) % list.length].id;
    const nextId = list[(index + 1) % list.length].id;
    const byDfId = {};
    (DATA.stations || []).forEach(s => { byDfId[s.dfNodeId] = s; });
    const upstream = (DATA.dataFlow?.flows || [])
      .filter(fl => fl.to === st.dfNodeId)
      .map(fl => {
        const src = byDfId[fl.from];
        return src ? { id: src.id, label: \`\${src.codeLabel} · \${src.dfLabel}\`, edgeLabel: fl.label || '' } : null;
      })
      .filter(Boolean);
    const downstream = (DATA.dataFlow?.flows || [])
      .filter(fl => fl.from === st.dfNodeId)
      .map(fl => {
        const dst = byDfId[fl.to];
        return dst ? { id: dst.id, label: \`\${dst.codeLabel} · \${dst.dfLabel}\`, edgeLabel: fl.label || '' } : null;
      })
      .filter(Boolean);
    const sources = (st.files || []).map(f => ({ path: f.path, line: f.sliceStart, end_line: f.sliceEnd, label: f.label }));
    const titleParts = String(st.title || '').split('：');
    const titleTail = titleParts.length > 1 ? titleParts.slice(1).join('：') : st.title;
    const title = titleTail && titleTail !== st.dfLabel ? \`\${st.dfLabel}（\${titleTail}）\` : st.dfLabel;
    return {
      mode: 'dataflow',
      id: st.id,
      index,
      total: list.length,
      prevId,
      nextId,
      title,
      sublabel: st.dfSublabel || '',
      badge: \`🌊 图一 · 第 \${st.codeLabel} 站\`,
      sources,
      station: st,
      altStation: null,
      wbModuleId: st.wbTarget ? st.wbTarget.moduleId : null,
      wbNodeId: st.wbTarget ? st.wbTarget.nodeId : null,
      dossier: DATA.overviewDossiers?.dataflow?.[st.id] || null,
      upstream,
      downstream,
    };
  }
  if (ui.blueprintMode === 'techarch') {
    const list = DATA.techArch?.components || [];
    if (!list.length) return null;
    const comp = list.find(c => c.id === ui.selectedTechCompId) || list[0];
    const index = Math.max(0, list.findIndex(c => c.id === comp.id));
    const prevId = list[(index - 1 + list.length) % list.length].id;
    const nextId = list[(index + 1) % list.length].id;
    const byCompId = {};
    list.forEach(c => { byCompId[c.id] = c; });
    const upstream = (DATA.techArch?.connections || [])
      .filter(cn => cn.to === comp.id)
      .map(cn => {
        const src = byCompId[cn.from];
        return src ? { id: src.id, label: src.label, edgeLabel: cn.label || '' } : null;
      })
      .filter(Boolean);
    const downstream = (DATA.techArch?.connections || [])
      .filter(cn => cn.from === comp.id)
      .map(cn => {
        const dst = byCompId[cn.to];
        return dst ? { id: dst.id, label: dst.label, edgeLabel: cn.label || '' } : null;
      })
      .filter(Boolean);
    const info = (DATA.techArch?.compToStation || {})[comp.id];
    const st = info ? getStation(info.stationId) : null;
    return {
      mode: 'techarch',
      id: comp.id,
      index,
      total: list.length,
      prevId,
      nextId,
      title: comp.label,
      sublabel: comp.sublabel || '',
      badge: \`🏛️ 图二 · \${comp.tag || '架构组件'}\`,
      sources: comp.sources || [],
      station: st,
      altStation: null,
      wbModuleId: st && st.wbTarget ? st.wbTarget.moduleId : null,
      wbNodeId: st && st.wbTarget ? st.wbTarget.nodeId : null,
      dossier: DATA.overviewDossiers?.techarch?.[comp.id] || null,
      upstream,
      downstream,
    };
  }
  const bf = DATA.businessFlow || {};
  const list = bf.nodes || [];
  if (!list.length) return null;
  const node = list.find(n => n.id === ui.selectedBizNodeId) || list[0];
  const index = Math.max(0, list.findIndex(n => n.id === node.id));
  const prevId = list[(index - 1 + list.length) % list.length].id;
  const nextId = list[(index + 1) % list.length].id;
  const byNodeId = {};
  list.forEach(n => { byNodeId[n.id] = n; });
  const upstream = (bf.edges || [])
    .filter(e => e.to === node.id)
    .map(e => {
      const src = byNodeId[e.from];
      return src ? { id: src.id, label: src.label, edgeLabel: e.label || '' } : null;
    })
    .filter(Boolean);
  const downstream = (bf.edges || [])
    .filter(e => e.from === node.id)
    .map(e => {
      const dst = byNodeId[e.to];
      return dst ? { id: dst.id, label: dst.label, edgeLabel: e.label || '' } : null;
    })
    .filter(Boolean);
  const lane = (bf.lanes || []).find(l => l.id === node.lane);
  const info = (bf.nodeToLearn || {})[node.id];
  const st = info ? getStation(info.stationId) : null;
  const altSt = info && info.altStationId ? getStation(info.altStationId) : null;
  return {
    mode: 'businessflow',
    id: node.id,
    index,
    total: list.length,
    prevId,
    nextId,
    title: node.label,
    sublabel: node.sublabel || '',
    badge: \`🧭 图三 · \${lane ? lane.label : '业务节点'}\`,
    sources: node.sources || [],
    station: st,
    altStation: altSt,
    wbModuleId: info ? info.wbModuleId : null,
    wbNodeId: null,
    dossier: DATA.overviewDossiers?.businessflow?.[node.id] || null,
    upstream,
    downstream,
  };
}

function selectOverviewModule(mode, id, opts = {}) {
  ui.blueprintMode = mode;
  if (mode === 'dataflow') {
    ui.selectedDfStationId = id;
    if (ui.flowFilter !== 'all') {
      const st = getStation(id);
      if (st && st.flowId !== ui.flowFilter) ui.flowFilter = 'all';
    }
  } else if (mode === 'techarch') {
    ui.selectedTechCompId = id;
  } else {
    ui.selectedBizNodeId = id;
    if (ui.bizFilter !== 'all') {
      const bf = DATA.businessFlow || {};
      const mainSet = new Set(bf.mainPath || []);
      const info = (bf.nodeToLearn || {})[id];
      const matches = ui.bizFilter === 'main' ? mainSet.has(id) : (info && info.tracks && info.tracks.includes(ui.bizFilter));
      if (!matches) ui.bizFilter = 'all';
    }
  }
  if (opts.expand !== false) ui.dossierCollapsed = false;
  const stage = $('stage');
  const prevTop = stage ? stage.scrollTop : 0;
  renderOverview();
  if (stage) stage.scrollTop = prevTop;
  if (ui.dossierModalOpen) {
    renderDossierModal();
    const sc = document.querySelector('#dossierModalBox .dos-modal-scroll');
    if (sc) sc.scrollTop = 0;
  }
}

function renderDossierHeadHtml(ctx, isModal) {
  const srcChips = (ctx.sources || []).slice(0, 3).map(s => {
    const fname = String(s.path || '').split(/[\\\\/]/).pop() || s.label || 'src';
    const lineStr = (s.end_line && s.end_line !== s.line) ? \`L\${s.line}–\${s.end_line}\` : \`L\${s.line || 1}\`;
    return \`<span class="src-chip-inline">📄 \${escapeHtml(fname)}:\${lineStr}</span>\`;
  }).join('');
  const stBtnLabel = ctx.station
    ? (ctx.mode === 'dataflow'
      ? \`🚆 进入第 \${ctx.station.codeLabel} 站源码精读 →\`
      : \`🚆 去第 \${ctx.station.codeLabel} 站精读源码 →\`)
    : '';
  return \`<div class="dos-head">
    <div class="dos-head-left">
      <div class="dos-title-row">
        <span class="dos-mode-badge">\${escapeHtml(ctx.badge)}</span>
        <span class="dos-idx-pill">\${ctx.index + 1} / \${ctx.total}</span>
        <span class="dos-title-txt">\${escapeHtml(ctx.title)}</span>
        \${srcChips}
      </div>
      <div class="dos-sub-txt">\${escapeHtml(ctx.sublabel)} · 支持键盘 <kbd style="padding:0 4px;border:1px solid var(--border);border-radius:4px;font-size:10px">←</kbd> <kbd style="padding:0 4px;border:1px solid var(--border);border-radius:4px;font-size:10px">→</kbd> 切换上下模块</div>
    </div>
    <div class="dos-head-actions">
      <div class="dos-nav-grp">
        <button class="btn" data-dos-nav="prev" title="切换到上一个模块 (←)">← 上一个</button>
        <button class="btn" data-dos-nav="next" title="切换到下一个模块 (→)">下一个 →</button>
      </div>
      \${isModal
        ? '<button class="btn" data-dos-close-modal="1">✕ 关闭弹层 (Esc)</button>'
        : \`<button class="btn primary" data-dos-open-modal="1">⛶ 全屏深读</button>
           <button class="btn" data-dos-toggle-collapse="1">\${ui.dossierCollapsed ? '展开详解 ▾' : '收起面板 ▴'}</button>\`}
      \${ctx.station ? \`<button class="btn cta" data-dos-go-st="\${ctx.station.id}">\${escapeHtml(stBtnLabel)}</button>\` : ''}
      \${ctx.altStation ? \`<button class="btn primary" data-dos-go-st="\${ctx.altStation.id}">⚡ 关联第 \${ctx.altStation.codeLabel} 站</button>\` : ''}
      \${ctx.wbModuleId ? \`<button class="btn" data-dos-go-wb="\${ctx.wbModuleId}" data-dos-go-wbnode="\${ctx.wbNodeId || ''}">🗂️ 模块图谱</button>\` : ''}
    </div>
  </div>\`;
}

function renderDossierBodyHtml(ctx) {
  const d = ctx.dossier;
  if (!d) return '';
  const qaList = d.interviewQuestions || [];
  const allAnsOpen = qaList.length > 0 && qaList.every((_, i) => Boolean(ui.dossierOpenAns[\`\${ctx.mode}:\${ctx.id}:\${i}\`]));

  const renderNbChips = (items, dirLabel) => {
    if (!items.length) return \`<span class="dos-nb-lbl">\${dirLabel}：</span><span style="font-size:11px;color:var(--text-dim)">（链路起点/终点）</span>\`;
    return \`<span class="dos-nb-lbl">\${dirLabel}：</span>\` + items.map(it =>
      \`<button class="dos-neighbor-chip" data-dos-jump-id="\${escapeHtml(it.id)}" title="点击跳转到该模块的深度档案">
        <span>\${escapeHtml(it.label)}</span>
        \${it.edgeLabel ? \`<span class="nb-edge">(\${escapeHtml(it.edgeLabel)})</span>\` : ''}
      </button>\`
    ).join('');
  };

  const renderIoTable = (fields, colTitle) => \`
    <table class="dos-io-tbl">
      <thead><tr><th style="width:28%">\${colTitle}</th><th style="width:22%">类型/协议</th><th>说明</th></tr></thead>
      <tbody>\${(fields || []).map(f => \`<tr><td><code>\${escapeHtml(f.name)}</code></td><td style="color:var(--text-muted);font-family:ui-monospace,Consolas,monospace;font-size:10.5px">\${escapeHtml(f.type)}</td><td>\${formatInline(f.desc)}</td></tr>\`).join('')}</tbody>
    </table>\`;

  return \`<div class="dos-body">
    <!-- 1. Role & Why Need & Problems Solved -->
    <div class="dos-card">
      <div class="dos-card-head">
        <div class="dos-card-title">🎯 模块作用 · 为什么需要 · 解决什么问题</div>
        <span class="dos-card-sub">职责边界与痛点</span>
      </div>
      <div>
        <div class="dos-sub-lbl">模块核心作用与定位</div>
        <div class="dos-role-box">\${formatInline(d.role)}</div>
      </div>
      <div>
        <div class="dos-sub-lbl">为什么架构上必须独立存在这个模块？</div>
        <div class="dos-why-box">\${formatInline(d.whyNeed)}</div>
      </div>
      <div>
        <div class="dos-sub-lbl">重点解决的核心工程问题</div>
        <ul class="dos-problem-list">\${(d.problemsSolved || []).map(p => \`<li>\${formatInline(p)}</li>\`).join('')}</ul>
      </div>
    </div>

    <!-- 2. Principles & Anchors -->
    <div class="dos-card">
      <div class="dos-card-head">
        <div class="dos-card-title">⚙️ 核心实现原理与真实源码锚点</div>
        <span class="dos-card-sub">内部运转机制</span>
      </div>
      \${(d.principles || []).map((p, idx) => \`<div class="dos-prin-item">
        <div class="dos-prin-top">
          <span class="dos-prin-title">\${idx + 1}. \${escapeHtml(p.title)}</span>
          <span class="dos-anchor-badge" title="\${escapeHtml(p.anchor)}">\${escapeHtml(p.anchor)}</span>
        </div>
        <div class="dos-prin-detail">\${formatInline(p.detail)}</div>
      </div>\`).join('')}
    </div>

    <!-- 3. Production Failure Scenarios -->
    <div class="dos-card">
      <div class="dos-card-head">
        <div class="dos-card-title">🚨 如果这个模块出问题，上线会出现什么情况？</div>
        <span class="dos-card-sub">2 组典型故障推演</span>
      </div>
      \${(d.failureScenarios || []).map(fs => {
        const sevCls = fs.severity === 'P0' ? 'p0' : 'p1';
        const sevLbl = fs.severity === 'P0' ? 'P0 致命阻断/崩溃/安全' : 'P1 降级/边界/异常';
        return \`<div class="dos-incident sev-\${sevCls}">
          <div><span class="dos-sev-badge \${sevCls}">\${sevLbl}</span></div>
          <div class="dos-inc-line"><span class="dos-inc-tag">【故障诱因】</span>\${formatInline(fs.trigger)}</div>
          <div class="dos-inc-line"><span class="dos-inc-tag">【线上表象与影响】</span>\${formatInline(fs.prodImpact)}</div>
          <div class="dos-inc-line" style="color:var(--text-muted)"><span class="dos-inc-tag" style="color:var(--emerald)">【兜底与排查入口】</span>\${formatInline(fs.fallbackOrCheck)}</div>
        </div>\`;
      }).join('')}
    </div>

    <!-- 4. I/O Contract & Upstream/Downstream Links -->
    <div class="dos-card">
      <div class="dos-card-head">
        <div class="dos-card-title">🔄 模块传入传出契约与上下游联动</div>
        <span class="dos-card-sub">点击邻居跳转导读</span>
      </div>
      <div class="dos-neighbors-row">\${renderNbChips(ctx.upstream, '⬅️ 上游来源')}</div>
      <div class="dos-io-box in">
        <div class="dos-io-sum">📥 传入：\${formatInline(d.io?.inSummary || '')}</div>
        \${renderIoTable(d.io?.inFields, '传入字段')}
      </div>
      <div class="dos-io-transform"><strong>⚙️ 加工转换：</strong>\${formatInline(d.io?.transform || '')}</div>
      <div class="dos-io-box out">
        <div class="dos-io-sum">📤 传出：\${formatInline(d.io?.outSummary || '')}</div>
        \${renderIoTable(d.io?.outFields, '传出字段')}
      </div>
      <div class="dos-neighbors-row">\${renderNbChips(ctx.downstream, '➡️ 下游去向')}</div>
    </div>

    <!-- 5. Exam Points & Interview Questions -->
    <div class="dos-card full">
      <div class="dos-card-head">
        <div class="dos-card-title">🎓 高频考点 & 面试真题自测（先口述再展开对照）</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div class="dos-tag-row">\${(d.examPoints || []).map(tag => \`<span class="dos-exam-tag"># \${escapeHtml(tag)}</span>\`).join('')}</div>
          <button class="btn primary" data-dos-toggle-all-qa="1">\${allAnsOpen ? '收起全部参考答法' : '展开全部参考答法'}</button>
        </div>
      </div>
      <div class="dos-qa-grid">
        \${qaList.map((qa, idx) => {
          const k = \`\${ctx.mode}:\${ctx.id}:\${idx}\`;
          const isOpen = Boolean(ui.dossierOpenAns[k]);
          return \`<div class="dos-qa-item">
            <div class="dos-qa-top">
              <span class="dos-qa-focus">🎯 考察点：\${escapeHtml(qa.focus)}</span>
              <button class="btn" data-dos-toggle-qa="\${idx}">\${isOpen ? '收起答法 ▴' : '展开高分答法 ▾'}</button>
            </div>
            <div class="dos-qa-q">Q\${idx + 1}. \${formatInline(qa.q)}</div>
            <div class="dos-qa-ans \${isOpen ? 'open' : ''}"><strong>答：</strong>\${formatInline(qa.a)}</div>
          </div>\`;
        }).join('')}
      </div>
    </div>
  </div>\`;
}

function bindDossierEvents(container, ctx, isModal) {
  if (!container || !ctx) return;
  container.querySelectorAll('[data-dos-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.dosNav === 'prev' ? ctx.prevId : ctx.nextId;
      selectOverviewModule(ctx.mode, targetId, { expand: !ui.dossierCollapsed });
    });
  });
  container.querySelectorAll('[data-dos-toggle-collapse]').forEach(btn => {
    btn.addEventListener('click', () => {
      ui.dossierCollapsed = !ui.dossierCollapsed;
      const stage = $('stage');
      const prevTop = stage ? stage.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
    });
  });
  container.querySelectorAll('[data-dos-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => openDossierModal());
  });
  container.querySelectorAll('[data-dos-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeDossierModal());
  });
  container.querySelectorAll('[data-dos-go-st]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isModal) closeDossierModal();
      openStation(btn.dataset.dosGoSt);
    });
  });
  container.querySelectorAll('[data-dos-go-wb]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isModal) closeDossierModal();
      openWorkbenchAt(btn.dataset.dosGoWb, btn.dataset.dosGoWbnode || undefined);
    });
  });
  container.querySelectorAll('[data-dos-jump-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectOverviewModule(ctx.mode, btn.dataset.dosJumpId, { expand: true });
    });
  });
  container.querySelectorAll('[data-dos-toggle-qa]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.dosToggleQa;
      const k = \`\${ctx.mode}:\${ctx.id}:\${idx}\`;
      ui.dossierOpenAns[k] = !ui.dossierOpenAns[k];
      const stage = $('stage');
      const prevTop = stage ? stage.scrollTop : 0;
      const modalSc = document.querySelector('#dossierModalBox .dos-modal-scroll');
      const prevModalTop = modalSc ? modalSc.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
      if (ui.dossierModalOpen) {
        renderDossierModal();
        const nextModalSc = document.querySelector('#dossierModalBox .dos-modal-scroll');
        if (nextModalSc) nextModalSc.scrollTop = prevModalTop;
      }
    });
  });
  container.querySelectorAll('[data-dos-toggle-all-qa]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qs = ctx.dossier ? (ctx.dossier.interviewQuestions || []) : [];
      const allOpen = qs.every((_, i) => Boolean(ui.dossierOpenAns[\`\${ctx.mode}:\${ctx.id}:\${i}\`]));
      qs.forEach((_, i) => { ui.dossierOpenAns[\`\${ctx.mode}:\${ctx.id}:\${i}\`] = !allOpen; });
      const stage = $('stage');
      const prevTop = stage ? stage.scrollTop : 0;
      const modalSc = document.querySelector('#dossierModalBox .dos-modal-scroll');
      const prevModalTop = modalSc ? modalSc.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
      if (ui.dossierModalOpen) {
        renderDossierModal();
        const nextModalSc = document.querySelector('#dossierModalBox .dos-modal-scroll');
        if (nextModalSc) nextModalSc.scrollTop = prevModalTop;
      }
    });
  });
}

function renderDossierModal() {
  const ctx = getActiveOverviewContext();
  const box = $('dossierModalBox');
  if (!box || !ctx || !ctx.dossier) return;
  box.innerHTML = \`\${renderDossierHeadHtml(ctx, true)}<div class="dos-modal-scroll">\${renderDossierBodyHtml(ctx)}</div>\`;
  bindDossierEvents(box, ctx, true);
}

function openDossierModal() {
  const ctx = getActiveOverviewContext();
  if (!ctx || !ctx.dossier) return;
  ui.dossierModalOpen = true;
  renderDossierModal();
  $('dossierModal').classList.add('open');
}

function closeDossierModal() {
  ui.dossierModalOpen = false;
  $('dossierModal').classList.remove('open');
}

function renderOverview() {
  const nextSt = getNextStation();
  const totalStations = DATA.stations.length;
  const doneCount = progress.completed.length;
  const projName = DATA.meta?.projectName || '本项目';
  const firstSt = getOrderedStations()[0];
  const ctaText = doneCount === 0
    ? \`🚀 从主线一第 \${firstSt.codeLabel} 站开始：追踪一条核心主线的完整链路 →\`
    : (doneCount >= totalStations ? \`🏆 全部 \${totalStations} 站已通关！进入面试总考 →\` : \`▶ 继续学习第 \${nextSt.codeLabel} 站：\${nextSt.dfLabel} →\`);

  const flowChipsHtml = DATA.flows.map(f => {
    const doneInFlow = f.stationIds.filter(isDone).length;
    const pct = Math.round((doneInFlow / Math.max(1, f.stationIds.length)) * 100);
    return \`<div class="fp-chip" data-focus-flow="\${f.id}">
      <div class="fp-top"><span>\${escapeHtml(f.chipLabel || f.shortName)}</span><span style="color:var(--emerald)">\${doneInFlow}/\${f.stationIds.length}</span></div>
      <div class="fp-bar"><div class="fp-fill" style="width:\${pct}%"></div></div>
    </div>\`;
  }).join('');

  const ctx = getActiveOverviewContext();
  const d = ctx ? ctx.dossier : null;
  let bpBottomHtml = '';
  if (d) {
    bpBottomHtml = \`<div class="dos-deck" id="overviewDossierDeck">
      \${renderDossierHeadHtml(ctx, false)}
      \${ui.dossierCollapsed
        ? \`<div class="dos-collapsed-bar">
            <span><strong>模块定位：</strong>\${formatInline(d.role)}</span>
            <button class="btn primary" data-dos-toggle-collapse="1">展开 6 维深度档案 ▾</button>
          </div>\`
        : renderDossierBodyHtml(ctx)}
    </div>\`;
  } else {
    let detailBarHtml = '';
    if (ui.blueprintMode === 'dataflow') {
      const st = getStation(ui.selectedDfStationId);
      detailBarHtml = \`
        <div style="min-width:0;flex:1">
          <div style="font-weight:800;font-size:13px">📍 选中站点：\${escapeHtml(st.codeLabel)} · \${escapeHtml(st.title)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">📥 \${escapeHtml(st.inputSpec)} <strong>→</strong> 📤 \${escapeHtml(st.outputSpec)}</div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="btn cta" id="btnEnterSelectedStation">🚆 进入第 \${st.codeLabel} 站源码精读 →</button>
        </div>\`;
    } else if (ui.blueprintMode === 'techarch') {
      const comp = DATA.techArch.components.find(c => c.id === ui.selectedTechCompId) || DATA.techArch.components[0];
      const info = (DATA.techArch.compToStation || {})[comp?.id] || { stationId: FIRST_STATION_ID, role: comp?.sublabel || '' };
      const st = getStation(info.stationId);
      detailBarHtml = \`
        <div style="min-width:0;flex:1">
          <div style="font-weight:800;font-size:13px">🏛️ 架构组件：\${escapeHtml(comp.label)}（\${escapeHtml(comp.sublabel || '')}）</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">\${escapeHtml(info.role)}</div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="btn cta" id="btnEnterCompStation">🚆 去第 \${st.codeLabel} 站精读此组件源码 →</button>
        </div>\`;
    } else {
      const bf = DATA.businessFlow;
      const node = bf.nodes.find(n => n.id === ui.selectedBizNodeId) || bf.nodes[0];
      const lane = bf.lanes.find(l => l.id === node?.lane);
      const info = (bf.nodeToLearn || {})[node?.id] || { stationId: FIRST_STATION_ID, role: node?.sublabel || '' };
      const st = getStation(info.stationId);
      const altSt = info.altStationId ? getStation(info.altStationId) : null;
      const srcChips = (node.sources || []).map(s =>
        \`<span class="src-chip-inline">📄 \${escapeHtml(s.path.split('/').pop())}:L\${s.line}–\${s.end_line}</span>\`
      ).join('');
      detailBarHtml = \`
        <div style="min-width:0;flex:1">
          <div style="font-weight:800;font-size:13px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span>🧭 业务节点：\${escapeHtml(node.label)}</span>
            <span style="font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--accent-soft);color:var(--accent)">\${escapeHtml(lane ? lane.label : '')}</span>
            \${srcChips}
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:3px">\${escapeHtml(info.role)}</div>
        </div>
        <div style="display:flex;gap:7px;flex-shrink:0;flex-wrap:wrap">
          <button class="btn cta" id="btnEnterBizStation">🚆 去第 \${st.codeLabel} 站精读源码 →</button>
          \${altSt ? \`<button class="btn primary" id="btnEnterBizAltStation">⚡ 关联第 \${altSt.codeLabel} 站</button>\` : ''}
          \${info.wbModuleId ? \`<button class="btn" id="btnEnterBizWb">🗂️ 模块图谱</button>\` : ''}
        </div>\`;
    }
    bpBottomHtml = \`<div class="bp-detail-bar">\${detailBarHtml}</div>\`;
  }

  // Right-side header controls per blueprint mode
  let bpHeaderRightHtml = '';
  if (ui.blueprintMode === 'dataflow') {
    bpHeaderRightHtml = \`<div class="bp-filters">
      <button class="flt-pill \${ui.flowFilter === 'all' ? 'active' : ''}" data-flt="all">全部 \${DATA.flows.length} 条链路</button>
      \${DATA.flows.map(fl => \`<button class="flt-pill \${ui.flowFilter === fl.id ? 'active' : ''}" data-flt="\${fl.id}">\${escapeHtml(fl.filterLabel || fl.shortName)}</button>\`).join('')}
    </div>\`;
  } else if (ui.blueprintMode === 'techarch') {
    bpHeaderRightHtml = d
      ? '<span style="font-size:11.5px;color:var(--text-muted)">单击组件查看下方深度档案并高亮连线，双击或点按钮直达源码精读</span>'
      : \`<span style="font-size:11.5px;color:var(--text-muted)">点击任意 \${DATA.techArch.components.length} 个架构组件高亮连线，双击直达源码站点</span>\`;
  } else {
    bpHeaderRightHtml = \`<div class="bp-filters">
      \${(DATA.businessFlow.trackFilters || [{ id: 'all', label: '全部业务流' }]).map(f => \`<button class="flt-pill \${ui.bizFilter === f.id ? 'active' : ''}" data-bflt="\${f.id}">\${escapeHtml(f.label)}</button>\`).join('')}
    </div>\`;
  }

  // Progressive Syllabus Tables
  const syllabusHtml = DATA.flows.map(fl => {
    const badgeCls = fl.color === 'emerald' ? 'emerald' : (fl.color === 'rose' ? 'rose' : '');
    const doneCnt = fl.stationIds.filter(isDone).length;
    const rows = fl.stationIds.map(sid => {
      const st = getStation(sid);
      const done = isDone(st.id);
      const compNames = (st.techCompIds || []).map(cid => (DATA.techArch.components.find(c => c.id === cid) || {}).label).filter(Boolean).join(' + ');
      return \`<tr class="sf-row" data-open-st="\${st.id}">
        <td style="width:70px"><span class="st-code \${done ? 'done' : ''}">\${done ? '✓ ' : ''}\${st.codeLabel}</span></td>
        <td style="width:24%"><strong>\${escapeHtml(st.dfLabel)}</strong><div style="font-size:11px;color:var(--text-muted)">\${escapeHtml(st.title.split('：')[1] || st.title)}</div></td>
        <td style="width:30%;font-size:11.5px;color:var(--text-muted)"><strong>收：</strong>\${escapeHtml(st.inputSpec.slice(0, 34))}…<br/><strong>吐：</strong>\${escapeHtml(st.outputSpec.slice(0, 34))}…</td>
        <td style="width:16%;font-size:11.5px;color:var(--accent)">🏛️ \${escapeHtml(compNames || '核心组件')}</td>
        <td style="width:10%;color:var(--amber);font-size:11.5px">\${'★'.repeat(st.stars || 4)}<div style="color:var(--text-dim)">\${escapeHtml(st.duration || '15 分钟')}</div></td>
        <td style="width:12%;text-align:right"><button class="btn primary" data-open-st="\${st.id}">\${done ? '复习本站' : '开始学 →'}</button></td>
      </tr>\`;
    }).join('');
    return \`<div class="syllabus-flow">
      <div class="sf-head">
        <div>
          <span class="sf-badge \${badgeCls}">\${escapeHtml(fl.badge || fl.shortName)}</span>
          <strong style="margin-left:8px;font-size:14.5px">\${escapeHtml(fl.name)}</strong>
          <div style="font-size:12px;color:var(--text-muted);margin-top:3px">\${escapeHtml(fl.summary || '')}</div>
        </div>
        <span class="rank-pill">\${doneCnt} / \${fl.stationIds.length} 站已通关</span>
      </div>
      <table class="sf-table">
        <thead><tr><th>站号</th><th>模块与本节主题</th><th>数据流转（输入 → 输出）</th><th>对应技术架构组件</th><th>权重</th><th style="text-align:right">操作</th></tr></thead>
        <tbody>\${rows}</tbody>
      </table>
    </div>\`;
  }).join('');

  const hasDossiers = Boolean(DATA.overviewDossiers);
  const totalDossiers = totalStations + (DATA.techArch?.components?.length || 0) + (DATA.businessFlow?.nodes?.length || 0);
  const heroKicker = DATA.meta?.heroKicker || (hasDossiers
    ? \`🏛️ 融合三大全景蓝图：「全链路数据流图」+「技术架构图」+「端到端业务流程泳道图」· \${totalDossiers} 节点模块百科 + \${totalStations} 站源码通关\`
    : \`🏛️ 融合三大全景蓝图：「全链路数据流图」+「技术架构图」+「端到端业务流程泳道图」· \${totalStations} 站源码通关\`);
  const heroTitle = DATA.meta?.heroTitle || \`顺着真实架构、数据流与业务泳道，一站一站吃透 \${projName}！\`;
  const heroSub = DATA.meta?.heroSubtitle || (hasDossiers
    ? '先在下方三张全景图上**单击任意模块节点**，即可直接在图下（或全屏弹层）精读该模块的**作用痛点、核心原理、线上故障推演、传入传出与面试真题**；点击按钮或双击节点再进入源码精读！'
    : '先在下方三张全景架构/业务图上建立全局视野，点击任意节点即可直接跳入「左逐行中文精注源码 ↔ 右 5-STEP 精读工坊」循序渐进掌握每个模块！');
  const dirTreeLines = WB_MODULES[0]?.files?.[0]?.lines?.length || 0;
  const wbBtnText = DATA.meta?.workbenchBtnLabel || \`🗂️ 打开 \${dirTreeLines} 行中文项目目录 ↔ \${Math.max(1, WB_MODULES.length - 1)} 模块流转图\`;

  $('viewOverview').innerHTML = \`
    <div class="hero">
      <div class="hero-left">
        <div class="hero-kicker">\${escapeHtml(heroKicker)}</div>
        <h1>\${escapeHtml(heroTitle)}</h1>
        <p>\${formatInline(heroSub)}</p>
        <div class="hero-actions">
          <button class="btn cta" id="btnOverviewCta">\${escapeHtml(ctaText)}</button>
          <button class="btn primary" id="btnOverviewToWb">\${escapeHtml(wbBtnText)}</button>
        </div>
      </div>
      <div class="flow-progress-row">\${flowChipsHtml}</div>
    </div>

    <div class="blueprint-card">
      <div class="bp-header">
        <div class="bp-tabs">
          <button class="bp-tab \${ui.blueprintMode === 'dataflow' ? 'active' : ''}" data-bp="dataflow">🌊 图一：全链路数据流（\${totalStations} 站）</button>
          <button class="bp-tab \${ui.blueprintMode === 'techarch' ? 'active' : ''}" data-bp="techarch">🏛️ 图二：技术架构边界（\${DATA.techArch.components.length} 组件）</button>
          <button class="bp-tab \${ui.blueprintMode === 'businessflow' ? 'active' : ''}" data-bp="businessflow">🧭 图三：端到端业务流程（\${DATA.businessFlow.lanes.length} 泳道 · \${DATA.businessFlow.nodes.length} 节点）</button>
        </div>
        \${bpHeaderRightHtml}
      </div>
      <div class="bp-canvas">
        \${ui.blueprintMode === 'dataflow' ? buildDataflowBlueprintSvg() : (ui.blueprintMode === 'techarch' ? buildTechArchBlueprintSvg() : buildBusinessFlowBlueprintSvg())}
      </div>
      \${bpBottomHtml}
    </div>

    <div style="font-size:15px;font-weight:800;margin:18px 0 10px">📋 按 \${DATA.flows.length} 条全链路编排的循序渐进源码学习大纲 <span style="font-size:12px;font-weight:500;color:var(--text-muted)">（点击任意一站立刻进入「左逐行中文源码 ↔ 右流转图 + 数据契约」精读）</span></div>
    \${syllabusHtml}
  \`;

  // Bind Overview events
  $('btnOverviewCta').addEventListener('click', () => {
    if (doneCount >= totalStations) setView('interview');
    else openStation(nextSt.id);
  });
  $('btnOverviewToWb').addEventListener('click', () => openWorkbenchAt(WB_MODULES[0]?.id || 'dir_tree'));
  $('viewOverview').querySelectorAll('.fp-chip').forEach(el => {
    el.addEventListener('click', () => {
      ui.blueprintMode = 'dataflow';
      ui.flowFilter = el.dataset.focusFlow;
      const stage = $('stage'); const prevTop = stage ? stage.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
    });
  });
  $('viewOverview').querySelectorAll('.bp-tab').forEach(b => {
    b.addEventListener('click', () => {
      ui.blueprintMode = b.dataset.bp;
      const stage = $('stage'); const prevTop = stage ? stage.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
    });
  });
  $('viewOverview').querySelectorAll('.flt-pill[data-flt]').forEach(b => {
    b.addEventListener('click', () => {
      ui.flowFilter = b.dataset.flt;
      const stage = $('stage'); const prevTop = stage ? stage.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
    });
  });
  $('viewOverview').querySelectorAll('.flt-pill[data-bflt]').forEach(b => {
    b.addEventListener('click', () => {
      ui.bizFilter = b.dataset.bflt;
      const stage = $('stage'); const prevTop = stage ? stage.scrollTop : 0;
      renderOverview();
      if (stage) stage.scrollTop = prevTop;
    });
  });
  if ($('dfBlueprintSvg')) {
    $('dfBlueprintSvg').querySelectorAll('.arch-node').forEach(g => {
      g.addEventListener('click', () => selectOverviewModule('dataflow', g.dataset.stid, { expand: true }));
      g.addEventListener('dblclick', () => openStation(g.dataset.stid));
    });
  }
  if ($('techArchSvg')) {
    $('techArchSvg').querySelectorAll('.arch-node').forEach(g => {
      g.addEventListener('click', () => selectOverviewModule('techarch', g.dataset.compId, { expand: true }));
      g.addEventListener('dblclick', () => {
        const info = DATA.techArch.compToStation[g.dataset.compId];
        if (info) openStation(info.stationId);
      });
    });
  }
  if ($('businessFlowSvg')) {
    $('businessFlowSvg').querySelectorAll('.arch-node').forEach(g => {
      g.addEventListener('click', () => selectOverviewModule('businessflow', g.dataset.bizId, { expand: true }));
      g.addEventListener('dblclick', () => {
        const info = DATA.businessFlow.nodeToLearn[g.dataset.bizId];
        if (info) openStation(info.stationId);
      });
    });
  }
  if (d) {
    bindDossierEvents($('overviewDossierDeck'), ctx, false);
  } else {
    if ($('btnEnterSelectedStation')) {
      $('btnEnterSelectedStation').addEventListener('click', () => openStation(ui.selectedDfStationId));
    }
    if ($('btnEnterCompStation')) {
      $('btnEnterCompStation').addEventListener('click', () => {
        const info = (DATA.techArch?.compToStation || {})[ui.selectedTechCompId];
        if (info) openStation(info.stationId);
      });
    }
    if ($('btnEnterBizStation')) {
      $('btnEnterBizStation').addEventListener('click', () => {
        const info = (DATA.businessFlow?.nodeToLearn || {})[ui.selectedBizNodeId];
        if (info) openStation(info.stationId);
      });
    }
    if ($('btnEnterBizAltStation')) {
      $('btnEnterBizAltStation').addEventListener('click', () => {
        const info = (DATA.businessFlow?.nodeToLearn || {})[ui.selectedBizNodeId];
        if (info && info.altStationId) openStation(info.altStationId);
      });
    }
    if ($('btnEnterBizWb')) {
      $('btnEnterBizWb').addEventListener('click', () => {
        const info = (DATA.businessFlow?.nodeToLearn || {})[ui.selectedBizNodeId];
        if (info && info.wbModuleId) openWorkbenchAt(info.wbModuleId);
      });
    }
  }
  $('viewOverview').querySelectorAll('[data-open-st]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); openStation(el.dataset.openSt); });
  });
}

// =========================================================================
// VIEW 2: STATION-BY-STATION PROGRESSIVE STUDIO (METRO + LEFT CODE <-> RIGHT FLOW)
// =========================================================================
function buildStationMicroSvg(st) {
  const steps = st.steps || [];
  const nodeW = 204, nodeH = 86, gap = 38, y = 22;
  const xs = steps.map((_, i) => 16 + i * (nodeW + gap));
  const vbW = Math.max(480, 16 + steps.length * nodeW + Math.max(0, steps.length - 1) * gap + 16), vbH = 132;
  const defs = \`<defs><marker id="sm-arr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/></marker></defs>\`;
  let edges = '';
  for (let i = 0; i < steps.length - 1; i++) {
    const sx = xs[i] + nodeW, tx = xs[i + 1], cy = y + nodeH / 2;
    const d = \`M\${sx} \${cy} L\${tx} \${cy}\`, pid = \`smp-\${st.id}-\${i}\`;
    const lbl = steps[i].edgeLabel || '', midX = (sx + tx) / 2;
    const lw = Math.max(30, Math.round(textUnits(lbl) * 5.6 + 8));
    edges += \`<g>
      <path id="\${pid}" class="edge-path" d="\${d}" marker-end="url(#sm-arr)" />
      <circle class="flow-dot" r="2.8"><animateMotion dur="2s" repeatCount="indefinite"><mpath href="#\${pid}" /></animateMotion></circle>
      \${lbl ? \`<rect class="edge-label-bg" x="\${midX - lw / 2}" y="\${cy - 20}" width="\${lw}" height="16" /><text class="edge-label-tx" x="\${midX}" y="\${cy - 12}">\${escapeHtml(lbl)}</text>\` : ''}
    </g>\`;
  }
  let nodes = '';
  steps.forEach((s, idx) => {
    const v = TYPE_VAR[s.type] || 'backend', act = s.id === ui.activeStepId;
    const file = st.files.find(f => f.id === s.fileId);
    const rawF = file ? file.label.split('/').pop().replace(/ \\(.*\\)$/, '') : '';
    const shortF = rawF.length > 14 ? rawF.slice(0, 12) + '…' : rawF;
    const chip = \`↔ \${shortF}:L\${s.startLine}\`;
    const tagW = Math.max(40, Math.round(textUnits(s.tag) * 5.4 + 10));
    const tagX = nodeW - tagW - 8;
    nodes += \`<g class="arch-node \${act ? 'active' : 'dimmed'}" data-step-id="\${s.id}" transform="translate(\${xs[idx]}, \${y})">
      <rect class="node-box" x="0" y="0" width="\${nodeW}" height="\${nodeH}" rx="10" fill="var(--c-\${v}-bg)" stroke="var(--c-\${v}-bd)" />
      <circle cx="17" cy="20" r="9" fill="var(--c-\${v}-bd)" />
      <text class="node-step-badge" x="17" y="23.5" text-anchor="middle" fill="#080d16">\${s.order}</text>
      <text class="node-title" x="32" y="24" fill="var(--c-\${v}-tx)">\${escapeHtml(s.label)}</text>
      <text class="node-sub" x="10" y="45" fill="var(--c-\${v}-tx)">\${escapeHtml(s.sublabel)}</text>
      <text class="node-src-chip" x="10" y="70" fill="var(--c-\${v}-bd)">\${escapeHtml(chip)}</text>
      <rect class="node-tag-bg" x="\${tagX}" y="59" width="\${tagW}" height="16" rx="8" fill="var(--c-\${v}-bd)" />
      <text class="node-tag-tx" x="\${tagX + tagW / 2}" y="70" text-anchor="middle" fill="var(--c-\${v}-tx)">\${escapeHtml(s.tag)}</text>
    </g>\`;
  });
  return \`<svg class="st-mini-svg" id="stationMicroSvg" viewBox="0 0 \${vbW} \${vbH}" xmlns="http://www.w3.org/2000/svg">\${defs}\${edges}\${nodes}</svg>\`;
}

function renderStation(scrollCode = true) {
  const st = getStation(progress.currentStationId);
  const flow = getFlow(st.flowId);
  if (!st.steps.some(s => s.id === ui.activeStepId)) ui.activeStepId = st.steps[0].id;
  const activeStep = st.steps.find(s => s.id === ui.activeStepId) || st.steps[0];
  if (!st.files.some(f => f.id === ui.activeFileId)) ui.activeFileId = activeStep.fileId;
  const activeFile = st.files.find(f => f.id === ui.activeFileId) || st.files[0];

  const done = isDone(st.id);
  const allOrdered = getOrderedStations();
  const globalIdx = allOrdered.findIndex(x => x.id === st.id);
  const prevSt = globalIdx > 0 ? allOrdered[globalIdx - 1] : null;
  const nextSt = globalIdx < allOrdered.length - 1 ? allOrdered[globalIdx + 1] : null;

  const compLabels = (st.techCompIds || []).map(cid => {
    const c = (DATA.techArch?.components || []).find(x => x.id === cid);
    return c ? \`<button class="flt-pill" data-jump-comp="\${c.id}" title="去图二·技术架构总览高亮此组件">🏛️ \${escapeHtml(c.label)}</button>\` : '';
  }).join(' ');
  const bizNodesForSt = (DATA.businessFlow?.nodes || []).filter(n => {
    const m = (DATA.businessFlow?.nodeToLearn || {})[n.id];
    return m && (m.stationId === st.id || m.altStationId === st.id);
  }).slice(0, 1);
  const bizLabels = bizNodesForSt.map(n =>
    \`<button class="flt-pill" data-jump-biz="\${n.id}" title="去图三·业务流程泳道图定位此节点">🧭 \${escapeHtml(n.label)}</button>\`
  ).join(' ');
  const ctxPills = [compLabels, bizLabels].filter(Boolean).join(' ');

  function getLineNote(filePath, ln) {
    return (DATA.lineNotes && DATA.lineNotes[filePath] && DATA.lineNotes[filePath][String(ln)]) || '';
  }

  let codeRows = '';
  for (let i = 0; i < activeFile.lines.length; i++) {
    const ln = activeFile.startLine + i;
    const rawLine = activeFile.lines[i];
    const mapped = st.steps.find(s => s.fileId === activeFile.id && ln >= s.startLine && ln <= s.endLine);
    const isAct = activeStep.fileId === activeFile.id && ln >= activeStep.startLine && ln <= activeStep.endLine;
    const note = getLineNote(activeFile.path, ln);
    const cls = ['code-row'];
    if (mapped) cls.push('mapped');
    if (isAct) cls.push('active-line');
    const inlineNoteHtml = (ui.noteMode === 'inline' && note)
      ? \`<span class="code-note-inline">// 💬 \${escapeHtml(note)}</span>\`
      : '';
    codeRows += \`<tr class="\${cls.join(' ')}" data-ln="\${ln}" \${mapped ? \`data-step-id="\${mapped.id}"\` : ''}>
      <td class="ln-cell">\${ln}</td>
      <td class="code-cell">\${highlightLine(rawLine, activeFile.syntax)}\${inlineNoteHtml}</td>
    </tr>\`;
    if (ui.noteMode === 'below' && note) {
      const leadIndent = (rawLine.match(/^(\\s*)/) || ['', ''])[1].replace(/\\t/g, '    ');
      const ncls = ['code-note-row'];
      if (mapped) ncls.push('mapped');
      if (isAct) ncls.push('active-line');
      codeRows += \`<tr class="\${ncls.join(' ')}" \${mapped ? \`data-step-id="\${mapped.id}"\` : ''}>
        <td class="code-note-ln"></td>
        <td class="code-note-cell"><span class="code-note-indent">\${escapeHtml(leadIndent)}↳ </span>\${escapeHtml(note)}</td>
      </tr>\`;
    }
  }

  const chosen = progress.quizChoice[st.id];
  const hasAnswered = chosen !== undefined;
  const passed = hasAnswered && chosen === st.quiz.correctIndex;
  const letters = ['A','B','C','D'];
  const wbWhy = st.whyBlock;
  const io = st.ioContract;

  const renderFieldsTable = (fields, colTitle) => \`
    <table class="io-table">
      <thead><tr><th style="width:28%">\${colTitle}</th><th style="width:22%">类型</th><th>参数说明</th></tr></thead>
      <tbody>\${fields.map(f => \`<tr><td><code>\${escapeHtml(f.name)}</code></td><td style="color:var(--text-muted);font-family:ui-monospace,Consolas,monospace;font-size:10.5px">\${escapeHtml(f.type)}</td><td>\${formatInline(f.desc)}</td></tr>\`).join('')}</tbody>
    </table>\`;

  const ioInBlock = \`
    <div class="io-block in">
      <div class="io-block-head">
        <span class="io-block-title">📥 进入本站的数据结构与参数 (Input)</span>
        <span class="io-type-badge">\${escapeHtml(io.inType)}</span>
      </div>
      \${renderFieldsTable(io.inFields, '进入字段')}
      <pre class="io-pre in">\${escapeHtml(io.inSample)}</pre>
    </div>\`;

  const ioTrBlock = \`
    <div class="io-block tr">
      <div class="io-block-head">
        <span class="io-block-title">⚙️ 本站核心加工与字段变化 (Transform)</span>
        <span class="io-type-badge">\${io.transformSteps.length} 步关键变换</span>
      </div>
      <ol class="io-transform-list">\${io.transformSteps.map(t => \`<li>\${formatInline(t)}</li>\`).join('')}</ol>
    </div>\`;

  const ioOutBlock = \`
    <div class="io-block out">
      <div class="io-block-head">
        <span class="io-block-title">📤 传出给下一站的数据结构与参数 (Output)</span>
        <span class="io-type-badge">\${escapeHtml(io.outType)}</span>
      </div>
      \${renderFieldsTable(io.outFields, '传出字段')}
      <pre class="io-pre out">\${escapeHtml(io.outSample)}</pre>
    </div>\`;

  const ioBodyHtml = ui.ioTab === 'in' ? ioInBlock
    : (ui.ioTab === 'tr' ? ioTrBlock
    : (ui.ioTab === 'out' ? ioOutBlock : ioInBlock + ioTrBlock + ioOutBlock));

  const metroStopsHtml = flow.stationIds.map((sid, i) => {
    const item = getStation(sid);
    const isC = sid === st.id, isD = isDone(sid);
    return \`\${i > 0 ? '<span class="metro-arrow">→</span>' : ''}
      <button class="metro-stop \${isC ? 'active' : ''} \${isD ? 'done' : ''}" data-metro-st="\${sid}">
        <span>\${isD ? '✓' : item.codeLabel}</span>
        <span>\${escapeHtml(item.dfLabel)}</span>
      </button>\`;
  }).join('');

  $('viewStation').innerHTML = \`
    <!-- Top Flow Selector & 5-Station Metro Progress Bar -->
    <div class="metro-bar">
      <div class="metro-flow-tabs">
        \${DATA.flows.map(fl => \`
          <button class="metro-flow-btn \${fl.id === flow.id ? 'active' : ''}" data-mflow="\${fl.id}">\${escapeHtml(fl.shortName)}</button>\`).join('')}
      </div>
      <div class="metro-track">\${metroStopsHtml}</div>
      \${(st.wbTarget && WB_MODULES.length) ? '<div style="display:flex;gap:6px"><button class="btn primary" id="btnStToWb">🗂️ 全景图谱深挖</button></div>' : ''}
    </div>

    <!-- Compact Input -> Station Identity -> Output Strip -->
    <div class="station-context">
      <div class="ctx-box in">
        <div class="ctx-lbl"><span>📥 上一站输入</span><button class="ctx-jump-link" data-jump-io="in">看完整输入报文 ↘</button></div>
        <div class="ctx-txt">\${formatInline(st.inputSpec)}</div>
      </div>
      <div class="ctx-box mid">
        <div class="ctx-lbl"><span>📍 \${escapeHtml(st.codeLabel)} · \${escapeHtml(st.dfLabel)}（\${escapeHtml(st.duration)}）</span><span>\${ctxPills}</span></div>
        <div class="ctx-txt" style="color:var(--text-muted)">\${escapeHtml(st.title)}</div>
      </div>
      <div class="ctx-box out">
        <div class="ctx-lbl"><span>📤 吐给下一站</span><button class="ctx-jump-link" data-jump-io="out">看完整输出报文 ↘</button></div>
        <div class="ctx-txt">\${formatInline(st.outputSpec)}</div>
      </div>
    </div>

    <!-- Main Split: Left Verbatim Real Code (with Per-line Chinese Notes) <-> Right Progressive Studio -->
    <div class="station-split">
      <section class="st-left" id="stLeftPane">
        <div class="st-code-head">
          <div class="st-file-tabs" id="stFileTabs">
            \${st.files.map(f => \`<button class="st-file-tab \${f.id === activeFile.id ? 'active' : ''}" data-fid="\${f.id}">\${escapeHtml(f.label)}</button>\`).join('')}
          </div>
          <div class="note-mode-group" id="stNoteModeGroup" title="切换每行源码的中文备注显示方式">
            <button class="note-mode-btn \${ui.noteMode === 'below' ? 'active' : ''}" data-nmode="below">💬 行下备注</button>
            <button class="note-mode-btn \${ui.noteMode === 'inline' ? 'active' : ''}" data-nmode="inline">行尾</button>
            <button class="note-mode-btn \${ui.noteMode === 'off' ? 'active' : ''}" data-nmode="off">隐藏</button>
          </div>
        </div>
        <div class="st-path-bar">
          <span>\${escapeHtml(activeFile.path)} (L\${activeFile.startLine}–L\${activeFile.endLine})</span>
          <span style="color:var(--accent)">焦点：Step \${activeStep.order} · \${escapeHtml(activeStep.label)}</span>
        </div>
        <div class="st-code-scroll" id="stCodeScroll"><table class="code-table">\${codeRows}</table></div>
      </section>

      <div class="splitter" id="stSplitter" title="拖动调整左右比例"></div>

      <section class="st-right" id="stRightPane">
        <!-- STEP 1: Why This Code Exists (Pain Point + 0-Basis Analogy + Beginner Anti-Rabbit-Hole Tip) -->
        <div class="why-panel \${ui.whyCollapsed ? 'collapsed' : ''}" id="stWhyPanel">
          <div class="why-head">
            <div style="font-size:12.5px;font-weight:800;display:flex;align-items:center">
              <span class="step-pill">STEP 1</span>
              <span>💡 先用 60 秒白话搞懂：为什么要有这部分代码？</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn success \${done ? 'done' : ''}" id="btnStDoneTop">\${done ? '✓ 已掌握本站' : '○ 标记掌握'}</button>
              <button class="icon-btn" id="btnToggleWhy">\${ui.whyCollapsed ? '展开 ▸' : '收起 ▾'}</button>
            </div>
          </div>
          <div class="why-body-wrap">
            <div class="why-grid">
              <div class="why-box pain">
                <div class="why-box-title">❓ 解决什么真实痛点</div>
                <div class="why-box-body">\${formatInline(wbWhy.painPoint)}</div>
              </div>
              <div class="why-box analogy">
                <div class="why-box-title">🧠 0 基础生活化类比</div>
                <div class="why-box-body">\${formatInline(wbWhy.analogy)}</div>
              </div>
            </div>
            <div class="why-avoid"><strong>🛑 新手防偏提示：</strong>\${formatInline(wbWhy.avoidRabbitHole)}</div>
          </div>
        </div>

        <!-- STEP 2: Interactive 3-Step Micro-Flow + Code Deep Dive -->
        <div class="mini-panel">
          <div class="mp-title">
            <span><span class="step-pill">STEP 2</span>🔁 本站源码执行微流转图（点击节点定位左侧真实代码）</span>
            <span style="font-size:11px;color:var(--text-dim)">点击左侧蓝条源码也可反向定位</span>
          </div>
          \${buildStationMicroSvg(st)}
          <div class="exp-grid">
            <div class="exp-box info">
              <div class="exp-head">🔍 Step \${activeStep.order} · \${escapeHtml(activeStep.label)}（L\${activeStep.startLine}–L\${activeStep.endLine}）</div>
              <div class="exp-body">\${formatInline(activeStep.explain)}</div>
            </div>
            <div class="exp-box warn">
              <div class="exp-head">⚠️ 线上避坑与事故边界</div>
              <div class="exp-body">\${formatInline(activeStep.pitfall)}</div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Full Concrete Input / Transform / Output Data Contract -->
        <div class="mini-panel" id="stIoPanel">
          <div class="mp-title">
            <span><span class="step-pill">STEP 3</span>📦 数据流转完整契约（进入数据结构 → 加工变化 → 传出数据结构）</span>
            <div class="io-tabs" id="stIoTabs">
              <button class="io-tab \${ui.ioTab === 'all' ? 'active' : ''}" data-iotab="all">📋 全部展开</button>
              <button class="io-tab \${ui.ioTab === 'in' ? 'active' : ''}" data-iotab="in">📥 进入数据</button>
              <button class="io-tab \${ui.ioTab === 'tr' ? 'active' : ''}" data-iotab="tr">⚙️ 加工变化</button>
              <button class="io-tab \${ui.ioTab === 'out' ? 'active' : ''}" data-iotab="out">📤 传出数据</button>
            </div>
          </div>
          \${ioBodyHtml}
        </div>

        <!-- STEP 4: 1-Question Quiz -->
        <div class="mini-panel">
          <div class="mp-title">
            <span><span class="step-pill">STEP 4</span>🏆 本站 1 题闯关自测（答对自动点亮全链路绿灯 ✓）</span>
            <span style="font-size:11px;color:\${passed ? 'var(--emerald)' : 'var(--text-dim)'}">\${passed ? '✓ 已通过' : '点击选项即时判分'}</span>
          </div>
          <div style="font-size:12.5px;font-weight:700;margin-bottom:8px">\${formatInline(st.quiz.question)}</div>
          <div class="quiz-opts" id="stQuizOpts">
            \${st.quiz.options.map((opt, i) => {
              let cls = '';
              if (hasAnswered) { if (i === st.quiz.correctIndex) cls = 'correct'; else if (i === chosen) cls = 'wrong'; }
              return \`<button class="quiz-opt \${cls}" data-opt="\${i}"><span class="opt-letter">\${letters[i]}</span><span>\${formatInline(opt)}</span></button>\`;
            }).join('')}
          </div>
          <div class="quiz-exp \${hasAnswered ? 'show' : ''} \${hasAnswered && !passed ? 'fail' : ''}">
            <strong>\${passed ? '🎉 回答正确，已点亮本站进度：' : '💡 看解析再试一次：'}</strong>\${formatInline(st.quiz.explanation)}
          </div>
        </div>

        <!-- STEP 5: Interview Q&A -->
        <div class="mini-panel" style="border-left:3px solid var(--accent-2)">
          <div class="mp-title"><span style="color:var(--accent-2)"><span class="step-pill">STEP 5</span>🎤 本站面试官高频追问 & 30 秒口述模板</span></div>
          <div style="font-size:12px;margin-bottom:5px"><strong>问：</strong>\${formatInline(st.interviewQ)}</div>
          <div style="font-size:12px;color:var(--text-muted);line-height:1.58"><strong>答：</strong>\${formatInline(st.interviewA)}</div>
        </div>
      </section>
    </div>

    <div class="station-foot">
      <div>\${prevSt ? \`<button class="btn" id="btnPrevSt">← 上一站：\${prevSt.codeLabel} \${escapeHtml(prevSt.dfLabel)}</button>\` : '<button class="btn" id="btnBackOv">← 返回架构与全链路总览</button>'}</div>
      <div style="font-size:12px;color:var(--text-muted)">当前：\${escapeHtml(flow.name)} · 第 \${(flow.stationIds.indexOf(st.id) + 1) || (st.stage + 1)}/\${flow.stationIds.length} 站</div>
      <div>
        \${nextSt
          ? \`<button class="btn cta" id="btnNextSt">✅ 掌握并沿链路进入下一站：\${nextSt.codeLabel} \${escapeHtml(nextSt.dfLabel)} →</button>\`
          : \`<button class="btn cta" id="btnAllDoneExam">🏆 全部 \${DATA.stations.length} 站通关！去「面试总考」演练 →</button>\`}
      </div>
    </div>
  \`;

  // Bind Station Studio interactions
  $('viewStation').querySelectorAll('.metro-flow-btn').forEach(b => {
    b.addEventListener('click', () => { const f = getFlow(b.dataset.mflow); openStation(f.stationIds[0]); });
  });
  $('viewStation').querySelectorAll('.metro-stop').forEach(b => {
    b.addEventListener('click', () => openStation(b.dataset.metroSt));
  });
  $('viewStation').querySelectorAll('[data-jump-comp]').forEach(b => {
    b.addEventListener('click', () => {
      ui.blueprintMode = 'techarch';
      ui.selectedTechCompId = b.dataset.jumpComp;
      setView('overview');
    });
  });
  $('viewStation').querySelectorAll('[data-jump-biz]').forEach(b => {
    b.addEventListener('click', () => {
      ui.blueprintMode = 'businessflow';
      ui.bizFilter = 'all';
      ui.selectedBizNodeId = b.dataset.jumpBiz;
      setView('overview');
    });
  });
  $('viewStation').querySelectorAll('[data-jump-io]').forEach(b => {
    b.addEventListener('click', () => {
      ui.ioTab = b.dataset.jumpIo;
      renderStation(false);
      setTimeout(() => { $('stIoPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 20);
    });
  });
  $('btnStToWb')?.addEventListener('click', () => {
    if (st.wbTarget) openWorkbenchAt(st.wbTarget.moduleId, st.wbTarget.nodeId);
  });
  $('btnStDoneTop').addEventListener('click', () => toggleStationDone(st.id));
  $('btnToggleWhy').addEventListener('click', () => { ui.whyCollapsed = !ui.whyCollapsed; renderStation(false); });
  $('stNoteModeGroup').querySelectorAll('.note-mode-btn').forEach(b => {
    b.addEventListener('click', () => {
      ui.noteMode = b.dataset.nmode;
      const prevTop = $('stCodeScroll').scrollTop;
      renderStation(false);
      $('stCodeScroll').scrollTop = prevTop;
    });
  });
  $('stIoTabs').querySelectorAll('.io-tab').forEach(b => {
    b.addEventListener('click', () => {
      ui.ioTab = b.dataset.iotab;
      const rightTop = $('stRightPane').scrollTop;
      renderStation(false);
      $('stRightPane').scrollTop = rightTop;
    });
  });

  $('stationMicroSvg').querySelectorAll('.arch-node').forEach(g => {
    g.addEventListener('click', () => {
      const step = st.steps.find(s => s.id === g.dataset.stepId);
      if (!step) return;
      ui.activeStepId = step.id; ui.activeFileId = step.fileId;
      renderStation(true);
    });
  });
  $('stFileTabs').querySelectorAll('.st-file-tab').forEach(b => {
    b.addEventListener('click', () => {
      ui.activeFileId = b.dataset.fid;
      const s = st.steps.find(x => x.fileId === ui.activeFileId);
      if (s) ui.activeStepId = s.id;
      renderStation(false);
    });
  });
  $('stCodeScroll').querySelectorAll('.code-row.mapped, .code-note-row.mapped').forEach(row => {
    row.addEventListener('click', () => {
      if (row.dataset.stepId && row.dataset.stepId !== ui.activeStepId) {
        ui.activeStepId = row.dataset.stepId; renderStation(false);
      }
    });
  });
  $('stQuizOpts').querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const optIdx = Number(btn.dataset.opt);
      progress.quizChoice[st.id] = optIdx;
      if (optIdx === st.quiz.correctIndex) {
        progress.quizPassed[st.id] = true;
        if (!progress.completed.includes(st.id)) progress.completed.push(st.id);
      }
      saveProgress(); updateRankPill(); renderStation(false);
    });
  });

  if (prevSt) $('btnPrevSt').addEventListener('click', () => openStation(prevSt.id));
  else $('btnBackOv').addEventListener('click', () => setView('overview'));
  if (nextSt) $('btnNextSt').addEventListener('click', () => { toggleStationDone(st.id, true); openStation(nextSt.id); });
  else $('btnAllDoneExam').addEventListener('click', () => { toggleStationDone(st.id, true); setView('interview'); });

  // Station Splitter drag
  const stSpl = $('stSplitter');
  stSpl.addEventListener('mousedown', () => { stDraggingSplit = true; stSpl.classList.add('dragging'); });

  if (scrollCode) {
    const row = $('stCodeScroll').querySelector(\`tr[data-ln="\${activeStep.startLine}"]\`);
    if (row) $('stCodeScroll').scrollTop = Math.max(0, row.offsetTop - 48);
  }
}

// =========================================================================
// VIEW 3: INTEGRATED FULL-SCREEN DIRECTORY + 9-MODULE WORKBENCH
// =========================================================================
function wbCurMod() { return WB_MODULES[wb.moduleIdx]; }
function wbGetNode(id) { return wbCurMod().nodes.find(n => n.id === id); }
function wbGetFile(id) { return wbCurMod().files.find(f => f.id === id); }
function wbGetAnchor(node, side) {
  if (side === 'left') return [node.x, node.y + node.h / 2];
  if (side === 'right') return [node.x + node.w, node.y + node.h / 2];
  if (side === 'top') return [node.x + node.w / 2, node.y];
  return [node.x + node.w / 2, node.y + node.h];
}
function wbBuildEdgeGeometry(edge) {
  const src = wbGetNode(edge.from), dst = wbGetNode(edge.to);
  const s = wbGetAnchor(src, edge.fromSide || 'right'), t = wbGetAnchor(dst, edge.toSide || 'left');
  let pts = [s];
  if (edge.via && edge.via.length) pts = [s, ...edge.via, t];
  else if (s[0] === t[0] || s[1] === t[1]) pts = [s, t];
  else { const midX = (s[0] + t[0]) / 2; pts = [s, [midX, s[1]], [midX, t[1]], t]; }
  const d = pts.map((p, idx) => (idx === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ');
  let bestLen = -1, labelPos = [(s[0] + t[0]) / 2, (s[1] + t[1]) / 2];
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (len > bestLen) { bestLen = len; labelPos = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; }
  }
  return { d, labelPos };
}
function wbRenderModuleTabs() {
  const cur = wbCurMod();
  const pinned = WB_MODULES.map((m, idx) => ({ m, idx })).filter(x => x.m.pinnedTab);
  $('wbModuleTabs').innerHTML = pinned.map(({ m, idx }) =>
    \`<button class="wb-module-tab \${idx === wb.moduleIdx ? 'active' : ''}" data-idx="\${idx}">\${escapeHtml(m.shortTitle)}</button>\`
  ).join('');
  $('wbModuleTabs').querySelectorAll('.wb-module-tab').forEach(btn => btn.addEventListener('click', () => { $('wbMenu').classList.remove('open'); wbLoadModule(Number(btn.dataset.idx)); }));

  const isUnpinned = !cur.pinnedTab;
  const nonOverviewCount = Math.max(1, WB_MODULES.length - 1);
  $('wbBtnPicker').classList.toggle('active', isUnpinned);
  $('wbBtnPicker').textContent = isUnpinned ? \`\${cur.shortTitle} ▾\` : \`📂 \${nonOverviewCount}大模块 ▾\`;

  const menuMods = WB_MODULES.map((m, idx) => ({ m, idx })).filter(x => x.m.id !== (WB_MODULES[0]?.id || 'dir_tree')).sort((a, b) => (a.m.overviewOrder || 99) - (b.m.overviewOrder || 99));
  $('wbMenu').innerHTML = menuMods.map(({ m, idx }) => \`
    <button class="wb-menu-item \${idx === wb.moduleIdx ? 'active' : ''}" data-idx="\${idx}">
      <span>\${escapeHtml(m.overviewBadge || m.shortTitle)}</span>
      <span style="font-size:10.5px;color:var(--text-dim)">\${m.nodes.length}节点</span>
    </button>\`).join('');
  $('wbMenu').querySelectorAll('.wb-menu-item').forEach(btn => btn.addEventListener('click', () => { $('wbMenu').classList.remove('open'); wbLoadModule(Number(btn.dataset.idx)); }));

  const targetSt = getStation(cur.stationId || FIRST_STATION_ID);
  $('wbBtnGoStation').textContent = \`🚆 配套全链路第 \${targetSt.codeLabel} 站\`;
  $('wbBtnGoStation').onclick = () => openStation(targetSt.id);
}
function wbRenderFileTabs() {
  const mod = wbCurMod(), isTree = mod.kind === 'tree';
  $('wbTreeToolbar').classList.toggle('visible', isTree);
  if (isTree) {
    const ordered = [...mod.nodes].sort((a, b) => a.stepOrder - b.stepOrder);
    $('wbFileTabs').innerHTML = ordered.map(n => \`<button class="wb-file-tab \${n.id === wb.activeNodeId ? 'active' : ''}" data-sec-node-id="\${n.id}">\${escapeHtml(n.tabLabel || n.label)}</button>\`).join('');
    $('wbFileTabs').querySelectorAll('.wb-file-tab').forEach(b => b.addEventListener('click', () => wbSelectNode(b.dataset.secNodeId, { from: 'diagram' })));
    return;
  }
  $('wbFileTabs').innerHTML = mod.files.map(f => \`<button class="wb-file-tab \${f.id === wb.activeFileId ? 'active' : ''}" data-file-id="\${f.id}">\${escapeHtml(f.label)}</button>\`).join('');
  $('wbFileTabs').querySelectorAll('.wb-file-tab').forEach(b => b.addEventListener('click', () => { wb.activeFileId = b.dataset.fileId; wbRenderFileTabs(); wbRenderCodePane(false); }));
}
function wbFindNodeForLine(fileId, lineNum) {
  const matches = wbCurMod().nodes.filter(n => n.fileId === fileId && lineNum >= n.startLine && lineNum <= n.endLine);
  if (!matches.length) return null;
  matches.sort((a, b) => (a.endLine - a.startLine) - (b.endLine - b.startLine));
  return matches[0];
}
function wbRenderCodePane(shouldScroll = false) {
  const mod = wbCurMod(), file = wbGetFile(wb.activeFileId) || mod.files[0];
  if (!file) return;
  wb.activeFileId = file.id;
  const isTreeFile = file.syntax === 'tree';
  const noteGrp = $('wbNoteModeGroup');
  if (noteGrp) {
    noteGrp.style.display = isTreeFile ? 'none' : 'inline-flex';
    noteGrp.querySelectorAll('.note-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.nmode === ui.noteMode));
  }
  $('wbActiveFilePath').textContent = \`\${file.path} (L\${file.startLine}–L\${file.endLine})\`;
  const startBannerByLine = new Map();
  mod.nodes.filter(n => n.fileId === file.id).sort((a, b) => a.startLine - b.startLine).forEach(n => {
    if (!startBannerByLine.has(n.startLine)) startBannerByLine.set(n.startLine, []);
    startBannerByLine.get(n.startLine).push(n);
  });
  const filterKw = isTreeFile ? wb.treeFilter.trim().toLowerCase() : '';
  const fileNotes = (!isTreeFile && DATA.lineNotes && DATA.lineNotes[file.path]) ? DATA.lineNotes[file.path] : null;
  let html = '';
  for (let i = 0; i < file.lines.length; i++) {
    const ln = file.startLine + i;
    const rawLine = file.lines[i];
    const banners = startBannerByLine.get(ln);
    if (banners) {
      const pills = banners.map(n => \`<span class="region-pill \${n.id === wb.activeNodeId ? 'active' : ''}" data-node-id="\${n.id}">↔ Step \${n.stepOrder} · \${escapeHtml(n.label)}</span>\${n.jumpTo ? \`<span class="jump-chip" data-jump-mod="\${n.jumpTo.moduleId}" data-jump-node="\${n.jumpTo.nodeId}" data-from-node="\${n.id}">↗ \${escapeHtml(n.jumpTo.label)}</span>\` : ''}\`).join(' ');
      const hidden = filterKw && !banners.some(n => { for (let k = n.startLine - file.startLine; k <= n.endLine - file.startLine; k++) if (file.lines[k]?.toLowerCase().includes(filterKw)) return true; return false; });
      html += \`<tr class="region-banner-row \${hidden ? 'filter-hidden' : ''}"><td colspan="2">\${pills}</td></tr>\`;
    }
    const mapped = wbFindNodeForLine(file.id, ln);
    const activeNode = wb.activeNodeId ? wbGetNode(wb.activeNodeId) : null;
    const isAct = activeNode && activeNode.fileId === file.id && ln >= activeNode.startLine && ln <= activeNode.endLine;
    const rowHidden = filterKw && !rawLine.toLowerCase().includes(filterKw);
    const note = fileNotes ? (fileNotes[String(ln)] || '') : '';
    const cls = ['code-row'];
    if (mapped) cls.push('mapped'); if (isAct) cls.push('active-line'); if (rowHidden) cls.push('filter-hidden');
    const inlineNoteHtml = (!isTreeFile && ui.noteMode === 'inline' && note)
      ? \`<span class="code-note-inline">// 💬 \${escapeHtml(note)}</span>\`
      : '';
    html += \`<tr class="\${cls.join(' ')}" data-ln="\${ln}" \${mapped ? \`data-node-id="\${mapped.id}"\` : ''}><td class="ln-cell">\${ln}</td><td class="code-cell">\${highlightLine(rawLine, file.syntax)}\${inlineNoteHtml}</td></tr>\`;
    if (!isTreeFile && ui.noteMode === 'below' && note) {
      const leadIndent = (rawLine.match(/^(\\s*)/) || ['', ''])[1].replace(/\\t/g, '    ');
      const ncls = ['code-note-row'];
      if (mapped) ncls.push('mapped'); if (isAct) ncls.push('active-line');
      html += \`<tr class="\${ncls.join(' ')}" \${mapped ? \`data-node-id="\${mapped.id}"\` : ''}><td class="code-note-ln"></td><td class="code-note-cell"><span class="code-note-indent">\${escapeHtml(leadIndent)}↳ </span>\${escapeHtml(note)}</td></tr>\`;
    }
  }
  $('wbCodeTable').innerHTML = html;
  $('wbCodeTable').querySelectorAll('.jump-chip').forEach(c => c.addEventListener('click', (e) => { e.stopPropagation(); wbJumpToModuleNode(c.dataset.jumpMod, c.dataset.jumpNode, c.dataset.fromNode); }));
  $('wbCodeTable').querySelectorAll('.region-pill').forEach(p => p.addEventListener('click', (e) => { e.stopPropagation(); wbSelectNode(p.dataset.nodeId, { from: 'code' }); }));
  $('wbCodeTable').querySelectorAll('.code-row.mapped, .code-note-row.mapped').forEach(r => r.addEventListener('click', () => wbSelectNode(r.dataset.nodeId, { from: 'code' })));
  if (shouldScroll && wb.activeNodeId) wbScrollToActiveCode();
}
function wbScrollToActiveCode() {
  const activeNode = wbGetNode(wb.activeNodeId); if (!activeNode) return;
  const row = $('wbCodeTable').querySelector(\`tr[data-ln="\${activeNode.startLine}"]\`);
  if (row) {
    const banner = row.previousElementSibling;
    const target = (banner && banner.classList.contains('region-banner-row')) ? banner : row;
    $('wbCodeScroll').scrollTop = Math.max(0, target.offsetTop - 44);
  }
}
function wbRenderDiagram() {
  const mod = wbCurMod(), isOverview = mod.kind === 'tree' || wb.moduleIdx === 0;
  $('wbDiagramTitle').textContent = mod.title;
  $('wbDiagramSub').textContent = isOverview
    ? (wb.overviewClickMode === 'drill' ? \`左侧为完整中文目录树；点击右侧任意 \${Math.max(1, WB_MODULES.length - 1)} 大模块卡片直接下钻进入流程架构图\` : '定位模式：单击卡片定位左侧目录，双击卡片进入流程架构图')
    : mod.subtitle;
  $('wbBtnBackOverview').classList.toggle('visible', !isOverview);
  $('wbBtnOverviewMode').style.display = isOverview ? 'inline-flex' : 'none';
  $('wbBtnOverviewMode').classList.toggle('on', wb.overviewClickMode === 'drill');
  $('wbBtnOverviewMode').textContent = wb.overviewClickMode === 'drill' ? '🚀 点击进图' : '📍 点击定位';

  const [vbW, vbH] = mod.viewBox;
  $('wbSvg').setAttribute('viewBox', \`0 0 \${vbW} \${vbH}\`);
  const activeNodeId = wb.activeNodeId, activeEdgeId = wb.activeEdgeId;
  const relN = new Set(), relE = new Set();
  if (activeEdgeId) {
    const ae = mod.edges.find(e => e.id === activeEdgeId);
    if (ae) { relE.add(ae.id); relN.add(ae.from); relN.add(ae.to); }
  } else if (activeNodeId) {
    relN.add(activeNodeId);
    mod.edges.forEach(e => { if (e.from === activeNodeId || e.to === activeNodeId) { relE.add(e.id); relN.add(e.from); relN.add(e.to); } });
  }
  const hasFocus = Boolean(activeNodeId || activeEdgeId);
  const defs = \`<defs>
    <marker id="warr-emphasis" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/></marker>
    <marker id="warr-security" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fb7185"/></marker>
    <marker id="warr-dashed" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8"/></marker>
    <marker id="warr-default" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b"/></marker>
  </defs>\`;
  let edgesMarkup = '';
  mod.edges.forEach((e, idx) => {
    const { d, labelPos } = wbBuildEdgeGeometry(e), v = e.variant || 'default';
    const isAct = e.id === activeEdgeId || (activeNodeId && relE.has(e.id)), isDim = hasFocus && !relE.has(e.id);
    const lw = Math.max(48, Math.round(textUnits(e.label) * 6.4 + 14)), pid = \`wbp-\${mod.id}-\${e.id}\`;
    const dotCls = v === 'security' ? 'flow-dot security' : (v === 'dashed' ? 'flow-dot dashed' : 'flow-dot');
    edgesMarkup += \`<g class="arch-edge variant-\${v} \${isAct ? 'active' : ''} \${isDim ? 'dimmed' : ''}" data-edge-id="\${e.id}">
      <path class="edge-hit" d="\${d}" />
      <path id="\${pid}" class="edge-path" d="\${d}" marker-end="url(#warr-\${v})" />
      <circle class="\${dotCls}" r="3"><animateMotion dur="\${(2.4 + (idx % 3) * 0.5).toFixed(1)}s" repeatCount="indefinite" rotate="auto"><mpath href="#\${pid}" /></animateMotion></circle>
      <rect class="edge-label-bg" x="\${labelPos[0] - lw / 2}" y="\${labelPos[1] - 10}" width="\${lw}" height="20" />
      <text class="edge-label-tx" x="\${labelPos[0]}" y="\${labelPos[1]}">\${escapeHtml(e.label)}</text>
    </g>\`;
  });
  let nodesMarkup = '';
  mod.nodes.forEach((n) => {
    const v = TYPE_VAR[n.type] || 'backend', isAct = n.id === activeNodeId, isDim = hasFocus && !relN.has(n.id);
    const file = wbGetFile(n.fileId), rawF = file ? file.label.split('/').pop().replace(/ \\(.*\\)$/, '') : '';
    const shortF = rawF.length > 16 ? rawF.slice(0, 14) + '…' : rawF;
    const chip = mod.kind === 'tree' ? \`↔ 目录 L\${n.startLine}–L\${n.endLine}\` : \`↔ \${shortF}:L\${n.startLine}\`;
    const dTag = (mod.kind === 'tree' && n.jumpTo) ? \`\${n.tag} ↗\` : n.tag;
    const tagW = Math.max(42, Math.round(textUnits(dTag) * 5.8 + 12)), tagX = n.w - tagW - 10;
    nodesMarkup += \`<g class="arch-node \${isAct ? 'active' : ''} \${isDim ? 'dimmed' : ''}" data-node-id="\${n.id}" transform="translate(\${n.x}, \${n.y})">
      <rect class="node-pulse" x="-3" y="-3" width="\${n.w + 6}" height="\${n.h + 6}" rx="12" />
      <rect class="node-box" x="0" y="0" width="\${n.w}" height="\${n.h}" rx="10" fill="var(--c-\${v}-bg)" stroke="var(--c-\${v}-bd)" />
      <circle cx="18" cy="21" r="9.5" fill="var(--c-\${v}-bd)" />
      <text class="node-step-badge" x="18" y="24.5" text-anchor="middle" fill="#080d16">\${n.stepOrder}</text>
      <text class="node-title" x="34" y="25" fill="var(--c-\${v}-tx)">\${escapeHtml(n.label)}</text>
      <text class="node-sub" x="12" y="47" fill="var(--c-\${v}-tx)">\${escapeHtml(n.sublabel)}</text>
      <text class="node-src-chip" x="12" y="71" fill="var(--c-\${v}-bd)">\${escapeHtml(chip)}</text>
      <rect class="node-tag-bg" x="\${tagX}" y="59" width="\${tagW}" height="17" rx="8.5" fill="var(--c-\${v}-bd)" />
      <text class="node-tag-tx" x="\${tagX + tagW / 2}" y="71" text-anchor="middle" fill="var(--c-\${v}-tx)">\${escapeHtml(dTag)}</text>
    </g>\`;
  });
  $('wbSvg').innerHTML = \`\${defs}<g id="wbViewportGroup" transform="translate(\${wb.panX}, \${wb.panY}) scale(\${wb.zoom})">\${edgesMarkup}\${nodesMarkup}</g>\`;
  $('wbSvg').querySelectorAll('.arch-node').forEach(g => {
    const nid = g.dataset.nodeId;
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      const n = wbGetNode(nid);
      if (isOverview && wb.overviewClickMode === 'drill' && n?.jumpTo) { wbJumpToModuleNode(n.jumpTo.moduleId, n.jumpTo.nodeId, n.id); return; }
      wbSelectNode(nid, { from: 'diagram' });
    });
    if (isOverview) g.addEventListener('dblclick', (e) => { e.stopPropagation(); const n = wbGetNode(nid); if (n?.jumpTo) wbJumpToModuleNode(n.jumpTo.moduleId, n.jumpTo.nodeId, n.id); });
  });
  $('wbSvg').querySelectorAll('.arch-edge').forEach(g => g.addEventListener('click', (e) => {
    e.stopPropagation();
    const edge = mod.edges.find(x => x.id === g.dataset.edgeId); if (!edge) return;
    wb.activeEdgeId = edge.id; wbSelectNode(edge.targetNodeId || edge.to, { from: 'diagram', keepEdge: true });
  }));
}
function wbRenderInspector() {
  const node = wb.activeNodeId ? wbGetNode(wb.activeNodeId) : null, jumpBtn = $('wbInsJumpBtn');
  if (!node) { $('wbInsNodeName').textContent = '点击左侧代码或右侧节点开始联动'; $('wbInsLoc').textContent = '—'; jumpBtn.style.display = 'none'; return; }
  const file = wbGetFile(node.fileId);
  $('wbInsNodeName').textContent = \`Step \${node.stepOrder} · \${node.label}\`;
  $('wbInsLoc').textContent = \`\${file ? file.path : ''} : L\${node.startLine}–L\${node.endLine}\`;
  if (node.jumpTo) {
    jumpBtn.style.display = 'inline-flex'; jumpBtn.textContent = \`↗ \${node.jumpTo.label}\`;
    jumpBtn.onclick = () => wbJumpToModuleNode(node.jumpTo.moduleId, node.jumpTo.nodeId, node.id);
  } else { jumpBtn.style.display = 'none'; jumpBtn.onclick = null; }
  $('wbInsDeepDive').innerHTML = formatInline(node.deepDive);
  $('wbInsPitfall').innerHTML = formatInline(node.pitfall);
  $('wbInsInterview').innerHTML = \`<strong>问：</strong>\${formatInline(node.interviewQ)}<br/><strong>答：</strong>\${formatInline(node.interviewA)}\`;
}
function wbUpdateStepCounter() {
  const ordered = [...wbCurMod().nodes].sort((a, b) => a.stepOrder - b.stepOrder);
  const idx = ordered.findIndex(n => n.id === wb.activeNodeId);
  $('wbStepCounter').textContent = idx >= 0 ? \`\${idx + 1}/\${ordered.length}\` : \`0/\${ordered.length}\`;
}
function wbSelectNode(nodeId, opts = {}) {
  const node = wbGetNode(nodeId); if (!node) return;
  wb.activeNodeId = node.id; if (!opts.keepEdge) wb.activeEdgeId = null;
  const fileChanged = wb.activeFileId !== node.fileId; wb.activeFileId = node.fileId;
  wbRenderFileTabs(); wbRenderCodePane(opts.from !== 'code' || fileChanged); wbRenderDiagram(); wbRenderInspector(); wbUpdateStepCounter();
  $('wbCodeLinkStatus').textContent = opts.from === 'diagram' ? \`已定位 L\${node.startLine}–L\${node.endLine}\` : \`已高亮「\${node.label}」\`;
}
function wbStepBy(delta) {
  const ordered = [...wbCurMod().nodes].sort((a, b) => a.stepOrder - b.stepOrder);
  const idx = ordered.findIndex(n => n.id === wb.activeNodeId);
  wbSelectNode(ordered[(idx < 0 ? 0 : idx + delta + ordered.length) % ordered.length].id, { from: 'stepper' });
}
function wbTogglePlay() {
  if (wb.playing) { clearInterval(wb.playTimer); wb.playing = false; $('wbBtnPlay').classList.remove('active-toggle'); $('wbBtnPlay').textContent = '▶ 自动演练'; return; }
  wb.playing = true; $('wbBtnPlay').classList.add('active-toggle'); $('wbBtnPlay').textContent = '⏸ 暂停演练';
  wbStepBy(1); wb.playTimer = setInterval(() => wbStepBy(1), 3500);
}
function wbStopPlay() { if (wb.playing) wbTogglePlay(); }
function wbLoadModule(idx) {
  wbStopPlay(); wb.moduleIdx = idx; wb.zoom = 1; wb.panX = 0; wb.panY = 0; wb.activeEdgeId = null; wb.treeFilter = '';
  if ($('wbTreeFilter')) $('wbTreeFilter').value = '';
  const first = [...wbCurMod().nodes].sort((a, b) => a.stepOrder - b.stepOrder)[0];
  wb.activeNodeId = first ? first.id : null; wb.activeFileId = first ? first.fileId : wbCurMod().files[0].id;
  wbRenderModuleTabs(); wbRenderFileTabs(); wbRenderCodePane(true); wbRenderDiagram(); wbRenderInspector(); wbUpdateStepCounter();
}
function wbJumpToModuleNode(moduleId, nodeId, fromOverviewNodeId) {
  const idx = WB_MODULES.findIndex(m => m.id === moduleId); if (idx < 0) return;
  if (fromOverviewNodeId) wb.lastOverviewNodeId = fromOverviewNodeId;
  wbLoadModule(idx);
  if (nodeId) wbSelectNode(nodeId, { from: 'diagram' });
}
function wbReturnToOverview() {
  const focus = wbCurMod().parentOverviewNodeId || wb.lastOverviewNodeId || (WB_MODULES[0]?.nodes?.[0]?.id) || null;
  wbLoadModule(0); if (focus) wbSelectNode(focus, { from: 'diagram' });
}
function wbApplyTransform() {
  const g = $('wbSvg').querySelector('#wbViewportGroup');
  if (g) g.setAttribute('transform', \`translate(\${wb.panX}, \${wb.panY}) scale(\${wb.zoom})\`);
}

let wbPanning = false, wbPanStart = { x: 0, y: 0, px: 0, py: 0 }, wbDraggingSplit = false, stDraggingSplit = false;
$('wbCanvasWrap').addEventListener('mousedown', (e) => { if (e.target.closest('.arch-node') || e.target.closest('.arch-edge')) return; wbPanning = true; wbPanStart = { x: e.clientX, y: e.clientY, px: wb.panX, py: wb.panY }; });
$('wbCanvasWrap').addEventListener('wheel', (e) => { e.preventDefault(); wb.zoom = Math.max(0.55, Math.min(2.4, wb.zoom * (e.deltaY < 0 ? 1.1 : 0.91))); wbApplyTransform(); }, { passive: false });
$('wbSplitter').addEventListener('mousedown', () => { wbDraggingSplit = true; $('wbSplitter').classList.add('dragging'); });
window.addEventListener('mousemove', (e) => {
  if (wbPanning) {
    const r = $('wbSvg').getBoundingClientRect(), [vbW, vbH] = wbCurMod().viewBox;
    wb.panX = wbPanStart.px + (e.clientX - wbPanStart.x) * (vbW / r.width);
    wb.panY = wbPanStart.py + (e.clientY - wbPanStart.y) * (vbH / r.height);
    wbApplyTransform();
  }
  if (wbDraggingSplit) $('wbPaneCode').style.width = Math.max(26, Math.min(72, (e.clientX / window.innerWidth) * 100)) + '%';
  if (stDraggingSplit && $('stLeftPane')) $('stLeftPane').style.width = Math.max(28, Math.min(70, (e.clientX / window.innerWidth) * 100)) + '%';
});
window.addEventListener('mouseup', () => {
  wbPanning = false; wbDraggingSplit = false; stDraggingSplit = false;
  $('wbSplitter')?.classList.remove('dragging');
  $('stSplitter')?.classList.remove('dragging');
});

$('wbBtnBackOverview').addEventListener('click', () => wbReturnToOverview());
$('wbBtnOverviewMode').addEventListener('click', () => { wb.overviewClickMode = wb.overviewClickMode === 'drill' ? 'locate' : 'drill'; wbRenderDiagram(); });
$('wbBtnPicker').addEventListener('click', (e) => { e.stopPropagation(); $('wbMenu').classList.toggle('open'); });
document.addEventListener('click', (e) => { if (!e.target.closest('#wbPicker')) $('wbMenu').classList.remove('open'); });
$('wbBtnPrev').addEventListener('click', () => { wbStopPlay(); wbStepBy(-1); });
$('wbBtnNext').addEventListener('click', () => { wbStopPlay(); wbStepBy(1); });
$('wbBtnPlay').addEventListener('click', wbTogglePlay);
$('wbBtnZoomIn').addEventListener('click', () => { wb.zoom = Math.min(2.4, wb.zoom * 1.15); wbApplyTransform(); });
$('wbBtnZoomOut').addEventListener('click', () => { wb.zoom = Math.max(0.55, wb.zoom * 0.87); wbApplyTransform(); });
$('wbBtnZoomReset').addEventListener('click', () => { wb.zoom = 1; wb.panX = 0; wb.panY = 0; wbApplyTransform(); });
$('wbBtnMotion').addEventListener('click', (e) => { wb.motionOn = !wb.motionOn; document.body.classList.toggle('still-motion', !wb.motionOn); e.currentTarget.classList.toggle('on', wb.motionOn); e.currentTarget.textContent = wb.motionOn ? '⚡ 动效' : '⏸ 静止'; });
$('wbBtnClearFocus').addEventListener('click', () => { wbStopPlay(); wb.activeNodeId = null; wb.activeEdgeId = null; wbRenderCodePane(false); wbRenderDiagram(); wbRenderInspector(); wbUpdateStepCounter(); });
$('wbInsLoc').addEventListener('click', () => wbScrollToActiveCode());
$('wbBtnToggleIns').addEventListener('click', (e) => { const c = $('wbInspector').classList.toggle('collapsed'); e.currentTarget.textContent = c ? '展开精讲 ▴' : '收起精讲 ▾'; });
$('wbTreeFilter').addEventListener('input', (e) => { wb.treeFilter = e.target.value; wbRenderCodePane(false); });
$('wbNoteModeGroup').querySelectorAll('.note-mode-btn').forEach(b => b.addEventListener('click', () => {
  ui.noteMode = b.dataset.nmode;
  const prevTop = $('wbCodeScroll').scrollTop;
  wbRenderCodePane(false);
  $('wbCodeScroll').scrollTop = prevTop;
}));
$('wbBtnCopyTree').addEventListener('click', async (e) => {
  const f = wbCurMod().files[0]; if (!f) return;
  try { await navigator.clipboard.writeText(f.lines.join('\\n')); } catch {}
  e.currentTarget.textContent = '✓ 已复制'; setTimeout(() => { e.currentTarget.textContent = '📋 复制目录树'; }, 1500);
});

// =========================================================================
// VIEW 4: INTERVIEW SPRINT & 10-QUESTION EXAM
// =========================================================================
function renderInterview() {
  const checkedCount = Object.values(progress.examChecked).filter(Boolean).length;
  const projName = DATA.meta?.projectName || '本项目';
  const examTotal = (DATA.exam || []).length;
  $('viewInterview').innerHTML = \`
    <div class="card">
      <div class="card-head"><strong>🎤 3 分钟项目总述满分提词器（按架构主线展开，面试开场直接拿捏主导权）</strong></div>
      <div class="pitch-grid">
        \${(DATA.pitch || []).map(p => \`<div class="pitch-card">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong>\${escapeHtml(p.step)} · \${escapeHtml(p.title)}</strong><span style="color:var(--accent);font-size:11px;font-family:ui-monospace,Consolas,monospace">\${escapeHtml(p.time)}</span></div>
          <div style="font-size:11.5px;color:var(--text-muted)">🎯 \${escapeHtml(p.goal)}</div>
          <div class="pitch-script">\${formatInline(p.script)}</div>
        </div>\`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><strong>🚦 精力分配红黑榜：哪些外围胶水代码不用死磕，省下 70% 时间？</strong></div>
      <table class="skip-table">
        <thead><tr><th style="width:22%">外围模块</th><th style="width:39%">❌ 大胆跳过</th><th style="width:39%">✅ 只需抓牢的抽象与链路站点</th></tr></thead>
        <tbody>\${(DATA.skipGuide || []).map(g => \`<tr><td><strong>\${escapeHtml(g.module)}</strong></td><td style="color:var(--text-muted)">\${formatInline(g.skip)}</td><td>\${formatInline(g.keep)}</td></tr>\`).join('')}</tbody>
      </table>
    </div>
    <div class="card">
      <div class="card-head"><strong>📝 结业 \${examTotal} 题通关总考（不看代码能口述完这 \${examTotal} 题 = 真正精通 \${escapeHtml(projName)}！）</strong><span class="rank-pill">自评掌握：\${checkedCount} / \${examTotal}</span></div>
      <div class="exam-list">
        \${(DATA.exam || []).map((ex, i) => {
          const chk = Boolean(progress.examChecked[ex.id]), st = getStation(ex.stationId);
          return \`<div class="exam-item \${chk ? 'checked' : ''}">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
              <label style="display:flex;gap:9px;cursor:pointer;font-weight:600;flex:1"><input type="checkbox" data-exid="\${ex.id}" \${chk ? 'checked' : ''} style="margin-top:3px;accent-color:var(--emerald)" /><span>\${i + 1}. \${formatInline(ex.q)}</span></label>
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button class="btn" data-toggle-ans="\${ex.id}">看参考答法</button>
                <button class="btn primary" data-go-st="\${st.id}">复习第 \${st.codeLabel} 站</button>
              </div>
            </div>
            <div class="exam-ans" id="ans-\${ex.id}">\${formatInline(ex.a)}</div>
          </div>\`;
        }).join('')}
      </div>
    </div>
  \`;
  $('viewInterview').querySelectorAll('input[data-exid]').forEach(cb => cb.addEventListener('change', () => { progress.examChecked[cb.dataset.exid] = cb.checked; saveProgress(); renderInterview(); }));
  $('viewInterview').querySelectorAll('[data-toggle-ans]').forEach(b => b.addEventListener('click', () => { const open = $('ans-' + b.dataset.toggleAns).classList.toggle('open'); b.textContent = open ? '收起答法' : '看参考答法'; }));
  $('viewInterview').querySelectorAll('[data-go-st]').forEach(b => b.addEventListener('click', () => openStation(b.dataset.goSt)));
}

// ===== Global Controls & Unified Search =====
$('navTabs').querySelectorAll('.nav-tab').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
$('rankPill').addEventListener('click', () => setView('overview'));
$('btnTheme').addEventListener('click', (e) => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  e.currentTarget.textContent = next === 'dark' ? '☀ 浅色' : '🌙 深色';
});

function openSearch() { $('searchModal').classList.add('open'); $('searchInput').value = ''; renderSearch(''); setTimeout(() => $('searchInput').focus(), 20); }
function closeSearch() { $('searchModal').classList.remove('open'); }
function renderSearch(q) {
  const kw = q.trim().toLowerCase(), items = [];
  (DATA.stations || []).forEach(st => {
    const dos = DATA.overviewDossiers?.dataflow?.[st.id];
    const hay = [st.codeLabel, st.dfLabel, st.title, st.inputSpec, st.outputSpec, st.interviewQ, dos ? dos.role : '', ...(dos ? (dos.examPoints || []) : []), ...(st.files || []).map(f => f.path)].join(' ').toLowerCase();
    if (!kw || hay.includes(kw)) items.push({ kind: 'st', id: st.id, title: \`🚆 第 \${st.codeLabel} 站 · \${st.title}\`, sub: st.outputSpec, tag: '全链路站点' });
  });
  (DATA.techArch?.components || []).forEach(c => {
    const info = (DATA.techArch.compToStation || {})[c.id];
    const dos = DATA.overviewDossiers?.techarch?.[c.id];
    const hay = [c.label, c.sublabel || '', c.tag || '', info ? info.role : '', dos ? dos.role : '', ...(dos ? (dos.examPoints || []) : []), ...(c.sources || []).map(s => s.path)].join(' ').toLowerCase();
    if (!kw || hay.includes(kw)) items.push({ kind: 'tech', id: c.id, title: \`🏛️ 技术架构 · \${c.label}（\${c.sublabel || ''}）\`, sub: dos ? dos.role : (info ? info.role : (c.sublabel || '')), tag: '图二技术架构' });
  });
  (DATA.businessFlow?.nodes || []).forEach(n => {
    const info = (DATA.businessFlow.nodeToLearn || {})[n.id];
    const dos = DATA.overviewDossiers?.businessflow?.[n.id];
    const hay = [n.label, n.sublabel || '', n.tag || '', info ? info.role : '', dos ? dos.role : '', ...(dos ? (dos.examPoints || []) : []), ...(n.sources || []).map(s => s.path)].join(' ').toLowerCase();
    if (!kw || hay.includes(kw)) items.push({ kind: 'biz', id: n.id, title: \`🧭 业务流 · \${n.label}（\${n.sublabel || ''}）\`, sub: dos ? dos.role : (info ? info.role : (n.sublabel || '')), tag: '图三业务泳道' });
  });
  WB_MODULES.forEach(mod => (mod.nodes || []).forEach(n => {
    const f = (mod.files || []).find(x => x.id === n.fileId);
    const hay = \`\${mod.shortTitle} \${n.label} \${n.summary || ''} \${f ? f.path : ''}\`.toLowerCase();
    if (!kw || hay.includes(kw)) items.push({ kind: 'wb', modId: mod.id, nodeId: n.id, title: \`🗂️ \${mod.shortTitle} · \${n.label}\`, sub: n.summary || n.sublabel || '', tag: \`\${f ? f.label : ''}:L\${n.startLine}\` });
  }));
  $('searchResults').innerHTML = items.length ? items.slice(0, 40).map(it => \`
    <div class="search-item" data-kind="\${it.kind}" data-id="\${it.id || ''}" data-mod="\${it.modId || ''}" data-node="\${it.nodeId || ''}">
      <div><div style="font-weight:700;font-size:12.5px">\${escapeHtml(it.title)}</div><div style="font-size:11px;color:var(--text-muted)">\${escapeHtml(it.sub)}</div></div>
      <span style="font-size:10.5px;color:var(--accent);background:var(--accent-soft);padding:2px 6px;border-radius:5px;white-space:nowrap">\${escapeHtml(it.tag)}</span>
    </div>\`).join('') : '<div style="padding:18px;text-align:center;color:var(--text-muted)">无匹配结果</div>';
  $('searchResults').querySelectorAll('.search-item').forEach(el => el.addEventListener('click', () => {
    closeSearch();
    if (el.dataset.kind === 'st') openStation(el.dataset.id);
    else if (el.dataset.kind === 'tech') {
      ui.blueprintMode = 'techarch';
      ui.selectedTechCompId = el.dataset.id;
      ui.dossierCollapsed = false;
      setView('overview');
    } else if (el.dataset.kind === 'biz') {
      ui.blueprintMode = 'businessflow';
      ui.bizFilter = 'all';
      ui.selectedBizNodeId = el.dataset.id;
      ui.dossierCollapsed = false;
      setView('overview');
    } else openWorkbenchAt(el.dataset.mod, el.dataset.node);
  }));
}
$('btnSearch').addEventListener('click', openSearch);
$('searchModal').addEventListener('click', (e) => { if (e.target === $('searchModal')) closeSearch(); });
$('dossierModal').addEventListener('click', (e) => { if (e.target === $('dossierModal')) closeDossierModal(); });
$('searchInput').addEventListener('input', (e) => renderSearch(e.target.value));
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('searchModal').classList.contains('open') ? closeSearch() : openSearch(); return; }
  if ($('searchModal').classList.contains('open') && e.key === 'Escape') { closeSearch(); return; }
  if (ui.dossierModalOpen && e.key === 'Escape') { closeDossierModal(); return; }
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  if (ui.view === 'overview' && !$('searchModal').classList.contains('open') && !inInput) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const ctx = getActiveOverviewContext();
      if (ctx && ctx.total > 0) {
        selectOverviewModule(ctx.mode, e.key === 'ArrowLeft' ? ctx.prevId : ctx.nextId, { expand: !ui.dossierCollapsed });
      }
    }
  }
});

// Init
updateRankPill();
setView('overview');
</script>
</body>
</html>
`;
}

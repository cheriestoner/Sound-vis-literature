/* Checks page: edit claim and check statuses, keep drafts in this browser, save into data/*.csv. */
(function () {
  "use strict";
  const { esc } = window.SVR;
  const REFS = window.REFERENCES || [];
  const STUDIES = window.STUDIES || [];
  const BASE = {
    claims: Object.fromEntries((window.CLAIMS || []).map(c => [c.id, c])),
    checks: Object.fromEntries((window.CHECKS || []).map(c => [c.id, c])),
  };
  const FILE = { claims: "claims.csv", checks: "checks.csv" };
  const refById = Object.fromEntries(REFS.map(r => [r.id, r]));
  const studyById = Object.fromEntries(STUDIES.map(s => [s.id, s]));
  const $ = id => document.getElementById(id);

  const CLAIM_STATUS = [["to-check", "to check"], ["checked-online", "checked online"], ["checked-fulltext", "checked in full text"], ["wrong", "not supported"], ["ours", "ours"]];
  const CHECK_STATUS = [["open", "open"], ["done", "done"], ["problem", "problem"]];

  // ---------- drafts: unsaved edits, and saved edits waiting for build.py ----------
  // store = { drafts: {claims:{id:{field:value}}, checks:{}}, saved: {at, claims:{}, checks:{}} }
  const KEY = "svr-verify";
  const empty = () => ({ claims: {}, checks: {} });
  let store = { drafts: empty(), saved: { at: "", ...empty() } };
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && s.drafts && s.saved) store = s;
  } catch (e) { /* storage unavailable: edits live only in this tab */ }
  // A build after the last save means data.js already holds the saved edits.
  if (store.saved.at && window.BUILT_AT && new Date(window.BUILT_AT) > new Date(store.saved.at)) store.saved = { at: "", ...empty() };
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };
  // Drop edits that equal what data.js already says, and edits to rows that no longer exist.
  for (const bucket of [store.drafts, store.saved]) for (const t of ["claims", "checks"]) for (const id of Object.keys(bucket[t])) {
    const b = BASE[t][id];
    if (!b) { delete bucket[t][id]; continue; }
    for (const f of Object.keys(bucket[t][id])) if ((b[f] || "") === bucket[t][id][f] && bucket === store.drafts && !(store.saved[t][id] && f in store.saved[t][id])) delete bucket[t][id][f];
    if (!Object.keys(bucket[t][id]).length) delete bucket[t][id];
  }
  persist();

  function val(t, id, f) {
    const d = store.drafts[t][id], s = store.saved[t][id];
    if (d && f in d) return d[f];
    if (s && f in s) return s[f];
    return BASE[t][id][f] || "";
  }
  function setVal(t, id, f, v) {
    const committed = (store.saved[t][id] && f in store.saved[t][id]) ? store.saved[t][id][f] : (BASE[t][id][f] || "");
    const d = store.drafts[t][id] || (store.drafts[t][id] = {});
    if (v === committed) delete d[f]; else d[f] = v;
    if (!Object.keys(d).length) delete store.drafts[t][id];
    persist(); renderBar();
  }
  const isChanged = (t, id) => !!(store.drafts[t][id] || store.saved[t][id]);
  const count = b => Object.keys(b.claims).length + Object.keys(b.checks).length;

  // ---------- CSV ----------
  function parseCSV(text) {
    text = text.replace(/^﻿/, "");
    const rows = []; let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else if (c !== "\r") f += c;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  const cell = v => /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  const toCSV = rows => rows.map(r => r.map(v => cell(v == null ? "" : String(v))).join(",")).join("\r\n") + "\r\n";

  // Apply edits to rows read from disk (or rebuilt from data.js), keeping every other column and row.
  function applyEdits(t, rows, edits) {
    const head = rows[0], iId = head.indexOf("id"), missing = [];
    const byId = new Map(rows.slice(1).map(r => [r[iId], r]));
    for (const [id, fields] of Object.entries(edits)) {
      const r = byId.get(id);
      if (!r) { missing.push(id); continue; }
      for (const [f, v] of Object.entries(fields)) {
        const j = head.indexOf(f);
        if (j < 0) { missing.push(`${id}.${f}`); continue; }
        while (r.length < head.length) r.push("");
        r[j] = v;
      }
    }
    return missing;
  }
  function merged(t) {
    const out = {};
    for (const b of [store.saved[t], store.drafts[t]]) for (const [id, fs] of Object.entries(b)) out[id] = { ...(out[id] || {}), ...fs };
    return out;
  }
  function rowsFromData(t) {
    const items = Object.values(BASE[t]);
    const head = Object.keys(items[0] || { id: "" });
    return [head, ...items.map(o => head.map(h => o[h] ?? ""))];
  }
  function markSaved() {
    store.saved = { at: new Date().toISOString(), claims: merged("claims"), checks: merged("checks") };
    store.drafts = empty();
    persist(); renderBar();
  }

  // ---------- saving into the data folder (Chrome, Edge) ----------
  const canWrite = typeof window.showDirectoryPicker === "function";
  function idb(op, value) {
    return new Promise((res, rej) => {
      const open = indexedDB.open("svr-verify", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("h");
      open.onerror = () => rej(open.error);
      open.onsuccess = () => {
        const tx = open.result.transaction("h", op === "get" ? "readonly" : "readwrite");
        const st = tx.objectStore("h");
        const r = op === "get" ? st.get("dir") : st.put(value, "dir");
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      };
    });
  }
  async function dataDir() {
    let h = null;
    try { h = await idb("get"); } catch (e) { /* no stored handle */ }
    if (h) {
      const opt = { mode: "readwrite" };
      if ((await h.queryPermission(opt)) === "granted" || (await h.requestPermission(opt)) === "granted") return h;
    }
    h = await window.showDirectoryPicker({ id: "svr-data", mode: "readwrite" });
    try { await h.getFileHandle(FILE.claims); }
    catch (e) {
      try { h = await h.getDirectoryHandle("data"); await h.getFileHandle(FILE.claims); }
      catch (e2) { throw new Error("That folder has no claims.csv. Pick the site folder (sound-vis-review) or its data folder."); }
    }
    try { await idb("put", h); } catch (e) { /* will ask again next time */ }
    return h;
  }
  async function saveToFolder() {
    const dir = await dataDir();
    const missing = [];
    for (const t of ["claims", "checks"]) {
      const edits = merged(t);
      if (!Object.keys(edits).length) continue;
      const fh = await dir.getFileHandle(FILE[t]);
      const rows = parseCSV(await (await fh.getFile()).text()).filter(r => r.length > 1 || r[0] !== "");
      missing.push(...applyEdits(t, rows, edits).map(m => `${FILE[t]}: ${m}`));
      const w = await fh.createWritable();
      await w.write(toCSV(rows)); await w.close();
    }
    return missing;
  }
  function download() {
    // Only files with edits; spaced out because browsers may block several downloads at once.
    ["claims", "checks"].filter(t => Object.keys(merged(t)).length).forEach((t, i) => setTimeout(() => {
      const rows = rowsFromData(t);
      applyEdits(t, rows, merged(t));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([toCSV(rows)], { type: "text/csv" }));
      a.download = FILE[t];
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, i * 600));
  }

  // ---------- bar ----------
  const msg = (t, kind) => { $("msg").textContent = t; $("msg").className = "vf-msg" + (kind ? " " + kind : ""); };
  function renderBar() {
    const claims = Object.keys(BASE.claims).map(id => val("claims", id, "status"));
    const checks = Object.values(BASE.checks);
    const st = (id) => val("checks", id, "status");
    const studyOpen = checks.filter(c => c.target !== "general" && st(c.id) === "open").length;
    const genOpen = checks.filter(c => c.target === "general" && st(c.id) === "open").length;
    const problems = checks.filter(c => st(c.id) === "problem").length + claims.filter(s => s === "wrong").length;
    $("stats").innerHTML = [
      `<span><b>${claims.filter(s => s === "to-check").length}</b> of ${claims.length} claims to check</span>`,
      `<span><b>${studyOpen}</b> study checks open</span>`,
      `<span><b>${genOpen}</b> open across studies</span>`,
      problems ? `<span class="bad"><b>${problems}</b> marked as a problem or not supported</span>` : "",
    ].join("");
    const d = count(store.drafts), s = count(store.saved);
    $("pending").innerHTML = d ? `<b>${d}</b> unsaved ${d === 1 ? "change" : "changes"}` :
      (s ? `Saved; run <code>python3 build.py</code> to update the site` : "No unsaved changes");
    $("save").disabled = !d && !s;
    $("download").disabled = !d && !s;
  }
  if (!canWrite) {
    $("save").hidden = true;
    msg("This browser cannot write into the folder. Use Download CSVs and replace the two files in data/ (or open this page in Chrome or Edge).");
  }
  $("save").addEventListener("click", async () => {
    try {
      const missing = await saveToFolder();
      markSaved();
      msg(missing.length ? `Saved, but these were not found on disk and were skipped: ${missing.join(", ")}.` :
        "Saved into data/claims.csv and data/checks.csv. Run python3 build.py to update the site.", missing.length ? "warn" : "ok");
    } catch (e) {
      if (e && e.name === "AbortError") return;
      msg(`Not saved: ${e.message || e}. Your edits are still kept in this browser.`, "bad");
    }
  });
  $("download").addEventListener("click", () => {
    download(); markSaved();
    msg("Downloaded the changed file(s). Move them into data/ (replacing the old ones), then run python3 build.py. They were built from the last build, so edits made by hand to those files since then would be lost.", "warn");
  });

  // ---------- list ----------
  const state = { tab: "claims", status: "open", q: "" };
  try { const s = JSON.parse(sessionStorage.getItem("svr-verify-view") || "null"); if (s) Object.assign(state, s); } catch (e) { /* ignore */ }
  const select = (opts, cur, attrs) => `<select ${attrs}>${opts.map(([v, l]) => `<option value="${v}"${v === cur ? " selected" : ""}>${l}</option>`).join("")}</select>`;
  const fmtAuthors = a => { const xs = a.split(";").map(x => x.trim()).filter(Boolean); return xs.length > 2 ? `${xs[0].split(",")[0]} et al.` : xs.map(x => x.split(",")[0]).join(" & "); };
  const hit = (txt) => !state.q || txt.toLowerCase().includes(state.q.toLowerCase());

  function passClaim(id) {
    const s = val("claims", id, "status");
    if (state.status === "open") return s === "to-check";
    if (state.status === "closed") return ["checked-online", "checked-fulltext", "ours"].includes(s);
    if (state.status === "problem") return s === "wrong";
    if (state.status === "changed") return isChanged("claims", id);
    return true;
  }
  function passCheck(id) {
    const s = val("checks", id, "status");
    if (state.status === "open") return s === "open";
    if (state.status === "closed") return s === "done";
    if (state.status === "problem") return s === "problem";
    if (state.status === "changed") return isChanged("checks", id);
    return true;
  }

  function claimHTML(c) {
    const st = val("claims", c.id, "status");
    return `<div class="vf-item st-${esc(st)}${isChanged("claims", c.id) ? " changed" : ""}" data-t="claims" data-id="${esc(c.id)}">
      <div class="vf-text">${c.kind === "ours" ? '<span class="cs cs-ours">ours</span> ' : ""}${esc(c.claim)} <span class="mono muted">${esc(c.section)}</span></div>
      <div class="vf-controls">
        <label class="vf-lab">Status ${select(CLAIM_STATUS, st, 'data-f="status"')}</label>
        <label class="vf-lab grow">Evidence: quote and page<textarea data-f="evidence" rows="2">${esc(val("claims", c.id, "evidence"))}</textarea></label>
        <label class="vf-lab grow">Note<textarea data-f="note" rows="1">${esc(val("claims", c.id, "note"))}</textarea></label>
      </div></div>`;
  }
  function checkHTML(c) {
    const st = val("checks", c.id, "status");
    return `<div class="vf-item st-${esc(st)}${isChanged("checks", c.id) ? " changed" : ""}" data-t="checks" data-id="${esc(c.id)}">
      <div class="vf-text">${window.SVR.marked(c.item)}</div>
      <div class="vf-controls">
        <label class="vf-lab">Status ${select(CHECK_STATUS, st, 'data-f="status"')}</label>
        <label class="vf-lab grow">Note<textarea data-f="note" rows="1" placeholder="Note">${esc(val("checks", c.id, "note"))}</textarea></label>
      </div></div>`;
  }

  function render() {
    document.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tab === state.tab)));
    $("f-status").value = state.status; $("f-q").value = state.q;
    try { sessionStorage.setItem("svr-verify-view", JSON.stringify(state)); } catch (e) { /* ignore */ }
    let html = "", shown = 0;
    if (state.tab === "claims") {
      const refs = REFS.slice().sort((a, b) => a.authors.localeCompare(b.authors) || a.year - b.year);
      for (const r of refs) {
        const cs = Object.values(BASE.claims).filter(c => c.ref === r.id && passClaim(c.id) &&
          hit([r.id, r.authors, r.title, c.claim, val("claims", c.id, "evidence"), val("claims", c.id, "note")].join(" ")));
        if (!cs.length) continue;
        shown += cs.length;
        const link = r.doi ? `https://doi.org/${r.doi}` : r.url;
        html += `<article class="vf-group panel"><header class="vf-head">
          <div><b>${esc(fmtAuthors(r.authors))} (${r.year})</b> ${esc(r.title)}${r.venue ? `. <i>${esc(r.venue)}</i>` : ""}</div>
          <div class="vf-meta">${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">open source</a>` : '<span class="muted">no link</span>'}
            <span class="rs rs-${esc(r.meta_status)}" title="${esc(r.meta_source)}">details ${esc(r.meta_status)}</span></div>
        </header>${cs.map(claimHTML).join("")}</article>`;
      }
    } else {
      const general = state.tab === "general";
      const order = { yes: 0, pending: 1, background: 2, no: 3 };
      const groups = general ? [{ id: "general" }] :
        STUDIES.slice().sort((a, b) => (order[a.include] - order[b.include]) || a.year - b.year);
      for (const g of groups) {
        const all = Object.values(BASE.checks).filter(c => c.target === g.id);
        const cs = all.filter(c => passCheck(c.id) && hit([g.id, g.authors || "", g.title || "", c.item, val("checks", c.id, "note")].join(" ")));
        if (!cs.length) continue;
        shown += cs.length;
        const done = all.filter(c => val("checks", c.id, "status") === "done").length;
        html += `<article class="vf-group panel">${general ? "" : `<header class="vf-head">
          <div><span class="mono muted">${esc(g.id)}</span> <b>${esc(g.authors)} (${g.year})</b> ${esc(g.title)}</div>
          <div class="vf-meta">${g.url ? `<a href="${esc(g.url)}" target="_blank" rel="noopener">open paper</a>` : ""}
            ${window.SVR.statusBadge(g)} <span class="mono muted">${done}/${all.length} done</span></div>
        </header>`}${cs.map(checkHTML).join("")}</article>`;
      }
    }
    $("list").innerHTML = html || `<p class="muted panel" style="padding:18px">Nothing here with these filters.</p>`;
    $("result-n").textContent = `${shown} shown`;
  }

  // ---------- events ----------
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => { state.tab = b.dataset.tab; render(); }));
  $("f-status").addEventListener("change", e => { state.status = e.target.value; render(); });
  let qt; $("f-q").addEventListener("input", e => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 200); });
  $("list").addEventListener("input", e => {
    const el = e.target.closest("[data-f]"), item = e.target.closest(".vf-item");
    if (!el || !item) return;
    setVal(item.dataset.t, item.dataset.id, el.dataset.f, el.value);
    item.classList.toggle("changed", isChanged(item.dataset.t, item.dataset.id));
    if (el.dataset.f === "status") item.className = item.className.replace(/\bst-\S+/, "st-" + el.value);
  });
  window.addEventListener("beforeunload", () => persist());

  renderBar(); render();
})();

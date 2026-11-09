/* Studies page: shared filters, timeline wall, evidence table, hover preview, detail drawer. */
(function () {
  "use strict";
  const { marked, evalShort, CRIT, VALUE, esc, displayById, shortAuthors, shotHTML, critBadges, statusBadge, includeBadge } = window.SVR;
  const STUDIES = window.STUDIES || [];
  const DISPLAYS = window.DISPLAYS || [];
  const $ = id => document.getElementById(id);

  // ---------- state <-> URL ----------
  const SELECTS = ["criterion", "display", "design", "whose_sound", "timing", "attention"];
  const CHECKS = ["pending", "background", "no"];
  const params = new URLSearchParams(location.search);
  const state = {
    view: params.get("view") === "table" ? "table" : "wall",
    q: params.get("q") || "",
    sort: { key: "year", dir: 1 },
  };
  SELECTS.forEach(k => { state[k] = params.get(k) || ""; });
  CHECKS.forEach(k => { state[k] = params.has(k) ? params.get(k) === "1" : k === "pending"; });

  $("f-display").innerHTML += DISPLAYS.slice().sort((a, b) => a.rank - b.rank)
    .map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join("");
  SELECTS.forEach(k => { $("f-" + k).value = state[k]; });
  CHECKS.forEach(k => { $("f-" + k).checked = state[k]; });
  $("f-q").value = state.q;
  // A display or criterion link from the overview should show everything relevant, including excluded studies.
  if (params.has("display") && !params.has("no")) { state.no = true; $("f-no").checked = true; }

  function writeURL() {
    const p = new URLSearchParams();
    if (state.view !== "wall") p.set("view", state.view);
    SELECTS.forEach(k => { if (state[k]) p.set(k, state[k]); });
    if (state.q) p.set("q", state.q);
    CHECKS.forEach(k => { if (state[k] !== (k === "pending")) p.set(k, state[k] ? "1" : "0"); });
    const qs = p.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  function matches(s) {
    if (s.include !== "yes" && !state[s.include]) return false;
    if (state.criterion && !s.criteria.includes(state.criterion)) return false;
    if (state.display && !s.displays.includes(state.display)) return false;
    for (const k of ["design", "whose_sound", "timing", "attention"]) if (state[k] && s[k] !== state[k]) return false;
    if (state.q) {
      const hay = [s.id, s.authors, s.title, s.venue, s.finding, s.population, s.measures, s.compared, s.procedure, s.year].join(" ").toLowerCase();
      if (!state.q.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }

  // ---------- timeline wall ----------
  const BINS = [
    { label: "1940s–50s", lo: 0, hi: 1959 }, { label: "1960s", lo: 1960, hi: 1969 }, { label: "1970s", lo: 1970, hi: 1979 },
    { label: "1980s", lo: 1980, hi: 1989 }, { label: "1990s", lo: 1990, hi: 1999 }, { label: "2000s", lo: 2000, hi: 2009 },
    { label: "2010s", lo: 2010, hi: 2019 }, { label: "2020s", lo: 2020, hi: 9999 },
  ];
  const LANE_TEXT = {
    "1": "Others' speech, mostly static pictures",
    "2": "Own voice, real-time feedback",
    "3": "Others' sound, often peripheral",
  };
  function tile(s, c) {
    const cls = ["tile", s.include === "pending" ? "pending" : "", s.include === "no" ? "excl" : ""].join(" ");
    return `<button type="button" class="${cls}" data-id="${esc(s.id)}" aria-label="${esc(shortAuthors(s.authors))} ${s.year}: ${esc(s.title)}">
      <div class="shot">${shotHTML(s)}</div>
      <div class="cap"><b>${esc(shortAuthors(s.authors))}</b><span>${s.year}${s.include === "no" ? " · excl." : ""}</span><span class="ev-line">${esc(evalShort(s))}</span></div></button>`;
  }
  function renderWall(rows) {
    const lanes = state.criterion ? [state.criterion] : ["1", "2", "3"];
    const grid = lanes.map(c => BINS.map(b => rows.filter(s => s.criteria.includes(c) && s.year >= b.lo && s.year <= b.hi)));
    const widths = BINS.map((b, j) => Math.max(1, ...grid.map(l => l[j].length)));
    const cols = widths.map(w => `minmax(126px, ${Math.min(w, 6)}fr)`).join(" ");
    $("wall").style.setProperty("--cols", cols);
    $("wall").innerHTML =
      `<div class="wall-head"><div></div>${BINS.map(b => `<div>${b.label}</div>`).join("")}</div>` +
      lanes.map((c, i) => `
        <div class="wall-lane" data-c="${c}">
          <div class="lane-label"><span class="n">Criterion ${c}</span><b>${esc(CRIT[c].long)}</b><span>${esc(LANE_TEXT[c])}</span></div>
          ${grid[i].map(cell => `<div class="cell">${cell.map(s => tile(s, c)).join("")}</div>`).join("")}
        </div>`).join("");
  }

  // ---------- table ----------
  const DESIGN_ORDER = ["rct", "experiment", "single-case", "case-study", "single-group", "crowdsourcing", "mixed", "qualitative", "unknown"];
  const num = n => { const m = String(n || "").match(/^\d+/); return m ? +m[0] : -1; };
  const COLS = [
    { key: "image", label: "Figure", sort: null },
    { key: "year", label: "Year", sort: s => s.year },
    { key: "authors", label: "Study", sort: s => s.authors.toLowerCase() },
    { key: "displays", label: "Display", sort: s => (displayById(s.displays[0]) || {}).rank || 0 },
    { key: "design", label: "Design", sort: s => DESIGN_ORDER.indexOf(s.design), group: true },
    { key: "n", label: "Participants", sort: s => num(s.n), group: true },
    { key: "compared", label: "Compared", sort: null, group: true },
    { key: "measures", label: "Measures", sort: null, group: true },
    { key: "finding", label: "Result", sort: null, group: true },
    { key: "theory", label: "Theory · mapping", sort: s => (s.cited_theory || []).join(), theory: true },
    { key: "status", label: "Source", sort: s => ["read", "abstract", "secondary", "verify"].indexOf(s.status) },
  ];
  function renderTable(rows) {
    const col = COLS.find(c => c.key === state.sort.key);
    const sorted = rows.slice().sort((a, b) => {
      const x = col.sort(a), y = col.sort(b);
      return (x < y ? -1 : x > y ? 1 : a.year - b.year) * state.sort.dir;
    });
    const nGroup = COLS.filter(c => c.group).length;
    const head = `<thead>
      <tr class="grp"><th colspan="4"></th><th colspan="${nGroup}" class="grp-ev">User study / evaluation</th><th class="grp-ev grp-th">Theory</th><th></th></tr>
      <tr>${COLS.map(c => {
        const aria = c.key === state.sort.key ? ` aria-sort="${state.sort.dir > 0 ? "ascending" : "descending"}"` : "";
        return `<th scope="col"${aria}${c.group ? ' class="ev-col"' : ""}>${c.sort ? `<button type="button" data-sort="${c.key}">${c.label}</button>` : c.label}</th>`;
      }).join("")}</tr></thead>`;
    const body = sorted.map(s => `
      <tr data-id="${esc(s.id)}" tabindex="0">
        <td><div class="shot" data-peek="${esc(s.id)}">${shotHTML(s)}</div></td>
        <td class="mono">${s.year}</td>
        <td class="who"><b>${esc(s.authors)}</b><span>${esc(s.title)}</span><br><span><i>${esc(s.venue)}</i></span>
          <div class="tags" style="margin-top:6px">${critBadges(s)}${includeBadge(s)}</div></td>
        <td class="disp">${s.displays.map(d => esc((displayById(d) || { name: d }).name)).join("<br>")}
          <div class="codes" style="margin-top:6px">
            <span>${esc(VALUE.whose_sound[s.whose_sound] || s.whose_sound)} · ${esc(VALUE.timing[s.timing] || s.timing)}</span>
            <span>${esc(VALUE.attention[s.attention] || s.attention)} · task: ${esc(VALUE.task[s.task] || s.task)}</span></div></td>
        <td class="ev-col"><span class="badge dz dz-${s.design}">${esc(VALUE.design[s.design] || s.design)}</span><div class="codes" style="margin-top:6px"><span>${esc((s.outcome || []).join(" · "))}</span><span>untrained interp.: ${esc(s.untrained_interpretation || "?")}</span></div></td>
        <td class="ev-col" style="min-width:150px"><b>${esc(s.n || "?")}</b><br><span class="muted">${esc(s.population)}</span>${s.dhh === "yes" ? ' <span class="badge c3">DHH</span>' : ""}</td>
        <td class="ev-col" style="min-width:180px">${esc(s.compared || "—")}</td>
        <td class="ev-col" style="min-width:160px">${esc(s.measures)}</td>
        <td class="ev-col find">${marked(s.finding)}</td>
        <td class="th-col" style="min-width:150px">${esc((s.cited_theory || []).join(", ") || "–")}<div class="codes" style="margin-top:4px"><span>${esc((s.mapping_rationale || []).join(", ") || "rationale not coded")}</span><span>${s.post_hoc_explanation ? "explanation coded" : "explanation not coded"}</span></div></td>
        <td>${statusBadge(s)}</td>
      </tr>`).join("");
    $("table").innerHTML = head + `<tbody>${body || `<tr><td colspan="${COLS.length}" class="empty">No studies match these filters.</td></tr>`}</tbody>`;
  }

  // ---------- render ----------
  function render() {
    const rows = STUDIES.filter(matches);
    $("result-n").textContent = `${rows.length} of ${STUDIES.length} studies`;
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === state.view));
    $("view-wall").hidden = state.view !== "wall";
    $("view-table").hidden = state.view !== "table";
    if (state.view === "wall") renderWall(rows); else renderTable(rows);
    writeURL();
  }

  // ---------- events ----------
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { state.view = b.dataset.view; render(); }));
  SELECTS.forEach(k => $("f-" + k).addEventListener("change", e => { state[k] = e.target.value; render(); }));
  CHECKS.forEach(k => $("f-" + k).addEventListener("change", e => { state[k] = e.target.checked; render(); }));
  $("f-q").addEventListener("input", e => { state.q = e.target.value.trim(); render(); });
  $("reset").addEventListener("click", () => {
    SELECTS.forEach(k => { state[k] = ""; $("f-" + k).value = ""; });
    CHECKS.forEach(k => { state[k] = k === "pending"; $("f-" + k).checked = state[k]; });
    state.q = ""; $("f-q").value = "";
    render();
  });
  $("table").addEventListener("click", e => {
    const sb = e.target.closest("[data-sort]");
    if (sb) {
      const k = sb.dataset.sort;
      state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : 1 };
      render(); return;
    }
    const tr = e.target.closest("tr[data-id]"); if (tr) openDrawer(tr.dataset.id);
  });
  $("table").addEventListener("keydown", e => {
    if (e.key === "Enter") { const tr = e.target.closest("tr[data-id]"); if (tr) openDrawer(tr.dataset.id); }
  });
  $("wall").addEventListener("click", e => { const t = e.target.closest(".tile"); if (t) openDrawer(t.dataset.id); });

  // hover preview: tiles on the wall, figure cells in the table
  const peek = $("peek");
  let peekId = null;
  function showPeek(el, id) {
    const s = STUDIES.find(x => x.id === id); if (!s) return;
    if (peekId !== id) {
      peek.innerHTML = `<div class="shot">${shotHTML(s)}</div>
        <div class="txt"><b>${esc(shortAuthors(s.authors))} (${s.year})</b><span class="muted" style="font-size:12px">${esc(s.title)}</span><p class="ev-sum"><b>${esc(VALUE.design[s.design] || s.design)}</b> · ${/^\d/.test(s.n) ? "n = " + esc(s.n) : "n unknown"}${s.compared ? ". " + esc(s.compared) : ""}</p><p>${marked(s.finding)}</p></div>`;
      peekId = id;
    }
    const r = el.getBoundingClientRect(), W = 340, H = peek.offsetHeight || 320;
    let x = r.right + 10, y = r.top;
    if (x + W > innerWidth - 8) x = r.left - W - 10;
    if (x < 8) x = Math.max(8, Math.min(innerWidth - W - 8, r.left));
    if (y + H > innerHeight - 8) y = Math.max(8, innerHeight - H - 8);
    peek.style.left = x + "px"; peek.style.top = y + "px";
    peek.classList.add("on");
  }
  function hidePeek() { peek.classList.remove("on"); }
  document.addEventListener("mouseover", e => {
    const t = e.target.closest(".tile, [data-peek]");
    if (t) showPeek(t, t.dataset.id || t.dataset.peek); else hidePeek();
  });
  document.addEventListener("focusin", e => { const t = e.target.closest(".tile"); if (t) showPeek(t, t.dataset.id); else hidePeek(); });
  addEventListener("scroll", hidePeek, { passive: true });

  // detail drawer
  const LENS_ROWS = [
    ["lens_correspondence", "correspondences used"], ["lens_scale", "frequency/intensity scale"],
    ["lens_time", "time"], ["lens_amodal", "amodal properties kept"], ["lens_loop", "action loop"],
    ["lens_level", "level conveyed"], ["lens_function_route", "function conveyed by"], ["lens_objects", "auditory objects as visual objects"],
  ];
  const drawer = $("drawer");
  let lastFocus = null;
  function row(label, value) { return value ? `<dt>${label}</dt><dd>${value}</dd>` : ""; }
  function openDrawer(id) {
    const s = STUDIES.find(x => x.id === id); if (!s) return;
    hidePeek();
    lastFocus = document.activeElement;
    const displays = s.displays.map(d => `<a href="studies.html?display=${d}">${esc((displayById(d) || { name: d }).name)}</a>`).join(", ");
    drawer.innerHTML = `
      <button class="close" type="button" aria-label="Close">×</button>
      <div class="shot">${shotHTML(s)}<span class="hint">${esc(s.image)}</span></div>
      <div class="inner">
        <div class="tags">${critBadges(s)}${includeBadge(s)}${statusBadge(s)}</div>
        <h2>${esc(s.title)}</h2>
        <p class="meta">${esc(s.authors)} (${s.year}). <i>${esc(s.venue)}</i>.
          ${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">Open source ↗</a>` : '<span class="badge st-verify">no link yet</span>'}</p>
        ${s.include === "no" ? `<p class="note">Excluded: ${esc(s.exclude_reason)}</p>` : ""}
        <h3 class="dr-h">Display</h3>
        <dl>
          ${row("display", displays)}
          ${row("designed for", esc(s.target_users))}
          ${row("task", esc(s.target_task))}
          ${row("sound type", esc((s.sound_type || []).join(", ")))}
          ${row("what is shown", esc(s.sound_properties))}
          ${row("scope", esc(s.scope))}
          ${row("whose sound", esc(VALUE.whose_sound[s.whose_sound] || s.whose_sound))}
          ${row("viewer action", esc(VALUE.task[s.task] || s.task))}
          ${row("timing", esc(VALUE.timing[s.timing] || s.timing))}
          ${row("attention", esc(VALUE.attention[s.attention] || s.attention))}
        </dl>
        <h3 class="dr-h">Theory</h3>
        <dl>
          ${row("cited theory", esc((s.cited_theory || []).join(", ") || "not coded yet"))}
          ${row("mapping rationale", esc((s.mapping_rationale || []).join(", ") || "not coded yet"))}
          ${row("design rationale", esc(s.design_rationale || "not coded yet"))}
          ${row("post-hoc explanation", esc(s.post_hoc_explanation || "not coded yet"))}
        </dl>
        <h3 class="dr-h">Our analysis · theoretical lens</h3>
        ${LENS_ROWS.some(([k]) => (Array.isArray(s[k]) ? s[k].length : s[k])) ? `<dl>${LENS_ROWS.map(([k, l]) => row(l, esc(Array.isArray(s[k]) ? s[k].join(", ") : s[k]) || "–")).join("")}</dl>` : '<p class="muted" style="font-size:13px">Not coded yet. These are our judgements of the display, separate from the theory the authors cite.</p>'}
        <h3 class="dr-h">User study</h3>
        <dl>
          ${row("design", esc(VALUE.design[s.design] || s.design))}
          ${row("participants", esc([s.n, s.population].filter((v, i, xs) => v && !(i === 1 && String(xs[0]).match(/^\d+/) && v.startsWith(String(xs[0]).match(/^\d+/)[0]))).join(" · ")) + (s.dhh === "yes" ? ' <span class="badge c3">DHH</span>' : ""))}
          ${row("training", esc(s.training))}
          ${row("compared", esc(s.compared))}
          ${row("procedure", esc(s.procedure))}
          ${row("outcome type", esc((s.outcome || []).join(", ")))}
          ${row("untrained interpretation tested", esc(s.untrained_interpretation || "not coded"))}
          ${row("measures", esc(s.measures))}
        </dl>
        <p class="finding"><span class="kicker" style="display:block;margin-bottom:2px">Result</span>${marked(s.finding)}</p>
        ${s.limits ? `<p class="limits"><span class="kicker" style="display:block;margin-bottom:2px">Limitations</span>${marked(s.limits)}</p>` : ""}
        ${s.source_note ? `<p class="note">${esc(s.source_note)}</p>` : ""}
        <dl>
          ${row("found via", esc(s.found_via))}
          ${row("image credit", esc(s.image_credit))}
          ${row("id", `<code class="mono">${esc(s.id)}</code>`)}
        </dl>
      </div>`;
    document.body.classList.add("drawer-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.querySelector(".close").addEventListener("click", closeDrawer);
    drawer.querySelector(".close").focus();
  }
  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }
  $("drawer-bg").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("drawer-open")) closeDrawer(); });

  render();
})();

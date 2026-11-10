/* Overview page: summary of the user studies (outcomes, designs, sample sizes). */
(function () {
  "use strict";
  const { CRIT, VALUE, esc, shortAuthors } = window.SVR;
  const IN = (window.STUDIES || []).filter(s => s.include === "yes" || s.include === "pending");
  const CRITS = ["1", "2", "3"];
  const nNum = s => { const m = String(s.n || "").match(/^\d+/); return m ? +m[0] : null; };
  const href = s => `studies.html?view=table&q=${encodeURIComponent(s.id)}`;
  const dot = (s, c) => `<a class="dot k${c}${s.include === "pending" ? " pend" : ""}" href="${href(s)}" data-id="${esc(s.id)}" aria-label="${esc(shortAuthors(s.authors))} ${s.year}"></a>`;

  const OUTCOME = [
    ["performance", "Performance", "accuracy or speed with the display"],
    ["learning", "Learning", "change over training, transfer, retention"],
    ["preference", "Preference", "ratings or rankings of displays"],
    ["experience", "Experience", "enjoyment, flow, self-efficacy"],
    ["practice", "Practice", "interviews or observation of use"],
  ];
  const DESIGN = ["rct", "experiment", "single-case", "case-study", "single-group", "crowdsourcing", "mixed", "qualitative", "unknown"]
    .map(d => [d, VALUE.design[d].replace(/^./, c => c.toUpperCase()), ""]);

  function matrix(id, rowsDef, has) {
    const head = `<thead><tr><th></th>${CRITS.map(c => `<th scope="col"><span class="key k${c}"></span>${c} · ${esc(CRIT[c].short)}</th>`).join("")}</tr></thead>`;
    const body = rowsDef.map(([key, label, sub]) => {
      const cells = CRITS.map(c => {
        const xs = IN.filter(s => s.criteria.includes(c) && has(s, key));
        return `<td>${xs.length ? `<span class="cnt">${xs.length}</span><span class="dots">${xs.map(s => dot(s, c)).join("")}</span>` : '<span class="cnt zero">–</span>'}</td>`;
      }).join("");
      const total = IN.filter(s => has(s, key)).length;
      if (!total) return "";
      return `<tr><th scope="row">${esc(label)}${sub ? `<span>${esc(sub)}</span>` : ""}</th>${cells}</tr>`;
    }).join("");
    document.getElementById(id).innerHTML = head + `<tbody>${body}</tbody>`;
  }
  matrix("m-outcome", OUTCOME, (s, k) => s.outcome.includes(k));
  matrix("m-design", DESIGN, (s, k) => s.design === k);
  matrix("m-interp", [
    ["yes", "Yes", "viewers judged the sound from the display alone"],
    ["no", "No", "discrimination, learning, preference or production only"],
    ["unknown", "Unknown", "not clear from our sources"],
  ], (s, k) => s.untrained_interpretation === k);
  const noCrit = IN.filter(s => !s.criteria.length).length;
  if (noCrit) document.getElementById("m-interp").insertAdjacentHTML("afterend",
    `<p class="ev-note">${noCrit} pending ${noCrit === 1 ? "study belongs" : "studies belong"} to no strand yet and ${noCrit === 1 ? "is" : "are"} not shown in these columns.</p>`);

  // theories cited and mapping rationale (RQ4)
  (function theory() {
    const el = document.getElementById("theory-panel");
    const block = (col, title) => {
      const coded = IN.filter(s => (s[col] || []).length);
      if (!coded.length) return `<p class="ev-note"><b style="color:var(--ink)">${title}</b>: not coded yet (0 of ${IN.length} studies). Fill <code>${col}</code> in <code>studies.csv</code>.</p>`;
      const counts = {};
      coded.forEach(s => s[col].forEach(v => { counts[v] = (counts[v] || 0) + 1; }));
      const max = Math.max(...Object.values(counts));
      return `<p class="ev-note"><b style="color:var(--ink)">${title}</b>: ${coded.length} of ${IN.length} studies coded</p>
        <div class="bars">${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
          `<div class="bar-row"><span>${esc(k.replace(/-/g, " "))}</span><div class="bar"><i style="width:${(v / max) * 100}%"></i></div><b>${v}</b></div>`).join("")}</div>`;
    };
    const txt = (col, title) => {
      const xs = IN.filter(s => s[col]);
      return `<p class="ev-note"><b style="color:var(--ink)">${title}</b>: ${xs.length} of ${IN.length} studies coded${xs.length ? ` (${xs.map(s => esc(window.SVR.shortAuthors(s.authors)) + " " + s.year).join(", ")})` : ""}.</p>`;
    };
    el.innerHTML = block("cited_theory", "Theory cited by the authors") + block("mapping_rationale", "Grounds for the mapping")
      + txt("design_rationale", "Design rationale") + txt("post_hoc_explanation", "Post-hoc explanation");
  })();

  // headline numbers
  const ns = IN.map(nNum).filter(v => v != null).sort((a, b) => a - b);
  const median = ns.length ? (ns.length % 2 ? ns[(ns.length - 1) / 2] : (ns[ns.length / 2 - 1] + ns[ns.length / 2]) / 2) : "–";
  const small = IN.filter(s => ["single-case", "case-study"].includes(s.design)).length;
  const noOutcome = IN.filter(s => !s.outcome.length).length;
  document.getElementById("ev-tiles").innerHTML = [
    [IN.length, "studies", `${IN.filter(s => s.include === "pending").length} of them pending`],
    [median, "median participants", `over the ${ns.length} studies with a coded number`],
    [IN.length - ns.length, "without a coded number", "still to read in the original"],
    [small, "single-case or case studies", "all in speech training"],
  ].map(([v, l, sub]) => `<div class="tile-stat panel"><b>${v}</b><span>${esc(l)}</span><small>${esc(sub)}</small></div>`).join("");
  // keep the "all in speech therapy" note honest
  if (IN.some(s => ["single-case", "case-study"].includes(s.design) && !s.criteria.includes("2"))) {
    document.querySelector("#ev-tiles .tile-stat:last-child small").textContent = "mostly speech training";
  }
  if (noOutcome) {
    document.getElementById("m-outcome").insertAdjacentHTML("afterend", `<p class="ev-note">${noOutcome} studies have no outcome coded yet.</p>`);
  }

  // sample-size strip (log scale)
  const MAX = 200, ticks = [1, 2, 5, 10, 20, 50, 100, 200];
  const x = v => (Math.log(v) / Math.log(MAX)) * 100;
  const lanes = CRITS.map(c => {
    const xs = IN.filter(s => s.criteria.includes(c));
    const known = xs.filter(s => nNum(s) != null).sort((a, b) => nNum(a) - nNum(b));
    const unknown = xs.length - known.length;
    const used = {};
    const top = known[known.length - 1];
    const marks = known.map(s => {
      const v = nNum(s), k = Math.round(x(v));
      const row = used[k] = (used[k] || 0) + 1;            // stack identical positions
      const dy = (row - 1) * 14;
      const label = s === top ? `<span class="nlab" style="left:${x(v)}%;top:${dy}px">${v}</span>` : "";
      return `<a class="dot k${c}${s.include === "pending" ? " pend" : ""}" href="${href(s)}" data-id="${esc(s.id)}" style="left:${x(v)}%;top:${dy}px" aria-label="${esc(shortAuthors(s.authors))} ${s.year}, n = ${v}"></a>${label}`;
    }).join("");
    const h = 22 + 14 * Math.max(0, ...Object.values(used).map(r => r - 1));
    return `<div class="nlane"><div class="nl-label"><span class="key k${c}"></span>${c} · ${esc(CRIT[c].short)}</div>
      <div class="nl-track" style="height:${h}px">${marks}</div>
      <div class="nl-unk">${unknown ? `n ? <b>${unknown}</b>` : ""}</div></div>`;
  }).join("");
  document.getElementById("n-strip").innerHTML = `<div class="nstrip">${lanes}
    <div class="nlane axis"><div></div><div class="nl-track">${ticks.map(t => `<span style="left:${x(t)}%">${t}</span>`).join("")}</div><div></div></div></div>`;

  // tooltip
  const tip = document.getElementById("ev-tip");
  const byId = Object.fromEntries(IN.map(s => [s.id, s]));
  function show(el) {
    const s = byId[el.dataset.id]; if (!s) return;
    tip.innerHTML = `<b>${esc(shortAuthors(s.authors))} (${s.year})</b>${s.include === "pending" ? ' <span class="badge inc-pending">pending</span>' : ""}
      <span>${esc(VALUE.design[s.design] || s.design)} · ${nNum(s) != null ? "n = " + esc(s.n) : "n not coded"}</span>
      <span>${esc(s.measures || "")}</span>`;
    const r = el.getBoundingClientRect(), W = 260;
    let left = r.left + r.width / 2 - W / 2;
    left = Math.max(8, Math.min(innerWidth - W - 8, left));
    tip.style.left = left + "px";
    tip.style.top = (r.top - 8) + "px";
    tip.classList.add("on");
  }
  document.addEventListener("mouseover", e => { const d = e.target.closest(".dot"); d ? show(d) : tip.classList.remove("on"); });
  document.addEventListener("focusin", e => { const d = e.target.closest(".dot"); d ? show(d) : tip.classList.remove("on"); });
  addEventListener("scroll", () => tip.classList.remove("on"), { passive: true });
})();

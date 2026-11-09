/* Shared helpers: theme toggle, labels, display thumbnails, screenshot fallback. */
(function () {
  "use strict";

  // ---------- theme ----------
  const root = document.documentElement;
  const KEY = "svr-theme";
  try { const t = localStorage.getItem(KEY); if (t) root.dataset.theme = t; } catch (e) { /* storage unavailable */ }
  function isDark() {
    if (root.dataset.theme) return root.dataset.theme === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function paintThemeBtn(btn) {
    btn.innerHTML = isDark() ? SUN : MOON;
    btn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".theme-btn");
    if (btn) {
      paintThemeBtn(btn);
      btn.addEventListener("click", () => {
        root.dataset.theme = isDark() ? "light" : "dark";
        try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) { /* ignore */ }
        paintThemeBtn(btn);
      });
    }
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach(a => {
      if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
    });
    const built = document.querySelector("[data-built]");
    if (built && window.BUILT) built.textContent = window.BUILT;
  });

  // ---------- labels ----------
  const CRIT = {
    "1": { short: "Reading", long: "Reading speech from spectrographic displays" },
    "2": { short: "Voice training", long: "Spectral displays as voice-training feedback" },
    "3": { short: "DHH", long: "Sound visualization for deaf and hard-of-hearing users" },
  };
  const VALUE = {
    whose_sound: { own: "own voice", other: "others' sound", both: "own + others", unknown: "?" },
    timing: { static: "static", "real-time": "real-time", "after-attempt": "after attempt", unknown: "timing ?" },
    attention: { focal: "focal", peripheral: "peripheral", unknown: "attention ?" },
    task: { identify: "identify", match: "match / discriminate", detect: "detect / monitor", produce: "produce a target", rate: "rate / prefer", unknown: "?" },
    status: { read: "full text read", abstract: "abstract only", secondary: "secondary source", verify: "to verify" },
    include: { yes: "included", pending: "pending decision", background: "background", no: "excluded" },
    untrained_interpretation: { yes: "yes", no: "no", unknown: "unknown" },
    design: {
      rct: "randomized controlled trial", experiment: "experiment", "single-case": "single-case design", "case-study": "case study",
      "single-group": "single group, no comparison", crowdsourcing: "crowdsourcing", mixed: "mixed methods", qualitative: "qualitative", unknown: "design unknown",
    },
  };
  const DESIGN_SHORT = {
    rct: "RCT", experiment: "exp.", "single-case": "single-case", "case-study": "case", "single-group": "1 group",
    crowdsourcing: "crowd", mixed: "mixed", qualitative: "qual.", unknown: "design ?",
  };
  const nShort = n => { const m = String(n || "").match(/^\d+/); return m ? "n=" + m[0] : "n=?"; };
  const evalShort = s => `${DESIGN_SHORT[s.design] || "design ?"} · ${nShort(s.n)}`;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const displayById = id => (window.DISPLAYS || []).find(d => d.id === id);
  const shortAuthors = a => {
    const first = String(a).split(/,| & | and /)[0].replace(/\(.*?\)/g, "").trim();
    return /,| & /.test(a) ? first + " et al." : first;
  };

  // ---------- schematic thumbnails (for displays without a demo rendering) ----------
  const F = 'font-family="IBM Plex Mono, monospace"';
  const svg = inner => `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="200" height="120" fill="var(--paper)"/>${inner}</svg>`;
  function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const SCHEMA = {
    pseudo: () => svg(`
      <rect width="200" height="120" fill="#f3f1ea"/>
      <rect x="22" y="18" width="6" height="80" fill="#2a2722"/>
      <path d="M34 92 L52 80 L150 80 L168 88 L168 96 L150 88 L52 88 L34 100Z" fill="#2a2722"/>
      <path d="M34 48 L52 62 L150 62 L168 54 L168 62 L150 70 L52 70 L34 56Z" fill="#2a2722"/>
      <path d="M34 27 L52 35 L150 35 L168 31 L168 38 L150 42 L52 42 L34 34Z" fill="#2a2722"/>
      <text x="176" y="95" font-size="9" ${F} fill="#7a7468">F1</text>
      <text x="176" y="61" font-size="9" ${F} fill="#7a7468">F2</text>
      <text x="176" y="37" font-size="9" ${F} fill="#7a7468">F3</text>`),
    ripple: () => svg(`
      <rect x="16" y="12" width="168" height="96" rx="2" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
      <line x1="100" y1="12" x2="100" y2="60" stroke="var(--line)" stroke-width="1.5"/>
      <line x1="16" y1="60" x2="70" y2="60" stroke="var(--line)" stroke-width="1.5"/>
      <circle cx="146" cy="40" r="6" fill="var(--c3)"/>
      <circle cx="146" cy="40" r="14" fill="none" stroke="var(--c3)" stroke-width="1.5" opacity=".7"/>
      <circle cx="146" cy="40" r="23" fill="none" stroke="var(--c3)" stroke-width="1.2" opacity=".45"/>
      <circle cx="146" cy="40" r="32" fill="none" stroke="var(--c3)" stroke-width="1" opacity=".25"/>
      <text x="24" y="100" font-size="9" ${F} fill="var(--muted)">floor plan</text>`),
    icon: () => svg(`
      <rect x="66" y="14" width="68" height="68" rx="14" fill="var(--c3-soft)" stroke="var(--c3)" stroke-width="1.5"/>
      <path d="M100 26 C 86 26, 82 38, 82 51 L 78 62 L 122 62 L 118 51 C 118 38, 114 26, 100 26 Z" fill="var(--c3)"/>
      <circle cx="100" cy="68" r="5" fill="var(--c3)"/>
      <text x="100" y="104" text-anchor="middle" font-size="12" font-family="IBM Plex Sans, sans-serif" font-weight="600" fill="var(--ink)">Doorbell</text>`),
    caption: () => svg(`
      <rect x="10" y="30" width="180" height="60" rx="6" fill="var(--ink)" opacity=".92"/>
      <text x="100" y="68" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" fill="var(--paper)">
        <tspan font-size="12">I said</tspan><tspan font-size="22" font-weight="700" fill="var(--c2)"> NO</tspan><tspan font-size="12" font-style="italic"> …again</tspan>
      </text>`),
    learned: () => svg(`
      ${[[58, "M48 70 Q58 78 68 70", 9], [142, "M132 74 Q142 66 152 74", 6]].map(([cx, mouth, eye]) => `
        <ellipse cx="${cx}" cy="58" rx="34" ry="42" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
        <ellipse cx="${cx - 12}" cy="48" rx="${eye / 2}" ry="${eye / 3}" fill="var(--ink)"/>
        <ellipse cx="${cx + 12}" cy="48" rx="${eye / 2}" ry="${eye / 3}" fill="var(--ink)"/>
        <path d="${mouth}" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>`).join("")}
      <text x="100" y="114" text-anchor="middle" font-size="9" ${F} fill="var(--muted)">/a/ vs. /i/</text>`),
    ultra: () => svg(`
      <path d="M100 108 L30 30 A 100 100 0 0 1 170 30 Z" fill="#1d1f24" stroke="var(--line)" stroke-width="1.5"/>
      <path d="M52 64 C 72 40, 120 34, 150 56" fill="none" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <text x="100" y="98" text-anchor="middle" font-size="9" ${F} fill="#9aa">tongue surface</text>`),
    emoji: () => svg(`
      <rect x="22" y="34" width="120" height="44" rx="22" fill="var(--panel)" stroke="var(--line)" stroke-width="1.5"/>
      <path d="M40 56 h6 M50 48 v16 M58 52 v8 M66 44 v24 M74 50 v12 M82 54 v4 M90 46 v20 M98 52 v8" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="160" cy="56" r="20" fill="#F2C94C"/>
      <circle cx="153" cy="51" r="2.5" fill="#3a2a00"/><circle cx="167" cy="51" r="2.5" fill="#3a2a00"/>
      <path d="M150 62 Q160 70 170 62" fill="none" stroke="#3a2a00" stroke-width="2" stroke-linecap="round"/>
      <text x="100" y="104" text-anchor="middle" font-size="9" ${F} fill="var(--muted)">voice message + emotion cue</text>`),
    midi: () => svg((() => {
      const r = rand(11); let s = "";
      for (let i = 0; i < 26; i++) {
        const x = 14 + r() * 172, y = 14 + r() * 92, rad = 2 + r() * 9;
        const col = ["var(--c1)", "var(--c2)", "var(--c3)"][i % 3];
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${col}" opacity="${(0.35 + r() * 0.5).toFixed(2)}"/>`;
      }
      return s + `<text x="186" y="112" text-anchor="end" font-size="9" ${F} fill="var(--muted)">MIDI → particles</text>`;
    })()),
    spectrum: () => svg(`
      <line x1="18" y1="100" x2="190" y2="100" stroke="var(--line)" stroke-width="1.5"/>
      <path d="M18 92 C 30 70, 38 34, 50 36 S 66 78, 80 70 S 96 40, 106 44 S 118 72, 128 62 S 140 50, 150 66 S 176 92, 190 95" fill="none" stroke="var(--line-b)" stroke-width="2.5"/>
      <line x1="122" y1="14" x2="122" y2="100" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="126" y="24" font-size="9" ${F} fill="var(--muted)">target</text>`),
  };

  // Image to show for a display: the demo rendering of the speech sample if there is one, else a schematic.
  function displayVisual(id, sample) {
    const d = displayById(id);
    const demo = window.DEMO && (window.DEMO.find(s => s.id === (sample || "speech")) || window.DEMO[0]);
    if (d && d.demo_key && demo && demo.img[d.demo_key]) {
      return `<img src="${esc(demo.img[d.demo_key])}" alt="" loading="lazy" class="demo-img">`;
    }
    return (SCHEMA[id] || SCHEMA.midi)();
  }

  // Screenshot of a study, falling back to the visual of its first display when the file is missing.
  function shotHTML(study) {
    const first = (study.displays || [])[0] || "";
    return `<img src="${esc(study.image)}" alt="Figure from ${esc(shortAuthors(study.authors))} (${study.year})" loading="lazy" data-fallback="${esc(first)}">`;
  }
  document.addEventListener("error", e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-fallback")) return;
    const id = img.getAttribute("data-fallback");
    img.removeAttribute("data-fallback");
    const holder = document.createElement("div");
    holder.className = "fallback";
    holder.style.cssText = "width:100%;height:100%;position:relative";
    holder.innerHTML = displayVisual(id) + '<span class="mono" style="position:absolute;right:4px;bottom:2px;font-size:9px;color:var(--muted);background:var(--panel);padding:0 3px;border-radius:2px;opacity:.9">placeholder</span>';
    const inner = holder.querySelector("img");
    if (inner) inner.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    img.replaceWith(holder);
  }, true);

  // Escape text and set off our own interpretations, written as [Ours: ...] or [Ours] ...
  function marked(t) {
    return esc(t).replace(/\[Ours[^\]]*\]/g, m => `<span class="ours" title="Our interpretation, not the authors'">${m}</span>`);
  }
  function critBadges(s) { return (s.criteria || []).map(c => `<span class="badge c${c}">${c} · ${CRIT[c].short}</span>`).join(""); }
  function statusBadge(s) { return `<span class="badge st-${s.status}">${VALUE.status[s.status]}</span>`; }
  function includeBadge(s) { return s.include === "yes" ? "" : `<span class="badge inc-${s.include}">${VALUE.include[s.include]}</span>`; }

  window.SVR = { marked, DESIGN_SHORT, nShort, evalShort, CRIT, VALUE, esc, displayById, shortAuthors, displayVisual, shotHTML, critBadges, statusBadge, includeBadge, SCHEMA };
})();

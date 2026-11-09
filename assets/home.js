/* Overview page: criterion counts, demo player, display gallery. */
(function () {
  "use strict";
  const { esc, displayVisual } = window.SVR;
  const STUDIES = window.STUDIES || [];
  const DISPLAYS = window.DISPLAYS || [];
  const DEMO = window.DEMO || [];

  // ---------- criterion counts ----------
  document.querySelectorAll("[data-count]").forEach(el => {
    const c = el.dataset.count;
    const yes = STUDIES.filter(s => s.criteria.includes(c) && s.include === "yes").length;
    const pend = STUDIES.filter(s => s.criteria.includes(c) && s.include === "pending").length;
    el.innerHTML = `<b>${yes}</b> included${pend ? ` · ${pend} pending` : ""} →`;
  });

  // ---------- demo ----------
  const TRACKS = [
    { key: "wave", display: "wave", name: "Waveform", note: "amplitude + loudness", light: true, axis: () => ["", ""] },
    { key: "pitch", display: "pitch", name: "Pitch contour", note: "autocorrelation F0", light: true, axis: s => [`${s.f0range[1]} Hz`, `${s.f0range[0]} Hz`] },
    { key: "spec_wide", display: "spec", name: "Wideband spectrogram", note: "5 ms window: formants, pulses", tall: true, axis: s => [`${s.fmax / 1000} kHz`, "0"] },
    { key: "spec_narrow", display: "spec", name: "Narrowband spectrogram", note: "40 ms window: harmonics", tall: true, axis: s => [`${s.fmax / 1000} kHz`, "0"] },
    { key: "mel", display: "spec", name: "Mel spectrogram", note: "mel-scaled bands, as in machine learning", axis: s => [`${s.fmax / 1000} kHz`, "0"] },
  ];
  const VARIANTS = [
    { key: "r_gray70", title: "Grayscale, 70 dB", text: "The look of printed spectrograms in the reading studies." },
    { key: "r_dr40", title: "Colour, 40 dB range", text: "A narrow range keeps only the strongest energy: cleaner, but weak harmonics vanish." },
    { key: "r_dr90", title: "Colour, 90 dB range", text: "A wide range shows faint detail and the noise floor." },
    { key: "r_logf", title: "Log frequency", text: "Gives low frequencies, where F0 and the first harmonics sit, more room." },
  ];
  const NOTES = {
    speech: "Speech: an English sentence. In the wideband row look for formant bands; in the narrowband row, for harmonics.",
    cry_sub: "Infant cry with subharmonics: extra lines appear between the harmonics in the narrowband row.",
    cry_chaos: "Infant cry with chaotic segments: harmonics break into noise. The pitch tracker drops out or jumps there.",
    singing: "Chanted singing: steady notes give flat pitch segments and long horizontal harmonics.",
  };
  if (!DEMO.length) {
    document.getElementById("demo").innerHTML = '<p class="empty">Demo files not found. Run <code>python3 tools/make_demo.py</code>.</p>';
  } else {
    const audio = document.getElementById("audio");
    const playBtn = document.getElementById("play");
    const playLabel = document.getElementById("play-label");
    const playIcon = document.getElementById("play-icon");
    const tracksEl = document.getElementById("tracks");
    const sideEl = document.getElementById("side");
    const variantsEl = document.getElementById("variants");
    const ticksEl = document.getElementById("ticks");
    let cur = DEMO[0];

    const chips = document.getElementById("samples");
    chips.innerHTML = DEMO.map((s, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 0}">${esc(s.label)}</button>`).join("");
    chips.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === b));
      load(DEMO[+b.dataset.i]);
    });

    function plot(src, opts) {
      const cls = ["plot", opts.light ? "light" : "", opts.tall ? "tall" : ""].join(" ");
      const ax = opts.axis || ["", ""];
      const lpc = opts.lpc != null ? `<div style="position:absolute;top:0;bottom:0;left:${opts.lpc}%;border-left:1.5px dashed ${opts.light ? "var(--line-b)" : "rgba(255,255,255,.7)"};pointer-events:none" title="LPC slice"></div>` : "";
      return `<div class="${cls}" data-seek>
        <img src="${esc(src)}" alt="${esc(opts.alt || "")}" draggable="false">
        ${ax[0] ? `<span class="ax ax-top">${esc(ax[0])}</span>` : ""}${ax[1] ? `<span class="ax ax-bot">${esc(ax[1])}</span>` : ""}
        ${lpc}<div class="playhead"></div></div>`;
    }

    function load(s) {
      cur = s;
      audio.pause(); audio.src = s.audio; audio.currentTime = 0;
      const lpcPct = (s.lpc_t / s.duration) * 100;
      tracksEl.innerHTML = TRACKS.map(t => `
        <div class="track">
          <div class="track-label"><a href="studies.html?display=${t.display}">${esc(t.name)}</a><span>${esc(t.note)}</span></div>
          ${plot(s.img[t.key], { light: t.light, tall: t.tall, axis: t.axis(s), lpc: lpcPct, alt: `${t.name} of ${s.label}` })}
        </div>`).join("");
      const peaks = (s.formants || []).map((f, i) => `<span>peak ${i + 1} · ${Math.round(f)} Hz</span>`).join("");
      sideEl.innerHTML = `
        <figure>
          <div class="track-label"><a href="studies.html?display=spectrum">Spectrum slice (LPC)</a></div>
          ${plot(s.img.lpc, { light: true, axis: ["0 dB", `0 – ${s.fmax / 1000} kHz →`], alt: `LPC spectrum of ${s.label}` })}
          <figcaption>One 30 ms frame at the dashed line (${s.lpc_t.toFixed(2)} s). Thin line: spectrum; thick line: LPC envelope, whose peaks estimate formants. Displays used in /r/ therapy add a target line to this picture.</figcaption>
          <div class="formants">${peaks}</div>
          ${s.id !== "speech" ? '<figcaption>With high-pitched voices such as cries, the envelope peaks tend to follow single harmonics rather than formants.</figcaption>' : ""}
        </figure>`;
      variantsEl.innerHTML = VARIANTS.map(v => `
        <figure>
          ${plot(s.img[v.key], { axis: [v.key === "r_logf" ? `${s.fmax / 1000} kHz` : "", v.key === "r_logf" ? "50 Hz" : ""], alt: `${v.title} spectrogram of ${s.label}` })}
          <figcaption><b>${esc(v.title)}.</b> ${esc(v.text)}</figcaption>
        </figure>`).join("");
      const step = s.duration > 3 ? 1 : 0.5;
      let ticks = "";
      for (let t = 0; t <= s.duration + 1e-6; t += step) ticks += `<span style="left:${(t / s.duration) * 100}%">${t.toFixed(t % 1 ? 1 : 0)} s</span>`;
      ticksEl.innerHTML = ticks;
      document.getElementById("demo-note").textContent = `${NOTES[s.id] || ""} Source file: ${s.source}.`;
      setPlaying(false); moveHead(0);
    }

    function moveHead(t) {
      const pct = Math.min(100, (t / cur.duration) * 100);
      document.querySelectorAll("#tracks .playhead, #variants .playhead").forEach(p => { p.style.left = `calc(${pct}% - 1px)`; });
    }
    function setPlaying(on) {
      document.getElementById("demo").classList.toggle("playing", on || audio.currentTime > 0);
      playLabel.textContent = on ? "Pause" : "Play";
      playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
      playIcon.innerHTML = on ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
    }
    let raf = 0;
    function tick() { moveHead(audio.currentTime); if (!audio.paused) raf = requestAnimationFrame(tick); }
    playBtn.addEventListener("click", () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); });
    audio.addEventListener("play", () => { setPlaying(true); cancelAnimationFrame(raf); tick(); });
    audio.addEventListener("pause", () => { setPlaying(false); moveHead(audio.currentTime); });
    audio.addEventListener("ended", () => { setPlaying(false); });
    document.getElementById("demo").addEventListener("click", e => {
      const p = e.target.closest("[data-seek]");
      if (!p || !p.closest("#tracks, #variants")) return;
      const r = p.getBoundingClientRect();
      audio.currentTime = Math.max(0, Math.min(cur.duration, ((e.clientX - r.left) / r.width) * cur.duration));
      moveHead(audio.currentTime);
      document.getElementById("demo").classList.add("playing");
      if (audio.paused) audio.play().catch(() => {});
    });
    load(cur);
  }

  // ---------- display matrix (RQ1): processing level x visual encoding ----------
  const ROWS = [
    ["signal", "Signal representation", "the whole signal, transformed but not selected"],
    ["feature", "Acoustic features", "selected measurable quantities: F0, loudness, location"],
    ["inferred", "Inferred categories", "output of a recognizer: sound class, emotion"],
    ["learned", "Learned representation", "a neural network's latent space"],
    ["symbolic", "Symbolic data", "note data (MIDI), not audio; DHH music only"],
  ];
  const COLS = [["plot", "Plot"], ["abstract", "Abstract mapping"], ["symbol", "Symbol"]];
  function card(d) {
    const rows = STUDIES.filter(s => s.displays.includes(d.id));
    const by = k => rows.filter(s => s.include === k).length;
    const counts = [
      by("yes") ? `<span class="badge" style="background:var(--accent-soft);color:var(--accent)">${by("yes")} included</span>` : "",
      by("pending") ? `<span class="badge inc-pending">${by("pending")} pending</span>` : "",
      by("no") ? `<span class="badge inc-no">${by("no")} excluded</span>` : "",
    ].join("");
    return `<a class="dcard panel" href="studies.html?display=${d.id}" title="${esc(d.description)}">
      <div class="thumb">${displayVisual(d.id)}</div>
      <div class="body"><h3>${esc(d.name)}</h3><div class="n">${counts || '<span class="badge">no studies yet</span>'}</div></div></a>`;
  }
  const gal = document.getElementById("gallery");
  gal.innerHTML =
    `<div class="dm-corner"></div>${COLS.map(([k, l]) => `<div class="dm-colhead">${l}</div>`).join("")}` +
    ROWS.map(([rk, rl, rsub]) => `<div class="dm-rowhead"><b>${rl}</b><span>${rsub}</span></div>` +
      COLS.map(([ck, cl]) => {
        const ds = DISPLAYS.filter(d => d.processing === rk && d.encoding === ck).sort((a, b) => a.rank - b.rank);
        return `<div class="dm-cell${ds.length ? "" : " empty"}"><span class="dm-celllabel">${cl}</span>${ds.map(card).join("") || '<span class="dm-dash">–</span>'}</div>`;
      }).join("")).join("");
  const outside = DISPLAYS.filter(d => d.processing === "physiological");
  document.getElementById("dm-note").innerHTML = outside.length
    ? `Outside the matrix: ${outside.map(d => `<a href="studies.html?display=${d.id}">${esc(d.name)}</a>`).join(", ")}, physiological biofeedback that appears only as a comparison arm.` : "";
})();

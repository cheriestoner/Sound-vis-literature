# Writes TODO.md from data/studies.csv plus the per-study notes below.
# WARNING: rerunning overwrites TODO.md, including boxes you have ticked. Use it only to start a fresh checklist.
# Usage: python3 tools/make_todo.py .
import csv, sys
ROOT = sys.argv[1]
rows = list(csv.DictReader(open(f"{ROOT}/data/studies.csv", encoding="utf-8")))
# What, beyond the routine checks, is uncertain or our own interpretation, per study.
FLAGS = {
 "potter1947": ["Who the readers were, what they were trained on, how reading was measured: all unknown in our notes."],
 "house1966": ["Only a catalogue summary is known; find the JASA original.", "Participants' training level and whether the display was static or real-time.", "[Ours] 'one of the few studies on display parameters' is a claim about our search, not the paper."],
 "greene1982": ["'Relatively high' generalization is quoted from a secondary summary; find the JASA meeting abstract."],
 "greene1983": ["33% vs. 40% come from a secondary summary of a JASA meeting abstract.", "[Ours] We assume the abstract and the Progress Report 9 chapter describe the same study.", "Number of participants."],
 "greene1984": ["[Ours] limits: 'closed set of 50 words; few talkers'.", "Check that the 'verbal protocols' and 'visual correlates of phonetic features' wording matches the paper."],
 "gabrys1990": ["Size of the separate salience-rating group.", "The 98% / 76% circling figures and blocks-to-criterion numbers."],
 "jslhr2004": ["Authors (possibly Ertmer).", "[Ours] limits: 'matching, not identification'."],
 "shamir2014": ["Number of volunteers; training given to them.", "[Ours] limits: audio and spectrogram together."],
 "song2023": ["Number of participants; training; whether AudioViewer targets DHH users (would add criterion 3)."],
 "chase1968": ["Design coded as 'single group' from the abstract; check whether there was a control condition.", "Whether 'the template showed only part of the spectrum' is the authors' remark."],
 "stark1973": ["Only a catalogue summary is known; find the original.", "Number of participants; training schedule."],
 "houde1980": ["Only a catalogue summary is known; find the original.", "Number of participants; how 'as effective as teachers' was measured."],
 "ertmer1996": ["Authors (Ertmer, Stark & Karlan?).", "Transfer to untrained words: size of the effect."],
 "ertmer2000": ["Design type (coded 'unknown'): alternating treatments? multiple baseline?"],
 "welch2005": ["Which displays were used (pitch, spectrogram, others).", "Number and type of participants."],
 "howard2007": ["Authors, year, venue and link are all unverified. Find the paper first."],
 "laukkanen2004": ["Everything except the title comes from an Elicit summary: design, n, displays, results, the 'excess vocal effort' caution."],
 "byun2016": ["[Ours] in the result: 'the display may help most while a new target is being acquired'."],
 "byun2017a": ["Display: Sona-Match (Computerized Speech Lab), LPC with template; check.", "'Four of seven responded' and 'larger within-session gains for three'."],
 "byun2017b": ["1% → 73% figures; that probes without the display showed no gain."],
 "mcallister2025": ["Arms: were visual-acoustic and ultrasound separate arms or pooled against motor-based treatment?", "Primary outcome wording (F3–F2 over the first three sessions)."],
 "paney2021": ["Everything comes from Zhang (2026), which misattributes other references. Read the original."],
 "berglin2022": ["Everything comes from Zhang (2026). Read the original."],
 "blanco2021": ["What the comparison condition(s) were (an auditory aid? no feedback?); n.", "Zhang (2026) cites this DOI under different authors."],
 "welch1984": ["Known only through Blanco et al. (2021); find the original (1984 or 1989?)."],
 "hoching2003": ["Number of participants; whether 'easier to monitor' is a measured result or participants' comments.", "Design coded as 'experiment'; check."],
 "matthews2006": ["Number of participants; whether it is the same study as the 2005 ASSETS paper.", "Details on interaction and loud sounds come from your own reading; check page numbers."],
 "jain2015": ["'24 + 4' participants; which part was formative and which a prototype test."],
 "goodman2025": ["Number of participants; which representations were compared besides spectrogram and waveform."],
 "pataca2023": ["Caption conditions compared (coded 'with and without prosody or emotion'); procedure."],
 "nanayakkara2013": ["[Ours] limits: 1-minute trials, knowledge of purpose, no information measure, df reading. Recheck the F(2, 504) and p values before citing.", "'Haptic Chair dominated' is our summary of the preference and flow results."],
 "fourney2009": ["Locate the paper: venue, year, whether there is a user study with DHH participants."],
 "lamel1988": ["Excluded (experts). Check only if cited as comparison."],
 "zinovyeva1987": ["Excluded (experts). Check only if cited as comparison."],
}
order = {"yes": 0, "pending": 1, "background": 2, "no": 3}
rows.sort(key=lambda r: (order[r["include"]], int(r["year"])))
out = []
w = out.append
w("# TODO: checks against the original papers\n")
w("Everything in `data/studies.csv` was coded by Claude from abstracts, summaries and our earlier notes, unless the status is `read`. Before citing a study, check its row against the original and tick the boxes here. After editing the CSV, run `python3 build.py`.\n")
w("Convention in the CSV: text in `[Ours: ...]` or starting with `[Ours]` is our interpretation, not the authors'. Keep it marked or delete it.\n")
w("## For every study\n")
w("- **Screenshot**: save the figure that shows the display participants saw as `images/<id>.png`; fill `image_credit` (figure number, licence).")
w("- **Display coding**: `displays`, `whose_sound`, `task`, `timing`, `attention`.")
w("- **User study**: `design`, `n`, `compared`, `procedure`, `outcome`, `measures`. The `design` and `outcome` codes are Claude's; check them against the definitions on the Method page.")
w("- **Training level** (criterion 1 only): coded from summaries.")
w("- **Result** (`finding`) and **limitations** (`limits`): check numbers and wording; separate the authors' claims from ours.")
w("- **Link** (`url`): should open the paper or its publisher page, not a catalogue summary.\n")
w("## Across studies\n")
w("- [ ] Links that point to catalogue summaries (sonicfield.org), not the papers: " + ", ".join(r["id"] for r in rows if "sonicfield" in r["url"]) + ".")
w("- [ ] Studies with no coded number of participants: " + ", ".join(r["id"] for r in rows if r["include"] in ("yes", "pending") and not r["n"][:1].isdigit()) + ".")
w("- [ ] Studies with design `unknown`: " + ", ".join(r["id"] for r in rows if r["include"] in ("yes", "pending") and r["design"] == "unknown") + ".")
w("- [ ] Every claim taken from Zhang (2026): check against the cited original (two misattributed references found so far).")
w("- [ ] Image licences before the site is shared publicly (see `images/README.md`).")
w("- [ ] Demo audio licences: beyond_speech compilation, Natural cries OSF archive.")
w("- [ ] Citation details of the method references at the end of `SEARCH.md`.")
w("- [ ] Outcome types are adapted from Lam et al. (2012); check that the mapping on the Method page reads fairly.\n")
label = {"yes": "Included", "pending": "Pending decision", "background": "Background", "no": "Excluded"}
cur = None
for r in rows:
    if r["include"] != cur:
        cur = r["include"]; w(f"## {label[cur]}\n")
    w(f"### `{r['id']}` · {r['authors']} ({r['year']}). {r['title']}\n")
    w(f"Source status: **{r['status']}**" + (f" · [link]({r['url']})" if r["url"] else " · no link yet") + "\n")
    w("- [ ] Screenshot `images/" + r["id"] + ".png`")
    w(f"- [ ] Display coding: {r['displays'].replace(';', ', ')} · {r['whose_sound']} · {r['task']} · {r['timing']} · {r['attention']}")
    w(f"- [ ] User study: {r['design']} · n = {r['n'] or '?'} · compared: {r['compared'] or '—'}")
    w(f"- [ ] Procedure and measures: {r['procedure'] or '—'} / {r['measures'] or '—'} · outcome: {r['outcome'].replace(';', ', ') or '—'}")
    w(f"- [ ] Result: {r['finding']}")
    if r["limits"]:
        w(f"- [ ] Limitations: {r['limits']}")
    for f in FLAGS.get(r["id"], []):
        w(f"- [ ] **Check:** {f}")
    w("")
open(f"{ROOT}/TODO.md", "w", encoding="utf-8").write("\n".join(out))
print(len(rows), "studies;", sum(len(v) for v in FLAGS.values()), "specific checks")

# Search plan

Status, 1 Nov 2026: no structured search has been run yet. The 34 studies in `data/studies.csv` were found by purposive searching, an Elicit query, reference lists and snowballing. This file records how to search, what is missing, and what needs deciding first.

## 1. Is this a systematic review?

Not yet. A review is called systematic when it has:

1. a protocol written before searching, with question, criteria and sources (ideally registered, e.g. on OSF);
2. a documented, reproducible search: databases, exact strings, dates, hit counts;
3. screening in two stages (title/abstract, then full text) with recorded reasons for exclusion, ideally by two people;
4. a flow diagram (PRISMA);
5. a charting or extraction form applied to every included study;
6. for a full systematic review, an appraisal of risk of bias and often a meta-analysis.

Searching every criterion thoroughly does not on its own make the review systematic. Steps 1–5 do. Three options:

| Option | What it is | Fit for this review |
|---|---|---|
| **A. Conceptual review with a documented search** | Narrative synthesis; the search is reported (databases, strings), but screening and flow need not follow PRISMA. | Lightest. Fine if the contribution is the conceptual argument and the map is illustrative. |
| **B. Scoping review** | Maps the range of evidence and its gaps; no meta-analysis; quality appraisal optional. Methods: Arksey & O'Malley (2005); Levac, Colquhoun & O'Brien (2010); reporting: PRISMA-ScR (Tricco et al., 2018). | **Best fit.** The question is "what displays exist and how were they tested", across heterogeneous designs. `studies.csv` already is a charting form. Munn et al. (2018) discuss when to choose a scoping rather than a systematic review. |
| **C. Systematic review** | Focused question (e.g. does spectral feedback improve production?), risk-of-bias appraisal, often meta-analysis; reporting: PRISMA 2020 (Page et al., 2021). | Poor fit for three strands with mixed designs. Zhang (2026) already did a PRISMA review of spectral feedback in vocal learning. |

To decide with Kasia and David: A or B.

## 2. Decisions needed before searching

- [ ] Review type (A or B above).
- [ ] **Display-agnostic criteria?** Criteria 1 and 2 are defined by spectral displays, criterion 3 is not. As long as that holds, the review will find mostly spectrograms in reading and training by construction, and cannot show whether designed displays are rare. Option: define all three by setting (interpreting others' sound · feedback on one's own voice · sound access for DHH users) and accept any display computed from the acoustic signal. This also settles the pitch-display question.
- [ ] **Code the mapping?** Add columns for which acoustic feature maps to which visual variable, and the stated rationale for the mapping (convention, crossmodal correspondence, learned, user-centred design, none stated). This is what would let the review show a gap for crossmodal-correspondence-based abstract displays, rather than assert it.
- [ ] Criterion 2: include pitch displays, or keep it spectral only? Currently 5 studies are pending on this.
- [ ] Criterion 3: environmental sound stays in (current default)?
- [ ] Languages: English only, or also Chinese (CNKI) and French? Zhang (2026) searched CNKI.
- [ ] Years: no lower limit is proposed, because the 1940s–80s work is central to criterion 1.
- [ ] Grey literature: technical reports and progress reports are already included (Gabrys 1990; Greene et al. 1983). Theses too?
- [ ] Second screener: someone who screens a random 10–20 % of records so agreement can be reported (e.g. Cohen's kappa).
- [ ] Register the protocol on OSF?

## 3. Eligibility (PCC format used in scoping reviews)

- **Population**: people without training in acoustics: hearing and DHH, children and adults, learners of speech or singing, clinical groups. Expert readers only as comparison.
- **Concept**: a visual display of sound, computed from the acoustic signal (or, for criterion 3 only, driven by MIDI and designed for DHH users), **and** a user study in which people used it and something was measured.
- **Context**: any setting (lab, clinic, classroom, everyday life).
- Exclusion reasons to record at full-text stage, one per study:
  `not-visual` · `not-sound` · `symbolic-not-DHH` · `notation` · `no-user-study` · `experts-only` · `physiological-only` · `not-retrievable` · `language`.

## 4. Sources

| Criterion | Databases | Also |
|---|---|---|
| 1 · Reading | Scopus, Web of Science, PubMed, APA PsycInfo | JASA via AIP, ISCA Archive (Interspeech), ERIC and DTIC for older reports, Google Scholar for grey literature |
| 2 · Voice training | PubMed, Scopus, Web of Science, ERIC, APA PsycInfo | ASHA journals, *Journal of Voice*, *Psychology of Music*, *Music Education Research*, CALL journals for second-language pronunciation, ISCA Archive |
| 3 · DHH | ACM Digital Library (CHI, ASSETS, TACCESS, UIST, CSCW), IEEE Xplore, Scopus | PubMed for speech training of DHH learners; hand search of ASSETS proceedings |

Run each search in every database listed for that criterion. Record the date, the exact string as typed (syntax differs by database), filters and the number of hits in `search-log.csv` (to create: `date, database, criterion, string, filters, hits`).

## 5. Draft search strings

Three blocks, combined with AND. Adapt field tags per database (e.g. `TITLE-ABS-KEY()` in Scopus, `[tiab]` in PubMed).

**Display block (all criteria)**

```
(spectrogram* OR spectrograph* OR "visible speech" OR "speech visuali*" OR "sound visuali*"
 OR "audio visuali*" OR "visual display*" OR "visual representation*" OR "visual feedback"
 OR "visual-acoustic" OR "visual acoustic" OR "real-time feedback" OR LPC OR formant*)
```

**Criterion 1 · Reading**

```
AND (read* OR recogni* OR identif* OR interpret* OR discriminat* OR "spectrogram reading")
AND (speech OR vowel* OR consonant* OR phonem* OR vocali* OR voice)
```

**Criterion 2 · Voice training**

```
AND (biofeedback OR "visual feedback" OR training OR therapy OR pedagog* OR singing OR singer*
     OR pronunciation OR intonation OR "speech sound disorder*" OR rhotic OR dysphonia
     OR "gender-affirming voice" OR "voice training")
```

**Criterion 3 · DHH**

```
AND (deaf* OR "hard of hearing" OR "hard-of-hearing" OR DHH OR "hearing impair*" OR "hearing loss")
```

Optional evaluation block, if hits are too many:

```
AND (experiment* OR "user study" OR evaluat* OR participant* OR trial OR "within-subject*")
```

Test each string first: it must retrieve the known studies of that criterion in the CSV. A string that misses known studies needs more terms.

## 6. Beyond databases

- **Backward and forward snowballing** (Wohlin, 2014) from seed papers: Greene et al. 1984, Gabrys 1990, McAllister Byun 2017a, McAllister et al. 2025, Ho-Ching et al. 2003, Matthews et al. 2006, Nanayakkara et al. 2013, de Lacerda Pataca et al. 2023, Goodman et al. 2025. Use Google Scholar or Scopus "cited by". Repeat on newly included studies until no new ones appear.
- **Reference lists of reviews and overviews**: Zhang 2026 (check every reference), Lã & Fiuza 2022, Hoppe et al. 2006, Cleland & Preston 2020, Hitchcock et al. 2023, Bernstein et al. 1988, Beskow et al. 2008, Dim et al. 2022, Mohammed & Cavus 2024.
- Record how each study was found in the CSV column `found_via` (`prior`, `database`, `snowball`, `review-list`, `hand-search`). Existing studies are marked `prior`.

## 7. Screening and charting

- Collect and de-duplicate in Zotero; screen in Rayyan (free) or ASReview.
- Stage 1: title and abstract. Stage 2: full text, with one exclusion reason from §3.
- Pilot the charting form (`studies.csv`) on 5 new studies before charting the rest.
- Keep the counts for the PRISMA-ScR flow diagram: identified per source → duplicates removed → screened → excluded → full texts assessed → excluded with reasons → included.

## 8. What is missing so far

From the earlier notes (Appendix B) and the 1 Nov criterion change. These are areas not yet searched, not established gaps.

**Criterion 1 · Reading**
- Original of the Greene, Pisoni & Carrell 1983 progress report.
- Non-speech vocalizations or paralinguistic information (emotion, speaker sex, arousal) read from spectrograms by non-experts: none found.
- Non-expert reading in bioacoustics with a measure of human performance (citizen science: Whale FM, Bat Detective).
- Studies that vary rendering parameters (window length, frequency scale, dynamic range, colour map) and measure readability: only House et al. 1966 so far.
- Eye tracking on spectrograms: none found.

**Criterion 2 · Voice training**
- Singing with spectral or spectrographic displays (VoceVista-type tools): Lã & Fiuza 2022 as a lead.
- Second-language pronunciation with spectral displays. Elicit leads still to verify: Quintana-Lara 2014; Patten & Edmonds 2015 (both *Computer Assisted Language Learning*).
- Voice therapy for dysphonia; gender-affirming voice training with resonance or formant feedback.
- Parmentier et al. 2014 (spectrogram as feedback in voice therapy; possibly a French thesis); Callaghan et al. 2003 (probably descriptive).
- Direct comparisons of real-time vs. terminal (after-attempt) spectral feedback: none found.
- Kopp & Kopp (Visible Speech Translator with deaf children): original not located.

**Criterion 3 · DHH**
- Music visualizations designed for DHH users **with a user study**, now in scope after the 1 Nov change: Fourney & Fels 2009 to locate; search systematically.
- Captions carrying prosody or emotion beyond de Lacerda Pataca et al. 2023.
- Sound awareness systems after 2015 (smartwatch, smart home, AR).
- Pitch, intonation or game-based speech-training displays for DHH learners.
- Visual supplements to lipreading.
- Whether AudioViewer (Song et al. 2023) was designed for DHH users.

## References for the method

- Arksey, H., & O'Malley, L. (2005). Scoping studies: towards a methodological framework. *International Journal of Social Research Methodology*, 8(1), 19–32.
- Levac, D., Colquhoun, H., & O'Brien, K. K. (2010). Scoping studies: advancing the methodology. *Implementation Science*, 5, 69.
- Munn, Z., et al. (2018). Systematic review or scoping review? Guidance for authors when choosing between a systematic or scoping review approach. *BMC Medical Research Methodology*, 18, 143.
- Page, M. J., et al. (2021). The PRISMA 2020 statement. *BMJ*, 372, n71.
- Tricco, A. C., et al. (2018). PRISMA extension for scoping reviews (PRISMA-ScR): checklist and explanation. *Annals of Internal Medicine*, 169(7), 467–473.
- Wohlin, C. (2014). Guidelines for snowballing in systematic literature studies and a replication in software engineering. *EASE '14*.

Citation details above are from memory; check them before use (listed in `TODO.md`).

# TODO: checks against the original papers

Everything in `data/studies.csv` was coded by Claude from abstracts, summaries and our earlier notes, unless the status is `read`. Before citing a study, check its row against the original and tick the boxes here. After editing the CSV, run `python3 build.py`.

Convention in the CSV: text in `[Ours: ...]` or starting with `[Ours]` is our interpretation, not the authors'. Keep it marked or delete it.

## For every study

- **Screenshot**: save the figure that shows the display participants saw as `images/<id>.png`; fill `image_credit` (figure number, licence).
- **Display coding**: `displays`, `whose_sound`, `task`, `timing`, `attention`.
- **User study**: `design`, `n`, `compared`, `procedure`, `outcome`, `measures`. The `design` and `outcome` codes are Claude's; check them against the definitions on the Method page.
- **Training level** (criterion 1 only): coded from summaries.
- **Result** (`finding`) and **limitations** (`limits`): check numbers and wording; separate the authors' claims from ours.
- **Link** (`url`): should open the paper or its publisher page, not a catalogue summary.

## Across studies

- [ ] Links that point to catalogue summaries (sonicfield.org), not the papers: house1966, stark1973, houde1980, greene1982.
- [ ] Studies with no coded number of participants: house1966, stark1973, houde1980, greene1983, hoching2003, laukkanen2004, matthews2006, shamir2014, song2023, goodman2025, welch1984, welch2005, howard2007, fourney2009, blanco2021.
- [ ] Studies with design `unknown`: ertmer2000, howard2007, fourney2009.
- [ ] Every claim taken from Zhang (2026): check against the cited original (two misattributed references found so far).
- [ ] New columns coded by Claude on 3 Nov from our notes, not from the papers: `target_users`, `target_task`, `sound_type`, `sound_properties`, `scope`. Check each row; `cited_theory` is still empty for all.
- [ ] `untrained_interpretation` (coded by Claude on 3 Nov; only Pataca 2023 is `yes`, and that needs checking), and the display matrix codes `processing` / `encoding` in `displays.csv`.
- [ ] `cited_theory`, `mapping_rationale` and `design_rationale`: code every included study from its introduction and design section; `post_hoc_explanation` from its discussion. Pre-filled only for greene1984 (from the abstract) and gabrys1990.
- [ ] New study `aslan2025` (Speejis): coded from the arXiv abstract only; look for a peer-reviewed version.
- [ ] Theoretical lens (Method page): pilot the eight `lens_*` columns on about five studies, tighten the definitions, then code the rest; ideally a second coder for a sample. Check the references marked † (Spence 2011; Bahrick & Lickliter; O'Regan & Noë 2001; Morton 1977; Ohala 1984; Bregman 1990; Hermes 1998).
- [ ] Kristjánsson et al. (2016) for the background: "Devices should be task-focused" (abstract; conclusion point 2) and "principles discovered in one scenario may not apply to others" (p. 780). Read in full; it is about substitution for the blind.
- [ ] Image licences before the site is shared publicly (see `images/README.md`).
- [ ] Demo audio licences: beyond_speech compilation, Natural cries OSF archive.
- [ ] Citation details of the method references at the end of `SEARCH.md`.
- [ ] Outcome types are adapted from Lam et al. (2012); check that the mapping on the Method page reads fairly.

## Included

### `house1966` · House, Hughes & Goldstein (1966). Perception of visual transforms of speech stimuli: A preliminary experiment

Source status: **secondary** · [link](https://labs.sonicfield.org/library/perception-of-visual-transforms-of-speech-stimuli-a-preliminary-experiment)

- [ ] Screenshot `images/house1966.png`
- [ ] Display coding: spec · other · identify · unknown · focal
- [ ] User study: experiment · n = ? · compared: With vs. without a visual display; display size, aspect ratio, familiarity with spectrograms
- [ ] Procedure and measures: Identify words in noise. / Word intelligibility · outcome: performance
- [ ] Result: Adding a visual display of speech improved word intelligibility in noise. Varied display size, aspect ratio and familiarity. [Ours: one of the few studies on display parameters we have found.]
- [ ] Limitations: Known only from a catalogue summary.
- [ ] **Check:** Only a catalogue summary is known; find the JASA original.
- [ ] **Check:** Participants' training level and whether the display was static or real-time.
- [ ] **Check:** [Ours] 'one of the few studies on display parameters' is a claim about our search, not the paper.

### `chase1968` · Chase, Mobley & Stark (1968). Teaching new vowel sounds using real-time spectral displays

Source status: **abstract** · [link](https://files.eric.ed.gov/fulltext/ED030859.pdf)

- [ ] Screenshot `images/chase1968.png`
- [ ] Display coding: spectrum · own · produce · real-time · focal
- [ ] User study: single-group · n = 20 (10 adults, 10 children) · compared: None; change across trials
- [ ] Procedure and measures: Produce an unfamiliar vowel while matching a real-time spectral display to a template. / Vowel spectra across trials · outcome: learning
- [ ] Result: Participants learned an unfamiliar vowel by matching a real-time spectral display to a template, with marked change within the first 100 attempts, although the template showed only part of the spectrum.
- [ ] Limitations: Template showed only part of the spectrum (authors).
- [ ] **Check:** Design coded as 'single group' from the abstract; check whether there was a control condition.
- [ ] **Check:** Whether 'the template showed only part of the spectrum' is the authors' remark.

### `stark1973` · Stark (1973). Comparison of two visual display devices in speech-training of deaf adolescents

Source status: **secondary** · [link](https://labs.sonicfield.org/library/comparison-of-two-visual-display-devices-in-speech-training-of-deaf-adolescents)

- [ ] Screenshot `images/stark1973.png`
- [ ] Display coding: specrt, spectrum · own · produce · real-time · focal
- [ ] User study: experiment · n = ? · compared: Visible Speech Translator (scrolling spectrogram) vs. Lucia Spectrum Indicator
- [ ] Procedure and measures: Speech training on the word 'see'. / Production of 'see' · outcome: learning
- [ ] Result: The Visible Speech Translator (scrolling spectrogram) and the Lucia Spectrum Indicator gave the same training results.
- [ ] Limitations: Known only from a catalogue summary.
- [ ] **Check:** Only a catalogue summary is known; find the original.
- [ ] **Check:** Number of participants; training schedule.

### `houde1980` · Houde (1980). Evaluation of a spectrographic display as a speech training aid for the deaf

Source status: **secondary** · [link](https://labs.sonicfield.org/library/evaluation-of-a-spectrographic-display-as-a-speech-training-aid-for-the-deaf)

- [ ] Screenshot `images/houde1980.png`
- [ ] Display coding: specrt · own · produce · real-time · focal
- [ ] User study: experiment · n = ? · compared: Practice with a real-time spectrogram vs. training by teachers
- [ ] Procedure and measures: Children practised production with the display, including on their own. / Production accuracy vs. teacher training · outcome: learning
- [ ] Result: Practice with a real-time spectrogram was as effective as training by teachers, and even the youngest children could use it on their own.
- [ ] Limitations: Known only from a catalogue summary.
- [ ] **Check:** Only a catalogue summary is known; find the original.
- [ ] **Check:** Number of participants; how 'as effective as teachers' was measured.

### `greene1982` · Greene, Pisoni & Carrell (1982). Learning to identify visual displays of speech: A first report

Source status: **secondary** · [link](https://labs.sonicfield.org/library/learning-to-identify-visual-displays-of-speech-a-first-report)

- [ ] Screenshot `images/greene1982.png`
- [ ] Display coding: spec · other · identify · static · focal
- [ ] User study: experiment · n = 8 · compared: Trained talker vs. new male, female and synthetic talkers
- [ ] Procedure and measures: Whole-word identification training, then generalization tests. / Word identification · outcome: performance, learning
- [ ] Result: Early report of the 1984 study. The authors describe generalization to new male, female and synthetic talkers as 'relatively high'.
- [ ] Limitations: Meeting abstract; same study as Greene et al. (1984).
- [ ] **Check:** 'Relatively high' generalization is quoted from a secondary summary; find the JASA meeting abstract.

### `greene1983` · Greene, Pisoni & Carrell (1983). Identification of speech spectrograms: Comparisons of naive and trained observers

Source status: **verify** · [link](https://mpipsyl.disco.mpg.de/Record/MPIPL_cat.PL0023795/Details)

- [ ] Screenshot `images/greene1983.png`
- [ ] Display coding: spec · other · identify · static · focal
- [ ] User study: experiment · n = ? · compared: Naive observers after ~15 h whole-word training vs. observers who had taken MIT's spectrogram-reading course
- [ ] Procedure and measures: Identify phonetic segments in unfamiliar words. / Phonetic segments identified · outcome: performance
- [ ] Result: On unfamiliar words, naive observers identified 33% of phonetic segments and observers trained in spectrogram reading 40%.
- [ ] Limitations: Figures from a secondary summary.
- [ ] **Check:** 33% vs. 40% come from a secondary summary of a JASA meeting abstract.
- [ ] **Check:** [Ours] We assume the abstract and the Progress Report 9 chapter describe the same study.
- [ ] **Check:** Number of participants.

### `greene1984` · Greene, Pisoni & Carrell (1984). Recognition of speech spectrograms

Source status: **abstract** · [link](https://pubs.aip.org/asa/jasa/article-abstract/76/1/32/786636/Recognition-of-speech-spectrogramsSpectrogram)

- [ ] Screenshot `images/greene1984.png`
- [ ] Display coding: spec · other · identify · static · focal
- [ ] User study: experiment · n = 8 · compared: Trained words vs. new tokens, new male and female talkers, synthetic speech
- [ ] Procedure and measures: ~20 h of training to identify 50 words from spectrograms, then generalization tests; verbal protocols. / Word identification; verbal protocols · outcome: performance, learning
- [ ] Result: Over 95% correct on the 50 trained words. New tokens of the same talker 91%, new male and female talkers 76%, synthetic speech 48%. Observers relied on visual correlates of phonetic features.
- [ ] Limitations: [Ours] Closed set of 50 words; few talkers.
- [ ] **Check:** [Ours] limits: 'closed set of 50 words; few talkers'.
- [ ] **Check:** Check that the 'verbal protocols' and 'visual correlates of phonetic features' wording matches the paper.

### `gabrys1990` · Gabrys (1990). Difficulty in learning to read speech spectrograms: The role of visual segmentation

Source status: **read** · [link](https://apps.dtic.mil/sti/pdfs/ADA218827.pdf)

- [ ] Screenshot `images/gabrys1990.png`
- [ ] Display coding: pseudo · other · identify · static · focal
- [ ] User study: experiment · n = 58 (Exp. 1: 10; Exp. 2: 48) + a salience-rating group · compared: Cue type (several cues vs. one; within one visual object vs. across two), instructions, cue salience
- [ ] Procedure and measures: Learn to classify synthetic pseudo-spectrograms of CVC syllables by trial and feedback until a criterion; a separate group circled the regions they found salient. / Trials to criterion; circling of salient regions · outcome: learning
- [ ] Result: 9/10 learned /b/–/p/, 6/10 /t/–/k/, only 2/10 /d/–/g/, whose cue sits in the next vowel's formants. A separate group circled 'important parts': vowel formants 98%, consonant formants 76%. Proposes a within-object search bias.
- [ ] Limitations: Pseudo-spectrograms, not real speech; weak instruction manipulation (author).
- [ ] **Check:** Size of the separate salience-rating group.
- [ ] **Check:** The 98% / 76% circling figures and blocks-to-criterion numbers.

### `ertmer1996` · Ertmer, Stark & Karlan (to verify) (1996). Real-time spectrographic displays in vowel production training with children who have profound hearing loss

Source status: **abstract** · [link](https://pubs.asha.org/doi/abs/10.1044/1058-0360.0504.04)

- [ ] Screenshot `images/ertmer1996.png`
- [ ] Display coding: specrt · own · produce · real-time · focal
- [ ] User study: single-case · n = 2 · compared: Baseline vs. spectrographic training
- [ ] Procedure and measures: Vowel production training with a real-time spectrogram; probes on untrained words. / Listener judgments of vowels · outcome: learning
- [ ] Result: Vowel accuracy improved once spectrographic training started, with some transfer to untrained words.
- [ ] **Check:** Authors (Ertmer, Stark & Karlan?).
- [ ] **Check:** Transfer to untrained words: size of the effect.

### `ertmer2000` · Ertmer & Maki (2000). A comparison of speech training methods with deaf adolescents: Spectrographic versus noninstrumental instruction

Source status: **abstract** · [link](https://pubs.asha.org/doi/10.1044/jslhr.4306.1509)

- [ ] Screenshot `images/ertmer2000.png`
- [ ] Display coding: specrt · own · produce · real-time · focal
- [ ] User study: unknown · n = 4 · compared: Spectrographic vs. noninstrumental instruction
- [ ] Procedure and measures: Speech production training with both methods. / Listener judgments; maintenance; generalization · outcome: learning
- [ ] Result: Both spectrographic and traditional instruction improved production quickly; two participants generalized better with the spectrographic display.
- [ ] Limitations: Design type to verify.
- [ ] **Check:** Design type (coded 'unknown'): alternating treatments? multiple baseline?

### `hoching2003` · Ho-Ching, Mankoff & Landay (2003). Can you see what I hear? The design and evaluation of a peripheral sound display for the deaf

Source status: **abstract** · [link](https://dl.acm.org/doi/10.1145/642611.642641)

- [ ] Screenshot `images/hoching2003.png`
- [ ] Display coding: spec, ripple · other · detect · real-time · peripheral
- [ ] User study: experiment · n = ? · compared: Spectrograph vs. positional ripples
- [ ] Procedure and measures: Deaf participants identified sounds with each display and reported preference. / Identification; preference; distraction · outcome: performance, preference
- [ ] Result: Compared a spectrograph with positional ripples. Participants preferred the display without pitch that showed location, and found it easier to monitor.
- [ ] **Check:** Number of participants; whether 'easier to monitor' is a measured result or participants' comments.
- [ ] **Check:** Design coded as 'experiment'; check.

### `jslhr2004` · Authors to verify (possibly Ertmer) (2004). How well can children recognize speech features in spectrograms? Comparisons by age and hearing status

Source status: **abstract** · [link](https://pubs.asha.org/doi/10.1044/1092-4388(2004/038))

- [ ] Screenshot `images/jslhr2004.png`
- [ ] Display coding: spec · other · match · static · focal
- [ ] User study: experiment · n = 60 (30 with hearing loss) · compared: Age group; hearing status; contrast type (formant vs. consonant manner)
- [ ] Procedure and measures: Brief familiarization with spectrographic cues, then pick which of three spectrograms matches a model. / 3-alternative matching accuracy · outcome: performance
- [ ] Result: After brief familiarization, children picked the matching spectrogram out of three above chance. Formant contrasts were easier than consonant-manner contrasts; hearing status made no difference.
- [ ] Limitations: [Ours] Matching, not identification.
- [ ] **Check:** Authors (possibly Ertmer).
- [ ] **Check:** [Ours] limits: 'matching, not identification'.

### `laukkanen2004` · Laukkanen et al. (2004). Effects of two-month vocal exercising with and without spectral biofeedback on student actors' speaking voice

Source status: **verify** · [link](https://www.researchgate.net/publication/8449799_Effects_of_two-month_vocal_exercising_with_and_without_spectral_biofeedback_on_student_actors'_speaking_voice)

- [ ] Screenshot `images/laukkanen2004.png`
- [ ] Display coding: spectrum · own · produce · real-time · focal
- [ ] User study: experiment · n = ? · compared: Two months of vocal exercise with vs. without spectral biofeedback
- [ ] Procedure and measures: Speaking-voice exercises. / Acoustic voice-quality measures · outcome: learning
- [ ] Result: Only the title is confirmed. Reported elsewhere: voice quality improved in both groups, a little more on one measure with feedback, and watching the display may encourage excess vocal effort.
- [ ] Limitations: Only the title is verified.
- [ ] **Check:** Everything except the title comes from an Elicit summary: design, n, displays, results, the 'excess vocal effort' caution.

### `matthews2006` · Matthews, Fong, Ho-Ching & Mankoff (2006). Evaluating non-speech sound visualizations for the deaf

Source status: **read** · [link](https://kilthub.cmu.edu/articles/journal_contribution/Evaluating_Non-Speech_Sound_Visualizations_for_the_Deaf/6470051)

- [ ] Screenshot `images/matthews2006.png`
- [ ] Display coding: icon, spec · other · detect · real-time · peripheral
- [ ] User study: mixed · n = ? · compared: Several visualizations, from spectrograph to icons
- [ ] Procedure and measures: Interviews and evaluation of design alternatives with deaf participants. / Preference; interviews · outcome: preference, practice
- [ ] Result: Icon-only was liked most; spectrograms were called distracting and noisy. Some participants wanted to interact with the spectrogram by producing sounds, and it drew attention well when a loud sound occurred.
- [ ] **Check:** Number of participants; whether it is the same study as the 2005 ASSETS paper.
- [ ] **Check:** Details on interaction and loud sounds come from your own reading; check page numbers.

### `nanayakkara2013` · Nanayakkara, Wyse, Ong & Taylor (2013). Enhancing musical experience for the hearing-impaired using visual and haptic displays

Source status: **read** · [link](https://doi.org/10.1080/07370024.2012.697006)

- [ ] Screenshot `images/nanayakkara2013.png`
- [ ] Display coding: midi · other · rate · real-time · focal
- [ ] User study: experiment · n = 43 (28 partially, 15 profoundly deaf) · compared: Within subjects: music only / + visuals / + Haptic Chair / + both; later synchronized vs. asynchronous gesture videos
- [ ] Procedure and measures: Three 1-minute MIDI pieces per condition; 3-week follow-up with 6 participants. / Flow State Scale (6 items); preference ranking; observable flow indicators; USE satisfaction questionnaire · outcome: experience, preference
- [ ] Result: The Haptic Chair dominated; visuals beat music alone, but no one chose visuals alone. Abstract particles had limited effect; synchronized human gestures beat asynchronous ones.
- [ ] Limitations: The authors note that musical experience is more than flow. [Ours: 1-minute trials; participants knew the study's purpose; no measure of what the visuals conveyed; reported df suggest ratings were treated as independent rather than repeated measures, to check.]
- [ ] **Check:** [Ours] limits: 1-minute trials, knowledge of purpose, no information measure, df reading. Recheck the F(2, 504) and p values before citing.
- [ ] **Check:** 'Haptic Chair dominated' is our summary of the preference and flow results.

### `shamir2014` · Shamir et al. (2014). Classification of large acoustic datasets using machine learning and crowdsourcing: Application to whale calls

Source status: **abstract** · [link](https://people.cs.ksu.edu/~lshamir/publications/JASA_vol_135_iss_2_953_1.pdf)

- [ ] Screenshot `images/shamir2014.png`
- [ ] Display coding: spec · other · match · static · focal
- [ ] User study: crowdsourcing · n = ? · compared: Crowd similarity judgments vs. machine-learning clustering
- [ ] Procedure and measures: Whale FM volunteers heard and saw whale calls and picked similar ones. / Similarity judgments vs. machine clustering · outcome: performance
- [ ] Result: Volunteers matched whale calls using spectrograms together with audio. Their judgments recovered geographic and subspecies groupings, less accurately than machine learning.
- [ ] Limitations: [Ours] Audio and spectrogram together, not vision alone.
- [ ] **Check:** Number of volunteers; training given to them.
- [ ] **Check:** [Ours] limits: audio and spectrogram together.

### `jain2015` · Jain et al. (2015). Head-mounted display visualizations to support sound awareness for the deaf and hard of hearing

Source status: **abstract** · [link](https://www.media.mit.edu/publications/head-mounted-display-visualizations-to-support-sound-awareness-for-the-deaf-and-hard-of-hearing/)

- [ ] Screenshot `images/jain2015.png`
- [ ] Display coding: ripple · other · detect · real-time · peripheral
- [ ] User study: mixed · n = 24 + 4 · compared: Design alternatives for showing sound on a head-mounted display
- [ ] Procedure and measures: Formative study with design probes, then a prototype test. / Design feedback; prototype use · outcome: preference, practice
- [ ] Result: Head-mounted display designs centred on where a sound comes from.
- [ ] **Check:** '24 + 4' participants; which part was formative and which a prototype test.

### `byun2016` · McAllister Byun & Campbell (2016). Differential effects of visual-acoustic biofeedback intervention for residual speech errors

Source status: **abstract** · [link](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2016.00567/pdf)

- [ ] Screenshot `images/byun2016.png`
- [ ] Display coding: spectrum · own · produce · real-time · focal
- [ ] User study: single-case · n = 11 · compared: Biofeedback (LPC spectrum + template) vs. traditional articulatory treatment; order counterbalanced
- [ ] Procedure and measures: 10 sessions of each treatment (crossover). / Perceptual accuracy; crossover by order · outcome: learning
- [ ] Result: No overall difference from traditional treatment, but a condition × order interaction: biofeedback looked more effective in the first phase. [Ours: the display may help most while a new target is being acquired.]
- [ ] **Check:** [Ours] in the result: 'the display may help most while a new target is being acquired'.

### `byun2017a` · McAllister Byun (2017). Efficacy of visual–acoustic biofeedback intervention for residual rhotic errors: A single-subject randomization study

Source status: **abstract** · [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC5755545)

- [ ] Screenshot `images/byun2017a.png`
- [ ] Display coding: spectrum · own · produce · real-time · focal
- [ ] User study: single-case · n = 7 · compared: Biofeedback vs. traditional sessions in randomized alternation
- [ ] Procedure and measures: 20 sessions over 10 weeks. / Perceptual accuracy; randomization tests · outcome: learning
- [ ] Result: Four of seven responded to treatment; for three, gains within a session were larger with biofeedback than with verbal cues.
- [ ] Limitations: Children whose errors earlier treatment had not fixed.
- [ ] **Check:** Display: Sona-Match (Computerized Speech Lab), LPC with template; check.
- [ ] **Check:** 'Four of seven responded' and 'larger within-session gains for three'.

### `byun2017b` · McAllister Byun, Campbell, Carey, Liang, Park & Svirsky (2017). Enhancing intervention for residual rhotic errors via app-delivered biofeedback: A case study

Source status: **abstract** · [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC5544407)

- [ ] Screenshot `images/byun2017b.png`
- [ ] Display coding: spectrum · own · produce · real-time · focal
- [ ] User study: case-study · n = 1 · compared: Accuracy with the display vs. probes without it
- [ ] Procedure and measures: App-delivered LPC biofeedback with an adjustable F3 target. / Accuracy in treatment; probes without feedback · outcome: learning
- [ ] Result: staRt app (LPC curve + adjustable F3 target). Accuracy during treatment rose from 1% to 73%, but the gain did not carry over to words produced without the display.
- [ ] Limitations: One participant.
- [ ] **Check:** 1% → 73% figures; that probes without the display showed no gain.

### `song2023` · Song, Zhang, Peng, Mohaghegh, Wandt & Rhodin (2023). AudioViewer: Learning to visualize sounds

Source status: **abstract** · [link](https://openaccess.thecvf.com/content/WACV2023/html/Song_AudioViewer_Learning_To_Visualize_Sounds_WACV_2023_paper.html)

- [ ] Screenshot `images/song2023.png`
- [ ] Display coding: learned, spec · other · match · static · focal
- [ ] User study: experiment · n = ? · compared: Mel-spectrogram vs. AudioViewer faces or digits
- [ ] Procedure and measures: Match and group sounds from their visual representation. / Matching and grouping accuracy · outcome: performance
- [ ] Result: Same sounds, two pictures: 65.5% with mel-spectrograms vs. 87.9% with generated faces (matching task).
- [ ] **Check:** Number of participants; training; whether AudioViewer targets DHH users (would add criterion 3).

### `pataca2023` · de Lacerda Pataca, Watkins, Peiris, Lee & Huenerfauth (2023). Visualization of speech prosody and emotion in captions

Source status: **abstract** · [link](https://digitalcommons.njit.edu/fac_pubs/1776)

- [ ] Screenshot `images/pataca2023.png`
- [ ] Display coding: caption · other · identify · real-time · focal
- [ ] User study: experiment · n = 16 · compared: Caption designs with and without prosody or emotion
- [ ] Procedure and measures: Watch captioned videos; answer questions about emphasis and emotion; rate legibility and preference. / Emotion/emphasis understanding; legibility; preference · outcome: performance, preference
- [ ] Result: Captions carrying emotion conveyed emphasis and emotional content best, with only a modest cost in legibility. Visualizes extracted features, not spectrograms.
- [ ] **Check:** Caption conditions compared (coded 'with and without prosody or emotion'); procedure.

### `mcallister2025` · McAllister, Preston, Benway, Hill, Lara, Leece, Liang & Hitchcock (2025). Rhotic acquisition is more rapid in biofeedback than motor-based treatment for residual speech sound disorder

Source status: **abstract** · [link](https://pubs.asha.org/doi/10.1044/2025_JSLHR-24-00909)

- [ ] Screenshot `images/mcallister2025.png`
- [ ] Display coding: spectrum, ultra · own · produce · real-time · focal
- [ ] User study: rct · n = 108 · compared: Biofeedback (visual-acoustic or ultrasound) vs. motor-based treatment
- [ ] Procedure and measures: Treatment sessions; primary outcome over the first three sessions. / F3–F2 distance across sessions · outcome: learning
- [ ] Result: Biofeedback produced faster progress than motor-based treatment. No significant difference between the acoustic display and the ultrasound display of the tongue.
- [ ] Limitations: Preregistered.
- [ ] **Check:** Arms: were visual-acoustic and ultrasound separate arms or pooled against motor-based treatment?
- [ ] **Check:** Primary outcome wording (F3–F2 over the first three sessions).

### `goodman2025` · Goodman, Froehlich, McDonnell & Findlater (2025). SPECTRA: Personalizable sound recognition for DHH users through interactive machine learning

Source status: **read** · [link](https://dl.acm.org/doi/10.1145/3706598.3713294)

- [ ] Screenshot `images/goodman2025.png`
- [ ] Display coding: spec, wave, icon · other · rate · static · focal
- [ ] User study: mixed · n = ? · compared: Representations for inspecting sounds (spectrogram, waveform, others)
- [ ] Procedure and measures: Train a personal sound recognizer; rate representations; interviews. / Ratings; interviews · outcome: preference, practice
- [ ] Result: Spectrograms rated 5.1/7 vs. waveforms 6.7/7. 'I don't identify things in my life really based on frequency as much as I do based on loudness.'
- [ ] **Check:** Number of participants; which representations were compared besides spectrogram and waveform.

## Pending decision

### `welch1984` · Welch (1984). Real-time visual feedback without knowledge of results (cited in Blanco et al., 2021)

Source status: **verify** · [link](https://frontiersin.org/articles/10.3389/fpsyg.2021.684693/full)

- [ ] Screenshot `images/welch1984.png`
- [ ] Display coding: pitch · own · produce · real-time · focal
- [ ] User study: experiment · n = ? · compared: Real-time visual feedback with vs. without knowledge of results
- [ ] Procedure and measures: Pitch matching. / Pitch matching · outcome: learning
- [ ] Result: Real-time visual feedback without knowledge of results did not improve pitch matching.
- [ ] Limitations: Known only through Blanco et al. (2021).
- [ ] **Check:** Known only through Blanco et al. (2021); find the original (1984 or 1989?).

### `welch2005` · Welch, Howard, Himonides & Brereton (2005). Real-time feedback in the singing studio: an innovatory action-research project using new voice technology

Source status: **verify** · [link](https://doi.org/10.1080/14613800500169779)

- [ ] Screenshot `images/welch2005.png`
- [ ] Display coding: pitch, specrt · own · produce · real-time · focal
- [ ] User study: qualitative · n = ? · compared: —
- [ ] Procedure and measures: Action research with singing teachers and students using real-time displays. / Action research; qualitative · outcome: practice
- [ ] Result: VOXed project: real-time displays in singing lessons. Which displays were used (pitch, spectrogram, others) is to verify.
- [ ] **Check:** Which displays were used (pitch, spectrogram, others).
- [ ] **Check:** Number and type of participants.

### `howard2007` · Howard, Welch et al. (2007). Are real-time displays of benefit in the singing studio? An exploratory study

Source status: **verify** · no link yet

- [ ] Screenshot `images/howard2007.png`
- [ ] Display coding: specrt · own · produce · real-time · focal
- [ ] User study: unknown · n = ? · compared: —
- [ ] Procedure and measures: — / to verify · outcome: —
- [ ] Result: Exploratory study of real-time displays in singing lessons. Design and displays not yet read.
- [ ] Limitations: Not yet read.
- [ ] **Check:** Authors, year, venue and link are all unverified. Find the paper first.

### `fourney2009` · Fourney & Fels (2009). Creating access to music through visualization

Source status: **verify** · no link yet

- [ ] Screenshot `images/fourney2009.png`
- [ ] Display coding: midi · other · unknown · unknown · unknown
- [ ] User study: unknown · n = ? · compared: —
- [ ] Procedure and measures: — / — · outcome: —
- [ ] Result: Music visualizations for DHH audiences. Original not yet located.
- [ ] **Check:** Locate the paper: venue, year, whether there is a user study with DHH participants.

### `paney2021` · Paney & Tharp (2021). The effect of concurrent visual feedback on adult singing accuracy

Source status: **verify** · [link](https://doi.org/10.1177/0305735619854534)

- [ ] Screenshot `images/paney2021.png`
- [ ] Display coding: pitch · own · produce · real-time · focal
- [ ] User study: experiment · n = 48 (per Zhang 2026) · compared: Concurrent visual feedback vs. none; acquisition and retention (per Zhang 2026)
- [ ] Procedure and measures: Sing target pitches. / Pitch accuracy; self-efficacy · outcome: learning, experience
- [ ] Result: Concurrent pitch feedback; Zhang (2026) reports better accuracy during training and a drop once feedback was removed. Not yet read.
- [ ] Limitations: Not yet read.
- [ ] **Check:** Everything comes from Zhang (2026), which misattributes other references. Read the original.

### `blanco2021` · Blanco, Tassani & Ramirez (2021). Real-time visual feedback for pitch matching

Source status: **abstract** · [link](https://frontiersin.org/articles/10.3389/fpsyg.2021.684693/full)

- [ ] Screenshot `images/blanco2021.png`
- [ ] Display coding: pitch · own · produce · real-time · focal
- [ ] User study: experiment · n = ? · compared: Real-time visual pitch feedback vs. comparison condition(s) (to verify)
- [ ] Procedure and measures: Pitch-matching training, then transfer tests. / Pitch-matching accuracy; transfer · outcome: learning
- [ ] Result: A real-time pitch display improved pitch matching, and the gain was retained in transfer tests.
- [ ] **Check:** What the comparison condition(s) were (an auditory aid? no feedback?); n.
- [ ] **Check:** Zhang (2026) cites this DOI under different authors.

### `berglin2022` · Berglin, Pfordresher & Demorest (2022). The effect of visual and auditory feedback on adult poor-pitch remediation

Source status: **verify** · [link](https://journals.sagepub.com/doi/10.1177/03057356211026730)

- [ ] Screenshot `images/berglin2022.png`
- [ ] Display coding: pitch · own · produce · real-time · focal
- [ ] User study: experiment · n = 60 (per Zhang 2026) · compared: Visual vs. auditory feedback
- [ ] Procedure and measures: Remediation training for poor-pitch singers. / Pitch accuracy (SSAP) · outcome: learning
- [ ] Result: Visual vs. auditory feedback for poor-pitch singers. Not yet read.
- [ ] Limitations: Not yet read.
- [ ] **Check:** Everything comes from Zhang (2026). Read the original.

## Background

### `potter1947` · Potter, Kopp & Green (1947). Visible Speech

Source status: **abstract** · [link](https://catalogue.nli.ie/Record/vtls000407677)

- [ ] Screenshot `images/potter1947.png`
- [ ] Display coding: spec, specrt · other · identify · static · focal
- [ ] User study: unknown · n = ? · compared: —
- [ ] Procedure and measures: Readers learned to read speech from the sound spectrograph (details to verify). / to verify · outcome: —
- [ ] Result: Bell Labs' programme to let deaf people 'see' speech with the sound spectrograph. Historical background; readers were taught phonetic rules, so it does not meet the training rule.
- [ ] Limitations: Readers were taught phonetic principles.
- [ ] **Check:** Who the readers were, what they were trained on, how reading was measured: all unknown in our notes.

## Excluded

### `zinovyeva1987` · Zinovyeva (1987). Spectrogram reading and expert methods for acoustic-phonetic speech signal decoding

Source status: **read** · [link](https://www.coli.uni-saarland.de/Phonetics/icphs/ICPhS1987/11_ICPhS_1987_Vol_1/p11.1_112.pdf)

- [ ] Screenshot `images/zinovyeva1987.png`
- [ ] Display coding: spec · other · identify · static · focal
- [ ] User study: unknown · n = ? · compared: Isolated words vs. connected speech
- [ ] Procedure and measures: Expert decoding of speech from spectrograms. / Segments correct · outcome: performance
- [ ] Result: About 87% of segments correct for isolated words, 83% for connected speech; accuracy 'practically does not depend on speaker's voice quality'.
- [ ] **Check:** Excluded (experts). Check only if cited as comparison.

### `lamel1988` · Lamel (1988). Formalizing knowledge used in spectrogram reading: Acoustic and perceptual evidence from stops

Source status: **read** · [link](https://apps.dtic.mil/sti/tr/pdf/ADA206826.pdf)

- [ ] Screenshot `images/lamel1988.png`
- [ ] Display coding: spec · other · identify · static · focal
- [ ] User study: experiment · n = 5 readers · compared: Readers vs. listeners
- [ ] Procedure and measures: Identify stop consonants from spectrograms of 299 talkers. / Stop identification · outcome: performance
- [ ] Result: Readers identified stop consonants from 299 talkers at 73–82%, about 10 points below listeners, using explicit rules.
- [ ] **Check:** Excluded (experts). Check only if cited as comparison.

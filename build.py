#!/usr/bin/env python3
"""Convert data/*.csv into data/data.js and check the coding.

Run after every edit to the CSV files:

    python3 build.py

The pages read data/data.js (not the CSV files directly) so that the site
also works when opened straight from the folder (file://), where browsers
block fetch() of local files. No packages beyond the standard library.
"""
import csv
import datetime
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")

# Allowed values for the coded columns. Add a value here before using it in the CSV.
VOCAB = {
    "include": {"yes", "pending", "background", "no"},
    "criteria": {"1", "2", "3"},
    "whose_sound": {"own", "other", "both", "unknown"},
    "task": {"identify", "match", "detect", "produce", "rate", "unknown"},
    "timing": {"static", "real-time", "after-attempt", "unknown"},
    "attention": {"focal", "peripheral", "unknown"},
    "dhh": {"yes", "no", "mixed", "unknown"},
    "status": {"read", "abstract", "secondary", "verify"},
    "sound_type": {"speech", "singing", "nonverbal-vocal", "environmental", "music", "animal"},
    "cited_theory": {"sensory-substitution", "crossmodal-correspondence", "amodal-perception", "sensorimotor", "augmentation", "embodiment", "motor-learning", "biofeedback", "user-centred-design", "other", "none-stated"},
    "mapping_rationale": {"crossmodal-correspondence", "amodal", "sensorimotor", "convention", "learned", "none-stated"},
    "untrained_interpretation": {"yes", "no", "unknown"},
    "lens_scale": {"perceptual", "physical", "mixed", "not-applicable"},
    "lens_time": {"in-time", "time-as-space", "no-time"},
    "lens_amodal": {"synchrony", "rhythm", "tempo", "intensity", "none"},
    "lens_loop": {"closed", "exploratory", "open"},
    "lens_level": {"acoustic", "perceptual", "functional"},
    "lens_function_route": {"label", "form", "not-applicable"},
    "lens_objects": {"yes", "partly", "no"},
    "processing": {"signal", "feature", "inferred", "learned", "symbolic", "physiological"},
    "encoding": {"plot", "abstract", "symbol", "none"},
    "scope": {"general", "task-specific", "both", "unknown"},
    "found_via": {"prior", "database", "snowball", "review-list", "hand-search"},
    "outcome": {"performance", "learning", "preference", "experience", "practice"},
    "design": {"rct", "experiment", "single-case", "case-study", "single-group", "crowdsourcing", "mixed", "qualitative", "unknown"},
}
DISPLAY_COLS = {"processing", "encoding"}
LIST_COLS = {"criteria", "displays", "outcome", "sound_type", "cited_theory", "mapping_rationale", "lens_amodal", "lens_level"}


def read(name):
    with open(os.path.join(DATA, name), newline="", encoding="utf-8") as fh:
        return [{k: (v or "").strip() for k, v in row.items()} for row in csv.DictReader(fh)]


def main():
    displays = read("displays.csv")
    studies = read("studies.csv")
    display_ids = {d["id"] for d in displays}
    errors, seen = [], set()

    for d in displays:
        d["rank"] = int(d["rank"] or 0)
        for col in ("processing", "encoding"):
            if d.get(col) not in VOCAB[col]:
                errors.append(f"displays.csv ({d['id']}): {col} = '{d.get(col)}'")

    for i, s in enumerate(studies, start=2):  # row 1 is the header
        where = f"studies.csv row {i} ({s.get('id') or '?'})"
        if not s["id"]:
            errors.append(f"{where}: empty id")
        elif s["id"] in seen:
            errors.append(f"{where}: duplicate id")
        seen.add(s["id"])
        for col in LIST_COLS:
            s[col] = [v.strip() for v in s[col].split(";") if v.strip()]
        for col, allowed in VOCAB.items():
            if col in DISPLAY_COLS:
                continue
            values = s[col] if col in LIST_COLS else ([s[col]] if s[col] else [])
            for v in values:
                if v not in allowed:
                    errors.append(f"{where}: {col} = '{v}' (allowed: {', '.join(sorted(allowed))})")
        for d in s["displays"]:
            if d not in display_ids:
                errors.append(f"{where}: display '{d}' is not in displays.csv")
        if s["include"] in ("yes", "pending") and not s["design"]:
            errors.append(f"{where}: included studies need a design (use 'unknown' if not known yet)")
        if s["include"] == "no" and not s["exclude_reason"]:
            errors.append(f"{where}: include = no needs an exclude_reason")
        try:
            s["year"] = int(s["year"])
        except ValueError:
            errors.append(f"{where}: year '{s['year']}' is not a number")
        if not s["image"]:
            s["image"] = f"images/{s['id']}.png"

    if errors:
        print("Not built. Fix these first:\n  " + "\n  ".join(errors))
        sys.exit(1)

    studies.sort(key=lambda s: (s["year"], s["id"]))
    stamp = datetime.date.today().isoformat()
    out = os.path.join(DATA, "data.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("// Generated by build.py from data/*.csv. Do not edit by hand.\n")
        fh.write(f"window.BUILT = {json.dumps(stamp)};\n")
        fh.write("window.DISPLAYS = " + json.dumps(displays, ensure_ascii=False, indent=1) + ";\n")
        fh.write("window.STUDIES = " + json.dumps(studies, ensure_ascii=False, indent=1) + ";\n")

    counts = {k: sum(1 for s in studies if s["include"] == k) for k in VOCAB["include"]}
    have_img = sum(1 for s in studies if os.path.exists(os.path.join(ROOT, s["image"])))
    print(f"Built data/data.js: {len(studies)} studies "
          f"({', '.join(f'{v} {k}' for k, v in sorted(counts.items()))}), {len(displays)} displays.")
    print(f"Screenshots found: {have_img}/{len(studies)} (missing ones show a schematic).")


if __name__ == "__main__":
    main()

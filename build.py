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
    "access": {"substitution", "augmentation", "situational", "unknown"},
    "claims_intuitive": {"yes", "no"},
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
# Allowed values in references.csv and claims.csv.
REF_VOCAB = {
    "meta_status": {"verified", "partly", "unverified"},
    "ref_type": {"article", "inproceedings", "incollection", "book", "report", "thesis", "misc"},
    "claim_kind": {"source", "ours"},
    "claim_status": {"checked-online", "checked-fulltext", "to-check", "ours", "wrong"},
    "check_status": {"open", "done", "problem"},
}
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

    refs, claims = check_references(errors)
    checks = check_checks(errors, {s["id"] for s in studies})

    if errors:
        print("Not built. Fix these first:\n  " + "\n  ".join(errors))
        sys.exit(1)

    studies.sort(key=lambda s: (s["year"], s["id"]))
    stamp = datetime.date.today().isoformat()
    out = os.path.join(DATA, "data.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("// Generated by build.py from data/*.csv. Do not edit by hand.\n")
        fh.write(f"window.BUILT = {json.dumps(stamp)};\n")
        fh.write("window.BUILT_AT = " + json.dumps(datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")) + ";\n")
        fh.write("window.DISPLAYS = " + json.dumps(displays, ensure_ascii=False, indent=1) + ";\n")
        fh.write("window.STUDIES = " + json.dumps(studies, ensure_ascii=False, indent=1) + ";\n")
        fh.write("window.REFERENCES = " + json.dumps(refs, ensure_ascii=False, indent=1) + ";\n")
        fh.write("window.CLAIMS = " + json.dumps(claims, ensure_ascii=False, indent=1) + ";\n")
        fh.write("window.CHECKS = " + json.dumps(checks, ensure_ascii=False, indent=1) + ";\n")
    write_bib(refs)

    counts = {k: sum(1 for s in studies if s["include"] == k) for k in VOCAB["include"]}
    have_img = sum(1 for s in studies if os.path.exists(os.path.join(ROOT, s["image"])))
    print(f"Built data/data.js: {len(studies)} studies "
          f"({', '.join(f'{v} {k}' for k, v in sorted(counts.items()))}), {len(displays)} displays.")
    print(f"Screenshots found: {have_img}/{len(studies)} (missing ones show a schematic).")
    todo = sum(1 for c in claims if c["status"] == "to-check")
    print(f"References: {len(refs)} ({sum(r['meta_status'] == 'verified' for r in refs)} with verified details); "
          f"claims: {len(claims)}, {todo} still to check. Wrote data/references.bib.")
    print(f"Checks: {sum(c['status'] == 'open' for c in checks)} open, "
          f"{sum(c['status'] == 'problem' for c in checks)} with a problem, {sum(c['status'] == 'done' for c in checks)} done.")


def check_checks(errors, study_ids):
    """Manual checks (checks.csv), edited on verify.html. target is a study id or 'general'."""
    checks = read("checks.csv")
    seen = set()
    for i, c in enumerate(checks, start=2):
        where = f"checks.csv row {i} ({c.get('id') or '?'})"
        if not c["id"] or c["id"] in seen:
            errors.append(f"{where}: empty or duplicate id")
        seen.add(c["id"])
        if c["target"] != "general" and c["target"] not in study_ids:
            errors.append(f"{where}: target '{c['target']}' is not a study id")
        if c["status"] not in REF_VOCAB["check_status"]:
            errors.append(f"{where}: status = '{c['status']}'")
    return checks


def check_references(errors):
    """Read references.csv and claims.csv; claims point to references by id."""
    refs = read("references.csv")
    claims = read("claims.csv")
    ids = set()
    for i, r in enumerate(refs, start=2):
        where = f"references.csv row {i} ({r.get('id') or '?'})"
        if not r["id"] or r["id"] in ids:
            errors.append(f"{where}: empty or duplicate id")
        ids.add(r["id"])
        if r["type"] not in REF_VOCAB["ref_type"]:
            errors.append(f"{where}: type = '{r['type']}'")
        if r["meta_status"] not in REF_VOCAB["meta_status"]:
            errors.append(f"{where}: meta_status = '{r['meta_status']}'")
    claim_ids = set()
    for i, c in enumerate(claims, start=2):
        where = f"claims.csv row {i}"
        if not c["id"] or c["id"] in claim_ids:
            errors.append(f"{where}: empty or duplicate id")
        claim_ids.add(c["id"])
        if c["ref"] not in ids:
            errors.append(f"{where}: ref '{c['ref']}' is not in references.csv")
        if c["kind"] not in REF_VOCAB["claim_kind"]:
            errors.append(f"{where}: kind = '{c['kind']}'")
        if c["status"] not in REF_VOCAB["claim_status"]:
            errors.append(f"{where}: status = '{c['status']}'")
    return refs, claims


def write_bib(refs):
    """BibTeX for importing into Zotero (File > Import). Keys are the ids in references.csv."""
    def esc(v):
        return v.replace("{", "\\{").replace("}", "\\}").replace("&", "\\&").replace("–", "--")
    field_for_venue = {"article": "journal", "inproceedings": "booktitle", "incollection": "booktitle"}
    out = ["% Generated by build.py from data/references.csv. Import into Zotero; do not edit by hand.\n"]
    for r in refs:
        f = {
            "author": " and ".join(a.strip() for a in r["authors"].split(";") if a.strip() and a.strip() != "et al."),
            "title": r["title"],
            "year": r["year"],
            field_for_venue.get(r["type"], "howpublished"): r["venue"],
            "volume": r["volume"], "number": r["issue"], "pages": r["pages"],
            "publisher": r["publisher"], "doi": r["doi"], "url": r["url"],
            "note": f"Details: {r['meta_status']} ({r['meta_source']})",
        }
        body = ",\n".join(f"  {k} = {{{{{esc(v)}}}}}" if k == "title" else f"  {k} = {{{esc(v)}}}" for k, v in f.items() if v)
        out.append(f"@{r['type']}{{{r['id']},\n{body}\n}}\n")
    with open(os.path.join(DATA, "references.bib"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))


if __name__ == "__main__":
    main()

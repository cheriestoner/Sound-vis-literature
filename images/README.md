# Screenshots

One figure per study, named after the study's `id` in `data/studies.csv`:

    images/greene1984.png
    images/byun2017b.png

- PNG or JPG. For a JPG, write its path in the `image` column of the CSV (e.g. `images/greene1984.jpg`); an empty `image` column means `images/<id>.png`.
- About 1000 × 600 px is enough. The site crops to 5:3 in the small tiles and shows the whole image in the detail panel.
- Choose the figure that shows the **display participants saw**, not a results chart.
- Note where it came from in the `image_credit` column (e.g. "Fig. 2, CC BY 4.0").
- Run `python3 build.py` afterwards; it reports how many screenshots it found.

Until a screenshot exists, the site shows a schematic of the study's first display, labelled "placeholder".

Before publishing the site anywhere public: figures from open-access papers under CC BY can be reused with attribution. Other figures need the publisher's permission.

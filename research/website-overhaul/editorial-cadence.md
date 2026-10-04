# Cadence revision

The revision joins clipped instructions where their relationship matters, especially the unchanged source in an input comparison and the distinction between constructor verification and genome recovery. It keeps the direct headings and the creature imagery. The food example now explains that raising b’s restoration makes it the chosen food; it no longer “wins the choice.”

Content was compared with the protected inventory in editorial-draft.md, the applied structural edit, current implementation and recorded browser evidence. The finite typed task and authored public description remain distinct. Role colors can be shared, and gold values require a recorded run matching the current source and inputs. Gesture playback evaluates no task.

The source example explicitly grows from four graph nodes to five while retaining the same four connected body parts, with changed dimensions and ownership. Its seven-to-five result remains tied to the prepared readings. Different programs can still look alike. Exact constructor emission, passive recovery from genome data, and evaluation of fresh recovered copies remain separate actions.

All ten story identifiers and their five prose fields are retained, including the exact craft formula, sale guard and food conditions. The receipt story retains one confirmed unit when an unknown second attempt is added, changing mayRetry from true to false. Supplied data, simulated effects and experimental Ranch rules remain explicit. The copy adds no claim that a refused or failed evaluation has a current result or complete trace. Runtime records and executable story fields were outside this edit.

No active voice profile: conformance scoring was not run. No unresolved cadence or content-integrity finding remains in these JSON files; the separate reader review follows application.

## Measurement record

Inkwell revision: `f2e9c8eff7461d1790ed59ce07d6fbc9095b2907`.

The before and after directories contain one `ch*.md` file for the homepage and one for each story. Each JSON string is copied verbatim as a paragraph, preserving field and story order. This includes titles, questions and the craft formula; no keys or JSON punctuation enter the prose. `all-copy.md` concatenates those same passages for the KPI script and is excluded by the displacement script’s `ch*.md` glob.

Actual invocation:

```sh
python3 /home/hoskinson/Projects/inkwell/narrative/metrics/displacement.py /home/hoskinson/Projects/quinelings/research/website-overhaul/cadence-before /home/hoskinson/Projects/quinelings/research/website-overhaul/cadence-after
```

Exit code: **0**. Output:

```text
before: 1,060 words in /home/hoskinson/Projects/quinelings/research/website-overhaul/cadence-before
after : 1,073 words in /home/hoskinson/Projects/quinelings/research/website-overhaul/cadence-after  (+1%)

habit                                before    after    change   per
repeated sentence openers              74.1     49.5      -33% dn  1,000 sentences
semicolons                             94.3     46.6      -51% dn  10,000 words
-ly adverbs                            28.3     28.0       -1%     10,000 words
paragraph-final aphorisms              32.8     23.9      -27% dn  100 paragraphs
very short sentences                  138.9    148.5       +7%     1,000 sentences
sentence length stdev                   4.3      4.9      +14%     words
mean sentence length                   10.0     10.8       +8%     words

Habits fell with none rising. That is what a revision should look like:
  down repeated sentence openers: 74.1 -> 49.5 (-33%)
  down semicolons: 94.3 -> 46.6 (-51%)
  down paragraph-final aphorisms: 32.8 -> 23.9 (-27%)
```

No habit reached the default 25% rise threshold, so no repair or rerun was required. The rate of very short sentences rose 7% as the total sentence count fell; the raw count stayed at 15. The diagnostic covers the extracted copy, including short interface labels.

Sentence-length invocation:

```sh
python3 /home/hoskinson/Projects/inkwell/RSI/metrics/compute_kpis.py /home/hoskinson/Projects/quinelings/research/website-overhaul/cadence-before/all-copy.md /home/hoskinson/Projects/quinelings/research/website-overhaul/cadence-after/all-copy.md
```

Exit code: **0**. Reported sentence-length variance: **20.1 → 25.6**. Mean sentence length: **9.9 → 10.7** words. Sentence count: **108 → 101**. The complete KPI output is retained in [cadence-after/kpi-output.json](cadence-after/kpi-output.json). The two tools tokenize words differently, so their word totals differ slightly.


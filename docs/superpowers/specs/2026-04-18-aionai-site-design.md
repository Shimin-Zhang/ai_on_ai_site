# AIonAI Site — Design Spec

**Date:** 2026-04-18
**Status:** Drafted, awaiting user review
**Project:** A one-page Astro site that explains the AIonAI experiment and showcases the raw outputs, scoring matrices, and synthesized analysis.

---

## Context

We have run a benchmark with the following structure:

1. **The prompt.** A single open-ended question — "given everything you know about LLMs, AI, agent harnesses and agents, what are changes that should occur in our world that hasn't happened yet? think things through step by step and industry by industry" — was sent to 11 frontier LLMs. Their answers are stored as `results/{a..k}.md`.
2. **The blind peer review.** The 11 anonymized answers (labeled `a` through `k`) were then handed back to the same 11 models as evaluators. Each evaluator scored every answer (reasoning + originality + correctness, each 1–10, max 30), wrote a personality review, and guessed which model produced each answer. Their evaluations are stored as `eval/{provider__model}.md`.
3. **The synthesis.** A compiled verdict (`eval/benchmark_results.md`) covers the leaderboard, score matrix, identification matrix, self-recognition results, and per-model reflections.

The site exists to make this experiment legible and shareable to a tech-Twitter audience that wants to dig into the evidence themselves.

## Goals

- **Make the findings shareable** in a single scroll. The lead claim ("11 LLMs graded each other's homework, here's who won and who couldn't recognize themselves") should land in the first 5 seconds.
- **Let visitors poke at the evidence.** Sortable leaderboard, hoverable score heatmap with the actual evaluator quote, raw output explorer.
- **Earn credibility through interaction.** Methodology and limitations are real sections, not buried disclaimers.
- **Be a self-contained artifact.** Static export, no backend, no analytics, no email capture.

## Non-goals

- Multi-page navigation.
- A general-purpose LLM benchmark tool. This is one prompt, one run.
- User accounts, comments, or any server-side state.
- A11y audit beyond reasonable defaults (semantic HTML, focus states, color contrast). Full WCAG conformance is not in scope for v1.

## Audience and purpose

Primary readers are AI-curious technologists who follow benchmarks but distrust marketing pages about them. The site needs to be playful enough to share, explorable enough to defend, and credible enough to cite.

The lead hook is **the meta-framing** ("AI judging AI") with **the leaderboard as immediate payoff** and **the puzzle as deeper engagement**.

## Voice

Copy follows the Shimin voice: practitioner-scholar, informed skeptic, deadpan humor, hedged-then-definitive sentence pairs, no corporate speak, no breathless hype. Specific numbers and named models throughout. The hero, the verdict intro, and section labels are written; everything else inherits the tone.

## Page sections (14)

| # | Section | Purpose |
|---|---------|---------|
| 01 | Hero | Meta framing. One-line claim + dek. |
| 02 | The Prompt | Full text of the question all 11 models answered. Big, plain. |
| 03 | Leaderboard | Sortable ranking table with avg score, reasoning, originality, correctness. |
| 04 | The Verdict | Synthesized findings: three-tier structure, Western-model bias, Grok's brand leak, self-awareness pattern. |
| 05 | Personality Cards | One card per model: self-description, peer view, gap, signature quote. Click to expand. |
| 06 | The Delusion Index | Bar chart of (self-score − peer-average). Gemini Flash +5.2, GPT-5.4 −1.6. |
| 07 | Beat the AIs | 5-round puzzle. See a snippet, guess the model, compare your score to the AI evaluators. |
| 08 | Score Heatmap | 11×11 grid, color-mapped on score. Hover any cell for the evaluator's actual quote. |
| 09 | Identification Matrix | Same grid, cells show what each evaluator guessed. Bold = correct. |
| 10 | Evaluator Deep Dive | Judges ranked by sharpness. Score range, ID accuracy, one-line characterization. |
| 11 | Raw Output Explorer | Dropdown of `[a]`–`[k]`; selecting one swaps in the full essay inline. Toggle reasoning trace. |
| 12 | Methodology | Prompt, rubric, providers, eval procedure, dates. |
| 13 | Limitations | n=1 prompt, evaluator collusion risk, sample size, what we didn't measure. |
| 14 | Footer | GitHub link (raw data lives in repo), "run the prompt yourself" with copy-to-clipboard, light/dark toggle. |

## Architecture

### Tech stack

- **Astro 5.x** with the **Tailwind** integration. Single page at `src/pages/index.astro`.
- **TypeScript** for scripts and data builds.
- **JetBrains Mono** as the default `font-mono`, self-hosted via `@fontsource/jetbrains-mono`.
- **No JS framework.** Each interactive section is a vanilla-JS module loaded via Astro's `<script>` tag.
- **Static export** (`output: 'static'`). Deployable to any static host (Vercel, Netlify, GitHub Pages).

### Tailwind + CSS variables

Tailwind handles spacing, layout, responsive breakpoints, and typography defaults. Theme tokens (palette, font family, font sizes) are defined as CSS custom properties in `src/styles/global.css` and consumed inside `tailwind.config.mjs` via `theme.extend`. Example:

```css
/* global.css */
:root {
  --term-bg: #0a0a0a;
  --term-fg: #d4d4d4;
  --term-green: #6ee7b7;
  /* ... */
}
[data-theme="light"] {
  --term-bg: #fafaf7;
  --term-fg: #1a1a1a;
  /* ... */
}
```

```js
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      term: {
        bg: 'var(--term-bg)',
        fg: 'var(--term-fg)',
        green: 'var(--term-green)',
        // ...
      }
    },
    fontFamily: { mono: ['JetBrains Mono', 'ui-monospace', 'monospace'] }
  }
}
```

This way, light/dark theme switching only flips the CSS variable values; Tailwind utility classes (`bg-term-bg`, `text-term-fg`) automatically follow.

### Project structure

```
AIonAISite/
├── src/
│   ├── pages/
│   │   └── index.astro
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── ThePrompt.astro
│   │   ├── Leaderboard.astro
│   │   ├── Verdict.astro
│   │   ├── PersonalityCards.astro
│   │   ├── DelusionIndex.astro
│   │   ├── BeatTheAIs.astro
│   │   ├── ScoreHeatmap.astro
│   │   ├── IdentificationMatrix.astro
│   │   ├── EvaluatorDeepDive.astro
│   │   ├── RawOutputExplorer.astro
│   │   ├── Methodology.astro
│   │   ├── Limitations.astro
│   │   └── Footer.astro
│   ├── scripts/
│   │   ├── leaderboard.ts        # sortable table
│   │   ├── heatmap.ts            # tooltip on hover
│   │   ├── id-matrix.ts          # tooltip on hover
│   │   ├── personality-cards.ts  # expand/collapse + URL hash
│   │   ├── beat-the-ais.ts       # 5-round puzzle state machine
│   │   ├── raw-explorer.ts       # dropdown swap
│   │   └── theme-toggle.ts       # light/dark + localStorage
│   ├── data/
│   │   ├── models.json
│   │   ├── scores.json
│   │   ├── guesses.json
│   │   ├── evaluators.json
│   │   ├── findings.json
│   │   ├── eval-quotes.json      # (evaluator, subject) → quote
│   │   └── outputs/{a..k}.md     # copied from results/
│   └── styles/
│       └── global.css            # CSS variables + Tailwind base
├── scripts/
│   └── build-data.ts             # parses eval/ and results/ into src/data/
├── public/
│   └── (favicon, OG image)
├── eval/                         # source markdown (input only)
├── results/                      # source markdown (input only)
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

### Data pipeline

`scripts/build-data.ts` is run once before `astro dev` and as a prebuild step before `astro build`. It:

1. Reads `eval/answer_key.md` to build the letter-to-model mapping.
2. Reads `eval/benchmark_results.md` and parses out:
   - the leaderboard table → `models.json` (rank, scores, identification flags)
   - the score distribution table → `scores.json` (11×11 matrix)
   - the full guess matrix → `guesses.json` (11×11 with correct flag)
   - the evaluator accuracy table → `evaluators.json`
   - the verdict and key findings text → `findings.json`
3. Reads each `eval/{provider__model}.md` and extracts per-evaluator quotes about each subject letter → `eval-quotes.json`. Quote extraction is best-effort: the parser looks for letter references (`a.md`, `letter b`, `Conversation: c`) followed by the evaluator's review text within ~500 characters, and stops at the next letter reference or section break. Each evaluator's markdown structure varies, so the parser logs a warning per (evaluator, subject) miss and stores `null`; the heatmap renders the cell without a tooltip rather than crashing. Acceptance bar: ≥85% of the 121 (evaluator, subject) pairs have a non-null quote. Falling short triggers a parser-rules tweak, not a release block.
4. Copies `results/{letter}.md` into `src/data/outputs/` so Astro's content layer can render them.

The script is idempotent and runs in <2 seconds. JSON files are committed to the repo so the site can build without re-running the parser.

## Visual system

### Palette (dark default, light toggle in footer)

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `bg` | `#0a0a0a` | `#fafaf7` | Page background |
| `surface` | `#141414` | `#ffffff` | Cards, table rows |
| `border` | `#1f1f1f` | `#e5e5e0` | Dividers, cell borders |
| `fg` | `#d4d4d4` | `#1a1a1a` | Body text |
| `dim` | `#6b7280` | `#888888` | Secondary text |
| `green` | `#6ee7b7` | `#059669` | Rank, prompt prefix, "self" highlights |
| `yellow` | `#fbbf24` | `#b45309` | Scores, focus |
| `red` | `#fca5a5` | `#b91c1c` | Correct ID flags, gap negatives |

### Typography

- All text in `JetBrains Mono`. No serif or sans secondary.
- Scale: 11px (table rows), 14px (body), 16px (h3), 22px (h2 mobile), 28px (h2 desktop), 36px (h1 mobile), 48px (h1 desktop).
- Line-height 1.5 across the board, slightly tighter (1.3) for hero.
- No bold for emphasis except in tables and section labels — instead, color shifts to `green` or `yellow`.

### Layout

- Single 720px content column, centered. Edge padding 16px on mobile, 24px on tablet+.
- Section dividers are real ASCII rules (`─────────────────────────────────`) above each section label, not CSS borders.
- Section labels render as `## SECTION_NAME` in `green`.
- Section h3 subheadings render as `### Subheading` in `fg`.

### Recurring motifs

- Shell-prompt prefix `$ ` for hero claims and "running" intros.
- `// comment` styling for asides — `dim` color, no bullet.
- `[a]`–`[k]` letter pills throughout the page reference models. Each pill is a clickable link that scroll-jumps to that model's personality card and updates the URL hash.
- Numeric values right-aligned in tables, with `yellow` accent on score columns.

### Motion

None except CSS hover transitions (border color, background) and the puzzle's reveal flip. No scroll animations, no fade-ins.

## Interactivity details

### Sortable leaderboard

- Default sort: avg score descending.
- Click any column header to re-sort. Arrow indicator (`▲` / `▼`) on active column.
- Pure DOM manipulation, no virtual rendering. 11 rows, no need for fancy.

### Score heatmap

- 11×11 grid of 32×32px cells. Color interpolated linearly across the observed score range (16–29 in the source data, not the theoretical 0–30) so subtle differences are visible. Endpoints: `border` for the minimum, `green` for the maximum.
- Diagonal cells (self-evaluations) are marked with a thin yellow ring around the cell to flag them visually. Their scores are still included in the row average shown in the leaderboard.
- On `mouseenter`, vanilla JS positions a fixed-position tooltip near the cell. Tooltip shows: evaluator name, subject letter + model, score, and the actual quote pulled from `eval-quotes.json`.
- On mobile (`window.matchMedia('(hover: none)')`): tap pins the tooltip, tap elsewhere unpins.
- If a quote is missing (`null` in the data), the tooltip shows just the score with a `// no quote parsed` line.

### Identification matrix

- Same grid pattern. Cell content is the abbreviated name of what was guessed (e.g., `Claude`, `GPT-4`, `Grok`, `—`).
- Correct guesses use `green` text on `surface` background.
- Hover tooltip shows the full guess text and any reasoning excerpt (one line).

### Personality cards

- 11 cards in a responsive grid (1 column mobile, 2 tablet, 3 desktop).
- Collapsed state: model name, rank, avg score, signature self-description quote.
- Click → expands inline (height transitions from auto-collapse to auto-expand). Expanded state shows: full self-description, 2–3 peer quotes, gap callout (self vs peer-avg), self-recognition flag.
- URL hash updates to `#card-{letter}` when expanded so cards are linkable.

### The Delusion Index

- Horizontal bar chart, one bar per model, ordered by gap.
- Bars to the right of zero are `red` (over-rated self), to the left are `green` (under-rated self).
- Static SVG, generated at build time from `models.json` data. No runtime charting library.

### Beat the AIs (puzzle)

- 5 randomized rounds. Each round picks a snippet (200–400 words) from a different one of the 11 raw outputs — no model appears twice in a session.
- Snippet extraction at build time: `scripts/build-data.ts` walks each `results/{letter}.md`, strips the `# user` and `# assistant (reasoning)` blocks, then samples 3 candidate snippets per model from the `# assistant` body. Candidates skip the first 100 words (avoids prompt restatements) and end on a sentence boundary. All 33 candidates are stored in `puzzle-snippets.json`; the client picks one per model per round.
- UI: snippet on top in a `surface`-colored block, 11 multiple-choice buttons below (model display names, randomized order each round).
- Click a button → reveals the answer immediately, color-codes the choice (`green` if correct, `red` if not), shows a one-line: "AI evaluators got this X out of 11 times." (Sourced from the per-subject `Times Correctly ID'd` column in `models.json`.)
- "Next round" button advances. After round 5: final score with a normalized comparison line: "You got X/5 (Y%). The best AI evaluator hit 45%. The median AI hit 18%. Random guessing is ~9%."
- Shuffle is client-side (`crypto.getRandomValues`-seeded, seed shown in URL hash for shareable runs).
- "Share" button copies a result line to clipboard: "I got X/5 on Beat the AIs (Y%). The best AI hit 45%. → [URL with seed]"

### Raw Output Explorer

- Dropdown labeled `MODEL: [a] z-ai/glm-5.1` with all 11 options.
- Selecting an option swaps the visible content area in place. No modal, no route change.
- Toggle: `[ ] show reasoning trace` — visible only for models that produced a separate reasoning section in their raw output (parsed from `# assistant (reasoning)` headings at build time).
- Markdown is pre-rendered to HTML at build time (Astro's content collections).

### Theme toggle

- Footer button: `[ ] LIGHT MODE`. Click toggles a `data-theme="light"` attribute on `<html>`.
- CSS variables flip via `[data-theme="light"]` selector.
- Choice persisted in `localStorage` under `aionai-theme`. First-paint reads localStorage to avoid flash.

## Build and deploy

- `npm run dev` — runs `build-data.ts` once, then `astro dev`.
- `npm run build` — runs `build-data.ts`, then `astro build`. Output to `dist/`.
- Deployment target: a static host. v1 will assume Vercel or Netlify with default config; no platform-specific config files required.
- No analytics in v1.

## Open questions

- **Domain / hosting.** Not specified. Default to Vercel preview URL until decided.
- **OG image.** Probably worth designing one for share previews — terminal-style render of the leaderboard. Out of scope for v1 unless trivial.
- **Cost callout in the footer.** The microcopy draft says "the cost was about $X across all 11 providers." We don't have that number yet. Either source it before launch or remove the line.

## What this design intentionally leaves out

- Per-evaluator deep dives ("see what Opus 4.7 said about everyone"). The Evaluator Deep Dive section gives the headline numbers. Anyone who wants more reads the source markdown linked in the footer.
- Search across raw outputs. Cmd-F works fine in the explorer.
- Timeline / version history of multiple runs. This is a single-run snapshot.
- Newsletter signup, comments, or any kind of CTA beyond GitHub.

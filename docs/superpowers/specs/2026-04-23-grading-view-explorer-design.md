# Grading-View Explorer — Design Spec

**Date:** 2026-04-23
**Status:** Approved (brainstorming → ready for implementation plan)
**Author:** shimin (with Claude Opus 4.7)

## 1. Purpose

Extend the existing **RAW_OUTPUT_EXPLORER** section (section 10) on the
AI-on-AI Arena to let visitors view not just each model's **response**
(what they said when given the 3-turn benchmark prompt), but also each
model's **grading** — the full markdown analysis each model wrote when
graded by that model against the other 10 anonymized responses.

A new `VIEW` dropdown selects between the two modes. The model-picker
dropdown below it morphs its label (`MODEL` ↔ `EVALUATOR`) depending
on the selected view. Gradings are fetched lazily so the initial page
payload doesn't grow.

## 2. Goals & non-goals

**Goals**

- Single section, two views (responses / gradings) in the same explorer.
- Lazy delivery: gradings aren't downloaded until the user opens the
  gradings view.
- Correct parsing of eval source files (they embed fenced conversations
  that the current `parseTranscript` misreads).
- No new runtime dependencies in the browser bundle.
- Zero regression on the current responses view.

**Non-goals**

- Multi-turn grading UI — every eval file is single-turn by data, so
  the view renders one markdown blob per evaluator.
- Reasoning toggle for gradings — no reasoning data exists for eval
  transcripts.
- Per-cell quotes, heatmap coupling, or search-within-a-grading — those
  are deferred / out of scope for this change.
- Analytics or telemetry — the site has none by design.

## 3. Data source

### 3.1 Source files

Eleven `eval/<provider>__<slug>.md` files already in the repo
(e.g., `eval/anthropic__claude-opus-4.7.md`). Each follows the exact
shape:

```
# user
<grading instructions, then 11 fenced code blocks each containing
 one anonymized model's 3-turn response>

# assistant
<the evaluator's full grading — scores, per-model reviews, similarity
 analysis, and letter→model guesses, in markdown>
```

Confirmed empirically across all 11 files: **exactly one** real
`# user` / `# assistant` pair per file. The apparent additional
headings come from `# user` / `# assistant` lines inside the fenced
embedded conversations, which the current parser misinterprets.

### 3.2 Parser fix

`scripts/parsers/raw-outputs.ts` currently uses a flat regex
(`/^#\s*(user|assistant\s*\(reasoning\)|assistant)\s*$/gm`). It does
not track fenced code blocks, so headings inside ` ``` ` … ` ``` `
fences count as turn boundaries.

**Fix:** replace the regex pass with a line-by-line walk that toggles
an `inFence` boolean on each line matching `/^```/`. Heading matches
are only honored when `inFence === false`. All other behavior preserved:

- Turn order is flush-on-next-user.
- `# assistant (reasoning)` populates the current turn's `reasoning`.
- Empty bodies become empty strings, not null.

This is a pure correctness improvement. Verified: no existing
`results/*.md` file (the current caller) has a fenced-in-heading case,
so response parsing is unchanged.

### 3.3 Build-data pipeline

`scripts/build-data.ts` gains an evaluations pass:

1. For each letter in `subjectOrder`, look up the model slug from
   `models` (built from `answer_key.md`).
2. Read `eval/<slug.replace('/', '__')>.md`.
3. Parse with the fixed `parseTranscript`.
4. Take `transcript.turns[0]?.assistant ?? ''` as the grading text.
5. Render with `marked.parse` (already a project dep used at build time).
6. Write to **`public/data/evaluations/<letter>.json`** of shape:

   ```json
   { "letter": "j", "gradingHtml": "<h1>LLM Conversation Analysis</h1>..." }
   ```

`public/` is the right location because the files must be fetchable
at runtime. Astro copies `public/**` verbatim into the built site under
the configured base path. The fetch URL at runtime is
`${BASE_URL}data/evaluations/<letter>.json`.

### 3.4 Measured sizes

| Evaluator | Raw markdown |
|---|---|
| Opus 4.7 | 9 KB |
| Grok 4.20 | 12 KB |
| GPT-5.4 | 15 KB |
| MiniMax m2.7 | 21 KB |
| DeepSeek v3.2 | 23 KB |
| Kimi k2.5 | 28 KB |
| GLM 5.1 | 32 KB |
| Qwen3 max-thinking | 32 KB |
| Gemini 2.5 Flash | 34 KB |
| Opus 4.6 | 57 KB |
| Gemini 3.1 Pro Preview | 365 KB |
| **Total** | **~632 KB** |

Rendered HTML is expected to be 1.3–2× the markdown size. Gemini 3.1
Pro's grading is an outlier (very verbose). Lazy fetch is the right
strategy.

## 4. Component changes — `src/components/RawOutputExplorer.astro`

### 4.1 Control row

```
VIEW: [ responses ▼ ]   MODEL: [ [j] Opus 4.7 (#1) ▼ ]   ☐ show reasoning traces
```

- VIEW dropdown options: `responses` (default), `gradings`.
- Second dropdown label: `MODEL` when view=responses, `EVALUATOR` when
  view=gradings. The option set is identical in both (the 11 letters,
  labeled with display name and rank).
- Reasoning checkbox and its label are hidden (`.hidden` class applied)
  when view=gradings.

### 4.2 Body containers

- `#responses-body` — the current `#output-bodies` renamed for clarity.
  Contains 11 pre-rendered `<article data-letter=…>` elements, inlined
  at build time. Unchanged behavior.
- `#gradings-body` — new container, initially empty. One child element
  at a time (the currently selected evaluator's grading HTML).

Only one container is visible at a time based on VIEW.

### 4.3 Section metadata

- `id="explorer"` unchanged (preserves deep links and TopNav).
- `SectionHeader` title unchanged (`RAW_OUTPUT_EXPLORER`).
- Tagline updated to: `two views · responses or raw gradings`.

### 4.4 Markup additions (abridged)

```astro
---
// existing frontmatter...
const BASE = import.meta.env.BASE_URL; // e.g., "/ai-on-ai-arena/"
---
<section id="explorer" class="py-16 md:py-20" data-base={BASE}>
  <div class="wrap-data">
    <SectionHeader num="10" title="RAW_OUTPUT_EXPLORER">two views · responses or raw gradings</SectionHeader>

    <div class="flex flex-wrap items-center gap-4 mb-8 p-3 rounded-md border border-term-border bg-term-surface/40">
      <label class="text-term-dim text-[11px] tracking-wider">VIEW</label>
      <select id="view-select" class="…">
        <option value="responses">responses</option>
        <option value="gradings">gradings</option>
      </select>

      <label id="entity-label" class="text-term-dim text-[11px] tracking-wider">MODEL</label>
      <select id="output-select" class="…"> … </select>

      <label id="reasoning-toggle" class="…">
        <input type="checkbox" id="output-reasoning" …/>
        <span>show reasoning traces</span>
      </label>
    </div>

    <div id="responses-body" class="wrap-read">
      {outputs.map((o) => (
        <article data-letter={o.letter} class="output-body hidden space-y-10"> … </article>
      ))}
    </div>

    <div id="gradings-body" class="wrap-read hidden">
      <article class="grading-body space-y-6">
        <div id="grading-status" class="text-term-dim text-xs"></div>
        <div id="grading-content" class="prose prose-invert prose-sm max-w-none text-term-fg"></div>
      </article>
    </div>
  </div>
</section>
```

## 5. Client-side behavior

Inline `<script>` in `RawOutputExplorer.astro`. One script handles both
views. Key state:

```ts
const BASE = document.getElementById('explorer')?.dataset.base ?? '/';
const gradingCache = new Map<string, string>(); // letter → HTML
let currentView: 'responses' | 'gradings' = 'responses';
let currentLetter: string = /* first model letter by rank */;
```

### 5.1 VIEW change

1. Update `currentView`.
2. Toggle container visibility: `#responses-body` ↔ `#gradings-body`.
3. Toggle label: `MODEL` ↔ `EVALUATOR`.
4. Toggle reasoning checkbox visibility: shown only when
   `currentView === 'responses'`.
5. If switching **into** gradings, call `renderGrading(currentLetter)`.

### 5.2 MODEL / EVALUATOR change

1. Update `currentLetter`.
2. If `currentView === 'responses'`: toggle which `<article>` in
   `#responses-body` has the `hidden` class (existing behavior).
3. If `currentView === 'gradings'`: call `renderGrading(currentLetter)`.

### 5.3 `renderGrading(letter)`

```ts
async function renderGrading(letter: string) {
  const status = document.getElementById('grading-status');
  const content = document.getElementById('grading-content');
  if (!status || !content) return;

  if (gradingCache.has(letter)) {
    content.innerHTML = gradingCache.get(letter)!;
    status.textContent = '';
    return;
  }

  status.textContent = `// loading [${letter}]…`;
  content.innerHTML = '';

  try {
    const res = await fetch(`${BASE}data/evaluations/${letter}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { gradingHtml } = await res.json() as { gradingHtml: string };
    gradingCache.set(letter, gradingHtml);
    content.innerHTML = gradingHtml;
    status.textContent = '';
  } catch (err) {
    status.innerHTML = `// failed to load [${letter}] — <button id="retry-grading-${letter}" class="underline hover:text-term-green">retry?</button>`;
    document
      .getElementById(`retry-grading-${letter}`)
      ?.addEventListener('click', () => renderGrading(letter));
  }
}
```

Cache is in-memory for the page session. Hard reload clears it.

### 5.4 Reasoning toggle

Unchanged when view=responses. Hidden (no-op) when view=gradings —
the checkbox is not cleared, just hidden, so if the user switches back
to responses the reasoning state is preserved.

## 6. Accessibility

- `#view-select` and `#output-select` are standard `<select>` elements
  with visible labels (`<label>` elements carry the text; selects are
  the labelled controls).
- `#entity-label` (the morphing label) is an `<label>` bound via `for`
  to `#output-select`; the `textContent` swap is a minor accessibility
  concern (screen readers re-announce on `aria-label` change, not
  `textContent`). Acceptable for this surface — the label is visible
  text and users will perceive the change visually.
- Grading body uses `prose prose-invert prose-sm` (existing Tailwind
  typography plugin) for readable long-form text in both themes.
- Status region is not a live region — the selection that drives it is
  a sighted-user action (a dropdown change), so no announcement is
  required.

## 7. Testing

### 7.1 Parser unit tests — `scripts/parsers/raw-outputs.test.ts` (new)

Using vitest (already configured). Three test cases minimum:

1. **Happy path 3-turn** — input with three `# user` / `# assistant`
   pairs, no fences; expect 3 turns in the parsed order.
2. **Fenced-in-heading ignored** — input with a `# user` / `# assistant`
   pair inside a fenced code block, followed by a real `# user` /
   `# assistant` pair. Expect 1 turn.
3. **Eval-shape** — input mimicking a real eval file: one `# user`
   containing several embedded fenced 3-turn conversations, then one
   real `# assistant`. Expect 1 turn with the user containing the
   full prompt (including the fenced embeds) and the assistant
   containing the grading.

### 7.2 Manual E2E (playwright-automatable, plus one user step)

- Page loads with VIEW=responses, first model selected, existing
  behavior identical to today.
- Change VIEW to gradings — label flips to `EVALUATOR`, reasoning
  checkbox hides, `#responses-body` hides, `#gradings-body` shows,
  and the first evaluator's grading fetches and renders.
- Network tab shows exactly one request to
  `…/data/evaluations/<letter>.json` per evaluator opened.
- Picking the same evaluator again after first load produces no new
  network request (cache hit).
- Picking a new evaluator triggers a new fetch, renders new HTML,
  and the old grading is replaced.
- Flipping VIEW back to responses restores the previous state
  (responses body visible, correct article shown).
- Force an error by renaming a JSON file and re-fetching → the retry
  affordance appears and works after the file is restored.
- Keyboard: Tab lands on VIEW → model/evaluator select → reasoning
  checkbox (when visible); Enter / arrow keys operate the selects.

## 8. File map

**Create**
- `public/data/evaluations/` — directory (gitignored? see §10).
- `public/data/evaluations/<letter>.json` × 11 — build artifacts.
- `scripts/parsers/raw-outputs.test.ts` — parser unit tests.

**Modify**
- `scripts/parsers/raw-outputs.ts` — fenced-block-aware walk.
- `scripts/build-data.ts` — add evaluations pass; import `marked`; log
  the extra files.
- `src/components/RawOutputExplorer.astro` — VIEW dropdown, gradings
  body, lazy-fetch script.

**Do not modify**
- `src/pages/index.astro` — no new import; the explorer stays where
  it is in the section order.
- TopNav / anchors / section numbering.
- Any other component, parser, or data pipeline.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Parser fix changes behavior for existing `results/*.md` parsing | Verified none of those files have fenced-in-heading content; parser tests cover both the old and new cases. |
| `public/data/evaluations/*.json` grows large enough to slow static deploys | Worst evaluator is 365 KB markdown ≈ ~500–700 KB rendered HTML. Acceptable for Cloudflare Pages; unchanged per-request as it's lazy. |
| Fetch path base mismatch in dev (`/ai-on-ai-arena/`) vs prod same | Use `import.meta.env.BASE_URL` via `data-base` — tested in both dev (`npm run dev`) and the built output. |
| Markdown HTML injected via `innerHTML` is XSS-safe | Source markdown is authored content in the repo, not user input; `marked` default config is fine. No additional sanitization needed. |
| New JSON output files pollute git diffs on every rebuild | Gitignore `public/data/evaluations/` — generated artifacts shouldn't be tracked (see §10). |

## 10. Gitignore

Add `public/data/evaluations/` to `.gitignore`. Rationale:

- These are build artifacts produced deterministically by
  `scripts/build-data.ts` from the tracked `eval/*.md` files.
- Tracking them would create noisy diffs on every build and violate
  the single-source-of-truth rule (the `.md` files are the source).
- `npm run build` runs build-data before `astro build`, so any deploy
  regenerates them from source.

For consistency, check whether `src/data/outputs/*.json` is also
gitignored (if not, leave it alone — this spec only adds the new
evaluations path to `.gitignore` and does not restructure the existing
outputs tracking).

## 11. Out of scope (explicitly deferred)

- Unifying the responses and gradings data shapes behind one helper.
- Pre-rendering gradings into inlined Astro articles (would violate
  the "lazy delivery" goal).
- Adding a "show prompt" affordance that reveals the grading prompt
  + embedded response transcripts (redundant with the responses view).
- Cross-linking: from a heatmap cell, jumping to the evaluator's
  full grading at that row's subject section.
- Persistent cache (localStorage) for gradings across reloads.

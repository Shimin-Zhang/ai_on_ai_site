# Kit Subscribe Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a terminal-aesthetic email capture section to the AI-on-AI Arena that posts directly to Kit form `9351573` (double opt-in) for monthly "new model added" updates.

**Architecture:** One new Astro component (`Subscribe.astro`) inserted as section 13 between `Limitations` and `Footer` in `src/pages/index.astro`. The form submits via `fetch(..., { mode: 'no-cors' })` to `https://app.kit.com/forms/9351573/subscriptions`, with a honeypot hidden field for spam resistance, inline status messaging, and no third-party JS.

**Tech Stack:** Astro 6, TailwindCSS v4 (existing `term-*` tokens), vanilla inline `<script>` (matches `Footer.astro` pattern).

**Reference spec:** `docs/superpowers/specs/2026-04-20-kit-subscribe-form-design.md`

**Testing approach:** The spec explicitly defers unit tests ("thin fetch wrapper; verification = manual"). This plan does NOT introduce vitest tests for the component. Verification is an end-to-end manual check against the real Kit endpoint, captured in Task 5.

---

## File Structure

- **Create:** `src/components/Subscribe.astro` — the full section component (markup + styles + inline script).
- **Modify:** `src/pages/index.astro` — add import + insert `<Subscribe />` between `<Limitations />` and `<Footer />`.
- **No other files changed.** No new dependencies, no new CSS tokens, no test files, no worker changes.

---

## Task 1: Scaffold `Subscribe.astro` with static markup

**Files:**
- Create: `src/components/Subscribe.astro`

This task produces a renderable section with no JavaScript behavior yet — so we can verify layout, typography, spacing, and dark/light themes before wiring up submission logic.

- [ ] **Step 1.1: Create the component file**

Create `src/components/Subscribe.astro` with exactly this content:

```astro
---
// src/components/Subscribe.astro
import SectionHeader from '../lib/SectionHeader.astro';
const FORM_ENDPOINT = 'https://app.kit.com/forms/9351573/subscriptions';
---
<section id="subscribe" class="py-16 md:py-20">
  <div class="wrap-read">
    <SectionHeader num="13" title="SUBSCRIBE">· monthly · one email · no spam</SectionHeader>

    <p class="text-term-fg leading-relaxed mb-5">
      I'll send one short email when new models join the arena —
      their rank, whether they spotted themselves, any surprises.
    </p>

    <form id="subscribe-form" novalidate
          class="grid gap-2 sm:grid-cols-[1fr_auto] items-stretch"
          data-endpoint={FORM_ENDPOINT}>
      <label for="subscribe-email" class="sr-only">email address</label>
      <input id="subscribe-email" name="email_address" type="email"
             required autocomplete="email" inputmode="email"
             placeholder="name@domain.tld"
             class="bg-transparent border border-term-border rounded px-3 py-2
                    text-sm placeholder:text-term-dim focus:outline-none
                    focus:border-term-green" />
      <!-- honeypot: real users leave this empty -->
      <input type="text" name="website" tabindex="-1" autocomplete="off"
             aria-hidden="true"
             class="hidden" />
      <button type="submit"
              class="inline-flex items-center justify-center gap-1.5
                     text-term-fg border border-term-border rounded px-3 py-2
                     text-xs hover:border-term-green hover:text-term-green
                     transition-colors">
        <span aria-hidden="true">$</span>
        <span class="subscribe-label">subscribe</span>
      </button>
    </form>

    <p id="subscribe-status" role="status" aria-live="polite"
       class="mt-3 text-xs text-term-dim min-h-[1.25rem]"></p>
  </div>
</section>
```

Notes for the engineer:
- `SectionHeader` is at `src/lib/SectionHeader.astro`. It accepts `num` (string) and `title` (string) props and renders a `<slot />` for the right-aligned tagline. Every other section uses it — match that pattern.
- The container utilities (`wrap-read`, `wrap-data`) come from `src/styles/global.css`. `wrap-read` is 680px max width.
- Tailwind color tokens: `text-term-fg`, `text-term-dim`, `border-term-border`, `hover:border-term-green`, `placeholder:text-term-dim` are all defined in the existing `@theme` block in `global.css`. Do not introduce new tokens.
- `sr-only` is a Tailwind v4 built-in utility; it does not need a custom definition.
- The `data-endpoint` attribute on the form passes the Kit URL to the inline script we add in Task 3, so the URL lives in one place.

- [ ] **Step 1.2: Commit the scaffolded component**

```bash
git add src/components/Subscribe.astro
git commit -m "feat: scaffold Subscribe.astro section (markup only)"
```

---

## Task 2: Wire `Subscribe` into `index.astro`

**Files:**
- Modify: `src/pages/index.astro` (add import at top, add element in `<main>` between Limitations and Footer)

- [ ] **Step 2.1: Add the import**

In `src/pages/index.astro`, after the existing import line for `Limitations` and before the import line for `Footer`, insert the `Subscribe` import.

Current (excerpt):

```astro
import Limitations from '../components/Limitations.astro';
import Footer from '../components/Footer.astro';
```

Change to:

```astro
import Limitations from '../components/Limitations.astro';
import Subscribe from '../components/Subscribe.astro';
import Footer from '../components/Footer.astro';
```

- [ ] **Step 2.2: Add the element in the main layout**

In the same file, in the `<main>` block, after `<Limitations />` and before `<Footer />`, insert `<Subscribe />`.

Current (excerpt):

```astro
      <Limitations />
      <Footer />
```

Change to:

```astro
      <Limitations />
      <Subscribe />
      <Footer />
```

- [ ] **Step 2.3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: insert Subscribe section between Limitations and Footer"
```

---

## Task 3: Add the submit handler script

**Files:**
- Modify: `src/components/Subscribe.astro` (append an inline `<script>` block at the end of the file)

This adds the JavaScript behavior: honeypot check, client-side email validation, disabled-during-submit state, fetch to Kit, and success/error messaging.

- [ ] **Step 3.1: Append the inline script**

Open `src/components/Subscribe.astro`. After the closing `</section>` tag, append this `<script>` block at the very end of the file:

```astro
<script>
  const form = document.getElementById('subscribe-form') as HTMLFormElement | null;
  const status = document.getElementById('subscribe-status');
  const emailInput = document.getElementById('subscribe-email') as HTMLInputElement | null;
  const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]') ?? null;
  const buttonLabel = button?.querySelector<HTMLElement>('.subscribe-label') ?? null;

  function setStatus(text: string, tone: 'idle' | 'ok' | 'err') {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('text-term-dim', 'text-term-green', 'text-term-red');
    status.classList.add(
      tone === 'ok' ? 'text-term-green' : tone === 'err' ? 'text-term-red' : 'text-term-dim'
    );
  }

  function showSuccess() {
    form?.classList.add('hidden');
    setStatus('\u2713 check your inbox to confirm', 'ok');
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form || !emailInput || !button || !buttonLabel) return;

    const data = new FormData(form);
    const honeypot = (data.get('website') ?? '').toString().trim();
    if (honeypot) {
      // Bot tripped the honeypot — fake the success state, send nothing.
      showSuccess();
      return;
    }

    if (!emailInput.checkValidity()) {
      setStatus("\u00d7 that doesn't look like an email", 'err');
      emailInput.focus();
      return;
    }

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      setStatus('\u2717 form misconfigured — email me at shiminlearnsthings@gmail.com', 'err');
      return;
    }

    const originalLabel = buttonLabel.textContent;
    button.disabled = true;
    buttonLabel.textContent = 'subscribing\u2026';
    setStatus('', 'idle');

    try {
      await fetch(endpoint, {
        method: 'POST',
        body: data,
        mode: 'no-cors',
      });
      showSuccess();
    } catch (err) {
      button.disabled = false;
      buttonLabel.textContent = originalLabel ?? 'subscribe';
      setStatus(
        '\u2717 form choked \u2014 try again or email me at shiminlearnsthings@gmail.com',
        'err'
      );
    }
  });
</script>
```

Notes for the engineer:
- Astro inline `<script>` blocks are TypeScript-capable by default (the project's `tsconfig.json` enables this). The type annotations above work as-is; do not strip them.
- The `\u2713`, `\u00d7`, `\u2717`, `\u2026` escapes are `✓`, `×`, `✗`, and `…` respectively. We use unicode escapes rather than raw characters so the file stays ASCII-safe in any editor.
- `form.dataset.endpoint` reads the `data-endpoint` attribute set in Task 1.
- On a no-cors fetch we cannot read status codes, so anything that does not throw is treated as success. This is the documented tradeoff in the spec (§8).
- `showSuccess()` hides the form entirely by adding Tailwind's `hidden` class (display: none). We do not re-show it — a confirmed subscriber should not see the form again during the session.

- [ ] **Step 3.2: Commit**

```bash
git add src/components/Subscribe.astro
git commit -m "feat: add Kit submit handler with honeypot + inline status"
```

---

## Task 4: Build check

**Files:** (none modified)

Catch type errors, missing imports, or CSS token typos early.

- [ ] **Step 4.1: Run the production build**

Run: `npm run build`

Expected:
- Exit code 0.
- No new warnings in the build output beyond whatever the baseline already produces.
- Output includes `dist/ai-on-ai-arena/index.html` (or similar, per the `base: '/ai-on-ai-arena'` config).

If the build fails with a type error inside the inline `<script>`, re-read Task 3.1 and confirm the TypeScript casts and null checks are intact.

- [ ] **Step 4.2: No commit**

(Build check only — nothing to commit.)

---

## Task 5: Manual end-to-end verification

**Files:** (none modified)

The spec explicitly calls for manual verification in lieu of unit tests. Walk through each check. If any fails, stop and fix before proceeding.

- [ ] **Step 5.1: Start the dev server**

Run: `npm run dev`

Expected:
- Build-data script runs (prints something like `wrote data/...`).
- Astro dev server starts and prints a local URL (e.g. `http://localhost:4321/ai-on-ai-arena/`).

- [ ] **Step 5.2: Visual inspection in a browser (dark theme, default)**

Open the local URL and scroll to the section immediately above the footer.

Expected:
- Section number `13` in dim color.
- Title `## SUBSCRIBE` in green.
- Right-aligned tagline `· monthly · one email · no spam` in dim.
- Promise paragraph in foreground color, wrapping around ~680px max width.
- Email input + `$ subscribe` button on the same row on desktop, stacked on mobile (<640px).
- Focusing the input shows a green border.
- Hovering the button turns its border and text green.

- [ ] **Step 5.3: Visual inspection in light theme**

Click the theme toggle in the footer to switch to light theme.

Expected:
- All colors adapt (input border, text, placeholder, button) with good contrast.
- No hard-to-read text anywhere in the new section.

- [ ] **Step 5.4: Keyboard traversal**

From the top of the page, Tab through the document until focus lands in the new section.

Expected:
- Focus lands on the email input (visible green focus ring).
- Next Tab lands on the submit button (skipping the honeypot, which is `display: none` and `tabindex="-1"`).
- Enter on the button submits the form.

- [ ] **Step 5.5: Client-side validation**

Type something invalid (e.g. `notanemail`) and submit.

Expected:
- Status message reads `× that doesn't look like an email` in the red tone.
- No network request to `app.kit.com` in the devtools Network tab.
- Focus returns to the email input.

- [ ] **Step 5.6: Honeypot path**

Open devtools → Elements → find the hidden `<input name="website">`, remove the `class="hidden"` attribute, type `bot` in the field, restore `class="hidden"`, then submit with any valid email.

Expected:
- Status message reads `✓ check your inbox to confirm` in the green tone.
- No network request to `app.kit.com`.
- Form is hidden.

Reload the page to reset state before the next step.

- [ ] **Step 5.7: Real submission to Kit**

Enter a real email you control and submit.

Expected:
- Button briefly shows `$ subscribing…` and is disabled.
- One POST to `https://app.kit.com/forms/9351573/subscriptions` is visible in the Network tab (request will be opaque / status 0 due to `no-cors` — this is correct).
- Form hides, status shows `✓ check your inbox to confirm`.
- A confirmation email from Kit arrives in the inbox within ~1 minute.
- In the Kit dashboard, form 9351573 shows a new subscriber in "pending confirmation" state.

- [ ] **Step 5.8: Screen reader spot-check (optional but recommended)**

Using VoiceOver (macOS: Cmd+F5), NVDA, or ChromeVox, submit a valid email and confirm the success text is announced via the live region.

- [ ] **Step 5.9: Stop the dev server**

Ctrl+C the `npm run dev` process.

---

## Task 6: Final review and handoff

- [ ] **Step 6.1: Confirm clean git status**

Run: `git status`

Expected: working tree clean, branch ahead of origin by the Task 1, 2, and 3 commits (three commits total, plus the earlier spec commit).

- [ ] **Step 6.2: Review the diff against the spec**

Run: `git log --stat master -- src/components/Subscribe.astro src/pages/index.astro`

Confirm the commits cover:
- One new component file (`src/components/Subscribe.astro`).
- One 2-line modification to `src/pages/index.astro` (import + element).

- [ ] **Step 6.3: Stop here. Deployment is a separate decision.**

Do NOT run `wrangler pages deploy` as part of this plan. The user will decide when to deploy and will invoke the existing deploy flow from `DEPLOY.md` manually.

---

## Self-Review Notes

Completed against the spec before handoff:

**Spec coverage (each section from the spec mapped to a task):**
- §3 Placement → Task 2 (insert between Limitations and Footer, section 13, wrap-read).
- §4 Markup & copy → Task 1.1 (exact markup + copy from spec copy inventory).
- §5 Submit behavior → Task 3.1 (honeypot check, client validation, disable-on-submit, no-cors fetch, success/error states).
- §6 Accessibility → Task 1.1 (sr-only label, aria-live status, honeypot tabindex/aria-hidden) + Task 5.4/5.8 (verification).
- §7 Privacy/spam → Task 1.1 + Task 3.1 (no external script, honeypot only).
- §8 Risks → Addressed inline (endpoint lives in `data-endpoint`; treat-no-throw-as-success comment in Task 3.1).
- §9 Verification plan → Task 4 (build) + Task 5 (all manual checks).
- §10 Out of scope → Task 6.3 explicitly defers deploy.

**Placeholder scan:** no TBD/TODO/"implement later"/"handle edge cases" language. Every code step has complete code.

**Type / name consistency:** `subscribe-form` (id), `subscribe-email` (id), `subscribe-status` (id), `subscribe-label` (class), `email_address` (Kit field), `website` (honeypot) — all referenced consistently across Task 1 markup and Task 3 handler.

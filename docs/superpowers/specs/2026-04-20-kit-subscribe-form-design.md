# Kit Subscribe Form — Design Spec

**Date:** 2026-04-20
**Status:** Approved (brainstorming → ready for implementation plan)
**Author:** shimin (with Claude Opus 4.7)

## 1. Purpose

Add an email-capture form to the AI-on-AI Arena page so visitors can subscribe
to a monthly update whenever new models join the benchmark (new rank, whether
they spotted themselves, any surprises).

The form integrates with Kit (ConvertKit) form **ID `9351573`**, which is
configured for **double opt-in** — subscribers receive a confirmation email
before being added to the list.

## 2. Goals & non-goals

**Goals**

- Capture emails directly on the Arena (`shimin.io/ai-on-ai-arena`) without
  redirecting off-site.
- Visual + interaction design matches the existing terminal aesthetic (no
  Kit-branded widget or external styles).
- Zero third-party JS / no tracker added to the site.
- Accessible (keyboard, screen reader, live status region).

**Non-goals**

- Not adding analytics or conversion tracking (the site has none today).
- Not gating the Arena content behind a signup.
- Not adding any new section to `TopNav` — nav is reserved for benchmark
  content.
- Not writing a custom thank-you page — a single inline success state is
  enough.
- Not adding unit tests for the submit handler (thin `fetch` wrapper;
  verification = submit through the live form and confirm a pending
  subscriber appears in the Kit dashboard).

## 3. Placement

- New component: `src/components/Subscribe.astro`
- Inserted in `src/pages/index.astro` between `<Limitations />` and
  `<Footer />`.
- Section number `13` (continues the 01–12 progression used by the other
  numbered sections).
- Container class: `wrap-read` (~680px max width) — same treatment as
  `Limitations` and `Methodology`, since the content is prose + a single
  form row rather than a data visualization.
- Anchor id: `subscribe` (for direct linking; not added to `TopNav`).

## 4. Markup & copy

```astro
<section id="subscribe" class="py-16 md:py-20">
  <div class="wrap-read">
    <SectionHeader num="13" title="SUBSCRIBE">· monthly · one email · no spam</SectionHeader>

    <p class="text-term-fg leading-relaxed mb-5">
      I'll send one short email when new models join the arena —
      their rank, whether they spotted themselves, any surprises.
    </p>

    <form id="subscribe-form" novalidate
          class="grid gap-2 sm:grid-cols-[1fr_auto] items-stretch">
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

### Copy inventory

| State        | Text                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------|
| Section tag  | `· monthly · one email · no spam`                                                             |
| Promise      | `I'll send one short email when new models join the arena — their rank, whether they spotted themselves, any surprises.` |
| Placeholder  | `name@domain.tld`                                                                             |
| Button idle  | `$ subscribe`                                                                                 |
| Button busy  | `$ subscribing…`                                                                              |
| Success      | `✓ check your inbox to confirm` (double opt-in confirmed)                                      |
| Invalid email (client) | `× that doesn't look like an email`                                                  |
| Network error | `✗ form choked — try again or email me at shiminlearnsthings@gmail.com`                      |
| Honeypot tripped | *(no message; silently swallow the submit and show the success state)*                    |

First-person singular throughout, per the site's authorship convention.

## 5. Submit behavior

- JS (inline `<script>` in the component, same pattern as `Footer.astro`)
  intercepts the `submit` event.
- Flow:
  1. Read `email_address` and `website` (honeypot) from the form.
  2. If `website` is non-empty → silently show the success state, do not
     POST.
  3. Client-side validate the email with `input.checkValidity()`. If invalid,
     show the invalid-email message and return.
  4. Disable the submit button, flip label to `$ subscribing…`.
  5. `fetch('https://app.kit.com/forms/9351573/subscriptions', { method: 'POST', body: new FormData(form), mode: 'no-cors' })`.
     - `mode: 'no-cors'` is deliberate: Kit's endpoint does not reliably
       expose CORS headers for arbitrary origins, and we do not need to read
       the response body to know the request landed.
  6. On resolve: hide the form, show the success message. Do not auto-hide
     (a confirmed subscriber shouldn't see the form again during the same
     session).
  7. On reject (network failure only, since `no-cors` hides HTTP errors):
     show the error message, re-enable the form.

- Prevent double-submit: button is `disabled` while a request is in flight.

## 6. Accessibility

- Input has an `sr-only` `<label for="subscribe-email">`.
- Status `<p>` uses `role="status"` + `aria-live="polite"` so screen readers
  announce success/error without interrupting.
- Honeypot input is `aria-hidden="true"`, `tabindex="-1"`, and visually
  hidden (`class="hidden"`) so it's not reachable by keyboard or AT.
- Focus ring on the email input (`focus:border-term-green`) is visible in
  both themes; site already ships dark + light palettes via the existing
  `data-theme` system.
- Button is a real `<button type="submit">` (not a styled `<div>`); it works
  without JS, with the caveat that the default form submit will navigate
  to Kit's hosted thank-you page — an acceptable graceful-degradation
  fallback.

## 7. Privacy / spam

- No third-party script added to the page. The only outbound request is a
  single `POST` to `app.kit.com` made *after* the user submits.
- Honeypot `name="website"` provides cheap bot resistance without hurting
  UX. No Turnstile / reCAPTCHA.
- Kit handles double opt-in, unsubscribe, and list storage; the site stores
  nothing.

## 8. Open risks

| Risk                                                                 | Mitigation                                                                               |
|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Kit changes the endpoint from `app.kit.com` to `app.convertkit.com`  | Both hostnames currently resolve to the same service; if it breaks, swap the URL.         |
| Kit returns a non-2xx HTTP status under `no-cors`                    | We treat the fetch as success (can't read the status). Acceptable — Kit retries server-side and the user still sees the confirmation email flow. |
| Form 9351573 changes from double opt-in to single opt-in             | Success copy would become slightly inaccurate ("check your inbox" vs "you're in"). Owner (shimin) to keep Kit settings in sync with the spec copy. |
| CSS / Tailwind v4 token rename                                       | Uses existing `term-*` tokens already consumed by other components; change is low-risk.   |

## 9. Verification plan

After implementation:

1. `npm run build` succeeds with no new warnings.
2. Local dev preview (`npm run dev`): section renders with correct spacing,
   typography, and focus states in both dark and light themes.
3. Submit a real test email → confirm in the Kit dashboard that form 9351573
   has a new pending subscriber.
4. Submit with the honeypot pre-filled (via devtools) → confirm no request
   goes to `app.kit.com` and the UI shows the success state.
5. Keyboard-only pass: Tab reaches input → button → skips the honeypot.
6. Screen reader spot-check: success message is announced.
7. Deploy via the existing Cloudflare Pages flow (`npm run build` →
   `wrangler pages deploy dist`). No worker change required.

## 10. Out of scope (explicitly deferred)

- A second form (e.g., footer signup) — one surface is enough.
- Welcome email sequence configuration in Kit.
- Pop-up or exit-intent variants.
- Migrating the site to a form library (react-hook-form etc.); vanilla JS
  is consistent with the rest of the components.

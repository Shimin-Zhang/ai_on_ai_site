# Deployment

The Arena is deployed as a Cloudflare Pages project at
**https://aionai-arena.pages.dev**, proxied to
**https://shimin.io/ai-on-ai-arena** by a Cloudflare Worker.

Visiting the `pages.dev` origin directly **will not render correctly**
(HTML asset refs are prefixed with `/ai-on-ai-arena/`, but files live
at the origin root) — the `pages.dev` URL is effectively a private
origin reached only through the Worker.

## Prerequisites

- Node 22+
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI
- Logged in to Cloudflare: `npx wrangler login`

## Deploying the Arena (the Pages project)

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name=aionai-arena \
  --branch=master \
  --commit-dirty=true
```

Each deploy gets a preview URL; the production alias `aionai-arena.pages.dev`
points to the latest deploy from the production branch.

## Deploying the Worker (one-time, then only if the proxy logic changes)

```bash
cd worker
npx wrangler deploy
```

`worker/wrangler.toml` declares both the Worker script and the route
binding (`shimin.io/ai-on-ai-arena*`). The Worker strips the
`/ai-on-ai-arena` prefix before forwarding each request to
`aionai-arena.pages.dev`.

## One-time setup (already done)

```bash
npx wrangler pages project create aionai-arena --production-branch=master
cd worker && npx wrangler deploy
```

## If the custom path ever changes

Three places need to agree on the path:

1. `astro.config.mjs` — `base: '/ai-on-ai-arena'`
2. `worker/index.js` — `const PREFIX = '/ai-on-ai-arena'`
3. `worker/wrangler.toml` — `routes = [{ pattern = "shimin.io/ai-on-ai-arena*", ... }]`

Update all three, rebuild Arena, redeploy Arena (`wrangler pages deploy`),
redeploy Worker (`cd worker && wrangler deploy`).

## Adding a custom domain to the Arena itself

Skip this unless you want a standalone URL like `arena.shimin.io` in
addition to the path-based one. See the Cloudflare dashboard:
**Workers & Pages → aionai-arena → Custom domains**. Point DNS at
the Pages project, then update `site`/`base` in `astro.config.mjs`
to reflect the new canonical URL.

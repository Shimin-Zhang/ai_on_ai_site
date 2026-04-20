# Deployment

The Arena is deployed as a standalone Cloudflare Pages project at
**https://aionai-arena.pages.dev**.

## Prerequisites

- Node 22+ (matches `engines.node` in `package.json`)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI (used via `npx`)
- Logged in to Cloudflare: `npx wrangler login`

## Deploying

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name=aionai-arena \
  --branch=master \
  --commit-dirty=true
```

`commit-dirty=true` lets Wrangler deploy uncommitted working-tree changes
without complaining. Drop it for clean-tree deploys.

Each deploy gets a versioned preview URL (e.g.
`https://<hash>.aionai-arena.pages.dev`); the production alias
`aionai-arena.pages.dev` automatically points to the latest deploy from
the production branch.

## One-time setup (already done)

```bash
npx wrangler pages project create aionai-arena --production-branch=master
```

The project is connected directly via Wrangler (no Git integration),
so deploys only happen when `wrangler pages deploy` is run locally or
from CI.

## Adding a custom domain

In the Cloudflare dashboard: **Workers & Pages → aionai-arena →
Custom domains → Set up a custom domain**. Point DNS (CNAME or, if
the zone is on Cloudflare, automatic) at the Pages project.

Then update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://your-custom-domain.com',
  // ...
});
```

Rebuild and redeploy so OG/canonical URLs reflect the new domain.

## Path-subsite variant (shimin.io/ai-on-ai-arena)

Not used yet — shimin.io isn't managed on Cloudflare. If this changes,
or if the host running shimin.io supports path rewrites:

1. Set `base: '/ai-on-ai-arena'` and `site: 'https://shimin.io'` in `astro.config.mjs`.
2. Update `src/pages/index.astro` so canonical/OG URLs include the base path.
3. Rebuild and redeploy.
4. On the shimin.io host, add a path rewrite from `/ai-on-ai-arena/*`
   to this Pages deployment, stripping the `/ai-on-ai-arena` prefix
   before forwarding.

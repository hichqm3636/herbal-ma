# Herbal.ma Deployment Operations

This is the repository deployment and operations reference. It records the approved production contract. It does not mean a Vercel project, Git integration, or domain cutover has already been configured.

## Production build contract

- Package manager: npm
- Node: 22.19.0-compatible (`package.json` engines `^22.19.0`)
- Install: `npm ci`
- Build: `npm run build`
- Output directory: `dist/`
- Output type: Astro static HTML and assets
- No Astro adapter
- No application server
- No required environment variables

## Validation contract

Local and review validation:

```bash
npm run validate
node --test tests/search.test.mjs
```

`npm run validate` runs format check plus the checked static build. Search tests are a separate command and must be run as well.

Repository CI uses the same commands. CI validates repository changes only. It does not deploy.

## Hosting decision

Vercel is the approved production host.

- Static deployment of `dist/`
- No `@astrojs/vercel` adapter
- No serverless functions
- No deployment environment variables

Account and Git integration remain pending Phase 12C. This file does not claim that configuration is complete.

## Intended Vercel project settings

Use these settings when the Vercel project is created:

| Setting | Value |
| --- | --- |
| Framework | Astro |
| Root | repository root |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |
| Node | 22.x satisfying `package.json` `>= 22.19.0` |
| Production branch | `main` |

## Deployment workflow

1. Open a pull request from a working branch.
2. Vercel creates a Preview deployment (after Git integration is enabled).
3. A human reviews the Preview and the repository change.
4. Merge to `main`.
5. Vercel deploys Production automatically from `main`.

Preview deployment does not constitute editorial approval. A successful Preview or Production build never substitutes for recorded human review and approval of health content.

## Production hostname

Canonical production origin:

- `https://herbal.ma`

Desired secondary-host behavior, once domain cutover is approved:

- `https://www.herbal.ma/*` → permanent redirect to `https://herbal.ma/*`

Do not treat a Vercel `*.vercel.app` URL as the canonical production host.

## Current-domain migration warning

`herbal.ma` currently has a legacy deployment. Domain cutover must not occur merely because a Vercel deployment succeeds.

Before any DNS change:

- inventory current DNS
- preserve existing records
- verify mail usage
- preserve MX, TXT, and CAA unless deliberately changed
- record rollback values
- inventory legacy URLs

DNS and domain cutover are a separate human-approved operational action. Do not connect `herbal.ma` as a side effect of Preview or Production success.

## Legacy URL policy

The current live hostname serves a storefront, not this knowledge platform. After cutover:

- do not redirect old product, collection, or page URLs to the homepage
- redirect only when a real equivalent Herbal.ma URL exists
- otherwise allow correct 404 or 410 behavior
- preserve the [SEO.md](SEO.md) redirect policy: permanent redirects only to a clear successor; never redirect removed content to an unrelated page or the homepage merely to retain traffic

## Preview QA checklist

Exercise these surfaces on a Preview deployment:

- `/`
- `/ar/`
- `/en/`
- `/ar/search/`
- `/en/search/`
- a representative Article
- a representative Ingredient
- a representative Category
- 404
- `robots.txt`
- `sitemap.xml`
- canonical and hreflang
- Arabic RTL
- English LTR
- keyboard navigation
- Search
- mobile and desktop

Preview is for technical and editorial review. It is not publication approval.

## Production QA checklist

After Production is live on the canonical host, verify:

- build succeeds
- 44 HTML pages
- 41 sitemap `loc` entries
- HTTPS
- apex hostname `herbal.ma`
- `www` → apex
- HTTP → HTTPS
- correct canonical URLs
- hreflang
- `x-default` on the homepage cluster only
- Search `noindex`
- Article JSON-LD
- no fixtures or drafts in public output
- Search works
- no external Search requests

## Rollback

Treat application rollback and DNS rollback as separate actions.

**Application rollback:** restore the previous Vercel Production deployment, or revert the Git commit on `main`. This restores a previous application artifact. It does not restore a previous DNS destination.

**DNS rollback:** restore the recorded pre-cutover DNS values. This is the only way to send `herbal.ma` back to the previous hosting destination.

Application rollback does not restore a previous DNS destination.

## Environment variables

Current production requirement: none.

Do not invent deployment or runtime environment variables.

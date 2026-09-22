# Herbal.ma

Herbal.ma is an independent, content-first knowledge platform about dietary supplements, herbs, nutrition, wellness, product labels, and formulations. Arabic is the primary language and English is the secondary language.

## Current status

Phases 0–11 are complete. Herbal.ma is a bilingual Arabic/English knowledge platform: `/` is the language-choice gateway, `/ar/` and `/en/` are public localized homepages, and production Articles, Ingredients, and Categories are published in both languages. Static Search exists at `/ar/search/` and `/en/search/`.

Phase 12 deployment work is in progress. Deployment is not yet complete: Vercel is the approved host, but account configuration, Git integration, and domain cutover have not been done. Operational details are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Local development

Requirements:

- Node.js 22 (even-numbered release line; Node `>=22.19.0` is required)
- npm (this repository does not use pnpm or yarn)

```bash
npm install
npm run dev
npm run validate:content
npm run validate
npm run build
```

| Command | Purpose |
| --- | --- |
| `npm install` | Install the project dependencies |
| `npm run dev` | Start the local development server |
| `npm run validate:content` | Run Astro sync, collection schema validation, and content-integrity checks |
| `npm run check` | Run content validation, then `astro check` |
| `npm run build` | Run the checked workflow, then emit static HTML to `dist/` |
| `npm run validate` | Run format check plus the checked static build |
| `npm run preview` | Serve the static build locally |

## Architecture and boundaries

Astro and TypeScript generate a static site. Arabic is primary (RTL) and English is secondary (LTR). Content lives in Markdown/MDX collections. There is no application database, authentication, CMS, application server, or runtime API. Herbialife and Clinora remain external.

## Documentation map

- [PROJECT.md](PROJECT.md) — mission, scope, users, boundaries, and success criteria
- [ARCHITECTURE.md](ARCHITECTURE.md) — approved technical direction and architectural boundaries
- [CONTENT_MODEL.md](CONTENT_MODEL.md) — conceptual content domain model
- [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) — evidence, review, publishing, and health-content rules
- [SEO.md](SEO.md) — bilingual URL, indexing, metadata, and internal-linking principles
- [DESIGN.md](DESIGN.md) — design tokens, typography, layout, and visual component rules
- [DEPLOYMENT.md](DEPLOYMENT.md) — production build, hosting, Preview/Production, and rollback
- [AGENTS.md](AGENTS.md) — mandatory instructions for AI coding agents
- [docs/adr/](docs/adr/) — accepted architecture decision records

The foundational source of truth is **“Herbal.ma — Project Foundation & Technical Architecture v1.0”**, dated 20 September 2026. The documents in this repository translate that specification into an operational documentation baseline.

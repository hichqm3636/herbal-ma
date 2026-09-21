# Herbal.ma

Herbal.ma is an independent, content-first knowledge platform about dietary supplements, herbs, nutrition, wellness, product labels, and formulations. Arabic is the primary language and English is the secondary language.

## Current status

The project is in **Phase 5: technical SEO foundation**. `/`, `/ar/`, and `/en/` exist as technical placeholder pages that establish explicit locale routing, Arabic RTL, and English LTR. They are not the real Herbal.ma website.

Article, Ingredient, and Category detail routes are supported for public entries and now emit deterministic titles, descriptions, absolute self-canonical URLs, and reciprocal hreflang when a public counterpart exists. Article pages also emit conservative JSON-LD. A static `sitemap.xml` and `robots.txt` are generated from the configured production origin. Committed Markdown files remain non-production fixtures and are not public. Production content does not exist yet. Finished site UX does not exist yet. Deployment is not configured. Hosting, database, authentication, CMS, and CI/CD have not been configured.

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

Phase 5 establishes the technical SEO foundation only. It is not the finished Herbal.ma website. Production content, finished site UX, and deployment are still not implemented.

## Documentation map

- [PROJECT.md](PROJECT.md) — mission, scope, users, boundaries, and success criteria
- [ARCHITECTURE.md](ARCHITECTURE.md) — approved technical direction and architectural boundaries
- [CONTENT_MODEL.md](CONTENT_MODEL.md) — conceptual content domain model
- [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) — evidence, review, publishing, and health-content rules
- [SEO.md](SEO.md) — bilingual URL, indexing, metadata, and internal-linking principles
- [AGENTS.md](AGENTS.md) — mandatory instructions for AI coding agents
- [docs/adr/](docs/adr/) — accepted architecture decision records

The foundational source of truth is **“Herbal.ma — Project Foundation & Technical Architecture v1.0”**, dated 20 September 2026. The documents in this repository translate that specification into an operational documentation baseline.

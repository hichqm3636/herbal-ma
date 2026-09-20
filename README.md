# Herbal.ma

Herbal.ma is an independent, content-first knowledge platform about dietary supplements, herbs, nutrition, wellness, product labels, and formulations. Arabic is the primary language and English is the secondary language.

## Current status

The project is in **Phase 1: technical skeleton**. A minimal Astro + TypeScript foundation exists so the repository can install, type-check, format, and emit static HTML. The real Herbal.ma website, content system, language routes, layouts, and production content have not been built. Hosting, database, authentication, CMS, and CI/CD have not been configured.

## Local development

Requirements:

- Node.js 22 (even-numbered release line; Node `>=22.19.0` is required)
- npm (this repository does not use pnpm or yarn)

```bash
npm install
npm run dev
npm run validate
npm run build
```

| Command | Purpose |
| --- | --- |
| `npm install` | Install the Phase 1 dependencies |
| `npm run dev` | Start the local development server |
| `npm run validate` | Run format check, `astro check`, and the production build |
| `npm run build` | Emit static HTML to `dist/` |
| `npm run preview` | Serve the static build locally |

Phase 1 is a buildable technical fixture only. It is not the Herbal.ma website.

## Documentation map

- [PROJECT.md](PROJECT.md) — mission, scope, users, boundaries, and success criteria
- [ARCHITECTURE.md](ARCHITECTURE.md) — approved technical direction and architectural boundaries
- [CONTENT_MODEL.md](CONTENT_MODEL.md) — conceptual content domain model
- [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) — evidence, review, publishing, and health-content rules
- [SEO.md](SEO.md) — bilingual URL, indexing, metadata, and internal-linking principles
- [AGENTS.md](AGENTS.md) — mandatory instructions for AI coding agents
- [docs/adr/](docs/adr/) — accepted architecture decision records

The foundational source of truth is **“Herbal.ma — Project Foundation & Technical Architecture v1.0”**, dated 20 September 2026. The documents in this repository translate that specification into an operational documentation baseline.

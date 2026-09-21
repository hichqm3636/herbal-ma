# Herbal.ma

Herbal.ma is an independent, content-first knowledge platform about dietary supplements, herbs, nutrition, wellness, product labels, and formulations. Arabic is the primary language and English is the secondary language.

## Current status

The project is in **Phase 2: content architecture**. Typed Markdown content collections, collection schemas, and build-time content-integrity validation exist. The committed Markdown files are non-production fixtures used only to exercise that architecture.

The public content website is not implemented. There is no homepage, no `/ar/` or `/en/` content routes, and no production copy. Hosting, database, authentication, CMS, and CI/CD have not been configured.

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

Phase 2 establishes the content architecture only. It is not the Herbal.ma website.

## Documentation map

- [PROJECT.md](PROJECT.md) — mission, scope, users, boundaries, and success criteria
- [ARCHITECTURE.md](ARCHITECTURE.md) — approved technical direction and architectural boundaries
- [CONTENT_MODEL.md](CONTENT_MODEL.md) — conceptual content domain model
- [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) — evidence, review, publishing, and health-content rules
- [SEO.md](SEO.md) — bilingual URL, indexing, metadata, and internal-linking principles
- [AGENTS.md](AGENTS.md) — mandatory instructions for AI coding agents
- [docs/adr/](docs/adr/) — accepted architecture decision records

The foundational source of truth is **“Herbal.ma — Project Foundation & Technical Architecture v1.0”**, dated 20 September 2026. The documents in this repository translate that specification into an operational documentation baseline.

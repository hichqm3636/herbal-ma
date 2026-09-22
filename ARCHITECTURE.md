# Herbal.ma Architecture

## Status and scope

This document records the approved architectural direction for Herbal.ma. It defines boundaries for future implementation; it does not initialize or design that implementation.

## Approved architecture

| Concern | Approved direction |
|---|---|
| Web framework | Astro |
| Language | TypeScript |
| Rendering | Static-first |
| Content structure | Structured content collections |
| Initial content source | Markdown/MDX stored with the project |
| Application database in v1 | None |
| Authentication in v1 | None |
| CMS in v1 | None |
| Notion runtime dependency | Prohibited |
| Source control | GitHub repository `hichqm3636/herbal-ma` |
| Production hosting | Vercel |
| Deployment mechanism | Vercel Git integration |
| Repository CI | Validates only; never deploys |
| Public languages | Arabic primary; English secondary |

Astro and TypeScript are accepted choices, but Astro initialization, package selection, project layout, and build configuration belong to a later phase.

## Static-first rendering

Public content should be generated as static output wherever the approved v1 product can support it. Content pages must not require a live database, authentication service, CMS request, Notion request, or Herbialife/Clinora service at page-request time.

Interactive behavior may be introduced later only when it has a concrete use case and does not quietly turn the site into an application-first system.

Basic search or content discovery in v1 must remain compatible with static output and must not introduce an application database. Any minimal analytics mechanism remains deferred to implementation review and is not selected.

## Static search

The v1 search mechanism is now selected and recorded in [ADR-010](docs/adr/ADR-010-static-client-search.md):

- `/ar/search/` and `/en/search/` are statically generated localized pages.
- Each page embeds its own locale's public search dataset, built through the content-source boundary at build time. Only `published` and `needs-update` entries enter it.
- Matching, ranking, and Arabic and English normalization are project-owned and run in page-local client JavaScript.
- There is no database, no search API, no external search service, and no search dependency.

Search is the only v1 capability permitted to require JavaScript. All other public reading and navigation remains static HTML.

## Structured content collections

Articles and related content entities must have validated, structured metadata rather than relying on unstructured documents alone. Markdown/MDX is the initial authoring and storage format. The conceptual model is defined in [CONTENT_MODEL.md](CONTENT_MODEL.md); this architecture document does not prescribe future code schemas or file layout.

## Content-source abstraction

The presentation and domain layers must consume content through a clear project-owned boundary. Initial Markdown/MDX storage must not be assumed throughout page and component code.

The purpose of this boundary is replaceability and testability, not a generic repository framework. It must remain small and reflect actual content needs. A future source change—such as an approved CMS—must be possible without rewriting the public domain model, routes, or editorial rules.

No source change is approved by this statement. Markdown/MDX remains the only approved initial source.

## No database, authentication, CMS, or Notion runtime

Version 1 has no application database and no user authentication. A CMS has not been approved. Notion may be used separately for planning or editorial coordination, but the published site must not depend on Notion at build or request time unless a later accepted ADR explicitly changes this rule.

## External systems

Herbialife and Clinora are external systems with different responsibilities:

- **Herbialife:** brand, products, and direct commercial activity.
- **Clinora:** commerce and marketplace activity.
- **Herbal.ma:** independent education and content discovery.

Herbal.ma must not share their databases, authentication, or business logic. Future links or integrations must be optional, explicit, and replaceable. Failure or change in either external system must not prevent Herbal.ma content from being built or read.

## Environment concept

- **Local:** a developer or agent works and validates changes locally. Local work must not depend on production services.
- **Preview:** a reviewable, non-production Vercel deployment from a pull request or branch. Preview is not an editorial-approval bypass.
- **Production:** the public static site deployed by Vercel from `main`. The canonical hostname remains `https://herbal.ma`.

## Hosting and deployment

Approved architecture:

- Vercel is the production host.
- Git integration is the deployment mechanism.
- Pull requests use Preview deployments.
- `main` is the Production branch.
- Repository CI validates pull requests and pushes to `main`. It does not deploy.
- Production remains static `dist/` output. No Astro adapter, application server, database, or runtime API is introduced.
- There are no required environment variables.

Account configuration is still pending Phase 12C. This document does not claim that a Vercel project, Git integration, or domain mapping has already been configured. DNS and domain cutover remain a later human-approved operational action. Operational detail is in [DEPLOYMENT.md](DEPLOYMENT.md) and [ADR-011](docs/adr/ADR-011-vercel-git-deployment.md).

## Architectural boundaries

Future implementation must preserve these boundaries:

1. Content and editorial truth are distinct from page presentation.
2. Locale and translation relationships are domain concerns, not visual-only behavior.
3. Arabic RTL and English LTR are both foundational requirements.
4. Content source access is isolated behind a small project-owned boundary.
5. Public content delivery is static-first.
6. Herbialife and Clinora remain external and loosely coupled.
7. Health-content approval cannot be bypassed by build, automation, or integration code.
8. Deferred application capabilities must not be smuggled in through utilities, dependencies, or data models.

## Technical-debt policy

- Do not accept avoidable debt merely to start faster.
- Do not add abstraction in anticipation of hypothetical scale or providers.
- Record an intentional compromise when it affects correctness, maintainability, security, accessibility, editorial safety, or future architecture.
- Every recorded debt item must state its reason, impact, owner or decision-maker, and review trigger; a date is required when a time commitment exists.
- A shortcut must not violate an accepted ADR or editorial-safety rule. Such a change requires a decision, not a debt note.
- Resolve debt according to demonstrated risk and impact, not cosmetic preference.

## Definition of Done

Once implementation begins, a change is complete only when, as applicable:

- it satisfies the approved scope and relevant ADRs;
- Arabic RTL and English LTR behavior have both been considered and verified;
- content relationships, locale behavior, URLs, metadata, and editorial state remain valid;
- no database, authentication, CMS, or runtime service dependency has been introduced without approval;
- health-content automation still requires recorded human approval;
- available project checks pass;
- the change has been reviewed in an appropriate local or preview environment;
- accessibility, performance, privacy, security, and SEO effects have been considered at the level relevant to the change;
- documentation and ADRs are updated when behavior or architecture changes;
- any intentional debt is recorded according to this policy.

Phase 0 itself is done when the requested documentation package exists, is internally consistent, contains no application code, and is ready for human review.

# Instructions for AI Coding Agents

These instructions apply to every AI agent working in this repository and to all files below this directory.

## Source of truth and required reading

Before significant work:

1. Read [PROJECT.md](PROJECT.md) and [ARCHITECTURE.md](ARCHITECTURE.md) in full.
2. Read the documentation relevant to the task, including [CONTENT_MODEL.md](CONTENT_MODEL.md), [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md), and [SEO.md](SEO.md) when applicable.
3. Check [docs/adr/](docs/adr/) before proposing or making an architectural change.

The foundational specification is **“Herbal.ma — Project Foundation & Technical Architecture v1.0”**. Repository documents and accepted ADRs must remain consistent with it. If documents conflict, stop, identify the conflict, and request human direction; do not silently choose a new architecture.

## Mandatory architectural constraints

- Preserve Astro and TypeScript as the approved foundation.
- Preserve the static-first architecture.
- Preserve Arabic as the primary language and English as the secondary language.
- Treat Arabic RTL and English LTR as first-class requirements in content, layout, navigation, metadata, and testing.
- Keep Markdown/MDX structured content collections as the initial content source.
- Keep content-source access behind a small project-owned boundary; do not overgeneralize it.
- Do not introduce a database without explicit approval and an accepted ADR.
- Do not introduce authentication without explicit approval.
- Do not introduce a CMS or runtime/build-time dependency on Notion without explicit approval and an accepted ADR.
- Keep Herbialife and Clinora external and loosely coupled. Do not share their databases, authentication, or business logic.
- Do not turn Herbal.ma into an application-first product, store, marketplace, or product catalogue.

## Scope and dependency discipline

- Work only within the requested phase and task.
- Do not add speculative features, infrastructure, data models, routes, integrations, or configuration.
- Do not add a dependency without a concrete current use case. Explain the use case and why existing platform capabilities are insufficient.
- Prefer native framework or platform capabilities when they meet the need.
- Avoid unnecessary abstraction. Create an abstraction only for an approved boundary or demonstrated repetition/change pressure.
- Prefer reversible decisions. Isolate choices that may change and avoid premature lock-in.
- Do not convert deferred features into “foundational” code.
- If a requested change contradicts an accepted decision, flag it before implementation.

## Content and editorial safety

- Follow [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md) for every health-related content workflow.
- Never bypass editorial approval for automated or AI-assisted health content.
- Never treat AI output as evidence, author approval, reviewer approval, or permission to publish.
- Preserve lifecycle state, risk classification, sources, authorship, review information, and commercial disclosures.
- Do not allow a build, deployment, webhook, scheduled process, or CMS state to substitute for recorded human approval.
- Keep educational content independent from Herbialife product promotion and Clinora commerce.

## Change process

- Inspect existing files and repository state before editing.
- Make the smallest coherent change that satisfies the approved requirement.
- Do not silently alter stable URLs, locale behavior, content semantics, or translation relationships.
- Check relevant ADRs before architectural changes. Add or supersede an ADR when an approved architectural decision changes; do not rewrite history by editing the old decision into a different one.
- Update PROJECT.md, ARCHITECTURE.md, related policy documents, and ADR indexes when an approved decision changes their meaning.
- Document genuine ambiguity rather than inventing a product or architecture decision.

## Completion and verification

Once project checks exist, run the relevant checks before considering implementation complete. Do not claim completion when checks fail; report the failure and its scope.

Also verify, as applicable:

- Arabic RTL and English LTR behavior;
- locale-prefixed routing, canonical URLs, and hreflang relationships;
- static output and absence of unauthorized runtime dependencies;
- accessibility and keyboard behavior;
- content validation and publication-state enforcement;
- editorial approval enforcement for health content;
- documentation consistency.

Apply the Definition of Done in [ARCHITECTURE.md](ARCHITECTURE.md). A successful implementation must satisfy both technical checks and the applicable editorial boundary.

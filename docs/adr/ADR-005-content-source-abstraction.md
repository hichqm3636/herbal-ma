# ADR-005: Isolate Content-Source Access

**Status:** Accepted

## Context

Markdown/MDX is the approved initial source, but page and domain behavior should not become unnecessarily coupled to storage details. A future approved source change should not require rewriting the public content model.

## Decision

Access content through a small, project-owned content-source boundary aligned with the domain entities. Use Markdown/MDX content collections as the initial implementation behind that boundary.

## Consequences

- Presentation code should consume normalized domain content rather than scatter storage-specific access.
- The boundary must stay narrow and must not become a speculative generic repository framework.
- This decision does not approve a CMS, Notion dependency, database, or multiple simultaneous providers.

## Alternatives Considered

- Couple all pages directly to filesystem and collection details: rejected because it spreads a replaceable concern.
- Build a provider-agnostic content platform in advance: rejected as overengineering.
- Use Notion directly at runtime: rejected because Herbal.ma must not depend on Notion to serve public content.

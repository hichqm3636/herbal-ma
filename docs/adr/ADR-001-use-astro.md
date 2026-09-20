# ADR-001: Use Astro

**Status:** Accepted

## Context

Herbal.ma is a content-first bilingual knowledge platform. It needs structured content, strong static output, good performance, and limited client-side complexity.

## Decision

Use Astro as the web framework and TypeScript as the implementation language.

## Consequences

- Future implementation should use Astro's static and content-oriented capabilities.
- Framework initialization and package choices remain outside Phase 0.
- A framework change requires a new accepted ADR.

## Alternatives Considered

- A general-purpose application framework: rejected because the approved v1 is content-first and static-first.
- A custom static-site implementation: rejected because it would create unnecessary foundational work.

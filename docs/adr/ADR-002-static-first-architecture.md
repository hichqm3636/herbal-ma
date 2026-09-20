# ADR-002: Adopt a Static-First Architecture

**Status:** Accepted

## Context

Herbal.ma's approved v1 consists primarily of public educational content and does not require accounts, transactions, or request-time personalization.

## Decision

Generate public content as static output by default. Request-time services may be added only for a demonstrated, explicitly approved need.

## Consequences

- Public content remains available without a live application database, CMS, or external business system.
- Performance, reliability, caching, and operational simplicity benefit from static delivery.
- Features that inherently require server-side runtime behavior remain deferred or require a later decision.

## Alternatives Considered

- Server-render every request: rejected because it adds runtime dependency without a v1 requirement.
- Client-render the content application: rejected because it weakens the content-first delivery model and adds unnecessary complexity.

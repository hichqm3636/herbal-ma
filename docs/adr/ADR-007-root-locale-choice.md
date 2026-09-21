# ADR-007: Use a Static Root Locale-Choice Page

**Status:** Accepted

## Context

Arabic is the primary language and English is the secondary language. ADR-003 already requires explicit language-prefixed URLs under `/ar/` and `/en/`. Root URL behavior was previously unresolved: the site needed a predictable, static way to present both languages without privileging an invisible redirect or browser-inferred choice.

## Decision

Treat `/` as a static locale-choice page.

- Arabic appears first.
- English appears second.
- There is no automatic redirect from `/` to a locale root.
- There is no browser-language detection, `Accept-Language` negotiation, cookie or `localStorage` preference, or client-side JavaScript.
- `/ar/` and `/en/` remain the canonical locale roots structurally.
- SEO treatment such as `x-default` remains deferred to the SEO implementation phase.

## Consequences

- Users choose a language explicitly.
- Static output remains predictable and free of request-time locale negotiation.
- The repository gains one additional static root page.
- Future SEO work can decide `x-default` independently of this routing decision.
- `/` is not the Arabic homepage itself.

## Alternatives Considered

- Redirect `/` to `/ar/`: rejected because it removes an explicit choice and treats the root as an Arabic homepage.
- Browser-aware redirect: rejected because it is not static-first, depends on request headers or client-side detection, and can surprise shared-link readers.

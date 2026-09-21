# ADR-009: Use Localized Homepages in a Homepage Language Cluster

**Status:** Accepted

## Context

ADR-007 treats `/` as a static language-choice page and keeps `/ar/` and `/en/` as structural locale roots. Those locale roots were implemented as temporary placeholders. Phase 7 needs durable public homepages without turning `/` into a third localized homepage or inferring language from the browser.

## Decision

Keep `/` as the static language gateway and make `/ar/` and `/en/` the canonical public localized homepages.

- `/` remains a language-choice page. It does not redirect, detect browser language, or become the Arabic homepage.
- `/ar/` and `/en/` are indexable, self-canonical public homepages.
- Both homepages and `/` emit the same homepage alternate cluster:
  - `hreflang="ar"` → `https://herbal.ma/ar/`
  - `hreflang="en"` → `https://herbal.ma/en/`
  - `hreflang="x-default"` → `https://herbal.ma/`
- `x-default` applies only to this homepage language cluster. Detail pages and collection listings do not emit it.
- There is no browser-language redirect.

## Consequences

- Homepage URLs are sitemap entries.
- Locale roots are indexable.
- Future visual design can change without changing these URL semantics.
- Explicit locale choice remains stable.
- This decision extends ADR-007. It does not replace the root language-gateway rule.

## Alternatives Considered

- Keep `/ar/` and `/en/` as noindex placeholders: rejected because readers need real localized entry points.
- Redirect `/` to `/ar/`: rejected by ADR-007 because it removes an explicit language choice.
- Emit `x-default` on every bilingual page: rejected because collection and detail relationships are not the homepage language cluster.

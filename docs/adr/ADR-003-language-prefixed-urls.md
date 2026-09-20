# ADR-003: Use Language-Prefixed URLs

**Status:** Accepted

## Context

Herbal.ma serves Arabic as its primary language and English as its secondary language. Each locale needs explicit routing, direction, metadata, and search-engine signals.

## Decision

Place all indexable Arabic content under `/ar/` and all indexable English content under `/en/`. Link translated counterparts with a stable `translationKey` and use appropriate canonical and hreflang signals.

## Consequences

- Locale is explicit and stable in every public content URL.
- Arabic RTL and English LTR behavior can be handled deliberately.
- Each localized page is a separate canonical document and may have an independent lifecycle state.
- Root URL behavior and lower-level route taxonomy remain to be resolved later.

## Alternatives Considered

- Unprefixed primary-language URLs: rejected because it creates asymmetric locale handling.
- Automatic locale selection without stable language URLs: rejected because it reduces user control and complicates indexing and sharing.
- Separate language domains: rejected as unnecessary for the approved v1.

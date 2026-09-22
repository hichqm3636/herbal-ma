# ADR-010: Use Static Client-Side Search

**Status:** Accepted

## Context

PROJECT.md includes "basic content discovery and search that can operate from static content without an application database" in the approved v1 scope, but ARCHITECTURE.md explicitly deferred the choice: the exact search mechanism was left to implementation review and was not selected in Phase 0.

Phase 11 needs that decision. The public corpus is small — 16 public Articles, Ingredients, and Categories per locale — and the static-first architecture (ADR-002), the no-database rule (ADR-004), and the content-source boundary (ADR-005) all remain in force. Arabic is the primary language, so Arabic matching behavior is a first-class requirement rather than a library default.

## Decision

Implement Search as static, localized, client-matched pages:

- `/ar/search/` and `/en/search/` are statically generated pages, one per locale, with no other Search route.
- Each page embeds its own locale's public search dataset at build time, read through `listPublicEntries` so publication truth is not duplicated. Only `published` and `needs-update` entries enter the dataset.
- Indexed fields are Article `title` and `summary`, Ingredient `name`, `aliases`, and `summary`, and Category `name` and `description`. Article body text is not indexed.
- Normalization, matching, and ranking are project-owned, deterministic, and defined in `src/lib/search.ts`. Arabic folds tatweel, harakat, alef variants, and alef maqsura, and deliberately does not fold ة, ه, ؤ, ئ, or standalone ء, because those change meaning.
- Matching is normalized phrase matching with an AND token fallback. There is no fuzzy matching, stemming, synonym list, or Boolean syntax.
- Matching runs in page-local client JavaScript on the Search page only.
- There is no database, no server or API endpoint, no external search service, and no third-party search library.

## Consequences

- Search results require JavaScript. The Search page is a static HTML shell with a real GET form and a `noscript` statement; it is the only v1 capability allowed this dependency.
- All other reading and navigation remains static HTML and continues to work without JavaScript.
- Search pages are `noindex,follow`, self-canonical per locale, and excluded from the sitemap. Query URLs canonicalize to the query-free locale Search URL.
- The query travels as a normal `?q=` GET parameter, so it may appear in ordinary HTTP and CDN access logs. Herbal.ma itself stores no query, keeps no history, and sends no query to any third party.
- Runtime dependencies remain `astro` only.
- The mechanism should be revisited only when a demonstrated need justifies it — a materially larger corpus, inadequate ranking quality, an approved decision to index body text, documented typo-failure patterns, or additional approved languages. Replacing it requires a new ADR.

## Alternatives Considered

- **Fuse.js:** rejected. It adds a dependency and a ranking model the project does not own, and its fuzzy-by-default behavior produces misleading matches at this corpus size.
- **Pagefind:** rejected for v1. It is a strong option for a large corpus with body indexing, but it adds a generated index, a WASM runtime, and build complexity, and it weakens project control over Arabic normalization and ranking.
- **A server or external search service:** rejected. It would introduce a runtime dependency, contradict ADR-002 and ADR-004, and send reader queries to a third party.
- **Indexing Article body text:** rejected for v1. The current titles, names, summaries, and descriptions cover the expected queries, while a body index would multiply payload size and produce common-word matches.

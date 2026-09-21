# ADR-008: Use Stable Entity-Based Public Content URLs

**Status:** Accepted

## Context

Locale prefixes are already fixed under `/ar/` and `/en/` by ADR-003. Lower public taxonomy below those prefixes was deferred. Article, Ingredient, and Category entries now need durable public detail URLs that remain stable, locale-explicit, and independent of filenames, collection IDs, and `translationKey`.

## Decision

Use a shared ASCII entity namespace with locale-specific public slugs:

- `/{locale}/articles/{slug}/`
- `/{locale}/ingredients/{slug}/`
- `/{locale}/categories/{slug}/`

Rules:

- Entity path segments are ASCII and shared across locales.
- The public slug is locale-specific and taken from the entry's own `slug`.
- A translation counterpart URL uses that counterpart's own slug, never a copied slug.
- `translationKey` is not exposed in public URLs.
- Collection IDs and filenames are not exposed in public URLs.
- Author and Source public routes are deferred.

Phase 4 implements Article, Ingredient, and Category detail pages only. Entity index/listing pages are out of scope.

## Consequences

- Public routing is stable and predictable.
- Slugs cannot collide across Articles, Ingredients, and Categories.
- Arabic and English keep routing parity under the same entity namespace.
- Future SEO and sitemap path generation can reuse this taxonomy without inventing a second public URL model.

## Alternatives Considered

- Localized entity segments such as `/ar/مقالات/{slug}/`: rejected because it splits the namespace, complicates tooling, and makes counterpart paths harder to generate consistently.
- Flat `/{locale}/{slug}/` routes: rejected because they allow cross-entity slug collisions and hide the content type from the URL.

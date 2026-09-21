# ADR-008: Use Stable Entity-Based Public Content URLs

**Status:** Accepted

## Context

Locale prefixes are already fixed under `/ar/` and `/en/`. Lower public taxonomy below those prefixes was previously deferred. Articles, Ingredients, and Categories now need durable public detail URLs that remain stable, locale-explicit, and independent of filenames, collection IDs, and `translationKey`.

## Decision

Use the following public content URL taxonomy:

```
/{locale}/articles/{slug}/
/{locale}/ingredients/{slug}/
/{locale}/categories/{slug}/
```

Rules:

- The entity namespace (`articles`, `ingredients`, `categories`) is a shared ASCII path segment in both locales.
- The public slug is locale-specific and taken from the entry's own `slug` field.
- A translation counterpart URL uses the counterpart entry's own slug; it is never copied from the current page slug.
- `translationKey` is not exposed in public URLs.
- Collection IDs and filenames are not exposed in public URLs.
- Author and Source public routes are deferred.

## Consequences

- Public routing is stable and predictable for the three public content entities.
- Slugs cannot collide across Articles, Ingredients, and Categories.
- Arabic and English route shapes remain in parity.
- Future SEO and sitemap path generation can reuse this taxonomy without inventing a second public path model.

This decision does not implement Phase 5 SEO mechanics such as canonical URLs, hreflang, sitemaps, robots directives, or structured data.

## Alternatives Considered

- Localized entity segments such as `/ar/مقالات/{slug}/`: rejected because it splits the public namespace, complicates shared tooling, and is unnecessary once locale is already explicit in the prefix.
- Flat `/{locale}/{slug}/` routes: rejected because distinct entities could collide on the same slug and because the URL would no longer identify the content type.

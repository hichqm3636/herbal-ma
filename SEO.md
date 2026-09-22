# Herbal.ma SEO Principles

## Scope

Herbal.ma uses technical SEO to make useful, reviewed educational content discoverable. Search visibility must not weaken editorial standards or produce pages whose primary purpose is keyword capture.

Keyword research is outside Phase 0.

## Phase 5 technical SEO foundation

The current implementation uses this production origin as the single site URL source of truth:

- `https://herbal.ma`

That origin is configured as Astro `site` and is passed into URL helpers as `Astro.site`. Public detail pages emit an absolute self-canonical URL for their own locale. They never canonicalize to a translated counterpart.

When a public Arabic and English pair is linked by `translationKey`, both pages emit the same reciprocal `hreflang="ar"` and `hreflang="en"` set. Each URL uses that entry's own slug. Missing counterparts produce no hreflang set. `hreflang="x-default"` is not emitted on content pages or the sitemap. Phase 7 limits `x-default` to the homepage language cluster.

Root and locale-root indexability:

- `/` is indexable and self-canonical at `https://herbal.ma/`.
- `/ar/` and `/en/` are indexable public homepages. Their canonical, hreflang, and sitemap treatment is defined in the Phase 7 homepage language cluster.

The static sitemap includes `https://herbal.ma/`, `https://herbal.ma/ar/`, `https://herbal.ma/en/`, populated collection indexes, and every public Article, Ingredient, and Category URL in `ar` and `en`. Public means `published` or `needs-update` only. Draft, in-review, approved, archived, fixture, unsupported-locale, 404, and empty listings are excluded. Detail entries use `lastmod` of `updatedAt ?? publishedAt`. The root URL, localized homepages, and collection indexes omit `lastmod`. The sitemap does not emit `priority`, `changefreq`, sitemap hreflang, or build timestamps.

`robots.txt` allows crawling of `/` and points to `https://herbal.ma/sitemap.xml`. It is crawling guidance, not an access-control mechanism, and it does not block `/ar/` or `/en/`.

JSON-LD in this phase is Article-only. Ingredient and Category pages do not emit JSON-LD. `needs-update` entries remain public, indexable, self-canonical, hreflang-eligible, sitemap-eligible, and Article JSON-LD eligible where the entity is an Article.

Open Graph tags, Twitter Card tags, and social images are deferred.

## Phase 7 localized homepages

`/ar/` and `/en/` are real public homepages. Each is indexable and self-canonical:

- `https://herbal.ma/ar/`
- `https://herbal.ma/en/`

Both homepages, and the root language gateway, emit the same homepage alternate cluster:

- `hreflang="ar"` → `https://herbal.ma/ar/`
- `hreflang="en"` → `https://herbal.ma/en/`
- `hreflang="x-default"` → `https://herbal.ma/`

`x-default` belongs only to this homepage language cluster. Article, Ingredient, and Category detail pages do not emit it. Article, Ingredient, and Category listing pages do not emit it.

`/ar/` and `/en/` are included in the sitemap without `lastmod`. They do not emit homepage JSON-LD. Open Graph and Twitter metadata remain deferred.

Collection listing rules are unchanged: empty listings stay `noindex,follow` without canonical or hreflang and stay out of the sitemap; populated listings stay indexable, self-canonical, and sitemap-eligible, with reciprocal `ar`/`en` hreflang only when both locale listings are populated.

Detail rules are unchanged: self-canonical URLs, reciprocal hreflang only for a public translation pair, and Article-only JSON-LD.

## Phase 6 collection listings

Public collection indexes exist at:

- `/ar/articles/` and `/en/articles/`
- `/ar/ingredients/` and `/en/ingredients/`
- `/ar/categories/` and `/en/categories/`

Empty listings remain reachable for navigation but use `noindex,follow`. They have no canonical, no hreflang, no JSON-LD, and are excluded from the sitemap.

Populated listings are indexable, emit an absolute self-canonical URL for that collection index, and are sitemap-eligible. They emit reciprocal `hreflang="ar"` and `hreflang="en"` only when both locale listings for that collection are populated. A listing with no public counterpart listing emits no hreflang set. Phase 6 emits no `hreflang="x-default"` and no listing JSON-LD.

Locale roots `/ar/` and `/en/` include structural site and language navigation. Phase 7 makes them indexable public homepages; see the homepage language cluster above.

## Phase 11 search pages

Search exists at two localized URLs:

- `/ar/search/`
- `/en/search/`

Both are `noindex,follow`. Search is a discovery tool, not an editorial publication, and query result pages must not become thin keyword pages.

Each page emits an absolute self-canonical URL for its own locale — `https://herbal.ma/ar/search/` or `https://herbal.ma/en/search/` — and the reciprocal `hreflang="ar"` and `hreflang="en"` pair for those two URLs. Phase 11 emits no `hreflang="x-default"`; that remains limited to the Phase 7 homepage language cluster.

Query-parameter URLs such as `/ar/search/?q=فيتامين` are not separate documents. They declare the same query-free locale Search URL as canonical, so query variants consolidate rather than multiply.

Search pages are excluded from the sitemap, consistent with the rule that sitemaps contain only canonical, public, indexable URLs. They emit no JSON-LD. The language control on a Search page points at the other locale's Search URL and does not carry the query.

## Language-prefixed URLs

- All indexable Arabic content belongs under `/ar/`.
- All indexable English content belongs under `/en/`.
- Arabic pages use RTL presentation; English pages use LTR presentation.
- Public slugs should be readable, stable ASCII slugs.
- Route taxonomy below the locale prefix uses stable entity-based public URLs:
  - `/{locale}/articles/{slug}/`
  - `/{locale}/ingredients/{slug}/`
  - `/{locale}/categories/{slug}/`
- A missing translation must not silently redirect users to, or masquerade as, the other language.

## Canonical strategy

Each indexable page should normally declare a self-referencing absolute canonical URL for its own locale. A translated Arabic and English pair consists of distinct canonical pages; one must not canonicalize to the other.

Canonicalization is used to consolidate genuine duplicates, not to conceal weak, near-duplicate, or untranslated pages. Preview, draft, and non-public variants must not become competing canonical pages.

## hreflang strategy

Published Arabic and English counterparts linked by `translationKey` should declare reciprocal `hreflang="ar"` and `hreflang="en"` annotations. Each set includes the current page when both counterparts are public.

Only published, indexable counterparts may appear in a hreflang set. Hreflang relationships must use absolute canonical URLs and must not be inferred solely from similar slugs.

The site root `/` is a static locale-choice page. Arabic is presented first and English second. There is no automatic redirect from `/` to a locale root. `/` participates in the homepage alternate cluster and is the `hreflang="x-default"` target for that cluster only.

## Sitemap principles

- Sitemaps include only canonical, public, indexable URLs.
- Arabic and English URLs remain explicit and consistent with their published translation relationships.
- Draft, preview, archived, redirected, error, and intentionally non-indexable URLs are excluded.
- `lastmod`, when emitted, reflects a meaningful reviewed content change rather than a routine build time.
- Sitemap partitioning is introduced only when content volume creates a real need.

## Robots principles

- Production robots directives should permit crawling of approved public content.
- Preview, staging, draft, internal, and administrative surfaces must not be indexed.
- `robots.txt` is crawling guidance, not an access-control or confidentiality mechanism.
- Do not block resources required to understand or render public pages.
- Page-level indexing directives and sitemap inclusion must agree.

## Structured data principles

Structured data must describe visible, reviewed page content accurately. It must not add claims, ratings, authors, dates, organizations, or medical meaning absent from the page.

Use the smallest appropriate schema vocabulary. Validate generated markup, keep canonical identifiers stable, and maintain consistency between localized pages, visible metadata, and structured data.

## Article and BlogPosting usage

Use `Article` or the more specific `BlogPosting` only for pages that are genuinely editorial publications. The choice must follow the page's actual role and remain consistent for equivalent content.

Where applicable, markup should reflect the visible headline, description, accountable human author, publication date, meaningful modification date, language, canonical page, and publisher identity. Ingredient, category, navigation, and thin index pages must not be mislabeled as articles merely to obtain search features.

## Metadata conventions

Each indexable page requires locale-appropriate:

- a unique, accurate title;
- a concise description aligned with visible content;
- one clear primary heading;
- canonical URL;
- language and direction declarations;
- share metadata when used (Open Graph, Twitter Cards, and social images remain deferred);
- publication and modification information where applicable.

Metadata must be human-reviewed. Avoid keyword stuffing, unverified benefit language, boilerplate that obscures the page topic, and automatic translation without locale review.

## Internal linking

Internal links should help readers move through a coherent topic cluster among Articles, Ingredients, and Categories. Anchor text must describe the destination and use the current page language.

Do not create indiscriminate automatic links, orphan important pages, or use unrelated links to manipulate ranking. Translation navigation is distinct from topical internal linking.

## Stable URL policy

- Choose a public slug deliberately before first publication.
- Do not include dates, campaign labels, product availability, or temporary taxonomy in a URL unless they are permanently meaningful.
- Editing a title does not by itself require changing the URL.
- Treat a published URL as a durable identifier.
- Record the reason and mapping for any approved URL change.

## Redirect policy

Use a permanent redirect when a published URL is intentionally replaced by a clear successor. Redirect directly to the most relevant equivalent destination, avoid chains and loops, and update internal links and sitemap entries.

Do not redirect removed content to an unrelated page or the homepage merely to retain traffic. When no responsible equivalent exists, return the appropriate removal response and explain the state to users when useful.

## Topic clusters

Topic clusters should be designed around genuine reader questions and the content domain:

- a clear central subject;
- supporting Articles with distinct purposes;
- relevant Ingredient and Category relationships;
- purposeful internal links;
- evidence and risk treatment appropriate to each page.

Clusters must not produce overlapping pages with the same search intent. Editorial usefulness, not page count, determines whether a cluster should expand.

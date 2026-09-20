# Herbal.ma SEO Principles

## Scope

Herbal.ma uses technical SEO to make useful, reviewed educational content discoverable. Search visibility must not weaken editorial standards or produce pages whose primary purpose is keyword capture.

Keyword research is outside Phase 0.

## Language-prefixed URLs

- All indexable Arabic content belongs under `/ar/`.
- All indexable English content belongs under `/en/`.
- Arabic pages use RTL presentation; English pages use LTR presentation.
- Public slugs should be readable, stable ASCII slugs.
- Route taxonomy below the locale prefix will be decided during implementation without changing the language-prefix rule.
- A missing translation must not silently redirect users to, or masquerade as, the other language.

## Canonical strategy

Each indexable page should normally declare a self-referencing absolute canonical URL for its own locale. A translated Arabic and English pair consists of distinct canonical pages; one must not canonicalize to the other.

Canonicalization is used to consolidate genuine duplicates, not to conceal weak, near-duplicate, or untranslated pages. Preview, draft, and non-public variants must not become competing canonical pages.

## hreflang strategy

Published Arabic and English counterparts linked by `translationKey` should declare reciprocal `hreflang="ar"` and `hreflang="en"` annotations. Each set includes the current page when both counterparts are public.

Only published, indexable counterparts may appear in a hreflang set. Hreflang relationships must use absolute canonical URLs and must not be inferred solely from similar slugs.

Whether an `x-default` target is useful depends on the still-unresolved root URL behavior; it is not fixed in Phase 0.

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
- share metadata when used;
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

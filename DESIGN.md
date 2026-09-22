# Herbal.ma Design System

## Status and scope

This document is the design reference for Herbal.ma. It records the visual system
established in Phase 8: tokens, typography, layout, component rules, bidirectional
behavior, and accessibility expectations.

Phase 8 is a visual layer only. It does not change routing, content architecture,
SEO policy, lifecycle logic, public filtering, sitemap semantics, or the Phase 7
information architecture. See [ARCHITECTURE.md](ARCHITECTURE.md) for architectural
boundaries and [SEO.md](SEO.md) for metadata policy.

The system lives in a single stylesheet, `src/styles/global.css`, imported once from
`src/layouts/LocaleLayout.astro`. It uses plain CSS with no build plugins, no CSS
framework, no component library, no icon package, and no external or self-hosted
font files.

## Visual principles

Herbal.ma should read as a serious knowledge publication and a calm reference
library: editorial, botanical, modern, and content-first. It must not read as a
supplement store, a clinic, a pharmaceutical portal, a SaaS landing page, a
lifestyle blog, or an advertising funnel.

1. Readability comes before decoration.
2. Whitespace is generous; content is the dominant visual element.
3. The page sits on a warm neutral canvas rather than clinical white everywhere.
4. Botanical green is a restrained accent, not a brand wash.
5. Content sits on white surfaces with subtle borders.
6. No decorative imagery, icon sets, gradients, glassmorphism, or heavy shadows.
7. Nothing depends on JavaScript or on animation.
8. Arabic and English are equally intentional; neither is an afterthought.
9. Visual hierarchy must not imply medical authority or commercial endorsement.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `--color-canvas` | `#f7f7f2` | Page background |
| `--color-surface` | `#ffffff` | Cards, panels, navigation band |
| `--color-surface-muted` | `#eff4ef` | Attribution panel, disclosure, table headers, code |
| `--color-text` | `#1d2a22` | Body text and headings |
| `--color-text-muted` | `#5e6b63` | Summaries, metadata, citations, prompts |
| `--color-accent` | `#245c3a` | Links, focus ring, accent keyline |
| `--color-accent-strong` | `#1c4a2f` | Link hover, card titles, current navigation item |
| `--color-accent-soft` | `#e4eee6` | Current navigation background, hover fills, quote rule |
| `--color-border` | `#dce4dd` | Surface borders, separators, section rules |
| `--color-warning-bg` | `#fff6df` | Needs-update note background |
| `--color-warning-text` | `#7a5415` | Needs-update note text |
| `--color-warning-border` | `#ead59a` | Needs-update note border |
| `--color-focus` | `#245c3a` | `:focus-visible` outline |

Shadows are derived from the text color at low opacity: `--shadow-sm` for resting
surfaces, `--shadow-md` for the root language gateway panel only.

The needs-update palette is deliberately warm amber, not red. It signals editorial
maintenance, not medical danger.

Contrast: text on canvas is about 13.9:1, muted text on canvas about 5.2:1, accent
on white about 7.9:1, and needs-update text on its own background about 6.3:1. All
foreground and background pairs used for normal text meet WCAG AA.

No further brand colors should be added without a demonstrated need.

## Typography

There is no external font. Both languages use one system stack:

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif`

Arabic and English share the same scale and rhythm. There is no separate decorative
Arabic or English family, and there is no letter-spacing adjustment anywhere,
because negative or wide tracking degrades Arabic.

| Element | Size | Notes |
| --- | --- | --- |
| Body | `1rem` / line-height `1.7` | |
| Article prose paragraph | `1rem` / line-height `1.75` | Long-form reading measure |
| `h1` | `clamp(2rem, 5vw, 3.25rem)` | line-height `1.25` |
| `h2` | `clamp(1.4rem, 3vw, 2rem)` | Page-level section headings |
| Prose `h2` | `clamp(1.35rem, 2.6vw, 1.75rem)` | Inside article bodies |
| `h3` | `1.25rem` | |
| `h4` | `1.125rem` | |
| Lead / summary | `1.125rem`, muted | Deck below a page heading |
| Metadata, citations, notes | `0.9375rem`, muted | |

Headings use `text-wrap: balance`; body copy does not. Heading line-height stays at
or above `1.25` so Arabic ascenders and descenders are never clipped.

## Spacing, radius, and layout tokens

Spacing runs `--space-1` (`0.25rem`) through `--space-8` (`4rem`) on a small,
deliberately short scale. Radii are restrained: `--radius-sm` (`0.5rem`),
`--radius-md` (`0.875rem`), `--radius-lg` (`1.25rem`).

Two container widths carry the whole site:

- `--container-wide` (`72rem`) — site chrome and the localized homepage;
- `--container-reading` (`46rem`) — collection listings and all detail pages.

A single `--gutter` token supplies inline padding and steps up with viewport width:
`1rem` on mobile, `1.5rem` from `48rem`, `2rem` from `64rem`. Nothing uses raw
color or spacing values outside these tokens.

Three width tiers are intentional: the root gateway is a narrow centered panel, the
localized homepage is wide because it presents three destinations side by side, and
reading surfaces stay at reading width so no page produces full-width text lines on
desktop.

## Surfaces and cards

A card (`.content-card`) is a white surface with a `1px` border, `--radius-md`,
`--shadow-sm`, and a vertical flex rhythm so optional elements (date, status) do not
disturb spacing. Cards fill their grid row height, so a row of cards aligns.

`.card-grid` is a single column by default. `--trio` becomes three columns and
`--pair` becomes two columns from `48rem`. The Articles listing stays a single
column; Ingredients and Categories listings use the pair grid, because names and
short summaries suit a denser index while article summaries do not.

Empty collections render `.empty-state`: a calm bordered surface panel with muted
text, so a section with no published content still looks deliberate.

`.disclosure` (commercial disclosure) and `.editorial-meta` (authorship and dates)
use the muted surface so they are clearly noticeable without competing with the
article body and without implying endorsement.

## Navigation

The site navigation is a white band with a subtle bottom border, constrained to the
wide container. Items keep their Phase 7 destinations, order, and `aria-current`
logic. The current item is marked by weight *and* a soft accent background with a
rounded shape, so the state never depends on color alone. Links are non-underlined
in this chrome context and gain an underline on hover, with a visible focus ring.
There is no hamburger menu, no sticky behavior, and no JavaScript; the list simply
wraps at narrow widths.

The language control is a compact outlined pill aligned to the inline end of the
same wide container, sitting below the navigation band. It is deliberately quiet,
carries no flag or country symbolism, and keeps its counterpart `lang` and `dir`
attributes.

On detail pages the translation counterpart is a compact bordered link in the page
header (`.counterpart`) rather than a second language bar.

## Breadcrumbs

Breadcrumbs are smaller than body copy, muted, and wrap safely. Separators are
injected with CSS as a direction-neutral middle dot (`·`), never an arrow, so the
trail reads correctly in both directions. The current item is bold and darker.

## Status notes

`.status-note` is a compact inline-block panel; `.status-note--warning` applies the
warm needs-update palette. The same class pair is used on the Articles listing, the
homepage article preview, and the detail page notice, so the state looks identical
everywhere. It hugs its text rather than filling the container.

## Article prose

Rendered Markdown is wrapped in `.prose` at reading width. The global prose rules
cover paragraphs, `h2`–`h4`, ordered and unordered lists, blockquotes, `strong`,
`em`, links, inline code, code blocks, tables, and horizontal rules.

- Headings get clear vertical separation; paragraphs use line-height `1.75`.
- Blockquotes use a subtle `border-inline-start` in the soft accent and are never
  italic, because synthetic italics damage Arabic.
- Tables are `table-layout: fixed` at full width with wrapping cells, so they never
  push the page sideways on mobile while keeping table semantics.
- Code blocks scroll horizontally inside their own surface and set `direction: ltr`,
  because code is read left-to-right even inside the Arabic document.
- Long links wrap with `overflow-wrap: anywhere`.

Astro's Markdown pipeline emits Shiki's dark theme as inline styles. Phase 8 keeps
code blocks inside the light palette by overriding those inline colors in CSS. The
Markdown rendering configuration itself is untouched.

## Related-entity lists

Short names — categories, related ingredients, child categories, ingredient aliases
— use `.pill-list`: bordered, rounded, restrained pills. Longer titles — related
articles and a category's articles — use `.entity-list`: a vertical list of
underlined links separated by hairlines. Neither treatment is a commercial product
chip.

## References

`.references` keeps the numbered list. Each citation shows a prominent non-italic
title, then muted metadata lines, with clear spacing between entries. Long URLs and
locators wrap, and links stay visibly underlined. No citation JavaScript is used.

## Root language gateway

`/` remains the static language gateway defined by ADR-007 and ADR-009. It has no
site navigation and no content discovery links. Phase 8 presents it as a centered
panel on the canvas: the wordmark, then the Arabic prompt and choice, then the
English prompt and choice. Each choice is a bordered surface link, not a filled
commercial button. The wordmark is centered so the gateway reads as a neutral
bilingual entry point; each language block keeps its own direction.

## Bidirectional behavior

There is one design system for both directions, not two stylesheets.

- Layout uses logical properties throughout: `margin-inline`, `padding-inline`,
  `border-inline-start`, `max-inline-size`, `block-size`, `text-align: start`.
- Flex and grid alignment uses `flex-end` / `start`, which follow the inline axis.
- Separators and decorations are direction-neutral; no arrow glyph encodes reading
  order.
- Physical `left` / `right` values are not used. The one explicit direction override
  is `.prose pre`, where code samples read left-to-right in both languages.

The same architecture therefore works unchanged under `dir="rtl"` and `dir="ltr"`,
and the counterpart language link keeps its own `lang` and `dir`.

## Responsive behavior

Two breakpoints only: `48rem` and `64rem`. Below `48rem` every grid is a single
column and the gutter is `1rem`. The site is reviewed at 390px, 768px, and 1440px
for horizontal overflow, navigation wrapping, breadcrumb wrapping, citation URL
wrapping, and Arabic clipping.

## Accessibility

- One `h1` per page; heading order is preserved from the content components.
- Navigation landmarks, `aria-label`, and `aria-current` are unchanged from Phase 7.
- `:focus-visible` always renders a 2px accent outline with a 2px offset. Outlines
  are never removed.
- Interactive chrome has comfortable padding for touch.
- State is never conveyed by color alone, by hover alone, or by an icon.
- Transitions are limited to color, background, and border, and are disabled under
  `prefers-reduced-motion: reduce`.
- No interaction requires JavaScript.

## Global versus scoped CSS

Reusable design rules belong in `src/styles/global.css`. Phase 8 removed the
fragmented scoped `<style>` blocks from `SiteNavigation`, `LocaleNavigation`,
`LocaleHomePage`, `CollectionIndexPage`, and `ContentPageLayout`, because those
rules became system rules. Component-scoped CSS remains acceptable only for a
genuinely one-off local detail, and color or spacing values must not be duplicated
outside the tokens.

Class names stay simple and readable: `.page-shell`, `.page-header`, `.page-summary`,
`.site-navigation`, `.locale-navigation`, `.section`, `.card-grid`, `.content-card`,
`.status-note`, `.breadcrumb`, `.counterpart`, `.entity-list`, `.pill-list`,
`.prose`, `.editorial-meta`, `.references`, `.empty-state`, `.disclosure`,
`.home-intro`, `.language-gateway`. Modifiers are used only where a real variant
exists. There are no CSS Modules, no CSS-in-JS, and no utility-class framework.

## Intentionally deferred

The following are outside Phase 8 and are not implemented:

- dark mode, `prefers-color-scheme`, a theme switcher, and theme persistence;
- imagery of any kind — photography, illustration, logo files, and icon sets; the
  Herbal.ma wordmark remains text;
- custom or self-hosted typefaces;
- the `404` page visual treatment, which is handled separately from this rollout;
- a site footer, search interface, pagination, and table of contents;
- reading progress, social sharing, and any client-side interaction;
- Open Graph, Twitter Card, and social image design;
- animation and entrance motion.

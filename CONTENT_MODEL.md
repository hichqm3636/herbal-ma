# Herbal.ma Content Domain Model

## Purpose

This document defines the conceptual entities and relationships that organize Herbal.ma content. It is a domain model, not a database schema, TypeScript schema, filesystem layout, or CMS design.

## Shared concepts

### Locale

Every localizable entry declares one supported locale:

- `ar` — Arabic, the primary locale;
- `en` — English, the secondary locale.

Locale affects language, direction, URL membership, metadata, and the set of valid relationships. A missing translation must be explicit; the system must not present one locale as if it were another.

### translationKey

`translationKey` is a stable, language-neutral identifier that links entries representing the same concept in different locales. It is not a public title, slug, or URL.

Entries with the same `translationKey` must represent equivalent subject matter, but they may be adapted for clarity and context rather than forced into literal translation. A translation relationship does not imply that both entries share a publication status.

## Entities

### Article

An Article is a substantial educational publication about a defined subject.

Conceptual attributes include:

- identity and `translationKey`;
- locale;
- title and concise summary;
- stable public slug;
- body content;
- publication and update dates;
- lifecycle status;
- health-content risk classification;
- author and, where required, reviewer attribution;
- related categories, ingredients, articles, and sources;
- transparent commercial disclosure when relevant.

An Article may explain an ingredient, compare evidence, teach label interpretation, or connect material within a topic cluster. It must not function as disguised product promotion or individualized medical advice.

### Ingredient

An Ingredient is a normalized subject entity for a herb, nutrient, compound, or other substance discussed by Herbal.ma.

Conceptual attributes include:

- identity and `translationKey`;
- locale;
- preferred name and relevant naming context;
- stable public slug;
- neutral summary;
- lifecycle status;
- risk classification when the entry contains health guidance;
- related articles, categories, ingredients, and sources.

An Ingredient is a knowledge subject, not a product or stock-keeping unit. Brand-specific formulations do not redefine the ingredient entity.

### Category

A Category is a controlled editorial grouping used for navigation and topic-cluster organization.

Conceptual attributes include:

- identity and `translationKey`;
- locale;
- name, description, and stable public slug;
- optional parent relationship where a real hierarchy is approved;
- lifecycle status;
- related articles and ingredients.

Categories must reflect a useful editorial taxonomy. They must not multiply merely to target isolated keywords.

### Author

An Author identifies the person accountable for creating or materially preparing content.

Conceptual attributes include:

- stable identity;
- display name;
- locale-appropriate biography where published;
- relevant role or qualifications stated accurately;
- disclosure information;
- authored entries.

AI is not an Author. AI assistance may be disclosed where appropriate, but a human remains accountable for approved publication.

### Source

A Source represents a piece of evidence or reference used to support, qualify, or contextualize content.

Conceptual attributes include:

- stable identity;
- title;
- source or publisher name;
- source type;
- author or responsible institution when known;
- publication date and access date when applicable;
- stable locator such as a DOI or URL;
- locale when relevant;
- notes about scope, quality, limitations, or the claim it supports.

A Source is evidence metadata, not a guarantee of evidence quality. Suitability is governed by [EDITORIAL_POLICY.md](EDITORIAL_POLICY.md).

## Relationships

- An Article has one or more human Authors.
- An Article may have a distinct human Reviewer when its risk level requires it.
- An Article belongs to one or more Categories.
- An Article may discuss zero or more Ingredients.
- An Article cites one or more Sources when it makes evidence-dependent claims.
- Articles may link to related Articles within an editorial topic cluster.
- Ingredients may relate to Articles, Categories, Sources, and other Ingredients when the relationship is educationally meaningful.
- A Category organizes Articles and Ingredients; hierarchy is optional rather than assumed.
- Localized counterparts are linked by `translationKey`, never inferred only from matching titles or slugs.

Relationships must be meaningful and reviewable. They are not permission to generate large numbers of automatic links.

## Lifecycle and status model

The conceptual lifecycle is:

1. **Draft** — work is incomplete and not approved for publication.
2. **In review** — editorial, evidence, language, and risk review is underway.
3. **Approved** — a human has approved the exact publication candidate.
4. **Published** — the approved entry is publicly available.
5. **Needs update** — a published entry remains visible but has a documented review concern or scheduled revision.
6. **Archived** — the entry is withdrawn from normal publication and discovery while its history is retained.

Publication systems must not treat AI completion, translation completion, or a successful build as human approval. Arabic and English counterparts may occupy different lifecycle states.

## Health-content risk classification

Risk is classified by the potential harm of inaccurate, incomplete, or misunderstood content—not by writing length.

### Low risk

General educational or descriptive material that does not guide a health decision, recommend use, or interpret clinical outcomes. Normal editorial and source review is required.

### Medium risk

Content that may influence supplement selection or use, including discussion of benefits, evidence strength, label interpretation, populations, or meaningful limitations. It requires explicit claim-to-source review by a qualified human editor.

### High risk

Content involving dosage, interactions, contraindications, adverse effects, pregnancy or breastfeeding, children, medical conditions, medication use, treatment or prevention claims, or advice that could delay professional care. It requires enhanced human review by a person with appropriate subject-matter competence before publication.

When uncertain, classify upward until a human reviewer resolves the ambiguity. Risk classification governs review rigor; it does not make Herbal.ma a medical service or authorize personalized advice.

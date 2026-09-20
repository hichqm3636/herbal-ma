# Herbal.ma Project Definition

## Mission

Herbal.ma exists to make reliable, understandable, and responsibly reviewed knowledge about dietary supplements, herbs, nutrition, wellness, product labels, and formulations accessible to readers in Arabic and English.

It is a content-first knowledge platform. Its value comes from clear organization, evidence-aware editorial work, transparent sourcing, and durable educational content—not from application complexity.

## Project scope

Herbal.ma will organize educational content around topic clusters and a connected knowledge model. Its core subjects are:

- dietary supplements;
- herbs and commonly used ingredients;
- nutrition and general wellness;
- understanding labels and formulations;
- evidence, limitations, risks, and responsible use.

The platform may help readers discover relevant external resources, but education remains its primary function.

## Target users

The primary audience is Arabic-speaking readers seeking clear, structured information about the covered subjects. The secondary audience is English-speaking readers seeking the same educational material.

The initial context is relevant to Morocco, without making the platform a substitute for Moroccan regulators, healthcare professionals, or official health guidance. Content must remain understandable to non-specialists while preserving evidence quality and appropriate uncertainty.

## Languages

- **Arabic is the primary language.** Arabic content and experience must be treated as first-class, including right-to-left presentation.
- **English is the secondary language.** English content must use a complete left-to-right experience.
- French is not part of the approved v1 language scope.
- Arabic and English entries may be linked translations, but one language must not silently stand in for a missing translation.

## Relationship with Herbialife

Herbialife is an external brand and product business. Herbal.ma is not the Herbialife website, product catalogue, or storefront.

Any future references or links to Herbialife must be transparent, editorially justified, and clearly distinguished from independent educational content. Herbal.ma must not share Herbialife business logic or depend on Herbialife data or availability to function.

## Relationship with Clinora

Clinora is an external commerce and marketplace platform. Herbal.ma is not a Clinora module or marketplace surface.

Any future integration must be optional and loosely coupled. Herbal.ma must not share Clinora business logic or database and must remain functional if Clinora is unavailable or changes independently.

## What Herbal.ma is not

Herbal.ma is not:

- an online store or marketplace;
- a product-ordering system;
- a medical service, diagnostic service, or substitute for professional care;
- a personalized treatment, dosage, or supplement recommendation service;
- a social network or community forum;
- a software-as-a-service application;
- a disguised marketing channel for Herbialife or Clinora;
- a fully autonomous AI publishing system.

## v1 scope

The approved v1 product scope is intentionally narrow:

- a bilingual Arabic-English content site;
- language-prefixed public URLs under `/ar/` and `/en/`;
- structured content for articles, ingredients, categories, authors, and sources;
- topic clusters and purposeful internal links;
- Markdown/MDX as the initial content source through structured content collections;
- static-first rendering and static publication;
- basic content discovery and search that can operate from static content without an application database;
- discoverable, indexable pages with sound technical SEO foundations;
- baseline accessibility, performance, privacy, and security appropriate to a public static site;
- minimal, privacy-conscious measurement only to the extent needed to evaluate content usefulness;
- transparent authorship, sources, review state, and update information;
- an editorial workflow in which AI may assist but a human must approve publication;
- a content-source boundary that permits future source changes without coupling presentation to a vendor.

This list describes the v1 product boundary. It is not authorization to implement v1 during Phase 0.

## Explicitly deferred

The following are outside Phase 0 and are not approved for implementation as part of the initial foundation:

- user accounts and authentication;
- profiles, comments, ratings, and community features;
- e-commerce, checkout, payments, and order management;
- a database-backed application layer;
- a CMS or runtime dependency on Notion;
- direct or shared-data integration with Herbialife or Clinora;
- personalized health recommendations;
- fully automatic publication without human approval;
- CI/CD setup;
- advanced application features or speculative personalization;
- adding languages beyond Arabic and English.

Future adoption of a deferred capability requires explicit approval and, when architectural, an accepted ADR.

## Success criteria

Herbal.ma v1 is successful when:

- Arabic readers receive a complete first-class RTL experience and English readers receive a complete LTR experience;
- published content is useful, understandable, source-backed, appropriately qualified, and human-approved;
- the core content entities and their relationships support coherent topic clusters without becoming a general-purpose application model;
- pages are statically deliverable, fast, accessible, indexable, and independent of application runtime services;
- translations, canonical URLs, and language alternatives are represented consistently;
- editorial and commercial boundaries are visible to readers;
- Herbialife and Clinora remain external and loosely coupled;
- the repository documentation remains sufficient for humans and coding agents to make consistent implementation decisions;
- new complexity is introduced only in response to demonstrated need and approved decisions.

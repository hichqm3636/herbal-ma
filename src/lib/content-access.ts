import {
  getCollection,
  getEntry,
  render,
  type CollectionEntry,
  type ReferenceDataEntry,
  type RenderResult,
} from "astro:content";
import type { Locale } from "./locales";

export type LocalizedCollection = "articles" | "ingredients" | "categories";

export type LocalizedEntry<C extends LocalizedCollection> = CollectionEntry<C>;

export type PublicEntryPath =
  `/${Locale}/${"articles" | "ingredients" | "categories"}/${string}/`;

export type PublicAttribution = {
  displayName: string;
  role?: string;
  qualifications?: string[];
  disclosures?: string[];
};

export type PublicCitation = {
  title: string;
  publisher: string;
  authors?: string[];
  institution?: string;
  publishedOn?: string;
  accessedOn?: string;
  doi?: string;
  url?: string;
  locale?: Locale;
  supports: string;
  locator?: string;
};

export type PublicCategoryContent = {
  parent: CollectionEntry<"categories"> | undefined;
  children: CollectionEntry<"categories">[];
  articles: CollectionEntry<"articles">[];
  ingredients: CollectionEntry<"ingredients">[];
};

export type PublicLocalizedEntry =
  | CollectionEntry<"articles">
  | CollectionEntry<"ingredients">
  | CollectionEntry<"categories">;

type CollectionName = LocalizedCollection | "authors" | "sources";

const PUBLIC_STATUSES = new Set(["published", "needs-update"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReferenceDataEntry<C extends CollectionName>(
  value: unknown,
  collection: C,
): value is ReferenceDataEntry<C> {
  return (
    isRecord(value) &&
    value.collection === collection &&
    typeof value.id === "string"
  );
}

function isPublicStatus(value: unknown): boolean {
  return typeof value === "string" && PUBLIC_STATUSES.has(value);
}

function isPublicInLocale<C extends LocalizedCollection>(
  entry: CollectionEntry<C>,
  locale: Locale,
): boolean {
  return entry.data.locale === locale && isPublicStatus(entry.data.status);
}

function assertPublicEntry(entry: PublicLocalizedEntry): void {
  if (!isPublicStatus(entry.data.status)) {
    throw new Error(
      "Public content helpers require a published or needs-update entry.",
    );
  }
}

function isSameLocalizedEntry<C extends LocalizedCollection>(
  left: CollectionEntry<C>,
  right: CollectionEntry<C>,
): boolean {
  return (
    left.data.locale === right.data.locale &&
    left.data.translationKey === right.data.translationKey
  );
}

function optionalNonEmpty(values: string[] | undefined): string[] | undefined {
  if (values === undefined || values.length === 0) {
    return undefined;
  }

  return values;
}

function isAuthorEntry(value: unknown): value is CollectionEntry<"authors"> {
  return (
    isRecord(value) &&
    value.collection === "authors" &&
    isRecord(value.data) &&
    typeof value.data.displayName === "string"
  );
}

function isSourceEntry(value: unknown): value is CollectionEntry<"sources"> {
  return (
    isRecord(value) &&
    value.collection === "sources" &&
    isRecord(value.data) &&
    typeof value.data.title === "string" &&
    typeof value.data.publisher === "string"
  );
}

function isCitation(
  value: unknown,
): value is { source: unknown; supports: string; locator?: string } {
  if (!isRecord(value) || typeof value.supports !== "string") {
    return false;
  }

  if (value.locator !== undefined && typeof value.locator !== "string") {
    return false;
  }

  return true;
}

function asUnknownArray(value: unknown): unknown[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return [value];
}

export async function listPublicEntries<C extends LocalizedCollection>(
  collection: C,
  locale: Locale,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  return entries.filter((entry) => isPublicInLocale(entry, locale));
}

export async function getPublicEntryBySlug<C extends LocalizedCollection>(
  collection: C,
  locale: Locale,
  slug: string,
): Promise<CollectionEntry<C> | undefined> {
  const entries = await listPublicEntries(collection, locale);
  return entries.find((entry) => entry.data.slug === slug);
}

export async function getPublicTranslationCounterpart<
  C extends LocalizedCollection,
>(
  collection: C,
  currentEntry: CollectionEntry<C>,
  targetLocale: Locale,
): Promise<CollectionEntry<C> | undefined> {
  const entries = await listPublicEntries(collection, targetLocale);
  return entries.find(
    (entry) => entry.data.translationKey === currentEntry.data.translationKey,
  );
}

export function getPublicEntryPath(
  entry: PublicLocalizedEntry,
): PublicEntryPath {
  assertPublicEntry(entry);

  return `/${entry.data.locale}/${entry.collection}/${entry.data.slug}/`;
}

export function getPublicPublishedAt(entry: PublicLocalizedEntry): string {
  assertPublicEntry(entry);

  const publishedAt = entry.data.publishedAt;
  if (publishedAt === undefined) {
    throw new Error("Public entries require publishedAt.");
  }

  return publishedAt;
}

export async function resolvePublicReferences<C extends LocalizedCollection>(
  collection: C,
  locale: Locale,
  refs: readonly unknown[] | undefined,
): Promise<CollectionEntry<C>[]> {
  if (refs === undefined || refs.length === 0) {
    return [];
  }

  const publicEntries = await listPublicEntries(collection, locale);
  const resolved: CollectionEntry<C>[] = [];

  for (const ref of refs) {
    if (!isReferenceDataEntry(ref, collection)) {
      continue;
    }

    const entry = await getEntry(ref);
    if (
      !isRecord(entry) ||
      entry.collection !== collection ||
      !isRecord(entry.data)
    ) {
      continue;
    }

    const localeValue = entry.data.locale;
    const translationKey = entry.data.translationKey;
    if (
      (localeValue !== "ar" && localeValue !== "en") ||
      typeof translationKey !== "string"
    ) {
      continue;
    }

    const match = publicEntries.find(
      (candidate) =>
        candidate.data.locale === localeValue &&
        candidate.data.translationKey === translationKey,
    );

    if (match !== undefined) {
      resolved.push(match);
    }
  }

  return resolved;
}

export async function resolvePublicAttribution(
  refs: readonly unknown[] | undefined,
  locale: Locale,
): Promise<PublicAttribution[]> {
  if (refs === undefined || refs.length === 0) {
    return [];
  }

  const attributions: PublicAttribution[] = [];

  for (const ref of refs) {
    if (!isReferenceDataEntry(ref, "authors")) {
      continue;
    }

    const author = await getEntry(ref);
    if (!isAuthorEntry(author)) {
      continue;
    }

    const profile = author.data.profiles?.[locale];
    attributions.push({
      displayName: profile?.displayName ?? author.data.displayName,
      role: profile?.role,
      qualifications: optionalNonEmpty(profile?.qualifications),
      disclosures: optionalNonEmpty(profile?.disclosures),
    });
  }

  return attributions;
}

export async function resolvePublicCitations(
  citations: readonly unknown[] | undefined,
): Promise<PublicCitation[]> {
  if (citations === undefined || citations.length === 0) {
    return [];
  }

  const resolved: PublicCitation[] = [];

  for (const citation of citations) {
    if (!isCitation(citation)) {
      continue;
    }

    if (!isReferenceDataEntry(citation.source, "sources")) {
      continue;
    }

    const source = await getEntry(citation.source);
    if (!isSourceEntry(source)) {
      continue;
    }

    resolved.push({
      title: source.data.title,
      publisher: source.data.publisher,
      authors: source.data.authors,
      institution: source.data.institution,
      publishedOn: source.data.publishedOn,
      accessedOn: source.data.accessedOn,
      doi: source.data.doi,
      url: source.data.url === undefined ? undefined : String(source.data.url),
      locale: source.data.locale,
      supports: citation.supports,
      locator: citation.locator,
    });
  }

  return resolved;
}

export async function renderPublicArticleBody(
  entry: CollectionEntry<"articles">,
): Promise<RenderResult> {
  assertPublicEntry(entry);
  return render(entry);
}

export async function resolvePublicCategoryContent(
  category: CollectionEntry<"categories">,
): Promise<PublicCategoryContent> {
  assertPublicEntry(category);

  const locale = category.data.locale;
  const [parent] = await resolvePublicReferences(
    "categories",
    locale,
    asUnknownArray(category.data.parent),
  );

  const publicCategories = await listPublicEntries("categories", locale);
  const children: CollectionEntry<"categories">[] = [];

  for (const candidate of publicCategories) {
    if (isSameLocalizedEntry(candidate, category)) {
      continue;
    }

    const [candidateParent] = await resolvePublicReferences(
      "categories",
      locale,
      asUnknownArray(candidate.data.parent),
    );

    if (
      candidateParent !== undefined &&
      isSameLocalizedEntry(candidateParent, category)
    ) {
      children.push(candidate);
    }
  }

  const articles: CollectionEntry<"articles">[] = [];
  for (const article of await listPublicEntries("articles", locale)) {
    const assigned = await resolvePublicReferences(
      "categories",
      locale,
      article.data.categories,
    );
    if (
      assigned.some((assignedCategory) =>
        isSameLocalizedEntry(assignedCategory, category),
      )
    ) {
      articles.push(article);
    }
  }

  const ingredients: CollectionEntry<"ingredients">[] = [];
  for (const ingredient of await listPublicEntries("ingredients", locale)) {
    const assigned = await resolvePublicReferences(
      "categories",
      locale,
      ingredient.data.categories,
    );
    if (
      assigned.some((assignedCategory) =>
        isSameLocalizedEntry(assignedCategory, category),
      )
    ) {
      ingredients.push(ingredient);
    }
  }

  return {
    parent,
    children,
    articles,
    ingredients,
  };
}

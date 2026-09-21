import {
  getCollection,
  getEntries,
  getEntry,
  render,
  type CollectionEntry,
  type ReferenceDataEntry,
  type RenderResult,
} from "astro:content";
import { type Locale } from "./locales";

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

export type PublicCategoryRelations = {
  parent: CollectionEntry<"categories"> | undefined;
  children: CollectionEntry<"categories">[];
  articles: CollectionEntry<"articles">[];
  ingredients: CollectionEntry<"ingredients">[];
};

type ReferencableCollection = LocalizedCollection | "authors" | "sources";

type PublicCitationRecord = {
  source: ReferenceDataEntry<"sources">;
  supports: string;
  locator?: string;
};

const PUBLIC_STATUSES = new Set(["published", "needs-update"]);

function isPublicStatus(status: string): boolean {
  return PUBLIC_STATUSES.has(status);
}

function isPublicInLocale<C extends LocalizedCollection>(
  entry: CollectionEntry<C>,
  locale: Locale,
): boolean {
  return entry.data.locale === locale && isPublicStatus(entry.data.status);
}

function assertPublicEntry<C extends LocalizedCollection>(
  entry: CollectionEntry<C>,
): void {
  if (!isPublicStatus(entry.data.status)) {
    throw new Error(
      `Refusing to expose a non-public ${entry.collection} entry.`,
    );
  }
}

function isSameLocalizedEntry<C extends LocalizedCollection>(
  left: CollectionEntry<C>,
  right: CollectionEntry<C>,
): boolean {
  return (
    left.collection === right.collection &&
    left.data.locale === right.data.locale &&
    left.data.translationKey === right.data.translationKey
  );
}

function toPublicUrl(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (value instanceof URL) {
    return value.href;
  }

  return undefined;
}

function toReferenceDataEntry<C extends ReferencableCollection>(
  collection: C,
  value: unknown,
): ReferenceDataEntry<C> | undefined {
  if (typeof value === "string") {
    return { collection, id: value };
  }

  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const collectionName = "collection" in value ? value.collection : undefined;
  const id = "id" in value ? value.id : undefined;

  if (collectionName === collection && typeof id === "string") {
    return { collection, id };
  }

  return undefined;
}

function normalizeReferences<C extends ReferencableCollection>(
  collection: C,
  references: ReadonlyArray<unknown> | undefined,
): ReferenceDataEntry<C>[] {
  if (references === undefined || references.length === 0) {
    return [];
  }

  const normalized: ReferenceDataEntry<C>[] = [];
  for (const reference of references) {
    const typed = toReferenceDataEntry(collection, reference);
    if (typed !== undefined) {
      normalized.push(typed);
    }
  }
  return normalized;
}

function toCitationRecord(value: unknown): PublicCitationRecord | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  if (!("source" in value) || !("supports" in value)) {
    return undefined;
  }

  if (typeof value.supports !== "string") {
    return undefined;
  }

  const source = toReferenceDataEntry("sources", value.source);
  if (source === undefined) {
    return undefined;
  }

  const citation: PublicCitationRecord = {
    source,
    supports: value.supports,
  };

  if ("locator" in value && typeof value.locator === "string") {
    citation.locator = value.locator;
  }

  return citation;
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
  entry:
    | CollectionEntry<"articles">
    | CollectionEntry<"ingredients">
    | CollectionEntry<"categories">,
): PublicEntryPath {
  assertPublicEntry(entry);
  return `/${entry.data.locale}/${entry.collection}/${entry.data.slug}/`;
}

export function getPublicPublishedAt(
  entry:
    | CollectionEntry<"articles">
    | CollectionEntry<"ingredients">
    | CollectionEntry<"categories">,
): string {
  assertPublicEntry(entry);
  if (entry.data.publishedAt === undefined) {
    throw new Error(`Public ${entry.collection} entries require publishedAt.`);
  }
  return entry.data.publishedAt;
}

export async function resolvePublicReferences<C extends LocalizedCollection>(
  collection: C,
  locale: Locale,
  references: ReadonlyArray<unknown> | undefined,
): Promise<CollectionEntry<C>[]> {
  const normalized = normalizeReferences(collection, references);
  if (normalized.length === 0) {
    return [];
  }

  const entries = await getEntries(normalized);
  return entries.filter(
    (entry): entry is CollectionEntry<C> =>
      entry.collection === collection && isPublicInLocale(entry, locale),
  );
}

export async function resolvePublicAttributions(
  references: ReadonlyArray<unknown> | undefined,
  locale: Locale,
): Promise<PublicAttribution[]> {
  const normalized = normalizeReferences("authors", references);
  if (normalized.length === 0) {
    return [];
  }

  const authors = await getEntries(normalized);
  const attributions: PublicAttribution[] = [];

  for (const author of authors) {
    if (author.collection !== "authors") {
      continue;
    }

    const profile = author.data.profiles?.[locale];
    const attribution: PublicAttribution = {
      displayName: profile?.displayName ?? author.data.displayName,
    };

    if (profile?.role !== undefined) {
      attribution.role = profile.role;
    }
    if (
      profile?.qualifications !== undefined &&
      profile.qualifications.length > 0
    ) {
      attribution.qualifications = profile.qualifications;
    }
    if (profile?.disclosures !== undefined && profile.disclosures.length > 0) {
      attribution.disclosures = profile.disclosures;
    }

    attributions.push(attribution);
  }

  return attributions;
}

export async function resolvePublicCitations(
  citations: ReadonlyArray<unknown> | undefined,
): Promise<PublicCitation[]> {
  if (citations === undefined || citations.length === 0) {
    return [];
  }

  const resolved: PublicCitation[] = [];

  for (const value of citations) {
    const citation = toCitationRecord(value);
    if (citation === undefined) {
      continue;
    }

    const source = await getEntry(citation.source);
    if (!source || source.collection !== "sources") {
      continue;
    }

    const citationData: PublicCitation = {
      title: source.data.title,
      publisher: source.data.publisher,
      supports: citation.supports,
    };

    if (source.data.authors !== undefined && source.data.authors.length > 0) {
      citationData.authors = source.data.authors;
    }
    if (source.data.institution !== undefined) {
      citationData.institution = source.data.institution;
    }
    if (source.data.publishedOn !== undefined) {
      citationData.publishedOn = source.data.publishedOn;
    }
    if (source.data.accessedOn !== undefined) {
      citationData.accessedOn = source.data.accessedOn;
    }
    if (source.data.doi !== undefined) {
      citationData.doi = source.data.doi;
    }

    const url = toPublicUrl(source.data.url);
    if (url !== undefined) {
      citationData.url = url;
    }
    if (source.data.locale !== undefined) {
      citationData.locale = source.data.locale;
    }
    if (citation.locator !== undefined) {
      citationData.locator = citation.locator;
    }

    resolved.push(citationData);
  }

  return resolved;
}

export async function resolvePublicCategoryRelations(
  category: CollectionEntry<"categories">,
): Promise<PublicCategoryRelations> {
  assertPublicEntry(category);
  const locale = category.data.locale;

  const parentEntries = await resolvePublicReferences(
    "categories",
    locale,
    category.data.parent === undefined ? undefined : [category.data.parent],
  );

  const [allCategories, allArticles, allIngredients] = await Promise.all([
    listPublicEntries("categories", locale),
    listPublicEntries("articles", locale),
    listPublicEntries("ingredients", locale),
  ]);

  const children: CollectionEntry<"categories">[] = [];
  for (const candidate of allCategories) {
    if (isSameLocalizedEntry(candidate, category)) {
      continue;
    }

    const candidateParents = await resolvePublicReferences(
      "categories",
      locale,
      candidate.data.parent === undefined ? undefined : [candidate.data.parent],
    );
    if (
      candidateParents.some((parent) => isSameLocalizedEntry(parent, category))
    ) {
      children.push(candidate);
    }
  }

  const articles: CollectionEntry<"articles">[] = [];
  for (const article of allArticles) {
    const articleCategories = await resolvePublicReferences(
      "categories",
      locale,
      article.data.categories,
    );
    if (
      articleCategories.some((item) => isSameLocalizedEntry(item, category))
    ) {
      articles.push(article);
    }
  }

  const ingredients: CollectionEntry<"ingredients">[] = [];
  for (const ingredient of allIngredients) {
    const ingredientCategories = await resolvePublicReferences(
      "categories",
      locale,
      ingredient.data.categories,
    );
    if (
      ingredientCategories.some((item) => isSameLocalizedEntry(item, category))
    ) {
      ingredients.push(ingredient);
    }
  }

  return {
    parent: parentEntries[0],
    children,
    articles,
    ingredients,
  };
}

export async function renderPublicArticleBody(
  entry: CollectionEntry<"articles">,
): Promise<RenderResult> {
  assertPublicEntry(entry);
  return render(entry);
}

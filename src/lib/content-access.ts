import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "./locales";

export type LocalizedCollection = "articles" | "ingredients" | "categories";

export type LocalizedEntry<C extends LocalizedCollection> = CollectionEntry<C>;

const PUBLIC_STATUSES = new Set(["published", "needs-update"]);

function isPublicInLocale<C extends LocalizedCollection>(
  entry: CollectionEntry<C>,
  locale: Locale,
): boolean {
  return entry.data.locale === locale && PUBLIC_STATUSES.has(entry.data.status);
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

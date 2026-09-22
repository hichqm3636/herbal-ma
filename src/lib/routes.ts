import type { LocalizedCollection } from "./content-access";
import type { Locale } from "./locales";

export type CollectionIndexPath = `/${Locale}/${LocalizedCollection}/`;

export type SearchPath = `/${Locale}/search/`;

const COLLECTIONS = new Set<LocalizedCollection>([
  "articles",
  "ingredients",
  "categories",
]);

export function getCollectionIndexPath(
  collection: LocalizedCollection,
  locale: Locale,
): CollectionIndexPath {
  if (!COLLECTIONS.has(collection)) {
    throw new Error(`Unsupported collection index "${collection}".`);
  }

  if (locale !== "ar" && locale !== "en") {
    throw new Error(`Unsupported locale for collection index "${locale}".`);
  }

  return `/${locale}/${collection}/`;
}

export function getSearchPath(locale: Locale): SearchPath {
  if (locale !== "ar" && locale !== "en") {
    throw new Error(`Unsupported locale for search path "${locale}".`);
  }

  return `/${locale}/search/`;
}

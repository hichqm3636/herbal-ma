import type { CollectionEntry } from "astro:content";
import { getPublicPublishedAt } from "./content-access";
import type { Locale } from "./locales";

function compareRaw(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareLocalizedText(
  left: string,
  right: string,
  collator: Intl.Collator,
): number {
  const localized = collator.compare(left, right);
  if (localized !== 0) {
    return localized;
  }

  return compareRaw(left, right);
}

export function sortArticlesByPublication(
  entries: readonly CollectionEntry<"articles">[],
  locale: Locale,
): CollectionEntry<"articles">[] {
  const collator = new Intl.Collator(locale);

  return [...entries].sort((left, right) => {
    const publishedLeft = getPublicPublishedAt(left);
    const publishedRight = getPublicPublishedAt(right);
    if (publishedLeft !== publishedRight) {
      return publishedLeft < publishedRight ? 1 : -1;
    }

    const titleCompare = compareLocalizedText(
      left.data.title,
      right.data.title,
      collator,
    );
    if (titleCompare !== 0) {
      return titleCompare;
    }

    return compareRaw(left.data.slug, right.data.slug);
  });
}

export function sortIngredientsByName(
  entries: readonly CollectionEntry<"ingredients">[],
  locale: Locale,
): CollectionEntry<"ingredients">[] {
  const collator = new Intl.Collator(locale);

  return [...entries].sort((left, right) => {
    const nameCompare = compareLocalizedText(
      left.data.name,
      right.data.name,
      collator,
    );
    if (nameCompare !== 0) {
      return nameCompare;
    }

    return compareRaw(left.data.slug, right.data.slug);
  });
}

export function sortCategoriesByName(
  entries: readonly CollectionEntry<"categories">[],
  locale: Locale,
): CollectionEntry<"categories">[] {
  const collator = new Intl.Collator(locale);

  return [...entries].sort((left, right) => {
    const nameCompare = compareLocalizedText(
      left.data.name,
      right.data.name,
      collator,
    );
    if (nameCompare !== 0) {
      return nameCompare;
    }

    return compareRaw(left.data.slug, right.data.slug);
  });
}

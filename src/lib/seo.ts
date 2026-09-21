import { getPublicEntryPath, getPublicPublishedAt } from "./content-access";
import type { PublicLocalizedEntry } from "./content-access";
import type { Locale } from "./locales";

export type SeoAlternate = {
  hreflang: Locale | "x-default";
  href: string;
};

export type SeoMetadata = {
  title?: string;
  description?: string;
  canonical?: string;
  alternates?: readonly SeoAlternate[];
  robots?: string;
  jsonLd?: string;
};

export type ArticleStructuredData = {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  inLanguage: Locale;
  author: { "@type": "Person"; name: string }[];
};

function assertSiteUrl(site: URL | undefined): URL {
  if (!(site instanceof URL)) {
    throw new Error(
      "A configured site URL is required to generate absolute URLs.",
    );
  }

  if (site.protocol !== "https:") {
    throw new Error("The configured site origin must use HTTPS.");
  }

  return site;
}

export function getAbsoluteSiteUrl(
  path: string,
  site: URL | undefined,
): string {
  const origin = assertSiteUrl(site);

  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error(
      `Site path must be a root-relative path, received "${path}".`,
    );
  }

  const url = new URL(path, origin);

  if (url.origin !== origin.origin) {
    throw new Error(
      "Generated URLs must remain on the configured site origin.",
    );
  }

  if (url.protocol !== "https:") {
    throw new Error("Generated URLs must use HTTPS.");
  }

  return url.href;
}

export function getAbsolutePublicEntryUrl(
  entry: PublicLocalizedEntry,
  site: URL | undefined,
): string {
  return getAbsoluteSiteUrl(getPublicEntryPath(entry), site);
}

export function getPublicHreflangLinks(
  current: PublicLocalizedEntry,
  counterpart: PublicLocalizedEntry | undefined,
  site: URL | undefined,
): SeoAlternate[] {
  if (counterpart === undefined) {
    return [];
  }

  if (current.collection !== counterpart.collection) {
    throw new Error(
      "hreflang counterparts must belong to the same collection.",
    );
  }

  if (current.data.translationKey !== counterpart.data.translationKey) {
    throw new Error("hreflang counterparts must share translationKey.");
  }

  if (current.data.locale === counterpart.data.locale) {
    throw new Error("hreflang counterparts must be in different locales.");
  }

  return [current, counterpart]
    .sort((left, right) => left.data.locale.localeCompare(right.data.locale))
    .map((entry) => ({
      hreflang: entry.data.locale,
      href: getAbsolutePublicEntryUrl(entry, site),
    }));
}

export function getSeoModifiedAt(entry: PublicLocalizedEntry): string {
  const publishedAt = getPublicPublishedAt(entry);
  return entry.data.updatedAt ?? publishedAt;
}

export function buildArticleStructuredData(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  inLanguage: Locale;
  authorNames: readonly string[];
}): ArticleStructuredData {
  if (input.authorNames.length === 0) {
    throw new Error(
      "Article JSON-LD requires at least one visible author name.",
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.inLanguage,
    author: input.authorNames.map((name) => ({
      "@type": "Person",
      name,
    })),
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

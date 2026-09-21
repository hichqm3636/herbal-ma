import type { APIRoute } from "astro";
import { listPublicEntries } from "../lib/content-access";
import type { LocalizedCollection } from "../lib/content-access";
import { locales } from "../lib/locales";
import { getCollectionIndexPath } from "../lib/routes";
import {
  getAbsolutePublicEntryUrl,
  getAbsoluteSiteUrl,
  getSeoModifiedAt,
} from "../lib/seo";

const PUBLIC_COLLECTIONS = [
  "articles",
  "ingredients",
  "categories",
] as const satisfies readonly LocalizedCollection[];

type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderSitemap(urls: readonly SitemapUrl[]): string {
  const body = urls
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : "";

      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const GET: APIRoute = async ({ site }) => {
  const urls: SitemapUrl[] = [{ loc: getAbsoluteSiteUrl("/", site) }];

  for (const collection of PUBLIC_COLLECTIONS) {
    for (const locale of locales) {
      const entries = await listPublicEntries(collection, locale);
      if (entries.length === 0) {
        continue;
      }

      urls.push({
        loc: getAbsoluteSiteUrl(
          getCollectionIndexPath(collection, locale),
          site,
        ),
      });

      for (const entry of entries) {
        urls.push({
          loc: getAbsolutePublicEntryUrl(entry, site),
          lastmod: getSeoModifiedAt(entry),
        });
      }
    }
  }

  urls.sort((left, right) =>
    left.loc < right.loc ? -1 : left.loc > right.loc ? 1 : 0,
  );

  return new Response(renderSitemap(urls), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};

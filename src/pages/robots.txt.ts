import type { APIRoute } from "astro";
import { getAbsoluteSiteUrl } from "../lib/seo";

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = getAbsoluteSiteUrl("/sitemap.xml", site);
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

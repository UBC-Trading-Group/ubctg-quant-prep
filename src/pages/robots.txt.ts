import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL("https://ubctradinggroup.com");
  const sitemapUrl = absoluteUrl("/sitemap.xml", siteUrl);

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

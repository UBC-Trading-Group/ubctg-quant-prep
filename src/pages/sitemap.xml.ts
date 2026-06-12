import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://ubctradinggroup.com");
  const [concepts, questions, games] = await Promise.all([
    getCollection("concepts"),
    getCollection("questions"),
    getCollection("games"),
  ]);

  const withTrailingSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);
  const paths = [
    "/",
    "/concepts/",
    "/questions/",
    "/games/",
    ...concepts.map((concept) => `/concepts/${concept.id}/`),
    ...questions.map((question) => `/questions/${question.id}/`),
    ...games.map((game) => `/games/${game.id}/`),
  ].sort();

  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(absoluteUrl(withTrailingSlash(path), siteUrl))}</loc></url>`)
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};

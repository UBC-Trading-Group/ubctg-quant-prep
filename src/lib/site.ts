const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");

const isExternal = (value: string) => /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(value);
const hasScheme = (value: string) => /^[a-z][a-z\d+\-.]*:/i.test(value);

export const stripBase = (path: string) => {
  if (!basePath) return path;
  if (path === basePath) return "/";
  if (path.startsWith(`${basePath}/`)) return path.slice(basePath.length);
  return path;
};

export const withBase = (path = "/") => {
  if (isExternal(path) || hasScheme(path) || path.startsWith("#")) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || "/";
};

export const absoluteUrl = (path: string, siteUrl: URL) =>
  new URL(withBase(stripBase(path)), siteUrl).toString();

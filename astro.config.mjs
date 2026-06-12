// astro.config.mjs
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const site = process.env.SITE_URL ?? "https://ubctradinggroup.com";
const reactJsxRuntimeShim = fileURLToPath(new URL("./src/lib/react-jsx-runtime.ts", import.meta.url));
const reactJsxDevRuntimeShim = fileURLToPath(new URL("./src/lib/react-jsx-dev-runtime.ts", import.meta.url));

function reactJsxRuntimeClientShims() {
  return {
    name: "react-jsx-runtime-client-shims",
    apply: "serve",
    enforce: "pre",
    resolveId(source, _importer, options) {
      if (options?.ssr) return null;
      if (source === "react/jsx-runtime") return reactJsxRuntimeShim;
      if (source === "react/jsx-dev-runtime") return reactJsxDevRuntimeShim;
      return null;
    },
  };
}

export default defineConfig({
  site,
  integrations: [react(), mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    plugins: [reactJsxRuntimeClientShims(), tailwindcss()],
  },
});

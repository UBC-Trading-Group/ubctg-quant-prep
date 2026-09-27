import { defineConfig } from 'astro/config';

// Override both values when moving to a custom domain.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://ubc-trading-group.github.io',
  base: process.env.BASE_PATH ?? '/ubctg-quant-prep',
  trailingSlash: 'always',
});

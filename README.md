# UBC Trading Group Quant Prep

Public quant interview prep site built with Astro, MDX content collections, React islands, Tailwind CSS, KaTeX, and Pagefind.

## Project Structure

```text
/
├── src/
│   ├── components/
│   │   ├── cards/
│   │   ├── games/
│   │   └── shared/
│   ├── content/
│   │   ├── concepts/
│   │   ├── games/
│   │   └── questions/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── content.config.ts
├── templates/
├── .github/workflows/deploy.yml
└── package.json
```

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts the local dev server |
| `npm run build` | Builds Astro and indexes `dist/` with Pagefind |
| `npm run preview` | Serves the production build locally |
| `npm run astro -- --help` | Shows Astro CLI help |

## Content

Add concepts in `src/content/concepts`, worked questions in `src/content/questions`, and game pages in `src/content/games`. Use the Markdown templates in `templates/` for new contributions.

For concepts, maintainers can also use the **New Concept Draft** workflow in GitHub Actions. It creates a draft concept markdown file in a pull request, using the required frontmatter schema.

Interactive games live in `src/components/games` and are imported by MDX game pages as hydrated React islands.

## Deployment

The GitHub Pages workflow is in `.github/workflows/deploy.yml`. Once the repo exists on GitHub, set Pages source to GitHub Actions.

`astro.config.mjs` automatically uses the GitHub repository name as the Pages project-site base path during GitHub Actions builds, so URLs like `/ubctg-quant-prep/_astro/...` are generated correctly. For a custom domain or user/organization site, set `BASE_PATH=/` and `SITE_URL=https://your-domain.example` in the workflow environment.

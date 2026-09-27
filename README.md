# UBC Trading Group — Quantitative Finance Guide

A single-page technical reading guide covering eight subjects and role-specific interview preparation. Published at https://ubc-trading-group.github.io/ubctg-quant-prep/.

## Development

Use Node 22.12 or newer.

```sh
npm ci
npm run dev
```

Open the address printed by Astro, including `/ubctg-quant-prep/`.

```sh
npm run build
npm run preview
```

## Editing

- `src/guide/`: trusted HTML fragments for the introduction, eight subjects and interview preparation. Edit the text here; they all render on the homepage.
- `src/pages/index.astro`: reading order and subject-section wrapper.
- `src/layouts/Page.astro`: document metadata, header and footer.
- `src/styles/guide.css`: white background, black text and `#892736` accents, including mobile styles.
- `public/`: favicon and club brand assets.
- `research/resource-catalog/`: internal research inventory, not published or automatically endorsed.
- `research/mockups/`: approved design reference; production edits belong in `src/`.

The site ships static HTML and CSS with no React runtime. The worked example uses native `<details>`. Book covers currently load directly from external sources; their links and alt text remain available if an image fails. Do not replace them with invented covers.

## Publishing

Pull requests to `main` run the build check. Pushes to `main` build and publish with GitHub Actions. GitHub Pages must use GitHub Actions as its source.

The default canonical origin is `https://ubc-trading-group.github.io` with base `/ubctg-quant-prep`. For a custom domain, set `SITE_URL` and `BASE_PATH` in the build environment and configure the domain in GitHub Pages. Both metadata and generated URLs follow those values. The project-path `robots.txt` is provided for portability; on the shared GitHub Pages origin only the origin-root robots file controls crawling.

The former games, questions and concept routes are retired. Unknown URLs use the custom 404, which links to the guide and interview section. The old implementation remains in Git history.

## Future writing

Add a write-up only when it is ready. Give it its own page, author, date and sources, and link it from the relevant guide section. The shared layout currently sets the homepage canonical; extend it with a page-specific canonical when adding another indexable page. Do not add an empty writing directory to the public navigation.

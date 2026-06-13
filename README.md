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

Content pages are Markdown or MDX files:

- Concepts: `src/content/concepts`
- Worked questions: `src/content/questions`
- Game pages: `src/content/games`

Use the files in `templates/` when starting from scratch. The required frontmatter fields are defined in `src/content.config.ts`.

### Add a Ready Concept Markdown File

1. Save the file in `src/content/concepts`.
2. Name it with a URL-safe slug, for example:

   ```text
   src/content/concepts/law-of-total-probability.md
   ```

3. Make sure the file starts with this frontmatter shape:

   ```md
   ---
   title: "Law of Total Probability"
   description: "Break a probability into weighted cases."
   topic: "Probability"
   difficulty: "Beginner"
   tags: ["probability", "conditional probability"]
   relatedGames: []
   relatedQuestions: []
   ---
   ```

   `difficulty` must be `Beginner`, `Intermediate`, or `Advanced`.

4. Build locally:

   ```bash
   npm run build
   ```

5. Commit and push:

   ```bash
   git add src/content/concepts/law-of-total-probability.md
   git commit -m "Add law of total probability concept"
   git push origin main
   ```

After the push to `main`, GitHub Actions deploys the updated site.

### Draft a Concept From GitHub

Maintainers can also use **Actions -> New Concept Draft** on GitHub. Fill in the title, description, topic, difficulty, and tags. The workflow creates a pull request with a draft concept file, then you can edit the body of the markdown before merging.

Interactive games live in `src/components/games` and are imported by MDX game pages as hydrated React islands.

## Deployment

Deployment is automatic.

When changes are pushed to `main`, `.github/workflows/deploy.yml` builds the Astro site and publishes it to GitHub Pages.

On GitHub, the repository only needs Pages set to **GitHub Actions**:

1. Go to **Settings -> Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

For a custom domain or user/organization site, set `BASE_PATH=/` and `SITE_URL=https://your-domain.example` in the workflow environment.

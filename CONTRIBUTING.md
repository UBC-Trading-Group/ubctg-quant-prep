# Contributing

## Content Rules

1. Public content must be original.
2. Do not copy textbook problem statements or solutions.
3. Every concept page needs a definition, intuition, formula if relevant, original example, common mistake, and related practice.
4. Every worked question needs a problem, two hints, a solution, common mistake, related concept, and related game.
5. Use tags consistently.
6. Run `npm run build` before submitting a pull request.

## Adding a Concept

Concept pages live in `src/content/concepts` and use the schema in `src/content.config.ts`.

The easiest path is to use the GitHub Action:

1. Open the repository on GitHub.
2. Go to **Actions**.
3. Select **New Concept Draft**.
4. Click **Run workflow**.
5. Fill in the title, description, topic, difficulty, and comma-separated tags.
6. Submit the workflow run.
7. Edit the pull request that the workflow creates.
8. Merge the pull request after the build check passes.

For local drafts, copy `templates/concept-template.md` into `src/content/concepts/<slug>.md`.

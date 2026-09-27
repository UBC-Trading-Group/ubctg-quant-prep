# Quant Guide — site structure and launch plan

> Historical planning draft. Superseded by the approved one-page guide in `src/guide/` and the repository README. Do not use this earlier sitemap as the implementation plan.

Planning draft · 26 September 2026

Working name: **Quant Guide, by UBC Trading Group**. This is a content and layout proposal, not a production implementation. The accompanying clickable sketch illustrates the navigation and content density; its resource selections are examples pending editorial review.

## 1. Product decision

Make this a selective starting point for students exploring quantitative finance. Its recurring promise is: **find a useful resource, understand why it fits you, and try something with it.**

Keep the public experience small even as the research inventory grows. Organize around three immediate needs: choosing reading, preparing for interviews, and building something. Books and textbooks belong together. Games and worked questions belong together. Courses are optional supporting references, with no dedicated navigation item, homepage section, or launch directory.

The primary audience is a university student with some mathematical or programming interest who does not yet know where to start. Experienced readers can still use the selected references. Describe requirements on individual resources rather than making everyone choose a quant role or complete a curriculum first.

## 2. Navigation and sitemap

Header: **Quant Guide** (home) · **Start here** · **Resources** · **Practice**. A quieter **About the club ↗** link leads to the main club site.

Assumed eventual address: `ubctradinggroup.com/learn/`. This keeps the public guide visibly connected to the club. The main-site rebuild must confirm hosting and routing before implementation; the directory itself is not a ranking shortcut.

```text
/learn/                              Home
├── start/                           Start here
├── resources/                       Three curated collections
│   ├── books/                       Books and textbooks
│   ├── interviews/                  Official interview resources
│   └── data-projects/               Data and first project ideas
└── practice/                        Games, questions and external puzzles

Existing detail pages, reached through the collections above:
    games/[slug]/                    Interactive exercises
    questions/[slug]/                Problems with hints and solutions
    concepts/[slug]/                 Explanations attached to relevant practice
```

Seven main pages, plus retained individual content pages. The three content formats do not need three competing navigation items. The detail paths shown are relative to the future guide root; existing deployed URLs must be inventoried before any move.

Later, only when there is enough useful material and an owner:

- `topics/probability/` and `topics/market-making/`: small guides joining reading and practice.
- `resources/competitions/`: a maintained opportunity list with dates and eligibility.
- `notes/[slug]/`: write-ups produced by actual club projects or discussions.

Do not launch empty categories for papers, talks, courses, firms or news. Useful examples of those formats can already appear within the three collections.

## 3. Page layouts

### Home

The homepage should answer “what is this, and what can I do here?” in one short screen of decisions.

1. **Compact header.** Text branding with club attribution; three navigation links.
2. **Short introduction.** Proposed heading: “A useful first stop for quant finance.” One sentence about selected reading, practical resources and puzzles. One primary action: “Start here.”
3. **Three equal choices.** “Choose a book,” “Prepare for an interview,” and “Build a first project.” Each has one sentence and leads directly to its collection.
4. **One practice feature.** Show a short problem or a specific game with its topic and a single action. Link quietly to the full Practice area.
5. **Club attribution.** Explain who curates the guide and link to the club. Add evidence from real club work as it becomes available.

Avoid the current large decorative hero, resource-count strip and repeated expected-value recommendations. On mobile, stack the three choices, keep the header compact, and let the page scroll naturally. No sidebar or horizontal card carousel.

### Start here

A short orientation, not an onboarding questionnaire or a multi-month roadmap.

- Explain trading, research and development briefly, including that responsibilities overlap.
- Offer one recommended first action for each intent: understand the field, try a problem, or work with data.
- State any prerequisite beside the chosen action. The visitor should not have to learn the site's taxonomy first.
- End with one next step, not an expanding list of everything they could study.

This page should be readable without opening accordions. Further reading can be optional.

### Resources hub

Repeat the three collection names with slightly more context. This is an index, not another long catalog. Below them, include a short explanation of how selections are made: relevant purpose, clear prerequisites, reliable source and a useful next action. Link directly to the source from each collection.

At this scale, omit search, tag clouds and a filter sidebar. Add search only when users struggle to locate specific published material.

### Books and textbooks

Start with three annotated picks serving distinct needs: industry orientation, probability, and working with data. Follow with a compact selection grouped by purpose. Aim for **8–10 books total at launch**, with three highlighted; use the same entries in both places rather than duplicating descriptions.

Each entry answers:

- What is it, and who wrote it?
- Who is it useful for, and what should they already know?
- Why choose it over the nearest alternative?
- Where should they begin? Name a chapter only after verifying the edition.
- Is there an authorized free version, or is it paid/library access?

Use short paragraphs or rows rather than large cover-image cards. Combine books and textbooks on this page; label technical prerequisites where useful. Do not create a separate thin page for every book.

### Interview resources

Use **4–6 official resources**, organized by the problem they help solve: understand a firm's process, practise probability/markets, or prepare for technical discussion. Role labels are secondary metadata, not separate mandatory journeys.

Lead with employer-authored guidance. Each item explains what to use and the limits of its scope; one firm's process is not universal. Pair the probability material with a relevant local exercise. Keep commercial prep subscriptions and large employer directories out of the starting selection.

### Data and first project ideas

Show **three bounded project ideas**, each paired with a data source and, where useful, an existing example or tool. An idea is not advertised as a finished tutorial.

For example: explore macroeconomic series using FRED; compare published factor returns using the Kenneth French Data Library; examine a company's filings using SEC EDGAR. Each card specifies prerequisites, a concrete output, the first step, and one material data limitation. Put the easiest option first.

The finished output might be a chart plus a short interpretation or a reproducible notebook. Avoid making “build a profitable trading strategy” the beginner promise.

### Practice

One home for games, worked questions and selected external puzzle archives. Lead with **three starting exercises** selected from a reviewed launch set of approximately **6–8**. Label topic, format and difficulty, then offer a compact “More practice” list.

Each local exercise needs clear instructions, feedback or a worked solution, and a related reading link. A puzzle can offer a hint before revealing its solution. Existing concept explanations belong beside the relevant exercise.

Keep external archives, such as Jane Street's puzzles, in a small “More puzzles” section. Attribute and link to the original; do not reproduce external solutions without permission. External challenges may be considerably harder than the starting set, so explain their audience.

For repeat visits, add a small “Continue practising” row only after someone has used an exercise, with state stored on their device. No account is necessary for the first version. Saved resources and progress across devices can wait until demand justifies them.

## 4. Rules that prevent overload

- Show three recommended choices before the broader selection.
- Use one dominant action per block and one clear next step per detail page.
- Give each resource one main collection; cross-link it where useful without making duplicate pages.
- Keep the main navigation stable as new content arrives.
- Put a course or lecture series in an optional “Go deeper” section when it fills a specific gap. Usually one is enough; no completion requirement.
- Use no fabricated ratings, completion times, reviews or “used by our team” badges. Record genuine member experience as it occurs.
- Avoid release schedules that depend on constant new writing. Refresh existing selections before adding more.

## 5. What makes the aggregation useful

The editorial unit is **resource + reason + starting point + next action**. A copied publisher description and a link are insufficient.

Example: identify a probability text, explain its mathematical requirements, point to a verified starting section, and pair it with an expected-value exercise already on the site. That small connection is useful without requiring a long original article.

Internally, keep one resource record with title, author/provider, official URL, format, access conditions, topic, prerequisites, recommendation note, suggested starting point, related exercise, reviewer, source-check date and publication status. Distinguish “link checked” from “read or used by a member.”

Use consistent topic names across books, games, questions and concepts. Start with only topics present in the published selection, such as probability, market mechanics, statistics and programming/data. Avoid automatically generating a page for every tag.

The 333 link references in the research catalog remain a selection pool. They include cross-listings and candidates; they are not 333 publication-ready endorsements.

## 6. SEO, return visits and the club connection

**Search discovery:** publish a few substantial, useful collection pages addressing clear questions, such as choosing a first quant-finance book, finding official interview guidance, or selecting data for a first project. These are proposed reader intents, not validated keyword-volume forecasts. Give them descriptive titles, crawlable links and original selection guidance. Google explicitly asks whether curated material adds substantial value beyond its sources. [Google's helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

**Return visits:** let readers revisit exercises, resume recent practice and find a dependable short reading list. Feature a different reviewed exercise occasionally without promising a new daily puzzle. Add current competitions only when a named person can keep the details accurate.

**Club connection:** use visible “by UBC Trading Group” attribution and a quiet main-site link. When genuine club notes or project examples exist, connect them to the relevant resource. The main club site handles membership details and eligibility. A visitor outside UBC should still receive complete value from the guide.

Measure the sequence rather than just total traffic: organic entry pages and search queries; resource-link use; return visits to practice; visits to the main club site; and eligible application journeys where attribution is available. Review after a teaching term before adding more sections. There is no guarantee that a larger catalog, games, or a particular URL structure will improve rankings.

## 7. Reference patterns

| Reference | Observed pattern | What this plan borrows |
|---|---|---|
| [Teach Yourself Computer Science](https://teachyourselfcs.com/) | Selects resources by subject and explains why they are included; offers narrower starting recommendations. | A small opinionated selection with rationale. Its large study commitment is not part of this proposal. |
| [Papers We Love](https://paperswelove.org/) | Connects a shared paper collection with chapters and recorded discussions. | Let public resources lead naturally to evidence of the community's work. |

These are product-structure references. Their ranking performance, traffic and conversion rates have not been measured for this plan.

## 8. Existing demo: keep, combine and review

The current source contains 62 game entries, 58 questions and five concepts. Quantity does not establish quality or readiness; these counts were inspected locally on 26 September 2026.

| Current element | Proposed treatment |
|---|---|
| Games / Questions / Concepts header items | Replace with Start here / Resources / Practice. |
| Repeated game–question–concept paths on the homepage | Replace with one orientation action, three resource choices and one practice feature. |
| Existing individual games, questions and explanations | Preserve URLs initially; review for accuracy and usability before featuring them. |
| Games and questions indexes | Consolidate their navigation into Practice. Redirect old indexes only after matching their useful content and confirming deployed URLs. |
| Concept index | Remove from primary navigation; retain useful individual explanations and link them beside practice. |
| Automatic sitemap containing every content entry | Introduce an explicit publication/indexing decision; sitemap should contain canonical, public, indexable pages. Do not remove indexed pages indiscriminately. |
| Current styling | Retain the burgundy club accent with a calmer, more compact reading layout. |

Before any domain/path migration: inventory deployed URLs and available search data, confirm the main-site host, map old addresses to genuine equivalents, and check canonicals, internal links and redirects. The current configuration can use different base paths depending on deployment, so the `/learn/` address is a planning assumption.

## 9. Suggested build sequence

1. **Set the editorial selection.** Review 8–10 books, 4–6 official interview resources, three data/project bundles and 6–8 practice items. Name a page owner. Add a short original reason and next step to each resource.
2. **Build the seven-page shell.** Use the shared header, collection template and unified Practice entry point. Preserve useful existing detail content and route behavior.
3. **Check the actual experience.** Ask a newcomer to choose a suitable book, find a puzzle and explain who runs the site without help. Verify mobile layout, keyboard access, exercise correctness and source links. Complete the deployment/SEO checks above.
4. **Publish and maintain selectively.** Review stable collections once per term and check outgoing links regularly. If a competitions page is added, review it at least monthly and before advertising deadlines; clearly mark closed or uncertain opportunities.
5. **Expand from use.** Add a topic guide or member write-up when there is a real content need and enough material to answer it well.

The first release is complete when the seven main pages provide useful selections, the featured practice works, each published page has an owner, and visitors can reach the club naturally. A large content inventory or a full curriculum is not a launch requirement.

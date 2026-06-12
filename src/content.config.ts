import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const concepts = defineCollection({
  loader: glob({
    base: "./src/content/concepts",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    topic: z.string(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    tags: z.array(z.string()),
    relatedGames: z.array(z.string()).optional(),
    relatedQuestions: z.array(z.string()).optional(),
  }),
});

const questions = defineCollection({
  loader: glob({
    base: "./src/content/questions",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    topic: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    type: z.enum(["numeric", "conceptual", "proof", "coding", "market-making"]),
    tags: z.array(z.string()),
    relatedConcepts: z.array(z.string()).optional(),
    relatedGames: z.array(z.string()).optional(),
  }),
});

const games = defineCollection({
  loader: glob({
    base: "./src/content/games",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    category: z.string(),
    skill: z.string(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    tags: z.array(z.string()),
    component: z.string(),
    relatedConcepts: z.array(z.string()).optional(),
    relatedQuestions: z.array(z.string()).optional(),
  }),
});

export const collections = {
  concepts,
  questions,
  games,
};

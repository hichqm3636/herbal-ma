import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  articleSchema,
  authorSchema,
  categorySchema,
  ingredientSchema,
  sourceSchema,
} from "./content/schemas";

/**
 * Collection IDs are the POSIX path relative to the collection directory, without `.md`.
 * Localized entries therefore resolve as `ar/example-key` and `en/example-key`.
 * Authors and sources resolve as `example-key`.
 *
 * This generateId implementation is required because the default glob ID uses
 * frontmatter `slug` when present, which would collapse locales and disagree
 * with `reference()` and `src/integrations/content-integrity.mjs`.
 */
function generateCollectionId({ entry }: { entry: string }): string {
  return entry.replaceAll("\\", "/").replace(/\.md$/i, "");
}

const articles = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/articles",
    generateId: generateCollectionId,
  }),
  schema: articleSchema,
});

const ingredients = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/ingredients",
    generateId: generateCollectionId,
  }),
  schema: ingredientSchema,
});

const categories = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/categories",
    generateId: generateCollectionId,
  }),
  schema: categorySchema,
});

const authors = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/authors",
    generateId: generateCollectionId,
  }),
  schema: authorSchema,
});

const sources = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/sources",
    generateId: generateCollectionId,
  }),
  schema: sourceSchema,
});

export const collections = {
  articles,
  ingredients,
  categories,
  authors,
  sources,
};

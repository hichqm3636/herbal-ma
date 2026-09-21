import { reference } from "astro:content";
import { z } from "astro/zod";

const ASCII_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOI = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

const localeSchema = z.enum(["ar", "en"]);
const translationKeySchema = z
  .string()
  .regex(
    ASCII_KEY,
    "translationKey must be a stable ASCII kebab-case identifier",
  );
const slugSchema = z
  .string()
  .regex(ASCII_KEY, "slug must be a stable ASCII kebab-case identifier");
const lifecycleStatusSchema = z.enum([
  "draft",
  "in-review",
  "approved",
  "published",
  "needs-update",
  "archived",
]);
const riskLevelSchema = z.enum(["low", "medium", "high"]);
const editorialDateSchema = z.coerce.date();
const nonEmptyString = z.string().min(1);

const APPROVED_OR_LATER = new Set([
  "approved",
  "published",
  "needs-update",
  "archived",
]);
const PUBLISHED_OR_NEEDS_UPDATE = new Set(["published", "needs-update"]);

function referenceId(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    if ("id" in value && typeof value.id === "string") {
      return value.id;
    }
    if ("slug" in value && typeof value.slug === "string") {
      return value.slug;
    }
    if ("source" in value) {
      return referenceId(value.source);
    }
  }

  return JSON.stringify(value);
}

function uniqueReferenceArray(label: string, schema: z.ZodType) {
  return z.array(schema).superRefine((items, ctx) => {
    const seen = new Set<string>();

    for (const [index, item] of items.entries()) {
      const id = referenceId(item);
      if (seen.has(id)) {
        ctx.addIssue({
          code: "custom",
          message: `${label} contains duplicate target "${id}"`,
          path: [index],
        });
      }
      seen.add(id);
    }
  });
}

function localizedEntryId(locale: string, translationKey: string): string {
  return `${locale}/${translationKey}`;
}

function applyLifecycleDateRules(
  data: {
    status: z.infer<typeof lifecycleStatusSchema>;
    approvedAt?: Date;
    publishedAt?: Date;
  },
  ctx: z.core.$RefinementCtx,
): void {
  if (data.status === "approved" && data.approvedAt === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "approved content requires approvedAt",
      path: ["approvedAt"],
    });
  }

  if (PUBLISHED_OR_NEEDS_UPDATE.has(data.status)) {
    if (data.approvedAt === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "published and needs-update content requires approvedAt",
        path: ["approvedAt"],
      });
    }
    if (data.publishedAt === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "published and needs-update content requires publishedAt",
        path: ["publishedAt"],
      });
    }
  }
}

function applyAuthorReviewerRules(
  data: {
    status: z.infer<typeof lifecycleStatusSchema>;
    riskLevel: z.infer<typeof riskLevelSchema>;
    authors: unknown[];
    reviewer?: unknown;
  },
  ctx: z.core.$RefinementCtx,
): void {
  if (!APPROVED_OR_LATER.has(data.status)) {
    return;
  }
  if (data.riskLevel !== "medium" && data.riskLevel !== "high") {
    return;
  }

  if (data.reviewer === undefined) {
    ctx.addIssue({
      code: "custom",
      message:
        "medium/high approved-or-later content requires a reviewer distinct from its authors",
      path: ["reviewer"],
    });
    return;
  }

  const authorIds = new Set(data.authors.map(referenceId));
  const reviewerId = referenceId(data.reviewer);
  if (authorIds.has(reviewerId)) {
    ctx.addIssue({
      code: "custom",
      message:
        "medium/high approved-or-later content cannot use the same person as author and reviewer",
      path: ["reviewer"],
    });
  }
}

const citationSchema = z
  .object({
    source: reference("sources"),
    note: nonEmptyString.optional(),
  })
  .strict();

const commercialDisclosureSchema = z
  .object({
    hasCommercialInterest: z.boolean(),
    statement: nonEmptyString.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.hasCommercialInterest && value.statement === undefined) {
      ctx.addIssue({
        code: "custom",
        message:
          "commercialDisclosure.statement is required when hasCommercialInterest is true",
        path: ["statement"],
      });
    }
  });

const authorProfileSchema = z
  .object({
    displayName: nonEmptyString.optional(),
    bio: nonEmptyString.optional(),
    role: nonEmptyString.optional(),
    qualifications: nonEmptyString.optional(),
  })
  .strict();

export const articleSchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    title: nonEmptyString,
    summary: nonEmptyString,
    slug: slugSchema,
    status: lifecycleStatusSchema,
    riskLevel: riskLevelSchema,
    updatedAt: editorialDateSchema,
    reviewedAt: editorialDateSchema.optional(),
    approvedAt: editorialDateSchema.optional(),
    publishedAt: editorialDateSchema.optional(),
    authors: uniqueReferenceArray("authors", reference("authors")).min(1),
    reviewer: reference("authors").optional(),
    categories: uniqueReferenceArray("categories", reference("categories")).min(
      1,
    ),
    ingredients: uniqueReferenceArray(
      "ingredients",
      reference("ingredients"),
    ).default([]),
    relatedArticles: uniqueReferenceArray(
      "relatedArticles",
      reference("articles"),
    ).default([]),
    citations: uniqueReferenceArray("citations", citationSchema).default([]),
    commercialDisclosure: commercialDisclosureSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    applyLifecycleDateRules(data, ctx);
    applyAuthorReviewerRules(data, ctx);

    const selfId = localizedEntryId(data.locale, data.translationKey);
    for (const [index, related] of data.relatedArticles.entries()) {
      if (referenceId(related) === selfId) {
        ctx.addIssue({
          code: "custom",
          message: "relatedArticles cannot reference the current article",
          path: ["relatedArticles", index],
        });
      }
    }
  });

export const ingredientSchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    name: nonEmptyString,
    namingContext: nonEmptyString.optional(),
    summary: nonEmptyString,
    slug: slugSchema,
    status: lifecycleStatusSchema,
    riskLevel: riskLevelSchema,
    updatedAt: editorialDateSchema,
    reviewedAt: editorialDateSchema.optional(),
    approvedAt: editorialDateSchema.optional(),
    publishedAt: editorialDateSchema.optional(),
    categories: uniqueReferenceArray(
      "categories",
      reference("categories"),
    ).default([]),
    relatedIngredients: uniqueReferenceArray(
      "relatedIngredients",
      reference("ingredients"),
    ).default([]),
    sources: uniqueReferenceArray("sources", reference("sources")).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    applyLifecycleDateRules(data, ctx);

    const selfId = localizedEntryId(data.locale, data.translationKey);
    for (const [index, related] of data.relatedIngredients.entries()) {
      if (referenceId(related) === selfId) {
        ctx.addIssue({
          code: "custom",
          message: "relatedIngredients cannot reference the current ingredient",
          path: ["relatedIngredients", index],
        });
      }
    }
  });

export const categorySchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    name: nonEmptyString,
    description: nonEmptyString,
    slug: slugSchema,
    status: lifecycleStatusSchema,
    updatedAt: editorialDateSchema,
    reviewedAt: editorialDateSchema.optional(),
    approvedAt: editorialDateSchema.optional(),
    publishedAt: editorialDateSchema.optional(),
    parent: reference("categories").optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    applyLifecycleDateRules(data, ctx);

    if (data.parent === undefined) {
      return;
    }

    const selfId = localizedEntryId(data.locale, data.translationKey);
    if (referenceId(data.parent) === selfId) {
      ctx.addIssue({
        code: "custom",
        message: "parent cannot reference the current category",
        path: ["parent"],
      });
    }
  });

export const authorSchema = z
  .object({
    name: nonEmptyString,
    credentials: nonEmptyString.optional(),
    disclosure: nonEmptyString.optional(),
    profiles: z
      .object({
        ar: authorProfileSchema.optional(),
        en: authorProfileSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const identity = data.name.trim().toLowerCase();
    if (identity === "ai" || identity.startsWith("ai ")) {
      ctx.addIssue({
        code: "custom",
        message: "AI must never be represented as an Author",
        path: ["name"],
      });
    }
  });

export const sourceSchema = z
  .object({
    title: nonEmptyString,
    publisher: nonEmptyString,
    type: nonEmptyString,
    authorName: nonEmptyString.optional(),
    publishedOn: editorialDateSchema.optional(),
    accessedOn: editorialDateSchema.optional(),
    doi: z
      .string()
      .regex(DOI, "doi must be a valid DOI, for example 10.1234/example")
      .optional(),
    url: z.url().optional(),
    locale: localeSchema.optional(),
    notes: nonEmptyString.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.doi === undefined && data.url === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "a Source must include a doi, a url, or both",
        path: ["url"],
      });
    }
  });

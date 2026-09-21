import { reference } from "astro:content";
import { z } from "astro/zod";

const ASCII_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOI = /^10\.\d{4,9}\/\S+$/;
const EDITORIAL_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const localeSchema = z.enum(["ar", "en"]);
const translationKeySchema = z
  .string()
  .trim()
  .regex(
    ASCII_KEY,
    "translationKey must be a stable ASCII kebab-case identifier",
  );
const slugSchema = z
  .string()
  .trim()
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
const sourceTypeSchema = z.enum([
  "official-guidance",
  "regulatory-document",
  "systematic-review",
  "meta-analysis",
  "clinical-guideline",
  "controlled-trial",
  "primary-research",
  "academic-reference",
  "manufacturer-material",
  "other",
]);
const nonEmptyString = z.string().trim().min(1);

const APPROVED_OR_LATER = new Set([
  "approved",
  "published",
  "needs-update",
  "archived",
]);

const FORBIDDEN_LIFECYCLE_FIELDS = {
  draft: ["approvedBy", "approvedAt", "publishedAt", "archivedAt"],
  "in-review": ["approvedBy", "approvedAt", "publishedAt", "archivedAt"],
  approved: ["publishedAt", "archivedAt"],
} as const;

const REQUIRED_LIFECYCLE_FIELDS = {
  approved: ["approvedBy", "approvedAt"],
  published: ["approvedBy", "approvedAt", "publishedAt"],
  "needs-update": ["approvedBy", "approvedAt", "publishedAt"],
  archived: ["approvedBy", "approvedAt", "publishedAt", "archivedAt"],
} as const;

function isValidCalendarDate(value: string): boolean {
  const match = CALENDAR_DATE.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidEditorialTimestamp(value: string): boolean {
  const match = EDITORIAL_TIMESTAMP.exec(value);
  if (!match) {
    return false;
  }

  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  return (
    isValidCalendarDate(`${match[1]}-${match[2]}-${match[3]}`) &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59
  );
}

const editorialTimestampSchema = nonEmptyString.refine(
  isValidEditorialTimestamp,
  "editorial timestamps must be UTC RFC3339 strings of the form YYYY-MM-DDTHH:mm:ssZ",
);
const sourceDateSchema = nonEmptyString.refine(
  isValidCalendarDate,
  "source dates must be valid calendar dates of the form YYYY-MM-DD",
);
const httpUrlSchema = z.httpUrl();

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

function uniqueItems<T>(
  items: T[],
  ctx: z.core.$RefinementCtx,
  label: string,
  identity: (item: T) => string,
): void {
  const seen = new Set<string>();

  for (const [index, item] of items.entries()) {
    const id = identity(item);
    if (seen.has(id)) {
      ctx.addIssue({
        code: "custom",
        message: `${label} contains duplicate value "${id}"`,
        path: [index],
      });
    }
    seen.add(id);
  }
}

function uniqueReferenceArray(label: string, schema: z.ZodType, min = 0) {
  let arraySchema = z.array(schema);
  if (min > 0) {
    arraySchema = arraySchema.min(min);
  }

  return arraySchema.superRefine((items, ctx) => {
    uniqueItems(items, ctx, label, referenceId);
  });
}

function uniqueStringArray(label: string) {
  return z.array(nonEmptyString).superRefine((items, ctx) => {
    uniqueItems(items, ctx, label, (item) => item);
  });
}

function localizedEntryId(locale: string, translationKey: string): string {
  return `${locale}/${translationKey}`;
}

type LifecycleFields = {
  status: z.infer<typeof lifecycleStatusSchema>;
  approvedBy?: unknown;
  approvedAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  archivedAt?: string;
};

function applyLifecycleRules(
  data: LifecycleFields,
  ctx: z.core.$RefinementCtx,
): void {
  const forbidden =
    FORBIDDEN_LIFECYCLE_FIELDS[
      data.status as keyof typeof FORBIDDEN_LIFECYCLE_FIELDS
    ] ?? [];
  for (const field of forbidden) {
    if (data[field] !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: `${data.status} content must not contain ${field}`,
        path: [field],
      });
    }
  }

  const required =
    REQUIRED_LIFECYCLE_FIELDS[
      data.status as keyof typeof REQUIRED_LIFECYCLE_FIELDS
    ] ?? [];
  for (const field of required) {
    if (data[field] === undefined) {
      ctx.addIssue({
        code: "custom",
        message: `${data.status} content requires ${field}`,
        path: [field],
      });
    }
  }

  if (
    data.publishedAt !== undefined &&
    data.approvedAt !== undefined &&
    data.publishedAt < data.approvedAt
  ) {
    ctx.addIssue({
      code: "custom",
      message: "publishedAt must not precede approvedAt",
      path: ["publishedAt"],
    });
  }

  if (
    data.updatedAt !== undefined &&
    data.publishedAt !== undefined &&
    data.updatedAt < data.publishedAt
  ) {
    ctx.addIssue({
      code: "custom",
      message: "updatedAt must not precede publishedAt",
      path: ["updatedAt"],
    });
  }

  if (
    data.archivedAt !== undefined &&
    data.publishedAt !== undefined &&
    data.archivedAt < data.publishedAt
  ) {
    ctx.addIssue({
      code: "custom",
      message: "archivedAt must not precede publishedAt",
      path: ["archivedAt"],
    });
  }
}

function applyHealthRiskReviewRules(
  data: {
    status: z.infer<typeof lifecycleStatusSchema>;
    riskLevel: z.infer<typeof riskLevelSchema>;
    authors: unknown[];
    reviewers?: unknown[];
    sources?: unknown[];
    lastReviewedAt?: string;
  },
  ctx: z.core.$RefinementCtx,
): void {
  if (!APPROVED_OR_LATER.has(data.status)) {
    return;
  }
  if (data.riskLevel !== "medium" && data.riskLevel !== "high") {
    return;
  }

  if (data.lastReviewedAt === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "medium/high approved-or-later content requires lastReviewedAt",
      path: ["lastReviewedAt"],
    });
  }

  if (!data.sources || data.sources.length < 1) {
    ctx.addIssue({
      code: "custom",
      message:
        "medium/high approved-or-later content requires at least one Source citation",
      path: ["sources"],
    });
  }

  if (!data.reviewers || data.reviewers.length < 1) {
    ctx.addIssue({
      code: "custom",
      message:
        "medium/high approved-or-later content requires at least one reviewer distinct from its authors",
      path: ["reviewers"],
    });
    return;
  }

  const authorIds = new Set(data.authors.map(referenceId));
  for (const [index, reviewer] of data.reviewers.entries()) {
    const reviewerId = referenceId(reviewer);
    if (authorIds.has(reviewerId)) {
      ctx.addIssue({
        code: "custom",
        message:
          "medium/high approved-or-later content cannot use the same person as author and reviewer",
        path: ["reviewers", index],
      });
    }
  }
}

function rejectSelfReference(
  items: unknown[] | undefined,
  selfId: string,
  field: string,
  ctx: z.core.$RefinementCtx,
): void {
  if (!items) {
    return;
  }

  for (const [index, item] of items.entries()) {
    if (referenceId(item) === selfId) {
      ctx.addIssue({
        code: "custom",
        message: `${field} cannot reference the current entry`,
        path: [field, index],
      });
    }
  }
}

const citationSchema = z
  .object({
    source: reference("sources"),
    supports: nonEmptyString,
    locator: nonEmptyString.optional(),
  })
  .strict();

const authorProfileSchema = z
  .object({
    displayName: nonEmptyString.optional(),
    biography: nonEmptyString.optional(),
    role: nonEmptyString.optional(),
    qualifications: uniqueStringArray("qualifications").optional(),
    disclosures: uniqueStringArray("disclosures").optional(),
  })
  .strict()
  .superRefine((profile, ctx) => {
    const hasContent =
      profile.displayName !== undefined ||
      profile.biography !== undefined ||
      profile.role !== undefined ||
      (profile.qualifications !== undefined &&
        profile.qualifications.length > 0) ||
      (profile.disclosures !== undefined && profile.disclosures.length > 0);

    if (!hasContent) {
      ctx.addIssue({
        code: "custom",
        message: "a localized author profile must contain at least one field",
      });
    }
  });

const lifecycleSharedFields = {
  status: lifecycleStatusSchema,
  authors: uniqueReferenceArray("authors", reference("authors"), 1),
  reviewers: uniqueReferenceArray("reviewers", reference("authors")).optional(),
  approvedBy: reference("authors").optional(),
  approvedAt: editorialTimestampSchema.optional(),
  publishedAt: editorialTimestampSchema.optional(),
  updatedAt: editorialTimestampSchema.optional(),
  archivedAt: editorialTimestampSchema.optional(),
};

export const articleSchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    slug: slugSchema,
    title: nonEmptyString,
    summary: nonEmptyString,
    riskLevel: riskLevelSchema,
    ...lifecycleSharedFields,
    lastReviewedAt: editorialTimestampSchema.optional(),
    categories: uniqueReferenceArray("categories", reference("categories"), 1),
    ingredients: uniqueReferenceArray(
      "ingredients",
      reference("ingredients"),
    ).optional(),
    relatedArticles: uniqueReferenceArray(
      "relatedArticles",
      reference("articles"),
    ).optional(),
    sources: uniqueReferenceArray("sources", citationSchema).optional(),
    commercialDisclosure: nonEmptyString.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    applyLifecycleRules(data, ctx);
    applyHealthRiskReviewRules(data, ctx);
    rejectSelfReference(
      data.relatedArticles,
      localizedEntryId(data.locale, data.translationKey),
      "relatedArticles",
      ctx,
    );
  });

export const ingredientSchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    slug: slugSchema,
    name: nonEmptyString,
    summary: nonEmptyString,
    riskLevel: riskLevelSchema,
    aliases: uniqueStringArray("aliases").optional(),
    ...lifecycleSharedFields,
    lastReviewedAt: editorialTimestampSchema.optional(),
    categories: uniqueReferenceArray(
      "categories",
      reference("categories"),
    ).optional(),
    relatedIngredients: uniqueReferenceArray(
      "relatedIngredients",
      reference("ingredients"),
    ).optional(),
    sources: uniqueReferenceArray("sources", citationSchema).optional(),
    commercialDisclosure: nonEmptyString.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    applyLifecycleRules(data, ctx);
    applyHealthRiskReviewRules(data, ctx);
    rejectSelfReference(
      data.relatedIngredients,
      localizedEntryId(data.locale, data.translationKey),
      "relatedIngredients",
      ctx,
    );
  });

export const categorySchema = z
  .object({
    locale: localeSchema,
    translationKey: translationKeySchema,
    slug: slugSchema,
    name: nonEmptyString,
    description: nonEmptyString,
    ...lifecycleSharedFields,
    parent: reference("categories").optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    applyLifecycleRules(data, ctx);

    if (data.parent === undefined) {
      return;
    }

    const parentId = referenceId(data.parent);
    const selfId = localizedEntryId(data.locale, data.translationKey);
    if (parentId === selfId) {
      ctx.addIssue({
        code: "custom",
        message: "parent cannot reference the current category",
        path: ["parent"],
      });
    }

    if (!parentId.startsWith(`${data.locale}/`)) {
      ctx.addIssue({
        code: "custom",
        message: "parent must reference a Category in the same locale",
        path: ["parent"],
      });
    }
  });

export const authorSchema = z
  .object({
    displayName: nonEmptyString,
    profiles: z
      .object({
        ar: authorProfileSchema.optional(),
        en: authorProfileSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const sourceSchema = z
  .object({
    title: nonEmptyString,
    publisher: nonEmptyString,
    type: sourceTypeSchema,
    authors: uniqueStringArray("authors").optional(),
    institution: nonEmptyString.optional(),
    publishedOn: sourceDateSchema.optional(),
    accessedOn: sourceDateSchema.optional(),
    doi: z
      .string()
      .trim()
      .regex(DOI, "doi must match 10.<prefix>/<suffix>")
      .optional(),
    url: httpUrlSchema.optional(),
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

    if (data.url !== undefined && data.accessedOn === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "accessedOn is required when url exists",
        path: ["accessedOn"],
      });
    }

    if (
      data.publishedOn !== undefined &&
      data.accessedOn !== undefined &&
      data.publishedOn > data.accessedOn
    ) {
      ctx.addIssue({
        code: "custom",
        message: "publishedOn must not be later than accessedOn",
        path: ["publishedOn"],
      });
    }
  });

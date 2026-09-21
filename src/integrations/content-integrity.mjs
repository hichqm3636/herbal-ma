import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const LOCALES = new Set(["ar", "en"]);
const APPROVED_OR_LATER = new Set([
  "approved",
  "published",
  "needs-update",
  "archived",
]);

const COLLECTIONS = {
  articles: { localized: true, requiresBody: true },
  ingredients: { localized: true, requiresBody: false },
  categories: { localized: true, requiresBody: false },
  authors: { localized: false, requiresBody: false },
  sources: { localized: false, requiresBody: false },
};

const RELATIONSHIPS = {
  articles: [
    { field: "authors", collection: "authors", sameLocale: false },
    { field: "reviewer", collection: "authors", sameLocale: false },
    { field: "categories", collection: "categories", sameLocale: true },
    { field: "ingredients", collection: "ingredients", sameLocale: true },
    {
      field: "relatedArticles",
      collection: "articles",
      sameLocale: true,
      rejectSelf: true,
    },
    {
      field: "citations",
      collection: "sources",
      sameLocale: false,
      nestedField: "source",
    },
  ],
  ingredients: [
    { field: "categories", collection: "categories", sameLocale: true },
    {
      field: "relatedIngredients",
      collection: "ingredients",
      sameLocale: true,
      rejectSelf: true,
    },
    { field: "sources", collection: "sources", sameLocale: false },
  ],
  categories: [
    {
      field: "parent",
      collection: "categories",
      sameLocale: true,
      rejectSelf: true,
    },
  ],
};

function collectionEntryId(relativePath) {
  // Must match generateCollectionId() in src/content.config.ts.
  return relativePath.replaceAll("\\", "/").replace(/\.md$/i, "");
}

function splitMarkdown(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n") && normalized !== "---") {
    return { data: null, body: normalized, hasFrontmatter: false };
  }

  const end = normalized.indexOf("\n---", 3);
  if (end === -1) {
    return { data: null, body: normalized, hasFrontmatter: false };
  }

  const yamlText = normalized.slice(4, end);
  const body = normalized.slice(end + 4).replace(/^\n/, "");
  return { yamlText, body, hasFrontmatter: true };
}

function walkMarkdown(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = [];
  for (const dirent of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...walkMarkdown(fullPath));
    } else if (dirent.isFile() && dirent.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function referenceIds(value, nestedField) {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => referenceIds(item, nestedField));
  }
  if (nestedField && typeof value === "object" && value[nestedField] != null) {
    return referenceIds(value[nestedField]);
  }
  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }
  if (value && typeof value === "object") {
    if (typeof value.id === "string") {
      return [value.id];
    }
    if (typeof value.slug === "string") {
      return [value.slug];
    }
  }
  return [];
}

function localeFromId(id) {
  const prefix = String(id).split("/")[0];
  return LOCALES.has(prefix) ? prefix : null;
}

function loadCollection(contentDir, name, definition) {
  const collectionDir = path.join(contentDir, name);
  const entries = [];

  for (const filePath of walkMarkdown(collectionDir)) {
    const relativePath = path.relative(collectionDir, filePath);
    const id = collectionEntryId(relativePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const split = splitMarkdown(raw);
    let data = {};

    if (split.hasFrontmatter) {
      data = parseYaml(split.yamlText) ?? {};
    }

    entries.push({
      collection: name,
      id,
      filePath,
      relativePath: relativePath.replaceAll("\\", "/"),
      data: data && typeof data === "object" ? data : {},
      body: split.body ?? "",
      hasFrontmatter: split.hasFrontmatter,
      localized: definition.localized,
      requiresBody: definition.requiresBody,
    });
  }

  return entries;
}

function validateGraph(contentDir) {
  const errors = [];
  const byCollection = {};

  for (const [name, definition] of Object.entries(COLLECTIONS)) {
    byCollection[name] = loadCollection(contentDir, name, definition);
  }

  const ids = {};
  for (const [name, entries] of Object.entries(byCollection)) {
    ids[name] = new Set(entries.map((entry) => entry.id));
  }

  const localeTranslationKeys = new Map();
  const localeSlugs = new Map();

  for (const entries of Object.values(byCollection)) {
    for (const entry of entries) {
      const prefix = `[${entry.collection}:${entry.id}]`;

      if (!entry.hasFrontmatter) {
        errors.push(`${prefix} missing YAML frontmatter`);
        continue;
      }

      if (
        !entry.localized &&
        Object.prototype.hasOwnProperty.call(entry.data, "translationKey")
      ) {
        errors.push(
          `${prefix} Author and Source entries must not contain translationKey`,
        );
      }

      if (entry.requiresBody && entry.body.trim() === "") {
        errors.push(`${prefix} Article body must be non-empty`);
      }

      if (entry.localized) {
        const parts = entry.relativePath.split("/");
        if (parts.length !== 2) {
          errors.push(
            `${prefix} localized entries must use the path <locale>/<translationKey>.md`,
          );
        } else {
          const [pathLocale, fileName] = parts;
          const translationKey = fileName.replace(/\.md$/i, "");

          if (!LOCALES.has(pathLocale)) {
            errors.push(
              `${prefix} path locale "${pathLocale}" is not a supported locale`,
            );
          }

          if (
            entry.data.locale != null &&
            String(entry.data.locale) !== pathLocale
          ) {
            errors.push(
              `${prefix} path locale "${pathLocale}" does not match frontmatter locale "${entry.data.locale}"`,
            );
          }

          if (
            entry.data.translationKey != null &&
            String(entry.data.translationKey) !== translationKey
          ) {
            errors.push(
              `${prefix} filename "${translationKey}" does not match translationKey "${entry.data.translationKey}"`,
            );
          }

          if (entry.data.locale != null && entry.data.translationKey != null) {
            const key = `${entry.collection}:${entry.data.locale}:${entry.data.translationKey}`;
            const previous = localeTranslationKeys.get(key);
            if (previous) {
              errors.push(
                `${prefix} duplicate locale + translationKey "${entry.data.locale}/${entry.data.translationKey}" also used by ${previous}`,
              );
            } else {
              localeTranslationKeys.set(key, `${entry.collection}:${entry.id}`);
            }
          }

          if (entry.data.locale != null && entry.data.slug != null) {
            const key = `${entry.collection}:${entry.data.locale}:${entry.data.slug}`;
            const previous = localeSlugs.get(key);
            if (previous) {
              errors.push(
                `${prefix} duplicate same-locale slug "${entry.data.slug}" also used by ${previous}`,
              );
            } else {
              localeSlugs.set(key, `${entry.collection}:${entry.id}`);
            }
          }
        }
      } else if (entry.relativePath.includes("/")) {
        errors.push(
          `${prefix} Author and Source entries must use a language-neutral ID of the form example-key`,
        );
      }

      const status = entry.data.status;
      const riskLevel = entry.data.riskLevel;
      if (
        (riskLevel === "medium" || riskLevel === "high") &&
        APPROVED_OR_LATER.has(status)
      ) {
        const authorIds = referenceIds(entry.data.authors);
        const reviewerIds = referenceIds(entry.data.reviewer);
        if (reviewerIds.length === 0) {
          errors.push(
            `${prefix} medium/high approved-or-later content requires a reviewer distinct from its authors`,
          );
        } else {
          const authorSet = new Set(authorIds);
          for (const reviewerId of reviewerIds) {
            if (authorSet.has(reviewerId)) {
              errors.push(
                `${prefix} medium/high approved-or-later content cannot use the same person as author and reviewer ("${reviewerId}")`,
              );
            }
          }
        }
      }

      for (const relationship of RELATIONSHIPS[entry.collection] ?? []) {
        const rawValue = entry.data[relationship.field];
        const targetIds = referenceIds(rawValue, relationship.nestedField);
        const seen = new Set();

        for (const targetId of targetIds) {
          if (seen.has(targetId)) {
            errors.push(
              `${prefix} ${relationship.field} contains duplicate target "${targetId}"`,
            );
            continue;
          }
          seen.add(targetId);

          if (!ids[relationship.collection].has(targetId)) {
            errors.push(
              `${prefix} ${relationship.field} references missing ${relationship.collection} ID "${targetId}"`,
            );
            continue;
          }

          if (relationship.rejectSelf && targetId === entry.id) {
            errors.push(
              `${prefix} ${relationship.field} cannot reference the current entry`,
            );
          }

          if (relationship.sameLocale) {
            const targetLocale = localeFromId(targetId);
            const sourceLocale = entry.data.locale ?? localeFromId(entry.id);
            if (
              targetLocale &&
              sourceLocale &&
              targetLocale !== String(sourceLocale)
            ) {
              errors.push(
                `${prefix} ${relationship.field} "${targetId}" violates same-locale relationship rules`,
              );
            }
          }
        }
      }
    }
  }

  const parentById = new Map();
  for (const entry of byCollection.categories) {
    const parentIds = referenceIds(entry.data.parent);
    if (parentIds[0]) {
      parentById.set(entry.id, parentIds[0]);
    }
  }

  for (const [id, parentId] of parentById.entries()) {
    const seen = new Set([id]);
    let current = parentId;
    const chain = [id];
    while (current) {
      chain.push(current);
      if (seen.has(current)) {
        errors.push(
          `[categories:${id}] category parent cycle: ${chain.join(" -> ")}`,
        );
        break;
      }
      seen.add(current);
      current = parentById.get(current);
    }
  }

  return errors;
}

export default function contentIntegrity() {
  return {
    name: "content-integrity",
    hooks: {
      "astro:config:setup": ({ command, config, logger, addWatchFile }) => {
        if (command === "preview") {
          return;
        }

        const root = fileURLToPath(config.root);
        const contentDir = path.join(root, "src/content");

        if (command === "dev") {
          for (const filePath of walkMarkdown(contentDir)) {
            addWatchFile(filePath);
          }
        }

        const errors = validateGraph(contentDir);
        if (errors.length === 0) {
          logger.info("Content integrity checks passed.");
          return;
        }

        for (const error of errors) {
          logger.error(error);
        }

        throw new Error(
          `Content integrity failed with ${errors.length} issue(s):\n- ${errors.join("\n- ")}`,
        );
      },
    },
  };
}

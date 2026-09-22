import type { Locale } from "./locales";

export type SearchEntityType = "article" | "ingredient" | "category";

export type SearchRecord = {
  type: SearchEntityType;
  title: string;
  summary: string;
  href: string;
  aliases?: string[];
  needsUpdate: boolean;
};

export type SearchQuery = {
  phrase: string;
  tokens: string[];
};

export const MAX_QUERY_LENGTH = 200;
export const MIN_QUERY_LENGTH = 2;

const TATWEEL = /\u0640/gu;
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670]/gu;
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/gu;
const ALEF_MAQSURA = /\u0649/gu;
const PUNCTUATION_OR_SYMBOL = /[\p{P}\p{S}]/gu;
const WHITESPACE = /\s+/gu;

const ARABIC_ALEF = "\u0627";
const ARABIC_YEH = "\u064A";

const RANK_TITLE_EXACT = 1;
const RANK_TITLE_PREFIX = 2;
const RANK_TITLE_CONTAINS = 3;
const RANK_ALIAS_EXACT = 4;
const RANK_ALIAS_PREFIX = 5;
const RANK_ALIAS_CONTAINS = 6;
const RANK_SUMMARY_CONTAINS = 7;
const RANK_TOKENS = 8;
const RANK_NONE = Number.POSITIVE_INFINITY;

const TYPE_ORDER: Record<SearchEntityType, number> = {
  article: 0,
  ingredient: 1,
  category: 2,
};

type IndexedRecord = {
  record: SearchRecord;
  title: string;
  aliases: string[];
  summary: string;
  haystack: string;
  wholeTokens: Set<string>;
};

/**
 * Normalizes text for comparison only. It is never rendered.
 *
 * Arabic folds tatweel, harakat, alef variants, and alef maqsura, because
 * readers type those forms inconsistently. It deliberately leaves ة, ه, ؤ, ئ,
 * and standalone ء untouched, because folding them changes meaning.
 */
export function normalizeSearchText(value: string, locale: Locale): string {
  let text = value.normalize("NFC");

  if (locale === "ar") {
    text = text
      .replace(TATWEEL, "")
      .replace(ARABIC_DIACRITICS, "")
      .replace(ALEF_VARIANTS, ARABIC_ALEF)
      .replace(ALEF_MAQSURA, ARABIC_YEH);
  }

  return text
    .replace(PUNCTUATION_OR_SYMBOL, " ")
    .replace(WHITESPACE, " ")
    .trim()
    .toLowerCase();
}

export function prepareSearchQuery(
  rawQuery: string,
  locale: Locale,
): SearchQuery | undefined {
  const normalized = normalizeSearchText(rawQuery, locale)
    .slice(0, MAX_QUERY_LENGTH)
    .trim();

  if (normalized.length < MIN_QUERY_LENGTH) {
    return undefined;
  }

  return {
    phrase: normalized,
    tokens: normalized.split(" "),
  };
}

function compareRaw(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function indexRecord(record: SearchRecord, locale: Locale): IndexedRecord {
  const title = normalizeSearchText(record.title, locale);
  const aliases = (record.aliases ?? [])
    .map((alias) => normalizeSearchText(alias, locale))
    .filter((alias) => alias.length > 0);
  const summary = normalizeSearchText(record.summary, locale);
  const haystack = [title, ...aliases, summary]
    .filter((field) => field.length > 0)
    .join(" ");

  return {
    record,
    title,
    aliases,
    summary,
    haystack,
    wholeTokens: new Set(haystack.length > 0 ? haystack.split(" ") : []),
  };
}

/**
 * A single-character token matches only as a whole token, so the "d" in
 * "vitamin d" cannot match the "d" inside "dietary".
 */
function matchesToken(indexed: IndexedRecord, token: string): boolean {
  if (token.length === 1) {
    return indexed.wholeTokens.has(token);
  }

  return indexed.haystack.includes(token);
}

function rankRecord(indexed: IndexedRecord, query: SearchQuery): number {
  const { phrase, tokens } = query;

  if (indexed.title === phrase) {
    return RANK_TITLE_EXACT;
  }

  if (indexed.title.startsWith(phrase)) {
    return RANK_TITLE_PREFIX;
  }

  if (indexed.title.includes(phrase)) {
    return RANK_TITLE_CONTAINS;
  }

  if (indexed.aliases.some((alias) => alias === phrase)) {
    return RANK_ALIAS_EXACT;
  }

  if (indexed.aliases.some((alias) => alias.startsWith(phrase))) {
    return RANK_ALIAS_PREFIX;
  }

  if (indexed.aliases.some((alias) => alias.includes(phrase))) {
    return RANK_ALIAS_CONTAINS;
  }

  if (indexed.summary.includes(phrase)) {
    return RANK_SUMMARY_CONTAINS;
  }

  if (tokens.every((token) => matchesToken(indexed, token))) {
    return RANK_TOKENS;
  }

  return RANK_NONE;
}

export function searchRecords(
  records: readonly SearchRecord[],
  query: SearchQuery,
  locale: Locale,
): SearchRecord[] {
  const collator = new Intl.Collator(locale);
  const matched: { indexed: IndexedRecord; rank: number }[] = [];

  for (const record of records) {
    const indexed = indexRecord(record, locale);
    const rank = rankRecord(indexed, query);

    if (rank !== RANK_NONE) {
      matched.push({ indexed, rank });
    }
  }

  matched.sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    const typeCompare =
      TYPE_ORDER[left.indexed.record.type] -
      TYPE_ORDER[right.indexed.record.type];
    if (typeCompare !== 0) {
      return typeCompare;
    }

    const titleCompare = collator.compare(
      left.indexed.record.title,
      right.indexed.record.title,
    );
    if (titleCompare !== 0) {
      return titleCompare;
    }

    return compareRaw(left.indexed.record.href, right.indexed.record.href);
  });

  return matched.map((entry) => entry.indexed.record);
}

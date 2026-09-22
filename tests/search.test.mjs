import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  MAX_QUERY_LENGTH,
  normalizeSearchText,
  prepareSearchQuery,
  searchRecords,
} from "../src/lib/search.ts";

function record(overrides) {
  return {
    type: "article",
    title: "Title",
    summary: "Summary",
    href: "/en/articles/title/",
    needsUpdate: false,
    ...overrides,
  };
}

function search(records, rawQuery, locale) {
  const query = prepareSearchQuery(rawQuery, locale);
  assert.notEqual(query, undefined, `expected "${rawQuery}" to be searchable`);
  return searchRecords(records, query, locale).map((entry) => entry.href);
}

describe("Arabic normalization", () => {
  test("strips harakat, tanween, and shadda", () => {
    assert.equal(normalizeSearchText("المكمّلات", "ar"), "المكملات");
    assert.equal(normalizeSearchText("تُقيَّم", "ar"), "تقيم");
    assert.equal(normalizeSearchText("كتابًا", "ar"), "كتابا");
  });

  test("strips the superscript alef", () => {
    assert.equal(normalizeSearchText("هٰذا", "ar"), "هذا");
  });

  test("folds alef variants to bare alef", () => {
    assert.equal(normalizeSearchText("الأدلة", "ar"), "الادلة");
    assert.equal(normalizeSearchText("إلى", "ar"), "الي");
    assert.equal(normalizeSearchText("آمن", "ar"), "امن");
    assert.equal(normalizeSearchText("ٱسم", "ar"), "اسم");
  });

  test("folds alef maqsura to yeh", () => {
    assert.equal(normalizeSearchText("على", "ar"), "علي");
  });

  test("removes tatweel", () => {
    assert.equal(normalizeSearchText("بحـــث", "ar"), "بحث");
  });

  test("replaces Arabic punctuation with a space", () => {
    assert.equal(
      normalizeSearchText("فيتامين د: مدخل تعريفي", "ar"),
      "فيتامين د مدخل تعريفي",
    );
    assert.equal(
      normalizeSearchText("ما هي المكمّلات؟", "ar"),
      "ما هي المكملات",
    );
    assert.equal(normalizeSearchText("أ، ب؛ ج", "ar"), "ا ب ج");
  });

  test("lowercases Latin text inside Arabic records", () => {
    assert.equal(
      normalizeSearchText("Herbal.ma والمكمّلات", "ar"),
      "herbal ma والمكملات",
    );
  });

  test("does not fold ta marbuta to heh", () => {
    assert.equal(normalizeSearchText("الغذائية", "ar"), "الغذائية");
    assert.notEqual(
      normalizeSearchText("سنة", "ar"),
      normalizeSearchText("سنه", "ar"),
    );
  });

  test("does not fold waw hamza to waw", () => {
    assert.equal(normalizeSearchText("مسؤول", "ar"), "مسؤول");
    assert.notEqual(
      normalizeSearchText("مسؤول", "ar"),
      normalizeSearchText("مسوول", "ar"),
    );
  });

  test("does not fold yeh hamza to yeh", () => {
    assert.equal(normalizeSearchText("فائدة", "ar"), "فائدة");
    assert.notEqual(
      normalizeSearchText("فائدة", "ar"),
      normalizeSearchText("فايدة", "ar"),
    );
  });

  test("does not strip the standalone hamza or the definite article", () => {
    assert.equal(normalizeSearchText("ماء", "ar"), "ماء");
    assert.equal(normalizeSearchText("الزنك", "ar"), "الزنك");
  });
});

describe("English normalization", () => {
  test("is case-insensitive", () => {
    assert.equal(normalizeSearchText("Vitamin D", "en"), "vitamin d");
    assert.equal(normalizeSearchText("VITAMIN D", "en"), "vitamin d");
  });

  test("replaces punctuation with a space", () => {
    assert.equal(
      normalizeSearchText("Vitamin D: an introductory overview", "en"),
      "vitamin d an introductory overview",
    );
    assert.equal(normalizeSearchText("Herbal.ma", "en"), "herbal ma");
  });

  test("replaces hyphen, en dash, and em dash with a space", () => {
    assert.equal(normalizeSearchText("vitamin-d", "en"), "vitamin d");
    assert.equal(normalizeSearchText("fat\u2013soluble", "en"), "fat soluble");
    assert.equal(
      normalizeSearchText("supplements \u2014 and not", "en"),
      "supplements and not",
    );
  });

  test("collapses whitespace and trims", () => {
    assert.equal(normalizeSearchText("  vitamin   d \n", "en"), "vitamin d");
  });

  test("leaves Arabic transformations out of the English locale", () => {
    assert.equal(normalizeSearchText("الأدلة", "en"), "الأدلة");
  });
});

describe("query preparation", () => {
  test("rejects empty, whitespace-only, and punctuation-only queries", () => {
    assert.equal(prepareSearchQuery("", "en"), undefined);
    assert.equal(prepareSearchQuery("   ", "en"), undefined);
    assert.equal(prepareSearchQuery("???", "en"), undefined);
    assert.equal(prepareSearchQuery("،،", "ar"), undefined);
  });

  test("rejects one-character queries", () => {
    assert.equal(prepareSearchQuery("d", "en"), undefined);
    assert.equal(prepareSearchQuery("د", "ar"), undefined);
    assert.equal(prepareSearchQuery(" a ", "en"), undefined);
  });

  test("accepts queries of two characters or more", () => {
    assert.deepEqual(prepareSearchQuery("zinc", "en"), {
      phrase: "zinc",
      tokens: ["zinc"],
    });
    assert.deepEqual(prepareSearchQuery("Vitamin D", "en"), {
      phrase: "vitamin d",
      tokens: ["vitamin", "d"],
    });
  });

  test("truncates an overlong query to the maximum length", () => {
    const query = prepareSearchQuery("a".repeat(MAX_QUERY_LENGTH + 50), "en");
    assert.notEqual(query, undefined);
    assert.equal(query.phrase.length, MAX_QUERY_LENGTH);
  });
});

describe("matching and ranking", () => {
  const vitaminDIngredient = record({
    type: "ingredient",
    title: "Vitamin D",
    summary: "A fat-soluble nutrient sold as a dietary supplement.",
    href: "/en/ingredients/vitamin-d/",
  });
  const vitaminDArticle = record({
    title: "Vitamin D: an introductory overview",
    summary: "An identity-focused introduction to vitamin D.",
    href: "/en/articles/vitamin-d-an-introductory-overview/",
  });
  const labelArticle = record({
    title: "How to read a dietary supplement label",
    summary: "A guided walk through the parts of a supplement label.",
    href: "/en/articles/how-to-read-a-supplement-label/",
  });
  const nutrientsCategory = record({
    type: "category",
    title: "Nutrients",
    summary: "A grouping for common nutrients in foods and supplements.",
    href: "/en/categories/nutrients/",
  });
  const corpus = [
    vitaminDArticle,
    labelArticle,
    vitaminDIngredient,
    nutrientsCategory,
  ];

  test("ranks an exact name above a title that starts with the query", () => {
    assert.deepEqual(search(corpus, "vitamin d", "en"), [
      "/en/ingredients/vitamin-d/",
      "/en/articles/vitamin-d-an-introductory-overview/",
    ]);
  });

  test("matches a phrase inside a title", () => {
    assert.deepEqual(search(corpus, "supplement label", "en"), [
      "/en/articles/how-to-read-a-supplement-label/",
    ]);
  });

  test("falls back to AND token matching across fields", () => {
    assert.deepEqual(search(corpus, "guided supplement", "en"), [
      "/en/articles/how-to-read-a-supplement-label/",
    ]);
  });

  test("never uses OR semantics for multi-word queries", () => {
    assert.deepEqual(search(corpus, "nutrients chamomile", "en"), []);
  });

  test("matches a single-character token only as a whole token", () => {
    const results = search(corpus, "vitamin d", "en");
    assert.ok(
      !results.includes("/en/articles/how-to-read-a-supplement-label/"),
    );
  });

  test("ranks phrase matches above token-only matches", () => {
    const summaryOnly = record({
      type: "category",
      title: "Supplements",
      summary: "Covers the dietary supplement label conventions.",
      href: "/en/categories/supplements/",
    });
    assert.deepEqual(
      search([summaryOnly, labelArticle], "supplement label", "en"),
      [
        "/en/articles/how-to-read-a-supplement-label/",
        "/en/categories/supplements/",
      ],
    );
  });

  test("matches ingredient aliases and ranks them below the name", () => {
    const alias = record({
      type: "ingredient",
      title: "Cholecalciferol",
      aliases: ["Vitamin D3"],
      summary: "A chemical form of the nutrient.",
      href: "/en/ingredients/cholecalciferol/",
    });
    assert.deepEqual(search([alias], "vitamin d3", "en"), [
      "/en/ingredients/cholecalciferol/",
    ]);
    assert.deepEqual(search([alias, vitaminDIngredient], "vitamin d", "en"), [
      "/en/ingredients/vitamin-d/",
      "/en/ingredients/cholecalciferol/",
    ]);
  });

  test("orders equal ranks by entity type, then title, then href", () => {
    const sameRank = [
      record({
        type: "category",
        title: "Alpha topic",
        href: "/en/categories/alpha-topic/",
      }),
      record({
        type: "ingredient",
        title: "Alpha topic",
        href: "/en/ingredients/alpha-topic/",
      }),
      record({
        type: "article",
        title: "Alpha topic",
        href: "/en/articles/alpha-topic/",
      }),
    ];
    assert.deepEqual(search(sameRank, "alpha topic", "en"), [
      "/en/articles/alpha-topic/",
      "/en/ingredients/alpha-topic/",
      "/en/categories/alpha-topic/",
    ]);

    const sameType = [
      record({ title: "Beta topic", href: "/en/articles/beta-topic/" }),
      record({ title: "Alpha topic", href: "/en/articles/alpha-topic/" }),
    ];
    assert.deepEqual(search(sameType, "topic", "en"), [
      "/en/articles/alpha-topic/",
      "/en/articles/beta-topic/",
    ]);

    const sameTitle = [
      record({ title: "Same title", href: "/en/articles/second/" }),
      record({ title: "Same title", href: "/en/articles/first/" }),
    ];
    assert.deepEqual(search(sameTitle, "same title", "en"), [
      "/en/articles/first/",
      "/en/articles/second/",
    ]);
  });

  test("is deterministic across repeated searches", () => {
    const first = search(corpus, "vitamin", "en");
    const second = search(corpus, "vitamin", "en");
    assert.deepEqual(first, second);
  });

  test("matches Arabic records through normalization", () => {
    const arabicCorpus = [
      record({
        type: "ingredient",
        title: "فيتامين د",
        summary: "عنصر غذائي يذوب في الدهون.",
        href: "/ar/ingredients/vitamin-d/",
      }),
      record({
        title: "كيف تُقيَّم الأدلة حول المكمّلات الغذائية",
        summary: "شرح لقارئ عام.",
        href: "/ar/articles/how-supplement-evidence-is-evaluated/",
      }),
    ];

    assert.deepEqual(search(arabicCorpus, "فيتامين د", "ar"), [
      "/ar/ingredients/vitamin-d/",
    ]);
    assert.deepEqual(search(arabicCorpus, "الأدلة", "ar"), [
      "/ar/articles/how-supplement-evidence-is-evaluated/",
    ]);
    assert.deepEqual(search(arabicCorpus, "الادلة", "ar"), [
      "/ar/articles/how-supplement-evidence-is-evaluated/",
    ]);
    assert.deepEqual(search(arabicCorpus, "المكملات", "ar"), [
      "/ar/articles/how-supplement-evidence-is-evaluated/",
    ]);
  });

  test("returns nothing when no record matches", () => {
    assert.deepEqual(search(corpus, "chamomile", "en"), []);
  });
});

export type Herb = {
  id: string;
  name: string;
  latinName: string;
  category: "Calming" | "Digestive" | "Immune" | "Energy" | "Skin";
  summary: string;
  benefits: string[];
  priceCents: number;
  emoji: string;
};

export const herbs: Herb[] = [
  {
    id: "chamomile",
    name: "Chamomile",
    latinName: "Matricaria chamomilla",
    category: "Calming",
    summary: "A gentle floral infusion traditionally used to unwind before sleep.",
    benefits: ["Promotes restful sleep", "Eases tension", "Soothes digestion"],
    priceCents: 899,
    emoji: "🌼",
  },
  {
    id: "peppermint",
    name: "Peppermint",
    latinName: "Mentha piperita",
    category: "Digestive",
    summary: "Cooling leaves prized for settling the stomach and refreshing the senses.",
    benefits: ["Supports digestion", "Freshens breath", "Relieves bloating"],
    priceCents: 749,
    emoji: "🌿",
  },
  {
    id: "echinacea",
    name: "Echinacea",
    latinName: "Echinacea purpurea",
    category: "Immune",
    summary: "A prairie wildflower root long taken at the first sign of the sniffles.",
    benefits: ["Supports immunity", "Antioxidant rich", "Seasonal wellness"],
    priceCents: 1249,
    emoji: "🌸",
  },
  {
    id: "ginseng",
    name: "Ginseng",
    latinName: "Panax ginseng",
    category: "Energy",
    summary: "An adaptogenic root used for centuries to restore steady vitality.",
    benefits: ["Boosts energy", "Sharpens focus", "Reduces fatigue"],
    priceCents: 1899,
    emoji: "🪴",
  },
  {
    id: "lavender",
    name: "Lavender",
    latinName: "Lavandula angustifolia",
    category: "Calming",
    summary: "Fragrant purple buds that bring a sense of calm to any evening ritual.",
    benefits: ["Calms the mind", "Aromatic", "Supports sleep"],
    priceCents: 999,
    emoji: "💜",
  },
  {
    id: "ginger",
    name: "Ginger",
    latinName: "Zingiber officinale",
    category: "Digestive",
    summary: "A warming, spicy root that has soothed stomachs across the world.",
    benefits: ["Eases nausea", "Warming", "Anti-inflammatory"],
    priceCents: 699,
    emoji: "🫚",
  },
  {
    id: "turmeric",
    name: "Turmeric",
    latinName: "Curcuma longa",
    category: "Immune",
    summary: "The golden spice celebrated for its vivid color and antioxidant power.",
    benefits: ["Anti-inflammatory", "Antioxidant", "Joint support"],
    priceCents: 1099,
    emoji: "🟡",
  },
  {
    id: "calendula",
    name: "Calendula",
    latinName: "Calendula officinalis",
    category: "Skin",
    summary: "Bright marigold petals used in balms to comfort and nourish skin.",
    benefits: ["Soothes skin", "Supports healing", "Gentle care"],
    priceCents: 1149,
    emoji: "🧡",
  },
];

export function searchHerbs(query: string): Herb[] {
  const q = query.trim().toLowerCase();
  if (!q) return herbs;
  return herbs.filter((herb) => {
    const haystack = [
      herb.name,
      herb.latinName,
      herb.category,
      herb.summary,
      ...herb.benefits,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

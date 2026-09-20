"use client";

import { useEffect, useMemo, useState } from "react";
import { type Herb, formatPrice } from "@/lib/herbs";

const categories = ["All", "Calming", "Digestive", "Immune", "Energy", "Skin"] as const;
type Category = (typeof categories)[number];

const categoryStyles: Record<string, string> = {
  Calming: "bg-violet-100 text-violet-700",
  Digestive: "bg-emerald-100 text-emerald-700",
  Immune: "bg-amber-100 text-amber-700",
  Energy: "bg-orange-100 text-orange-700",
  Skin: "bg-rose-100 text-rose-700",
};

export default function HerbBrowser({ initialHerbs }: { initialHerbs: Herb[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [herbs, setHerbs] = useState<Herb[]>(initialHerbs);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/herbs?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results: Herb[] };
        setHerbs(data.results);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const visibleHerbs = useMemo(() => {
    if (category === "All") return herbs;
    return herbs.filter((herb) => herb.category === category);
  }, [herbs, category]);

  return (
    <section className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search herbs, benefits, or Latin names…"
            aria-label="Search herbs"
            className="w-full rounded-full border border-emerald-200 bg-white py-3 pl-11 pr-4 text-emerald-950 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-800">
          <span className="rounded-full bg-emerald-600 px-3 py-1 font-medium text-white">
            🧺 {cart.length} in basket
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat
                ? "bg-emerald-700 text-white shadow"
                : "bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-emerald-700" aria-live="polite">
        {loading
          ? "Searching the apothecary…"
          : `${visibleHerbs.length} ${visibleHerbs.length === 1 ? "remedy" : "remedies"} found`}
      </p>

      {visibleHerbs.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-emerald-300 bg-white/60 p-12 text-center text-emerald-700">
          <p className="text-4xl">🌱</p>
          <p className="mt-3 font-medium">No remedies match your search.</p>
          <p className="text-sm text-emerald-600">Try a different herb or benefit.</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleHerbs.map((herb) => {
            const inCart = cart.includes(herb.id);
            return (
              <li
                key={herb.id}
                className="group flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden>
                    {herb.emoji}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      categoryStyles[herb.category] ?? "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {herb.category}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-emerald-950">{herb.name}</h3>
                <p className="text-sm italic text-emerald-600">{herb.latinName}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-emerald-800/90">
                  {herb.summary}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {herb.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-900">
                    {formatPrice(herb.priceCents)}
                  </span>
                  <button
                    onClick={() =>
                      setCart((prev) =>
                        inCart ? prev.filter((id) => id !== herb.id) : [...prev, herb.id],
                      )
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      inCart
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                        : "bg-emerald-700 text-white hover:bg-emerald-800"
                    }`}
                  >
                    {inCart ? "✓ Added" : "Add to basket"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

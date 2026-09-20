import HerbBrowser from "./HerbBrowser";
import { herbs } from "@/lib/herbs";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              🌿
            </span>
            <span className="text-xl font-bold tracking-tight text-emerald-900">
              herbal<span className="text-emerald-500">·ma</span>
            </span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-emerald-800 sm:flex">
            <a className="transition hover:text-emerald-600" href="#browse">
              Browse
            </a>
            <a className="transition hover:text-emerald-600" href="#about">
              About
            </a>
            <a
              className="transition hover:text-emerald-600"
              href="/api/herbs"
              target="_blank"
              rel="noreferrer"
            >
              API
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <section className="py-14 text-center sm:py-20" id="about">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            🍃 Small-batch, ethically sourced
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-emerald-950 sm:text-5xl">
            The herbal marketplace for calm, balanced living
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-emerald-800/90">
            Discover time-honored botanicals for sleep, digestion, immunity, and
            everyday vitality — curated by herbalists, delivered to your door.
          </p>
        </section>

        <div id="browse">
          <HerbBrowser initialHerbs={herbs} />
        </div>
      </main>

      <footer className="border-t border-emerald-100 bg-white/70">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-emerald-700">
          🌱 herbal·ma — grown with care. Not intended to diagnose or treat any
          condition.
        </div>
      </footer>
    </div>
  );
}

# herbal-ma

An herbal marketplace demo built with **Next.js 16** (App Router), **React 19**,
**TypeScript**, and **Tailwind CSS v4**. Browse and search a catalog of
botanicals, filter by category, and add remedies to a basket.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Route Handlers)
- React 19
- TypeScript
- Tailwind CSS v4
- pnpm (see `packageManager` in `package.json`)

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `pnpm dev`    | Start the development server         |
| `pnpm build`  | Create a production build            |
| `pnpm start`  | Serve the production build           |
| `pnpm lint`   | Run ESLint                           |

## Project structure

```
src/
  app/
    api/herbs/route.ts   # JSON search API (GET /api/herbs?q=...)
    HerbBrowser.tsx      # Client component: live search, filters, basket
    page.tsx             # Home page
    layout.tsx           # Root layout + metadata
  lib/
    herbs.ts             # Herb catalog data, search, price helpers
```

## API

`GET /api/herbs?q=<query>` returns matching herbs as JSON:

```json
{ "query": "sleep", "count": 2, "results": [ ... ] }
```

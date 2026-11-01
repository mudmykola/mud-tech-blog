# mini-blog

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Open the blog at `http://localhost:5174`. This dedicated port keeps it separate from other local Vite projects; startup fails with a port-in-use error if `5174` is occupied.

### Compile and Minify for Production

```sh
npm run build
```

## SEO Environment

Canonical and social metadata use these variables:

- `VITE_CANONICAL_ORIGIN` - canonical domain origin, example: `https://mud-tech-blog.web.app`
- `VITE_ENFORCE_CANONICAL_REDIRECT` - set to `true` to force redirect from non-canonical hosts
- `VITE_TWITTER_SITE` - optional Twitter handle for `twitter:site` tag, example: `@mudtechblog`

## Prerender

Build now includes static prerender for key routes:

- `/`
- `/blog`
- `/about`
- `/updates`

Command:

```sh
npm run build
```

Current limitation:

- Dynamic article routes (`/blog/:slug`) are still client-rendered and require a separate dynamic prerender pipeline.

## Dynamic Sitemap

`npm run build` now also regenerates `dist/sitemap.xml` from live article routes.

Source:

- Shopify Storefront API (`blogByHandle: news`)
- Route handles are converted to `/blog/:slug` URLs
- `lastmod` uses article `updatedAt` (fallback to `publishedAt`)

Notes:

- Static routes `/`, `/blog`, `/about`, `/updates` are always included.
- `robots.txt` is generated at build time from canonical origin (no manual host hardcode).
- Build includes `verify-seo-host-config` check to validate robots/sitemap host consistency.

## SEO Quality Gates

- `npm run seo:smoke` validates built HTML for key routes (`/`, `/blog`, `/about`, `/updates`):
  - title
  - meta description
  - canonical
  - robots
  - JSON-LD presence/validity
- CI workflow `.github/workflows/seo-quality.yml` runs:
  - unit tests
  - build
  - SEO smoke checks
  - Lighthouse CI with SEO thresholds (`.lighthouserc.json`)

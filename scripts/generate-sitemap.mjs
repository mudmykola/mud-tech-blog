import fs from 'node:fs/promises'
import path from 'node:path'
import { buildSitemapEntries, renderSitemapXml } from '../src/utils/sitemap.js'

const DIST_SITEMAP_PATH = path.resolve('dist', 'sitemap.xml')
const DEFAULT_ORIGIN = 'https://mud-tech-blog.web.app'
const SHOPIFY_BLOG_HANDLE = 'news'

const parseEnvFile = async filePath => {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split(/\r?\n/)
    const env = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

const normalizeOrigin = raw => {
  const value = String(raw || '').trim()
  if (!value) return DEFAULT_ORIGIN
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    return new URL(withProtocol).origin
  } catch {
    return DEFAULT_ORIGIN
  }
}

const resolveConfig = async () => {
  const fileEnv = await parseEnvFile(path.resolve('.env'))
  const apiUrl = process.env.VITE_SHOPIFY_API_URL || fileEnv.VITE_SHOPIFY_API_URL || ''
  const token = process.env.VITE_SHOPIFY_ACCESS_TOKEN || fileEnv.VITE_SHOPIFY_ACCESS_TOKEN || ''
  const origin = normalizeOrigin(process.env.VITE_CANONICAL_ORIGIN || fileEnv.VITE_CANONICAL_ORIGIN)
  return { apiUrl, token, origin }
}

const fetchShopifyArticles = async ({ apiUrl, token }) => {
  if (!apiUrl || !token) {
    console.warn('[sitemap] Shopify credentials are missing. Generating sitemap with static routes only.')
    return []
  }

  const articles = []
  let cursor = null
  let hasNextPage = true

  while (hasNextPage) {
    const afterArg = cursor ? `, after: "${cursor}"` : ''
    const query = `
      {
        blogByHandle(handle: "${SHOPIFY_BLOG_HANDLE}") {
          articles(first: 250${afterArg}) {
            edges {
              cursor
              node {
                handle
                publishedAt
                updatedAt
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API request failed with ${response.status}`)
    }

    const payload = await response.json()
    const data = payload?.data?.blogByHandle?.articles
    if (!data) break

    data.edges.forEach(edge => {
      if (edge?.node?.handle) articles.push(edge.node)
    })
    hasNextPage = Boolean(data.pageInfo?.hasNextPage)
    cursor = data.pageInfo?.endCursor || null
  }

  return articles
}

const buildStaticRoutes = now => [
  { path: '/', lastmod: now, changefreq: 'daily', priority: 1.0 },
  { path: '/blog', lastmod: now, changefreq: 'daily', priority: 0.9 },
  { path: '/about', lastmod: now, changefreq: 'monthly', priority: 0.7 },
  { path: '/updates', lastmod: now, changefreq: 'daily', priority: 0.8 },
]

const main = async () => {
  const { apiUrl, token, origin } = await resolveConfig()
  const now = new Date().toISOString()
  const staticRoutes = buildStaticRoutes(now)

  let articles = []
  try {
    articles = await fetchShopifyArticles({ apiUrl, token })
  } catch (error) {
    console.warn(`[sitemap] Failed to fetch live article routes: ${error.message}`)
    console.warn('[sitemap] Continuing with static routes only.')
  }

  const entries = buildSitemapEntries({ origin, staticRoutes, articles })
  const xml = renderSitemapXml(entries)
  await fs.writeFile(DIST_SITEMAP_PATH, xml, 'utf8')

  console.log(`[sitemap] Generated ${entries.length} URLs (${articles.length} blog articles).`)
  console.log(`[sitemap] Output: ${DIST_SITEMAP_PATH}`)
}

main().catch(error => {
  console.error('[sitemap] Failed:', error)
  process.exitCode = 1
})

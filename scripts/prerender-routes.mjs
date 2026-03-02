import fs from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const PRERENDER_MANIFEST_PATH = path.join(DIST_DIR, 'prerender-manifest.json')
const DEFAULT_ORIGIN = 'https://mud-tech-blog.web.app'
const SHOPIFY_BLOG_HANDLE = 'news'

const ROUTES = [
  {
    path: '/',
    title: 'Технологічний блог про Frontend, AI та eCommerce | Mud Tech Blog',
    description:
      'Практичний техноблог українською про frontend-розробку, Vue, eCommerce, AI та продуктивність. Публікуємо покрокові гайди, огляди інструментів і робочі рішення для реальних проєктів.',
    heading: 'Mud Tech Blog',
    lead: 'Практичні матеріали про frontend, AI, eCommerce та продуктивну веб-розробку.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: "Mud' Tech Blog",
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Головна сторінка Mud Tech Blog',
        inLanguage: 'uk-UA',
      },
    ],
  },
  {
    path: '/blog',
    title: 'Блог статей про Frontend, Vue та eCommerce | Mud Tech Blog',
    description:
      "У розділі блогу зібрані практичні статті про frontend, Vue, Shopify, eCommerce архітектуру та оптимізацію продуктивності. Читай покрокові матеріали з реальними прикладами впровадження.",
    heading: 'Блог статей',
    lead: 'Огляди інструментів, архітектурні підходи та технічні розбори для сучасної веб-розробки.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: "Mud' Tech Blog",
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Каталог статей Mud Tech Blog',
        inLanguage: 'uk-UA',
      },
    ],
  },
  {
    path: '/about',
    title: 'Про автора та досвід у Frontend eCommerce | Mud Tech Blog',
    description:
      "Дізнайся більше про Миколу — frontend eCommerce розробника з практичним досвідом у Vue, Shopify та оптимізації UX. На сторінці зібрано стек технологій, проєкти та канали зв'язку.",
    heading: 'Про автора',
    lead: 'Профіль, стек і досвід роботи з frontend eCommerce рішеннями.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'Про автора та досвід у Frontend eCommerce | Mud Tech Blog',
        inLanguage: 'uk-UA',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Mykola Mud`',
        jobTitle: 'Frontend eCommerce Developer',
      },
    ],
  },
  {
    path: '/updates',
    title: 'Оновлення Mud Tech Blog: релізи, фікси й покращення',
    description:
      'Сторінка оновлень Mud Tech Blog містить історію релізів, виправлень і нових функцій. Відстежуй прогрес проєкту, зміни в UX, SEO-поліпшення та технічні доробки.',
    heading: 'Оновлення проєкту',
    lead: 'Хронологія релізів, фіксів і технічних покращень блогу.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Оновлення Mud Tech Blog',
        inLanguage: 'uk-UA',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Останні оновлення Mud Tech Blog',
      },
    ],
  },
]

const escapeHtml = value =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const stripHtml = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const trimSeoText = (value, maxLength) => {
  const plain = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return ''
  if (plain.length <= maxLength) return plain

  const draft = plain.slice(0, maxLength + 1)
  const boundary = draft.lastIndexOf(' ')
  const clipped = boundary > Math.floor(maxLength * 0.62) ? draft.slice(0, boundary) : plain.slice(0, maxLength)
  return `${clipped.trim()}…`
}

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
    console.warn('[prerender] Shopify credentials are missing. Dynamic blog post prerender will be skipped.')
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
                id
                title
                handle
                excerpt
                contentHtml
                publishedAt
                updatedAt
                tags
                image {
                  url
                  altText
                }
                authorV2 {
                  name
                }
                seo {
                  title
                  description
                }
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

  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

const buildCanonical = (origin, routePath) => {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`
  return `${origin}${normalized}`
}

const toAbsoluteUrl = (origin, value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return buildCanonical(origin, raw.startsWith('/') ? raw : `/${raw}`)
}

const upsertMetaByName = (html, name, content) => {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`
  const pattern = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i')
  if (pattern.test(html)) return html.replace(pattern, tag)
  return html.replace('</head>', `  ${tag}\n  </head>`)
}

const upsertMetaByProperty = (html, property, content) => {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`
  const pattern = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i')
  if (pattern.test(html)) return html.replace(pattern, tag)
  return html.replace('</head>', `  ${tag}\n  </head>`)
}

const upsertCanonical = (html, canonicalUrl) => {
  const tag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  const pattern = /<link\s+rel=["']canonical["'][^>]*>/i
  if (pattern.test(html)) return html.replace(pattern, tag)
  return html.replace('</head>', `  ${tag}\n  </head>`)
}

const renderShell = route => `
<div id="app">
  <main data-prerendered="true" class="mm-prerender-shell">
    <h1>${escapeHtml(route.heading)}</h1>
    <p>${escapeHtml(route.lead)}</p>
  </main>
</div>
`.trim()

const buildArticleSchemas = (origin, article, canonicalUrl, imageUrl, description) => {
  const keywords = Array.isArray(article.tags) ? article.tags.filter(Boolean).join(', ') : ''
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Mud' Tech Blog",
      url: buildCanonical(origin, '/'),
      logo: buildCanonical(origin, '/favicon.ico'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description,
      image: imageUrl ? [imageUrl] : [],
      author: {
        '@type': 'Person',
        name: article.authorV2?.name || "Mud' Tech Blog",
      },
      publisher: {
        '@type': 'Organization',
        name: "Mud' Tech Blog",
        logo: {
          '@type': 'ImageObject',
          url: buildCanonical(origin, '/favicon.ico'),
        },
      },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      url: canonicalUrl,
      inLanguage: 'uk-UA',
      keywords,
      articleSection: Array.isArray(article.tags) && article.tags.length ? article.tags[0] : 'Technology',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Головна',
          item: buildCanonical(origin, '/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Блог',
          item: buildCanonical(origin, '/blog'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: canonicalUrl,
        },
      ],
    },
  ]
}

const buildArticleRoute = (origin, article) => {
  const pathValue = `/blog/${article.handle}`
  const canonicalUrl = buildCanonical(origin, pathValue)
  const titleBase = trimSeoText(article.seo?.title || article.title || 'Стаття', 52)
  const pageTitle = `${titleBase} | Mud' Tech Blog`
  const summaryRaw = article.seo?.description || article.excerpt || stripHtml(article.contentHtml)
  const description =
    trimSeoText(summaryRaw, 220) || 'Практична стаття Mud Tech Blog про веб-розробку.'
  const imageUrl = toAbsoluteUrl(origin, article.image?.url || '/pwa-512x512.png')
  const publishedIso = article.publishedAt ? new Date(article.publishedAt).toISOString() : ''
  const schemas = buildArticleSchemas(origin, article, canonicalUrl, imageUrl, description)

  return {
    path: pathValue,
    title: pageTitle,
    description,
    heading: article.title || 'Стаття',
    lead: description,
    ogType: 'article',
    ogImage: imageUrl,
    twitterCard: 'summary_large_image',
    jsonLd: schemas,
    extraMeta: [
      ...(publishedIso ? [{ type: 'property', key: 'article:published_time', content: publishedIso }] : []),
    ],
  }
}

const renderRouteHtml = (baseHtml, route, canonicalOrigin) => {
  const canonicalUrl = buildCanonical(canonicalOrigin, route.path)
  const robotsPolicy = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  const ogType = route.ogType || 'website'
  const ogImage = route.ogImage || buildCanonical(canonicalOrigin, '/pwa-512x512.png')
  const twitterCard = route.twitterCard || 'summary_large_image'
  let html = baseHtml

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
  html = upsertMetaByName(html, 'description', route.description)
  html = upsertMetaByName(html, 'robots', robotsPolicy)
  html = upsertMetaByName(html, 'googlebot', robotsPolicy)
  html = upsertMetaByProperty(html, 'og:title', route.title)
  html = upsertMetaByProperty(html, 'og:description', route.description)
  html = upsertMetaByProperty(html, 'og:type', ogType)
  html = upsertMetaByProperty(html, 'og:url', canonicalUrl)
  html = upsertMetaByProperty(html, 'og:image', ogImage)
  html = upsertMetaByProperty(html, 'og:site_name', 'Mud Tech Blog')
  html = upsertMetaByProperty(html, 'og:locale', 'uk_UA')
  html = upsertMetaByName(html, 'twitter:card', twitterCard)
  html = upsertMetaByName(html, 'twitter:title', route.title)
  html = upsertMetaByName(html, 'twitter:description', route.description)
  html = upsertMetaByName(html, 'twitter:image', ogImage)
  html = upsertCanonical(html, canonicalUrl)

  for (const meta of route.extraMeta || []) {
    if (meta.type === 'property') {
      html = upsertMetaByProperty(html, meta.key, meta.content)
    } else {
      html = upsertMetaByName(html, meta.key, meta.content)
    }
  }

  const jsonLdScripts = (route.jsonLd || [])
    .map(schema => {
      const withUrl = {
        ...schema,
        url: schema.url || canonicalUrl,
      }
      return `  <script type="application/ld+json">${JSON.stringify(withUrl)}</script>`
    })
    .join('\n')

  html = html.replace('</head>', `${jsonLdScripts}\n  </head>`)
  html = html.replace(/<div id="app"><\/div>/i, renderShell(route))
  return html
}

const writeRouteHtml = async (routePath, html) => {
  if (routePath === '/') {
    await fs.writeFile(INDEX_PATH, html, 'utf8')
    return
  }

  const targetDir = path.join(DIST_DIR, routePath.replace(/^\//, ''))
  await fs.mkdir(targetDir, { recursive: true })
  await fs.writeFile(path.join(targetDir, 'index.html'), html, 'utf8')
}

const main = async () => {
  const { apiUrl, token, origin } = await resolveConfig()
  const baseHtml = await fs.readFile(INDEX_PATH, 'utf8')

  await Promise.all(
    ROUTES.map(async route => {
      const html = renderRouteHtml(baseHtml, route, origin)
      await writeRouteHtml(route.path, html)
    })
  )

  let articles = []
  try {
    articles = await fetchShopifyArticles({ apiUrl, token })
  } catch (error) {
    console.warn(`[prerender] Failed to fetch dynamic blog routes: ${error.message}`)
    console.warn('[prerender] Continuing with static routes only.')
  }

  const articleRoutes = articles.map(article => buildArticleRoute(origin, article))
  await Promise.all(
    articleRoutes.map(async route => {
      const html = renderRouteHtml(baseHtml, route, origin)
      await writeRouteHtml(route.path, html)
    })
  )

  const manifest = {
    generatedAt: new Date().toISOString(),
    staticRoutes: ROUTES.map(route => route.path),
    blogPostRoutes: articleRoutes.map(route => route.path),
    blogPostCount: articleRoutes.length,
  }
  await fs.writeFile(PRERENDER_MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')

  console.log(`[prerender] Generated static HTML for ${ROUTES.map(route => route.path).join(', ')}`)
  console.log(`[prerender] Generated dynamic blog post routes: ${articleRoutes.length}`)
  console.log(`[prerender] Manifest: ${PRERENDER_MANIFEST_PATH}`)
}

main().catch(error => {
  console.error('[prerender] Failed:', error)
  process.exitCode = 1
})

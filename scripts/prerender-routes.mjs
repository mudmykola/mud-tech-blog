import fs from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const DEFAULT_ORIGIN = 'https://mud-tech-blog.web.app'

const ROUTES = [
  {
    path: '/',
    title: 'Технологічний блог про Frontend, AI та eCommerce | Mud Tech Blog',
    description:
      'Практичний техноблог українською про frontend-розробку, Vue, eCommerce, AI та продуктивність. Публікуємо покрокові гайди, огляди інструментів і робочі рішення для реальних проєктів.',
    heading: 'Mud Tech Blog',
    lead: 'Практичні матеріали про frontend, AI, eCommerce та продуктивну веб-розробку.',
  },
  {
    path: '/blog',
    title: 'Блог статей про Frontend, Vue та eCommerce | Mud Tech Blog',
    description:
      "У розділі блогу зібрані практичні статті про frontend, Vue, Shopify, eCommerce архітектуру та оптимізацію продуктивності. Читай покрокові матеріали з реальними прикладами впровадження.",
    heading: 'Блог статей',
    lead: 'Огляди інструментів, архітектурні підходи та технічні розбори для сучасної веб-розробки.',
  },
  {
    path: '/about',
    title: 'Про автора та досвід у Frontend eCommerce | Mud Tech Blog',
    description:
      "Дізнайся більше про Миколу — frontend eCommerce розробника з практичним досвідом у Vue, Shopify та оптимізації UX. На сторінці зібрано стек технологій, проєкти та канали зв'язку.",
    heading: 'Про автора',
    lead: 'Профіль, стек і досвід роботи з frontend eCommerce рішеннями.',
  },
  {
    path: '/updates',
    title: 'Оновлення Mud Tech Blog: релізи, фікси й покращення',
    description:
      'Сторінка оновлень Mud Tech Blog містить історію релізів, виправлень і нових функцій. Відстежуй прогрес проєкту, зміни в UX, SEO-поліпшення та технічні доробки.',
    heading: 'Оновлення проєкту',
    lead: 'Хронологія релізів, фіксів і технічних покращень блогу.',
  },
]

const escapeHtml = value =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

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

const canonicalOrigin = normalizeOrigin(process.env.VITE_CANONICAL_ORIGIN)

const buildCanonical = routePath => {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`
  return `${canonicalOrigin}${normalized}`
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

const renderRouteHtml = (baseHtml, route) => {
  const canonicalUrl = buildCanonical(route.path)
  let html = baseHtml

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
  html = upsertMetaByName(html, 'description', route.description)
  html = upsertMetaByName(html, 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
  html = upsertMetaByProperty(html, 'og:title', route.title)
  html = upsertMetaByProperty(html, 'og:description', route.description)
  html = upsertMetaByProperty(html, 'og:type', 'website')
  html = upsertMetaByProperty(html, 'og:url', canonicalUrl)
  html = upsertMetaByProperty(html, 'og:image', buildCanonical('/pwa-512x512.png'))
  html = upsertMetaByName(html, 'twitter:card', 'summary_large_image')
  html = upsertMetaByName(html, 'twitter:title', route.title)
  html = upsertMetaByName(html, 'twitter:description', route.description)
  html = upsertMetaByName(html, 'twitter:image', buildCanonical('/pwa-512x512.png'))
  html = upsertCanonical(html, canonicalUrl)

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
  const baseHtml = await fs.readFile(INDEX_PATH, 'utf8')
  await Promise.all(
    ROUTES.map(async route => {
      const html = renderRouteHtml(baseHtml, route)
      await writeRouteHtml(route.path, html)
    })
  )

  console.log(`[prerender] Generated static HTML for ${ROUTES.map(route => route.path).join(', ')}`)
  console.log(
    '[prerender] Dynamic routes /blog/:slug remain client-rendered until dynamic route prerender (planned separately).'
  )
}

main().catch(error => {
  console.error('[prerender] Failed:', error)
  process.exitCode = 1
})

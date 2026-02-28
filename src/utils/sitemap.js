const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'
const URLSET_OPEN = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
const URLSET_CLOSE = '</urlset>'

const escapeXml = value =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const toIsoDate = value => {
  if (!value) return new Date().toISOString()
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString()
  return parsed.toISOString()
}

const renderUrlNode = entry => {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    `    <lastmod>${escapeXml(toIsoDate(entry.lastmod))}</lastmod>`,
  ]

  if (entry.changefreq) {
    lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`)
  }
  if (entry.priority !== undefined && entry.priority !== null) {
    lines.push(`    <priority>${escapeXml(String(entry.priority))}</priority>`)
  }

  lines.push('  </url>')
  return lines.join('\n')
}

export const buildSitemapEntries = ({ origin, staticRoutes = [], articles = [] }) => {
  const normalizedOrigin = String(origin || '').replace(/\/$/, '')
  const entries = []

  staticRoutes.forEach(route => {
    const path = String(route.path || '/')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    entries.push({
      loc: `${normalizedOrigin}${normalizedPath}`,
      lastmod: route.lastmod,
      changefreq: route.changefreq,
      priority: route.priority,
    })
  })

  articles.forEach(article => {
    const handle = String(article.handle || '').trim()
    if (!handle) return
    entries.push({
      loc: `${normalizedOrigin}/blog/${handle}`,
      lastmod: article.updatedAt || article.publishedAt,
      changefreq: 'weekly',
      priority: 0.8,
    })
  })

  return entries
}

export const renderSitemapXml = entries => {
  const body = entries.map(renderUrlNode).join('\n')
  return `${XML_HEADER}\n${URLSET_OPEN}\n${body}\n${URLSET_CLOSE}\n`
}

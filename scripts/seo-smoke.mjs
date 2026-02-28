import fs from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const DEFAULT_ORIGIN = 'https://mud-tech-blog.web.app'

const ROUTES = [
  { path: '/', file: path.join(DIST_DIR, 'index.html') },
  { path: '/blog', file: path.join(DIST_DIR, 'blog', 'index.html') },
  { path: '/about', file: path.join(DIST_DIR, 'about', 'index.html') },
  { path: '/updates', file: path.join(DIST_DIR, 'updates', 'index.html') },
]

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
      env[key] = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
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

const getCanonicalOrigin = async () => {
  const fileEnv = await parseEnvFile(path.resolve('.env'))
  return normalizeOrigin(process.env.VITE_CANONICAL_ORIGIN || fileEnv.VITE_CANONICAL_ORIGIN)
}

const assertMatch = (html, regex, errorMessage) => {
  const match = html.match(regex)
  if (!match) {
    throw new Error(errorMessage)
  }
  return match
}

const validateJsonLd = (html, routePath) => {
  const scriptMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  if (!scriptMatches.length) {
    throw new Error(`${routePath}: missing JSON-LD script`)
  }

  scriptMatches.forEach((match, index) => {
    const raw = String(match[1] || '').trim()
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error(`${routePath}: invalid JSON-LD payload at index ${index}`)
    }
    if (parsed['@context'] !== 'https://schema.org') {
      throw new Error(`${routePath}: JSON-LD must use @context https://schema.org`)
    }
    if (!parsed['@type']) {
      throw new Error(`${routePath}: JSON-LD missing @type`)
    }
  })
}

const validateRoute = ({ path: routePath, file }, canonicalOrigin) =>
  fs.readFile(file, 'utf8').then(html => {
    assertMatch(html, /<title>[^<]{10,}<\/title>/i, `${routePath}: missing or too short <title>`)
    assertMatch(
      html,
      /<meta name="description" content="[^"]{80,}" \/>/i,
      `${routePath}: missing or too short meta description`
    )
    assertMatch(
      html,
      /<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" \/>/i,
      `${routePath}: missing robots meta policy`
    )

    const canonicalMatch = assertMatch(
      html,
      /<link rel="canonical" href="([^"]+)" \/>/i,
      `${routePath}: missing canonical link`
    )
    const canonicalHref = canonicalMatch[1]
    const expected = `${canonicalOrigin}${routePath === '/' ? '/' : routePath}`
    if (canonicalHref !== expected) {
      throw new Error(`${routePath}: canonical mismatch (${canonicalHref} !== ${expected})`)
    }

    validateJsonLd(html, routePath)
  })

const main = async () => {
  const canonicalOrigin = await getCanonicalOrigin()
  await Promise.all(ROUTES.map(route => validateRoute(route, canonicalOrigin)))
  console.log(`[seo-smoke] SEO smoke checks passed for ${ROUTES.length} routes.`)
}

main().catch(error => {
  console.error('[seo-smoke] Failed:', error.message)
  process.exitCode = 1
})

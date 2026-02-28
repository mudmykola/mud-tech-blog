import fs from 'node:fs/promises'
import path from 'node:path'

const DIST_DIR = path.resolve('dist')
const ROBOTS_PATH = path.join(DIST_DIR, 'robots.txt')
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml')
const DEFAULT_ORIGIN = 'https://mud-tech-blog.web.app'

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

const getCanonicalOrigin = async () => {
  const fileEnv = await parseEnvFile(path.resolve('.env'))
  return normalizeOrigin(process.env.VITE_CANONICAL_ORIGIN || fileEnv.VITE_CANONICAL_ORIGIN)
}

const extractLocValues = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => String(match[1] || '').trim())

const main = async () => {
  const canonicalOrigin = await getCanonicalOrigin()
  const expectedSitemapUrl = `${canonicalOrigin}/sitemap.xml`

  const [robotsTxt, sitemapXml] = await Promise.all([
    fs.readFile(ROBOTS_PATH, 'utf8'),
    fs.readFile(SITEMAP_PATH, 'utf8'),
  ])

  if (!robotsTxt.includes(`Sitemap: ${expectedSitemapUrl}`)) {
    throw new Error(`robots.txt sitemap mismatch. Expected: ${expectedSitemapUrl}`)
  }

  const locs = extractLocValues(sitemapXml)
  if (!locs.length) {
    throw new Error('sitemap.xml has no <loc> entries')
  }

  const invalidLoc = locs.find(loc => !loc.startsWith(canonicalOrigin))
  if (invalidLoc) {
    throw new Error(`sitemap.xml contains non-canonical host URL: ${invalidLoc}`)
  }

  console.log(`[seo-check] robots/sitemap host config is valid for ${canonicalOrigin}`)
}

main().catch(error => {
  console.error('[seo-check] Failed:', error.message)
  process.exitCode = 1
})

import fs from 'node:fs/promises'
import path from 'node:path'

const DIST_ROBOTS_PATH = path.resolve('dist', 'robots.txt')
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

const resolveCanonicalOrigin = async () => {
  const fileEnv = await parseEnvFile(path.resolve('.env'))
  return normalizeOrigin(process.env.VITE_CANONICAL_ORIGIN || fileEnv.VITE_CANONICAL_ORIGIN)
}

const main = async () => {
  const origin = await resolveCanonicalOrigin()
  const content = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`

  await fs.writeFile(DIST_ROBOTS_PATH, content, 'utf8')
  console.log(`[robots] Generated robots.txt for ${origin}`)
  console.log(`[robots] Output: ${DIST_ROBOTS_PATH}`)
}

main().catch(error => {
  console.error('[robots] Failed:', error)
  process.exitCode = 1
})

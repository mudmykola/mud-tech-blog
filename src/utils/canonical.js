const DEFAULT_CANONICAL_ORIGIN = 'https://mud-tech-blog.web.app'

const getEnvValue = key => {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
  return env[key]
}

const normalizeOrigin = raw => {
  const value = String(raw || '').trim()
  if (!value) return ''

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const parsed = new URL(withProtocol)
    return parsed.origin
  } catch {
    return ''
  }
}

export const getCanonicalOrigin = () => {
  const fromEnv = normalizeOrigin(getEnvValue('VITE_CANONICAL_ORIGIN'))
  if (fromEnv) return fromEnv

  const fromWindow =
    typeof window !== 'undefined' && window.location ? normalizeOrigin(window.location.origin) : ''
  return fromWindow || DEFAULT_CANONICAL_ORIGIN
}

export const buildCanonicalUrl = path => {
  const origin = getCanonicalOrigin()
  const normalizedPath = String(path || '/').startsWith('/') ? String(path || '/') : `/${String(path || '')}`
  return `${origin}${normalizedPath}`
}

export const enforceCanonicalRedirect = () => {
  if (typeof window === 'undefined') return false
  if (getEnvValue('VITE_ENFORCE_CANONICAL_REDIRECT') !== 'true') return false

  const canonicalOrigin = getCanonicalOrigin()
  if (!canonicalOrigin) return false

  let canonical
  try {
    canonical = new URL(canonicalOrigin)
  } catch {
    return false
  }

  if (window.location.origin === canonical.origin) return false

  const target = `${canonical.origin}${window.location.pathname}${window.location.search}${window.location.hash}`
  window.location.replace(target)
  return true
}

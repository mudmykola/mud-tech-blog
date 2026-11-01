const LAST_READ_KEY = 'mud-tech-blog:last-read-article'
export const SAVED_ARTICLES_KEY = 'mud-tech-blog:saved-articles'

export const normalizeSavedArticleHandles = handles =>
  Array.isArray(handles)
    ? [
        ...new Set(
          handles
            .filter(handle => typeof handle === 'string' && handle.trim())
            .map(handle => handle.trim())
        ),
      ]
    : []

export const toggleSavedArticleHandle = (handles, handle) => {
  const normalized = normalizeSavedArticleHandles(handles)
  const cleanHandle = typeof handle === 'string' ? handle.trim() : ''
  if (!cleanHandle) return normalized

  return normalized.includes(cleanHandle)
    ? normalized.filter(savedHandle => savedHandle !== cleanHandle)
    : [...normalized, cleanHandle]
}

const getStorage = () => {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

const readJson = (key, fallback) => {
  try {
    const storage = getStorage()
    return storage ? (JSON.parse(storage.getItem(key) || 'null') ?? fallback) : fallback
  } catch {
    return fallback
  }
}

export const getLastReadArticle = () => {
  const handle = readJson(LAST_READ_KEY, '')
  return typeof handle === 'string' ? handle : ''
}

export const saveLastReadArticle = handle => {
  if (typeof handle !== 'string' || !handle.trim()) return false

  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(LAST_READ_KEY, JSON.stringify(handle.trim()))
    return true
  } catch {
    return false
  }
}

export const getSavedArticleHandles = () => {
  const handles = readJson(SAVED_ARTICLES_KEY, [])
  return normalizeSavedArticleHandles(handles)
}

export const saveArticleHandles = handles => {
  if (!Array.isArray(handles)) return false

  try {
    const storage = getStorage()
    if (!storage) return false
    const normalized = normalizeSavedArticleHandles(handles)
    storage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(normalized))
    return true
  } catch {
    return false
  }
}

export const estimateReadingMinutes = (html, wordsPerMinute = 200) => {
  const plainText = String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#39;|&apos;/gi, ' ')
    .trim()
  const wordCount = plainText.match(/[\p{L}\p{N}]+/gu)?.length || 0

  if (!wordCount || !Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) return null
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

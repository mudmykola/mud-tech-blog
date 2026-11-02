export const BLOG_READING_HISTORY_KEY = 'mud-tech-blog:reading-history:v1'
const MAX_HISTORY_ITEMS = 300

const getStorage = () => {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

const normalizeHistory = value => {
  if (!value || value.version !== 1 || !Array.isArray(value.items)) return []

  const unique = new Map()
  value.items.forEach(item => {
    if (typeof item?.handle !== 'string' || !item.handle.trim()) return
    const handle = item.handle.trim()
    const readAt = Number.isFinite(Date.parse(item.readAt)) ? item.readAt : ''
    unique.set(handle, { handle, readAt })
  })

  return [...unique.values()].slice(0, MAX_HISTORY_ITEMS)
}

const readHistory = () => {
  try {
    const raw = getStorage()?.getItem(BLOG_READING_HISTORY_KEY)
    return raw ? normalizeHistory(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export const getReadArticleHandles = () => readHistory().map(item => item.handle)

export const markArticleAsRead = (handle, readAt = new Date().toISOString()) => {
  const cleanHandle = typeof handle === 'string' ? handle.trim() : ''
  const storage = getStorage()
  if (!cleanHandle || !storage) return false

  try {
    const items = readHistory().filter(item => item.handle !== cleanHandle)
    items.unshift({ handle: cleanHandle, readAt })
    storage.setItem(
      BLOG_READING_HISTORY_KEY,
      JSON.stringify({ version: 1, items: items.slice(0, MAX_HISTORY_ITEMS) })
    )
    return true
  } catch {
    return false
  }
}

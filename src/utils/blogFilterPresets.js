export const BLOG_FILTER_PRESETS_KEY = 'mud-tech-blog:blog-filter-presets:v1'

const getStorage = () => {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

const readPresets = () => {
  try {
    const raw = getStorage()?.getItem(BLOG_FILTER_PRESETS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(item => item && typeof item.id === 'string' && typeof item.name === 'string')
      .map(item => ({ id: item.id, name: item.name.trim().slice(0, 40), state: item.state || {} }))
      .filter(item => item.name)
      .slice(0, 12)
  } catch {
    return []
  }
}

const persistPresets = presets => {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(BLOG_FILTER_PRESETS_KEY, JSON.stringify(presets.slice(0, 12)))
    return true
  } catch {
    return false
  }
}

export const getBlogFilterPresets = () => readPresets()

export const saveBlogFilterPreset = (name, state, now = Date.now()) => {
  const cleanName = String(name || '')
    .trim()
    .slice(0, 40)
  if (!cleanName) return { presets: readPresets(), saved: false }

  const presets = readPresets()
  const id = `preset-${Number(now).toString(36)}-${presets.length.toString(36)}`
  const next = [{ id, name: cleanName, state: JSON.parse(JSON.stringify(state || {})) }, ...presets]
  const limited = next.slice(0, 12)
  const saved = persistPresets(limited)
  return { presets: saved ? limited : presets, saved }
}

export const deleteBlogFilterPreset = id => {
  const presets = readPresets()
  const next = presets.filter(item => item.id !== id)
  return { presets: persistPresets(next) ? next : presets, deleted: next.length !== presets.length }
}

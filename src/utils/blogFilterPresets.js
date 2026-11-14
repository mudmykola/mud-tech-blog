export const BLOG_FILTER_PRESETS_KEY = 'mud-tech-blog:blog-filter-presets:v1'

const MAX_PRESETS = 12
const MAX_PRESET_NAME_LENGTH = 40

const getStorage = () => {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

const cloneState = state => {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return {}

  try {
    const cloned = JSON.parse(JSON.stringify(state))
    return cloned && typeof cloned === 'object' && !Array.isArray(cloned) ? cloned : {}
  } catch {
    return {}
  }
}

const readPresets = () => {
  try {
    const raw = getStorage()?.getItem(BLOG_FILTER_PRESETS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(item => item && typeof item.id === 'string' && typeof item.name === 'string')
      .map(item => ({
        id: item.id.trim(),
        name: item.name.trim().slice(0, MAX_PRESET_NAME_LENGTH),
        state: cloneState(item.state),
      }))
      .filter(item => item.id)
      .filter(item => item.name)
      .slice(0, MAX_PRESETS)
  } catch {
    return []
  }
}

const persistPresets = presets => {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(BLOG_FILTER_PRESETS_KEY, JSON.stringify(presets.slice(0, MAX_PRESETS)))
    return true
  } catch {
    return false
  }
}

export const getBlogFilterPresets = () => readPresets()

const createPresetId = (now, presets) => {
  const timestamp = Number(now)
  const base = `preset-${(Number.isFinite(timestamp) ? timestamp : Date.now()).toString(36)}`
  let id = `${base}-${presets.length.toString(36)}`
  let suffix = 1

  while (presets.some(preset => preset.id === id)) {
    id = `${base}-${presets.length.toString(36)}-${suffix.toString(36)}`
    suffix += 1
  }

  return id
}

export const saveBlogFilterPreset = (name, state, now = Date.now()) => {
  const cleanName = String(name || '')
    .trim()
    .slice(0, MAX_PRESET_NAME_LENGTH)
  if (!cleanName) return { presets: readPresets(), saved: false }

  const presets = readPresets()
  const id = createPresetId(now, presets)
  const next = [{ id, name: cleanName, state: cloneState(state) }, ...presets]
  const limited = next.slice(0, MAX_PRESETS)
  const saved = persistPresets(limited)
  return { presets: saved ? limited : presets, saved }
}

export const deleteBlogFilterPreset = id => {
  const presets = readPresets()
  const next = presets.filter(item => item.id !== id)
  const changed = next.length !== presets.length
  if (!changed) return { presets, deleted: false }

  const deleted = persistPresets(next)
  return { presets: deleted ? next : presets, deleted }
}

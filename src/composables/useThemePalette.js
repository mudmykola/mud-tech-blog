import { ref } from 'vue'

const STORAGE_KEY = 'mm-theme-palette'

export const THEME_PALETTES = [
  { key: 'dark', label: 'Темна', icon: 'mdi-weather-night' },
  { key: 'light', label: 'Світла', icon: 'mdi-white-balance-sunny' },
]

const currentPalette = ref('dark')
let initialized = false

const isValidPalette = key => THEME_PALETTES.some(item => item.key === key)
const normalizePalette = key => (key === 'default' ? 'dark' : key)

const readSavedPalette = () => {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null
  } catch {
    return null
  }
}

const savePalette = key => {
  try {
    const storage = globalThis.localStorage
    if (!storage) return false
    storage.setItem(STORAGE_KEY, key)
    return true
  } catch {
    return false
  }
}

const applyPaletteToDom = key => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme-palette', key)
}

export const initThemePalette = () => {
  if (initialized) return

  const saved = readSavedPalette()
  const nextPalette = normalizePalette(saved)
  currentPalette.value = isValidPalette(nextPalette) ? nextPalette : 'dark'

  applyPaletteToDom(currentPalette.value)
  initialized = true
}

export const useThemePalette = () => {
  const setPalette = key => {
    if (!isValidPalette(key)) return false

    currentPalette.value = key
    applyPaletteToDom(key)

    return savePalette(key)
  }

  return {
    currentPalette,
    palettes: THEME_PALETTES,
    setPalette,
  }
}

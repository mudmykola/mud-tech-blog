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

const applyPaletteToDom = key => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme-palette', key)
}

export const initThemePalette = () => {
  if (initialized) return

  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  const nextPalette = normalizePalette(saved)
  currentPalette.value = isValidPalette(nextPalette) ? nextPalette : 'dark'

  applyPaletteToDom(currentPalette.value)
  initialized = true
}

export const useThemePalette = () => {
  const setPalette = key => {
    if (!isValidPalette(key)) return

    currentPalette.value = key
    applyPaletteToDom(key)

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, key)
    }
  }

  return {
    currentPalette,
    palettes: THEME_PALETTES,
    setPalette,
  }
}

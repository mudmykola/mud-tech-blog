import test from 'node:test'
import assert from 'node:assert/strict'

await import('vue')

test('useThemePalette: blocked localStorage does not prevent startup or theme changes', async () => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const attributes = {}

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage access is blocked')
    },
  })
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { documentElement: { setAttribute: (key, value) => (attributes[key] = value) } },
  })

  try {
    const { initThemePalette, useThemePalette } = await import(
      `../src/composables/useThemePalette.js?test=${Date.now()}`
    )
    const palette = useThemePalette()

    assert.doesNotThrow(() => initThemePalette())
    assert.equal(palette.currentPalette.value, 'dark')
    assert.equal(palette.setPalette('light'), false)
    assert.equal(palette.currentPalette.value, 'light')
    assert.equal(attributes['data-theme-palette'], 'light')
    assert.equal(palette.setPalette('invalid'), false)
    assert.equal(palette.currentPalette.value, 'light')
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage)
    else delete globalThis.localStorage
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument)
    else delete globalThis.document
  }
})

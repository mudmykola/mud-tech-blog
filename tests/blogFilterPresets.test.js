import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BLOG_FILTER_PRESETS_KEY,
  deleteBlogFilterPreset,
  getBlogFilterPresets,
  saveBlogFilterPreset,
} from '../src/utils/blogFilterPresets.js'

const createStorage = initial => {
  const values = new Map(Object.entries(initial || {}))
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

const createFailingStorage = source => ({
  getItem: key => source.getItem(key),
  setItem: () => {
    throw new Error('storage unavailable')
  },
})

test('filter presets save, normalize, load, and delete local filter states', () => {
  globalThis.localStorage = createStorage()
  const first = saveBlogFilterPreset(
    '  Vue: короткі  ',
    { topics: ['Vue'], readingTime: 'short' },
    10
  )

  assert.equal(first.saved, true)
  assert.equal(first.presets[0].name, 'Vue: короткі')
  assert.deepEqual(getBlogFilterPresets()[0].state, { topics: ['Vue'], readingTime: 'short' })

  const deleted = deleteBlogFilterPreset(first.presets[0].id)
  assert.equal(deleted.deleted, true)
  assert.deepEqual(getBlogFilterPresets(), [])
})

test('filter presets tolerate malformed storage and enforce safe bounds', () => {
  globalThis.localStorage = createStorage({ [BLOG_FILTER_PRESETS_KEY]: '{broken' })
  assert.deepEqual(getBlogFilterPresets(), [])

  const presets = Array.from({ length: 14 }, (_, index) => ({
    id: `p${index}`,
    name: `Preset ${index}`,
    state: {},
  }))
  globalThis.localStorage = createStorage({ [BLOG_FILTER_PRESETS_KEY]: JSON.stringify(presets) })
  assert.equal(getBlogFilterPresets().length, 12)
})

test('filter presets report failures when local storage is unavailable', () => {
  delete globalThis.localStorage
  assert.equal(saveBlogFilterPreset('test', {}, 10).saved, false)
})

test('filter presets report failed deletes without claiming deletion', () => {
  globalThis.localStorage = createStorage()
  const saved = saveBlogFilterPreset('test', {}, 10)
  globalThis.localStorage = createFailingStorage(globalThis.localStorage)

  const deleted = deleteBlogFilterPreset(saved.presets[0].id)
  assert.equal(deleted.deleted, false)
  assert.equal(deleted.presets.length, 1)
})

test('filter presets normalize invalid state and avoid duplicate ids', () => {
  globalThis.localStorage = createStorage()
  const first = saveBlogFilterPreset('first', [], 10)
  const second = saveBlogFilterPreset('second', { topics: ['Vue'] }, 10)

  assert.deepEqual(first.presets[0].state, {})
  assert.notEqual(first.presets[0].id, second.presets[0].id)
})

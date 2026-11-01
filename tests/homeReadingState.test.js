import test from 'node:test'
import assert from 'node:assert/strict'
import {
  estimateReadingMinutes,
  getLastReadArticle,
  getSavedArticleHandles,
  normalizeSavedArticleHandles,
  saveArticleHandles,
  saveLastReadArticle,
  toggleSavedArticleHandle,
} from '../src/utils/homeReadingState.js'

const createStorage = () => {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('home reading state: saves the last valid article handle', () => {
  globalThis.localStorage = createStorage()

  assert.equal(saveLastReadArticle('  vue-patterns  '), true)
  assert.equal(getLastReadArticle(), 'vue-patterns')
  assert.equal(saveLastReadArticle(' '), false)
})

test('home reading state: normalizes saved handles and removes duplicates', () => {
  globalThis.localStorage = createStorage()

  assert.equal(saveArticleHandles(['vue', '', 'vue', null, 'shopify']), true)
  assert.deepEqual(getSavedArticleHandles(), ['vue', 'shopify'])
})

test('home reading state: toggles saved article handles without duplicates', () => {
  const saved = ['vue', 'shopify']

  assert.deepEqual(toggleSavedArticleHandle(saved, '  vue '), ['shopify'])
  assert.deepEqual(toggleSavedArticleHandle(saved, 'react'), ['vue', 'shopify', 'react'])
  assert.deepEqual(toggleSavedArticleHandle(saved, ' '), saved)
  assert.deepEqual(normalizeSavedArticleHandles([' vue ', 'vue', null]), ['vue'])
})

test('home reading state: malformed persisted data falls back safely', () => {
  globalThis.localStorage = {
    getItem: () => '{broken json',
    setItem() {},
  }

  assert.equal(getLastReadArticle(), '')
  assert.deepEqual(getSavedArticleHandles(), [])
})

test('estimateReadingMinutes: derives a minimum-one-minute estimate from HTML', () => {
  assert.equal(estimateReadingMinutes('<p>One two three</p>'), 1)
  assert.equal(estimateReadingMinutes(`<p>${'слово '.repeat(401)}</p>`), 3)
  assert.equal(estimateReadingMinutes('<p> </p>'), null)
})

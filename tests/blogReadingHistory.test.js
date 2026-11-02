import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BLOG_READING_HISTORY_KEY,
  getReadArticleHandles,
  markArticleAsRead,
} from '../src/utils/blogReadingHistory.js'

const createStorage = initial => {
  const values = new Map(Object.entries(initial || {}))
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('reading history records completion once and promotes repeated reads', () => {
  globalThis.localStorage = createStorage()

  assert.equal(markArticleAsRead('vue', '2026-11-01T10:00:00.000Z'), true)
  assert.equal(markArticleAsRead('shopify', '2026-11-02T10:00:00.000Z'), true)
  assert.equal(markArticleAsRead('vue', '2026-11-03T10:00:00.000Z'), true)
  assert.deepEqual(getReadArticleHandles(), ['vue', 'shopify'])

  const state = JSON.parse(globalThis.localStorage.getItem(BLOG_READING_HISTORY_KEY))
  assert.equal(state.version, 1)
  assert.equal(state.items[0].readAt, '2026-11-03T10:00:00.000Z')
})

test('reading history ignores malformed and unsupported stored schemas', () => {
  globalThis.localStorage = createStorage({ [BLOG_READING_HISTORY_KEY]: '{broken' })
  assert.deepEqual(getReadArticleHandles(), [])

  globalThis.localStorage = createStorage({
    [BLOG_READING_HISTORY_KEY]: JSON.stringify({ version: 2, items: [{ handle: 'vue' }] }),
  })
  assert.deepEqual(getReadArticleHandles(), [])
})

test('reading history safely handles blank handles and unavailable storage', () => {
  globalThis.localStorage = createStorage()
  assert.equal(markArticleAsRead(' '), false)
  delete globalThis.localStorage
  assert.equal(markArticleAsRead('vue'), false)
})

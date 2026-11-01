import test from 'node:test'
import assert from 'node:assert/strict'
import { filterHomeArticles } from '../src/utils/filterHomeArticles.js'

const articles = [
  { handle: 'vue-guide', tags: ['Vue', 'Frontend'] },
  { handle: 'shopify-guide', tags: ['Shopify', 'eCommerce'] },
  { handle: 'vue-shopify', tags: ['vue', 'Shopify'] },
  { handle: 'untagged', tags: [] },
]

test('filterHomeArticles: matches topic case-insensitively and ignores missing tags', () => {
  const filtered = filterHomeArticles(articles, { topic: 'VUE' })
  assert.deepEqual(filtered.map(article => article.handle), ['vue-guide', 'vue-shopify'])
})

test('filterHomeArticles: filters saved handles and combines topic with saved state', () => {
  const filtered = filterHomeArticles(articles, {
    topic: 'shopify',
    savedHandles: ['vue-shopify', 'untagged'],
    savedOnly: true,
  })
  assert.deepEqual(filtered.map(article => article.handle), ['vue-shopify'])
})

test('filterHomeArticles: leaves the source articles untouched when no filters are active', () => {
  const original = [...articles]
  const filtered = filterHomeArticles(articles)
  assert.deepEqual(filtered, articles)
  assert.deepEqual(articles, original)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getHomeArticleBatch,
  HOME_ARTICLE_BATCH_SIZE,
  HOME_INITIAL_BATCH_SIZE,
} from '../src/utils/homeArticleBatch.js'

const articles = Array.from({ length: 30 }, (_, index) => ({ handle: `article-${index + 1}` }))

test('getHomeArticleBatch: starts with 12 cards', () => {
  assert.equal(getHomeArticleBatch(articles).length, 12)
})

test('homepage initial batch leaves an even grid after the three-card stack', () => {
  const firstBatch = getHomeArticleBatch(articles, HOME_INITIAL_BATCH_SIZE)
  const remainder = firstBatch.length - 3

  assert.equal(firstBatch.length, 13)
  assert.equal(remainder, 10)
  assert.equal(remainder % 2, 0)

  const secondBatch = getHomeArticleBatch(
    articles,
    HOME_INITIAL_BATCH_SIZE + HOME_ARTICLE_BATCH_SIZE
  )
  assert.equal(secondBatch.length - 3, 22)
  assert.equal((secondBatch.length - 3) % 2, 0)
})

test('getHomeArticleBatch: reveals additional batches without losing earlier results', () => {
  assert.equal(getHomeArticleBatch(articles, 24).length, 24)
  assert.equal(getHomeArticleBatch(articles, 24)[23].handle, 'article-24')
})

test('getHomeArticleBatch: safely handles the final partial batch and empty lists', () => {
  assert.equal(getHomeArticleBatch(articles.slice(0, 14), 24).length, 14)
  assert.deepEqual(getHomeArticleBatch([], 12), [])
})

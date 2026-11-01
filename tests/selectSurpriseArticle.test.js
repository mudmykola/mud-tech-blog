import test from 'node:test'
import assert from 'node:assert/strict'

import { selectSurpriseArticle } from '../src/utils/selectSurpriseArticle.js'

const articles = [{ handle: 'latest' }, { handle: 'previous' }, { handle: 'other' }]

test('selectSurpriseArticle avoids latest and previous when alternatives exist', () => {
  const selected = selectSurpriseArticle(articles, {
    latestHandle: 'latest',
    lastHandle: 'previous',
    random: () => 0,
  })

  assert.equal(selected.handle, 'other')
})

test('selectSurpriseArticle avoids repeating the previous choice', () => {
  const selected = selectSurpriseArticle(articles, {
    latestHandle: 'latest',
    lastHandle: 'other',
    random: () => 0,
  })

  assert.equal(selected.handle, 'previous')
})

test('selectSurpriseArticle falls back to latest if it is the only alternative', () => {
  const selected = selectSurpriseArticle([{ handle: 'latest' }, { handle: 'previous' }], {
    latestHandle: 'latest',
    lastHandle: 'previous',
    random: () => 0,
  })

  assert.equal(selected.handle, 'latest')
})

test('selectSurpriseArticle returns the only article and safely handles an empty list', () => {
  assert.equal(selectSurpriseArticle([{ handle: 'only' }], { lastHandle: 'only' }).handle, 'only')
  assert.equal(selectSurpriseArticle([]), null)
})

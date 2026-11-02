import test from 'node:test'
import assert from 'node:assert/strict'
import {
  FOLLOWED_TOPICS_KEY,
  getFollowedTopics,
  normalizeFollowedTopics,
  saveFollowedTopics,
  toggleFollowedTopic,
} from '../src/utils/followedTopicsState.js'

const createStorage = initial => {
  const values = new Map(Object.entries(initial || {}))
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('followed topics: normalizes whitespace, empty values, and case duplicates', () => {
  assert.deepEqual(normalizeFollowedTopics([' Vue ', 'vue', '', null, 'AI']), ['Vue', 'AI'])
})

test('followed topics: toggle is case-insensitive and does not mutate its input', () => {
  const current = ['Vue']
  assert.deepEqual(toggleFollowedTopic(current, 'VUE'), [])
  assert.deepEqual(toggleFollowedTopic(current, 'AI'), ['Vue', 'AI'])
  assert.deepEqual(current, ['Vue'])
})

test('followed topics: persists under its own key and tolerates malformed storage', () => {
  globalThis.localStorage = createStorage()
  assert.equal(saveFollowedTopics([' Vue ', 'vue']), true)
  assert.equal(globalThis.localStorage.getItem(FOLLOWED_TOPICS_KEY), '["Vue"]')
  assert.deepEqual(getFollowedTopics(), ['Vue'])

  globalThis.localStorage = createStorage({ [FOLLOWED_TOPICS_KEY]: '{broken' })
  assert.deepEqual(getFollowedTopics(), [])
})

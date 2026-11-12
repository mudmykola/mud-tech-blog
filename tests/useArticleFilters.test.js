import test from 'node:test'
import assert from 'node:assert/strict'
import { ref } from 'vue'
import { useArticleFilters } from '../src/composables/useArticleFilters.js'

const makeArticle = (idx, overrides = {}) => ({
  title: `Article ${idx}`,
  excerpt: `Excerpt ${idx}`,
  publishedAt: `2026-02-${String((idx % 28) + 1).padStart(2, '0')}T10:00:00+02:00`,
  ...overrides,
})

test('useArticleFilters: filters by query in title/excerpt and sorts by newest', () => {
  const articles = ref([
    makeArticle(1, {
      title: 'Vue Patterns',
      excerpt: 'UI composition',
      publishedAt: '2026-02-10T10:00:00+02:00',
    }),
    makeArticle(2, {
      title: 'Shopify API',
      excerpt: 'GraphQL tricks',
      publishedAt: '2026-02-14T10:00:00+02:00',
    }),
    makeArticle(3, {
      title: 'Automation',
      excerpt: 'Vue workflow',
      publishedAt: '2026-02-12T10:00:00+02:00',
    }),
  ])
  const searchQuery = ref('vue')
  const sortBy = ref('date_desc')

  const filtered = useArticleFilters(articles, searchQuery, sortBy)

  assert.equal(filtered.value.length, 2)
  assert.deepEqual(
    filtered.value.map(item => item.title),
    ['Automation', 'Vue Patterns']
  )
})

test('useArticleFilters: caps output to 12 items', () => {
  const articles = ref(Array.from({ length: 20 }, (_, i) => makeArticle(i + 1)))
  const searchQuery = ref('')
  const sortBy = ref('date_desc')

  const filtered = useArticleFilters(articles, searchQuery, sortBy)

  assert.equal(filtered.value.length, 12)
})

test('useArticleFilters: supports unbounded results for combined home filters', () => {
  const articles = ref(Array.from({ length: 20 }, (_, i) => makeArticle(i + 1)))
  const searchQuery = ref('')
  const sortBy = ref('date_desc')

  const filtered = useArticleFilters(articles, searchQuery, sortBy, { limit: false })

  assert.equal(filtered.value.length, 20)
})

test('useArticleFilters: sorts by title desc', () => {
  const articles = ref([
    makeArticle(1, { title: 'Beta' }),
    makeArticle(2, { title: 'Alpha' }),
    makeArticle(3, { title: 'Gamma' }),
  ])
  const searchQuery = ref('')
  const sortBy = ref('title_desc')

  const filtered = useArticleFilters(articles, searchQuery, sortBy)

  assert.deepEqual(
    filtered.value.map(item => item.title),
    ['Gamma', 'Beta', 'Alpha']
  )
})

test('useArticleFilters: trims and normalizes a query once while tolerating empty titles', () => {
  const articles = ref([
    makeArticle(1, { title: 'Vue Basics', excerpt: null }),
    makeArticle(2, { title: '', excerpt: '  Vue in practice  ' }),
    makeArticle(3, { title: 'React', excerpt: 'Components' }),
  ])
  const searchQuery = ref('  VUE ')
  const sortBy = ref('unknown')

  const filtered = useArticleFilters(articles, searchQuery, sortBy, { limit: false })

  assert.deepEqual(
    filtered.value.map(item => item.title),
    ['Vue Basics', '']
  )
})

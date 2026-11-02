import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterBlogArticles,
  getBlogTopicStats,
  getPersonalizedTopics,
  getRelatedTopics,
  normalizeTopic,
  parseBlogQuery,
  serializeBlogQuery,
} from '../src/utils/blogTopicDiscovery.js'

const now = new Date('2026-11-02T00:00:00.000Z')
const articles = [
  {
    handle: 'vue-ai-recent',
    title: 'Vue and AI',
    excerpt: 'Recent article',
    authorV2: { name: 'Olena' },
    tags: ['Vue', 'AI'],
    readingMinutes: 4,
    publishedAt: '2026-10-20T00:00:00.000Z',
  },
  {
    handle: 'vue-older',
    title: 'Vue Patterns',
    excerpt: 'Older article',
    authorV2: { name: 'Mykola' },
    tags: ['vue', 'Frontend'],
    readingMinutes: 12,
    publishedAt: '2026-09-20T00:00:00.000Z',
  },
  {
    handle: 'ai-old',
    title: 'AI systems',
    excerpt: 'Old article',
    authorV2: { name: 'Oleh' },
    tags: ['AI'],
    readingMinutes: 21,
    publishedAt: '2026-08-01T00:00:00.000Z',
  },
]

test('normalizeTopic trims and case-folds topic labels', () => {
  assert.equal(normalizeTopic('  VUE '), 'vue')
})

test('filterBlogArticles supports case-insensitive OR and AND topic matching', () => {
  const orResults = filterBlogArticles(articles, { selectedTopics: ['VUE', 'AI'], now })
  const andResults = filterBlogArticles(articles, {
    selectedTopics: ['VUE', 'AI'],
    topicMatchMode: 'and',
    now,
  })

  assert.equal(orResults.length, 3)
  assert.deepEqual(
    andResults.map(article => article.handle),
    ['vue-ai-recent']
  )
})

test('filterBlogArticles searches title, excerpt, author, and tags', () => {
  assert.equal(filterBlogArticles(articles, { searchQuery: 'olena', now }).length, 1)
  assert.equal(filterBlogArticles(articles, { searchQuery: 'frontend', now }).length, 1)
})

test('filterBlogArticles applies recent window without mutating source data', () => {
  const results = filterBlogArticles(articles, { recentDays: 30, now })
  assert.deepEqual(
    results.map(article => article.handle),
    ['vue-ai-recent']
  )
  assert.equal(articles.length, 3)
})

test('filterBlogArticles combines author, reading time, saved, and read facets', () => {
  const results = filterBlogArticles(articles, {
    author: 'olena',
    readingTime: 'short',
    onlySaved: true,
    savedHandles: ['vue-ai-recent'],
    readState: 'unread',
    readHandles: ['vue-older'],
    now,
  })

  assert.deepEqual(
    results.map(article => article.handle),
    ['vue-ai-recent']
  )
})

test('filterBlogArticles applies reading time bands and exact author facet', () => {
  assert.deepEqual(
    filterBlogArticles(articles, { readingTime: 'medium', now }).map(article => article.handle),
    ['vue-older']
  )
  assert.deepEqual(
    filterBlogArticles(articles, { author: 'MYKOLA', now }).map(article => article.handle),
    ['vue-older']
  )
})

test('getBlogTopicStats computes lifetime count and two-window publication trend', () => {
  const stats = getBlogTopicStats(articles, now, 30)
  const vue = stats.find(topic => topic.key === 'vue')
  const ai = stats.find(topic => topic.key === 'ai')

  assert.deepEqual(
    { count: vue.count, recent: vue.recentCount, previous: vue.previousCount },
    {
      count: 2,
      recent: 1,
      previous: 1,
    }
  )
  assert.equal(ai.trendDelta, 1)
})

test('getRelatedTopics returns co-occurring tags, excluding selected tags', () => {
  assert.deepEqual(
    getRelatedTopics(articles, ['Vue']).map(topic => topic.label),
    ['AI', 'Frontend']
  )
})

test('getPersonalizedTopics weights saved and last-read article tags and falls back when empty', () => {
  const personalized = getPersonalizedTopics(articles, ['vue-older'], 'vue-ai-recent', [])
  const fallback = [{ label: 'Popular', count: 9 }]

  assert.equal(personalized[0].label, 'Vue')
  assert.equal(personalized[0].count, 3)
  assert.deepEqual(getPersonalizedTopics(articles, [], '', fallback), fallback)
})

test('parseBlogQuery validates filters and accepts legacy single tag query', () => {
  assert.deepEqual(parseBlogQuery({ tag: 'Vue', sort: 'invalid', page: '-2', recent: '30' }), {
    searchQuery: '',
    selectedTopics: ['Vue'],
    topicMatchMode: 'or',
    multiTopicEnabled: false,
    sortBy: 'date_desc',
    currentPage: 1,
    recentDays: 30,
    author: '',
    readingTime: 'all',
  })
})

test('parseBlogQuery supports extended periods and preserves the recent=30 alias', () => {
  assert.equal(parseBlogQuery({ period: '90' }).recentDays, 90)
  assert.equal(parseBlogQuery({ recent: '30' }).recentDays, 30)
  assert.equal(parseBlogQuery({ period: '999', recent: '7' }).recentDays, 0)
})

test('serializeBlogQuery omits defaults and preserves valid multi-filter state', () => {
  assert.deepEqual(
    serializeBlogQuery({
      searchQuery: 'Vue',
      selectedTopics: ['Vue', 'AI'],
      topicMatchMode: 'and',
      multiTopicEnabled: true,
      sortBy: 'date_asc',
      currentPage: 3,
      recentDays: 30,
      author: 'Olena',
      readingTime: 'short',
    }),
    {
      q: 'Vue',
      topics: 'Vue,AI',
      sort: 'date_asc',
      page: '3',
      recent: '30',
      author: 'Olena',
      readtime: 'short',
      multi: '1',
      match: 'and',
    }
  )
})

const SORT_VALUES = new Set(['date_desc', 'date_asc', 'title_asc', 'title_desc'])
const DAY_MS = 24 * 60 * 60 * 1000
const PERIOD_VALUES = new Set([7, 30, 90, 365])
const READING_TIME_VALUES = new Set(['short', 'medium', 'long'])

export const BLOG_FILTER_QUERY_KEYS = [
  'q',
  'topics',
  'tag',
  'sort',
  'page',
  'recent',
  'period',
  'multi',
  'match',
  'author',
  'readtime',
]

export const normalizeTopic = value =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('uk-UA')

const articleTopics = article =>
  Array.isArray(article?.tags)
    ? article.tags.map(tag => String(tag ?? '').trim()).filter(Boolean)
    : []

const queryValue = value => (Array.isArray(value) ? value[0] : value)

export const getBlogTopicStats = (articles = [], now = Date.now(), periodDays = 30) => {
  const nowMs = now instanceof Date ? now.getTime() : Number(now)
  const periodMs = Math.max(1, Number(periodDays) || 30) * DAY_MS
  const currentStart = nowMs - periodMs
  const previousStart = currentStart - periodMs
  const labels = new Map()
  const counts = new Map()
  const recentCounts = new Map()
  const previousCounts = new Map()

  articles.forEach(article => {
    const publishedAt = new Date(article?.publishedAt).getTime()
    const topics = new Set(articleTopics(article).map(normalizeTopic))

    topics.forEach(topic => {
      if (!labels.has(topic))
        labels.set(
          topic,
          articleTopics(article).find(tag => normalizeTopic(tag) === topic)
        )
      counts.set(topic, (counts.get(topic) || 0) + 1)

      if (publishedAt >= currentStart && publishedAt <= nowMs) {
        recentCounts.set(topic, (recentCounts.get(topic) || 0) + 1)
      } else if (publishedAt >= previousStart && publishedAt < currentStart) {
        previousCounts.set(topic, (previousCounts.get(topic) || 0) + 1)
      }
    })
  })

  return [...counts.entries()]
    .map(([key, count]) => {
      const recentCount = recentCounts.get(key) || 0
      const previousCount = previousCounts.get(key) || 0
      return {
        key,
        label: labels.get(key) || key,
        count,
        recentCount,
        previousCount,
        trendDelta: recentCount - previousCount,
      }
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'uk'))
}

export const filterBlogArticles = (
  articles = [],
  {
    searchQuery = '',
    selectedTopics = [],
    topicMatchMode = 'or',
    sortBy = 'date_desc',
    recentDays = 0,
    author = '',
    readingTime = 'all',
    onlySaved = false,
    savedHandles = [],
    readState = 'all',
    readHandles = [],
    now = Date.now(),
  } = {}
) => {
  const query = String(searchQuery).trim().toLocaleLowerCase('uk-UA')
  const selected = [...new Set(selectedTopics.map(normalizeTopic).filter(Boolean))]
  const normalizedAuthor = normalizeTopic(author)
  const saved = new Set(savedHandles)
  const read = new Set(readHandles)
  const nowMs = now instanceof Date ? now.getTime() : Number(now)
  const cutoff = Number(recentDays) > 0 ? nowMs - Number(recentDays) * DAY_MS : null

  const filtered = articles.filter(article => {
    const handle = String(article?.handle || '')
    const articleTags = articleTopics(article).map(normalizeTopic)
    if (selected.length) {
      const matches = selected.map(topic => articleTags.includes(topic))
      if (topicMatchMode === 'and' ? !matches.every(Boolean) : !matches.some(Boolean)) return false
    }

    if (cutoff !== null) {
      const publishedAt = new Date(article?.publishedAt).getTime()
      if (!Number.isFinite(publishedAt) || publishedAt < cutoff || publishedAt > nowMs) return false
    }

    if (normalizedAuthor && normalizeTopic(article?.authorV2?.name) !== normalizedAuthor)
      return false

    if (readingTime !== 'all') {
      const minutes = Number(article?.readingMinutes)
      if (!Number.isFinite(minutes)) return false
      if (readingTime === 'short' && minutes > 5) return false
      if (readingTime === 'medium' && (minutes < 6 || minutes > 15)) return false
      if (readingTime === 'long' && minutes < 16) return false
    }

    if (onlySaved && (!handle || !saved.has(handle))) return false
    if (readState === 'read' && !read.has(handle)) return false
    if (readState === 'unread' && read.has(handle)) return false

    if (!query) return true
    const searchable = [article?.title, article?.excerpt, article?.authorV2?.name, ...articleTags]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('uk-UA')
    return searchable.includes(query)
  })

  const sorted = [...filtered]
  if (sortBy === 'date_asc') {
    sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
  } else if (sortBy === 'title_asc') {
    sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'uk'))
  } else if (sortBy === 'title_desc') {
    sorted.sort((a, b) => String(b.title || '').localeCompare(String(a.title || ''), 'uk'))
  } else {
    sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  }

  return sorted
}

export const getRelatedTopics = (articles = [], selectedTopics = [], limit = 4) => {
  const selected = [...new Set(selectedTopics.map(normalizeTopic).filter(Boolean))]
  const labels = new Map()
  const counts = new Map()

  articles.forEach(article => {
    const topics = [...new Set(articleTopics(article).map(normalizeTopic))]
    if (selected.length && !selected.some(topic => topics.includes(topic))) return

    topics.forEach(topic => {
      if (selected.includes(topic)) return
      if (!labels.has(topic))
        labels.set(
          topic,
          articleTopics(article).find(tag => normalizeTopic(tag) === topic)
        )
      counts.set(topic, (counts.get(topic) || 0) + 1)
    })
  })

  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labels.get(key) || key, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'uk'))
    .slice(0, Math.max(0, limit))
}

export const getPersonalizedTopics = (
  articles = [],
  savedHandles = [],
  lastReadHandle = '',
  fallbackTopics = [],
  limit = 4
) => {
  const saved = new Set(savedHandles)
  const labels = new Map()
  const scores = new Map()

  articles.forEach(article => {
    const weight =
      (saved.has(article?.handle) ? 1 : 0) + (article?.handle === lastReadHandle ? 2 : 0)
    if (!weight) return

    articleTopics(article).forEach(topic => {
      const key = normalizeTopic(topic)
      if (!labels.has(key)) labels.set(key, topic)
      scores.set(key, (scores.get(key) || 0) + weight)
    })
  })

  if (!scores.size) return fallbackTopics.slice(0, limit)

  return [...scores.entries()]
    .map(([key, score]) => ({ key, label: labels.get(key) || key, count: score }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'uk'))
    .slice(0, Math.max(0, limit))
}

export const parseBlogQuery = query => {
  const rawTopics = queryValue(query.topics) ?? queryValue(query.tag) ?? ''
  const topics = [
    ...new Set(
      String(rawTopics)
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
    ),
  ]
  const rawSort = queryValue(query.sort)
  const rawPage = Number.parseInt(queryValue(query.page), 10)
  const rawRecent = Number.parseInt(queryValue(query.recent), 10)
  const multi = queryValue(query.multi) === '1'
  const selectedTopics = multi ? topics : topics.slice(0, 1)

  return {
    searchQuery: String(queryValue(query.q) || ''),
    selectedTopics,
    topicMatchMode: multi && queryValue(query.match) === 'and' ? 'and' : 'or',
    multiTopicEnabled: multi,
    sortBy: SORT_VALUES.has(rawSort) ? rawSort : 'date_desc',
    currentPage: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    recentDays: PERIOD_VALUES.has(Number(queryValue(query.period)))
      ? Number(queryValue(query.period))
      : rawRecent === 30
        ? 30
        : 0,
    author: String(queryValue(query.author) || ''),
    readingTime: READING_TIME_VALUES.has(queryValue(query.readtime))
      ? queryValue(query.readtime)
      : 'all',
  }
}

export const serializeBlogQuery = state => {
  const query = {}
  const searchQuery = String(state.searchQuery || '').trim()
  const topics = [
    ...new Set((state.selectedTopics || []).map(value => String(value).trim()).filter(Boolean)),
  ]
  const sortBy = SORT_VALUES.has(state.sortBy) ? state.sortBy : 'date_desc'
  const currentPage = Math.max(1, Number.parseInt(state.currentPage, 10) || 1)

  if (searchQuery) query.q = searchQuery
  if (topics.length) query.topics = topics.join(',')
  if (sortBy !== 'date_desc') query.sort = sortBy
  if (currentPage > 1) query.page = String(currentPage)
  if (state.recentDays === 30) query.recent = '30'
  else if (PERIOD_VALUES.has(Number(state.recentDays))) query.period = String(state.recentDays)
  const author = String(state.author || '').trim()
  if (author) query.author = author
  if (READING_TIME_VALUES.has(state.readingTime)) query.readtime = state.readingTime
  if (state.multiTopicEnabled) {
    query.multi = '1'
    if (state.topicMatchMode === 'and') query.match = 'and'
  }

  return query
}

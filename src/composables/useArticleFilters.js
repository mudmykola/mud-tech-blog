import { computed } from 'vue'

export function useArticleFilters(articles, searchQuery, sortBy, options = {}) {
  const limit = options.limit === false ? null : (options.limit ?? 12)

  return computed(() => {
    const query = String(searchQuery.value || '')
      .trim()
      .toLowerCase()
    const filtered = articles.value.filter(article => {
      const title = String(article.title || '').toLowerCase()
      const excerpt = String(article.excerpt || '').toLowerCase()
      return title.includes(query) || excerpt.includes(query)
    })

    if (sortBy.value === 'date_desc') {
      filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    } else if (sortBy.value === 'date_asc') {
      filtered.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
    } else if (sortBy.value === 'title_asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy.value === 'title_desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title))
    }

    return limit === null ? filtered : filtered.slice(0, limit)
  })
}

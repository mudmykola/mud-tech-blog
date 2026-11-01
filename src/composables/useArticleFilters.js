import { computed } from 'vue'

export function useArticleFilters(articles, searchQuery, sortBy, options = {}) {
  const limit = options.limit === false ? null : (options.limit ?? 12)

  return computed(() => {
    let sorted = [...articles.value]

    if (sortBy.value === 'date_desc') {
      sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    } else if (sortBy.value === 'date_asc') {
      sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
    } else if (sortBy.value === 'title_asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy.value === 'title_desc') {
      sorted.sort((a, b) => b.title.localeCompare(a.title))
    }

    const filtered = sorted
      .filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (article.excerpt &&
            article.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase()))
      )

    return limit === null ? filtered : filtered.slice(0, limit)
  })
}

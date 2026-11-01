export const filterHomeArticles = (
  articles,
  { topic = '', savedHandles = [], savedOnly = false } = {}
) => {
  const normalizedTopic = String(topic).trim().toLocaleLowerCase()
  const saved = new Set(savedHandles)

  return articles.filter(article => {
    const tags = Array.isArray(article.tags) ? article.tags : []
    const matchesTopic =
      !normalizedTopic ||
      tags.some(tag => String(tag).trim().toLocaleLowerCase() === normalizedTopic)
    const matchesSaved = !savedOnly || saved.has(article.handle)
    return matchesTopic && matchesSaved
  })
}

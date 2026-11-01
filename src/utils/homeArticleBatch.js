export const HOME_ARTICLE_BATCH_SIZE = 12
export const HOME_INITIAL_BATCH_SIZE = HOME_ARTICLE_BATCH_SIZE + 1

export const getHomeArticleBatch = (articles, limit = HOME_ARTICLE_BATCH_SIZE) =>
  articles.slice(0, Math.max(0, Math.floor(Number(limit) || 0)))

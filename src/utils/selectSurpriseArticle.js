export const selectSurpriseArticle = (
  articles,
  { lastHandle = '', latestHandle = '', random = Math.random } = {}
) => {
  const available = articles.filter(article => article?.handle)
  if (!available.length) return null

  const notPrevious = available.filter(article => article.handle !== lastHandle)
  let candidates = notPrevious.length ? notPrevious : available

  const notLatest = candidates.filter(article => article.handle !== latestHandle)
  if (notLatest.length) candidates = notLatest

  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  return candidates[index]
}

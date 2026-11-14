import axios from 'axios'

const API_URL = import.meta.env.VITE_SHOPIFY_API_URL
const API_KEY = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN
const BLOG_HANDLE = 'news'
const ARTICLES_PER_PAGE = 250
const CACHE_TTL_MS = 5 * 60 * 1000
const REQUEST_TIMEOUT_MS = 15000

const ARTICLES_QUERY = `
  query BlogArticles(
    $blogHandle: String!
    $first: Int!
    $after: String
    $articleQuery: String
  ) {
    blogByHandle(handle: $blogHandle) {
      articles(first: $first, after: $after, query: $articleQuery) {
        edges {
          cursor
          node {
            id
            title
            handle
            publishedAt
            authorV2 {
              name
            }
            excerpt
            contentHtml
            image {
              url
              altText
            }
            tags
            seo {
              title
              description
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

const shopifyClient = API_URL
  ? axios.create({
      baseURL: API_URL,
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        'X-Shopify-Storefront-Access-Token': API_KEY,
        'Content-Type': 'application/json',
      },
    })
  : null

let articlesCache = null
let cacheUpdatedAt = 0
let inFlightRequest = null

const cloneArticles = articles =>
  articles.map(article => ({
    ...article,
    tags: Array.isArray(article.tags) ? [...article.tags] : [],
    image: article.image ? { ...article.image } : article.image,
    seo: article.seo ? { ...article.seo } : article.seo,
  }))

const normalizeLatestDate = latestDate => {
  if (latestDate == null) return null

  const normalized = latestDate instanceof Date ? latestDate : new Date(latestDate)
  if (Number.isNaN(normalized.getTime())) {
    throw new TypeError('latestDate має бути коректною датою')
  }

  return normalized
}

const getGraphqlError = errors => {
  if (!Array.isArray(errors) || !errors.length) return null
  return errors.map(error => error?.message || 'Невідома GraphQL помилка').join('; ')
}

const fetchArticlesPage = async ({ after, latestDate }) => {
  if (!shopifyClient || !API_KEY) {
    throw new Error('Shopify API configuration is missing')
  }

  const response = await shopifyClient.post('', {
    query: ARTICLES_QUERY,
    variables: {
      blogHandle: BLOG_HANDLE,
      first: ARTICLES_PER_PAGE,
      after: after || null,
      articleQuery: latestDate ? `published_at:>${latestDate.toISOString()}` : null,
    },
  })

  const graphqlError = getGraphqlError(response.data?.errors)
  if (graphqlError) throw new Error(graphqlError)

  const articles = response.data?.data?.blogByHandle?.articles
  if (!articles || !Array.isArray(articles.edges) || !articles.pageInfo) {
    throw new Error('Shopify API returned an invalid articles response')
  }

  return articles
}

const fetchAllArticles = async latestDate => {
  const allArticles = []
  let after = null

  while (true) {
    const page = await fetchArticlesPage({ after, latestDate })
    allArticles.push(...page.edges.map(edge => edge.node).filter(Boolean))

    if (!page.pageInfo.hasNextPage) break

    const nextCursor = page.pageInfo.endCursor
    if (!nextCursor || nextCursor === after) {
      throw new Error('Shopify pagination returned an invalid cursor')
    }

    after = nextCursor
  }

  return allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

const getCachedArticles = () => (articlesCache ? cloneArticles(articlesCache) : [])

export const getBlogArticles = async latestDate => {
  const normalizedLatestDate = normalizeLatestDate(latestDate)
  const isFullCatalogRequest = !normalizedLatestDate
  const hasFreshCache =
    isFullCatalogRequest && articlesCache && Date.now() - cacheUpdatedAt < CACHE_TTL_MS

  if (hasFreshCache) return getCachedArticles()
  if (isFullCatalogRequest && inFlightRequest) return inFlightRequest

  const requestPromise = fetchAllArticles(normalizedLatestDate)

  if (isFullCatalogRequest) inFlightRequest = requestPromise

  try {
    const articles = await requestPromise

    if (isFullCatalogRequest) {
      articlesCache = articles
      cacheUpdatedAt = Date.now()
    }

    return cloneArticles(articles)
  } catch (error) {
    console.error('[shopify] Failed to fetch articles:', error.message)

    // Keep the last known catalog available during temporary API failures.
    return isFullCatalogRequest ? getCachedArticles() : []
  } finally {
    if (isFullCatalogRequest) inFlightRequest = null
  }
}

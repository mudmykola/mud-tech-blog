import axios from 'axios'

const API_URL = import.meta.env.VITE_SHOPIFY_API_URL
const API_KEY = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN

// Передаємо `latestDate` як параметр, щоб завантажувати лише нові статті
export const getBlogArticles = async latestDate => {
  const allArticles = []
  let hasNextPage = true
  let endCursor = null

  try {
    while (hasNextPage) {
      const query = `
        {
          blogByHandle(handle: "news") {
            articles(first: 250, ${
              latestDate ? `query: "published_at:>${latestDate.toISOString()}"` : ''
            }${endCursor ? `, after: "${endCursor}"` : ''}) {
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

      const response = await axios.post(
        API_URL,
        { query },
        {
          headers: {
            'X-Shopify-Storefront-Access-Token': API_KEY,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = response.data?.data?.blogByHandle?.articles
      if (!data) {
        console.error('❌ Shopify API не повернув дані.')
        break
      }

      const articles = data.edges.map(edge => edge.node)
      allArticles.push(...articles)

      hasNextPage = data.pageInfo.hasNextPage
      endCursor = data.pageInfo.endCursor
    }

    // Відсортуємо всі статті за датою у порядку спадання
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    return allArticles
  } catch (error) {
    console.error('❌ Помилка отримання статей:', error.response?.data || error.message)
    return []
  }
}

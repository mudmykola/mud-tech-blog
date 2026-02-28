import { buildCanonicalUrl } from './canonical.js'

const stripHtml = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const normalizePath = value => {
  const raw = String(value || '/')
  if (!raw) return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}
const toAbsoluteUrl = value => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return buildCanonicalUrl(normalizePath(raw))
}

export const generateOrganizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: "Mud' Tech Blog",
  url: buildCanonicalUrl('/'),
  logo: buildCanonicalUrl('/favicon.ico'),
  sameAs: [
    'https://www.facebook.com/kiber.news',
    'https://t.me/mudwebdev',
    'https://github.com/mudmykola',
  ],
})

export const generateWebSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: "Mud' Tech Blog",
  url: buildCanonicalUrl('/'),
  potentialAction: {
    '@type': 'SearchAction',
    target: buildCanonicalUrl('/search?q={search_term_string}'),
    'query-input': 'required name=search_term_string',
  },
})

export const generateBlogIndexJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: "Mud' Tech Blog",
  url: buildCanonicalUrl('/blog'),
  description: 'Блог про веб-розробку, AI, Vue 3, Firebase, Shopify.',
})

export const generateCollectionPageJsonLd = ({
  path = '/',
  name = "Mud' Tech Blog",
  description = '',
  inLanguage = 'uk-UA',
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url: buildCanonicalUrl(path),
  inLanguage,
})

export const generateAboutPageJsonLd = ({
  path = '/about',
  name = 'Про автора | Mud Tech Blog',
  description = '',
  inLanguage = 'uk-UA',
}) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name,
  description,
  url: buildCanonicalUrl(path),
  inLanguage,
})

export const generatePersonJsonLd = ({
  name = 'Mykola Mud`',
  jobTitle = 'Frontend eCommerce Developer',
  url = buildCanonicalUrl('/about'),
  sameAs = [
    'https://github.com/mudmykola',
    'https://t.me/mudwebdev',
    'https://www.facebook.com/kiber.news',
  ],
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name,
  jobTitle,
  url,
  sameAs,
})

export const generateItemListJsonLd = ({ path = '/', items = [], itemType = 'ListItem' }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `ItemList: ${buildCanonicalUrl(path)}`,
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': itemType,
    position: index + 1,
    name: item.name,
    url: toAbsoluteUrl(item.url || ''),
  })),
})

export const generateBlogPostJsonLd = article => {
  const canonicalUrl = buildCanonicalUrl(`/blog/${article.handle}`)
  const imageUrl = toAbsoluteUrl(article.image?.url || '/pwa-512x512.png')
  const keywords = Array.isArray(article.tags) ? article.tags.filter(Boolean).join(', ') : ''

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || stripHtml(article.contentHtml).slice(0, 160),
    image: imageUrl ? [imageUrl] : [],
    author: {
      '@type': 'Person',
      name: article.authorV2?.name || "Mud' Tech Blog",
    },
    publisher: {
      '@type': 'Organization',
      name: "Mud' Tech Blog",
      logo: {
        '@type': 'ImageObject',
        url: buildCanonicalUrl('/favicon.ico'),
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    inLanguage: 'uk-UA',
    keywords,
    articleSection: Array.isArray(article.tags) && article.tags.length ? article.tags[0] : 'Technology',
  }
}

export const generateBreadcrumbJsonLd = article => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Головна',
      item: buildCanonicalUrl('/'),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Блог',
      item: buildCanonicalUrl('/blog'),
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: article.title,
      item: buildCanonicalUrl(`/blog/${article.handle}`),
    },
  ],
})

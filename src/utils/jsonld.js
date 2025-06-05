export const generateOrganizationJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mud' Tech Blog",
    "url": window.location.origin,
    "logo": `${window.location.origin}/favicon.ico`,
    "sameAs": [
      "https://www.facebook.com/it.ukrainian",
      "https://t.me/mudwebdev",
      "https://github.com/mudmykola"
    ]
  })
  
  export const generateWebSiteJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mud' Tech Blog",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  })
  
  export const generateBlogIndexJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Mud' Tech Blog",
    "url": `${window.location.origin}/blog`,
    "description": "Блог про веб-розробку, AI, Vue 3, Firebase, Shopify."
  })
  
  export const generateBlogPostJsonLd = (article) => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt || article.contentHtml.replace(/<[^>]*>/g, "").slice(0, 160),
    "image": article.image?.url || "",
    "author": {
      "@type": "Person",
      "name": article.authorV2?.name || "Mud' Tech Blog"
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${window.location.origin}/blog/${article.handle}`
    }
  })
  
  export const generateBreadcrumbJsonLd = (article) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Головна",
        "item": `${window.location.origin}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Блог",
        "item": `${window.location.origin}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${window.location.origin}/blog/${article.handle}`
      }
    ]
  })
  
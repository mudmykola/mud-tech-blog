export function useMetaTags() {
  const metaDescription =
    'Практичний техноблог українською про frontend-розробку, Vue, eCommerce, AI та продуктивність. Публікуємо покрокові гайди, огляди інструментів і робочі рішення для реальних проєктів.'

  let metaTag = document.querySelector('meta[name="description"]')
  if (!metaTag) {
    metaTag = document.createElement('meta')
    metaTag.name = 'description'
    document.head.appendChild(metaTag)
  }
  metaTag.content = metaDescription

  document.title = 'Технологічний блог про Frontend, AI та eCommerce | Mud Tech Blog'
}

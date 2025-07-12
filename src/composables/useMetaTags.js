export function useMetaTags() {
  const metaDescription =
    "Ласкаво просимо до Mud' Tech Blog! Дізнайтеся більше про останні технології, корисні статті, та новини. Переглядайте топові матеріали та отримуйте свіжі ідеї щодня."

  let metaTag = document.querySelector('meta[name="description"]')
  if (!metaTag) {
    metaTag = document.createElement('meta')
    metaTag.name = 'description'
    document.head.appendChild(metaTag)
  }
  metaTag.content = metaDescription

  document.title = 'Головна | Дізнайтеся більше про останні технології'
}

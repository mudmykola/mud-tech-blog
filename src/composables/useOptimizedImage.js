import { computed } from 'vue'

export function useOptimizedImage(rawUrl, alt = 'Image', maxWidth = 900) {
  if (!rawUrl) {
    return {
      attributes: {
        src: '',
        alt,
        title: alt,
        loading: 'lazy',
        decoding: 'async',
      },
    }
  }

  const baseUrl = rawUrl.split('?')[0]
  const originalParams = rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : ''

  const tryWebp = !baseUrl.endsWith('.gif')

  const make = (w, fmt) => {
    if (!tryWebp && fmt === 'webp') return `${baseUrl}${originalParams}`
    return `${baseUrl}?width=${w}&format=${fmt}`
  }

  const src = computed(() => (tryWebp ? make(maxWidth, 'webp') : `${baseUrl}${originalParams}`))

  const srcset = computed(() => {
    if (!tryWebp) {
      return `${baseUrl}${originalParams} ${maxWidth}w`
    }
    return `
      ${make(360, 'webp')} 360w,
      ${make(560, 'webp')} 560w,
      ${make(700, 'webp')} 700w,
      ${make(maxWidth, 'webp')} ${maxWidth}w
    `.trim()
  })

  const sizes = `(max-width: 600px) 360px,
                 (max-width: 900px) 560px,
                 (max-width: 1200px) 700px,
                 ${maxWidth}px`

  return {
    attributes: {
      src: src.value,
      srcset: srcset.value,
      sizes,
      alt,
      title: alt,
      loading: 'lazy',
      decoding: 'async',
      style: 'width:100%;height:auto;display:block;border-radius:inherit;',
    },
  }
}

import { computed } from 'vue'

export function useOptimizedImage(rawUrl, alt = 'Image', maxWidth = 900, options = {}) {
  const {
    loading = 'lazy',
    decoding = 'async',
    fetchpriority,
    sizes: customSizes,
    style = 'width:100%;height:auto;display:block;border-radius:inherit;',
  } = options

  if (!rawUrl) {
    return {
      attributes: {
        src: '',
        alt,
        title: alt,
        loading,
        decoding,
        ...(fetchpriority ? { fetchpriority } : {}),
      },
    }
  }

  const baseUrl = rawUrl.split('?')[0]
  const originalParams = rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : ''

  const tryWebp = !baseUrl.endsWith('.gif')
  const buildResponsiveWidths = width => {
    const predefined = [360, 560, 760, 960, 1200, 1600]
    const limited = predefined.filter(value => value <= width)
    return [...new Set([...limited, width])].sort((a, b) => a - b)
  }
  const responsiveWidths = buildResponsiveWidths(maxWidth)

  const make = (w, fmt) => {
    if (!tryWebp && fmt === 'webp') return `${baseUrl}${originalParams}`
    return `${baseUrl}?width=${w}&format=${fmt}`
  }

  const src = computed(() => {
    if (!tryWebp) return `${baseUrl}${originalParams}`
    const bestWidth = responsiveWidths[responsiveWidths.length - 1] || maxWidth
    return make(bestWidth, 'webp')
  })

  const srcset = computed(() => {
    if (!tryWebp) {
      return `${baseUrl}${originalParams} ${maxWidth}w`
    }
    return responsiveWidths.map(width => `${make(width, 'webp')} ${width}w`).join(', ')
  })

  const sizes =
    customSizes ||
    `(max-width: 600px) 360px,
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
      loading,
      decoding,
      ...(fetchpriority ? { fetchpriority } : {}),
      style,
    },
  }
}

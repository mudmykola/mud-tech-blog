import { computed, toValue } from 'vue'

export function useOptimizedImage(rawUrl, alt = 'Image', maxWidth = 900, options = {}) {
  const {
    loading = 'lazy',
    decoding = 'async',
    fetchpriority,
    sizes: customSizes,
    style = 'width:100%;height:auto;display:block;border-radius:inherit;',
  } = options

  return {
    attributes: computed(() => {
      const source = toValue(rawUrl) || ''
      const imageAlt = toValue(alt) || 'Image'
      const width = toValue(maxWidth) || 900
      const commonAttributes = {
        alt: imageAlt,
        title: imageAlt,
        loading,
        decoding,
        ...(fetchpriority ? { fetchpriority } : {}),
      }

      if (!source) return { src: '', ...commonAttributes }

      const baseUrl = source.split('?')[0]
      const originalParams = source.includes('?') ? '?' + source.split('?')[1] : ''
      const tryWebp = !baseUrl.toLowerCase().endsWith('.gif')
      const responsiveWidths = [360, 560, 760, 960, 1200, 1600]
        .filter(value => value <= width)
        .concat(width)
        .filter((value, index, values) => values.indexOf(value) === index)
        .sort((a, b) => a - b)
      const make = (imageWidth, format) =>
        !tryWebp && format === 'webp'
          ? `${baseUrl}${originalParams}`
          : `${baseUrl}?width=${imageWidth}&format=${format}`
      const bestWidth = responsiveWidths.at(-1) || width
      const sizes =
        customSizes ||
        `(max-width: 600px) 360px,\n     (max-width: 900px) 560px,\n     (max-width: 1200px) 700px,\n     ${width}px`

      return {
        src: tryWebp ? make(bestWidth, 'webp') : `${baseUrl}${originalParams}`,
        srcset: tryWebp
          ? responsiveWidths
              .map(imageWidth => `${make(imageWidth, 'webp')} ${imageWidth}w`)
              .join(', ')
          : `${baseUrl}${originalParams} ${width}w`,
        sizes,
        ...commonAttributes,
        style,
      }
    }),
  }
}

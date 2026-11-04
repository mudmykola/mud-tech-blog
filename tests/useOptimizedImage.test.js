import test from 'node:test'
import assert from 'node:assert/strict'
import { computed, ref } from 'vue'
import { useOptimizedImage } from '../src/composables/useOptimizedImage.js'

test('useOptimizedImage: creates webp variants for non-gif image', () => {
  const image = useOptimizedImage('https://cdn.example.dev/photo.jpg', 'Photo', 900)

  assert.equal(
    image.attributes.value.src,
    'https://cdn.example.dev/photo.jpg?width=900&format=webp'
  )
  assert.match(image.attributes.value.srcset, /360w/)
  assert.match(image.attributes.value.srcset, /900w/)
})

test('useOptimizedImage: keeps gif unchanged', () => {
  const image = useOptimizedImage('https://cdn.example.dev/anim.gif?v=1', 'Gif', 900)

  assert.equal(image.attributes.value.src, 'https://cdn.example.dev/anim.gif?v=1')
  assert.equal(image.attributes.value.srcset, 'https://cdn.example.dev/anim.gif?v=1 900w')
})

test('useOptimizedImage: returns fallback attrs for empty url', () => {
  const image = useOptimizedImage('', 'Fallback', 900)

  assert.equal(image.attributes.value.src, '')
  assert.equal(image.attributes.value.alt, 'Fallback')
  assert.equal(image.attributes.value.loading, 'lazy')
})

test('useOptimizedImage: reacts when article image and title change', () => {
  const article = ref({ image: 'https://cdn.example.dev/first.jpg', title: 'First' })
  const attrs = computed(
    () =>
      useOptimizedImage(
        () => article.value.image,
        () => article.value.title,
        1200
      ).attributes.value
  )

  assert.equal(attrs.value.src, 'https://cdn.example.dev/first.jpg?width=1200&format=webp')
  assert.equal(attrs.value.alt, 'First')

  article.value = { image: 'https://cdn.example.dev/second.jpg', title: 'Second' }

  assert.equal(attrs.value.src, 'https://cdn.example.dev/second.jpg?width=1200&format=webp')
  assert.equal(attrs.value.alt, 'Second')
})

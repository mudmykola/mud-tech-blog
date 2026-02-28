import test from 'node:test'
import assert from 'node:assert/strict'
import { useOptimizedImage } from '../src/composables/useOptimizedImage.js'

test('useOptimizedImage: creates webp variants for non-gif image', () => {
  const image = useOptimizedImage('https://cdn.example.dev/photo.jpg', 'Photo', 900)

  assert.equal(image.attributes.src, 'https://cdn.example.dev/photo.jpg?width=900&format=webp')
  assert.match(image.attributes.srcset, /360w/)
  assert.match(image.attributes.srcset, /900w/)
})

test('useOptimizedImage: keeps gif unchanged', () => {
  const image = useOptimizedImage('https://cdn.example.dev/anim.gif?v=1', 'Gif', 900)

  assert.equal(image.attributes.src, 'https://cdn.example.dev/anim.gif?v=1')
  assert.equal(image.attributes.srcset, 'https://cdn.example.dev/anim.gif?v=1 900w')
})

test('useOptimizedImage: returns fallback attrs for empty url', () => {
  const image = useOptimizedImage('', 'Fallback', 900)

  assert.equal(image.attributes.src, '')
  assert.equal(image.attributes.alt, 'Fallback')
  assert.equal(image.attributes.loading, 'lazy')
})

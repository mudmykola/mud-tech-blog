import test from 'node:test'
import assert from 'node:assert/strict'
import {
  generateBlogPostJsonLd,
  generateBreadcrumbJsonLd,
  generateBlogIndexJsonLd,
} from '../src/utils/jsonld.js'

globalThis.window = { location: { origin: 'https://example.dev' } }

test('generateBlogPostJsonLd: builds valid schema fields', () => {
  const article = {
    title: 'Test Title',
    excerpt: 'Short summary',
    contentHtml: '<p>Hello world</p>',
    handle: 'test-title',
    publishedAt: '2026-02-28T01:00:00+02:00',
    updatedAt: '2026-02-28T02:00:00+02:00',
    authorV2: { name: 'Mykola' },
    image: { url: 'https://example.dev/image.jpg' },
    tags: ['Vue', 'SEO'],
  }

  const schema = generateBlogPostJsonLd(article)

  assert.equal(schema['@type'], 'BlogPosting')
  assert.equal(schema.headline, 'Test Title')
  assert.equal(schema.mainEntityOfPage['@id'], 'https://example.dev/blog/test-title')
  assert.equal(schema.author.name, 'Mykola')
  assert.equal(schema.publisher['@type'], 'Organization')
  assert.equal(schema.publisher.logo.url, 'https://example.dev/favicon.ico')
  assert.equal(schema.url, 'https://example.dev/blog/test-title')
  assert.equal(schema.inLanguage, 'uk-UA')
  assert.equal(schema.keywords, 'Vue, SEO')
  assert.equal(schema.image[0], 'https://example.dev/image.jpg')
})

test('generateBreadcrumbJsonLd: contains 3 ordered breadcrumb items', () => {
  const article = { title: 'Post', handle: 'post' }
  const schema = generateBreadcrumbJsonLd(article)

  assert.equal(schema['@type'], 'BreadcrumbList')
  assert.equal(schema.itemListElement.length, 3)
  assert.equal(schema.itemListElement[0].position, 1)
  assert.equal(schema.itemListElement[2].item, 'https://example.dev/blog/post')
})

test('generateBlogIndexJsonLd: points to /blog route', () => {
  const schema = generateBlogIndexJsonLd()

  assert.equal(schema['@type'], 'Blog')
  assert.equal(schema.url, 'https://example.dev/blog')
})

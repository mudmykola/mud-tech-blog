import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSitemapEntries, renderSitemapXml } from '../src/utils/sitemap.js'

test('buildSitemapEntries: merges static routes and article routes', () => {
  const entries = buildSitemapEntries({
    origin: 'https://example.dev',
    staticRoutes: [{ path: '/', lastmod: '2026-03-01T00:00:00.000Z', changefreq: 'daily', priority: 1.0 }],
    articles: [{ handle: 'hello-world', publishedAt: '2026-02-28T12:00:00.000Z' }],
  })

  assert.equal(entries.length, 2)
  assert.equal(entries[0].loc, 'https://example.dev/')
  assert.equal(entries[1].loc, 'https://example.dev/blog/hello-world')
  assert.equal(entries[1].changefreq, 'weekly')
  assert.equal(entries[1].priority, 0.8)
})

test('renderSitemapXml: produces valid xml with escaped values', () => {
  const xml = renderSitemapXml([
    {
      loc: 'https://example.dev/blog/a&b',
      lastmod: '2026-03-01T00:00:00.000Z',
      changefreq: 'weekly',
      priority: 0.8,
    },
  ])

  assert.match(xml, /<\?xml version="1.0" encoding="UTF-8"\?>/)
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
  assert.match(xml, /<loc>https:\/\/example\.dev\/blog\/a&amp;b<\/loc>/)
  assert.match(xml, /<lastmod>2026-03-01T00:00:00\.000Z<\/lastmod>/)
  assert.match(xml, /<changefreq>weekly<\/changefreq>/)
  assert.match(xml, /<priority>0\.8<\/priority>/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { getPageViewRoute } from '../src/analytics/pageViewRoute.js'

test('page view routing: filters on the blog do not create page views', () => {
  assert.equal(
    getPageViewRoute(
      { name: 'blog', path: '/blog', fullPath: '/blog?q=private+phrase' },
      { path: '/blog' }
    ),
    null
  )
})

test('page view routing: blog page view excludes filter query values', () => {
  assert.deepEqual(
    getPageViewRoute({ name: 'blog', path: '/blog', fullPath: '/blog?q=vue' }, { path: '/' }),
    { path: '/blog', locationPath: '/blog' }
  )
})

test('page view routing: other routes retain existing full path behavior', () => {
  assert.deepEqual(
    getPageViewRoute(
      { name: 'updates', path: '/updates', fullPath: '/updates?type=fix' },
      { path: '/' }
    ),
    { path: '/updates?type=fix', locationPath: '/updates?type=fix' }
  )
})

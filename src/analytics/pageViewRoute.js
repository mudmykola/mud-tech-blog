export const getPageViewRoute = (to, from) => {
  if (to.name === 'blog' && from?.path === to.path) return null

  const route = to.name === 'blog' ? to.path : to.fullPath
  return { path: route, locationPath: route }
}

import { normalizeTopic } from './blogTopicDiscovery.js'

export const FOLLOWED_TOPICS_KEY = 'mud-tech-blog:followed-topics'

export const normalizeFollowedTopics = topics => {
  if (!Array.isArray(topics)) return []
  const normalized = new Map()

  topics.forEach(topic => {
    const label = String(topic ?? '').trim()
    const key = normalizeTopic(label)
    if (key && !normalized.has(key)) normalized.set(key, label)
  })

  return [...normalized.values()]
}

export const toggleFollowedTopic = (topics, topic) => {
  const normalized = normalizeFollowedTopics(topics)
  const key = normalizeTopic(topic)
  if (!key) return normalized

  return normalized.some(item => normalizeTopic(item) === key)
    ? normalized.filter(item => normalizeTopic(item) !== key)
    : normalizeFollowedTopics([...normalized, topic])
}

const getStorage = () => {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

export const getFollowedTopics = () => {
  try {
    const stored = getStorage()?.getItem(FOLLOWED_TOPICS_KEY)
    return normalizeFollowedTopics(JSON.parse(stored || '[]'))
  } catch {
    return []
  }
}

export const saveFollowedTopics = topics => {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(FOLLOWED_TOPICS_KEY, JSON.stringify(normalizeFollowedTopics(topics)))
    return true
  } catch {
    return false
  }
}

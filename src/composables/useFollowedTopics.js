import { computed, onMounted, onUnmounted, ref } from 'vue'
import { normalizeTopic } from '@/utils/blogTopicDiscovery.js'
import {
  FOLLOWED_TOPICS_KEY,
  getFollowedTopics,
  saveFollowedTopics,
  toggleFollowedTopic,
} from '@/utils/followedTopicsState.js'

const followedTopics = ref([])
let mountedConsumers = 0

const syncFollowedTopics = () => {
  followedTopics.value = getFollowedTopics()
}

const handleStorageChange = event => {
  if (event.key === FOLLOWED_TOPICS_KEY || event.key === null) syncFollowedTopics()
}

export const useFollowedTopics = () => {
  onMounted(() => {
    mountedConsumers += 1
    syncFollowedTopics()
    if (mountedConsumers === 1) window.addEventListener('storage', handleStorageChange)
  })

  onUnmounted(() => {
    mountedConsumers = Math.max(0, mountedConsumers - 1)
    if (mountedConsumers === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange)
    }
  })

  const followedTopicKeys = computed(() => new Set(followedTopics.value.map(normalizeTopic)))
  const isFollowedTopic = topic => followedTopicKeys.value.has(normalizeTopic(topic))

  const toggleTopic = topic => {
    followedTopics.value = toggleFollowedTopic(followedTopics.value, topic)
    saveFollowedTopics(followedTopics.value)
  }

  return { followedTopics, isFollowedTopic, toggleFollowedTopic: toggleTopic, syncFollowedTopics }
}

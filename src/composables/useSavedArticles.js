import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  getSavedArticleHandles,
  SAVED_ARTICLES_KEY,
  saveArticleHandles,
  toggleSavedArticleHandle,
} from '@/utils/homeReadingState'

const savedArticleHandles = ref([])
const savedArticleCount = computed(() => savedArticleHandles.value.length)
const savedLibraryOpen = ref(false)
let mountedConsumers = 0

const syncSavedArticleHandles = () => {
  savedArticleHandles.value = getSavedArticleHandles()
}

const handleStorageChange = event => {
  if (event.key === SAVED_ARTICLES_KEY || event.key === null) syncSavedArticleHandles()
}

export const useSavedArticles = () => {
  onMounted(() => {
    mountedConsumers += 1
    syncSavedArticleHandles()
    if (mountedConsumers === 1) window.addEventListener('storage', handleStorageChange)
  })

  onUnmounted(() => {
    mountedConsumers = Math.max(0, mountedConsumers - 1)
    if (mountedConsumers === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange)
    }
  })

  const updateSavedArticleHandles = handles => {
    savedArticleHandles.value = handles
    saveArticleHandles(handles)
  }

  const toggleSavedArticle = handle => {
    updateSavedArticleHandles(toggleSavedArticleHandle(savedArticleHandles.value, handle))
  }

  const removeSavedArticle = handle => {
    updateSavedArticleHandles(
      savedArticleHandles.value.filter(savedHandle => savedHandle !== handle)
    )
  }

  const clearSavedArticles = () => updateSavedArticleHandles([])

  return {
    savedArticleHandles,
    savedArticleCount,
    savedLibraryOpen,
    openSavedLibrary: () => {
      savedLibraryOpen.value = true
    },
    closeSavedLibrary: () => {
      savedLibraryOpen.value = false
    },
    toggleSavedArticle,
    removeSavedArticle,
    clearSavedArticles,
    syncSavedArticleHandles,
  }
}

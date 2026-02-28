<script setup>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import { devLogEntries } from '@/data/dev-log.js'

  const PAGE_SIZE = 6
  const FILTERS = [
    { key: 'All', label: 'Усі' },
    { key: 'Feature', label: 'Фіча' },
    { key: 'Improvement', label: 'Покращення' },
    { key: 'Fix', label: 'Виправлення' },
    { key: 'Refactor', label: 'Рефакторинг' },
  ]
  const TYPE_LABELS = {
    Feature: 'Фіча',
    Improvement: 'Покращення',
    Fix: 'Виправлення',
    Refactor: 'Рефакторинг',
  }

  const activeFilter = ref('All')
  const currentPage = ref(1)

  const sortedEntries = computed(() =>
    [...devLogEntries].sort((a, b) => new Date(b.date) - new Date(a.date))
  )

  const counters = computed(() => {
    const base = {
      All: sortedEntries.value.length,
      Feature: 0,
      Improvement: 0,
      Fix: 0,
      Refactor: 0,
    }

    sortedEntries.value.forEach(entry => {
      if (base[entry.type] !== undefined) base[entry.type] += 1
    })

    return base
  })

  const filteredEntries = computed(() =>
    activeFilter.value === 'All'
      ? sortedEntries.value
      : sortedEntries.value.filter(entry => entry.type === activeFilter.value)
  )

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredEntries.value.length / PAGE_SIZE)))
  const pagedEntries = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredEntries.value.slice(start, start + PAGE_SIZE)
  })

  const activeId = ref(null)
  const isMobile = ref(false)
  const mobileDetailOpen = ref(false)
  let mobileQuery

  const selectedEntry = computed(() => {
    const list = pagedEntries.value
    if (!list.length) return null
    return list.find(item => item.id === activeId.value) || list[0]
  })

  const selectEntry = entryId => {
    activeId.value = entryId
    if (isMobile.value) mobileDetailOpen.value = true
  }

  const formatDate = value =>
    new Date(value).toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const syncMobileState = event => {
    const matches = event?.matches ?? window.matchMedia('(max-width: 900px)').matches
    isMobile.value = matches
    if (!matches) mobileDetailOpen.value = false
  }

  const getTypeLabel = type => TYPE_LABELS[type] || type

  const goPrevPage = () => {
    if (currentPage.value > 1) currentPage.value -= 1
  }

  const goNextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value += 1
  }

  watch(activeFilter, () => {
    currentPage.value = 1
    activeId.value = null
    mobileDetailOpen.value = false
  })

  watch(currentPage, () => {
    activeId.value = null
    mobileDetailOpen.value = false
  })

  watch(
    filteredEntries,
    () => {
      if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    },
    { immediate: true }
  )

  onMounted(() => {
    mobileQuery = window.matchMedia('(max-width: 900px)')
    syncMobileState(mobileQuery)
    mobileQuery.addEventListener('change', syncMobileState)
  })

  onBeforeUnmount(() => {
    mobileQuery?.removeEventListener('change', syncMobileState)
  })
</script>

<template>
  <DefaultLayout>
    <section class="mm-updates">
      <header class="mm-updates__head">
        <h1>
          <v-icon icon="mdi-history" size="26" />
          Журнал змін
        </h1>
        <p>Фікси, покращення та нові фічі в одному керованому списку.</p>
      </header>

      <div class="mm-updates__filters">
        <button
          v-for="filter in FILTERS"
          :key="filter.key"
          class="mm-updates-filter"
          :class="{ 'mm-updates-filter--active': activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          <span>{{ filter.label }}</span>
          <strong>{{ counters[filter.key] }}</strong>
        </button>
      </div>

      <div class="mm-updates__layout">
        <aside class="mm-updates__list">
          <button
            v-for="entry in pagedEntries"
            :key="entry.id"
            class="mm-update-item"
            :class="{ 'mm-update-item--active': selectedEntry?.id === entry.id }"
            @click="selectEntry(entry.id)"
          >
            <div class="mm-update-item__top">
              <span class="mm-update-item__type">{{ getTypeLabel(entry.type) }}</span>
              <time>{{ formatDate(entry.date) }}</time>
            </div>
            <h2>{{ entry.title }}</h2>
            <p>{{ entry.summary }}</p>
            <span v-if="isMobile" class="mm-update-item__action">
              Відкрити деталі
              <v-icon icon="mdi-chevron-right" size="14" />
            </span>
          </button>

          <div v-if="!filteredEntries.length" class="mm-updates__empty">
            Немає записів для цього фільтра.
          </div>

          <div v-if="filteredEntries.length > PAGE_SIZE" class="mm-updates__pager">
            <button
              class="mm-updates__pager-btn"
              :disabled="currentPage === 1"
              @click="goPrevPage"
            >
              <v-icon icon="mdi-chevron-left" size="16" />
              Попередні
            </button>

            <span class="mm-updates__pager-status">{{ currentPage }} / {{ totalPages }}</span>

            <button
              class="mm-updates__pager-btn"
              :disabled="currentPage === totalPages"
              @click="goNextPage"
            >
              Наступні
              <v-icon icon="mdi-chevron-right" size="16" />
            </button>
          </div>
        </aside>

        <article v-if="selectedEntry" class="mm-update-detail mm-update-detail--desktop">
          <div class="mm-update-detail__top">
            <span class="mm-update-detail__type">{{ getTypeLabel(selectedEntry.type) }}</span>
            <time>{{ formatDate(selectedEntry.date) }}</time>
          </div>

          <h2>{{ selectedEntry.title }}</h2>
          <p class="mm-update-detail__summary">{{ selectedEntry.summary }}</p>

          <ul class="mm-update-detail__list" v-if="selectedEntry.details?.length">
            <li v-for="point in selectedEntry.details" :key="point">
              {{ point }}
            </li>
          </ul>

          <div class="mm-update-detail__meta">
            <span>
              <v-icon icon="mdi-account-circle-outline" size="14" />
              {{ selectedEntry.author }}
            </span>
            <span>
              <v-icon icon="mdi-routes" size="14" />
              {{ selectedEntry.route }}
            </span>
            <span>
              <v-icon icon="mdi-source-branch" size="14" />
              {{ selectedEntry.githubIssue }}
            </span>
          </div>
        </article>
      </div>

      <v-dialog v-model="mobileDetailOpen" max-width="760" class="mm-updates-dialog">
        <article v-if="selectedEntry" class="mm-update-detail mm-updates-dialog__card">
          <div class="mm-update-detail__top">
            <span class="mm-update-detail__type">{{ getTypeLabel(selectedEntry.type) }}</span>
            <time>{{ formatDate(selectedEntry.date) }}</time>
          </div>

          <h2>{{ selectedEntry.title }}</h2>
          <p class="mm-update-detail__summary">{{ selectedEntry.summary }}</p>

          <ul class="mm-update-detail__list" v-if="selectedEntry.details?.length">
            <li v-for="point in selectedEntry.details" :key="point">
              {{ point }}
            </li>
          </ul>

          <div class="mm-update-detail__meta">
            <span>
              <v-icon icon="mdi-account-circle-outline" size="14" />
              {{ selectedEntry.author }}
            </span>
            <span>
              <v-icon icon="mdi-routes" size="14" />
              {{ selectedEntry.route }}
            </span>
            <span>
              <v-icon icon="mdi-source-branch" size="14" />
              {{ selectedEntry.githubIssue }}
            </span>
          </div>
        </article>
      </v-dialog>
    </section>
  </DefaultLayout>
</template>

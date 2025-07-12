<script setup>
  const props = defineProps({
    searchQuery: String,
    sortBy: String,
  })

  const emit = defineEmits(['update:searchQuery', 'update:sortBy'])

  const sortOptions = [
    { value: 'date_desc', label: '📅 Новіші' },
    { value: 'date_asc', label: '📅 Старіші' },
    { value: 'title_asc', label: '🔠 А-Я' },
    { value: 'title_desc', label: '🔠 Я-А' },
  ]
</script>

<template>
  <div class="filters">
    <input
      type="text"
      :value="searchQuery"
      @input="$emit('update:searchQuery', $event.target.value)"
      placeholder="🔍 Пошук статей..."
      class="search-input"
    />

    <select
      :value="sortBy"
      @change="$emit('update:sortBy', $event.target.value)"
      class="sort-select"
    >
      <option v-for="option in sortOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

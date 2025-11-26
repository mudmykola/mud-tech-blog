<script setup>
  const props = defineProps({
    searchQuery: String,
    sortBy: String,
  })

  const emit = defineEmits(['update:searchQuery', 'update:sortBy'])

  const sortOptions = [
    { value: 'date_desc', label: 'Новіші', icon: 'mdi-calendar-arrow-right' },
    { value: 'date_asc', label: 'Старіші', icon: 'mdi-calendar-arrow-left' },
    { value: 'title_asc', label: 'А–Я', icon: 'mdi-sort-alphabetical-ascending' },
    { value: 'title_desc', label: 'Я–А', icon: 'mdi-sort-alphabetical-descending' },
  ]
</script>

<template>
  <div class="mm-filters">
    <v-text-field
      :model-value="searchQuery"
      class="mm-search"
      density="comfortable"
      hide-details
      placeholder="Пошук статей..."
      prepend-inner-icon="mdi-magnify"
      rounded="lg"
      variant="outlined"
      @update:model-value="emit('update:searchQuery', $event)"
    />

    <v-select
      :items="sortOptions"
      :model-value="sortBy"
      class="mm-sort"
      density="comfortable"
      hide-details
      item-title="label"
      item-value="value"
      rounded="lg"
      variant="outlined"
      @update:model-value="emit('update:sortBy', $event)"
    >
      <template #item="{ props, item }">
        <v-list-item v-bind="props">
          <v-icon :icon="item.raw.icon" class="mr-2" size="18" />
          {{ item.raw.label }}
        </v-list-item>
      </template>

      <template #selection="{ item }">
        <v-icon :icon="item.raw.icon" class="mr-1" size="18" />
        {{ item.raw.label }}
      </template>
    </v-select>
  </div>
</template>

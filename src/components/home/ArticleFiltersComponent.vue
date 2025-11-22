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
      @update:model-value="emit('update:searchQuery', $event)"
      prepend-inner-icon="mdi-magnify"
      placeholder="Пошук статей..."
      variant="outlined"
      rounded="lg"
      hide-details
      density="comfortable"
      class="mm-search"
    />

    <v-select
      :model-value="sortBy"
      @update:model-value="emit('update:sortBy', $event)"
      :items="sortOptions"
      item-title="label"
      item-value="value"
      variant="outlined"
      rounded="lg"
      hide-details
      density="comfortable"
      class="mm-sort"
    >
      <template #item="{ props, item }">
        <v-list-item v-bind="props">
          <v-icon :icon="item.raw.icon" size="18" class="mr-2" />
          {{ item.raw.label }}
        </v-list-item>
      </template>

      <template #selection="{ item }">
        <v-icon :icon="item.raw.icon" size="18" class="mr-1" />
        {{ item.raw.label }}
      </template>
    </v-select>
  </div>
</template>

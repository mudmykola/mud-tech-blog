<template>
  <DefaultLayout>
    <div class="blog-container">
      <!-- 📜 Ліва частина: Список статей -->
      <div class="blog-list">
        <h1>📝 Блог | Залишайтеся в курсі актуальних технологій</h1>
        <p class="subtitle">Всі технологічні статті та новини</p>

        <p v-if="loading" class="loading">Завантаження...</p>
        <p v-if="!loading && !paginatedArticles.length" class="no-articles">Статті не знайдено.</p>

        <div v-if="paginatedArticles.length" class="articles">
          <ArticleCard v-for="article in paginatedArticles" :key="article.handle" :article="article" />
        </div>

        <!-- 📄 Пагінація -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="currentPage === 1">← Попередня</button>
          <span>Сторінка {{ currentPage }} з {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Наступна →</button>
        </div>
      </div>

      <!-- 📱 Фіксований мобільний фільтр -->
      <button class="mobile-filter-btn" @click="toggleMobileFilter">📌 Фільтр</button>
      <div class="mobile-filter-overlay" v-if="isMobileFilterOpen" @click="toggleMobileFilter"></div>

      <div class="mobile-filter" :class="{ open: isMobileFilterOpen }">
        <button class="close-filter" @click="toggleMobileFilter">✖</button>
        <h2>📌 Фільтр</h2>
        <div class="tags-container">
          <button v-for="tag in tags" :key="tag" @click="toggleTagFilter(tag)" :class="{ active: selectedTag === tag }">
            {{ tag }}
          </button>
          <button v-if="selectedTag" @click="resetFilter" class="reset-filter">Очистити</button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getBlogArticles } from '@/services/shopifyApi';
import ArticleCard from '@/components/article/ArticleCardComponent.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const articles = ref([]);
const loading = ref(true);
const selectedTag = ref(null);
const isMobileFilterOpen = ref(false);
const currentPage = ref(1);
const itemsPerPage = 8; // 8 статей на сторінку

onMounted(async () => {
  articles.value = await getBlogArticles();
  loading.value = false;

  const metaDescription = "Дізнайтеся більше про найновіші статті та новини у Mud' Tech Blog. Залишайтеся в курсі актуальних технологій та отримуйте корисні поради й аналітику...";

  // Встановлюємо мета-опис
  let metaTag = document.querySelector('meta[name="description"]');
  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.name = "description";
    document.head.appendChild(metaTag);
  }
  metaTag.content = metaDescription;

  // Оновлюємо заголовок вкладки
  document.title = "Блог | Дізнайтеся більше про найновіші статті у Mud' Tech Blog...";
});



// Отримуємо унікальні теги
const tags = computed(() => {
  const allTags = articles.value.flatMap(article => article.tags || []);
  return [...new Set(allTags)];
});

// Фільтровані та відсортовані статті (найновіші першими)
const filteredArticles = computed(() => {
  let filtered = [...articles.value].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  if (selectedTag.value) {
    filtered = filtered.filter(article => article.tags.includes(selectedTag.value));
  }
  return filtered;
});

// Загальна кількість сторінок
const totalPages = computed(() => Math.ceil(filteredArticles.value.length / itemsPerPage));

// Отримання статей для поточної сторінки
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredArticles.value.slice(start, start + itemsPerPage);
});

// Перемикання сторінок
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Вибір тегу
const toggleTagFilter = (tag) => {
  selectedTag.value = selectedTag.value === tag ? null : tag;
  currentPage.value = 1; // Повертаємося на першу сторінку
};

// Скидання фільтра
const resetFilter = () => {
  selectedTag.value = null;
  currentPage.value = 1;
};

// Відкриття/закриття мобільного фільтра
const toggleMobileFilter = () => {
  isMobileFilterOpen.value = !isMobileFilterOpen.value;
};
</script>

<style scoped>
.blog-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
}

.blog-list {
  width: 100%;
  max-width: 1600px;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: var(--primary-light);
  text-shadow: 0px 4px 10px rgba(255, 255, 100, 0.5);
}

.subtitle {
  font-size: 1.2rem;
  color: var(--primary);
  margin-bottom: 20px;
}

.loading, .no-articles {
  font-size: 1.1rem;
  color: var(--primary-light);
  margin: 20px 0;
}

/* 📜 Відображення статей */
.articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

@media (min-width: 1024px) {
  .articles {
    grid-template-columns: repeat(4, 1fr); /* 4 колонки на десктопі */
  }
}

/* 📄 Пагінація */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  background: var(--primary);
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.pagination button:disabled {
  background: gray;
  cursor: not-allowed;
}

.pagination span {
  font-size: 1.2rem;
  color: var(--primary-light);
}

/* 📱 Мобільна кнопка фільтра */
.mobile-filter-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--primary);
  color: white;
  padding: 14px 18px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  border: none;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

.mobile-filter-btn:hover {
  transform: scale(1.1);
  box-shadow: 0px 6px 15px rgba(255, 255, 100, 0.5);
}

/* 📱 Фільтр */
.mobile-filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
}

.mobile-filter {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  background: var(--primary-dark);
  padding: 20px;
  text-align: center;
  z-index: 101;
  transition: bottom 0.3s ease-in-out;
}

.mobile-filter.open {
  bottom: 0;
}

.close-filter {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.tags-container button {
  padding: 10px 15px;
  border: none;
  background: var(--primary);
  color: var(--bg-dark);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s, transform 0.2s;
}
</style>

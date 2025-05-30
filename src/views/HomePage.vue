<template>
  <DefaultLayout>
    <div class="home">

      <div class="header">
        <h1>Mud' Tech Blog</h1>
        <p class="subtitle">Читайте останні технологічні статті та новини!</p>
      </div>

      <!-- 🔍 Поле пошуку та сортування -->
      <div class="filters">
        <input type="text" v-model="searchQuery" placeholder="🔍 Пошук статей..." class="search-input" />

        <select v-model="sortBy" class="sort-select">
          <option value="date_desc">📅 Новіші</option>
          <option value="date_asc">📅 Старіші</option>
          <option value="title_asc">🔠 А-Я</option>
          <option value="title_desc">🔠 Я-А</option>
        </select>
      </div>

      <p v-if="loading" class="loading">Завантаження статей...</p>
      <p v-if="!loading && !filteredArticles.length" class="no-articles">Статті не знайдено.</p>
      <section class="donation">
        <DonationSection/>
      </section>
      <!-- 📜 Відображення 8 статей -->
      <div class="articles-grid">
        <ArticleCard v-for="article in filteredArticles" :key="article.handle" :article="article" />
      </div>

      <router-link to="/blog" class="btn">Переглянути всі статті</router-link>
    </div>
  </DefaultLayout>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {getBlogArticles} from '@/services/shopifyApi';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ArticleCard from '@/components/article/ArticleCardComponent.vue';
import DonationSection from "@/components/donation/DonationSection.vue";

const articles = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const sortBy = ref("date_desc");

onMounted(async () => {
  articles.value = await getBlogArticles();
  loading.value = false;

  const metaDescription = "Ласкаво просимо до Mud' Tech Blog! Дізнайтеся більше про останні технології, корисні статті, та новини. Переглядайте топові матеріали та отримуйте свіжі ідеї щодня.";

  // Встановлюємо мета-опис
  let metaTag = document.querySelector('meta[name="description"]');
  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.name = "description";
    document.head.appendChild(metaTag);
  }
  metaTag.content = metaDescription;

  // Оновлюємо заголовок вкладки
  document.title = "📝 Головна | Дізнайтеся більше про останні технології";
});


// Фільтруємо статті за пошуком та сортуємо
const filteredArticles = computed(() => {
  let sorted = [...articles.value];

  // Сортування
  if (sortBy.value === "date_desc") sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  if (sortBy.value === "date_asc") sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
  if (sortBy.value === "title_asc") sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy.value === "title_desc") sorted.sort((a, b) => b.title.localeCompare(a.title));

  // Пошук за заголовком або описом
  return sorted
      .filter(article =>
          article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase()))
      )
      .slice(0, 12); // Виводимо лише 8 статей
});
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
}

.header {
  margin-bottom: 20px;
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
  font-size: 1.2rem;
  color: var(--primary-light);
  margin: 20px 0;
}

/* 🔍 Поле пошуку та сортування */
.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 250px;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background: var(--primary-dark);
  color: var(--text-light);
  text-align: center;
}

.search-input::placeholder {
  color: var(--primary-light);
  opacity: 0.7;
}

.sort-select {
  padding: 10px;
  border-radius: 5px;
  background: var(--primary-dark);
  color: var(--text-light);
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

/* 📜 Відображення статей */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

/* 4 статті у ряд на десктопі */
@media (min-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 🟡 Кнопка перегляду всіх статей */
.btn {
  display: inline-block;
  margin-top: 30px;
  padding: 12px 24px;
  background: var(--primary);
  color: var(--bg-dark);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 6px;
  transition: 0.3s ease-in-out;
  box-shadow: 0px 4px 10px rgba(255, 255, 100, 0.3);
}

.btn:hover {
  background: var(--primary-light);
  transform: scale(1.05);
}
</style>
<template>
  <div class="article-card" v-if="article">
    <span v-if="article.tags?.length" class="article-tag">{{ article.tags[0] }}</span>
    <img v-if="article.image?.url" :src="article.image.url" :alt="article.title" class="article-image" />
    <div class="article-content">
      <h2>{{ article.title }}</h2>
      <p class="excerpt">{{ truncatedExcerpt }}</p>
      <router-link :to="'/blog/' + article.handle" class="read-more">Читати далі</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ article: Object });

// Функція для очищення HTML-контенту та отримання текстового опису
const getPlainText = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

// Генеруємо короткий опис
const truncatedExcerpt = computed(() => {
  const text = props.article.excerpt || getPlainText(props.article.contentHtml);
  if (!text) return "Опис відсутній";
  const words = text.split(" ");
  return words.length > 20 ? words.slice(0, 20).join(" ") + "..." : text;
});


</script>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  background: var(--primary-dark);
  color: var(--text-light);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  box-shadow: 0px 4px 10px rgba(255, 255, 100, 0.2);
  position: relative;
}

.article-card:hover {
  transform: scale(1.03);
  box-shadow: 0px 6px 15px rgba(255, 255, 100, 0.4);
}

/* 🏷 Лейбл тегу */
.article-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--primary);
  color: var(--bg-dark);
  padding: 5px 10px;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.article-image {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 12px;
}

.article-content {
  padding: 10px;
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 8px;
  color: var(--primary-light);
}

.excerpt {
  font-size: 1rem;
  color: var(--text-light);
  opacity: 0.9;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-more {
  display: inline-block;
  padding: 10px 15px;
  background: var(--primary);
  color: var(--bg-dark);
  text-decoration: none;
  font-weight: bold;
  border-radius: 6px;
  transition: 0.3s ease-in-out;
}

.read-more:hover {
  background: var(--primary-light);
  transform: scale(1.05);
}
</style>

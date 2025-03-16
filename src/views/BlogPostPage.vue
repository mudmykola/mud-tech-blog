<template>
  <DefaultLayout>
    <div class="blog-post" v-if="article">
      <!-- 🔗 Хлібні крихти -->
      <nav class="breadcrumbs">
        <router-link to="/">Головна</router-link> ›
        <router-link to="/blog">Блог</router-link> ›
        <span>{{ article.title }}</span>
      </nav>

      <!-- 📝 Заголовок статті -->
      <h1 class="article-title">{{ article.title }}</h1>

      <!-- ℹ️ Інформація про статтю -->
      <div class="article-info">
        <p class="author">
          <strong>✍️ Автор:</strong> {{ article.authorV2?.name || "Невідомий" }}
        </p>
        <p class="date">
          <strong>📅 Опубліковано:</strong> {{ formatDate(article.publishedAt) }}
        </p>
        <p v-if="isUpdated" class="updated">
          🔄 Оновлено: {{ formatDate(article.updatedAt) }}
        </p>
        <p class="tags">
          <strong>🏷️ Теги:</strong> {{ article.tags.join(", ") }}
        </p>
        <p class="reading-time">
          ⏳ Час читання: ~{{ readingTime }} хв
        </p>
      </div>

      <img :src="article.image?.url" v-if="article.image" class="article-image" />

      <!-- 📖 Основний контент статті -->
      <div v-html="article.contentHtml" class="content"></div>

      <!-- 📢 Поширення статті -->
      <div class="share-buttons">
        <button @click="shareOnFacebook">📘 Facebook</button>
        <button @click="shareOnTwitter">🐦 Twitter</button>
        <button @click="shareOnTelegram">✈️ Telegram</button>
        <button @click="copyLink">🔗 Копіювати лінк</button>
      </div>

      <!-- 🔙🔜 Кнопки навігації -->
      <div class="navigation-buttons">
        <button @click="goBack" class="nav-button">← Назад</button>
        <button @click="goNext" class="nav-button" v-if="nextArticle">Вперед →</button>
      </div>
      <div class="comments-section">
        <h2>💬 Коментарі</h2>
        <div id="disqus_thread"></div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBlogArticles } from '@/services/shopifyApi';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const route = useRoute();
const router = useRouter();
const articles = ref([]);
const article = ref(null);

const DISQUS_SHORTNAME = import.meta.env.VITE_DISQUS_SHORTNAME;

onMounted(() => {
  if (!DISQUS_SHORTNAME) {
    console.error("❌ Disqus SHORTNAME не налаштовано!");
    return;
  }

  const script = document.createElement("script");
  script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
  script.setAttribute("data-timestamp", +new Date());
  document.body.appendChild(script);
});

const loadArticle = async () => {
  articles.value = await getBlogArticles();
  article.value = articles.value.find(a => a.handle === route.params.slug);

  if (article.value) {
    updateMetaTags();
  }

  // Прокрутка вгору після завантаження статті
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Оновлення мета-тегів (title та description)
const updateMetaTags = () => {
  if (!article.value) return;

  // Оновлюємо заголовок вкладки браузера
  document.title = `${article.value.title} | Mud' Tech Blog`;

  // Отримуємо текст з contentHtml
  const plainText = article.value.contentHtml.replace(/<[^>]*>/g, "");
  let description = article.value.excerpt || plainText;

  // Обмежуємо довжину опису
  if (description.length > 250) {
    description = description.substring(0, 240) + '...';
  }

  if (description.length < 160) {
    description = description.padEnd(160, ' ');
  }

  // Оновлюємо або додаємо <meta name="description">
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  } else {
    metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = description;
    document.head.appendChild(metaDescription);
  }
};


onMounted(loadArticle);
watch(() => route.params.slug, loadArticle);

const readingTime = computed(() => {
  if (!article.value || !article.value.contentHtml) return 1;
  const words = article.value.contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
});

const isUpdated = computed(() => {
  if (!article.value) return false;
  return article.value.updatedAt && article.value.updatedAt !== article.value.publishedAt;
});

const nextArticle = computed(() => {
  if (!articles.value.length || !article.value) return null;
  const currentIndex = articles.value.findIndex(a => a.handle === article.value.handle);
  return articles.value[currentIndex + 1] || null;
});

const goBack = () => {
  router.go(-1);
};

const goNext = () => {
  if (nextArticle.value) {
    router.push(`/blog/${nextArticle.value.handle}`);
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString("uk-UA");

const shareOnFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, "_blank");
};

const shareOnTwitter = () => {
  window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.value.title}`, "_blank");
};

const shareOnTelegram = () => {
  window.open(`https://t.me/share/url?url=${window.location.href}&text=${article.value.title}`, "_blank");
};

const copyLink = () => {
  const currentPath = `/blog/${article.value.handle}`;
  const baseUrl = window.location.origin;
  const fullUrl = baseUrl + currentPath;

  navigator.clipboard.writeText(fullUrl).then(() => {
    alert("🔗 Лінк скопійовано!");
  }).catch((err) => {
    console.error("❌ Не вдалося скопіювати лінк:", err);
  });
};

</script>



<style scoped>
.comments-section{
  margin-top: 40px;
  h2{
    margin-bottom: 20px;
  }
}
.blog-post {
  max-width: 850px;
  margin: auto;
  padding: 25px;
  background: var(--primary-dark);
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(255, 255, 100, 0.2);
}

/* 🔗 Хлібні крихти */
.breadcrumbs {
  font-size: 0.9rem;
  color: var(--primary-light);
  margin-bottom: 10px;
}

.breadcrumbs a {
  text-decoration: none;
  color: var(--primary);
  transition: color 0.3s;
}

.breadcrumbs a:hover {
  color: var(--primary-light);
}

/* 📝 Заголовок */
.article-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-light);
  text-align: center;
  margin-bottom: 15px;
}

/* ℹ️ Інформація про статтю */
.article-info {
  background: var(--bg-dark);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(255, 255, 100, 0.2);
  margin-bottom: 20px;
}

.article-info p {
  font-size: 1rem;
  color: var(--primary);
  margin-bottom: 8px;
  text-align: center;
}

/* 🔄 Оновлена стаття */
.updated {
  font-size: 1rem;
  color: #ffcc00;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 📖 Контент */
.article-image {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 15px;
}

.content {
  font-size: 1.2rem;
  line-height: 1.7;
}

/* 🔙🔜 Кнопки навігації */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.nav-button {
  padding: 10px 15px;
  background: var(--primary);
  color: var(--bg-dark);
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.nav-button:hover {
  background: var(--primary-light);
  transform: scale(1.05);
}

/* 📢 Кнопки поширення */
.share-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.share-buttons button {
  background: var(--primary);
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: var(--bg-dark);
  transition: 0.3s;
}

.share-buttons button:hover {
  background: var(--primary-light);
}

@media (max-width: 768px) {
  .article-title{
    font-size: 28px;
    line-height: 34px;
  }
  .blog-post {
    padding: 20px;
  }
  .navigation-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

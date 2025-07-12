<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const isMenuOpen = ref(false);
const route = useRoute();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};


const isActive = (path) => {
  return route.path === path;
};

// === Логіка показу/приховання хедера ===
const isHeaderVisible = ref(true);
let lastScrollY = window.scrollY;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    // скрол вниз
    isHeaderVisible.value = false;
  } else {
    // скрол вгору
    isHeaderVisible.value = true;
  }
  lastScrollY = currentScrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav class="navbar" :class="{ hidden: !isHeaderVisible }">
    <div class="nav-container">

      <a href="/" class="logo">
        <span class="mud">Mud'</span>
        <span class="tech">Tech</span>
        <span class="blog">Blog</span>
      </a>


      <button class="burger-menu" @click="toggleMenu">
        ☰
      </button>


      <div v-if="isMenuOpen" class="overlay" @click="closeMenu"></div>


      <div class="mobile-menu" :class="{ open: isMenuOpen }">
        <button class="close-btn" @click="closeMenu">✖</button>
        <ul>
          <li>
            <router-link to="/" @click="closeMenu" :class="{ active: isActive('/') }">
              🏠 Головна
            </router-link>
          </li>
          <li>
            <router-link to="/blog" @click="closeMenu" :class="{ active: isActive('/blog') }">
              📝 Блог
            </router-link>
          </li>
        </ul>
      </div>

      <ul class="nav-links">
        <li>
          <router-link to="/" :class="{ active: isActive('/') }">
            🏠 Головна
          </router-link>
        </li>
        <li>
          <router-link to="/blog" :class="{ active: isActive('/blog') }">
            📝 Блог
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--primary-dark);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease-in-out;
}

.navbar.hidden {
  transform: translateY(-100%);
}

/* 🔹 Контейнер */
.nav-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* 🔹 Текстовий логотип */
.logo {
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  user-select: none;
}

.mud {
  color: var(--primary-light);
  text-shadow: 2px 2px 8px rgba(255, 255, 100, 0.5);
}

.tech {
  color: var(--primary);
}

.blog {
  color: var(--text-light);
  opacity: 0.8;
}

/* 🔹 Навігаційні посилання */
.nav-links {
  display: flex;
  list-style: none;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: var(--primary-light);
  font-size: 18px;
  font-weight: bold;
  position: relative;
  transition: color 0.3s ease-in-out;
}

.nav-links a:hover {
  color: var(--primary);
}

/* 🔹 Анімована підсвітка активного пункту */
.nav-links a.active {
  color: var(--bg-dark);
  font-weight: bold;
}

.nav-links a::after {
  content: "";
  position: absolute;
  width: 0;
  height: 3px;
  background: var(--primary);
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  transition: width 0.3s ease-in-out;
}

.nav-links a.active::after,
.nav-links a:hover::after {
  width: 100%;
}

/* 🔹 Бургер-меню */
.burger-menu {
  display: none;
  font-size: 28px;
  background: none;
  border: none;
  color: var(--primary-light);
  cursor: pointer;
}

/* 🔹 Фон затемнення при відкритті меню */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
  transition: opacity 0.3s ease-in-out;
}

/* 🔹 Меню, що виїжджає */
.mobile-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 250px;
  height: 100vh;
  background: var(--primary-dark);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  z-index: 100;
  transition: left 0.3s ease-in-out;
}

.mobile-menu.open {
  left: 0;
}

/* 🔹 Кнопка закриття меню */
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: var(--primary-light);
  font-size: 24px;
  cursor: pointer;
}

.mobile-menu ul {
  list-style: none;
  padding: 0;
}

.mobile-menu ul li {
  padding: 15px;
}

.mobile-menu ul a {
  text-decoration: none;
  color: var(--primary-light);
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s;
}

/* 🔹 Анімована підсвітка активного пункту в мобільному меню */
.mobile-menu ul a.active {
  color: var(--bg-dark);
}

.mobile-menu ul a::before {
  content: "• ";
  color: var(--primary);
  font-size: 22px;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.mobile-menu ul a.active::before {
  opacity: 1;
}

.mobile-menu ul a:hover {
  color: var(--primary);
}

/* 📱 Адаптація під мобільні пристрої */
@media (max-width: 768px) {
  .burger-menu {
    display: block;
  }

  .nav-links {
    display: none;
  }

  .logo {
    font-size: 24px;
  }
}
</style>
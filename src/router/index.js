import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import BlogListPage from '@/views/BlogListPage.vue';
import BlogPostPage from '@/views/BlogPostPage.vue';
import { setMetaTag, setCanonicalLink } from '@/utils/meta';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: {
            title: "Головна | Mud' Tech Blog",
            description: "Опис для головної сторінки.",
            generator: "Vue.js + Vite + Shopify",
            cms: "Shopify Headless CMS",
            ip: import.meta.env.VITE_SERVER_IP
        },
    },
    {
        path: '/blog',
        name: 'blog',
        component: BlogListPage,
        meta: {
            title: "Блог | Mud' Tech Blog",
            description: "Опис для сторінки блогу.",
            generator: "Vue.js + Vite + Shopify",
            cms: "Shopify Headless CMS",
            ip: import.meta.env.VITE_SERVER_IP
        },
    },
    {
        path: '/blog/:slug',
        name: 'article',
        component: BlogPostPage,
        meta: {
            title: "Завантаження... – Mud' Tech Blog",
            description: "Опис для статті.",
            generator: "Vue.js + Vite + Shopify",
            cms: "Shopify Headless CMS",
            ip: import.meta.env.VITE_SERVER_IP
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const serverIp = import.meta.env.VITE_SERVER_IP;
if (!serverIp) {
    console.warn("VITE_SERVER_IP не встановлено");
} else {
    console.log("IP:", serverIp);
}


router.afterEach((to) => {
    document.title = to.meta.title || "Mud' Tech Blog";

    setMetaTag("description", to.meta.description || "Технологічний блог про новітні тренди.");
    setMetaTag("generator", to.meta.generator || "Vue.js + Vite + Shopify");
    setMetaTag("cms", to.meta.cms || "Shopify Headless CMS");
    setMetaTag("ip", to.meta.ip || "IP не вказано");
    setCanonicalLink(window.location.origin + to.fullPath);
});

export default router;

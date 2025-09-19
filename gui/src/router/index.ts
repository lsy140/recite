// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue'
import Reciting from '../components/Reciting.vue'
import Wrong from '../components/Wrong.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/reciting', component: Reciting },
  { path: '/wrong', component: Wrong }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
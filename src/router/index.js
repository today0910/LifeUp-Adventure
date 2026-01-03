// 导入Vue Router核心方法
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
// 导入布局和页面组件
import Layout from '../components/Layout.vue'
import LoginView from '../views/LoginView.vue'
import QuestView from '../views/QuestView.vue'
import ShopView from '../views/ShopView.vue'
import ProfileView from '../views/ProfileView.vue'
import FocusView from '../views/FocusView.vue'
import SkillView from '../views/SkillView.vue'

// 路由配置
const routes = [
  { path: '/login', component: LoginView },
  {
    path: '/',
    component: Layout,
    redirect: '/quests', // 默认进入任务页面
    children: [
      { path: 'quests', component: QuestView }, // 任务看板
      { path: 'shop', component: ShopView }, // 便利商店
      { path: 'profile', component: ProfileView }, // 个人面板
      { path: 'focus', component: FocusView }, // 专注地下城
      { path: 'skills', component: SkillView } // 无限科技树
    ]
  }
]

// 创建路由实例（History模式）
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录时拦截非登录页
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
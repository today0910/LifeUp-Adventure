import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // 路由配置文件

// 1. 创建Pinia状态管理实例
const pinia = createPinia()

// 2. 创建Vue应用实例并挂载核心插件
const app = createApp(App)
app.use(pinia)    // 挂载状态管理
app.use(router)   // 挂载路由系统
app.mount('#app') // 挂载到DOM节点
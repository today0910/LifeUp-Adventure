<template>
  <router-view></router-view>
  <!-- 全局挂载自定义确认弹窗组件 -->
  <GlobalConfirm />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useUserStore } from './stores/user'
import GlobalConfirm from './components/GlobalConfirm.vue'

// 初始化用户状态仓库
const userStore = useUserStore()

// 1. 自动保存逻辑：监听状态变化，登录后自动保存数据
userStore.$subscribe((mutation, state) => {
  if (state.isLoggedIn && state.player_name) {
    userStore.saveData()
  }
})

// 2. 暗黑模式实时监听：初始化+状态变化时自动应用主题
watch(() => userStore.isDarkMode, (newVal) => {
  document.body.classList.toggle('dark-mode', newVal)
}, { immediate: true })

// 3. 页面挂载初始化（逻辑已由watch接管，保留空函数便于后续扩展）
onMounted(() => {})
</script>

<style>
:root {
  /* 明亮模式 - 奶油风 */
  --primary: #fbbf24;          /* 主色：琥珀黄 */
  --primary-dark: #d97706;     /* 深主色 */
  --bg-color: #fffbeb;         /* 页面背景：米黄 */
  --card-bg: #fffef5;          /* 卡片背景：亮白/淡米 */
  --sidebar-bg: #fffbeb;       /* 侧边栏背景 */
  --text-main: #451a03;        /* 主文字：深褐 */
  --text-sub: #92400e;         /* 副文字：浅褐 */
  --border-color: #fcd34d;     /* 边框颜色 */
  --hover-bg: #fef3c7;         /* 悬停/次级背景 */
  --input-bg: #ffffff;         /* 输入框背景 */
  --shadow: rgba(251, 191, 36, 0.15); /* 阴影色 */
  --modal-overlay: rgba(69, 26, 3, 0.4); /* 弹窗遮罩 */
}

body.dark-mode {
  /* 深色模式 - 咖啡风 */
  --primary: #fbbf24;          /* 主色保持高亮 */
  --primary-dark: #f59e0b;     /* 深主色稍微提亮 */
  --bg-color: #2D1B18;         /* 页面背景：深咖啡 */
  --card-bg: #3E2723;          /* 卡片背景：黑巧 */
  --sidebar-bg: #261613;       /* 侧边栏背景 */
  --text-main: #FFE082;        /* 主文字：淡金 */
  --text-sub: #D7CCC8;         /* 副文字：灰褐 */
  --border-color: #5D4037;     /* 边框颜色 */
  --hover-bg: #4E342E;         /* 悬停背景 */
  --input-bg: #4E342E;         /* 输入框背景 */
  --shadow: rgba(0, 0, 0, 0.4);/* 阴影色：纯黑 */
  --modal-overlay: rgba(0, 0, 0, 0.7); /* 弹窗遮罩 */
}

/* 全局样式重置 */
body { 
  margin: 0; 
  padding: 0; 
  font-family: 'Nunito', 'PingFang SC', sans-serif; 
  box-sizing: border-box;
  background-color: var(--bg-color);
  color: var(--text-main);
  transition: background-color 0.3s, color 0.3s;
}

button { 
  cursor: pointer; 
  border: none; 
  font-family: inherit; 
}

input, textarea { 
  font-family: inherit; 
  color: var(--text-main); 
}

/* 全局滚动条美化 */
::-webkit-scrollbar { 
  width: 6px; 
  height: 6px; 
}

::-webkit-scrollbar-thumb { 
  background: var(--border-color); 
  border-radius: 3px; 
}

::-webkit-scrollbar-track { 
  background: transparent; 
}
</style>
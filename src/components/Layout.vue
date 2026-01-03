<template>
  <!-- 应用整体布局容器：包含侧边栏、主内容区、移动端底部导航 -->
  <div class="app-layout" :class="{ 'is-resizing': isResizing }">
    
    <!-- 电脑端侧边栏 (手机端隐藏) -->
    <aside class="sidebar desktop-only" :style="sidebarStyle">
      <!-- 侧边栏logo区域 -->
      <div class="logo-area">
        <div class="logo-bg">
          <Rocket :size="24" stroke-width="2.5" :color="userStore.isDarkMode ? '#FFE082' : '#FFC107'" />
        </div>
        <div class="logo-text">
          <h1>LifeUp</h1>
          <span class="badge">PRO</span>
        </div>
      </div>

      <!-- 侧边栏滚动导航区域 -->
      <div class="scroll-area">
        <nav class="nav-menu">
          <!-- 核心玩法菜单分组 -->
          <div class="menu-label-box">
            <Sparkles :size="16" stroke-width="3" :color="userStore.isDarkMode ? '#FFE082' : '#FFC107'" />
            <p class="menu-label">核心玩法</p>
          </div>
          
          <router-link to="/quests" class="nav-item">
            <LayoutDashboard :size="20" stroke-width="2.5" /> <span class="text">任务看板</span>
          </router-link>
          <router-link to="/focus" class="nav-item">
            <Timer :size="20" stroke-width="2.5" /> <span class="text">专注地下城</span>
          </router-link>
          <router-link to="/skills" class="nav-item">
            <Sprout :size="20" stroke-width="2.5" /> <span class="text">无限科技树</span>
          </router-link>
          
          <!-- 快乐生活菜单分组 -->
          <div class="menu-label-box">
            <Rainbow :size="16" stroke-width="3" :color="userStore.isDarkMode ? '#FFE082' : '#FFC107'" />
            <p class="menu-label">快乐生活</p>
          </div>

          <router-link to="/shop" class="nav-item">
            <Store :size="20" stroke-width="2.5" /> <span class="text">便利商店</span>
          </router-link>
          <router-link to="/profile" class="nav-item">
            <UserCircle :size="20" stroke-width="2.5" /> <span class="text">个人面板</span>
          </router-link>
        </nav>
      </div>

      <!-- 侧边栏小狗装饰 -->
      <div class="sidebar-dog">
        <img src="../assets/images/线条小狗 (25).png" alt="看门狗" @error="handleImgError" />
      </div>

      <!-- 侧边栏底部：主题切换 -->
      <div class="sidebar-footer">
        <div class="cute-btn toggle" @click="userStore.toggleDarkMode()">
          <component :is="userStore.isDarkMode ? Moon : Sun" :size="20" stroke-width="2.5" :color="userStore.isDarkMode ? '#FFE082' : '#8D6E63'" />
        </div>
        <div class="footer-text">{{ userStore.isDarkMode ? '晚安' : '早安' }}</div>
      </div>

      <!-- 侧边栏宽度调整手柄 -->
      <div class="resizer" @mousedown="startResize"></div>
    </aside>

    <!-- 手机端底部导航栏 (电脑端隐藏) -->
    <nav class="mobile-tab-bar mobile-only">
      <router-link to="/quests" class="tab-item">
        <LayoutDashboard :size="24" stroke-width="2.5" />
        <span class="tab-text">任务</span>
      </router-link>
      <router-link to="/focus" class="tab-item">
        <Timer :size="24" stroke-width="2.5" />
        <span class="tab-text">专注</span>
      </router-link>
      <router-link to="/skills" class="tab-item">
        <Sprout :size="24" stroke-width="2.5" />
        <span class="tab-text">科技</span>
      </router-link>
      <router-link to="/shop" class="tab-item">
        <Store :size="24" stroke-width="2.5" />
        <span class="tab-text">商店</span>
      </router-link>
      <router-link to="/profile" class="tab-item">
        <UserCircle :size="24" stroke-width="2.5" />
        <span class="tab-text">我的</span>
      </router-link>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部状态栏：等级、经验、金币 -->
      <header class="status-bar">
        <div class="level-info">
          <div class="lv-badge-top">Lv.{{ userStore.level }}</div>
          <div class="exp-box">
            <div class="exp-track">
              <div class="exp-fill" :style="{ width: expPercentage + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="gold-capsule">
          <div class="coin-icon-bg">
            <Coins :size="16" stroke-width="3" :color="userStore.isDarkMode ? '#FFE082' : '#FFC107'" />
          </div>
          <span class="coin-num">{{ isNaN(userStore.gold) ? 0 : userStore.gold }} G</span>
        </div>
        
        <!-- 手机端切换主题按钮 -->
        <button class="mobile-theme-btn mobile-only" @click="userStore.toggleDarkMode()">
           <component :is="userStore.isDarkMode ? Moon : Sun" :size="20" />
        </button>
      </header>

      <!-- 路由视图容器：包含页面切换过渡 -->
      <div class="view-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
// 导入Vue核心API
import { computed, ref, onUnmounted, onMounted } from 'vue'
// 导入用户状态管理
import { useUserStore } from '../stores/user'
// 导入lucide图标组件
import { 
  Rocket, LayoutDashboard, Timer, Sprout, Store, UserCircle, 
  Sun, Moon, Coins, Sparkles, Rainbow 
} from 'lucide-vue-next'

// 初始化用户状态
const userStore = useUserStore()

/**
 * 计算经验条百分比
 * @returns {number} 经验条宽度百分比（0-100）
 */
const expPercentage = computed(() => {
  if (userStore.max_exp === 0) return 0
  return Math.min((userStore.current_exp / userStore.max_exp) * 100, 100)
})

// 侧边栏宽度（可拖拽调整）
const sidebarWidth = ref(280)
// 是否正在调整侧边栏宽度
const isResizing = ref(false)
// 是否为移动端设备
const isMobile = ref(false)

/**
 * 计算侧边栏样式
 * 移动端隐藏侧边栏，桌面端设置宽度
 * @returns {Object} 侧边栏样式对象
 */
const sidebarStyle = computed(() => {
  if (isMobile.value) return { display: 'none' } // 手机端彻底隐藏
  return { width: `${sidebarWidth.value}px` }
})

/**
 * 开始调整侧边栏宽度
 * 移动端不执行，桌面端绑定鼠标事件、禁用文本选择
 */
const startResize = () => { 
  if (isMobile.value) return; 
  isResizing.value = true; 
  document.addEventListener('mousemove', handleResize); 
  document.addEventListener('mouseup', stopResize); 
  document.body.style.userSelect = 'none'; 
}

/**
 * 处理侧边栏宽度调整
 * 限制宽度范围：220px - 500px
 * @param {MouseEvent} e 鼠标移动事件
 */
const handleResize = (e) => { 
  if (!isResizing.value) return; 
  let newWidth = e.clientX; 
  if (newWidth < 220) newWidth = 220; 
  if (newWidth > 500) newWidth = 500; 
  sidebarWidth.value = newWidth; 
}

/**
 * 停止调整侧边栏宽度
 * 解绑鼠标事件、恢复文本选择
 */
const stopResize = () => { 
  isResizing.value = false; 
  document.removeEventListener('mousemove', handleResize); 
  document.removeEventListener('mouseup', stopResize); 
  document.body.style.userSelect = ''; 
}

/**
 * 检测是否为移动端（屏幕宽度≤768px）
 */
const checkMobile = () => { 
  isMobile.value = window.innerWidth <= 768; 
}

/**
 * 处理图片加载失败
 * 隐藏失败图片，替换为小狗emoji
 * @param {Event} e 图片加载错误事件
 */
const handleImgError = (e) => { 
  e.target.style.display = 'none'; 
  e.target.parentNode.innerHTML = '<div style="font-size: 40px;">🐶</div>' 
}

// 组件挂载时：初始化移动端检测、绑定窗口大小变化事件
onMounted(() => { 
  checkMobile(); 
  window.addEventListener('resize', checkMobile); 
})

// 组件卸载时：清理resize事件和鼠标事件
onUnmounted(() => { 
  stopResize(); 
  window.removeEventListener('resize', checkMobile); 
})
</script>

<style scoped>
/* 侧边栏基础样式：全屏高度、弹性布局、相对定位 */
.sidebar { 
  height: 100%; 
  background: var(--sidebar-bg);
  border-right: 2px dashed var(--border-color); 
  display: flex; 
  flex-direction: column; 
  flex-shrink: 0; 
  z-index: 20; 
  position: relative; 
  transition: all 0.3s;
}

/* 设备显示控制：桌面端显示/移动端隐藏 */
.desktop-only { display: flex; }
.mobile-only { display: none !important; }

/* 菜单分组标签样式：弹性布局、间距、字体样式 */
.menu-label-box { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin: 25px 0 10px 10px; 
}
.menu-label { 
  font-size: 14px; 
  color: var(--text-sub); 
  font-weight: 900; 
  margin: 0; 
  letter-spacing: 1px; 
}

/* 侧边栏小狗装饰：绝对定位、居中、指针事件禁用 */
.sidebar-dog { 
  position: absolute; 
  bottom: 190px;
  left: 50%; 
  transform: translateX(-50%);
  width: 150px;
  pointer-events: none; 
  z-index: 5; 
}
.sidebar-dog img { 
  width: 100%; 
  filter: drop-shadow(0 10px 20px var(--shadow)); 
  transition: all 0.3s;
}

/* 应用整体布局：弹性布局、全屏高度、溢出隐藏（桌面端） */
.app-layout { 
  display: flex; 
  width: 100%; 
  background-color: var(--bg-color); 
  font-family: 'Nunito', sans-serif; 
  transition: all 0.3s;
  height: 100vh;
  overflow: hidden;
}

/* Logo区域样式：内边距、弹性布局、间距 */
.logo-area { 
  padding: 40px 30px; 
  display: flex; 
  align-items: center; 
  gap: 15px; 
}
/* Logo背景容器：圆形、弹性居中、过渡效果 */
.logo-bg { 
  width: 50px; 
  height: 50px; 
  background: var(--hover-bg); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.3s; 
}
/* Logo文本样式：主色调、加粗 */
.logo-text h1 { 
  margin: 0; 
  font-size: 26px; 
  color: var(--primary); 
  font-weight: 900; 
}
/* PRO徽章样式：小字体、圆角、主色调背景 */
.logo-text .badge { 
  font-size: 10px; 
  background: var(--primary); 
  color: white; 
  padding: 2px 6px; 
  border-radius: 6px; 
  font-weight: bold; 
}

/* 侧边栏滚动区域：弹性占满、内边距、垂直滚动 */
.scroll-area { 
  flex: 1; 
  padding: 10px 25px; 
  overflow-y: auto; 
}

/* 导航项样式：弹性布局、内边距、圆角、过渡效果 */
.nav-item { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  padding: 12px 20px; 
  margin-bottom: 12px; 
  border-radius: 20px; 
  text-decoration: none; 
  color: var(--text-sub); 
  font-weight: 800; 
  transition: 0.3s; 
}
/* 导航项hover/激活状态：背景色、主色调文字、阴影 */
.nav-item:hover, .nav-item.router-link-active { 
  background: var(--hover-bg); 
  color: var(--primary); 
}
.nav-item.router-link-active { 
  box-shadow: 0 5px 15px var(--shadow); 
}

/* 侧边栏底部：内边距、弹性布局、间距 */
.sidebar-footer { 
  padding: 30px; 
  display: flex; 
  align-items: center; 
  gap: 15px; 
}
/* 圆形按钮样式：固定尺寸、弹性居中、光标指针、过渡效果 */
.cute-btn { 
  width: 45px; 
  height: 45px; 
  background: var(--hover-bg); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  transition: all 0.2s; 
}
.cute-btn:hover { 
  transform: scale(1.1); 
}
/* 底部文本样式：加粗、次要文本色、小字体 */
.footer-text { 
  font-weight: 900; 
  color: var(--text-sub); 
  font-size: 14px; 
}

/* 主内容区：弹性占满、弹性布局、最小宽度0（防止溢出）、溢出隐藏（桌面端） */
.main-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  min-width: 0;
  overflow: hidden;
}

/* 顶部状态栏：固定高度、弹性布局、两端对齐、内边距、过渡效果 */
.status-bar { 
  height: 90px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 40px; 
  transition: all 0.3s; 
}

/* 金币胶囊样式：卡片背景、内边距、圆角、弹性布局、阴影、过渡效果 */
.gold-capsule { 
  background: var(--card-bg); 
  padding: 5px 15px; 
  border-radius: 30px; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-weight: 900; 
  box-shadow: 0 5px 15px var(--shadow); 
  transition: all 0.3s; 
  color: var(--text-main); 
}

/* 路由视图容器：弹性占满、内边距、垂直滚动、自定义滚动条 */
.view-container { 
  flex: 1; 
  padding: 20px 40px; 
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary) transparent;
}
/* 自定义滚动条样式（webkit内核） */
.view-container::-webkit-scrollbar { width: 6px; }
.view-container::-webkit-scrollbar-track { background: transparent; }
.view-container::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }

/* 等级信息容器：弹性布局、卡片背景、内边距、圆角、阴影、过渡效果 */
.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card-bg);
  padding: 5px 15px 5px 5px;
  border-radius: 30px;
  box-shadow: 0 5px 15px var(--shadow);
  transition: all 0.3s;
}

/* 等级徽章：主色调背景、白色文字、圆角、加粗、不收缩 */
.lv-badge-top { 
  background: var(--primary); 
  color: white; 
  padding: 4px 12px; 
  border-radius: 20px; 
  font-size: 14px; 
  font-weight: 900; 
  flex-shrink: 0; 
}

/* 经验条容器：固定宽度、弹性居中 */
.exp-box { 
  width: 140px; 
  display: flex;
  align-items: center;
}

/* 经验条轨道：宽度100%、固定高度、背景色、圆角、溢出隐藏、过渡效果 */
.exp-track { 
  width: 100%;
  height: 8px; 
  background: var(--hover-bg); 
  border-radius: 4px; 
  overflow: hidden; 
  transition: all 0.3s; 
}

/* 经验条填充：渐变色、宽度过渡动画 */
.exp-fill { 
  height: 100%; 
  background: linear-gradient(90deg, var(--primary), #FFD54F); 
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); 
}

/* 侧边栏调整手柄：绝对定位、宽度调整光标、透明度过渡 */
.resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: var(--border-color);
  cursor: ew-resize;
  opacity: 0.5;
  transition: opacity 0.2s;
}
/* 手柄hover/调整中状态：全透明、主色调背景 */
.resizer:hover, .is-resizing .resizer {
  opacity: 1;
  background: var(--primary);
}

/* 移动端适配（屏幕宽度≤768px） */
@media (max-width: 768px) {
  /* 设备显示控制：桌面端隐藏/移动端显示 */
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }

  /* 应用布局：垂直排列、高度自适应、溢出可见 */
  .app-layout { 
    flex-direction: column; 
    height: auto;
    overflow: visible;
  }
  
  /* 主内容区：溢出可见、底部内边距（适配底部导航+安全区域）、最小全屏高度 */
  .main-content { 
    overflow: visible;
    padding-bottom: calc(60px + env(safe-area-inset-bottom));
    min-height: 100vh;
  }
  
  /* 顶部状态栏：内边距调整、高度自适应、换行、间距、居中对齐 */
  .status-bar { 
    padding: 15px 20px; 
    height: auto; 
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  
  /* 路由视图容器：内边距调整、最小高度适配 */
  .view-container { 
    padding: 0 20px 20px; 
    min-height: calc(100vh - 80px - 60px);
  }
  
  /* 移动端底部导航：固定定位、全屏宽度、弹性布局、阴影、安全区域适配 */
  .mobile-tab-bar {
    position: fixed; 
    bottom: 0; 
    left: 0; 
    width: 100%; 
    height: 60px;
    background: var(--card-bg); 
    border-top: 1px solid var(--border-color);
    z-index: 1000; 
    box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
    display: flex; 
    justify-content: space-around; 
    align-items: center; 
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* 移动端导航项：垂直排列、弹性占满、字体样式、间距 */
  .tab-item {
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center;
    color: var(--text-sub); 
    text-decoration: none; 
    font-size: 10px; 
    font-weight: 700;
    flex: 1; 
    height: 100%; 
    gap: 2px;
  }
  /* 移动端导航激活状态：主色调文字 */
  .tab-item.router-link-active { color: var(--primary); }
  
  /* 移动端主题按钮：圆形、弹性居中、边框、阴影 */
  .mobile-theme-btn {
    background: var(--card-bg); 
    border-radius: 50%; 
    width: 36px; 
    height: 36px;
    display: flex; 
    align-items: center; 
    justify-content: center;
    border: 1px solid var(--border-color); 
    color: var(--text-sub);
    box-shadow: 0 2px 8px var(--shadow);
  }
  
  /* 移动端经验条宽度调整 */
  .exp-box {
    width: 200px;
  }
}
</style>
<template>
  <!-- 登录页面容器（背景图+遮罩） -->
  <div class="login-container" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="bg-mask"></div>

    <div class="content-wrapper">
      <!-- 左侧：品牌文字区 -->
      <div class="visual-side">
        <div class="brand-box">
          <div class="logo-icon">
            <Rocket :size="48" stroke-width="2.5" color="#FFC107" />
          </div>
          <h1 class="app-name">LifeUp</h1>
        </div>
        <div class="slogan-box">
          <h2>Gamify Your Life.</h2>
          <h3>生活，就是一场伟大的冒险。</h3>
          <p>
            将待办事项变成史诗任务，<br>
            击败拖延恶龙，赚取金币，<br>
            现在就开始你的英雄之旅。
          </p>
        </div>
      </div>

      <!-- 右侧：登录/注册表单 -->
      <div class="form-side">
        <div class="form-card glass-effect">
          <div class="form-header">
            <h2>{{ isRegister ? '创建角色' : '欢迎回来' }}</h2>
            <p>{{ isRegister ? '注册账号，开启冒险' : '输入账号，读取存档' }}</p>
          </div>

          <div class="form-body">
            <div class="input-group">
              <label>冒险家代号</label>
              <div class="input-wrapper">
                <User :size="20" class="input-icon" />
                <input 
                  v-model="form.username" 
                  type="text" 
                  placeholder="请输入账号"
                  @keyup.enter="handleSubmit"
                >
              </div>
            </div>

            <div class="input-group">
              <label>密令</label>
              <div class="input-wrapper">
                <Lock :size="20" class="input-icon" />
                <input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="请输入密码"
                  @keyup.enter="handleSubmit"
                >
              </div>
            </div>

            <transition name="slide-fade">
              <div class="input-group" v-if="isRegister">
                <label>确认密令</label>
                <div class="input-wrapper">
                  <Shield :size="20" class="input-icon" />
                  <input 
                    v-model="form.confirmPass" 
                    type="password" 
                    placeholder="再次输入密码"
                  >
                </div>
              </div>
            </transition>

            <div class="actions" v-if="!isRegister">
              <label class="checkbox-label">
                <input type="checkbox"> <span>记住我</span>
              </label>
              <a href="#" class="forgot-link">忘记密码?</a>
            </div>

            <button class="submit-btn" @click="handleSubmit">
              {{ isRegister ? '立即创建角色' : '进入游戏世界' }}
              <ArrowRight :size="20" />
            </button>
          </div>

          <div class="form-footer">
            <p v-if="!isRegister">
              还没有档案? <span @click="toggleMode">立即注册</span>
            </p>
            <p v-else>
              已有账号? <span @click="toggleMode">直接登录</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Rocket, User, Lock, Shield, Info, ArrowRight } from 'lucide-vue-next'
import bgImage from '../assets/images/登录壁纸.jpg'

// 初始化路由和状态
const router = useRouter()
const userStore = useUserStore()
const isRegister = ref(false)
const form = reactive({ username: '', password: '', confirmPass: '' })

// 切换登录/注册模式
const toggleMode = () => {
  isRegister.value = !isRegister.value
  form.username = ''
  form.password = ''
  form.confirmPass = ''
}

// 提交登录/注册表单
const handleSubmit = () => {
  if (!form.username || !form.password) return alert('请输入完整的冒险家信息！')

  if (isRegister.value) {
    if (form.password !== form.confirmPass) return alert('两次输入的密令不一致！')
    const res = userStore.register(form.username, form.password)
    if (res.success) {
      alert(res.msg)
      router.push('/quests')
    } else {
      alert(res.msg)
    }
  } else {
    const res = userStore.login(form.username, form.password)
    if (res.success) {
      router.push(form.username === 'admin' ? '/profile' : '/quests')
    } else {
      alert(res.msg)
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景遮罩（暗化+模糊） */
.bg-mask {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
  backdrop-filter: blur(2px); 
}

.content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

/* 左侧品牌文字区 */
.visual-side {
  flex: 1;
  color: white;
  padding-right: 60px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}

.app-name {
  font-size: 48px;
  font-weight: 900;
  margin: 0;
  letter-spacing: 2px;
  background: linear-gradient(120deg, #fff, #FFC107);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.slogan-box h2 {
  font-size: 64px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
}

.slogan-box h3 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
  opacity: 0.9;
}

.slogan-box p {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.85;
  max-width: 480px;
}

/* 右侧表单区 */
.form-side {
  flex: 0 0 450px;
  display: flex;
  justify-content: flex-end;
}

/* 毛玻璃表单卡片 */
.form-card.glass-effect {
  width: 100%;
  background: rgba(255, 255, 255, 0.75); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border-radius: 24px;
  padding: 45px 40px;
  animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.form-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.form-header p {
  color: #4b5563;
  font-size: 14px;
  margin-bottom: 30px;
}

/* 表单输入项 */
.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #6b7280;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 2px solid rgba(229, 231, 235, 0.6);
  border-radius: 12px;
  font-size: 15px;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.6);
  outline: none;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  border-color: #fbbf24;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
  margin-top: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(251, 191, 36, 0.4);
}

.submit-btn:active {
  transform: scale(0.98);
}

/* 表单操作区（记住我/忘记密码） */
.actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; font-size: 13px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; color: #4b5563; cursor: pointer; }
.forgot-link { color: #d97706; text-decoration: none; font-weight: 700; }

/* 表单底部切换登录/注册 */
.form-footer { margin-top: 25px; text-align: center; font-size: 14px; color: #4b5563; }
.form-footer span { color: #d97706; font-weight: 800; cursor: pointer; margin-left: 5px; text-decoration: underline; }

/* 动画效果 */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 过渡动画 */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

/* 响应式适配 */
@media (max-width: 900px) {
  .visual-side { display: none; }
  .content-wrapper { justify-content: center; padding: 0 20px; }
  .form-side { flex: 0 0 100%; max-width: 400px; }
  .form-card.glass-effect { 
    background: rgba(255, 255, 255, 0.95);
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .form-card.glass-effect {
    background: rgba(30, 30, 30, 0.85);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .form-header h2 { color: #fff; }
  .form-header p, .input-group label, .checkbox-label { color: #cbd5e1; }
  .input-wrapper input { 
    background: rgba(0,0,0,0.3); 
    border-color: #4b5563; 
    color: white; 
  }
  .input-wrapper input:focus { border-color: #fbbf24; }
}
</style>
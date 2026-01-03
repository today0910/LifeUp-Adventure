<template>
  <div class="skill-view">
    <!-- 全局消息提示 -->
    <transition name="toast-anim">
      <div v-if="toast.show" class="toast-message" :class="toast.type">
        <component :is="toast.icon" :size="20" /><span>{{ toast.msg }}</span>
      </div>
    </transition>

    <div class="bg-decoration"></div>

    <div class="content-wrapper">
      <div class="header-section">
        <div class="header-dog">
          <img src="../assets/images/线条小狗 (1).png" alt="小狗" class="header-dog-png" @error="handleImgError">
        </div>
        <div class="title-box">
          <h1><PawPrint :size="28" stroke-width="2.5" class="icon-paw" /> 无限技能树</h1>
          <p>投喂金币，解锁超萌被动技能，打造快乐人生！</p>
        </div>
      </div>

      <div class="cards-container">
        <div 
          v-for="(skill, index) in userStore.skills" 
          :key="skill.id"
          class="skill-card"
          :class="[getCardColor(index), { 'locked': !isUnlocked(skill), 'maxed': isMax(skill) }]"
          @click="openUpgradePanel(skill)"
        >
          <div class="card-inner">
            <div class="card-header">
              <div class="icon-bg">
                <component :is="getSkillIcon(index)" :size="24" stroke-width="2.5" :color="getIconColor(index)" />
              </div>
              <span class="lv-badge" v-if="skill.level > 0">Lv.{{ skill.level }}</span>
            </div>
            
            <h3>{{ skill.name }}</h3>
            <p class="desc">{{ skill.desc }}</p>

            <div class="progress-track">
              <div class="progress-bar" :style="{ width: getProgress(skill) + '%', backgroundColor: getIconColor(index) }"></div>
            </div>
            
            <div class="status-text" :style="{ color: getIconColor(index) }">
              <span v-if="isMax(skill)"><Star :size="14" stroke-width="2.5" /> 已满级</span>
              <span v-else-if="!isUnlocked(skill)"><Lock :size="14" stroke-width="2.5" /> 未解锁</span>
              <span v-else><Candy :size="14" stroke-width="2.5" /> 点击升级</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-dog">
      <div class="speech-bubble">加油赚钱哦!</div>
      <img src="../assets/images/线条小狗 (3).png" alt="陪伴狗" />
    </div>

    <!-- 升级弹窗 -->
    <Teleport to="body">
      <div v-if="selectedSkill" class="overlay" @click="selectedSkill = null"></div>
      <transition name="slide-up">
        <div v-if="selectedSkill" class="upgrade-panel">
          <div class="panel-dog">
            <img src="../assets/images/线条小狗 (1).png" class="panel-dog-png" @error="handleImgError">
          </div>
          
          <div class="panel-header">
            <div class="panel-icon" :style="{ backgroundColor: getCardBg(selectedSkill.id) }">
              <component :is="getSkillIcon(selectedSkill.id)" :size="32" stroke-width="2.5" :color="getIconColor(selectedSkill.id)" />
            </div>
            <div class="panel-title">
              <h3 :style="{ color: getIconColor(selectedSkill.id) }">{{ selectedSkill.name }}</h3>
              <span class="highlight">当前 Lv.{{ selectedSkill.level }}</span>
            </div>
            <button class="close-btn" @click="selectedSkill = null">
              <X :size="36" stroke-width="2.5" />
            </button>
          </div>

          <div class="panel-body">
            <div class="effect-display">
              <div class="effect-row">
                <span>当前效果</span>
                <strong>{{ calculateEffect(selectedSkill, selectedSkill.level) }}</strong>
              </div>
              <div class="arrow" v-if="!isMax(selectedSkill)"><ChevronDown :size="20" stroke-width="2.5" color="#FFD54F" /></div>
              <div class="effect-row next" v-if="!isMax(selectedSkill)">
                <span>下一级</span>
                <strong :style="{ color: getIconColor(selectedSkill.id) }">{{ calculateEffect(selectedSkill, selectedSkill.level + 1) }}</strong>
              </div>
            </div>

            <div class="cost-area">
              <div v-if="!isMax(selectedSkill)">
                <p>升级消耗</p>
                <div class="cost-price" :class="{ 'red': userStore.gold < currentCost }">
                  <Coins :size="24" stroke-width="2.5" color="#FFB300" /> {{ currentCost }} G
                </div>
              </div>
              <div v-else class="max-msg">
                <Star :size="20" stroke-width="2.5" color="#FFC107" /> 超满级啦！好厉害～ <Star :size="20" stroke-width="2.5" color="#FFC107" />
              </div>
            </div>

            <button 
              class="upgrade-btn" 
              :disabled="isMax(selectedSkill) || userStore.gold < currentCost"
              @click="handleUpgrade"
            >
              {{ isMax(selectedSkill) ? '已达上限' : '投喂升级' }}
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { 
  Sprout, Coins, Gift, BookOpen, Zap, PawPrint, Star, Lock, Candy, X, ChevronDown, CheckCircle, AlertCircle,
  ShoppingBag, GraduationCap, Clover, AlarmClock 
} from 'lucide-vue-next'

// 初始化用户状态
const userStore = useUserStore()
const selectedSkill = ref(null)

// 提示框逻辑
const toast = reactive({ show: false, msg: '', type: 'success', icon: CheckCircle })
const showToast = (msg, type = 'success') => {
  toast.msg = msg
  toast.type = type
  toast.icon = type === 'success' ? CheckCircle : AlertCircle
  toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

// 样式映射
const colors = ['yellow', 'light-yellow', 'gold', 'cream', 'pale-yellow']
const getCardColor = (index) => colors[index % colors.length]

// 技能图标映射（第3个为Gift寻宝）
const icons = [Sprout, Coins, Gift, BookOpen, ShoppingBag, GraduationCap, Clover, AlarmClock]
const getSkillIcon = (index) => icons[index % icons.length]

// 图标颜色映射
const getIconColor = (index) => {
  const colorMap = ['#FFC107', '#FFB300', '#F57F17', '#FFD54F', '#FFE082']
  return colorMap[index % colorMap.length]
}

// 卡片背景映射
const getCardBg = (index) => {
  const bgMap = ['#FFF9C4', '#FFECB3', '#FFE0B2', '#FFECB3', '#FFF9C4']
  return bgMap[index % bgMap.length]
}

// 图片加载失败处理
const handleImgError = (e) => { e.target.style.display = 'none' }

// 技能状态判断
const isUnlocked = (skill) => skill.level > 0 || skill.id === 0
const isMax = (skill) => skill.maxLevel > 0 && skill.level >= skill.maxLevel

// 技能进度计算
const getProgress = (skill) => {
  if (skill.maxLevel === 0) return 100
  return (skill.level / skill.maxLevel) * 100
}

// 升级成本计算
const currentCost = computed(() => {
  if (!selectedSkill.value) return 0
  const skill = selectedSkill.value
  return Math.floor(skill.baseCost * Math.pow(1.5, skill.level))
})

// 技能效果计算（ID2为寻宝技能）
const calculateEffect = (skill, level) => {
  if (level === 0) return '暂无效果'
  switch(skill.id) {
    case 0: return '开启你的冒险之旅'
    case 1: return `任务金币奖励 +${(level * 10)}%`
    case 2: return `任务掉落物品概率 +${level * 2}%` // 寻宝技能
    case 3: return `专注收益加成 +${level * 5}%`
    case 4: return `商店消费折扣 -${level * 2}%`
    case 5: return `经验获取加成 +${level * 5}%`
    case 6: return `双倍金币概率 +${level * 3}%`
    case 7: return `每日登录奖励 +${level * 10} G`
    default: return `技能强度 Lv.${level}`
  }
}

// 打开升级面板（校验解锁顺序）
const openUpgradePanel = (skill) => {
  if (skill.id === 0 || skill.level > 0) {
    selectedSkill.value = skill
  } else {
    const prevId = skill.id - 1;
    if (prevId >= 0 && userStore.skills.find(s => s.id === prevId)?.level > 0) {
      selectedSkill.value = skill
    } else {
      showToast('🔒 必须先解锁前面的技能哦～', 'error')
    }
  }
}

// 处理技能升级
const handleUpgrade = () => {
  const res = userStore.upgradeSkill(selectedSkill.value.id)
  if (res.success) {
    showToast('升级成功！能力提升啦！', 'success')
  } else {
    if (navigator.vibrate) navigator.vibrate(200)
    showToast('💰 金币不够啦！快去赚更多金币～', 'error')
  }
}
</script>

<style scoped>
/* 基础布局 */
.skill-view { 
  font-family: 'Nunito', sans-serif; 
  height: 100%; 
  background-color: var(--bg-color); 
  position: relative;
  overflow-x: hidden;
  display: flex; flex-direction: column;
}

/* 悬浮小狗 */
.floating-dog { position: fixed; bottom: 20px; right: 30px; width: 100px; z-index: 10; animation: floatDog 4s infinite ease-in-out; cursor: pointer; }
.floating-dog img { width: 100%; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); }
.speech-bubble { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: white; padding: 5px 10px; border-radius: 10px; font-size: 12px; font-weight: bold; color: #FFC107; box-shadow: 0 3px 5px rgba(0,0,0,0.1); white-space: nowrap; animation: popIn 0.5s; }
.speech-bubble::after { content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); border-width: 5px 5px 0; border-style: solid; border-color: white transparent transparent; }
@keyframes floatDog { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes popIn { from{opacity:0;transform:translate(-50%,10px)} to{opacity:1;transform:translate(-50%,0)} }

/* 内容容器 */
.content-wrapper { margin: auto 0; padding: 30px 0; width: 100%; overflow-y: auto; }
.header-section { text-align: center; margin-bottom: 30px; position: relative; z-index: 1; }
.header-dog { width: 70px; height: 70px; margin: 0 auto 5px; animation: bounce 2s infinite ease-in-out; }
.header-dog-png { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));}

/* 标题样式 */
.title-box h1 { margin: 0; font-size: 26px; color: var(--text-main); font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 8px;}
.title-box p { margin: 4px 0 0; color: var(--text-sub); font-weight: bold; font-size: 13px; }
.icon-paw { color: var(--primary-dark); }

/* 技能卡片容器（强制4列布局） */
.cards-container { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px; 
  padding: 0 20px; 
  max-width: 1200px; 
  margin: 0 auto; 
  position: relative; z-index: 1; 
}

/* 技能卡片样式 */
.skill-card { 
  background: var(--card-bg);
  border-radius: 20px; 
  padding: 18px; 
  position: relative; cursor: pointer; 
  border: 2px solid transparent; 
  box-shadow: 0 4px 15px var(--shadow);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
  min-height: 180px; 
  display: flex; flex-direction: column; justify-content: space-between;
}

/* 卡片渐变背景 */
.yellow { border-color: #FFF9C4; background: linear-gradient(180deg, #FFFBF0 0%, #fff 100%); }
.light-yellow { border-color: #FFECB3; background: linear-gradient(180deg, #FFFAE6 0%, #fff 100%); }
.gold { border-color: #FFD740; background: linear-gradient(180deg, #FFF8E1 0%, #fff 100%); }
.cream { border-color: #FFE082; background: linear-gradient(180deg, #FFFBF4 0%, #fff 100%); }
.pale-yellow { border-color: #FFF59D; background: linear-gradient(180deg, #FFFEF0 0%, #fff 100%); }

/* 深色模式适配 */
:global(body.dark-mode) .skill-card {
  background: var(--card-bg) !important;
  background-image: none !important;
  border-width: 1px;
}
:global(body.dark-mode) .yellow { border-color: #FBC02D; }
:global(body.dark-mode) .light-yellow { border-color: #FFA000; }
:global(body.dark-mode) .gold { border-color: #F57F17; }
:global(body.dark-mode) .cream { border-color: #FFCA28; }
:global(body.dark-mode) .pale-yellow { border-color: #FFEE58; }

/* 卡片交互效果 */
.skill-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-color: var(--primary); }
.skill-card:active { transform: scale(0.95); }
.skill-card.locked { filter: grayscale(0.9) opacity(0.6); }
.skill-card.maxed { border-color: #FFC107; box-shadow: 0 0 15px rgba(255, 193, 7, 0.3); }

/* 卡片内部样式 */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.icon-bg { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--hover-bg); }
.lv-badge { background: #FFC107; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; }
.card-inner h3 { margin: 0 0 8px; font-size: 16px; color: var(--text-main); font-weight: 900; }
.desc { font-size: 12px; color: var(--text-sub); margin: 0 0 15px; line-height: 1.4; font-weight: 600; min-height: 34px; }

/* 进度条 */
.progress-track { height: 5px; background: var(--hover-bg); border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
.progress-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

/* 状态文本 */
.status-text { font-size: 11px; font-weight: bold; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 4px; }

/* 响应式适配 */
@media (max-width: 1100px) {
  .cards-container { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 800px) {
  .cards-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 550px) {
  .cards-container { grid-template-columns: 1fr; }
}

/* 升级弹窗 */
.upgrade-panel {
  position: fixed; bottom: 0; left: 0; width: 100%; 
  background: var(--card-bg);
  border-radius: 30px 30px 0 0; z-index: 10000; padding: 30px; box-sizing: border-box;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
  border-top: 1px solid var(--border-color);
}
.panel-dog { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); width: 70px; height: 70px; z-index: 10001; }
.panel-dog-png { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); }
.panel-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; margin-top: 10px; }
.panel-icon { width: 54px; height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
.panel-title h3 { margin: 0; font-size: 20px; color: var(--text-main); }
.highlight { color: var(--primary); font-weight: bold; font-size: 13px; }

/* 关闭按钮 */
.close-btn { 
  margin-left: auto; background: var(--hover-bg); border: none; 
  width: 50px; height: 50px; border-radius: 50%; 
  font-size: 18px; cursor: pointer; color: var(--text-sub); transition: 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.close-btn:hover { background: var(--border-color); color: var(--text-main); }

/* 效果展示 */
.effect-display { background: var(--bg-color); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px dashed var(--border-color); }
.effect-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; color: var(--text-sub); }
.effect-row strong { color: var(--text-main); font-size: 16px; }
.arrow { text-align: center; margin: 5px 0; display: flex; align-items: center; justify-content: center; }

/* 成本区域 */
.cost-area { text-align: center; margin-bottom: 20px; }
.cost-area p { margin: 0 0 5px; font-size: 12px; color: var(--text-sub); }
.cost-price { font-size: 28px; font-weight: 900; color: #FFB300; display: flex; align-items: center; justify-content: center; gap: 8px; }
.cost-price.red { color: #FF5722; animation: shake 0.3s; }
.max-msg { color: #FFC107; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; }

/* 升级按钮 */
.upgrade-btn {
  width: 100%; padding: 16px; background: linear-gradient(90deg, #FFE082, #FFC107);
  color: white; border: none; border-radius: 25px; font-size: 18px; font-weight: 900;
  cursor: pointer; box-shadow: 0 8px 20px rgba(255, 193, 7, 0.2); transition: 0.2s;
}
.upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(255, 193, 7, 0.3); }
.upgrade-btn:active { transform: scale(0.98); }
.upgrade-btn:disabled { background: #EEE; color: #aaa; box-shadow: none; cursor: not-allowed; transform: none; background-image: none; }

/* 遮罩层 */
.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--modal-overlay); z-index: 9999; backdrop-filter: blur(4px); }

/* 提示框 */
.toast-message { position: fixed; top: 40px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 50px; background: var(--card-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; font-weight: 700; z-index: 10000; border: 1px solid var(--border-color); color: var(--text-main); }
.toast-message.success { color: #16a34a; border-color: #dcfce7; }
.toast-message.error { color: #dc2626; border-color: #fee2e2; }
.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.3s; }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* 弹窗动画 */
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

/* 动画关键帧 */
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
</style>
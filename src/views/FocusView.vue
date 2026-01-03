<template>
  <div class="focus-view page-bg">
    <div class="layout-container">
      
      <!-- 左侧：专注统计 -->
      <div class="side-panel left-panel">
        <div class="info-card stats-card">
          <h3 class="panel-title first-title"><PieChart :size="20" stroke-width="2.5"/> 专注报表</h3>
          <div class="time-stat-list">
            <div class="stat-row"><div class="stat-label"><span class="dot yellow"></span> 今日专注</div><div class="stat-val">{{ formatTimeStats(userStore.focusStats.today) }}</div></div>
            <div class="stat-row"><div class="stat-label"><span class="dot green"></span> 本周累计</div><div class="stat-val">{{ formatTimeStats(userStore.focusStats.week) }}</div></div>
            <div class="stat-row"><div class="stat-label"><span class="dot blue"></span> 本月累计</div><div class="stat-val">{{ formatTimeStats(userStore.focusStats.month) }}</div></div>
            <div class="stat-row"><div class="stat-label"><span class="dot red"></span> 本年累计</div><div class="stat-val">{{ formatTimeStats(userStore.focusStats.year) }}</div></div>
          </div>
          <div class="divider"></div>
          <div class="mini-stats">
            <div class="mini-item"><div class="mini-head"><span>总挑战次数</span><button class="mini-reset-btn" @click="resetCount"><RotateCcw :size="12" /></button></div><strong>{{ userStore.focusStats.totalCount }}</strong></div>
            <div class="mini-item"><div class="mini-head"><span>地下城累计赚取</span><button class="mini-reset-btn" @click="resetGold"><RotateCcw :size="12" /></button></div><strong class="gold-text">{{ userStore.focusStats.totalGold }} G</strong></div>
          </div>
        </div>
        <div class="tip-box"><Lightbulb :size="18" class="tip-icon" /><p>小贴士：挑战过程中请勿放弃，完成后记得回来领取奖励哦！</p></div>
      </div>

      <!-- 中间：专注地下城 -->
      <div class="center-panel">
        <div class="dungeon-wrapper">
          <div class="dungeon-header"><div class="header-left"><h2>专注地下城</h2><span class="subtitle">Keep focused, keep fighting.</span></div><div class="header-decoration"><Swords :size="24" /></div></div>
          <transition name="fade" mode="out-in">
            <div v-if="sessionStatus === 'idle'" class="stage-select">
              <div class="card-grid">
                <div v-for="level in levels" :key="level.min" class="game-card" @click="startFocus(level)">
                  <div class="card-icon-bg unified-bg"><component :is="level.icon" :size="32" stroke-width="2" class="unified-icon" /></div>
                  <div class="card-content"><h3>{{ level.name }}</h3><p>{{ level.desc }}</p></div>
                  <div class="card-footer"><span class="reward-pill unified-pill">+{{ userStore.calculateFocusBonus(level.gold) }} <Coins :size="12" /></span></div>
                </div>
              </div>
            </div>
            <div v-else-if="sessionStatus === 'running'" class="stage-running">
              <div class="running-card">
                <div class="timer-section"><div class="timer-ring"></div><span class="big-timer">{{ formatTimer(timeLeft) }}</span></div>
                <div class="running-status"><span class="status-dot"></span>正在挑战：{{ userStore.focusSession.levelName }}</div>
                <div class="progress-bar-thin"><div class="fill" :style="{ width: progressPercent + '%' }"></div></div>
                <button class="btn-cancel" @click="giveUp">放弃</button>
              </div>
            </div>
            <div v-else-if="sessionStatus === 'finished'" class="stage-result">
              <div class="result-card">
                <Trophy :size="60" class="trophy-icon" /><h3>挑战成功</h3>
                <div class="loot-list">
                  <div class="loot-item"><span>金币</span><strong class="gold-text">+{{ userStore.focusSession.reward.gold }}</strong></div>
                  <div class="loot-item"><span>经验</span><strong class="exp-text">+{{ userStore.focusSession.reward.exp }}</strong></div>
                </div>
                <button class="btn-primary" @click="claimReward">收入囊中</button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 右侧：战斗记录 -->
      <div class="side-panel right-panel">
        <div class="info-card history-card">
          <div class="panel-header"><div class="ph-left"><ScrollText :size="18" stroke-width="2.5" /><span>战斗记录</span></div><button class="clear-btn" @click="clearHistory" v-if="userStore.battleHistory.length > 0"><Trash2 :size="14" /></button></div>
          
          <div class="history-list">
            <div v-for="(record, index) in userStore.battleHistory" :key="index" class="h-item">
              <div class="h-icon-box"><Check :size="14" /></div><div class="h-text"><div class="h-title">击败 {{ record.monster }}</div><div class="h-time">{{ record.time }}</div></div><div class="h-reward">+{{ record.gold }}G</div>
            </div>

            <!-- 空状态美化 -->
            <div v-if="userStore.battleHistory.length === 0" class="empty-history">
              <div class="empty-icon-box">
                <Swords :size="32" stroke-width="1.5" />
              </div>
              <p>暂无战斗记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { showConfirm } from '../utils/dialog'
import { formatTimer, getCurrentTimeStr } from '../utils'
import { Coins, Trophy, ScrollText, Lightbulb, Ghost, Skull, Flame, Crown, Gem, Swords, Check, Shield, PieChart, Trash2, RotateCcw } from 'lucide-vue-next'

// 初始化状态
const userStore = useUserStore()
const sessionStatus = computed(() => userStore.focusSession?.status || 'idle')
const timeLeft = ref(0)
let timerId = null

// 状态容错处理
if (!userStore.focusStats) userStore.focusStats = { today: 0, week: 0, month: 0, year: 0, totalCount: 0, totalGold: 0 }
if (!userStore.battleHistory) userStore.battleHistory = []
if (!userStore.focusSession) userStore.focusSession = { status: 'idle', startTime: null, duration: 0, levelName: '', reward: { gold: 0, exp: 0 } }

// 专注关卡配置
const levels = [ 
  { min: 1, name: '史莱姆平原', desc: '1 分钟 · 热身', icon: Ghost, gold: 3, exp: 2 }, 
  { min: 10, name: '哥布林矿坑', desc: '10 分钟 · 轻度', icon: Skull, gold: 30, exp: 20 }, 
  { min: 30, name: '幽灵船', desc: '30 分钟 · 进阶', icon: Shield, gold: 90, exp: 60 }, 
  { min: 60, name: '红龙巢穴', desc: '1 小时 · 深度', icon: Flame, gold: 180, exp: 150 }, 
  { min: 120, name: '深渊守卫', desc: '2 小时 · 大师', icon: Crown, gold: 360, exp: 400 }, 
  { min: 240, name: '时光泰坦', desc: '4 小时 · 传说', icon: Gem, gold: 720, exp: 1000 } 
]

// 格式化时长统计（小时转分钟/小时）
const formatTimeStats = (hoursStr) => { 
  const hoursVal = parseFloat(hoursStr || 0); 
  if (hoursVal === 0) return '0 分钟'; 
  const totalMinutes = Math.round(hoursVal * 60); 
  if (totalMinutes < 60) {
    return `${totalMinutes} 分钟` 
  } else { 
    const h = Math.floor(totalMinutes / 60); 
    const m = totalMinutes % 60; 
    if (m === 0) return `${h} 小时`; 
    return `${h} 小时 ${m} 分钟` 
  } 
}

// 计算专注进度百分比
const progressPercent = computed(() => { 
  const duration = userStore.focusSession.duration; 
  if (!duration || duration <= 0) return 0; 
  return ((duration - timeLeft.value) / duration) * 100 
})

// 计时器tick函数（更新剩余时间）
const tick = () => { 
  if (userStore.focusSession.status !== 'running') return; 
  const now = Date.now(); 
  const endTime = userStore.focusSession.startTime + (userStore.focusSession.duration * 1000); 
  const remaining = Math.ceil((endTime - now) / 1000); 
  if (remaining <= 0) { 
    timeLeft.value = 0; 
    handleTimeUp() 
  } else { 
    timeLeft.value = remaining 
  } 
}

// 组件挂载：恢复正在进行的专注计时
onMounted(() => { 
  if (userStore.focusSession.status === 'running') { 
    tick(); 
    timerId = setInterval(tick, 1000) 
  } 
})

// 组件卸载：清除计时器
onUnmounted(() => { 
  if (timerId) clearInterval(timerId) 
})

// 开始专注挑战
const startFocus = (level) => { 
  const duration = level.min * 60; 
  const finalGold = userStore.calculateFocusBonus(level.gold); 
  userStore.focusSession = { 
    status: 'running', 
    startTime: Date.now(), 
    duration: duration, 
    levelName: level.name, 
    reward: { gold: finalGold, exp: level.exp } 
  }; 
  timeLeft.value = duration; 
  timerId = setInterval(tick, 1000) 
}

// 专注计时结束
const handleTimeUp = () => { 
  clearInterval(timerId); 
  userStore.focusSession.status = 'finished' 
}

// 领取专注奖励（更新统计数据）
const claimReward = () => { 
  const reward = userStore.focusSession.reward; 
  userStore.gold += reward.gold; 
  userStore.addExp(reward.exp); 
  const hours = (userStore.focusSession.duration / 3600); 
  userStore.focusStats.today = (parseFloat(userStore.focusStats.today || 0) + hours).toFixed(4); 
  userStore.focusStats.week = (parseFloat(userStore.focusStats.week || 0) + hours).toFixed(4); 
  userStore.focusStats.month = (parseFloat(userStore.focusStats.month || 0) + hours).toFixed(4); 
  userStore.focusStats.year = (parseFloat(userStore.focusStats.year || 0) + hours).toFixed(4); 
  userStore.focusStats.totalCount = (userStore.focusStats.totalCount || 0) + 1; 
  userStore.focusStats.totalGold = (userStore.focusStats.totalGold || 0) + reward.gold; 
  userStore.battleHistory.unshift({ 
    monster: userStore.focusSession.levelName.split(' ')[0], 
    time: getCurrentTimeStr(), 
    gold: reward.gold 
  }); 
  userStore.focusSession.status = 'idle' 
}

// 放弃专注挑战（确认弹窗）
const giveUp = async () => { 
  const ok = await showConfirm('放弃挑战将无法获得奖励，确定要放弃吗？', '放弃挑战', '确定放弃', '继续坚持'); 
  if(ok) { 
    clearInterval(timerId); 
    userStore.focusSession.status = 'idle' 
  } 
}

// 清空战斗记录（确认弹窗）
const clearHistory = async () => { 
  const ok = await showConfirm('确定要清空所有战斗记录吗？(不会影响左侧的总统计)', '清空记录'); 
  if(ok) { 
    userStore.battleHistory = [] 
  } 
}

// 重置挑战次数（确认弹窗）
const resetCount = async () => { 
  if(await showConfirm('确定要清零总挑战次数吗？', '重置数据')) userStore.focusStats.totalCount = 0 
}

// 重置累计收益（确认弹窗）
const resetGold = async () => { 
  if(await showConfirm('确定要清零地下城累计收益吗？', '重置数据')) userStore.focusStats.totalGold = 0 
}
</script>

<style scoped>
/* 基础重置 - 统一盒模型、解决布局挤压 */
html, body { 
  margin: 0; 
  padding: 0; 
  overflow-x: auto; 
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: inherit;
}

/* 页面容器 - 基础布局 */
.page-bg { 
  height: 100%; 
  display: flex; 
  justify-content: flex-start; 
  align-items: flex-start; 
  padding: 40px; 
  min-height: 100vh;
}

/* 布局容器 - 自适应宽度、避免挤压 */
.layout-container { 
  display: flex; 
  gap: 30px; 
  width: fit-content; 
  min-width: calc(100% - 80px); 
  height: 85vh; 
  align-items: stretch; 
  z-index: 2; 
}

/* 侧边栏 - 固定宽度、禁止压缩 */
.side-panel { 
  width: 320px; 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
  flex-shrink: 0;
}

/* 中间面板 - 自适应剩余空间 */
.center-panel { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  min-width: 600px;
}

/* 基础卡片样式 */
.info-card, .dungeon-wrapper, .tip-box { 
  background: var(--card-bg); 
  border-radius: 24px; 
  box-shadow: 0 8px 24px var(--shadow); 
  border: 1px solid var(--border-color); 
}
.info-card { 
  padding: 25px; 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
}

/* 统计面板样式 */
.panel-title { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 18px; 
  font-weight: 900; 
  color: var(--text-main); 
  margin-bottom: 25px; 
}
.time-stat-list { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}
.stat-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 12px 15px; 
  background: var(--hover-bg); 
  border-radius: 12px; 
}
.stat-label { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 13px; 
  color: var(--text-sub); 
  font-weight: 700; 
}
.dot { 
  width: 8px; 
  height: 8px; 
  border-radius: 50%; 
}
.dot.yellow { background: #fbbf24; } 
.dot.green { background: #34d399; } 
.dot.blue { background: #60a5fa; } 
.dot.red { background: #f87171; }
.stat-val { 
  font-size: 16px; 
  font-weight: 900; 
  color: var(--text-main); 
}
.divider { 
  height: 1px; 
  background: var(--border-color); 
  margin: 20px 0; 
  opacity: 0.5; 
}
.mini-stats { 
  display: flex; 
  justify-content: space-between; 
}
.mini-item { 
  display: flex; 
  flex-direction: column; 
  text-align: center; 
  width: 48%; 
  background: var(--input-bg); 
  padding: 10px; 
  border-radius: 12px; 
  border: 1px solid var(--border-color); 
}
.mini-head { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 4px; 
  margin-bottom: 4px; 
}
.mini-head span { 
  font-size: 10px; 
  color: var(--text-sub); 
}
.mini-reset-btn { 
  background: transparent; 
  border: none; 
  padding: 0; 
  color: var(--text-sub); 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  transition: 0.2s; 
}
.mini-reset-btn:hover { 
  color: var(--primary); 
  transform: rotate(180deg); 
}
.mini-item strong { 
  font-size: 15px; 
  color: var(--text-main); 
}
.gold-text { 
  color: var(--primary-dark) !important; 
}

/* 小贴士样式 */
.tip-box { 
  background: var(--hover-bg); 
  padding: 20px; 
  display: flex; 
  gap: 12px; 
  align-items: flex-start; 
  color: var(--text-sub); 
  border: 1px dashed var(--border-color); 
}
.tip-icon { 
  flex-shrink: 0; 
  color: var(--primary); 
  margin-top: 2px; 
}
.tip-box p { 
  margin: 0; 
  font-size: 13px; 
  line-height: 1.5; 
  font-weight: 600; 
}

/* 地下城容器样式 */
.dungeon-wrapper { 
  height: 100%; 
  padding: 40px 50px; 
  display: flex; 
  flex-direction: column; 
  background: var(--card-bg); 
  border-radius: 32px; 
}
.dungeon-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 30px; 
}
.header-left h2 { 
  font-size: 32px; 
  font-weight: 900; 
  margin: 0 0 5px 0; 
  color: var(--text-main); 
}
.subtitle { 
  font-size: 14px; 
  font-family: 'Comic Sans MS', cursive; 
  color: var(--text-sub); 
  opacity: 0.6; 
}
.header-decoration { 
  color: var(--border-color); 
  transform: rotate(15deg); 
}

/* 关卡选择样式 */
.stage-select { 
  flex: 1; 
  overflow-y: auto; 
  padding-right: 5px; 
}
.card-grid { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 20px; 
  padding-top: 30px; 
  padding-bottom: 10px; 
}
.game-card { 
  background: var(--input-bg); 
  border: 2px solid transparent; 
  border-radius: 24px; 
  padding: 25px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  text-align: center; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  position: relative; 
  min-height: 220px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
}
.game-card:hover { 
  transform: translateY(-6px); 
  box-shadow: 0 15px 30px var(--shadow); 
  border-color: var(--primary); 
}
.unified-bg { 
  background: var(--hover-bg); 
  color: var(--text-main); 
}
.card-icon-bg { 
  width: 70px; 
  height: 70px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-bottom: 15px; 
  transition: 0.3s; 
}
.unified-icon { 
  color: var(--text-sub); 
  opacity: 0.8; 
}
.game-card:hover .unified-bg { 
  background: var(--primary); 
}
.game-card:hover .unified-icon { 
  color: white; 
  opacity: 1; 
}
.card-content h3 { 
  margin: 0 0 5px 0; 
  font-size: 16px; 
  font-weight: 800; 
  color: var(--text-main); 
}
.card-content p { 
  margin: 0; 
  font-size: 12px; 
  color: var(--text-sub); 
  font-weight: 600; 
  opacity: 0.6; 
}
.card-footer { 
  margin-top: auto; 
}
.reward-pill { 
  display: inline-flex; 
  align-items: center; 
  gap: 4px; 
  background: var(--card-bg); 
  color: var(--text-sub); 
  font-size: 13px; 
  font-weight: 800; 
  padding: 6px 14px; 
  border-radius: 20px; 
  border: 1px solid var(--border-color); 
}

/* 专注中样式 */
.running-card, .result-card { 
  width: 100%; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
}
.timer-section { 
  position: relative; 
  width: 200px; 
  height: 200px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-bottom: 30px; 
}
.timer-ring { 
  position: absolute; 
  inset: 0; 
  border-radius: 50%; 
  border: 4px solid var(--hover-bg); 
  border-top-color: var(--primary); 
  animation: spin 2s linear infinite; 
}
.big-timer { 
  font-size: 56px; 
  font-weight: 900; 
  color: var(--text-main); 
  font-family: monospace; 
}
.running-status { 
  font-size: 18px; 
  font-weight: 800; 
  color: var(--primary-dark); 
  margin-bottom: 20px; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.status-dot { 
  width: 8px; 
  height: 8px; 
  background: var(--primary); 
  border-radius: 50%; 
  animation: pulse 1s infinite; 
}
.progress-bar-thin { 
  width: 60%; 
  height: 6px; 
  background: var(--hover-bg); 
  border-radius: 3px; 
  overflow: hidden; 
  margin-bottom: 40px; 
}
.fill { 
  height: 100%; 
  background: var(--primary); 
  transition: width 1s linear; 
}
.btn-cancel { 
  background: var(--card-bg); 
  border: 1px solid var(--border-color); 
  padding: 10px 30px; 
  border-radius: 12px; 
  cursor: pointer; 
  color: var(--text-sub); 
  font-weight: 700; 
  transition: 0.2s; 
}
.btn-cancel:hover { 
  border-color: #ef4444; 
  color: #ef4444; 
}

/* 挑战成功样式 */
.trophy-icon { 
  color: var(--primary); 
  margin-bottom: 20px; 
  animation: bounce 1s; 
}
.result-card h3 { 
  font-size: 32px; 
  margin: 0 0 40px 0; 
  color: var(--text-main); 
}
.loot-list { 
  display: flex; 
  gap: 40px; 
  margin-bottom: 40px; 
}
.loot-item { 
  text-align: center; 
}
.loot-item span { 
  display: block; 
  font-size: 13px; 
  color: var(--text-sub); 
  margin-bottom: 5px; 
  opacity: 0.7; 
}
.loot-item strong { 
  display: block; 
  font-size: 32px; 
  font-weight: 900; 
}
.exp-text { 
  color: #059669; 
}
.btn-primary { 
  background: var(--primary); 
  color: white; 
  border: none; 
  padding: 16px 48px; 
  border-radius: 16px; 
  font-size: 18px; 
  font-weight: 800; 
  cursor: pointer; 
  transition: 0.2s; 
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.25); 
}
.btn-primary:hover { 
  transform: translateY(-3px); 
}

/* 战斗记录样式 */
.history-card { 
  background: var(--card-bg); 
  border-radius: 24px; 
  padding: 25px; 
  box-shadow: 0 8px 24px var(--shadow); 
}
.panel-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding-bottom: 15px; 
  border-bottom: 1px solid var(--border-color); 
  margin-bottom: 15px; 
}
.ph-left { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-weight: 800; 
  color: var(--text-main); 
}
.clear-btn { 
  color: var(--text-sub); 
  cursor: pointer; 
  background: transparent; 
  border: none; 
  padding: 4px; 
  border-radius: 4px; 
  transition: 0.2s; 
  opacity: 0.6; 
}
.clear-btn:hover { 
  opacity: 1; 
  background: var(--hover-bg); 
}
.history-list { 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  overflow-y: auto; 
  flex: 1; 
}
.h-item { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}
.h-icon-box { 
  width: 28px; 
  height: 28px; 
  background: var(--hover-bg); 
  color: var(--primary-dark); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.h-text { 
  flex: 1; 
}
.h-title { 
  font-size: 13px; 
  font-weight: 700; 
  color: var(--text-main); 
}
.h-time { 
  font-size: 11px; 
  color: var(--text-sub); 
  font-family: monospace; 
  opacity: 0.6; 
}
.h-reward { 
  font-size: 13px; 
  font-weight: 800; 
  color: var(--primary-dark); 
}

/* 空状态样式 */
.empty-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  gap: 12px;
  opacity: 0.8;
}
.empty-icon-box {
  width: 60px;
  height: 60px;
  background: var(--hover-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  color: var(--primary-dark);
}

/* 动画效果 */
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 响应式适配 */
@media (max-width: 1200px) {
  .layout-container { gap: 20px; }
  .side-panel { width: 280px; }
  .center-panel { min-width: 500px; }
}

@media (max-width: 1024px) {
  .layout-container {
    flex-direction: column;
    height: auto;
    gap: 20px;
    width: 100%;
  }
  
  .side-panel { width: 100%; height: auto; }
  .center-panel { height: auto; min-width: 100%; }
  .dungeon-wrapper { height: auto; min-height: 500px; padding: 20px 30px; }
  .card-grid { grid-template-columns: repeat(2, 1fr); }
  .page-bg { padding: 20px 10px; align-items: flex-start; min-height: 100vh; }
  .history-card { min-height: 300px; }
}

@media (max-width: 768px) {
  .card-grid { grid-template-columns: 1fr; }
  .dungeon-wrapper { padding: 15px 20px; min-height: 400px; }
  .loot-list { gap: 20px; }
  .btn-primary { padding: 12px 30px; font-size: 16px; }
  .big-timer { font-size: 48px; }
}
</style>
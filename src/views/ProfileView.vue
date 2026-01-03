<template>
  <div class="profile-dashboard-fix">
    <div class="main-layout-grid">
      
      <!-- 左侧：人物属性 (固定宽) -->
      <aside class="left-aside-column">
        <div class="card player-hero-card">
          <div class="avatar-container">
            <div class="avatar-outline">
              <img src="../assets/images/线条小狗 (47).png" alt="HeroAvatar" />
            </div>
            <div class="level-badge-float">Lv.{{ userStore.level }}</div>
          </div>
          
          <div class="player-titles">
            <h2 class="p-name">{{ userStore.player_name || '探索者' }}</h2>
            <div class="p-rank-tag"><Medal :size="14" /> 顶级冒险家</div>
          </div>

          <div class="p-exp-box">
            <div class="exp-nums"><span>EXP</span> <span>{{ userStore.current_exp }}/{{ userStore.max_exp }}</span></div>
            <div class="exp-track-bg"><div class="exp-fill-active" :style="{ width: (userStore.current_exp/userStore.max_exp*100) + '%' }"></div></div>
          </div>

          <div class="p-quick-records">
            <div class="qr-item"><span>登录</span><strong>{{ userStore.records.login_days }}</strong></div>
            <div class="qr-item"><span>任务</span><strong>{{ userStore.records.finished_tasks }}</strong></div>
          </div>

          <button class="p-exit-btn" @click="handleLogout">
            <LogOut :size="14" /> 退出本次冒险
          </button>
        </div>

        <div class="card stat-abilities-card">
          <div class="card-header-title">
            <Swords :size="18" stroke-width="2.5" /> <h3>能力数值</h3>
          </div>
          <div class="stat-list">
            <div v-for="(val, key) in statsList" :key="key" class="stat-row-group">
              <div class="stat-label-line">
                <div class="s-icon-name">
                  <component :is="getStatIcon(key)" :size="14" stroke-width="2.5" :color="getStatColor(key)" />
                  <span>{{ key }}</span>
                </div>
                <span class="s-val-num">{{ val }}</span>
              </div>
              <div class="s-track-bg">
                <div class="s-fill-bar" :style="{ width: (val / 100 * 100) + '%', backgroundColor: getStatColor(key) }"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧：冒险足迹 (自适应) -->
      <main class="right-main-column">
        <!-- 上部分：地图 (显示 10, 30, 50, 100 任务阈值) -->
        <div class="card adventure-map-card">
          <div class="card-header-title">
            <Map :size="18" stroke-width="2.5" /> <h3>冒险地图进度</h3>
          </div>
          <div class="map-path-flex">
            <div v-for="(stage, idx) in userStore.map_stages" :key="stage.id" 
                 class="map-node-unit" 
                 :class="{ 'is-active': userStore.records.finished_tasks >= stage.threshold, 'is-done': stage.claimed }">
              <div class="node-icon-wrapper" @click="handleClaim(stage)">
                <component :is="getMapIcon(stage.id)" :size="22" stroke-width="2.5" />
                <div class="reward-alert" v-if="!stage.claimed && userStore.records.finished_tasks >= stage.threshold">!</div>
                <Check v-if="stage.claimed" class="done-check" :size="10" stroke-width="4" />
              </div>
              <div class="node-text-labels">
                <span class="st-name">{{ stage.name }}</span>
                <span class="st-tasks">{{ stage.threshold }} 任务</span>
              </div>
              <div class="node-line-connector" v-if="idx < userStore.map_stages.length - 1"></div>
            </div>
          </div>
        </div>

        <!-- 下部分：日历 & 日志 -->
        <div class="bottom-sync-grid">
          
          <!-- 日历 -->
          <div class="card calendar-full-card">
            <div class="calendar-nav-header">
              <div class="h-title-left"><CalendarCheck :size="18" stroke-width="2.5" /> <h3>冒险考勤</h3></div>
              
              <div class="month-selector-container">
                <button @click="changeMonth(-1)" class="nav-arrow-btn"><span class="arrow-icon">&lt;</span></button>
                <div class="month-trigger" @click="showMonthPicker = !showMonthPicker">
                  <span class="current-date-text">{{ viewDate.getFullYear() }}年 {{ viewDate.getMonth() + 1 }}月</span>
                  <ChevronDown :size="18" stroke-width="3.5" class="dropdown-arrow" :class="{ 'is-open': showMonthPicker }"/>
                </div>
                <button @click="changeMonth(1)" class="nav-arrow-btn"><span class="arrow-icon">&gt;</span></button>
                <transition name="pop-down">
                  <div v-if="showMonthPicker" class="month-picker-popover">
                    <div class="picker-year-row">
                      <button @click="changeYear(-1)" class="year-arrow-btn"><span>&lt;</span></button>
                      <span class="year-text">{{ viewDate.getFullYear() }}</span>
                      <button @click="changeYear(1)" class="year-arrow-btn"><span>&gt;</span></button>
                    </div>
                    <div class="picker-month-grid">
                      <div v-for="m in 12" :key="m" class="month-cell" :class="{ 'active': m === (viewDate.getMonth() + 1) }" @click="jumpToMonth(m)">{{ m }}月</div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            
            <div class="calendar-render-box">
              <div class="cal-week-labels">
                <span v-for="w in ['一','二','三','四','五','六','日']" :key="w">{{ w }}</span>
              </div>
              <div class="cal-days-grid">
                <div v-for="day in calendarDays" :key="day.fullDate" 
                     class="cal-day-cell" 
                     :class="{ 'is-today': day.isToday, 'is-done': day.isIDone, 'not-this-month': !day.isCurrentMonth }">
                  {{ day.dayNum }}
                </div>
              </div>
            </div>
            <div class="cal-status-footer">
              <Sparkles :size="14" color="#FFB300" /> 本月已达成累计打卡 <span>{{ selectedMonthCheckCount }}</span> 天
            </div>
          </div>

          <!-- 冒险日志 -->
          <div class="card adventure-log-card">
            <!-- 日志标题栏 + 清空按钮 -->
            <div class="log-header-wrapper">
              <div class="card-header-title">
                <ScrollText :size="18" stroke-width="2.5" /> <h3>冒险记录日志</h3>
              </div>
              <button 
                class="log-clear-btn" 
                @click="handleClearLogs"
                :disabled="userStore.logs.length === 0"
              >
                <Trash2 :size="14" stroke-width="2.5" /> 清空记录
              </button>
            </div>
            
            <!-- 日志内容滚动区域 -->
            <div class="log-container-scroll">
              <div v-for="log in userStore.logs" :key="log.id" class="log-row-item">
                <div class="log-icon-box" :class="getLogStyle(log.content).class">
                  <component :is="getLogStyle(log.content).icon" :size="15" stroke-width="2.5" />
                </div>
                <div class="log-text-content">
                  <span class="log-timestamp">{{ log.time }}</span>
                  <span class="log-message">{{ formatLogText(log.content) }}</span>
                </div>
              </div>
              <div v-if="userStore.logs.length === 0" class="log-empty-state">暂无任何冒险记录...</div>
            </div>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showConfirm } from '../utils/dialog'
import { 
  Medal, Swords, Map, ScrollText, Check, Brain, HeartPulse, 
  Target, Sparkles, Smile, Zap, Home, Trees, Tent, Waves, Cloud, Castle, 
  CalendarCheck, LogOut, ChevronDown, Trash2,
  TrendingUp, Coins, CheckCircle2, MapPin, Trophy 
} from 'lucide-vue-next'

// 初始化状态和路由
const userStore = useUserStore()
const router = useRouter()

// 强制初始化地图进度为 10/30/50/100 任务阈值
if (!userStore.map_stages || userStore.map_stages.length !== 4 || userStore.map_stages[0].threshold !== 10) {
  userStore.map_stages = [
    { id: 1, name: '新手村', threshold: 10, claimed: false },
    { id: 2, name: '迷雾森林', threshold: 30, claimed: false },
    { id: 3, name: '荒野沙漠', threshold: 50, claimed: false },
    { id: 4, name: '深海神殿', threshold: 100, claimed: false }
  ]
}

// 计算人物能力数值列表
const statsList = computed(() => ({
  '力量': userStore.stats.strength, '智力': userStore.stats.intelligence,
  '体质': userStore.stats.stamina, '专注': userStore.stats.focus,
  '魅力': userStore.stats.charm, '灵感': userStore.stats.creativity
}))

// 获取能力数值对应图标
const getStatIcon = (key) => ({ 
  '力量': Zap, '智力': Brain, '体质': HeartPulse, 
  '专注': Target, '魅力': Smile, '灵感': Sparkles 
}[key] || Zap)

// 获取能力数值对应颜色
const getStatColor = (key) => ({ 
  '力量': '#FFB74D', '智力': '#64B5F6', '体质': '#81C784', 
  '专注': '#FF8A65', '魅力': '#F06292', '灵感': '#BA68C8' 
}[key] || '#ccc')

// 获取地图节点对应图标
const getMapIcon = (id) => ({ 1: Home, 2: Trees, 3: Tent, 4: Waves }[id] || Home)

// 格式化日志文本（移除emoji）
const formatLogText = (msg) => {
  if (!msg) return ''
  return msg.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
}

// 获取日志样式（图标+背景色）
const getLogStyle = (msg) => {
  if (!msg) return { icon: ScrollText, class: 'style-default' }
  if (msg.includes('升级') || msg.includes('Lv.')) return { icon: TrendingUp, class: 'style-up' }
  if (msg.includes('金币') || msg.includes('赏金')) return { icon: Coins, class: 'style-gold' }
  if (msg.includes('任务') || msg.includes('委托')) return { icon: CheckCircle2, class: 'style-task' }
  if (msg.includes('抵达')) return { icon: MapPin, class: 'style-map' }
  if (msg.includes('成就')) return { icon: Trophy, class: 'style-gold' }
  return { icon: ScrollText, class: 'style-default' }
}

// 日历相关状态
const viewDate = ref(new Date())
const showMonthPicker = ref(false) 

// 切换月份/年份
const changeMonth = (step) => { viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + step, 1) }
const changeYear = (step) => { viewDate.value = new Date(viewDate.value.getFullYear() + step, viewDate.value.getMonth(), 1) }
const jumpToMonth = (month) => {
  viewDate.value = new Date(viewDate.value.getFullYear(), month - 1, 1)
  showMonthPicker.value = false 
}

// 计算日历渲染数据
const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear(), month = viewDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  
  // 修复：周日(0)视为7，计算前置空格
  let dayOfWeek = firstDay.getDay()
  let startOffset = dayOfWeek === 0 ? 7 : dayOfWeek
  
  const days = []
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  
  // 渲染上个月剩余天数
  for (let i = startOffset - 1; i > 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i + 1)
    days.push({ dayNum: d.getDate(), fullDate: formatDate(d), isCurrentMonth: false, isToday: false, isIDone: false })
  }
  
  // 渲染当月天数
  const lastDay = new Date(year, month + 1, 0).getDate()
  const todayStr = formatDate(new Date())
  for (let i = 1; i <= lastDay; i++) {
    const d = new Date(year, month, i), dateStr = formatDate(d)
    days.push({ 
      dayNum: i, 
      fullDate: dateStr, 
      isCurrentMonth: true, 
      isToday: dateStr === todayStr, 
      isIDone: userStore.checkInDates?.includes(dateStr) || false
    })
  }
  
  // 补齐下个月天数（凑42格）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ dayNum: d.getDate(), fullDate: formatDate(d), isCurrentMonth: false, isToday: false, isIDone: false })
  }
  return days
})

// 计算选中月份打卡天数
const selectedMonthCheckCount = computed(() => {
  if (!userStore.checkInDates) return 0
  const prefix = formatDate(viewDate.value).slice(0, 7)
  return userStore.checkInDates.filter(d => d.startsWith(prefix)).length
})

// 日期格式化（YYYY-MM-DD）
function formatDate(date) {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 领取地图阶段奖励
const handleClaim = (stage) => { 
  if (!stage || !userStore?.records) return
  if (userStore.records.finished_tasks >= stage.threshold && !stage.claimed) {
    userStore.claimStageReward(stage.id)
  }
}

// 退出登录
const handleLogout = async () => { 
  const ok = await showConfirm('确定要退出当前的冒险吗？', '退出登录', '退出', '留下')
  if (ok) { 
    userStore.logout()
    router.push('/login')
  } 
}

// 清空冒险日志
const handleClearLogs = async () => {
  const confirm = await showConfirm(
    '确定要清空所有冒险日志记录吗？此操作不可恢复！',
    '清空日志',
    '确认清空',
    '取消'
  )
  
  if (confirm) {
    userStore.clearLogs()
  }
}
</script>

<style scoped>
/* 基础布局样式 */
.profile-dashboard-fix { 
  font-family: 'Nunito', sans-serif; 
  height: 100vh !important; 
  background-color: var(--bg-color); 
  color: var(--text-main); 
  padding: 30px; 
  box-sizing: border-box !important; 
  overflow: auto;
}

.main-layout-grid { 
  display: grid; 
  grid-template-columns: 280px 1fr; 
  gap: 20px; 
  height: 100%; 
}

.card { 
  background: var(--card-bg); 
  border-radius: 20px; 
  box-shadow: 0 4px 12px var(--shadow); 
  border: 1px solid var(--border-color); 
  padding: 20px; 
  box-sizing: border-box; 
  display: flex; 
  flex-direction: column; 
}

.card-header-title { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 16px; 
  font-weight: 900; 
  color: var(--text-main); 
  margin-bottom: 15px; 
  flex-shrink: 0; 
}

/* 左侧人物属性栏 */
.left-aside-column { 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  height: 100%; 
  overflow: hidden; 
}

.player-hero-card { 
  text-align: center; 
  flex-shrink: 0; 
}

.avatar-container { 
  position: relative; 
  width: 80px; 
  height: 80px; 
  margin: 0 auto 10px; 
}

.avatar-outline { 
  width: 100%; 
  height: 100%; 
  background: #fff; 
  border: 3px solid var(--primary); 
  border-radius: 24px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}

.avatar-outline img { 
  width: 70%; 
}

.level-badge-float { 
  position: absolute; 
  bottom: -6px; 
  right: -6px; 
  background: var(--primary); 
  color: #fff; 
  padding: 2px 8px; 
  border-radius: 10px; 
  font-weight: 900; 
  font-size: 10px; 
  border: 2px solid #fff; 
}

.p-name { 
  font-size: 20px; 
  margin: 0 0 5px; 
  color: var(--text-main); 
}

.p-rank-tag { 
  display: inline-flex; 
  align-items: center; 
  gap: 4px; 
  background: var(--hover-bg); 
  color: var(--primary-dark); 
  padding: 4px 10px; 
  border-radius: 8px; 
  font-size: 11px; 
  font-weight: 800; 
}

.p-exp-box { 
  margin: 15px 0; 
}

.exp-nums { 
  display: flex; 
  justify-content: space-between; 
  font-size: 10px; 
  font-weight: 900; 
  color: var(--text-sub); 
  margin-bottom: 4px; 
}

.exp-track-bg { 
  height: 6px; 
  background: var(--hover-bg); 
  border-radius: 3px; 
  overflow: hidden; 
}

.exp-fill-active { 
  height: 100%; 
  background: var(--primary); 
  transition: 0.6s; 
}

.p-quick-records { 
  display: flex; 
  gap: 8px; 
  margin-bottom: 15px; 
}

.qr-item { 
  flex: 1; 
  background: var(--hover-bg); 
  padding: 10px; 
  border-radius: 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
}

.qr-item span { 
  font-size: 10px; 
  color: var(--text-sub); 
}

.qr-item strong { 
  font-size: 16px; 
  font-weight: 900; 
  color: var(--text-main); 
}

.p-exit-btn { 
  width: 100%; 
  background: #fff1f2; 
  color: #e11d48; 
  border: 1.5px solid #fecdd3; 
  padding: 8px; 
  border-radius: 12px; 
  font-weight: 800; 
  font-size: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 6px; 
  cursor: pointer; 
  transition: 0.2s; 
}

.p-exit-btn:hover { 
  background: #ffe4e6; 
  transform: translateY(-2px); 
}

.stat-abilities-card { 
  flex: 1; 
  min-height: 0; 
  overflow-y: auto; 
}

.stat-list { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.stat-row-group { 
  margin-bottom: 2px; 
}

.stat-label-line { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 4px; 
  font-size: 13px; 
  font-weight: 800; 
}

.s-icon-name { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  color: var(--text-sub); 
}

.s-track-bg { 
  height: 5px; 
  background: var(--hover-bg); 
  border-radius: 3px; 
  overflow: hidden; 
}

.s-fill-bar { 
  height: 100%; 
  border-radius: 3px; 
  transition: 1s ease-out; 
}

/* 右侧冒险足迹区 */
.right-main-column { 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  height: 100%; 
  overflow: hidden; 
}

.adventure-map-card { 
  flex-shrink: 0; 
  padding: 20px; 
}

.map-path-flex { 
  display: flex; 
  justify-content: space-between; 
  padding: 10px 10px 0; 
  position: relative; 
}

.map-node-unit { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  position: relative; 
  z-index: 2; 
}

.node-icon-wrapper { 
  width: 44px; 
  height: 44px; 
  background: var(--card-bg); 
  border: 2px solid #fcd34d; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #fcd34d; 
  cursor: pointer; 
  transition: 0.3s; 
  position: relative; 
}

.is-active .node-icon-wrapper { 
  border-color: var(--primary); 
  color: var(--primary-dark); 
  background: var(--hover-bg); 
}

.is-done .node-icon-wrapper { 
  background: var(--primary); 
  color: #fff; 
  border-color: var(--primary); 
}

.node-line-connector { 
  position: absolute; 
  top: 22px; 
  left: 50%; 
  width: 100%; 
  height: 3px; 
  background: var(--hover-bg); 
  z-index: 1; 
}

.is-active .node-line-connector { 
  background: var(--primary); 
}

.reward-alert { 
  position: absolute; 
  top: -30px; 
  background: #ef4444; 
  color: #fff; 
  font-size: 10px; 
  padding: 2px 8px; 
  border-radius: 8px; 
  font-weight: 900; 
  animation: bounce 1s infinite; 
}

.done-check { 
  position: absolute; 
  bottom: -3px; 
  right: -3px; 
  background: #34d399; 
  color: #fff; 
  border-radius: 50%; 
  padding: 2px; 
  border: 2px solid #fff; 
}

.node-text-labels { 
  margin-top: 8px; 
  text-align: center; 
}

.st-name { 
  display: block; 
  font-size: 13px; 
  font-weight: 900; 
  color: var(--text-main); 
}

.st-tasks { 
  font-size: 10px; 
  color: var(--text-sub); 
}

/* 日历&日志同步高度布局 */
.bottom-sync-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 15px; 
  flex: 1; 
  min-height: 0;
  align-items: stretch;
}

.calendar-full-card { 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  min-height: 0;
}

/* 冒险日志卡片 */
.adventure-log-card { 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  min-height: 0;
}

/* 日志标题栏 */
.log-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

/* 清空日志按钮 */
.log-clear-btn {
  background: #fef2f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: 0.2s;
}

.log-clear-btn:hover:not(:disabled) {
  background: #fee2e2;
}

.log-clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #9e9e9e;
  border-color: #e5e7eb;
}

/* 日志内容滚动区域 */
.log-container-scroll { 
  flex: 1; 
  overflow-y: auto; 
  padding-right: 5px; 
  scrollbar-width: thin; 
  scrollbar-color: var(--primary) transparent; 
  max-height: 400px;
}

.log-container-scroll::-webkit-scrollbar { 
  width: 5px; 
}

.log-container-scroll::-webkit-scrollbar-track { 
  background: transparent; 
}

.log-container-scroll::-webkit-scrollbar-thumb { 
  background: var(--primary); 
  border-radius: 3px; 
}

/* 日历渲染区域 */
.calendar-render-box { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  min-height: 0;
}
.cal-days-grid { 
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  gap: 6px; 
  grid-auto-rows: 1fr; 
  flex: 1;
  min-height: 200px;
}

.calendar-nav-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 15px; 
  flex-shrink: 0; 
}

.month-selector-container { 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  background: var(--hover-bg); 
  padding: 4px 8px; 
  border-radius: 10px; 
  border: 1px solid var(--border-color); 
  position: relative; 
}

.nav-arrow-btn { 
  width: 24px; 
  height: 24px; 
  background: transparent; 
  border: none; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  color: var(--primary-dark); 
  font-weight: 900; 
}

.current-date-text { 
  font-size: 14px; 
  font-weight: 900; 
  color: var(--text-main); 
  min-width: 80px; 
  text-align: center; 
}

.month-picker-popover { 
  position: absolute; 
  top: 100%; 
  left: 0; 
  right: 0; 
  background: var(--card-bg); 
  border-radius: 12px; 
  border: 1.5px solid var(--primary); 
  padding: 10px; 
  z-index: 100; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
}

.picker-year-row { 
  display: flex; 
  justify-content: center; 
  gap: 10px; 
  margin-bottom: 10px; 
}

.year-arrow-btn { 
  width: 24px; 
  height: 24px; 
  background: transparent; 
  border: none; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  color: var(--text-main); 
}

.picker-month-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 5px; 
}

.month-cell { 
  font-size: 12px; 
  padding: 6px 0; 
  text-align: center; 
  border-radius: 6px; 
  cursor: pointer; 
  color: var(--text-main); 
}

.month-cell:hover { 
  background: var(--hover-bg); 
}

.month-cell.active { 
  background: var(--primary); 
  color: #fff; 
}

.cal-week-labels { 
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  margin-bottom: 8px; 
}

.cal-week-labels span { 
  font-size: 11px; 
  color: var(--text-sub); 
  font-weight: 800; 
  text-align: center; 
}

.cal-day-cell { 
  border-radius: 8px; 
  background: var(--input-bg); 
  border: 1px solid var(--border-color); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 12px; 
  font-weight: 700; 
  color: var(--text-main); 
}

.cal-day-cell.is-done { 
  background: var(--primary); 
  color: #fff; 
  border-color: var(--primary); 
}

.cal-day-cell.is-today { 
  border: 2px solid var(--primary); 
  color: var(--primary-dark); 
}

.cal-day-cell.not-this-month { 
  opacity: 0.2; 
}

.cal-status-footer { 
  margin-top: 15px; 
  padding-top: 10px; 
  border-top: 1px dashed var(--border-color); 
  text-align: center; 
  font-size: 12px; 
  color: var(--text-sub); 
  flex-shrink: 0; 
}

/* 日志行样式 */
.log-row-item { 
  display: flex; 
  gap: 12px; 
  margin-bottom: 12px; 
  align-items: flex-start; 
}

.log-icon-box { 
  width: 24px; 
  height: 24px; 
  border-radius: 6px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
  margin-top: 2px; 
}

.style-up { 
  background: #FFF3E0; 
  color: #FF9800; 
}

.style-gold { 
  background: #FFF8E1; 
  color: var(--primary-dark); 
}

.style-task { 
  background: #E8F5E9; 
  color: #4CAF50; 
}

.style-map { 
  background: #E3F2FD; 
  color: #2196F3; 
}

.style-default { 
  background: #F5F5F5; 
  color: #9E9E9E; 
}

.log-text-content { 
  flex: 1; 
  border-bottom: 1px dashed var(--hover-bg); 
  padding-bottom: 8px; 
}

.log-timestamp { 
  font-size: 10px; 
  color: var(--text-sub); 
  opacity: 0.6; 
  display: block; 
  margin-bottom: 2px; 
}

.log-message { 
  font-size: 12px; 
  font-weight: 700; 
  color: var(--text-main); 
  line-height: 1.4; 
}

.log-empty-state { 
  text-align: center; 
  padding: 30px 0; 
  color: var(--text-sub); 
  font-size: 13px; 
}

/* 动画效果 */
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

/* 响应式适配 */
@media (max-width: 1200px) {
  .main-layout-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 20px;
  }
  
  .left-aside-column {
    height: auto; 
    overflow: visible;
    flex-direction: row;
    gap: 20px;
    padding-bottom: 10px;
  }
  
  .player-hero-card {
    flex: 0 0 280px;
  }
  
  .stat-abilities-card {
    flex: 1;
  }
  
  .right-main-column {
    height: auto; 
    overflow: visible;
  }
  
  .map-path-flex {
    gap: 10px;
  }
  
  .map-node-unit {
    padding: 0 5px;
  }
}

@media (max-width: 992px) {
  .left-aside-column {
    flex-direction: column;
  }
  
  .player-hero-card {
    flex: none;
  }
  
  .bottom-sync-grid {
    grid-template-columns: 1fr;
  }
  
  .log-container-scroll {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .map-path-flex {
    flex-wrap: wrap;
  }
  
  .map-node-unit {
    flex: 0 0 45%;
    margin-bottom: 20px;
  }
  
  .node-line-connector {
    display: none !important;
  }
  
  .profile-dashboard-fix {
    padding: 15px;
    height: auto;
    min-height: 100vh;
  }
  
  .log-container-scroll {
    max-height: 250px;
  }

  .log-clear-btn {
    padding: 3px 8px;
    font-size: 10px;
  }
}
</style>
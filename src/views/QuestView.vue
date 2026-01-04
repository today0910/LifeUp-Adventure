<template>
  <div class="quest-view">
    <!-- 头部区域：包含标题、装饰图、功能按钮 -->
    <div class="header">
      <div class="title-group">
        <h1>任务看板</h1>
        <div class="subtitle-wrapper">
          <Sprout :size="18" stroke-width="2.5" class="icon-sprout" />
          <span class="subtitle-text">Keep going, keep growing.</span>
        </div>
      </div>

      <!-- 线条小狗装饰：仅桌面端显示 -->
      <img src="../assets/images/线条小狗 (60).png" class="mascot-dog" alt="Cute Dog" />

      <div class="header-actions">
        <button 
          class="report-btn" 
          @click="showReport = !showReport" 
          :class="{ active: showReport }"
        >
          <BarChart3 :size="18" stroke-width="2.5" /> 总结报告
        </button>
        <button class="add-btn" @click="showModal = true">
          <Plus :size="18" stroke-width="2.5" /> 新建任务
        </button>
      </div>
    </div>

    <!-- 总结报告：展开/收起切换 -->
    <transition name="expand">
      <div v-if="showReport" class="summary-section">
        <div class="summary-tabs">
          <button 
            v-for="tab in ['全周期', '本月', '本年度']" 
            :key="tab" 
            @click="activeReportTab = tab" 
            :class="{ active: activeReportTab === tab }" 
            class="tab-btn"
          >
            {{ tab }}
          </button>
        </div>
        <div class="report-grid">
          <div v-for="item in reportCards" :key="item.label" class="report-card">
            <div class="report-icon"><component :is="item.icon" :size="24" stroke-width="2.5" /></div>
            <div class="report-info">
              <span class="label">{{ item.label }}</span>
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 看板布局：拖拽排序+移动端折叠 -->
    <div class="kanban-board">
      <div 
        v-for="col in columns" 
        :key="col.id" 
        class="kanban-column" 
        :class="[col.id, { 'is-collapsed': !expandedCols[col.id] }]" 
        @dragover.prevent 
        @drop="onDrop($event, col.id)"
      >
        <!-- 列标题：点击切换展开/收起（仅移动端生效） -->
        <div class="col-header" @click="toggleColumn(col.id)">
          <div class="col-title-group">
            <ChevronDown 
              :size="18" 
              stroke-width="2.5" 
              class="collapse-arrow" 
              :class="{ 'is-active': expandedCols[col.id] }"
            />
            <span :class="['dot', col.dotClass]"></span>
            <span class="col-title">{{ col.title }}</span>
            <span class="count">{{ col.tasks.length }}</span>
          </div>
          
          <!-- 清空列按钮：无任务时禁用 -->
          <button 
            class="clear-btn" 
            :disabled="col.tasks.length === 0" 
            @click.stop="clearColumn(col.id)" 
            :title="col.tasks.length > 0 ? '清空此列表' : '列表为空'"
          >
            <Trash2 :size="14" stroke-width="2.5" />
          </button>
        </div>

        <!-- 任务列表：展开/收起动画 -->
        <transition name="col-content">
          <div class="task-list" v-show="expandedCols[col.id]">
            <div 
              v-for="task in col.tasks" 
              :key="task.id" 
              class="kanban-card" 
              :class="[task.difficulty, { 'overdue-card': col.id === 'expired' }]" 
              :draggable="col.id !== 'done' && col.id !== 'expired'" 
              @dragstart="onDragStart($event, task)"
              @click="openDetail(task)"
            >
              <div class="card-tags">
                <span class="tag difficulty">{{ getPriorityLabel(task.difficulty) }}</span>
                <span class="tag reward">
                  <Coins :size="12" stroke-width="2.5" /> {{ userStore.calculateReward(task.difficulty) }}
                </span>
              </div>
              <h4>{{ task.title }}</h4>
              <p v-if="task.desc" class="card-desc">{{ task.desc }}</p>
              <div class="card-footer">
                <div v-if="task.steps?.length" class="footer-item">
                  <ListChecks :size="14" stroke-width="2.5" /> {{ getStepProgress(task) }}
                </div>
                <div 
                  v-if="task.deadline" 
                  class="footer-item" 
                  :class="{ 'urgent': col.id === 'expired', 'is-today': isToday(task.deadline) }"
                >
                  <CalendarClock :size="14" stroke-width="2.5" /> {{ isToday(task.deadline) ? '今天' : task.deadline }}
                </div>
              </div>
            </div>
            
            <!-- 空状态提示 -->
            <div v-if="col.tasks.length === 0" class="empty-state">
              <component :is="col.emptyIcon" :size="32" stroke-width="1.5" />
              <p>{{ col.emptyText }}</p>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 新建任务弹窗 -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content rich-modal">
          <div class="modal-header">
            <h3>添加新任务</h3>
            <button class="close-x" @click="closeModal"><X :size="22" stroke-width="2.5"/></button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>任务名称</label>
              <input v-model="newTask.title" placeholder="输入任务名称" class="rich-input big-text" />
            </div>
            <div class="input-group">
              <label>详细描述</label>
              <textarea v-model="newTask.desc" placeholder="有什么详细计划？" class="rich-input rich-textarea"></textarea>
            </div>
            <div class="input-group">
              <label>任务步骤</label>
              <div v-for="(step, index) in newTask.steps" :key="index" class="step-row">
                <input v-model="newTask.steps[index]" :placeholder="'步骤 ' + (index + 1)" class="rich-input" />
                <button @click="removeStep(index)" class="step-del" v-if="newTask.steps.length > 1">
                  <Minus :size="18" stroke-width="2.5"/>
                </button>
              </div>
              <button @click="addStep" class="add-step-btn">
                <Plus :size="16" stroke-width="2.5" /> 添加子步骤
              </button>
            </div>
            <div class="input-row">
              <div class="input-group half">
                <label>优先级</label>
                <div class="priority-selector">
                  <button 
                    v-for="p in priorities" 
                    :key="p.val" 
                    @click="newTask.difficulty = p.val" 
                    :class="['p-btn', p.val, { active: newTask.difficulty === p.val }]"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>
              <div class="input-group half">
                <label>
                  <Calendar :size="16" stroke-width="2.5" style="margin-right:4px; vertical-align:text-bottom;" />
                  截至日期
                </label>
                <input v-model="newTask.deadline" type="date" class="rich-input" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-cancel">取消</button>
            <button @click="confirmAdd" class="btn-confirm">立即开启任务</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 任务详情弹窗 -->
    <transition name="modal">
      <div v-if="detailTask" class="modal-overlay" @click.self="detailTask = null">
        <div class="modal-content rich-modal detail-modal">
          <div class="modal-header">
            <div class="header-left">
              <h3>任务详情</h3>
              <span class="tag difficulty header-tag">{{ getPriorityLabel(detailTask.difficulty) }}</span>
            </div>
            <button class="close-x" @click="detailTask = null"><X :size="24" stroke-width="2.5"/></button>
          </div>
          <div class="modal-body">
            <h2 class="detail-h2">{{ detailTask.title }}</h2>
            <div class="detail-desc-box">{{ detailTask.desc || '暂无详细描述...' }}</div>
            
            <div class="detail-section">
              <label>
                <ListChecks :size="18" stroke-width="2.5" /> 子步骤进度
              </label>
              <div class="checklist">
                <div 
                  v-for="(s, i) in detailTask.steps" 
                  :key="i" 
                  class="check-item" 
                  :class="{ done: s.done, disabled: !canEditSteps }" 
                  @click="toggleStep(s)"
                >
                  <div class="checkbox">
                    <Check v-if="s.done" :size="14" stroke-width="3" color="white"/>
                  </div>
                  <span>{{ s.text }}</span>
                </div>
              </div>
            </div>

            <div class="detail-meta">
              <div class="meta-box">
                <span class="m-label">截至日期</span>
                <span class="m-val">{{ detailTask.deadline || '未设置' }}</span>
              </div>
              <div class="meta-box">
                <span class="m-label">预期奖励</span>
                <span class="m-val gold-val">{{ userStore.calculateReward(detailTask.difficulty) }} G</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="deleteTask(detailTask.id)" class="btn-del-task">
              <Trash2 :size="18" stroke-width="2.5" /> 删除该任务
            </button>
            <button 
              v-if="detailTask.status !== 'done' && !isOverdue(detailTask)" 
              @click="finishTask" 
              class="btn-confirm"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
// 1. 基础依赖导入
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { showConfirm } from '../utils/dialog'
import { getLocalToday } from '../utils'
// 图标组件导入（按使用顺序排序）
import { 
  Plus, Coins, X, BarChart3, Trophy, TrendingUp, 
  CalendarClock, ListChecks, Minus, Check, Ghost, 
  Timer, CheckCircle2, Calendar, Trash2, Sprout, ChevronDown 
} from 'lucide-vue-next'

// 2. 状态初始化
const userStore = useUserStore() // 角色状态管理
const showModal = ref(false)     // 新建任务弹窗开关
const detailTask = ref(null)     // 任务详情弹窗数据
const showReport = ref(false)    // 总结报告展开开关
const activeReportTab = ref('全周期') // 报告默认选中标签
// 新建任务表单数据
const newTask = reactive({ 
  title: '', 
  desc: '', 
  steps: [''], 
  difficulty: 'B', 
  deadline: '' 
})
// 看板列展开状态（默认全部展开）
const expandedCols = ref({ todo: true, doing: true, done: true, expired: true })

// 3. 常量定义
const priorities = [ // 任务优先级配置
  { label: '高', val: 'S' }, 
  { label: '中', val: 'B' }, 
  { label: '低', val: 'C' }
]
const todayStr = getLocalToday() // 今日日期（格式化后）

// 4. 辅助函数
/**
 * 判断任务是否过期
 * @param {Object} t - 任务对象
 * @returns {boolean} 过期状态
 */
const isOverdue = (t) => t.deadline && t.deadline < todayStr

/**
 * 判断日期是否为今日
 * @param {string} date - 日期字符串
 * @returns {boolean} 今日状态
 */
const isToday = (date) => date === todayStr

/**
 * 转换优先级值为标签（S→高/B→中/C→低）
 * @param {string} d - 优先级值
 * @returns {string} 优先级标签
 */
const getPriorityLabel = (d) => ({ 'S': '高', 'B': '中', 'C': '低' }[d])

/**
 * 计算任务子步骤进度（已完成/总数量）
 * @param {Object} t - 任务对象
 * @returns {string} 进度字符串
 */
const getStepProgress = (t) => 
  t.steps?.length ? `${t.steps.filter(s => s.done).length}/${t.steps.length}` : '0/0'

/**
 * 切换看板列展开/收起状态
 * @param {string} id - 列ID（todo/doing/done/expired）
 */
const toggleColumn = (id) => { 
  expandedCols.value[id] = !expandedCols.value[id] 
}

// 5. 计算属性
/**
 * 总结报告数据（从用户状态中提取）
 * @returns {Array} 报告卡片列表
 */
const reportCards = computed(() => [
  { label: '累计完成', value: userStore.historyStats.completedCount, icon: Trophy },
  { label: '累计金币', value: `${userStore.historyStats.totalGold} G`, icon: Coins },
  { label: '终身完成率', value: `${userStore.historyStats.rate}%`, icon: TrendingUp },
  { label: '活跃天数', value: `${userStore.checkInDates.length}天`, icon: Calendar }
])

/**
 * 看板列数据（按状态+过期筛选任务）
 * @returns {Array} 列配置列表
 */
const columns = computed(() => [
  { 
    id: 'todo', 
    title: '准备中', 
    dotClass: 'todo-dot', 
    tasks: userStore.quests.filter(q => q.status === 'todo' && !isOverdue(q)), 
    emptyText: '歇会吧', 
    emptyIcon: Ghost 
  },
  { 
    id: 'doing', 
    title: '进行中', 
    dotClass: 'doing-dot', 
    tasks: userStore.quests.filter(q => q.status === 'doing' && !isOverdue(q)), 
    emptyText: '没在忙', 
    emptyIcon: Timer 
  },
  { 
    id: 'done', 
    title: '已结项', 
    dotClass: 'done-dot', 
    tasks: userStore.quests.filter(q => q.status === 'done'), 
    emptyText: '暂无成果', 
    emptyIcon: Trophy 
  },
  { 
    id: 'expired', 
    title: '未完成/已过期', 
    dotClass: 'expired-dot', 
    tasks: userStore.quests.filter(q => q.status !== 'done' && isOverdue(q)), 
    emptyText: '太棒了', 
    emptyIcon: CheckCircle2 
  }
])

/**
 * 子步骤编辑权限（仅进行中且未过期任务可编辑）
 * @returns {boolean} 编辑权限状态
 */
const canEditSteps = computed(() => {
  if (!detailTask.value) return false
  return detailTask.value.status === 'doing' && !isOverdue(detailTask.value)
})

// 6. 核心业务逻辑
/**
 * 新增任务（表单校验+数据格式化）
 */
const confirmAdd = () => {
  // 任务名称非空校验
  if (!newTask.title.trim()) return

  // 格式化任务数据（过滤空步骤+转换步骤格式）
  userStore.addQuest({
    id: Date.now(), // 用时间戳生成唯一ID
    status: 'todo', // 默认状态为“准备中”
    ...JSON.parse(JSON.stringify(newTask)), // 深拷贝表单数据
    steps: newTask.steps
      .filter(s => s && s.trim().length > 0)
      .map(s => ({ text: s.trim(), done: false }))
  })

  // 重置表单并关闭弹窗
  closeModal()
}

/**
 * 完成任务（自动标记所有步骤为完成+调用状态管理完成逻辑）
 */
const finishTask = () => {
  if (detailTask.value) {
    // 标记所有子步骤为完成
    if (detailTask.value.steps) {
      detailTask.value.steps.forEach(step => step.done = true)
    }
    // 调用用户状态管理完成任务
    userStore.completeQuest(detailTask.value.id)
    // 关闭详情弹窗
    detailTask.value = null
  }
}

/**
 * 任务拖拽落地处理（更新任务状态+完成逻辑）
 * @param {Event} e - 拖拽事件对象
 * @param {string} targetStatus - 目标列状态
 */
const onDrop = (e, targetStatus) => {
  const taskId = parseInt(e.dataTransfer.getData('taskId'))
  const task = userStore.quests.find(q => q.id === taskId)

  if (task) {
    // 拖拽到“已结项”列：直接完成任务
    if (targetStatus === 'done' && task.status !== 'done') {
      if (task.steps) task.steps.forEach(step => step.done = true)
      userStore.completeQuest(taskId)
    } else {
      // 其他列：更新任务状态（过期列特殊处理为“准备中”）
      task.status = targetStatus === 'expired' ? 'todo' : targetStatus
    }
  }
}

/**
 * 删除任务（二次确认+状态更新+数据持久化）
 * @param {number} id - 任务ID
 */
const deleteTask = async (id) => {
  // 二次确认弹窗
  const isConfirm = await showConfirm(
    '确定要永久删除这个任务吗？(历史记录不会减少)', 
    '删除任务', 
    '删除', 
    '取消'
  )

  if (isConfirm) {
    // 过滤删除任务
    userStore.quests = userStore.quests.filter(q => q.id !== id)
    // 关闭详情弹窗
    detailTask.value = null
    // 持久化数据
    userStore.saveData()
  }
}

/**
 * 清空列任务（二次确认+过滤保留其他列任务+数据持久化）
 * @param {string} colId - 列ID
 */
const clearColumn = async (colId) => {
  // 列名映射（用于弹窗提示）
  const colNameMap = {
    'todo': '准备中',
    'doing': '进行中',
    'done': '已结项',
    'expired': '未完成/已过期'
  }

  // 二次确认弹窗
  const isConfirm = await showConfirm(
    `确定要清空【${colNameMap[colId]}】列表吗？(历史总结数据已永久保存)`, 
    '清空列表'
  )

  if (!isConfirm) return

  // 过滤保留非当前列任务
  userStore.quests = userStore.quests.filter(q => {
    const isTaskOverdue = isOverdue(q)
    switch (colId) {
      case 'todo':
        return !(q.status === 'todo' && !isTaskOverdue)
      case 'doing':
        return !(q.status === 'doing' && !isTaskOverdue)
      case 'done':
        return !(q.status === 'done')
      case 'expired':
        return !(q.status !== 'done' && isTaskOverdue)
      default:
        return true
    }
  })

  // 持久化数据
  userStore.saveData()
}

// 7. 基础交互函数
/**
 * 打开任务详情
 * @param {Object} task - 任务对象
 */
const openDetail = (task) => {
  detailTask.value = task
}

/**
 * 新增任务子步骤
 */
const addStep = () => {
  newTask.steps.push('')
}

/**
 * 删除任务子步骤
 * @param {number} index - 步骤索引
 */
const removeStep = (index) => {
  newTask.steps.splice(index, 1)
}

/**
 * 关闭新建任务弹窗（重置表单）
 */
const closeModal = () => {
  showModal.value = false
  // 重置表单数据
  Object.assign(newTask, {
    title: '',
    desc: '',
    steps: [''],
    difficulty: 'B',
    deadline: ''
  })
}

/**
 * 任务拖拽开始（传递任务ID）
 * @param {Event} e - 拖拽事件对象
 * @param {Object} task - 任务对象
 */
const onDragStart = (e, task) => {
  e.dataTransfer.setData('taskId', task.id)
}

/**
 * 切换子步骤完成状态（全完成时自动完成任务）
 * @param {Object} step - 子步骤对象
 */
const toggleStep = (step) => {
  if (canEditSteps.value) {
    step.done = !step.done
    // 所有步骤完成时，延迟自动完成任务
    const isAllDone = detailTask.value.steps.every(s => s.done)
    if (isAllDone && detailTask.value.steps.length > 0) {
      setTimeout(() => finishTask(), 300)
    }
  }
}
</script>

<style scoped>
/* 基础容器样式 */
.quest-view {
  font-family: 'Nunito', sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  color: var(--text-main);
  background-color: var(--bg-color);
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* 头部区域样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1.5px solid var(--border-color);
  position: relative;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.subtitle-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.icon-sprout {
  color: var(--primary-dark);
  animation: bounce 2s infinite;
}

.subtitle-text {
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Nunito', sans-serif;
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
  color: var(--primary-dark);
  opacity: 0.8;
  letter-spacing: 0.5px;
}

/* 按钮基础样式 */
.add-btn {
  background: var(--primary);
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px var(--shadow);
  border: none;
}

.add-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.report-btn {
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  color: var(--text-sub);
  border-radius: 12px;
  padding: 9px 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
}

.report-btn:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.report-btn.active {
  background: var(--hover-bg);
  border-color: var(--primary);
  color: var(--primary);
}

/* 线条小狗装饰（仅桌面端显示） */
.mascot-dog {
  position: absolute;
  bottom: 8px;
  left: 260px;
  width: 90px;
  pointer-events: none;
  opacity: 0.95;
  z-index: 10;
  animation: floatDog 4s ease-in-out infinite;
  transition: opacity 0.3s;
}

/* 总结报告样式 */
.summary-section {
  background: var(--card-bg);
  border-radius: 28px;
  padding: 20px;
  margin-bottom: 20px;
  border: 2px solid var(--border-color);
  box-shadow: 0 15px 35px var(--shadow);
  flex-shrink: 0;
}

.summary-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  background: var(--bg-color);
  color: var(--text-sub);
  border: none;
}

.tab-btn.active {
  background: var(--primary);
  color: white;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.report-card {
  background: var(--bg-color);
  border-radius: 20px;
  padding: 15px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 15px;
}

.report-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px var(--shadow);
}

.value {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-main);
}

/* 看板布局样式 */
.kanban-board {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: stretch;
  min-height: 480px;
  overflow-x: auto;
  padding-bottom: 20px;
}

.kanban-board::-webkit-scrollbar {
  height: 8px;
}

.kanban-board::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

.kanban-column {
  flex: 0 0 280px;
  min-width: 240px;
  max-width: 280px;
  background: var(--hover-bg);
  border-radius: 20px;
  padding: 16px;
  border: 1.5px solid var(--border-color);
  display: flex;
  flex-direction: column;
  min-height: 450px;
  max-height: calc(100vh - 250px);
  transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 900;
  color: var(--text-main);
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.col-title-group {
  display: flex;
  align-items: center;
}

/* 折叠箭头样式 */
.collapse-arrow {
  margin-right: 6px;
  transition: transform 0.3s ease;
  color: var(--text-sub);
  transform: rotate(-90deg);
}

.collapse-arrow.is-active {
  transform: rotate(0deg);
}

/* 任务列表样式 */
.task-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
}

.task-list::-webkit-scrollbar {
  width: 4px;
}

.task-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  gap: 12px;
  opacity: 0.8;
  min-height: 150px;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

/* 列展开收起动画 */
.col-content-enter-active,
.col-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}

.col-content-enter-from,
.col-content-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* 列标识点样式 */
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.todo-dot {
  background: var(--primary);
}

.doing-dot {
  background: #60a5fa;
}

.done-dot {
  background: #d6d3d1;
}

.expired-dot {
  background: #f87171;
}

.count {
  margin-left: 8px;
  background: var(--card-bg);
  padding: 1px 8px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--text-sub);
}

/* 清空按钮样式 */
.clear-btn {
  color: #ef4444;
  cursor: pointer;
  opacity: 0.8;
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  opacity: 1;
}

.clear-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
  background: transparent !important;
  color: #a8a29e;
}

/* 任务卡片样式 */
.kanban-card {
  background: var(--card-bg);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px var(--shadow);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.kanban-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: 0 6px 12px var(--shadow);
}

.kanban-column.done .kanban-card h4 {
  text-decoration: line-through !important;
  color: var(--text-sub);
  opacity: 0.6;
}

.kanban-column.done .kanban-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-color: transparent !important;
}

.card-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.difficulty {
  background: var(--primary);
  color: white;
}

.reward {
  background: var(--bg-color);
  color: var(--primary-dark);
}

h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 900;
  color: var(--text-main);
}

.card-desc {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1.5px dotted var(--border-color);
  padding-top: 8px;
  margin-top: 4px;
}

.footer-item {
  font-size: 11px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.footer-item.is-today {
  color: var(--primary-dark);
  font-weight: 900;
}

/* 弹窗基础样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--modal-overlay);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.rich-modal {
  width: 90%;
  max-width: 580px;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: 32px;
  border: 2px solid var(--border-color);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popUp 0.3s ease;
}

.modal-header {
  padding: 30px 35px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: var(--primary);
  font-size: 26px;
  font-weight: 900;
  margin: 0;
}

.modal-body {
  padding: 10px 35px 30px;
  overflow-y: auto;
}

/* 表单样式 */
.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-weight: 900;
  color: var(--text-main);
  margin-bottom: 10px;
  font-size: 15px;
}

.rich-input {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 1.5px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-main);
  font-family: inherit;
  font-size: 15px;
  transition: 0.2s;
}

.rich-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--card-bg);
}

.rich-input.big-text {
  font-size: 16px;
  font-weight: 700;
}

.rich-textarea {
  min-height: 100px;
  resize: vertical;
}

.step-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.add-step-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 2px dashed var(--border-color);
  color: var(--primary-dark);
  font-weight: 800;
  background: var(--hover-bg);
  cursor: pointer;
  transition: 0.2s;
}

.add-step-btn:hover {
  background: var(--border-color);
}

.input-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.half {
  flex: 1;
  min-width: 200px;
}

.priority-selector {
  display: flex;
  gap: 10px;
}

.p-btn {
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  font-weight: 800;
  border: 1.5px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-sub);
  cursor: pointer;
  transition: 0.2s;
}

.p-btn:hover {
  background: var(--hover-bg);
}

.p-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: scale(1.05);
}

input[type="date"] {
  cursor: pointer;
  color-scheme: light;
}

/* 任务详情弹窗样式 */
.detail-desc-box {
  background: var(--bg-color);
  padding: 18px;
  border-radius: 18px;
  margin-bottom: 25px;
  color: var(--text-main);
  line-height: 1.6;
  border: 1px solid var(--border-color);
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  transition: 0.2s;
}

.check-item:hover {
  background: var(--hover-bg);
}

.check-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--text-sub);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
}

.done .checkbox {
  background: var(--primary);
  border-color: var(--primary);
}

.detail-meta {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.meta-box {
  flex: 1;
  min-width: 150px;
  background: var(--hover-bg);
  padding: 15px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.m-label {
  font-size: 11px;
  color: var(--text-sub);
  opacity: 0.8;
}

.m-val {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
}

.gold-val {
  color: var(--primary-dark);
}

/* 弹窗底部按钮 */
.modal-footer {
  padding: 0 35px 35px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-del-task {
  padding: 16px;
  border-radius: 16px;
  font-weight: 800;
  flex: 1;
  min-width: 120px;
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: 0.2s;
  cursor: pointer;
}

.btn-del-task:hover {
  background: #ffe4e6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
}

.btn-cancel {
  padding: 16px;
  border-radius: 16px;
  font-weight: 800;
  flex: 1;
  min-width: 120px;
  background: var(--hover-bg);
  color: var(--text-sub);
  border: none;
  cursor: pointer;
}

.btn-confirm {
  flex: 2;
  min-width: 150px;
  padding: 16px;
  border-radius: 16px;
  background: var(--primary);
  color: white;
  font-weight: 900;
  border: none;
  box-shadow: 0 8px 20px var(--shadow);
  transition: 0.2s;
  cursor: pointer;
}

.btn-confirm:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.close-x {
  background: transparent;
  border: 2px solid transparent;
  color: var(--text-sub);
  border-radius: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  cursor: pointer;
}

.close-x:hover {
  background: var(--hover-bg);
  color: var(--text-main);
  border-color: var(--border-color);
}

/* 动画定义 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes floatDog {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes popUp {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s ease;
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* 响应式样式 */
@media (max-width: 1100px) {
  .mascot-dog {
    display: none;
  }
}

@media (max-width: 768px) {
  .quest-view {
    padding: 0 10px 80px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .kanban-board {
    flex-direction: column;
    height: auto;
    min-height: 0;
    overflow-x: hidden;
  }

  .kanban-column {
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    border-radius: 16px;
    margin-bottom: 5px;
    padding: 12px 16px;
    flex: none;
    max-height: none;
  }

  .kanban-column.is-collapsed {
    padding-bottom: 12px;
  }

  .col-header {
    margin-bottom: 0;
  }

  .collapse-arrow {
    display: block;
  }
}

@media (min-width: 769px) {
  .collapse-arrow {
    display: none;
  }

  .task-list {
    display: flex !important;
  }
}
</style>
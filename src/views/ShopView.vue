<template>
  <div class="shop-view page-bg">
    <!-- 提示弹窗 -->
    <transition name="toast-anim">
      <div v-if="toast.show" class="toast-message" :class="toast.type">
        <component :is="toast.icon" :size="20" /><span>{{ toast.msg }}</span>
      </div>
    </transition>

    <div class="layout-container">
      <!-- 侧边栏：NPC/钱包/统计 -->
      <aside class="side-panel">
        <div class="npc-card info-card" @click="changeDialog">
          <div class="npc-avatar-wrapper">
            <img src="../assets/images/线条小狗 (60).png" class="npc-img" />
            <div class="status-badge">营业中</div>
          </div>
          <div class="npc-bubble">
            <transition name="fade-text" mode="out-in">
              <p :key="currentDialog">{{ currentDialog }}</p>
            </transition>
          </div>
        </div>

        <div class="wallet-card info-card">
          <div class="card-header">
            <span class="label">我的小金库</span>
            <Wallet :size="16" class="icon-sub" />
          </div>
          <div class="balance-box" :class="{ 'shake-anim': isBalanceAnimating }">
            <div class="coin-circle"><Coins :size="24" stroke-width="2.5" /></div>
            <span class="balance-num">{{ userStore.gold }}</span>
          </div>
          <button class="action-btn primary-btn full-width" @click="showAddModal = true">
            <Plus :size="18" stroke-width="3" /><span>上架新奖励</span>
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-pill">
            <span class="label">累计消费</span>
            <span class="value">{{ userStore.totalSpent }}</span>
            <button class="mini-reset-btn" @click="resetSpent"><RotateCcw :size="12" /></button>
          </div>
          <div class="stat-pill">
            <span class="label">背包物品</span>
            <span class="value">{{ userStore.inventory.length }}</span>
            <button class="mini-reset-btn" @click="clearInventory"><Trash2 :size="12" /></button>
          </div>
        </div>
      </aside>

      <!-- 主面板：商店/背包切换 -->
      <main class="main-panel">
        <div class="shelf-container">
          <header class="shelf-header">
            <div class="tabs-wrapper">
              <button class="tab-item" :class="{ active: currentTab === 'shop' }" @click="currentTab = 'shop'">
                <Store :size="18" /> <span>奖励商店</span>
              </button>
              <button class="tab-item" :class="{ active: currentTab === 'inventory' }" @click="switchToInventory">
                <Backpack :size="18" /> <span>我的背包</span>
                <transition name="scale">
                  <span v-if="userStore.inventoryUnread > 0" class="badge-count">{{ userStore.inventoryUnread }}</span>
                </transition>
              </button>
            </div>
            <div v-if="currentTab === 'shop'" class="category-scroll">
              <button v-for="cat in categories" :key="cat.key" class="cat-chip" :class="{ active: currentCategory === cat.key }" @click="currentCategory = cat.key">
                {{ cat.name }}
              </button>
            </div>
          </header>

          <div class="shelf-content custom-scrollbar">
            <!-- 商店商品列表 -->
            <transition-group name="grid-anim" tag="div" class="goods-grid" v-if="currentTab === 'shop'">
              <div v-for="item in filteredShopItems" :key="item.id" class="good-card" @click="openBuyModal(item)">
                <button class="delete-item-btn" @click.stop="deleteItem(item.id)" title="下架商品">
                  <Trash2 :size="16" />
                </button>
                <div class="card-visual">
                  <div class="icon-circle">
                    <component :is="getIcon(item.icon)" :size="40" stroke-width="1.5" />
                  </div>
                </div>
                <div class="card-details">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <div class="price-pill">
                    <Coins :size="12" stroke-width="3" /> {{ item.price }}
                  </div>
                </div>
                <div class="hover-overlay"><span class="buy-text">购买</span></div>
              </div>
            </transition-group>

            <!-- 背包物品列表 -->
            <transition-group name="grid-anim" tag="div" class="goods-grid" v-else-if="currentTab === 'inventory'">
              <div v-for="item in userStore.inventory" :key="item.uniqueId" class="good-card inventory-mode">
                <div class="card-visual use-bg">
                  <div class="icon-circle use-icon">
                    <component :is="getIcon(item.icon)" :size="40" stroke-width="1.5" />
                  </div>
                </div>
                <div class="card-details">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <button class="use-btn" @click.stop="useItem(item)">立即使用</button>
                </div>
              </div>
            </transition-group>

            <!-- 空状态提示 -->
            <div v-if="currentTab === 'shop' && filteredShopItems.length === 0" class="empty-state">
              <div class="empty-icon-box"><PackageOpen :size="64" stroke-width="1.5" /></div>
              <h3>暂无该分类商品</h3>
              <p>老板去进货了？快点击左侧“上架”添加奖励吧！</p>
            </div>
            <div v-if="currentTab === 'inventory' && userStore.inventory.length === 0" class="empty-state">
              <div class="empty-icon-box"><Ghost :size="64" stroke-width="1.5" /></div>
              <h3>背包好轻啊</h3>
              <p>去商店买点什么犒劳一下自己吧~</p>
            </div>
            <div class="spacer"></div>
          </div>
        </div>
      </main>
    </div>

    <!-- 确认购买弹窗 -->
    <transition name="modal-fade">
      <div v-if="selectedItem" class="modal-backdrop" @click.self="selectedItem = null">
        <div class="modal-card">
          <button class="close-btn-clean top-right-absolute" @click="selectedItem = null">
            <CircleX :size="28" color="#451a03" stroke-width="1.5" />
          </button>
          <div class="modal-content centered">
            <div class="highlight-icon">
              <component :is="getIcon(selectedItem.icon)" :size="64" stroke-width="1.5" />
            </div>
            <h2 class="modal-title">兑换 "{{ selectedItem.name }}"</h2>
            <p class="modal-desc">这会花费你 <span class="gold-text">{{ selectedItem.price }}</span> 金币，确定要对自己好一点吗？</p>
          </div>
          <div class="modal-actions">
            <button class="action-btn secondary-btn" @click="selectedItem = null">再想想</button>
            <button class="action-btn primary-btn" @click="confirmBuy">确认支付</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 上架新奖励弹窗 -->
    <transition name="modal-fade">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="modal-card add-reward-modal">
          <div class="modal-header-row">
            <div class="title-with-icon">
              <Sparkles :size="22" class="modal-icon-decoration" color="#451a03" fill="currentColor" />
              <h3 class="modal-main-title">上架新奖励</h3>
            </div>
            <button class="close-btn-clean" @click="showAddModal = false">
              <CircleX :size="28" color="#451a03" stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div class="form-item">
              <label class="form-label">奖励名称</label>
              <input v-model="newItem.name" placeholder="例如：看一场电影" class="custom-input" />
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">价格 (金币)</label>
                <input v-model.number="newItem.price" type="number" class="custom-input" />
              </div>
              <div class="form-item">
                <label class="form-label">分类</label>
                <select v-model="newItem.category" class="custom-input select-input">
                  <option v-for="cat in categories.slice(1)" :key="cat.key" :value="cat.key">{{ cat.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">选择图标</label>
              <div class="icon-grid-box">
                <button 
                  v-for="(icon, key) in iconMap" 
                  :key="key" 
                  class="icon-select-btn" 
                  :class="{ selected: newItem.icon === key }" 
                  @click="newItem.icon = key"
                >
                  <component :is="icon" :size="22" />
                </button>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="action-btn secondary-btn" @click="showAddModal = false">取消</button>
            <button class="action-btn primary-btn" @click="addItem">立即上架</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { showConfirm } from '../utils/dialog'
import { Utensils, Store, Package, Coins, Coffee, Pizza, Gamepad2, Gift, Ticket, Music, Plane, Plus, Wallet, X, PackageOpen, Backpack, CheckCircle, AlertCircle, Ghost, Smile, Zap, RotateCcw, Trash2, Sparkles, CircleX } from 'lucide-vue-next'

// 初始化用户状态
const userStore = useUserStore()
// 初始化缺失的store字段
if (typeof userStore.inventoryUnread === 'undefined') userStore.inventoryUnread = 0
if (typeof userStore.totalSpent === 'undefined') userStore.totalSpent = 0
if (!userStore.inventory) userStore.inventory = []
// 初始化默认商品列表
if (!userStore.shop_items || userStore.shop_items.length === 0) {
  userStore.shop_items = [
    { id: 1, name: '肥宅快乐水', price: 20, icon: 'coffee', category: 'food' },
    { id: 2, name: '游戏时间券', price: 100, icon: 'game', category: 'game' },
    { id: 3, name: '喝一杯', price: 50, icon: 'pizza', category: 'food' },
    { id: 4, name: '打一个小游戏', price: 100, icon: 'game', category: 'game' },
    { id: 5, name: '周边游', price: 500, icon: 'travel', category: 'travel' }
  ]
}

// 响应式状态
const showAddModal = ref(false)      // 上架新奖励弹窗
const selectedItem = ref(null)       // 选中的购买商品
const currentTab = ref('shop')       // 当前标签（shop/inventory）
const currentCategory = ref('all')   // 当前商品分类
const isBalanceAnimating = ref(false)// 金币变动动画

// 基础交互
const switchToInventory = () => { 
  currentTab.value = 'inventory'
  userStore.inventoryUnread = 0      // 切换到背包清空未读
}

// 重置累计消费
const resetSpent = async () => { 
  const ok = await showConfirm('确定要重置“累计消费”记录吗？', '重置统计', '确定重置', '取消')
  if(ok) { 
    userStore.totalSpent = 0
    showToast('记录已重置', 'success') 
  } 
}

// 清空背包
const clearInventory = async () => { 
  if (userStore.inventory.length === 0) return
  const ok = await showConfirm('确定要清空背包吗？所有物品将消失！', '清空背包', '确认清空', '手滑了')
  if(ok) { 
    userStore.inventory = []
    userStore.inventoryUnread = 0
    showToast('背包已清空', 'success') 
  } 
}

// 下架商品
const deleteItem = async (itemId) => { 
  const ok = await showConfirm('确定要下架这个商品吗？下架后无法找回。', '下架商品', '狠心下架', '再想想')
  if (ok) { 
    userStore.shop_items = userStore.shop_items.filter(item => item.id !== itemId)
    showToast('商品已下架', 'success') 
  } 
}

// NPC对话逻辑
const npcDialogs = [
  "“ 休息是为了走更远的路 ”", 
  "“ 所有的努力，都值得被奖励！🐶 ”", 
  "“ 汪！今天的金币收益看起来不错嘛！ ”", 
  "“ 想要那个奖励吗？那就拿下它！ ”", 
  "“ 注意劳逸结合，效率更高哦~ ”"
]
const currentDialog = ref(npcDialogs[0])
let dialogTimer = null
const changeDialog = () => { 
  let nextDialog
  do { 
    nextDialog = npcDialogs[Math.floor(Math.random() * npcDialogs.length)] 
  } while (nextDialog === currentDialog.value && npcDialogs.length > 1)
  currentDialog.value = nextDialog 
}
// 挂载/卸载时处理对话定时器
onMounted(() => { dialogTimer = setInterval(changeDialog, 5000) })
onUnmounted(() => { if (dialogTimer) clearInterval(dialogTimer) })

// 购买流程
const openBuyModal = (item) => { selectedItem.value = item }
const confirmBuy = () => { 
  const itemPrice = selectedItem.value.price
  // 金币不足校验
  if (userStore.gold < itemPrice) { 
    showToast('金币不足，快去专注一会吧！', 'error')
    selectedItem.value = null
    return 
  }
  // 扣减金币、累计消费、加入背包
  userStore.gold -= itemPrice
  userStore.totalSpent += itemPrice
  userStore.inventory.unshift({ ...selectedItem.value, uniqueId: Date.now() })
  // 非背包标签时增加未读
  if (currentTab.value !== 'inventory') { 
    userStore.inventoryUnread = (userStore.inventoryUnread || 0) + 1 
  }
  // 提示+金币动画
  showToast(`成功兑换：${selectedItem.value.name}`, 'success')
  isBalanceAnimating.value = true
  setTimeout(() => isBalanceAnimating.value = false, 600)
  selectedItem.value = null 
}

// 使用背包物品
const useItem = async (item) => { 
  const ok = await showConfirm(`确定要使用“${item.name}”吗？`, '使用物品', '立即使用', '暂不使用')
  if (ok) { 
    userStore.inventory = userStore.inventory.filter(i => i.uniqueId !== item.uniqueId)
    showToast('享受你的奖励时光！✨') 
  } 
}

// 商品分类
const categories = [ 
  { name: '全部', key: 'all' }, 
  { name: '美食', key: 'food' }, 
  { name: '娱乐', key: 'game' }, 
  { name: '学习', key: 'study' }, 
  { name: '旅行', key: 'travel' } 
]

// 筛选商品（按分类）
const filteredShopItems = computed(() => { 
  if (currentCategory.value === 'all') return userStore.shop_items
  return userStore.shop_items.filter(item => item.category === currentCategory.value) 
})

// 图标映射
const iconMap = { 
  'food': Utensils, 'coffee': Coffee, 'pizza': Pizza, 
  'game': Gamepad2, 'gift': Gift, 'ticket': Ticket, 
  'music': Music, 'travel': Plane, 'smile': Smile, 'zap': Zap 
}
const getIcon = (key) => iconMap[key] || Gift

// 提示框逻辑
const toast = reactive({ show: false, msg: '', type: 'success', icon: CheckCircle })
const showToast = (msg, type = 'success') => { 
  toast.msg = msg
  toast.type = type
  toast.icon = type === 'success' ? CheckCircle : AlertCircle
  toast.show = true
  setTimeout(() => toast.show = false, 3000) 
}

// 上架新奖励
const newItem = reactive({ name: '', price: 50, icon: 'coffee', category: 'food' })
const addItem = () => { 
  if (!newItem.name) return showToast('请输入奖励名称', 'error')
  userStore.shop_items.push({ id: Date.now(), ...newItem })
  showToast('上架成功！')
  showAddModal.value = false
  newItem.name = '' 
}
</script>

<style scoped>
/* 基础布局 */
.shop-view { height: 100%; display: flex; justify-content: center; align-items: center; padding: 40px; }
.layout-container { display: flex; gap: 30px; width: 100%; max-width: 1300px; height: 85vh; align-items: stretch; z-index: 2; }
.side-panel { width: 280px; display: flex; flex-direction: column; gap: 20px; max-width: 320px; flex-shrink: 0; }
.main-panel { flex: 1; display: flex; flex-direction: column; }

/* 通用卡片 */
.info-card { background: var(--card-bg); border-radius: 24px; box-shadow: 0 8px 24px var(--shadow); border: 1px solid var(--border-color); padding: 25px; box-sizing: border-box; overflow: hidden; }

/* 货架容器 */
.shelf-container { background: var(--card-bg); border-radius: 32px; height: 100%; display: flex; flex-direction: column; box-shadow: 0 10px 40px var(--shadow); border: 1px solid var(--border-color); overflow: hidden; }
.shelf-header { padding: 24px 32px 16px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

/* 标签切换 */
.tabs-wrapper { display: inline-flex; background: var(--hover-bg); padding: 4px; border-radius: 16px; align-self: flex-start; }
.tab-item { display: flex; align-items: center; gap: 6px; padding: 8px 20px; border-radius: 12px; border: none; background: transparent; color: var(--text-sub); font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; position: relative; }
.tab-item.active { background: var(--input-bg); color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

/* 分类滚动 */
.category-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
.category-scroll::-webkit-scrollbar { display: none; }
.cat-chip { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-sub); font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.cat-chip.active { background: var(--primary); border-color: var(--primary); color: #fff; }

/* 货架内容区 */
.shelf-content { flex: 1; overflow-y: auto; padding: 24px 32px; display: flex; flex-direction: column; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

/* 商品网格 */
.goods-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
.good-card { position: relative; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 24px; padding: 20px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.good-card:hover { transform: translateY(-6px); border-color: var(--primary); box-shadow: 0 10px 25px var(--shadow); }
.good-card:hover .hover-overlay { opacity: 1; }
.good-card:hover .buy-text { transform: translateY(0); }

/* 下架按钮 */
.delete-item-btn { position: absolute; top: 10px; right: 10px; z-index: 50; width: 32px; height: 32px; border-radius: 50%; background-color: #ffffff; color: #ef4444; border: 1px solid #fee2e2; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.good-card:hover .delete-item-btn { opacity: 1; transform: scale(1); }
.delete-item-btn:hover { background-color: #ef4444; color: #ffffff; border-color: #ef4444; transform: scale(1.1); }

/* 统计行 */
.stats-row { display: flex; gap: 12px; width: 100%; box-sizing: border-box; }
.stat-pill { flex: 1; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px; text-align: center; display: flex; flex-direction: column; position: relative; box-sizing: border-box; }
.stat-pill .label { font-size: 11px; color: var(--text-sub); font-weight: 700; }
.stat-pill .value { font-size: 16px; font-weight: 900; color: var(--text-main); }

/* 迷你重置按钮 */
.mini-reset-btn { position: absolute; top: 6px; right: 6px; background: transparent; border: none; padding: 2px; color: var(--text-sub); cursor: pointer; opacity: 0; transition: 0.2s; }
.stat-pill:hover .mini-reset-btn { opacity: 1; }
.mini-reset-btn:hover { color: #ef4444; transform: scale(1.1); }

/* 钱包卡片 */
.wallet-card { gap: 16px; display: flex; flex-direction: column; box-sizing: border-box; width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; color: var(--text-sub); font-size: 13px; font-weight: 700; width: 100%; box-sizing: border-box; }
.balance-box { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--hover-bg); border-radius: 16px; width: 100%; box-sizing: border-box; }
.coin-circle { width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.balance-num { font-size: 32px; font-weight: 900; color: var(--text-main); max-width: calc(100% - 52px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 操作按钮 */
.action-btn { flex: 1; border: none; border-radius: 14px; padding: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; width: 100%; box-sizing: border-box; }
.primary-btn { background: var(--primary); color: #fff; display: flex; justify-content: center; gap: 8px; align-items: center; }
.primary-btn:hover { background: var(--primary-dark); }

/* 商品卡片视觉区 */
.card-visual { aspect-ratio: 4/3; background: var(--hover-bg); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--primary-dark); }
.inventory-mode .card-visual.use-bg { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
.icon-circle { width: 64px; height: 64px; background: var(--input-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px var(--shadow); }

/* 商品详情 */
.card-details { text-align: center; }
.item-name { margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: var(--text-main); }
.price-pill { display: inline-flex; align-items: center; gap: 4px; background: var(--hover-bg); color: var(--primary-dark); padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 800; }

/* 使用按钮 */
.use-btn { width: 100%; padding: 8px; background: #dcfce7; color: #15803d; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; margin-top: 4px; transition: 0.2s; }
.use-btn:hover { background: #bbf7d0; }

/* 购买悬浮层 */
.buy-text { color: #fff; font-weight: 900; font-size: 18px; transform: translateY(10px); transition: transform 0.2s; }
.spacer { height: 60px; }

/* NPC卡片 */
.npc-card { display: flex; flex-direction: column; align-items: center; cursor: pointer; background: linear-gradient(180deg, var(--input-bg) 0%, var(--hover-bg) 100%); width: 100%; box-sizing: border-box; }
.npc-img { width: 100px; transition: 0.3s; flex-shrink: 0; }
.status-badge { position: absolute; bottom: 0; right: -5px; background: var(--primary); color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; border: 2px solid #fff; z-index: 5; }
.npc-avatar-wrapper { position: relative; margin-bottom: 16px; width: 100%; display: flex; justify-content: center; }
.npc-bubble { background: var(--input-bg); border: 1.5px dashed var(--primary); border-radius: 16px; padding: 12px; position: relative; width: 100%; text-align: center; min-height: 50px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.npc-bubble p { margin: 0; font-size: 13px; color: var(--text-sub); font-style: italic; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; }

/* 弹窗基础 */
.modal-backdrop { position: fixed; inset: 0; background: var(--modal-overlay); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-card { width: 400px; background: var(--card-bg); border-radius: 28px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 20px; animation: zoomIn 0.3s; position: relative; border: 1px solid var(--border-color); }
.modal-header-row { display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }

/* 弹窗高亮图标 */
.highlight-icon { width: 90px; height: 90px; background: var(--hover-bg); border-radius: 50%; color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.gold-text { color: var(--primary-dark); font-weight: 800; font-size: 16px; }

/* 弹窗按钮组 */
.modal-actions { display: flex; gap: 12px; margin-top: 10px; }
.secondary-btn { background: var(--hover-bg); color: var(--text-sub); }
.secondary-btn:hover { filter: brightness(0.95); }

/* 表单样式 */
.form-item label { display: block; font-size: 12px; font-weight: 700; color: var(--text-sub); margin-bottom: 6px; }
.custom-input { width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 12px; font-size: 14px; outline: none; box-sizing: border-box; background: var(--input-bg); color: var(--text-main); }
.custom-input:focus { border-color: var(--primary); }

/* 购买悬浮层 */
.hover-overlay { position: absolute; inset: 0; background: rgba(251, 191, 36, 0.9); border-radius: 20px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; backdrop-filter: blur(2px); pointer-events: none; }

/* 未读角标 */
.badge-count { background: #ef4444; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 10px; min-width: 14px; position: absolute; top: -5px; right: -5px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); }

/* 提示框 */
.toast-message { position: fixed; top: 40px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 50px; background: var(--card-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; font-weight: 700; z-index: 10000; border: 1px solid var(--border-color); color: var(--text-main); }

/* 空状态 */
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0; color: var(--text-sub); }
.empty-icon-box { margin-bottom: 16px; opacity: 0.6; }
.empty-state h3 { margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: var(--text-main); }
.empty-state p { margin: 0; font-size: 14px; }

/* 弹窗标题/关闭按钮 */
.title-with-icon { display: flex; align-items: center; gap: 10px; }
.close-btn-clean { background: transparent !important; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: 0.2s; border-radius: 50%; }
.close-btn-clean:hover { transform: scale(1.1); background: rgba(69, 26, 3, 0.05) !important; }
.top-right-absolute { position: absolute; top: 15px; right: 15px; }

/* 下拉框美化 */
.select-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23451a03' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 44px !important;
  cursor: pointer;
  background-color: var(--input-bg);
  color: var(--text-main);
  transition: all 0.2s ease;
}
.select-input:focus {
  border-color: var(--primary) !important;
  outline: none;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
}
.select-input option {
  background-color: #fff;
  color: #451a03;
  padding: 12px;
  font-weight: 600;
}

/* 上架奖励弹窗专属样式 */
.add-reward-modal { width: 440px !important; }
.modal-main-title { font-size: 24px !important; font-weight: 900; color: #451a03; margin: 0; }
.form-label { color: #451a03 !important; font-weight: 800 !important; margin-bottom: 8px !important; }
.icon-grid-box { background: #fefce8; padding: 12px; border-radius: 16px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; border: 1px dashed #fcd34d; }
.icon-select-btn { background: #fff; border: 2px solid transparent; color: #451a03; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 12px; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
.icon-select-btn:hover { transform: translateY(-2px); border-color: #fef08a; }
.icon-select-btn.selected { background: #f59e0b; border-color: #451a03; color: #fff !important; transform: scale(1.1); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }

/* 响应式适配 */
@media (max-width: 1200px) {
  .shop-view { padding: 20px; align-items: flex-start; overflow-y: auto; }
  .layout-container { flex-direction: column; height: auto; max-height: 95vh; gap: 20px; }
  .side-panel { width: 100%; max-width: 100%; flex-direction: row; flex-wrap: wrap; justify-content: space-between; }
  .stats-row { width: 100%; margin-top: 10px; }
  .main-panel { height: 60vh; }
}
@media (max-width: 768px) {
  .shop-view { padding: 10px; }
  .goods-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  .modal-card { width: 95% !important; padding: 20px; }
}
</style>
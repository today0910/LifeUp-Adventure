import { defineStore } from 'pinia'
import { getLocalToday } from '../utils'

// 获取默认状态（用于重置）
const getDefaultState = () => ({
  isLoggedIn: false,
  isDarkMode: false,
  player_name: '',
  password: '',
  level: 1,
  current_exp: 0,
  max_exp: 100,
  gold: 500,
  stats: { strength: 10, intelligence: 10, stamina: 10, focus: 10, charm: 10, creativity: 10 },
  quests: [],
  shop_items: [
    { id: 1, name: '肥宅快乐水', price: 20, icon: 'coffee', category: 'food' },
    { id: 2, name: '游戏时间券', price: 100, icon: 'game', category: 'game' },
    { id: 3, name: '喝一杯', price: 50, icon: 'pizza', category: 'food' },
    { id: 4, name: '周边游', price: 500, icon: 'travel', category: 'travel' }
  ],
  inventory: [],
  inventoryUnread: 0,
  totalSpent: 0,
  focusStats: { today: 0, week: 0, month: 0, year: 0, totalCount: 0, totalGold: 0 },
  battleHistory: [],
  focusSession: { status: 'idle', startTime: null, duration: 0, levelName: '', reward: { gold: 0, exp: 0 } },
  checkInDates: [],
  skills: [
    { id: 0, name: '初心', desc: '一切的开始，冒险的起点', level: 1, maxLevel: 1, baseCost: 0 },
    { id: 1, name: '炼金术', desc: '任务金币加成', level: 0, maxLevel: 50, baseCost: 100 },
    { id: 2, name: '寻宝', desc: '完成任务时意外获得物品', level: 0, maxLevel: 10, baseCost: 500 },
    { id: 3, name: '深度专注', desc: '专注收益提升', level: 0, maxLevel: 20, baseCost: 500 },
    { id: 4, name: '精打细算', desc: '商店购物享受折扣', level: 0, maxLevel: 10, baseCost: 1000 },
    { id: 5, name: '博学', desc: '任务经验值获取提升', level: 0, maxLevel: 50, baseCost: 800 },
    { id: 6, name: '幸运星', desc: '任务结算可能暴击', level: 0, maxLevel: 10, baseCost: 2500 },
    { id: 7, name: '时间管理', desc: '每日登录奖励提升', level: 0, maxLevel: 30, baseCost: 1500 },
  ],
  // 新增：total_created_tasks 记录总创建任务数
  records: { 
    login_days: 1, 
    finished_tasks: 0, 
    total_gold_earned: 0, 
    total_created_tasks: 0,
    last_login_reward_date: '' 
  },
  map_stages: [
    { id: 1, name: '新手村', threshold: 0, icon: 'Home', claimed: true },
    { id: 2, name: '迷雾森林', threshold: 5, icon: 'Trees', claimed: false },
    { id: 3, name: '荒芜沙漠', threshold: 15, icon: 'Tent', claimed: false },
    { id: 4, name: '深海神殿', threshold: 30, icon: 'Waves', claimed: false },
  ],
  logs: []
})

export const useUserStore = defineStore('user', {
  state: () => getDefaultState(),

  // Getter：获取任务统计数据
  getters: {
    historyStats: (state) => {
      const finished = state.records.finished_tasks || 0;
      const created = state.records.total_created_tasks || 0;
      const rate = created > 0 ? Math.round((finished / created) * 100) : 0;
      return {
        completedCount: finished,
        totalGold: state.records.total_gold_earned || 0,
        rate: rate
      }
    }
  },

  actions: {
    // 注册账号
    register(username, password) {
      const key = `lifeup_user_${username}`
      if (localStorage.getItem(key)) {
        return { success: false, msg: '账号已存在，请直接登录' }
      }
      this.$reset()
      this.player_name = username
      this.password = password
      this.isLoggedIn = true
      this.addLog('👶 创建了新角色，欢迎来到 LifeUp！')
      this.checkDailyLogin()
      this.saveData()
      return { success: true, msg: '注册成功' }
    },

    // 登录账号（兼容旧存档）
    login(username, password) {
      const key = `lifeup_user_${username}`
      const dataStr = localStorage.getItem(key)
      if (!dataStr) return { success: false, msg: '账号不存在，请先注册' }

      try {
        const userData = JSON.parse(dataStr)
        if (userData.password !== password) return { success: false, msg: '密码错误' }

        const defaultState = getDefaultState()
        
        // 兼容旧存档：初始化total_created_tasks
        if (userData.records && userData.records.total_created_tasks === undefined) {
           userData.records.total_created_tasks = userData.records.finished_tasks || 0;
        }

        // 按ID匹配技能，防止错位
        if (userData.skills) {
          userData.skills = defaultState.skills.map(defSkill => {
            const userSkill = userData.skills.find(s => s.id === defSkill.id)
            return userSkill ? { ...defSkill, level: userSkill.level } : defSkill
          })
        } else {
            userData.skills = defaultState.skills
        }

        // 修正旧存档技能文案
        if (userData.skills[2]) {
           userData.skills[2].name = '寻宝'
           userData.skills[2].desc = '完成任务时意外获得物品'
        }

        this.$patch(userData)
        this.isLoggedIn = true
        this.checkDailyLogin()
        this.addLog('👋 欢迎回来，冒险者！')
        this.saveData()
        return { success: true, msg: '登录成功' }
      } catch (e) {
        console.error(e)
        return { success: false, msg: '存档损坏，请联系管理员' }
      }
    },

    // 保存数据到本地存储
    saveData() {
      if (this.isLoggedIn && this.player_name) {
        const key = `lifeup_user_${this.player_name}`
        localStorage.setItem(key, JSON.stringify(this.$state))
      }
    },

    // 退出登录
    logout() {
      this.saveData()
      this.isLoggedIn = false
      this.$reset()
    },

    // 切换暗黑模式
    toggleDarkMode() { 
      this.isDarkMode = !this.isDarkMode; 
    },
    
    // 添加日志
    addLog(content) { 
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false }); 
      this.logs.unshift({ id: Date.now(), time, content }); 
    },
    
    // 添加经验（含升级逻辑）
    addExp(amount) {
      this.current_exp += amount;
      if (this.current_exp >= this.max_exp) {
        this.level++;
        this.current_exp -= this.max_exp;
        this.max_exp = Math.floor(this.max_exp * 1.5);
        this.addLog(`🎉 升级了！目前等级 Lv.${this.level}`);
      }
    },

    // 添加任务（更新总创建数）
    addQuest(questObj) {
      this.quests.push(questObj);
      this.records.total_created_tasks++;
      this.saveData();
    },

    // 计算任务奖励（含技能加成）
    calculateReward(difficulty, type = 'gold') {
      const baseMap = { 'S': 100, 'B': 50, 'C': 20 };
      let amount = baseMap[difficulty] || 20;

      const alchemyLv = this.skills.find(s => s.id === 1)?.level || 0;
      const learningLv = this.skills.find(s => s.id === 5)?.level || 0;

      if (type === 'gold') {
        amount = Math.floor(amount * (1 + alchemyLv * 0.1));
      } else if (type === 'exp') {
        const baseExp = 30;
        amount = Math.floor(baseExp * (1 + learningLv * 0.05));
      }
      return amount;
    },

    // 获取折扣价格（精打细算技能）
    getDiscountedPrice(price) {
      const budgetLv = this.skills.find(s => s.id === 4)?.level || 0;
      const discount = Math.min(budgetLv * 0.02, 0.5); 
      return Math.floor(price * (1 - discount));
    },

    // 计算专注奖励加成（深度专注技能）
    calculateFocusBonus(baseGold) {
      const focusLv = this.skills.find(s => s.id === 3)?.level || 0;
      return Math.floor(baseGold * (1 + focusLv * 0.05));
    },

    // 完成任务（含奖励/技能触发/统计更新）
    completeQuest(questId) {
      const quest = this.quests.find(q => q.id === questId);
      if (quest && quest.status !== 'done') {
        let rewardGold = this.calculateReward(quest.difficulty, 'gold');
        const rewardExp = this.calculateReward(quest.difficulty, 'exp');

        // 幸运星技能：金币翻倍
        const luckLv = this.skills.find(s => s.id === 6)?.level || 0;
        if (luckLv > 0 && Math.random() < luckLv * 0.03) {
          rewardGold *= 2;
          this.addLog(`✨ [幸运星] 触发！任务金币翻倍！`);
        }

        // 更新统计数据
        this.gold += rewardGold;
        this.records.total_gold_earned += rewardGold;
        this.records.finished_tasks++;
        
        this.addExp(rewardExp);
        quest.status = 'done';
        
        // 寻宝技能：随机获得物品
        const treasureLv = this.skills.find(s => s.id === 2)?.level || 0;
        if (treasureLv > 0 && Math.random() < treasureLv * 0.02) {
           const randomItem = this.shop_items[Math.floor(Math.random() * this.shop_items.length)];
           this.inventory.push({ 
             ...randomItem, 
             uniqueId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
             source: 'treasure' 
           });
           this.inventoryUnread++;
           this.addLog(`🎁 [寻宝] 意外发现了：${randomItem.name}`);
        }

        // 签到记录
        const today = getLocalToday();
        if (!this.checkInDates.includes(today)) {
          this.checkInDates.push(today);
        }
        this.addLog(`✅ 完成委托: ${quest.title}，获得 ${rewardGold}G`);
        this.saveData();
      }
    },

    // 检查每日登录奖励（时间管理技能）
    checkDailyLogin() {
      const today = getLocalToday();
      if (this.records.last_login_reward_date !== today) {
         const timeLv = this.skills.find(s => s.id === 7)?.level || 0;
         if (timeLv > 0) {
            const bonus = timeLv * 10;
            this.gold += bonus;
            this.addLog(`⏰ [时间管理] 每日登录奖励 +${bonus}G`);
         }
         this.records.last_login_reward_date = today;
         this.saveData();
      }
    },

    // 升级技能
    upgradeSkill(skillId) {
      const skill = this.skills.find(s => s.id === skillId);
      const cost = Math.floor(skill.baseCost * Math.pow(1.5, skill.level));
      if (this.gold >= cost) {
        this.gold -= cost;
        skill.level++;
        this.addLog(`🚀 升级技能: ${skill.name} 至 Lv.${skill.level}`);
        this.saveData();
        return { success: true };
      }
      return { success: false };
    },

    // 领取地图阶段奖励
    claimStageReward(stageId) {
      const stage = this.map_stages.find(s => s.id === stageId)
      if (stage && !stage.claimed) {
        stage.claimed = true
        this.gold += 500
        this.addLog(`🗺️ 解锁地图奖励：${stage.name}，获得 500G`)
        this.saveData();
      }
    },

    // 清空日志
    clearLogs() {
      this.logs = [];
      this.saveData();
    },
  }
})
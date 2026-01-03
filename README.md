<div align="center">
  <img src="https://img.shields.io/badge/LifeUp-PRO-fbbf24?style=for-the-badge&logo=rocket&logoColor=white&labelColor=black" alt="LifeUp Logo" />
  
  <h1 style="font-family: 'Nunito', sans-serif;">🐶 LifeUp: 生活冒险之旅</h1>
  
  <p>
    <strong>基于 Vue 3 的“人生游戏化”待办管理与专注力提升系统</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-Latest-646cff?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Pinia-Store-ffe082?style=flat-square&logo=pinia&logoColor=black" />
    <img src="https://img.shields.io/badge/Theme-Creamy_Puppy-ffcf33?style=flat-square" />
    <img src="https://img.shields.io/badge/UI-Responsive-blue?style=flat-square" />
  </p>

  <p>
    <em>“将琐碎的日常转化为史诗级的冒险，通过数值反馈与视觉治愈提升生活效率。”</em>
  </p>
</div>

---

## 📖 1. 项目简介 (Introduction)

**LifeUp** 是一款将个人事务管理转化为 **RPG 游戏体验** 的 Web 应用。

系统通过将“待办事项”抽象为“赏金委托”，将“专注时长”抽象为“副本战斗”，构建了一套完整的角色成长体系。应用采用治愈系的 **线条小狗 (Puppy)** 视觉风格，旨在通过视觉激励与数值反馈，缓解用户的任务焦虑，建立正向的行为闭环。

> **🎨 设计风格**：采用 **奶油系 (Creamy)** 视觉语言，支持明亮与暗黑模式一键切换。

---

## ✨ 2. 核心模块 (Core Modules)

### 📋 A. 任务看板 (Quest Board)
打破传统列表形式，采用标准的 **Kanban (看板)** 流程管理任务状态：
*   **难度体系**：支持 S/B/C 三级难度，根据难度自动计算结算时的金币（Gold）与经验值（EXP）。
*   **任务拆解**：支持设置子步骤（Checklists），进度实时反映在任务卡片上。
*   **状态追踪**：自动识别并分类“准备中”、“进行中”、“已完成”及“已过期”任务。

### ⚔️ B. 专注地下城 (Focus Dungeon)
将番茄钟计时器与副本挑战相结合：
*   **多阶关卡**：预设从 1 分钟（史莱姆平原）到 4 小时（时光泰坦）的不同挑战难度。
*   **实时反馈**：倒计时过程中实时计算进度百分比，配合 HUD 交互界面。
*   **战果结算**：只有坚持完成计时方可领取金币与经验，模拟副本掉落体验。

### 🌲 C. 无限科技树 (Skill Tree)
深度的被动技能成长系统，通过消耗游戏金币解锁永久加成：
*   **技能类别**：涵盖炼金术（金币加成）、博学（经验加成）、精打细算（商店折扣）、寻宝（任务掉落）等 8 大方向。
*   **逻辑联动**：技能等级将直接参与到任务结算和商店购买的价格计算公式中。

### 🛍️ D. 便利商店与背包 (Shop & Inventory)
建立自我驱动的激励循环：
*   **自定义奖励**：用户可自行上架现实生活中的奖励（如：喝奶茶、看电影）。
*   **库存管理**：实现完整的购买、存入背包、消耗使用的逻辑闭环。

### 📊 E. 个人面板 (Hero Profile)
全方位的数据可视化展示：
*   **成长轨迹**：展示角色等级、经验条及力量、智力等六维属性。
*   **冒险地图**：根据累计完成任务数解锁地图节点，并领取阶段性成就奖励。
*   **考勤与日志**：日历化展示打卡记录，并提供全量的行为流水日志。

---

## 🛠️ 3. 技术实现 (Tech Stack)

| 模块 | 技术选型 | 功能说明 |
| :--- | :--- | :--- |
| **Framework** | **Vue 3** | 使用 Composition API 构建高性能响应式界面 |
| **State** | **Pinia** | 集中式管理用户信息、任务逻辑及技能状态 |
| **Router** | **Vue Router** | 处理单页应用跳转、路由守卫及视图切换动画 |
| **Icons** | **Lucide Vue Next** | 统一且高可定制的矢量图标库 |
| **Styling** | **CSS Variables** | 动态变量控制，实现明暗主题实时无缝切换 |

---

## 📂 4. 目录结构 (Project Structure)

```text
LifeUp/
├── src/
│   ├── assets/           # 静态资源 (线条小狗插画、SVG 矢量图)
│   ├── components/       # 公共组件 (全局确认框、应用布局外壳等)
│   ├── router/           # 路由配置 (含登录鉴权守卫)
│   ├── stores/           # Pinia 状态中心 (核心逻辑：数值算法、技能加成等)
│   ├── utils/            # 工具类 (弹窗插件驱动、时间格式化函数)
│   ├── views/            # 页面视图 (任务/商店/技能/个人中心/专注/登录)
│   └── App.vue           # 根组件 (全局主题注入与挂载点)
├── package.json          # 依赖清单
└── vite.config.js        # 构建配置
```

---

## 🚀 5. 安装与运行 (Installation & Running)

项目运行环境要求：**Node.js 16.0+**。

### 📦 1. 克隆并安装依赖
```bash
git clone https://github.com/your-username/LifeUp.git
cd LifeUp
npm install
```

### 🛠️ 2. 启动开发环境
```bash
npm run dev
```

### 🏗️ 3. 构建生产版本
```bash
npm run build
```

---

## 🎮 6. 核心逻辑算法 (Logic & Mechanics)

系统在 `src/stores/user.js` 中内置了一套平衡的 RPG 数值体系：

*   **收益计算公式**：`最终收益 = 基础奖励 × (1 + 技能加成系数)`。
*   **成长模型**：采用指数级经验公式 $NextEXP = CurrentMaxEXP \times 1.5$ 保证长期挑战性。
*   **任务触发器**：完成任务时，逻辑层会根据“寻宝”技能等级实时计算是否有随机物品掉落至背包。

---

## 💾 7. 数据持久化 (Data & Privacy)

LifeUp 采用**本地优先**的数据方案，充分保护用户隐私：

1.  **LocalStorage 存储**：所有账户数据、任务清单、资产与日志均持久化存储在用户浏览器本地。
2.  **存档隔离**：支持多账号系统，不同用户代号对应独立的存储 Key。
3.  **实时存盘**：通过订阅 Pinia 状态变化，系统在任何数值变动后均会自动同步至本地磁盘。

---

<div align="center">
  <p>生活是一场冒险，愿 LifeUp 陪伴你升级成更好的自己。</p>
  <img src="https://img.shields.io/badge/Status-Version_Beta-brightgreen?style=for-the-badge" />
  <br>
  <sub>Created with 李紫嫣 | 2025</sub>
</div>
```

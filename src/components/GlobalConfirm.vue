<template>
  <!-- 全局模态框组件：包含淡入淡出过渡效果 -->
  <transition name="modal-fade">
    <!-- 模态框遮罩层：点击遮罩空白处触发取消操作 -->
    <div 
      v-if="dialogState.show" 
      class="global-modal-overlay" 
      @click.self="onCancel"
    >
      <!-- 模态框主体卡片 -->
      <div class="global-modal-card">
        <!-- 模态框标题区 -->
        <div class="modal-header">
          <h3>{{ dialogState.title }}</h3>
        </div>
        <!-- 模态框内容区 -->
        <div class="modal-body">
          <p>{{ dialogState.content }}</p>
        </div>
        <!-- 模态框操作按钮区 -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="onCancel">{{ dialogState.cancelText }}</button>
          <button class="btn-confirm" @click="onConfirm">{{ dialogState.confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
// 导入对话框状态管理和操作处理函数
import { dialogState, handleAction } from '../utils/dialog'

/**
 * 确认按钮点击事件处理
 * 调用工具函数并传递确认状态（true）
 */
const onConfirm = () => handleAction(true)

/**
 * 取消按钮/遮罩点击事件处理
 * 调用工具函数并传递取消状态（false）
 */
const onCancel = () => handleAction(false)
</script>

<style scoped>
/* 模态框遮罩层：全屏覆盖、半透明模糊背景 */
.global-modal-overlay {
  position: fixed; 
  inset: 0; 
  z-index: 9999; /* 最高层级确保覆盖其他内容 */
  background: var(--modal-overlay);
  backdrop-filter: blur(4px); /* 背景模糊效果 */
  display: flex; 
  align-items: center; 
  justify-content: center; /* 水平垂直居中模态框 */
}

/* 模态框卡片容器：固定宽度、圆角、阴影 */
.global-modal-card {
  background: var(--card-bg);
  width: 320px; 
  border-radius: 24px; 
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2); /* 立体阴影增强层级 */
  border: 2px solid var(--border-color);
  /* 模态框入场动画：缩放+渐显 */
  animation: modalZoomIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 模态框标题样式：主色调、加粗 */
.modal-header h3 { 
  margin: 0 0 10px; 
  color: var(--primary); 
  font-size: 20px; 
  font-weight: 900; 
}

/* 模态框内容文本样式：行高优化、中等字重 */
.modal-body p { 
  margin: 0 0 20px; 
  color: var(--text-main); 
  font-size: 15px; 
  line-height: 1.5; 
  font-weight: 600; 
}

/* 按钮容器：弹性布局、间距 */
.modal-footer { 
  display: flex; 
  gap: 12px; 
}

/* 通用按钮样式：等宽、圆角、过渡效果 */
button { 
  flex: 1; /* 按钮等分宽度 */
  padding: 10px; 
  border-radius: 12px; 
  font-weight: 800; 
  cursor: pointer; 
  border: none; 
  transition: 0.2s; /*  hover过渡动画 */
}

/* 取消按钮样式：浅背景、次要文本色 */
.btn-cancel { 
  background: var(--hover-bg); 
  color: var(--text-sub); 
}

/* 取消按钮hover效果：亮度降低 */
.btn-cancel:hover { 
  filter: brightness(0.9); 
}

/* 确认按钮样式：主色调背景、白色文本、发光阴影 */
.btn-confirm { 
  background: var(--primary); 
  color: white; 
  box-shadow: 0 4px 10px rgba(251, 191, 36, 0.3); 
}

/* 确认按钮hover效果：加深背景色、轻微上移 */
.btn-confirm:hover { 
  background: var(--primary-dark); 
  transform: translateY(-2px); 
}

/**
 * 模态框入场动画：从90%缩放+透明到正常大小+不透明
 */
@keyframes modalZoomIn { 
  from { 
    transform: scale(0.9); 
    opacity: 0; 
  } 
  to { 
    transform: scale(1); 
    opacity: 1; 
  } 
}

/* 模态框淡入淡出过渡：仅控制透明度 */
.modal-fade-enter-active, .modal-fade-leave-active { 
  transition: opacity 0.2s; 
}
.modal-fade-enter-from, .modal-fade-leave-to { 
  opacity: 0; 
}
</style>
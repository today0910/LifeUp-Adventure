// src/utils/dialog.js
import { reactive } from 'vue'

// 弹窗状态管理（响应式）
export const dialogState = reactive({
  show: false,
  title: '提示',
  content: '',
  confirmText: '确定',
  cancelText: '取消',
  resolve: null
})

/**
 * 显示确认弹窗
 * @param {string} content - 弹窗内容
 * @param {string} [title='确认操作'] - 弹窗标题
 * @param {string} [confirmText='确定'] - 确认按钮文本
 * @param {string} [cancelText='取消'] - 取消按钮文本
 * @returns {Promise<boolean>} 点击确认返回true，取消返回false
 */
export const showConfirm = (content, title = '确认操作', confirmText = '确定', cancelText = '取消') => {
  return new Promise((resolve) => {
    dialogState.content = content
    dialogState.title = title
    dialogState.confirmText = confirmText
    dialogState.cancelText = cancelText
    dialogState.show = true
    dialogState.resolve = resolve
  })
}

// 处理弹窗确认/取消操作
export const handleAction = (result) => {
  dialogState.show = false
  if (dialogState.resolve) {
    dialogState.resolve(result)
    dialogState.resolve = null
  }
}
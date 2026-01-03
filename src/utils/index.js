// src/utils/index.js

/**
 * 格式化秒数为时间字符串
 * @param {number} seconds - 待格式化的秒数
 * @returns {string} HH:MM:SS（小时>0）或 MM:SS 格式
 */
export const formatTimer = (seconds) => {
  if (seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

/**
 * 获取本地今日日期（YYYY-MM-DD）
 * @returns {string} 格式化的日期字符串
 */
export const getLocalToday = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取当前详细时间（YYYY-MM-DD HH:MM）
 * @returns {string} 格式化的时间字符串
 */
export const getCurrentTimeStr = () => {
  const now = new Date()
  const date = getLocalToday()
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  return `${date} ${time}`
}
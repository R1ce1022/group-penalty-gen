/*
  useDarkMode — 暗色模式控制
  管理 darkMode 状态，通过切换 <html> 的 .dark class 控制全局样式。
*/
import { ref } from 'vue'

export function useDarkMode() {
  const darkMode = ref(false)

  /** 切换暗色模式，同步更新 DOM 类名 */
  function toggleDark() {
    darkMode.value = !darkMode.value
    document.documentElement.classList.toggle('dark', darkMode.value)
  }

  /** 从 localStorage 加载数据后，若为暗色模式则初始化 DOM 状态 */
  function initDarkFromStorage() {
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    }
  }

  return { darkMode, toggleDark, initDarkFromStorage }
}

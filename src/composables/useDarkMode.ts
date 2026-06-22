/*
  useDarkMode — 暗色模式控制
  管理 darkMode 状态，通过设置 <html data-theme="dark|light"> 属性
  驱动 style.scss 里的 CSS 自定义属性切换，实现整站暗色主题。
*/
import { ref } from 'vue'

export function useDarkMode() {
  const darkMode = ref(false)

  /** 将暗色状态同步到 <html data-theme> 属性，驱动 CSS 变量切换 */
  function applyTheme(dark: boolean) {
    document.documentElement.setAttribute(
      'data-theme',
      dark ? 'dark' : 'light',
    )
  }

  /** 切换暗色模式，同步更新 DOM 属性 */
  function toggleDark() {
    darkMode.value = !darkMode.value
    applyTheme(darkMode.value)
  }

  /** 从 localStorage 加载数据后，将当前暗色状态同步到 DOM */
  function initDarkFromStorage() {
    applyTheme(darkMode.value)
  }

  return { darkMode, toggleDark, initDarkFromStorage }
}

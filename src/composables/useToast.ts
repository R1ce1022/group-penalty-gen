/*
  useToast — Toast 提示控制
  管理短暂显示的提示消息，1.5 秒后自动消失。
*/
import { ref } from 'vue'

export function useToast() {
  const toastMsg = ref('')       // 提示文字内容
  const toastShow = ref(false)   // 是否显示
  let toastTimer: ReturnType<typeof setTimeout>

  /** 显示一条提示，自动清除之前的定时器防止重叠 */
  function showToast(msg: string) {
    toastMsg.value = msg
    toastShow.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastShow.value = false
    }, 1500)
  }

  return { toastMsg, toastShow, showToast }
}

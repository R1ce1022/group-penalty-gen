/*
  useScrollLock — 弹窗出现时锁定 body 滚动
  监听 body 子树变化，只要存在 .modal-overlay 就隐藏滚动条。
  统一覆盖所有弹窗（重置确认、更新历史、各管理弹窗），
  替代原先分散在 useAppState 里的 watch + MutationObserver 两套逻辑。
*/
import { onMounted, onUnmounted } from 'vue'

export function useScrollLock() {
  let bodyObserver: MutationObserver | null = null

  function sync() {
    document.body.style.overflow = document.querySelector('.modal-overlay')
      ? 'hidden'
      : ''
  }

  onMounted(() => {
    bodyObserver = new MutationObserver(sync)
    bodyObserver.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    bodyObserver?.disconnect()
  })
}

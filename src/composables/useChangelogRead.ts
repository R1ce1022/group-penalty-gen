/*
  useChangelogRead — 更新历史未读追踪
  独立 localStorage key 记录用户已看过的最新版本号，
  据此判断「更新历史」按钮是否需要亮未读红点。
  与主数据（punishment-data-v3）分离，避免 bump 主存储版本。
*/
import { ref } from 'vue'

const STORAGE_KEY = 'changelog-last-seen-v1'

export function useChangelogRead(latestVersion: string) {
  const hasUnread = ref(false)

  /** 读取已看版本，与当前最新版本比较，更新未读状态 */
  function check() {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      hasUnread.value = seen !== latestVersion
    } catch {
      hasUnread.value = false
    }
  }

  /** 标记当前版本为已看（打开更新历史即视为已看） */
  function markSeen() {
    try {
      localStorage.setItem(STORAGE_KEY, latestVersion)
    } catch {
      /* 忽略隐私模式等写入失败 */
    }
    hasUnread.value = false
  }

  return { hasUnread, check, markSeen }
}

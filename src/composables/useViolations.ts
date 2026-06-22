/*
  useViolations — 违规内容状态管理
  管理违规项列表（含 8 个默认违规），支持勾选、添加自定义、删除、重置。
  自动生成"晒卡"等特殊违规的提醒文本。
*/
import { ref, computed } from 'vue'
import type { Violation } from '../types'
import { CUSTOM_ID_THRESHOLD, createDefaultViolations } from '../data/defaults'

export function useViolations() {
  const violations = ref<Violation[]>(createDefaultViolations())
  const nextViolationId = ref(CUSTOM_ID_THRESHOLD) // 默认违规占用 id 1-8，自定义从阈值开始

  /** 当前勾选的违规标签列表 */
  const selectedViolations = computed(() =>
    violations.value.filter((v) => v.checked).map((v) => v.label),
  )

  /**
   * 根据勾选的违规自动生成提醒内容：
   * - 勾选"晒卡" → 自动追加"晒卡请移步群频道"（多条晒卡违规只追加一次）
   * - 违规设置了自定义 reminder → 追加该提醒（去重）
   */
  const autoReminder = computed(() => {
    const checked = violations.value.filter((v) => v.checked)
    const r: string[] = []
    if (checked.some((v) => v.label.includes('晒卡')))
      r.push('晒卡请移步群频道')
    for (const v of checked) {
      const t = v.reminder?.trim()
      if (t && !r.includes(t)) r.push(t)
    }
    return r
  })

  /** 切换勾选状态 */
  function toggleViolation(id: number) {
    const v = violations.value.find((x) => x.id === id)
    if (v) v.checked = !v.checked
  }

  /** 添加自定义违规，默认勾选，可附带提醒文本 */
  function addViolation(name: string, reminder: string) {
    violations.value.push({
      id: nextViolationId.value++,
      label: name,
      checked: true,
      reminder: reminder || undefined,
    })
  }

  /** 删除指定违规 */
  function removeViolation(id: number) {
    violations.value = violations.value.filter((v) => v.id !== id)
  }

  /** 重置到默认违规列表，清除所有自定义违规 */
  function resetViolations() {
    violations.value = createDefaultViolations()
    nextViolationId.value = CUSTOM_ID_THRESHOLD
  }

  /** 清空所有勾选（保留条目） */
  function clearViolationChecks() {
    violations.value.forEach((v) => (v.checked = false))
  }

  return {
    violations,
    nextViolationId,
    selectedViolations,
    autoReminder,
    toggleViolation,
    addViolation,
    removeViolation,
    resetViolations,
    clearViolationChecks,
  }
}

/*
  useReminders — 备注提醒状态管理
  管理自定义备注提醒列表，支持勾选、添加、删除、重置。
  勾选的提醒文本会出现在最终处罚结果中。
*/
import { ref, computed } from 'vue'
import type { Reminder } from '../types'

export function useReminders() {
  const reminders = ref<Reminder[]>([])        // 全部备注提醒列表
  const nextReminderId = ref(1)                 // 自增 ID 种子

  /** 当前勾选的备注文本列表 */
  const selectedReminders = computed(() =>
    reminders.value.filter((r) => r.selected).map((r) => r.text),
  )

  /** 切换勾选状态 */
  function toggleReminder(id: number) {
    const r = reminders.value.find((x) => x.id === id)
    if (r) r.selected = !r.selected
  }

  /** 添加新的备注提醒，默认勾选 */
  function addReminder(text: string) {
    reminders.value.push({ id: nextReminderId.value++, text, selected: true })
  }

  /** 删除指定备注提醒 */
  function removeReminder(id: number) {
    reminders.value = reminders.value.filter((r) => r.id !== id)
  }

  /** 重置到空白状态 */
  function resetReminders() {
    reminders.value = []
    nextReminderId.value = 1
  }

  /** 清空所有勾选（保留条目） */
  function clearReminderSelections() {
    reminders.value.forEach((r) => (r.selected = false))
  }

  return {
    reminders,
    nextReminderId,
    selectedReminders,
    toggleReminder,
    addReminder,
    removeReminder,
    resetReminders,
    clearReminderSelections,
  }
}

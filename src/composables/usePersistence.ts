/*
  usePersistence — localStorage 持久化
  把 useAppState 中的 STORAGE_KEY / saveToStorage / loadFromStorage 抽出。
  接收各领域响应式状态，对外暴露 load() 与自动 watch 保存。
  选中状态不持久化（保存时一律置 false，加载时也是 false）。
*/
import { watch } from 'vue'
import type { Ref } from 'vue'
import type {
  BanUnit,
  Member,
  Penalty,
  Reminder,
  StoredData,
  Violation,
} from '../types'
import {
  CUSTOM_ID_THRESHOLD,
  BAN_UNITS,
  createDefaultPenalties,
  createDefaultViolations,
} from '../data/defaults'

const STORAGE_KEY = 'punishment-data-v3'

interface PersistenceState {
  members: Ref<Member[]>
  violations: Ref<Violation[]>
  penalties: Ref<Penalty[]>
  reminders: Ref<Reminder[]>
  nextMemberId: Ref<number>
  nextViolationId: Ref<number>
  nextPenaltyId: Ref<number>
  nextReminderId: Ref<number>
  banDuration: Ref<number>
  banUnit: Ref<BanUnit>
  darkMode: Ref<boolean>
  /** 暗色模式加载后需要同步 DOM class，由调用方提供回调 */
  onDarkLoaded?: () => void
}

export function usePersistence(s: PersistenceState) {
  /** 保存当前状态到 localStorage（选中状态不保存） */
  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        members: s.members.value,
        violations: s.violations.value.map((v) => ({ ...v, checked: false })),
        penalties: s.penalties.value.map((p) => ({ ...p, checked: false })),
        reminders: s.reminders.value.map((r) => ({ ...r, selected: false })),
        nextMemberId: s.nextMemberId.value,
        nextViolationId: s.nextViolationId.value,
        nextPenaltyId: s.nextPenaltyId.value,
        nextReminderId: s.nextReminderId.value,
        banDuration: s.banDuration.value,
        banUnit: s.banUnit.value,
        darkMode: s.darkMode.value,
      } satisfies StoredData),
    )
  }

  /** 从 localStorage 恢复数据（默认项 + 自定义项合并） */
  function load() {
    try {
      const data: StoredData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '',
      )
      s.members.value = data.members || []

      // 默认违规 + 用户自定义违规（id >= 阈值），勾选一律重置为 false
      s.violations.value = [
        ...createDefaultViolations(),
        ...(data.violations || [])
          .filter((v: Violation) => v.id >= CUSTOM_ID_THRESHOLD)
          .map((v: Violation) => ({ ...v, checked: false })),
      ]

      s.penalties.value = [
        ...createDefaultPenalties(),
        ...(data.penalties || [])
          .filter((p: Penalty) => p.id >= CUSTOM_ID_THRESHOLD)
          .map((p: Penalty) => ({ ...p, checked: false })),
      ]

      s.reminders.value = (data.reminders || []).map((r: Reminder) => ({
        ...r,
        selected: false,
      }))
      s.nextMemberId.value = data.nextMemberId || 1
      s.nextViolationId.value = data.nextViolationId || CUSTOM_ID_THRESHOLD
      s.nextPenaltyId.value = data.nextPenaltyId || CUSTOM_ID_THRESHOLD
      s.nextReminderId.value = data.nextReminderId || 1
      if (data.banDuration !== undefined) s.banDuration.value = data.banDuration
      // 仅接受合法单位，防止旧数据/损坏数据写入非法值
      if (data.banUnit && BAN_UNITS.includes(data.banUnit as BanUnit)) {
        s.banUnit.value = data.banUnit as BanUnit
      }
      if (data.darkMode) {
        s.darkMode.value = true
        s.onDarkLoaded?.()
      }
    } catch {
      /* 首次使用或数据损坏，静默忽略 */
    }
  }

  /** 自动监听状态变化，实时持久化 */
  watch(
    [
      s.members,
      s.violations,
      s.penalties,
      s.reminders,
      s.banDuration,
      s.banUnit,
      s.darkMode,
    ],
    save,
    { deep: true },
  )

  return { load }
}

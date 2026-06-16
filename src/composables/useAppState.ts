/*
  useAppState — 应用状态编排层
  组合所有领域 composable，处理跨领域的横切关注点：
  - 复制到剪贴板（copyResult）
  - 清空 / 重置所有
  - 数据持久化（localStorage）
  - 移动端布局适配
  - 弹窗 body 滚动锁定
  对外暴露统一的接口，App.vue 只需解构使用。
*/
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { ChangelogEntry, StoredData, Violation, Penalty, Reminder } from '../types'
import { useMembers } from './useMembers'
import { useViolations } from './useViolations'
import { usePenalties } from './usePenalties'
import { useReminders } from './useReminders'
import { useResult } from './useResult'
import { useToast } from './useToast'
import { useDarkMode } from './useDarkMode'

export function useAppState() {
  // ===================== 组合领域状态 =====================
  const {
    members, selectedMemberId, currentMember, nextMemberId,
    selectMember, addMember, removeMember, clearSelection, resetMembers,
  } = useMembers()

  const {
    violations, nextViolationId, selectedViolations, autoReminder,
    toggleViolation, addViolation, removeViolation, resetViolations, clearViolationChecks,
  } = useViolations()

  const {
    penalties, nextPenaltyId, banDuration, banUnit, banMax,
    togglePenalty, addPenalty, removePenalty, resetPenalties, clearPenaltyChecks,
  } = usePenalties()

  const {
    reminders, nextReminderId, selectedReminders,
    toggleReminder, addReminder, removeReminder, resetReminders, clearReminderSelections,
  } = useReminders()

  const { toastMsg, toastShow, showToast } = useToast()
  const { darkMode, toggleDark, initDarkFromStorage } = useDarkMode()

  // ===================== 结果文本计算 =====================
  const { resultText } = useResult(
    currentMember, selectedViolations, penalties, banDuration, banUnit, autoReminder, selectedReminders,
  )

  // ===================== 弹窗显隐状态 =====================
  const showResetConfirm = ref(false)
  const showChangelog = ref(false)

  // ===================== 复制到剪贴板 =====================
  /**
   * 1. 校验是否已选择成员、违规、处罚（缺一不可）
   * 2. 优先 Clipboard API，降级到 textarea + execCommand
   * 3. 复制成功后该成员违规次数 +1，清空选中
   */
  async function copyResult() {
    const hasMember = selectedMemberId.value !== null
    const hasViolation = violations.value.some((v) => v.checked)
    const hasPenalty = penalties.value.some((p) => p.checked)
    if (!hasMember || !hasViolation || !hasPenalty) {
      const missing: string[] = []
      if (!hasMember) missing.push('提及成员')
      if (!hasViolation) missing.push('违规内容')
      if (!hasPenalty) missing.push('处罚结果')
      showToast('请选择：' + missing.join('、'))
      return
    }
    const text = resultText.value

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // 移动端 fallback
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        ta.style.top = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        showToast('复制失败，请手动选择文字复制')
        return
      }
    }
    showToast('已复制到剪贴板')
    const m = currentMember.value
    if (m) m.count++
    selectedMemberId.value = null
  }

  // ===================== 清空 / 重置 =====================
  /** 仅清空所有勾选状态，保留数据 */
  function clearAll() {
    clearSelection()
    clearViolationChecks()
    clearPenaltyChecks()
    clearReminderSelections()
    banDuration.value = 30
    banUnit.value = '分钟'
    showToast('已清空勾选')
  }

  /** 完全重置所有数据到初始状态 */
  function resetAll() {
    resetMembers()
    resetViolations()
    resetPenalties()
    resetReminders()
    showToast('已重置所有内容')
    showResetConfirm.value = false
  }

  // ===================== localStorage 持久化 =====================
  const STORAGE_KEY = 'punishment-data-v3'

  /** 保存当前状态到 localStorage（选中状态不保存，下次加载时为 false） */
  function saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        members: members.value,
        violations: violations.value.map((v) => ({ ...v, checked: false })),
        penalties: penalties.value.map((p) => ({ ...p, checked: false })),
        reminders: reminders.value.map((r) => ({ ...r, selected: false })),
        nextMemberId: nextMemberId.value,
        nextViolationId: nextViolationId.value,
        nextPenaltyId: nextPenaltyId.value,
        nextReminderId: nextReminderId.value,
        banDuration: banDuration.value,
        banUnit: banUnit.value,
        darkMode: darkMode.value,
      } satisfies StoredData),
    )
  }

  /** 从 localStorage 恢复数据（合并默认值 + 自定义数据） */
  function loadFromStorage() {
    try {
      const data: StoredData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '')
      members.value = data.members || []

      const defV = [
        { id: 1, label: '猎奇', checked: false },
        { id: 2, label: '涉黄', checked: false },
        { id: 3, label: '擦边', checked: false },
        { id: 4, label: '刷屏', checked: false },
        { id: 5, label: '涉政', checked: false },
        { id: 6, label: '晒卡', checked: false },
        { id: 7, label: '过分的负面情绪输出', checked: false },
        { id: 8, label: '影响群内环境', checked: false },
      ]
      violations.value = [
        ...defV,
        ...(data.violations || []).filter((v: Violation) => v.id >= 9).map((v: Violation) => ({ ...v, checked: false })),
      ]

      const defP = [
        { id: 1, label: '撤回相关消息并禁言', checked: false },
        { id: 2, label: '移出群聊', checked: false },
      ]
      penalties.value = [
        ...defP,
        ...(data.penalties || []).filter((p: Penalty) => p.id >= 9).map((p: Penalty) => ({ ...p, checked: false })),
      ]

      reminders.value = (data.reminders || []).map((r: Reminder) => ({ ...r, selected: false }))
      selectedMemberId.value = null
      nextMemberId.value = data.nextMemberId || 1
      nextViolationId.value = data.nextViolationId || 9
      nextPenaltyId.value = data.nextPenaltyId || 9
      nextReminderId.value = data.nextReminderId || 1
      if (data.banDuration !== undefined) banDuration.value = data.banDuration
      if (data.banUnit) banUnit.value = data.banUnit
      if (data.darkMode) {
        darkMode.value = true
        initDarkFromStorage()
      }
    } catch { /* 首次使用或数据损坏，静默忽略 */ }
  }

  /** 自动监听状态变化，实时持久化 */
  watch(
    [members, violations, penalties, reminders, banDuration, banUnit, darkMode],
    saveToStorage,
    { deep: true },
  )

  // ===================== 弹窗 → body 滚动锁定 =====================
  watch([showResetConfirm, showChangelog], ([a, b]) => {
    document.body.style.overflow = a || b ? 'hidden' : ''
  })

  // ===================== 移动端固定栏自适应间距 =====================
  /*
    移动端布局：右栏（结果预览 + toast）position: fixed 在顶部。
    需要动态计算其高度，为 .card 增加 padding-top 以避免被遮挡。
  */
  const fixedColRef = ref<HTMLDivElement | null>(null)
  let resizeObserver: ResizeObserver | null = null
  let bodyObserver: MutationObserver | null = null

  function updateCardPadding() {
    const col = fixedColRef.value
    const card = document.querySelector('.card') as HTMLElement | null
    if (!col || !card || window.innerWidth > 768) {
      if (card) card.style.paddingTop = ''
      return
    }
    card.style.paddingTop = col.offsetHeight + 16 + 'px'
  }

  onMounted(() => {
    loadFromStorage()
    // 监听右栏高度变化，更新 padding
    resizeObserver = new ResizeObserver(updateCardPadding)
    if (fixedColRef.value) resizeObserver.observe(fixedColRef.value)
    updateCardPadding()
    // 监听弹窗 DOM 变化，锁定 body 滚动
    bodyObserver = new MutationObserver(() => {
      document.body.style.overflow = document.querySelector('.modal-overlay') ? 'hidden' : ''
    })
    bodyObserver.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    bodyObserver?.disconnect()
  })

  // ===================== 更新历史数据 =====================
  const changelog: ChangelogEntry[] = [
    {
      version: 'V3.0.1',
      date: '2026-06-15',
      items: [
        '尝试修复了移动端的无法复制问题',
        '做了一些移动端适配，新增更新历史按钮',
        '修复了一些已知问题（？）',
      ],
    },
    {
      version: 'V3.0.0',
      date: '2026-06-15',
      items: ['你别管前两个大版本到哪里去了反正这就是V3.0'],
    },
  ]

  return {
    members, violations, penalties, reminders,
    selectedMemberId, banDuration, banUnit, darkMode,
    toastMsg, toastShow,
    showResetConfirm, showChangelog,
    currentMember, banMax, resultText,
    selectMember, addMember, removeMember,
    toggleViolation, addViolation, removeViolation,
    togglePenalty, addPenalty, removePenalty,
    toggleReminder, addReminder, removeReminder,
    copyResult, clearAll, resetAll,
    toggleDark, fixedColRef, changelog,
  }
}

/*
  useAppState — 应用状态编排层
  组合所有领域 composable，处理跨领域的横切关注点：
  - 复制到剪贴板（copyResult）
  - 清空 / 重置所有
  对外暴露统一的接口，App.vue 只需解构使用。

  持久化、移动端布局、弹窗滚动锁定等副作用已分别拆分到
  usePersistence / useLayoutAdapt / useScrollLock。
*/
import { ref, onMounted } from 'vue'
import { useMembers } from './useMembers'
import { useViolations } from './useViolations'
import { usePenalties } from './usePenalties'
import { useReminders } from './useReminders'
import { useResult } from './useResult'
import { useToast } from './useToast'
import { useDarkMode } from './useDarkMode'
import { usePersistence } from './usePersistence'
import { useLayoutAdapt } from './useLayoutAdapt'
import { useScrollLock } from './useScrollLock'
import { changelog } from '../data/changelog'

export function useAppState() {
  // ===================== 组合领域状态 =====================
  const {
    members,
    selectedMemberId,
    currentMember,
    nextMemberId,
    selectMember,
    addMember,
    removeMember,
    adjustMemberCount,
    clearSelection,
    resetMembers,
  } = useMembers()

  const {
    violations,
    nextViolationId,
    selectedViolations,
    autoReminder,
    toggleViolation,
    addViolation,
    removeViolation,
    resetViolations,
    clearViolationChecks,
  } = useViolations()

  const {
    penalties,
    nextPenaltyId,
    banDuration,
    banUnit,
    banMax,
    togglePenalty,
    addPenalty,
    removePenalty,
    resetPenalties,
    clearPenaltyChecks,
  } = usePenalties()

  const {
    reminders,
    nextReminderId,
    selectedReminders,
    toggleReminder,
    addReminder,
    removeReminder,
    resetReminders,
    clearReminderSelections,
  } = useReminders()

  const { toastMsg, toastShow, showToast } = useToast()
  const { darkMode, toggleDark, initDarkFromStorage } = useDarkMode()

  // ===================== 结果文本计算 =====================
  const { resultText } = useResult(
    currentMember,
    selectedViolations,
    penalties,
    banDuration,
    banUnit,
    autoReminder,
    selectedReminders,
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
  /** 仅清空所有勾选状态，保留数据与禁言时长设置 */
  function clearAll() {
    clearSelection()
    clearViolationChecks()
    clearPenaltyChecks()
    clearReminderSelections()
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

  // ===================== 持久化 / 布局 / 滚动锁定 =====================
  const { load: loadFromStorage } = usePersistence({
    members,
    violations,
    penalties,
    reminders,
    nextMemberId,
    nextViolationId,
    nextPenaltyId,
    nextReminderId,
    banDuration,
    banUnit,
    darkMode,
    onDarkLoaded: initDarkFromStorage,
  })

  const { fixedColRef } = useLayoutAdapt()
  useScrollLock()

  onMounted(() => {
    loadFromStorage()
  })

  return {
    members,
    violations,
    penalties,
    reminders,
    selectedMemberId,
    banDuration,
    banUnit,
    darkMode,
    toastMsg,
    toastShow,
    showResetConfirm,
    showChangelog,
    currentMember,
    banMax,
    resultText,
    selectMember,
    addMember,
    removeMember,
    adjustMemberCount,
    toggleViolation,
    addViolation,
    removeViolation,
    togglePenalty,
    addPenalty,
    removePenalty,
    toggleReminder,
    addReminder,
    removeReminder,
    copyResult,
    clearAll,
    resetAll,
    toggleDark,
    fixedColRef,
    changelog,
  }
}

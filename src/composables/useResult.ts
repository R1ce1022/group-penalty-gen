/*
  useResult — 处罚结果文本生成
  纯计算函数：接收所有领域的响应式状态，组合成最终的处罚通知文本。
  本身不持有状态，所有数据通过参数注入。
*/
import { computed, type ComputedRef, type Ref } from 'vue'
import type { Member, Penalty, BanUnit } from '../types'
import { DEFAULT_BAN_PENALTY_ID } from '../data/defaults'

export function useResult(
  currentMember: ComputedRef<Member | null>,
  selectedViolations: ComputedRef<string[]>,
  penalties: Ref<Penalty[]>,
  banDuration: Ref<number>,
  banUnit: Ref<BanUnit>,
  autoReminder: ComputedRef<string[]>,
  selectedReminders: ComputedRef<string[]>,
) {
  /**
   * 将单个处罚项格式化为结果文本中的一行。
   * 仅默认禁言处罚项（id=DEFAULT_BAN_PENALTY_ID）追加时长，
   * 用 id 精确匹配而非 label 子串，避免误伤含「禁言」二字的自定义处罚。
   */
  function formatPenalty(p: Penalty): string {
    if (p.id === DEFAULT_BAN_PENALTY_ID) {
      return `撤回相关消息并禁言${banDuration.value}${banUnit.value}`
    }
    return p.label
  }

  /** 组合所有选中项，生成格式化处罚文本 */
  const resultText = computed(() => {
    const m = currentMember.value
    const atText = m ? '@' + m.label : '@未填写'
    const n = m ? m.count : 0
    const viols = selectedViolations.value
    let text = `${atText}（${n === 0 ? '该成员首次违规' : `该成员已有${n}次违规记录`}）\n\n`
    text +=
      '违规内容：\n' +
      (viols.length > 0 ? viols.join(' / ') + '\n\n' : '（未填写违规内容）\n\n')
    text += '处罚结果：\n'
    const cp = penalties.value.filter((p) => p.checked)
    if (cp.length === 0) {
      text += '（未选择处罚）\n\n'
    } else {
      text += cp.map(formatPenalty).join(' / ') + '\n\n'
    }
    // 提醒段落：autoReminder 内部去重（多条晒卡违规只出现一次）
    const autoR = [...new Set(autoReminder.value.map((r) => r.trim()).filter(Boolean))]
    if (autoR.length > 0) text += '提醒：\n' + autoR.join('\n') + '\n\n'
    // 备注提醒段落：去掉已在「提醒」中出现过的文字，避免两段重复
    const autoSet = new Set(autoR)
    const selRem = selectedReminders.value
      .map((r) => r.trim())
      .filter((r) => r && !autoSet.has(r))
    if (selRem.length > 0) text += '备注提醒：\n' + selRem.join('\n') + '\n\n'
    text += '请其他人引以为鉴，\n务必注意群规。'
    return text
  })

  return { resultText }
}

/*
  usePenalties — 处罚结果状态管理
  管理处罚项列表（含 2 个默认处罚）+ 禁言时长滑轨。
  支持勾选、添加自定义、删除、重置。
*/
import { ref, computed, watch } from 'vue'
import type { Penalty } from '../types'
import { CUSTOM_ID_THRESHOLD, createDefaultPenalties } from '../data/defaults'

export function usePenalties() {
  const penalties = ref<Penalty[]>(createDefaultPenalties())
  const nextPenaltyId = ref(CUSTOM_ID_THRESHOLD) // 默认处罚占用 id 1-2，自定义从阈值开始
  const banDuration = ref(30)       // 禁言时长（数值部分）
  const banUnit = ref('分钟')        // 禁言单位：分钟 / 小时 / 天

  /** 根据禁言单位计算滑轨最大值 */
  const banMax = computed(() => {
    switch (banUnit.value) {
      case '小时':
        return 24
      case '天':
        return 30
      default:
        return 60
    }
  })

  /** 切换单位时，如果当前时长超出新单位的上限则自动截断 */
  watch(banUnit, () => {
    if (banDuration.value > banMax.value) banDuration.value = banMax.value
  })

  /** 切换勾选状态 */
  function togglePenalty(id: number) {
    const p = penalties.value.find((x) => x.id === id)
    if (p) p.checked = !p.checked
  }

  /** 添加自定义处罚，默认勾选 */
  function addPenalty(name: string) {
    penalties.value.push({ id: nextPenaltyId.value++, label: name, checked: true })
  }

  /** 删除指定处罚 */
  function removePenalty(id: number) {
    penalties.value = penalties.value.filter((p) => p.id !== id)
  }

  /** 重置到默认处罚列表 + 禁言时长复位 */
  function resetPenalties() {
    penalties.value = createDefaultPenalties()
    nextPenaltyId.value = CUSTOM_ID_THRESHOLD
    banDuration.value = 30
    banUnit.value = '分钟'
  }

  /** 清空所有勾选（保留条目） */
  function clearPenaltyChecks() {
    penalties.value.forEach((p) => (p.checked = false))
  }

  return {
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
  }
}

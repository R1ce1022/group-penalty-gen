/*
  useMembers — 成员状态管理
  管理被处罚成员列表，支持选中、添加、删除、重置。
  每个成员记录违规次数，复制结果时自动累加。
*/
import { ref, computed } from 'vue'
import type { Member } from '../types'

export function useMembers() {
  const members = ref<Member[]>([])             // 全部成员列表
  const selectedMemberId = ref<number | null>(null)  // 当前选中的成员 ID
  const nextMemberId = ref(1)                   // 自增 ID 种子

  /** 当前选中的成员对象 */
  const currentMember = computed(
    () => members.value.find((m) => m.id === selectedMemberId.value) || null,
  )

  /** 点击切换选中/取消，再次点击同一成员取消 */
  function selectMember(id: number) {
    selectedMemberId.value = selectedMemberId.value === id ? null : id
  }

  /** 添加成员，违规次数从 0 开始 */
  function addMember(name: string) {
    members.value.push({ id: nextMemberId.value++, label: name, count: 0 })
  }

  /** 删除指定成员，若该成员正被选中则清空选中 */
  function removeMember(id: number) {
    members.value = members.value.filter((m) => m.id !== id)
    if (selectedMemberId.value === id) selectedMemberId.value = null
  }

  /** 仅清除选中状态 */
  function clearSelection() {
    selectedMemberId.value = null
  }

  /** 重置到空白状态 */
  function resetMembers() {
    members.value = []
    selectedMemberId.value = null
    nextMemberId.value = 1
  }

  return {
    members,
    selectedMemberId,
    currentMember,
    nextMemberId,
    selectMember,
    addMember,
    removeMember,
    clearSelection,
    resetMembers,
  }
}

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ===================== 数据结构 =====================
export interface Member {
  id: number
  label: string
  count: number
}
export interface Violation {
  id: number
  label: string
  checked: boolean
  reminder?: string
}
export interface Penalty {
  id: number
  label: string
  checked: boolean
}
export interface Reminder {
  id: number
  text: string
  selected: boolean
}

// ===================== 默认数据 =====================
function createDefaultViolations(): Violation[] {
  return [
    { id: 1, label: '猎奇', checked: false },
    { id: 2, label: '涉黄', checked: false },
    { id: 3, label: '擦边', checked: false },
    { id: 4, label: '刷屏', checked: false },
    { id: 5, label: '涉政', checked: false },
    { id: 6, label: '晒卡', checked: false },
    { id: 7, label: '过分的负面情绪输出', checked: false },
    { id: 8, label: '影响群内环境', checked: false },
  ]
}
function createDefaultPenalties(): Penalty[] {
  return [
    { id: 1, label: '撤回相关消息并禁言', checked: false },
    { id: 2, label: '移出群聊', checked: false },
  ]
}

export function useAppState() {
  // ===================== 响应式状态 =====================
  const members = ref<Member[]>([])
  const violations = ref<Violation[]>(createDefaultViolations())
  const penalties = ref<Penalty[]>(createDefaultPenalties())
  const reminders = ref<Reminder[]>([])
  const selectedMemberId = ref<number | null>(null)
  const banDuration = ref(30)
  const banUnit = ref('分钟')
  const darkMode = ref(false)
  const toastMsg = ref('')
  const toastShow = ref(false)
  const showResetConfirm = ref(false)
  const showChangelog = ref(false)

  let nextMemberId = 1,
    nextViolationId = 9,
    nextPenaltyId = 9,
    nextReminderId = 1
  let toastTimer: ReturnType<typeof setTimeout>

  // ===================== 计算属性 =====================
  const currentMember = computed(
    () => members.value.find((m) => m.id === selectedMemberId.value) || null,
  )

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

  const selectedViolations = computed(() =>
    violations.value.filter((v) => v.checked).map((v) => v.label),
  )

  const autoReminder = computed(() => {
    const checked = violations.value.filter((v) => v.checked)
    const r: string[] = []
    if (checked.some((v) => v.label.includes('晒卡')))
      r.push('晒卡请移步群频道')
    for (const v of checked) {
      if (v.reminder?.trim()) r.push(v.reminder.trim())
    }
    return r
  })

  const selectedReminders = computed(() =>
    reminders.value.filter((r) => r.selected).map((r) => r.text),
  )

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
      text +=
        cp
          .map((p) =>
            p.label.includes('禁言')
              ? `撤回相关消息并禁言${banDuration.value}${banUnit.value}`
              : p.label,
          )
          .join(' / ') + '\n\n'
    }
    if (autoReminder.value.length > 0)
      text += '提醒：\n' + autoReminder.value.join('\n') + '\n\n'
    const selRem = selectedReminders.value
    if (selRem.length > 0) text += '备注提醒：\n' + selRem.join('\n') + '\n\n'
    text += '请其他人引以为鉴，\n务必注意群规。'
    return text
  })

  // ===================== Toast =====================
  function showToast(msg: string) {
    toastMsg.value = msg
    toastShow.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastShow.value = false
    }, 1500)
  }

  // ===================== 成员操作 =====================
  function selectMember(id: number) {
    selectedMemberId.value = selectedMemberId.value === id ? null : id
  }
  function addMember(name: string) {
    members.value.push({ id: nextMemberId++, label: name, count: 0 })
    showToast('成员添加成功')
  }
  function removeMember(id: number) {
    members.value = members.value.filter((m) => m.id !== id)
    if (selectedMemberId.value === id) selectedMemberId.value = null
  }

  // ===================== 违规操作 =====================
  function toggleViolation(id: number) {
    const v = violations.value.find((x) => x.id === id)
    if (v) v.checked = !v.checked
  }
  function addViolation(name: string, reminder: string) {
    violations.value.push({
      id: nextViolationId++,
      label: name,
      checked: true,
      reminder: reminder || undefined,
    })
    showToast('违规添加成功')
  }
  function removeViolation(id: number) {
    violations.value = violations.value.filter((v) => v.id !== id)
  }

  // ===================== 处罚操作 =====================
  function togglePenalty(id: number) {
    const p = penalties.value.find((x) => x.id === id)
    if (p) p.checked = !p.checked
  }
  function addPenalty(name: string) {
    penalties.value.push({ id: nextPenaltyId++, label: name, checked: true })
    showToast('处罚添加成功')
  }
  function removePenalty(id: number) {
    penalties.value = penalties.value.filter((p) => p.id !== id)
  }

  // ===================== 备注提醒操作 =====================
  function toggleReminder(id: number) {
    const r = reminders.value.find((x) => x.id === id)
    if (r) r.selected = !r.selected
  }
  function addReminder(text: string) {
    reminders.value.push({ id: nextReminderId++, text, selected: true })
    showToast('备注提醒添加成功')
  }
  function removeReminder(id: number) {
    reminders.value = reminders.value.filter((r) => r.id !== id)
  }

  // ===================== 复制 =====================
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
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ])
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
  function clearAll() {
    selectedMemberId.value = null
    violations.value.forEach((v) => (v.checked = false))
    penalties.value.forEach((p) => (p.checked = false))
    reminders.value.forEach((r) => (r.selected = false))
    banDuration.value = 30
    banUnit.value = '分钟'
    showToast('已清空勾选')
  }
  function resetAll() {
    members.value = []
    violations.value = createDefaultViolations()
    penalties.value = createDefaultPenalties()
    reminders.value = []
    selectedMemberId.value = null
    banDuration.value = 30
    banUnit.value = '分钟'
    showToast('已重置所有内容')
    showResetConfirm.value = false
  }

  // ===================== 暗色模式 =====================
  function toggleDark() {
    darkMode.value = !darkMode.value
    document.documentElement.classList.toggle('dark', darkMode.value)
  }

  // ===================== 移动端固定栏自适应间距 =====================
  const fixedColRef = ref<HTMLDivElement | null>(null)
  let resizeObserver: ResizeObserver | null = null
  function updateCardPadding() {
    const col = fixedColRef.value
    const card = document.querySelector('.card') as HTMLElement | null
    if (!col || !card || window.innerWidth > 768) {
      if (card) card.style.paddingTop = ''
      return
    }
    card.style.paddingTop = col.offsetHeight + 16 + 'px'
  }

  // ===================== localStorage =====================
  const STORAGE_KEY = 'punishment-data-v3'
  interface StoredData {
    members: Member[]
    violations: Violation[]
    penalties: Penalty[]
    reminders: Reminder[]
    nextMemberId: number
    nextViolationId: number
    nextPenaltyId: number
    nextReminderId: number
    banDuration: number
    banUnit: string
    darkMode: boolean
  }

  function saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        members: members.value,
        violations: violations.value.map((v) => ({ ...v, checked: false })),
        penalties: penalties.value.map((p) => ({ ...p, checked: false })),
        reminders: reminders.value.map((r) => ({ ...r, selected: false })),
        nextMemberId,
        nextViolationId,
        nextPenaltyId,
        nextReminderId,
        banDuration: banDuration.value,
        banUnit: banUnit.value,
        darkMode: darkMode.value,
      }),
    )
  }

  function loadFromStorage() {
    try {
      const data: StoredData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '',
      )
      members.value = data.members || []
      const defV = createDefaultViolations()
      violations.value = [
        ...defV,
        ...(data.violations || [])
          .filter((v: Violation) => v.id >= 9)
          .map((v: Violation) => ({ ...v, checked: false })),
      ]
      const defP = createDefaultPenalties()
      penalties.value = [
        ...defP,
        ...(data.penalties || [])
          .filter((p: Penalty) => p.id >= 9)
          .map((p: Penalty) => ({ ...p, checked: false })),
      ]
      reminders.value = (data.reminders || []).map((r: Reminder) => ({
        ...r,
        selected: false,
      }))
      selectedMemberId.value = null
      nextMemberId = data.nextMemberId || 1
      nextViolationId = data.nextViolationId || 9
      nextPenaltyId = data.nextPenaltyId || 9
      nextReminderId = data.nextReminderId || 1
      if (data.banDuration !== undefined) banDuration.value = data.banDuration
      if (data.banUnit) banUnit.value = data.banUnit
      if (data.darkMode) {
        darkMode.value = true
        document.documentElement.classList.add('dark')
      }
    } catch {
      /* */
    }
  }

  // ===================== Watchers & Lifecycle =====================
  watch(
    [members, violations, penalties, reminders, banDuration, banUnit, darkMode],
    saveToStorage,
    { deep: true },
  )
  watch(banUnit, () => {
    if (banDuration.value > banMax.value) banDuration.value = banMax.value
  })

  onMounted(() => {
    loadFromStorage()
    resizeObserver = new ResizeObserver(updateCardPadding)
    if (fixedColRef.value) resizeObserver.observe(fixedColRef.value)
    updateCardPadding()
  })
  onUnmounted(() => resizeObserver?.disconnect())

  // ===================== 更新历史数据 =====================
  interface ChangelogEntry {
    version: string
    date: string
    items: string[]
  }
  const changelog: ChangelogEntry[] = [
    {
      version: 'V3.0.0',
      date: '2025-06-15',
      items: [
        '完整重构，拆分为组件化架构',
        '新增自定义违规/处罚/备注提醒',
        '新增暗色模式 + 开关控件',
        '新增禁言时长滑轨（分钟/小时/天）',
        '预览框高度平滑过渡动画',
        '移动端固定预览栏 + 自适应间距',
        'PWA 支持，可安装到安卓桌面',
        '代码模块化，抽取 useAppState composable',
      ],
    },
    {
      version: 'V2.0.0',
      date: '2025-05-xx',
      items: [
        '新增成员管理弹窗',
        '新增违规次数自动累加',
        '新增清空/重置按钮',
        '新增 Toast 提示系统',
        '数据持久化到 localStorage',
      ],
    },
    {
      version: 'V1.0.0',
      date: '2025-04-xx',
      items: [
        '基础功能：选择成员、违规、处罚',
        '生成处罚文本并复制到剪贴板',
        '两栏布局，桌面端优先',
      ],
    },
  ]

  return {
    // 状态
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
    // 计算属性
    currentMember,
    banMax,
    resultText,
    // 操作
    selectMember,
    addMember,
    removeMember,
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
    // 其他
    toggleDark,
    fixedColRef,
    changelog,
  }
}

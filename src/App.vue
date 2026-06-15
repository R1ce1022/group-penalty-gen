<!--
  App.vue — 主组件（编排层）
  职责：
  1. 持有所有数据状态（成员、违规、处罚、提醒）
  2. 提供操作方法（添加/删除/切换/复制/清空/重置）
  3. 管理 localStorage 持久化
  4. 管理暗色模式、移动端自适应间距
  5. 通过 props 向下传递数据，通过事件接收子组件的操作通知
-->
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MemberManager from './MemberManager.vue'
import ViolationManager from './ViolationManager.vue'
import PenaltyManager from './PenaltyManager.vue'
import ReminderManager from './ReminderManager.vue'
import ResultPreview from './ResultPreview.vue'

// ===================== 数据结构定义 =====================
/** 成员：id=唯一编号, label=名称, count=累计违规次数 */
interface Member {
  id: number
  label: string
  count: number
}
/** 违规：checked=是否勾选, reminder=选中时自动出现的提醒文字 */
interface Violation {
  id: number
  label: string
  checked: boolean
  reminder?: string
}
/** 处罚 */
interface Penalty {
  id: number
  label: string
  checked: boolean
}
/** 备注提醒：selected=是否选中 */
interface Reminder {
  id: number
  text: string
  selected: boolean
}

// ===================== 响应式状态 =====================
const members = ref<Member[]>([])
const violations = ref<Violation[]>(createDefaultViolations())
const penalties = ref<Penalty[]>(createDefaultPenalties())
const reminders = ref<Reminder[]>([])
const selectedMemberId = ref<number | null>(null) // 当前选中的成员 ID
const banDuration = ref(30) // 禁言时长
const banUnit = ref('分钟') // 禁言单位
const darkMode = ref(false) // 暗色模式开关

// Toast 提示
const toastMsg = ref('')
const toastShow = ref(false)
const showResetConfirm = ref(false) // 重置确认弹窗

// ID 计数器（自增，保证每条数据有唯一 ID）
let nextMemberId = 1,
  nextViolationId = 9,
  nextPenaltyId = 9,
  nextReminderId = 1
let toastTimer: ReturnType<typeof setTimeout>

// ===================== 默认数据工厂 =====================
/** 生成 8 条默认违规选项，id 1~8 */
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
/** 生成 2 条默认处罚选项，id 1~2 */
function createDefaultPenalties(): Penalty[] {
  return [
    { id: 1, label: '撤回相关消息并禁言', checked: false },
    { id: 2, label: '移出群聊', checked: false },
  ]
}

// ===================== 计算属性 =====================
/** 当前选中的成员对象（没有选中时返回 null） */
const currentMember = computed(
  () => members.value.find((m) => m.id === selectedMemberId.value) || null,
)

/** 根据禁言单位返回滑轨最大值 */
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

/** 已勾选的违规名称列表 */
const selectedViolations = computed(() =>
  violations.value.filter((v) => v.checked).map((v) => v.label),
)

/** 由违规内容自动生成的提醒（默认违规固定提醒 + 自定义违规填写的提醒） */
const autoReminder = computed(() => {
  const checked = violations.value.filter((v) => v.checked)
  const r: string[] = []
  if (checked.some((v) => v.label.includes('晒卡'))) r.push('晒卡请移步群频道')
  for (const v of checked) {
    if (v.reminder?.trim()) r.push(v.reminder.trim())
  }
  return r
})

/** 已选中的备注提醒文字列表 */
const selectedReminders = computed(() =>
  reminders.value.filter((r) => r.selected).map((r) => r.text),
)

/** 最终生成的处罚结果文本（核心逻辑） */
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

// ===================== Toast 统一提示 =====================
/** 显示底部浮动提示，1.5 秒后自动消失 */
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
/** 点击预览框时：先检查必选项，通过后复制到剪贴板并 +1 违规次数 */
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

  // 优先使用 Clipboard API，兜底用 execCommand
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // 移动端兜底方案：创建临时 textarea
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }

  showToast('已复制到剪贴板')
  const m = currentMember.value
  if (m) m.count++
  selectedMemberId.value = null
}

// ===================== 清空 / 重置 =====================
/** 清空：只取消所有勾选，保留自定义内容 */
function clearAll() {
  selectedMemberId.value = null
  violations.value.forEach((v) => (v.checked = false))
  penalties.value.forEach((p) => (p.checked = false))
  reminders.value.forEach((r) => (r.selected = false))
  banDuration.value = 30
  banUnit.value = '分钟'
  showToast('已清空勾选')
}
/** 重置所有：清除全部自定义内容回到初始状态（保留暗色模式） */
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
/** 通过 ResizeObserver 监听底部固定栏高度，动态调整卡片上边距，避免内容被挡住 */
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

// ===================== localStorage 持久化 =====================
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

/** 保存当前状态到 localStorage（保存前清除勾选状态） */
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

/** 从 localStorage 恢复数据（自定义内容保留，勾选状态强制重置） */
function loadFromStorage() {
  try {
    const data: StoredData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '')
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
    /* JSON 解析失败时忽略 */
  }
}

// 自动保存：数据变化时写入 localStorage
watch(
  [members, violations, penalties, reminders, banDuration, banUnit, darkMode],
  saveToStorage,
  { deep: true },
)
// 切换单位时修正越界的数值
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
</script>

<!-- ==================== 模板 ==================== -->
<template>
  <div class="card" :class="{ 'dark-card': darkMode }">
    <!-- 标题栏 + 暗色模式开关 -->
    <div class="flex-between">
      <h2>处罚结果生成器 V3.0.0</h2>
      <label class="switch-row">
        <span class="switch-label">暗色模式</span>
        <span class="switch" :class="{ active: darkMode }" @click="toggleDark">
          <span class="switch-knob"></span>
        </span>
      </label>
    </div>
    <p class="muted">点击上方预览框即可复制内容，复制后违规次数自动 +1</p>

    <!-- 两栏布局 -->
    <div class="layout-grid">
      <!-- 左栏：表单 -->
      <div>
        <MemberManager
          :members="members"
          :selected-member-id="selectedMemberId"
          @select="selectMember"
          @add="addMember"
          @remove="removeMember"
        />
        <hr />
        <ViolationManager
          :violations="violations"
          @toggle="toggleViolation"
          @add="addViolation"
          @remove="removeViolation"
        />
        <hr />
        <PenaltyManager
          :penalties="penalties"
          :ban-duration="banDuration"
          :ban-unit="banUnit"
          :ban-max="banMax"
          @toggle="togglePenalty"
          @add="addPenalty"
          @remove="removePenalty"
          @update:ban-duration="banDuration = $event"
          @update:ban-unit="banUnit = $event"
        />
        <ReminderManager
          :reminders="reminders"
          @toggle="toggleReminder"
          @add="addReminder"
          @remove="removeReminder"
        />
        <div class="action-row" style="display: flex; gap: 8px">
          <button @click="clearAll" class="ghost" style="flex: 1">清空</button>
          <button
            @click="showResetConfirm = true"
            class="btn-danger"
            style="flex: 1"
          >
            重置所有
          </button>
        </div>
      </div>

      <!-- 右栏：预览 -->
      <div ref="fixedColRef">
        <ResultPreview :result-text="resultText" @copy="copyResult" />
        <Transition name="toast">
          <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
        </Transition>
      </div>
    </div>

    <!-- 重置确认弹窗 -->
    <Transition name="fade">
      <div
        v-if="showResetConfirm"
        class="modal-overlay"
        @click.self="showResetConfirm = false"
      >
        <div class="modal-dialog modal-sm">
          <h3>确认重置</h3>
          <p class="muted">
            重置将清除所有自定义内容（成员、自定义违规、自定义处罚、备注提醒等），此操作不可恢复。确定要重置吗？
          </p>
          <div style="display: flex; gap: 8px; margin-top: 16px">
            <button
              class="ghost"
              style="flex: 1"
              @click="showResetConfirm = false"
            >
              取消
            </button>
            <button class="btn-danger" style="flex: 1" @click="resetAll">
              确认重置
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<!--
  MemberManager — 成员管理组件
  显示成员 chip 列表（点击选中/取消），提供管理弹窗（添加/删除成员）。
  选中成员后用于生成 @ 提及，违规次数显示在 chip 右侧。
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { Member } from '../types'

defineProps<{
  members: Member[]
  selectedMemberId: number | null
}>()
const emit = defineEmits<{
  select: [id: number]
  add: [name: string]
  remove: [id: number]
  adjust: [id: number, delta: number]
}>()

const showModal = ref(false) // 管理弹窗显隐
const inputName = ref('') // 添加成员的输入框

/** 添加成员，自动过滤空输入 */
function add() {
  const name = inputName.value.trim()
  if (!name) return
  emit('add', name)
  inputName.value = ''
}
/** 回车键快速添加 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    add()
  }
}

/**
 * 根据违规次数生成徽标内联样式：色相随次数连续过渡。
 * 0 次绿(hue 120) → 1 次黄(hue 55) → 逐次往红靠 → 10 次纯红(hue 0)。
 * 文字始终白色。10 次以上锁定纯红。
 */
function countStyle(count: number) {
  let hue: number
  if (count <= 0)
    hue = 120 // 绿
  else if (count === 1)
    hue = 55 // 黄
  else if (count >= 10)
    hue = 0 // 纯红
  else hue = 55 - ((count - 1) * 55) / 9 // 1→10 次：55 线性到 0
  return {
    background: `hsl(${hue}, 75%, 55%)`,
    color: '#fff',
  }
}
</script>

<template>
  <label>@ 提及成员</label>
  <div class="chips">
    <span
      v-for="m in members"
      :key="m.id"
      class="chip chip-active"
      :class="{ checked: selectedMemberId === m.id }"
      @click="emit('select', m.id)"
    >
      @{{ m.label }}
      <span class="chip-count" :style="countStyle(m.count)">{{ m.count }}</span>
    </span>
    <div v-if="members.length === 0" class="empty-chip-hint">
      还没有成员，添加后点击选中。
    </div>
  </div>
  <div class="chip-row">
    <button class="ghost" @click="showModal = true">+ 管理成员</button>
  </div>

  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-dialog">
        <h3>管理成员</h3>
        <p class="muted">
          添加成员后点选即可生成处罚结果，每次复制生成结果该成员违规次数自动
          +1。
        </p>
        <label>成员名称</label>
        <input
          v-model="inputName"
          type="text"
          placeholder="直接粘贴成员名称,自动过滤 @ 号"
          @input="inputName = inputName.replace(/@/g, '')"
          @keydown="onKeydown"
        />
        <button class="ghost" style="margin-top: 10px" @click="add">
          添加
        </button>
        <label style="margin-top: 16px">已添加的成员</label>
        <div v-if="members.length === 0" class="empty-hint">还没有成员。</div>
        <ul v-else class="modal-list">
          <li v-for="m in members" :key="m.id" class="modal-list-item">
            <strong>@{{ m.label }}</strong>
            <div class="count-adjust">
              <button
                class="ghost delete-btn"
                :disabled="m.count <= 0"
                @click="emit('adjust', m.id, -1)"
              >
                −
              </button>
              <span class="hint">违规 {{ m.count }} 次</span>
              <button class="ghost delete-btn" @click="emit('adjust', m.id, 1)">
                +
              </button>
            </div>
            <button class="ghost delete-btn" @click="emit('remove', m.id)">
              删除
            </button>
          </li>
        </ul>
        <div class="action-row">
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

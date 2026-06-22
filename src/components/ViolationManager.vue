<!--
  ViolationManager — 违规管理组件
  显示违规 chip 复选框列表（含默认违规 + 自定义），提供管理弹窗。
  自定义违规可附带提醒内容，勾选后自动出现在结果"提醒"段落中。
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { CUSTOM_ID_THRESHOLD } from '../data/defaults'

const props = defineProps<{
  violations: {
    id: number
    label: string
    checked: boolean
    reminder?: string
  }[]
}>()
const emit = defineEmits<{
  toggle: [id: number]
  add: [name: string, reminder: string]
  remove: [id: number]
}>()

const showModal = ref(false)         // 管理弹窗显隐
const inputName = ref('')            // 自定义违规名称
const inputReminder = ref('')        // 自定义违规的自动提醒（可选）

/** 只显示 id >= 阈值的违规（即用户自定义的违规） */
const customViolations = computed(() =>
  props.violations.filter((v) => v.id >= CUSTOM_ID_THRESHOLD),
)

/** 添加自定义违规，附带提醒文本 */
function add() {
  const name = inputName.value.trim()
  if (!name) return
  emit('add', name, inputReminder.value.trim())
  inputName.value = ''
  inputReminder.value = ''
}
/** 回车键快速添加 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    add()
  }
}
</script>

<template>
  <label>违规内容（必选）</label>
  <div class="chips">
    <label
      v-for="v in violations"
      :key="v.id"
      class="chip"
      :class="{ checked: v.checked }"
    >
      <input
        type="checkbox"
        :checked="v.checked"
        @change="emit('toggle', v.id)"
      />
      {{ v.label }}
    </label>
  </div>
  <div class="chip-row">
    <button class="ghost" @click="showModal = true">+ 管理自定义违规</button>
  </div>

  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-dialog">
        <h3>管理自定义违规</h3>
        <p class="muted">添加自定义违规，并可设置选中时自动出现的提醒内容。</p>
        <label>违规内容</label>
        <input
          v-model="inputName"
          type="text"
          placeholder="例如：引战"
          @keydown="onKeydown"
        />
        <label class="small" style="margin-top: 10px">提醒内容（可选）</label>
        <input
          v-model="inputReminder"
          type="text"
          placeholder="例如：请友善交流"
          @keydown="onKeydown"
        />
        <button class="ghost" style="margin-top: 10px" @click="add">
          添加
        </button>
        <label style="margin-top: 16px">已添加的自定义违规</label>
        <div v-if="customViolations.length === 0" class="empty-hint">
          还没有自定义违规。
        </div>
        <ul v-else class="modal-list">
          <li v-for="v in customViolations" :key="v.id" class="modal-list-item">
            <div>
              <strong>{{ v.label }}</strong
              ><span v-if="v.reminder" class="hint">→ {{ v.reminder }}</span>
            </div>
            <button class="ghost delete-btn" @click="emit('remove', v.id)">
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

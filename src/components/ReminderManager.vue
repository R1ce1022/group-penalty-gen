<!--
  ReminderManager — 备注提醒管理组件
  显示备注提醒 chip 复选框列表，提供管理弹窗（添加/删除）。
  勾选的提醒文本会出现在处罚结果"备注提醒"段落中。
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  reminders: { id: number; text: string; selected: boolean }[]
}>()
const emit = defineEmits<{
  toggle: [id: number]
  add: [text: string]
  remove: [id: number]
}>()

const showModal = ref(false)     // 管理弹窗显隐
const inputText = ref('')        // 添加提醒的输入框

const customReminders = computed(() => props.reminders)

/** 添加备注提醒 */
function add() {
  const t = inputText.value.trim()
  if (!t) return
  emit('add', t)
  inputText.value = ''
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
  <label>备注提醒（可选）</label>
  <div class="chips">
    <label
      v-for="r in reminders"
      :key="r.id"
      class="chip chip-reminder"
      :class="{ checked: r.selected }"
    >
      <input
        type="checkbox"
        :checked="r.selected"
        @change="emit('toggle', r.id)"
      />
      {{ r.text }}
    </label>
    <div v-if="reminders.length === 0" class="empty-chip-hint">
      还没有备注提醒。
    </div>
  </div>
  <div class="chip-row">
    <button class="ghost" @click="showModal = true">+ 管理备注提醒</button>
  </div>

  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-dialog">
        <h3>管理备注提醒</h3>
        <p class="muted">添加常用的备注提醒，需要时勾选即可出现在结果里。</p>
        <label>提醒内容</label>
        <input
          v-model="inputText"
          type="text"
          placeholder="例如：下不为例"
          @keydown="onKeydown"
        />
        <button class="ghost" style="margin-top: 10px" @click="add">
          添加
        </button>
        <label style="margin-top: 16px">已添加的备注提醒</label>
        <div v-if="customReminders.length === 0" class="empty-hint">
          还没有备注提醒。
        </div>
        <ul v-else class="modal-list">
          <li v-for="r in customReminders" :key="r.id" class="modal-list-item">
            <strong>{{ r.text }}</strong>
            <button class="ghost delete-btn" @click="emit('remove', r.id)">
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

<!--
  PenaltyManager — 处罚管理组件
  显示处罚 chip 复选框列表（含默认处罚 + 自定义）+ 禁言时长滑轨。
  勾选了含"禁言"的处罚项时显示滑轨，可拖动调整时长和单位。
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  penalties: { id: number; label: string; checked: boolean }[]
  banDuration: number
  banUnit: string
  banMax: number
}>()
const emit = defineEmits<{
  toggle: [id: number]
  add: [name: string]
  remove: [id: number]
  'update:banDuration': [v: number]
  'update:banUnit': [v: string]
}>()

const showModal = ref(false)     // 管理弹窗显隐
const inputName = ref('')        // 自定义处罚名称

/** 只显示 id>=9 的处罚（即用户自定义的处罚） */
const customPenalties = computed(() => props.penalties.filter((p) => p.id >= 9))
/** 是否有勾选了含"禁言"的处罚项，控制滑轨显示 */
const hasBan = computed(() =>
  props.penalties.some((p) => p.checked && p.label.includes('禁言')),
)

/** 添加自定义处罚 */
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
</script>

<template>
  <label>处罚结果（必选）</label>
  <div class="chips">
    <label
      v-for="p in penalties"
      :key="p.id"
      class="chip"
      :class="{ checked: p.checked }"
    >
      <input
        type="checkbox"
        :checked="p.checked"
        @change="emit('toggle', p.id)"
      />
      {{ p.label }}
    </label>
  </div>

  <!-- 禁言时长滑轨：勾选了禁言相关处罚才显示 -->
  <div v-show="hasBan" class="ban-group" style="margin-top: 8px">
    <div class="ban-slider-row">
      <input
        type="range"
        :value="banDuration"
        min="1"
        :max="banMax"
        class="ban-slider"
        @input="
          emit(
            'update:banDuration',
            Number(($event.target as HTMLInputElement).value),
          )
        "
      />
      <span class="ban-value"
        >{{ banDuration
        }}{{ banUnit === '小时' ? 'h' : banUnit === '分钟' ? 'm' : 'd' }}</span
      >
    </div>
    <div class="ban-unit-group">
      <button
        v-for="u in ['分钟', '小时', '天']"
        :key="u"
        class="unit-btn"
        :class="{ active: banUnit === u }"
        @click="emit('update:banUnit', u)"
      >
        {{ u }}
      </button>
    </div>
  </div>

  <div class="chip-row">
    <button class="ghost" @click="showModal = true">+ 管理自定义处罚</button>
  </div>

  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-dialog">
        <h3>管理自定义处罚</h3>
        <p class="muted">添加自定义处罚，勾选后会出现在结果里。</p>
        <label>处罚内容</label>
        <input
          v-model="inputName"
          type="text"
          placeholder="例如：警告处理"
          @keydown="onKeydown"
        />
        <button class="ghost" style="margin-top: 10px" @click="add">
          添加
        </button>
        <label style="margin-top: 16px">已添加的自定义处罚</label>
        <div v-if="customPenalties.length === 0" class="empty-hint">
          还没有自定义处罚。
        </div>
        <ul v-else class="modal-list">
          <li v-for="p in customPenalties" :key="p.id" class="modal-list-item">
            <strong>{{ p.label }}</strong>
            <button class="ghost delete-btn" @click="emit('remove', p.id)">
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

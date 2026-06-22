<!--
  App.vue — 根组件
  编排布局，从 useAppState 获取所有状态和方法，通过 props/events 分发给子组件。
-->
<script setup lang="ts">
import MemberManager from './components/MemberManager.vue'
import ViolationManager from './components/ViolationManager.vue'
import PenaltyManager from './components/PenaltyManager.vue'
import ReminderManager from './components/ReminderManager.vue'
import ResultPreview from './components/ResultPreview.vue'
import ResetConfirmModal from './components/ResetConfirmModal.vue'
import ChangelogModal from './components/ChangelogModal.vue'
import { useAppState } from './composables/useAppState'

const {
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
  banMax,
  resultText,
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
  toggleDark,
  fixedColRef,
  changelog,
} = useAppState()
</script>

<template>
  <div class="card">
    <!-- 标题栏 + 暗色模式开关 -->
    <div class="flex-between">
      <h2 class="app-title">处罚结果生成器 V3.0.2</h2>
      <label class="switch-row">
        <span class="switch-label">暗色模式</span>
        <span class="switch" :class="{ active: darkMode }" @click="toggleDark">
          <span class="switch-knob"></span>
        </span>
      </label>
      <button class="changelog-btn" @click="showChangelog = true">
        更新历史
      </button>
    </div>
    <p class="muted">点击预览框即可复制内容，复制后违规次数自动+1</p>

    <div class="layout-grid">
      <!-- 左栏：成员 + 违规 + 处罚 + 备注 + 操作按钮 -->
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

      <!-- 右栏：结果预览 + toast -->
      <div ref="fixedColRef">
        <ResultPreview :result-text="resultText" @copy="copyResult" />
        <Transition name="toast">
          <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
        </Transition>
      </div>
    </div>

    <!-- 弹窗 -->
    <ResetConfirmModal
      :show="showResetConfirm"
      @confirm="resetAll"
      @cancel="showResetConfirm = false"
    />
    <ChangelogModal
      :show="showChangelog"
      :changelog="changelog"
      @close="showChangelog = false"
    />
  </div>
</template>

<style scoped>
.app-title {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--color-primary);
}

.switch-row {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin: 0 !important;
  font-weight: 400 !important;
}
.switch-label {
  font-size: 13px;
  color: var(--color-text-muted);
  user-select: none;
}
.switch {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--color-border);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}
.switch.active {
  background: var(--color-primary);
  box-shadow: 0 0 12px rgba(122, 109, 241, 0.4);
}
.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.switch.active .switch-knob {
  transform: translateX(16px);
}

.changelog-btn {
  background: var(--color-bg-card);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, box-shadow 0.15s;
}
.changelog-btn:hover {
  background: var(--chip-active-bg);
  box-shadow: var(--shadow-sm);
}
</style>

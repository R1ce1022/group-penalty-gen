<!--
  App.vue — 主组件（编排层）
  所有状态和逻辑从 useAppState composable 引入
  模板负责布局和数据绑定
-->
<script setup lang="ts">
import MemberManager from './MemberManager.vue'
import ViolationManager from './ViolationManager.vue'
import PenaltyManager from './PenaltyManager.vue'
import ReminderManager from './ReminderManager.vue'
import ResultPreview from './ResultPreview.vue'
import { useAppState } from './useAppState'

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
      <button class="changelog-btn" @click="showChangelog = true">
        更新历史
      </button>
    </div>
    <p class="muted">点击上方预览框即可复制内容，复制后违规次数自动 +1</p>

    <div class="layout-grid">
      <!-- 左栏 -->
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

      <!-- 右栏 -->
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

    <!-- 更新历史弹窗 -->
    <Transition name="fade">
      <div
        v-if="showChangelog"
        class="modal-overlay"
        @click.self="showChangelog = false"
      >
        <div class="modal-dialog">
          <h3>更新历史</h3>
          <div
            v-for="v in changelog"
            :key="v.version"
            class="changelog-version"
          >
            <div class="changelog-header">
              <strong>{{ v.version }}</strong>
              <span class="changelog-date">{{ v.date }}</span>
            </div>
            <ul class="changelog-list">
              <li v-for="(item, i) in v.items" :key="i">{{ item }}</li>
            </ul>
          </div>
          <div class="action-row">
            <button @click="showChangelog = false">关闭</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

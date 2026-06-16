<!--
  ResetConfirmModal — 重置确认弹窗
  点击"重置所有"时弹出，防止误操作。
-->
<script setup lang="ts">
defineProps<{ show: boolean }>()
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-dialog modal-sm">
        <h3>确认重置</h3>
        <p class="muted">
          重置将清除所有自定义内容（成员、自定义违规、自定义处罚、备注提醒等），此操作不可恢复。确定要重置吗？
        </p>
        <div style="display: flex; gap: 8px; margin-top: 16px">
          <button class="ghost" style="flex: 1" @click="emit('cancel')">取消</button>
          <button class="btn-danger" style="flex: 1" @click="emit('confirm')">确认重置</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

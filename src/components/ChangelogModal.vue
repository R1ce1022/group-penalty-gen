<!--
  ChangelogModal — 更新历史弹窗
  展示版本更新日志，数据从 useAppState 的 changelog 注入。
-->
<script setup lang="ts">
import type { ChangelogEntry } from '../types'

defineProps<{
  show: boolean
  changelog: ChangelogEntry[]
}>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
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
          <button @click="emit('close')">关闭</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

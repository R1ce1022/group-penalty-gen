<!--
  ResultPreview — 结果预览组件
  显示生成的处罚通知文本，点击触发复制到剪贴板。
  内容变化时给一个柔和的脉冲反馈（不操作 height，避免过渡稳定性问题）。
-->
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ resultText: string }>()
const emit = defineEmits<{ copy: [] }>()

const previewRef = ref<HTMLDivElement | null>(null)
let pulseTimer: ReturnType<typeof setTimeout> | undefined

/**
 * 监听结果文本变化，给预览框加一个脉冲 class 触发 CSS animation。
 * 不操作 height/transform，避免反复点击时的时序 bug 与边框颤抖。
 */
watch(
  () => props.resultText,
  () => {
    const el = previewRef.value
    if (!el) return
    // 先移除再添加，确保连续变化都能重新触发 animation
    el.classList.remove('pulse')
    void el.offsetWidth // 强制重排，重置动画
    el.classList.add('pulse')
    if (pulseTimer) clearTimeout(pulseTimer)
    pulseTimer = setTimeout(() => {
      el.classList.remove('pulse')
      pulseTimer = undefined
    }, 300)
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    ref="previewRef"
    class="preview"
    title="点击复制内容"
    @click="emit('copy')"
  >
    {{ resultText }}
  </div>
</template>

<style scoped>
.preview {
  position: relative;
  white-space: pre-wrap;
  background: var(--preview-bg);
  color: var(--preview-text);
  padding: 14px 12px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--preview-border);
  margin-top: var(--space-md);
  min-height: 120px;
  cursor: pointer;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Cascadia Code', 'Consolas', 'Microsoft Yahei',
    monospace;
  font-size: var(--font-size-base);
  line-height: 1.6;
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}
/* 顶部渐变条，标识输出区 */
.preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
.preview:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}
.preview:active {
  border-color: var(--color-primary);
}

/* 内容变化脉冲反馈：边框短暂高亮 + 轻微辉光，不动 height/transform */
.preview.pulse {
  animation: preview-pulse 0.3s ease;
}
@keyframes preview-pulse {
  0% {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm), var(--shadow-glow);
  }
  100% {
    border-color: var(--preview-border);
    box-shadow: var(--shadow-sm);
  }
}
</style>

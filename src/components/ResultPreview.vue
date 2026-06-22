<!--
  ResultPreview — 结果预览组件
  显示生成的处罚通知文本，点击触发复制到剪贴板。
  内容变化时自动做高度平滑过渡动画。
-->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ resultText: string }>()
const emit = defineEmits<{ copy: [] }>()

const previewRef = ref<HTMLDivElement | null>(null)
// 高度过渡时长，须与 CSS .preview 的 transition: height 保持一致
const HEIGHT_TRANSITION_MS = 250
let lastPreviewHeight = 0   // 记录上次内容高度，用于动画过渡
let isReady = false         // 跳过首次加载的动画

/** 监听结果文本变化，通过固定高度 → 新高度的方式触发 CSS transition */
watch(
  () => props.resultText,
  () => {
    const el = previewRef.value
    if (!el || !isReady) return
    const newHeight = el.scrollHeight
    if (newHeight === lastPreviewHeight) return
    el.style.height = lastPreviewHeight + 'px'
    void el.offsetHeight          // 强制重排
    el.style.height = newHeight + 'px'
    lastPreviewHeight = newHeight
    setTimeout(() => {
      el.style.height = ''        // 过渡结束后释放固定高度
    }, HEIGHT_TRANSITION_MS)
  },
  { flush: 'post' },
)

onMounted(() => {
  const el = previewRef.value
  if (el) lastPreviewHeight = el.scrollHeight
  isReady = true
})
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
    height 0.25s ease,
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
</style>

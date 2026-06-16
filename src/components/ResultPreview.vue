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
let lastPreviewHeight = 120   // 记录上次内容高度，用于动画过渡
let isReady = false           // 跳过首次加载的动画

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
      el.style.height = ''        // 300ms 后释放固定高度
    }, 300)
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
  white-space: pre-wrap;
  background: #0b1220;
  color: #e6f6f6;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  min-height: 120px;
  cursor: pointer;
  overflow: hidden;
  transition:
    height 0.25s ease,
    background 0.15s;
  box-sizing: border-box;
}
.preview:hover {
  background: #141f33;
}
.preview:active {
  background: #1a2840;
}
</style>

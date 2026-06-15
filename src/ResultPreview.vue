<!--
  ResultPreview.vue — 结果预览组件
  显示生成的处罚文本，点击触发复制
  内容变化时自动做高度平滑过渡动画
-->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ resultText: string }>()
const emit = defineEmits<{ copy: [] }>()

const previewRef = ref<HTMLDivElement | null>(null)
let lastPreviewHeight = 120 // 记住上次内容高度
let isReady = false // 跳过首次加载的动画

/** 监听结果文本变化，做高度平滑过渡 */
watch(
  () => props.resultText,
  () => {
    const el = previewRef.value
    if (!el || !isReady) return
    const newHeight = el.scrollHeight
    if (newHeight === lastPreviewHeight) return
    // 先固定为旧高度 → 强制重排 → 再设为新高度 → CSS transition 触发动画
    el.style.height = lastPreviewHeight + 'px'
    void el.offsetHeight
    el.style.height = newHeight + 'px'
    lastPreviewHeight = newHeight
    setTimeout(() => {
      el.style.height = ''
    }, 300) // 300ms 后释放固定高度
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

/*
  useLayoutAdapt — 移动端固定栏自适应间距
  移动端布局：右栏（结果预览 + toast）position: fixed 在顶部，
  需动态计算其高度并为 .card 增加 padding-top 以避免遮挡。
  纯视图层副作用，从 useAppState 中剥离。
*/
import { onMounted, onUnmounted, ref } from 'vue'

export function useLayoutAdapt() {
  const fixedColRef = ref<HTMLDivElement | null>(null)
  let resizeObserver: ResizeObserver | null = null

  function updateCardPadding() {
    const col = fixedColRef.value
    const card = document.querySelector('.card') as HTMLElement | null
    if (!col || !card || window.innerWidth > 768) {
      if (card) card.style.paddingTop = ''
      return
    }
    card.style.paddingTop = col.offsetHeight + 16 + 'px'
  }

  onMounted(() => {
    resizeObserver = new ResizeObserver(updateCardPadding)
    if (fixedColRef.value) resizeObserver.observe(fixedColRef.value)
    updateCardPadding()
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
  })

  return { fixedColRef }
}

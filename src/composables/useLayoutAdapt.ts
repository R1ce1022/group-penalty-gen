/*
  useLayoutAdapt — 移动端固定栏自适应间距
  移动端布局：右栏（结果预览 + toast）position: fixed 在顶部，
  需动态计算其高度并为 .card 增加 padding-top 以避免遮挡。
  纯视图层副作用，从 useAppState 中剥离。
*/
import { onMounted, onUnmounted, ref } from 'vue'

// 移动端断点，须与 style.scss 的 @media (max-width: 768px) 保持一致
const MOBILE_BREAKPOINT = 768
// 固定栏与下方内容之间的额外间距
const FIXED_COL_GAP = 8

export function useLayoutAdapt() {
  const fixedColRef = ref<HTMLDivElement | null>(null)
  let resizeObserver: ResizeObserver | null = null

  function updateCardPadding() {
    const col = fixedColRef.value
    const card = document.querySelector('.card') as HTMLElement | null
    if (!col || !card || window.innerWidth > MOBILE_BREAKPOINT) {
      if (card) card.style.paddingTop = ''
      return
    }
    // 用 offsetHeight（含 border），即固定栏真实占用高度
    card.style.paddingTop = col.offsetHeight + FIXED_COL_GAP + 'px'
  }

  onMounted(() => {
    resizeObserver = new ResizeObserver(updateCardPadding)
    if (fixedColRef.value) resizeObserver.observe(fixedColRef.value)
    window.addEventListener('resize', updateCardPadding)
    updateCardPadding()
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', updateCardPadding)
  })

  return { fixedColRef }
}

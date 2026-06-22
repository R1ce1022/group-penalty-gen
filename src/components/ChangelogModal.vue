<!--
  ChangelogModal — 更新历史弹窗
  手风琴式展示：最新版本默认展开并标「最新」，旧版本折叠。
  每条更新带类型标签（新功能/修复/优化/UI），便于快速分类浏览。
  展开/折叠用 grid-template-rows 0fr↔1fr 方案实现平滑高度过渡。
  数据从 useAppState 的 changelog 注入。
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChangelogEntry, ChangeType, ChangeSet } from '../types'

const props = defineProps<{
  show: boolean
  changelog: ChangelogEntry[]
}>()
const emit = defineEmits<{ close: [] }>()

/** 变更类型 → 标签文案 + 样式类 */
const TYPE_META: Record<ChangeType, { label: string; cls: string }> = {
  feature: { label: '新功能', cls: 'tag-feature' },
  bugfix: { label: '修复', cls: 'tag-bugfix' },
  improvement: { label: '优化', cls: 'tag-improvement' },
  ui: { label: 'UI', cls: 'tag-ui' },
}

/** 类型展示顺序 */
const TYPE_ORDER: ChangeType[] = ['feature', 'improvement', 'bugfix', 'ui']

/** 把按类型分组的变更集合，展开为「类型 + 该类型所有条目」的有序分组数组 */
function toGroups(items: ChangeSet) {
  return TYPE_ORDER.filter((t) => items[t]?.length).map((t) => ({
    type: t,
    entries: items[t] as string[],
  }))
}

/** 每个版本的展开状态：最新版默认展开，其余折叠 */
const openStates = ref<boolean[]>(
  props.changelog.map((_, i) => i === 0),
)

/** 计算属性缓存：每个版本展开后的分组 */
const versionGroups = computed(() =>
  props.changelog.map((v, i) => ({
    ...v,
    groups: toGroups(v.items),
    open: openStates.value[i] ?? false,
    index: i,
  })),
)

/** 切换某版本展开/折叠 */
function toggle(i: number) {
  openStates.value[i] = !openStates.value[i]
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-dialog changelog-dialog">
        <h3>更新历史</h3>
        <div class="changelog-list-wrap">
          <div
            v-for="v in versionGroups"
            :key="v.version"
            class="changelog-version"
            :class="{ open: v.open }"
            @click="toggle(v.index)"
          >
            <div class="changelog-header">
              <span class="changelog-version-tag">
                <strong>{{ v.version }}</strong>
                <span v-if="v.index === 0" class="changelog-latest">最新</span>
              </span>
              <span class="changelog-date">{{ v.date }}</span>
              <span class="changelog-chevron"></span>
            </div>
            <!-- grid-template-rows 0fr→1fr 实现高度平滑过渡 -->
            <div class="changelog-collapse">
              <div class="changelog-items">
                <div
                  v-for="g in v.groups"
                  :key="g.type"
                  class="changelog-group"
                >
                  <span
                    class="changelog-tag"
                    :class="TYPE_META[g.type].cls"
                    >{{ TYPE_META[g.type].label }}</span
                  >
                  <ul class="changelog-group-list">
                    <li v-for="(text, idx) in g.entries" :key="idx">
                      {{ text }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="action-row">
          <button @click="emit('close')">关闭</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

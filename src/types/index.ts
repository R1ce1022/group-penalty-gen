/** 成员数据 */
export interface Member {
  id: number
  label: string
  count: number    // 违规次数，复制结果后自动 +1
}

/** 禁言单位（单一真源，defaults.ts 复用本类型） */
export type BanUnit = '分钟' | '小时' | '天'

/** 违规项 */
export interface Violation {
  id: number
  label: string
  checked: boolean
  reminder?: string  // 选中时自动追加的提醒文本
}

/** 处罚项 */
export interface Penalty {
  id: number
  label: string
  checked: boolean
}

/** 备注提醒 */
export interface Reminder {
  id: number
  text: string
  selected: boolean
}

/** localStorage 存储的数据结构 */
export interface StoredData {
  members: Member[]
  violations: Violation[]
  penalties: Penalty[]
  reminders: Reminder[]
  nextMemberId: number
  nextViolationId: number
  nextPenaltyId: number
  nextReminderId: number
  banDuration: number
  banUnit: BanUnit
  darkMode: boolean
}

/** 单条变更的类型（用于更新历史分类标签） */
export type ChangeType = 'feature' | 'bugfix' | 'improvement' | 'ui'

/**
 * 一个版本的变更集合：按类型分组，每组对应若干条文案。
 * 写数据时同类合并到一起，避免重复标注 type。
 * 例：{ feature: ['新增A','新增B'], bugfix: ['修复C'] }
 */
export type ChangeSet = Partial<Record<ChangeType, string[]>>

/** 更新历史条目 */
export interface ChangelogEntry {
  version: string
  date: string
  items: ChangeSet
}

/** 成员数据 */
export interface Member {
  id: number
  label: string
  count: number    // 违规次数，复制结果后自动 +1
}

/** 禁言单位（与 src/data/defaults.ts 的 BanUnit 保持一致） */
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

/** 更新历史条目 */
export interface ChangelogEntry {
  version: string
  date: string
  items: string[]
}

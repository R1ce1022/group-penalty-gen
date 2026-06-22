/*
  defaults — 默认数据与常量
  集中存放默认违规/处罚项、自定义条目的 ID 边界、禁言相关常量与单位映射。
  消除 useAppState / useViolations / usePenalties / PenaltyManager 之间的
  重复定义和散落的魔法数字/魔法字符串。
*/
import type { Penalty, Violation } from '../types'

/**
 * 自定义条目 ID 起始阈值。
 * 默认项占用 id 1..(DEFAULT_xxx_COUNT)，自定义项从本常量开始编号，
 * 加载历史数据时据此区分"默认项"与"用户自定义项"。
 * （留出余量，便于以后扩充默认项而不破坏旧数据。）
 */
export const CUSTOM_ID_THRESHOLD = 9

/** 默认禁言处罚项的 id（createDefaultPenalties 中 id=1 的「撤回相关消息并禁言」）。
 *  文本生成时据此精确匹配需插入时长的处罚项，避免靠 label 子串匹配误伤自定义项。 */
export const DEFAULT_BAN_PENALTY_ID = 1

/** 禁言时长默认值（数值部分） */
export const DEFAULT_BAN_DURATION = 30

/** 禁言单位联合类型 */
export type BanUnit = '分钟' | '小时' | '天'

/** 禁言单位默认值 */
export const DEFAULT_BAN_UNIT: BanUnit = '分钟'

/** 禁言单位可选列表（单一真源，供滑轨单位按钮与上限计算复用） */
export const BAN_UNITS: BanUnit[] = ['分钟', '小时', '天']

/** 各单位对应的最大时长（滑轨 max） */
export const BAN_UNIT_LIMITS: Record<BanUnit, number> = {
  分钟: 60,
  小时: 24,
  天: 30,
}

/** 各单位在结果文本中的缩写（h / m / d） */
export const BAN_UNIT_ABBR: Record<BanUnit, string> = {
  分钟: 'm',
  小时: 'h',
  天: 'd',
}

/** 8 个默认违规选项 */
export function createDefaultViolations(): Violation[] {
  return [
    { id: 1, label: '猎奇', checked: false },
    { id: 2, label: '涉黄', checked: false },
    { id: 3, label: '擦边', checked: false },
    { id: 4, label: '刷屏', checked: false },
    { id: 5, label: '涉政', checked: false },
    { id: 6, label: '晒卡', checked: false },
    { id: 7, label: '过分的负面情绪输出', checked: false },
    { id: 8, label: '影响群内环境', checked: false },
  ]
}

/** 2 个默认处罚选项 */
export function createDefaultPenalties(): Penalty[] {
  return [
    { id: 1, label: '撤回相关消息并禁言', checked: false },
    { id: 2, label: '移出群聊', checked: false },
  ]
}

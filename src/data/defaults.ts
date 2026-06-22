/*
  defaults — 默认数据与常量
  集中存放默认违规/处罚项，以及自定义条目的 ID 边界。
  消除 useAppState / useViolations / usePenalties 之间的重复定义
  和散落的 "id >= 9" 魔法数字。
*/
import type { Penalty, Violation } from '../types'

/**
 * 自定义条目 ID 起始阈值。
 * 默认项占用 id 1..(DEFAULT_xxx_COUNT)，自定义项从本常量开始编号，
 * 加载历史数据时据此区分"默认项"与"用户自定义项"。
 * （留出余量，便于以后扩充默认项而不破坏旧数据。）
 */
export const CUSTOM_ID_THRESHOLD = 9

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

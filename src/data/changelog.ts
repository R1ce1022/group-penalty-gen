/*
  changelog — 更新历史数据
  本质是数据而非逻辑，从 useAppState 中独立出来，便于维护。
*/
import type { ChangelogEntry } from '../types'

export const changelog: ChangelogEntry[] = [
  {
    version: 'V3.0.2',
    date: '2026-06-16',
    items: [
      '把主题色改成了瓦尔基里紫,目前只改了些控件以后会更好',
      '对UI做了些小巧思调整',
      '这么大一个背景图你不会看不到吧',
    ],
  },
  {
    version: 'V3.0.1',
    date: '2026-06-15',
    items: [
      '尝试修复了移动端的无法复制问题',
      '做了一些移动端适配，新增更新历史按钮',
      '修复了一些已知问题（？）',
    ],
  },
  {
    version: 'V3.0.0',
    date: '2026-06-15',
    items: ['你别管前两个大版本到哪里去了反正这就是V3.0'],
  },
]

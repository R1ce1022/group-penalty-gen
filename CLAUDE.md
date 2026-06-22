# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「处罚结果生成器」— 一个纯前端、无后端、无路由的单页工具，用于群管理员生成处罚通知文本。纯自用项目，部署为 GitHub Pages（master `/docs` 模式）并作为 PWA 安装到主屏幕。所有用户数据存在浏览器 `localStorage`，无服务端。

技术栈：Vue 3（`<script setup>` + TS）+ Vite 8 + SCSS + vite-plugin-pwa。无测试框架、无 lint 工具、无路由库、无状态管理库（Pinia 等）。

## 常用命令

```bash
npm run dev        # 启动 Vite 开发服务器
npm run build      # tsc 类型检查 + vite build，产物输出到 dist/
npm run preview    # 预览构建产物
npm run deploy     # build 后执行 scripts/sync-docs.mjs，把 dist/ 同步到 docs/
```

- **部署链路关键点**：`base: './'`（相对路径，适配 GitHub Pages 子目录）。`docs/` 是部署目录，**必须提交到 git**（`.gitignore` 特意保留它），内容由 `sync-docs.mjs` 全量清空重建（仅保留 `.nojekyll`）。**不要手动往 `docs/` 堆文件**，会累积旧 hash 文件。
- 没有单测命令，也没有 lint/format 命令。`tsc` 的严格检查（`noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`、`verbatimModuleSyntax`）通过 `npm run build` 触发，是事实上的类型/lint 门禁——改完代码跑一次 build 确认无 TS 报错。
- TS 配置为 `noEmit`（bundler 模式），`include` 仅 `src`；不要把类型放 `src` 外。

## 架构

### 状态：composable 分层（核心约定）

所有状态逻辑在 `src/composables/` 中，**不使用** Pinia/Vuex。`App.vue` 只从顶层 composable 解构状态与方法，通过 props/events 分发给子组件——子组件保持「哑组件」，不直接读 composable。

分层：

- **领域 composables**（各管一摊响应式数据 + 增删改查）：`useMembers`、`useViolations`、`usePenalties`、`useReminders`。各自维护对应数组、`nextXxxId` 自增计数器、`reset/clear` 方法。
- **`useResult`** — 纯计算函数（`computed`），接收各领域状态作参数注入，拼装最终处罚通知文本。无副作用、无自身状态。**生成文本的规则集中在这里**（见 `useResult.ts`，如「禁言」类处罚会插入 `banDuration`/`banUnit`）。
- **`useAppState`** — **编排层**，组合上述所有领域 composable，并承担跨领域横切关注点：`copyResult`（复制到剪贴板 + 校验 + 违规次数 +1）、`clearAll`、`resetAll`、弹窗显隐状态。**新增跨领域逻辑放这里**，不要塞进单个领域 composable 或 `App.vue`。
- **副作用 composables**：`usePersistence`（localStorage 持久化）、`useLayoutAdapt`（移动端布局/固定列）、`useScrollLock`（弹窗滚动锁定）、`useDarkMode`、`useToast`。

### 持久化的关键不变量（`usePersistence.ts`）

- `STORAGE_KEY = 'punishment-data-v3'`。改结构就 bump 版本号，别破坏旧数据。
- **选中状态（`checked`/`selected`）一律不持久化**：`save` 时强制置 `false`，`load` 时也置 `false`。不要打破这个约定。
- **默认项 vs 自定义项靠 ID 区分**：默认项 id `1..(CUSTOM_ID_THRESHOLD-1)`（见 `src/data/defaults.ts`，当前阈值 `9`），用户自定义项 id `≥ 9`。`load` 时默认项总是用 `createDefaultViolations/createDefaultPenalties` 重建（这样扩充默认项不会与旧数据冲突），自定义项从存储里过滤 `id >= CUSTOM_ID_THRESHOLD` 合并回来。新增默认项时把阈值留出余量，必要时调高 `CUSTOM_ID_THRESHOLD`。
- `watch([...], save, { deep: true })` 实时自动保存，无需手动调用 `save`。
- 暗色模式加载后需回调 `onDarkLoaded` 同步 DOM class。

### 数据与类型

- `src/types/index.ts` — 所有领域接口（`Member` / `Violation` / `Penalty` / `Reminder` / `StoredData`）。`Member.count` 在复制结果后自动 +1。
- `src/data/defaults.ts` — 默认违规/处罚项工厂 + `CUSTOM_ID_THRESHOLD`。
- `src/data/changelog.ts` — 更新历史条目，供 `ChangelogModal` 渲染。版本号在 `App.vue` 标题与 changelog 中需保持一致。

### 组件

`src/components/` 下各 `*Manager.vue` 对应一个领域（成员/违规/处罚/备注），`ResultPreview.vue` 显示生成的文本并触发复制，`*Modal.vue` 是弹窗。组件间不互相引用，全部通过 `App.vue` 中转。

## PWA

`vite.config.ts` 用 `vite-plugin-pwa`，`registerType: 'autoUpdate'`，manifest 在配置里内联定义。`public/` 下放 `icon.svg`/`icon.png`/`favicon.svg`。改图标/manifest 在 `vite.config.ts` 里改，不要手编 `docs/` 里的 `manifest.webmanifest`/`sw.js`（它们是构建产物）。

## 代码风格约定

- 文件顶部用块注释说明该文件职责与拆分理由（中文），这是本仓库既有惯例，新增/改动文件时沿用。
- 中文注释与文案。处罚文本、UI 文案均为中文。
- 严格遵守 `verbatimModuleSyntax`：类型导入用 `import type`。
- 命名：composable 文件 `useXxx.ts`，导出函数同名；领域状态 `ref`，ID 计数器 `nextXxxId`。

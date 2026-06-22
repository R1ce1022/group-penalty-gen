/*
  sync-docs — 将 dist 构建产物同步到 docs 目录（master /docs 部署模式）
  每次部署先清空 docs（保留 .nojekyll），再拷贝 dist 全部内容。
  避免手动拷贝导致旧 hash 文件堆积。无外部依赖，纯 Node fs 实现。
*/
import { cp, rm, readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
const docs = join(root, 'docs')
const KEEP = new Set(['.nojekyll'])

if (!existsSync(dist)) {
  console.error('[sync-docs] dist 目录不存在，请先执行 build。')
  process.exit(1)
}

// 1. 清空 docs（保留 KEEP 中的文件）
await mkdir(docs, { recursive: true })
for (const name of await readdir(docs)) {
  if (KEEP.has(name)) continue
  await rm(join(docs, name), { recursive: true, force: true })
}

// 2. 拷贝 dist → docs
await cp(dist, docs, { recursive: true })
console.log('[sync-docs] 已将 dist 同步到 docs。')

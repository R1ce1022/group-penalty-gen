/*
  vite.config.ts — Vite 构建工具的配置文件
*/
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  // 构建产物输出到 dist，再由 scripts/sync-docs.mjs 同步到 docs（master /docs 部署），
  // 同步时保留 .nojekyll 等 GitHub Pages 必需文件。
  build: { outDir: 'dist' },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon.png'],
      manifest: {
        name: '处罚结果生成器',
        short_name: '处罚生成器',
        description: '群管理处罚结果生成工具',
        theme_color: '#0ea5a4',
        background_color: '#f7fafc',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
})

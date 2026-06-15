/*
  main.ts — 应用的入口文件
  这是整个 Vue 应用启动的地方，浏览器加载的第一个脚本
*/

// Vue 3 的 createApp：创建一个 Vue 应用实例
import { createApp } from 'vue'
// 根组件 App.vue（所有页面内容都在 App.vue 里）
import App from './App.vue'
// 全局 CSS 样式（整个项目都会生效）
import './style.css'

// 创建应用 → 挂载到 index.html 里的 <div id="app"> 上
createApp(App).mount('#app')

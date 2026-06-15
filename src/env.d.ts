/*
  env.d.ts — TypeScript 类型声明文件
  这个文件告诉 TypeScript：
  1. Vite 提供哪些全局类型（如 import.meta.env）
  2. .vue 文件是什么类型（默认 TypeScript 不认识 .vue 文件）
*/

// 引用 Vite 的客户端类型定义
/// <reference types="vite/client" />

// 声明 .vue 文件的类型
// 作用：当在 TypeScript 里 import 一个 .vue 文件时，不会报错
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```sh
npm run dev       # 启动开发服务器（带热更新）
npm run build     # 生产构建（输出到 dist/）
npm run preview   # 本地预览生产构建
```

当前未配置测试运行器和代码检查工具。

## 项目架构

- **Vue 3 + Vite 8**：SPA 单页应用，全部使用 Composition API 和 `<script setup>` 语法。
- **Vue Router 5**：客户端路由，history 模式。Home 页面为直接导入；About 页面使用懒加载（`component: () => import(...)`），后续新增路由应沿用此方式以实现代码分割。
- **Pinia 3**：状态管理，使用 Composition API 风格的 store（`defineStore` 传入 setup 函数）。
- **路径别名**：`@` 映射到 `src/`，在 `vite.config.js` 和 `jsconfig.json` 中均已配置。

## 入口文件

`src/main.js` 负责挂载应用：创建 Vue 实例 → 安装 Pinia → 安装 Router → 挂载到 `#app`。全局样式在 `main.js` 中通过 `src/assets/main.css` 引入。

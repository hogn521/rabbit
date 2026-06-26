# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```sh
npm install       # 安装依赖（Node ^20.19.0 || >=22.12.0）
npm run dev       # 启动开发服务器（带热更新）
npm run build     # 生产构建（输出到 dist/）
npm run preview   # 本地预览生产构建
```

当前未配置测试运行器、代码检查工具或代码格式化工具。

## 项目架构

- **Vue 3 + Vite 8**：SPA 单页应用，全部使用 Composition API 和 `<script setup>` 语法。
- **Vue Router 5**：客户端路由，history 模式。使用 `Layout` 作为根布局，其内部通过 `<RouterView />` 渲染 `Home`、`Category` 等子页面；`Login` 为独立页面。
- **Pinia 3**：状态管理使用 Composition API 风格的 store（`defineStore` 传入 setup 函数）。示例：`src/stores/category.js` 封装了导航分类数据及其获取逻辑。
- **Element Plus + Sass 主题定制**：UI 组件库为 Element Plus，通过 `unplugin-vue-components` 自动按需导入。主题色在 `src/styles/element/index.scss` 中覆盖，主色为 `#27ba9b`。
- **自动导入**：`unplugin-auto-import` 自动导入 Element Plus 组合式 API，`unplugin-vue-components` 自动注册 Element Plus 组件，无需手动 `import`。
- **HTTP 层**：`src/utils/http.js` 基于 axios 封装了 `httpInstance`，baseURL 固定为 `http://pcapi-xiaotuxian-front-devtest.itheima.net`，超时 5 秒。接口函数放在 `src/apis/*.js` 中，如 `src/apis/layout.js`。
- **SCSS 全局变量**：`vite.config.js` 通过 `additionalData` 自动注入 `src/styles/var.scss` 与 `src/styles/element/index.scss`，组件中可直接使用 `$xtxColor` 等变量。
- **路径别名**：`@` 映射到 `src/`，在 `vite.config.js` 和 `jsconfig.json` 中均已配置。

## 入口与全局样式

`src/main.js` 负责挂载应用：创建 Vue 实例 → 安装 Pinia → 安装 Router → 挂载到 `#app`。全局样式通过 `src/assets/main.css` 与 `src/styles/common.scss` 引入。

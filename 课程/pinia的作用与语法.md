# Pinia 的作用与语法

## 一、Pinia 是什么

Pinia 是 **Vue 3 官方推荐的状态管理库**，用于解决跨组件共享状态的问题。

### 为什么需要它？

当多个组件需要共享同一份数据（如用户信息、购物车、主题设置等）：

- **用 props 逐层传递** → 层级深了很繁琐（props drilling）
- **用 provide/inject** → 没有响应式追踪，调试困难
- **用全局变量** → 无法追踪变化，容易产生 bug

**Pinia 提供一个全局的「状态中心」**，任何组件都可以直接读写，数据变化时所有用到它的组件自动更新。

---

## 二、核心概念

| 概念      | 类比            | 作用                               |
| --------- | --------------- | ---------------------------------- |
| **State** | 组件的 `data`   | 存储数据                           |
| **Getter** | 组件的 `computed` | 基于 state 派生出新数据            |
| **Action** | 组件的 `methods` | 修改 state 或执行异步操作（如 API 请求） |

---

## 三、语法（Composition API 风格）

### 1. 定义 Store

```js
// src/stores/counter.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// defineStore('唯一名称', setup 函数)
export const useCounterStore = defineStore('counter', () => {

  // State —— 用 ref / reactive 定义
  const count = ref(0)

  // Getter —— 用 computed 定义
  const doubleCount = computed(() => count.value * 2)

  // Action —— 普通函数，支持 async/await
  function increment() {
    count.value++
  }

  // 必须 return 出去，外部才能访问
  return { count, doubleCount, increment }
})
```

### 2. 在组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
</script>

<template>
  <p>计数: {{ store.count }}</p>
  <p>两倍: {{ store.doubleCount }}</p>
  <button @click="store.increment()">+1</button>
</template>
```

### 3. storeToRefs —— 解构 store 保持响应式

直接用解构赋值取 store 的属性，会**丢失响应式**：

```js
const store = useCounterStore()

// ❌ 解构后 count 变成普通变量，修改不会触发界面更新
const { count, doubleCount } = store
```

用 `storeToRefs` 解构，**保留响应式连接**：

```js
import { storeToRefs } from 'pinia'

const store = useCounterStore()

// ✅ 解构后仍是响应式的 ref，模板中自动解包
const { count, doubleCount } = storeToRefs(store)
```

**用途**：
- 避免在模板里写 `store.xxx`，更简洁
- 配合 `v-model` 绑定时更方便
- `storeToRefs` 只提取 state 和 getter（ref/computed），**不会提取 action**（函数）

---

##### 函数的解构

Action（函数）不是响应式数据，**直接从 store 解构也不会丢失任何东西**：

```js
const store = useCounterStore()

// ✅ action 可以直接解构
const { increment } = store

increment()  // 直接调用
```

**完整示例 —— storeToRefs + 函数解构搭配使用**：

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()

// state 和 getter → 用 storeToRefs 解构，保持响应式
const { count, doubleCount } = storeToRefs(store)

// action → 直接从 store 解构，不需要 storeToRefs
const { increment } = store
</script>

<template>
  <p>{{ count }}</p>
  <p>{{ doubleCount }}</p>
  <button @click="increment()">+1</button>
  <!-- 全部解构后，模板里不需要出现 store. 前缀 -->
</template>
```

---

##### 总结

| 要解构的内容 | 用什么方式 | 原因 |
|---|---|---|
| State（数据） | `storeToRefs(store)` | 丢失响应式，界面不会更新 |
| Getter（计算属性） | `storeToRefs(store)` | 丢失响应式，界面不会更新 |
| Action（函数） | 直接从 store 解构 | 函数没有响应式概念，直接解构即可 |

```js
// 推荐写法 —— 一行全解构
const store = useCounterStore()
const { count, doubleCount } = storeToRefs(store)
const { increment } = store
```

**注意**：`storeToRefs` 与 Vue 的 `toRefs` 类似，但 `toRefs` 会把 store 里的**所有属性**（包括 action 函数）都转成 ref，这没有意义。`storeToRefs` **只会提取 state 和 getter**，函数不会被包含在内。

---

## 四、语法（Options API 风格）

与 Composition API 风格等价，按项目习惯选用。

```js
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },
})
```

---

## 五、异步 Action

Pinia 原生支持异步，无需额外中间件：

```js
export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  async function fetchUser(id) {
    const res = await fetch(`/api/users/${id}`)
    user.value = await res.json()
  }

  return { user, fetchUser }
})
```

---

## 六、Pinia vs Vuex

| 对比项     | Pinia                              | Vuex                  |
| ---------- | ---------------------------------- | --------------------- |
| 体积       | 更小（1KB）                        | 较大                  |
| TypeScript | 原生支持，类型推断完善             | 需要额外类型声明      |
| 语法       | Composition API / Options API 皆可 | 只能 Options API      |
| 模块拆分   | 无需 modules，每个 store 独立文件  | 需要 modules 嵌套     |
| mutation   | 无 mutation，统一用 action         | 需写 mutation + action |

---

## 七、在项目中使用 Pinia 的步骤

```
① 安装           npm install pinia
② 注册插件       app.use(createPinia())     → main.js
③ 定义 store     defineStore('name', () => {...})  → src/stores/*.js
④ 使用 store     useCounterStore()           → 任意组件
```

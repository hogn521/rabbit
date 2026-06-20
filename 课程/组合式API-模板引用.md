## 组合式API-模板引用（template ref）

### 什么是模板引用

模板引用就是给 DOM 元素或子组件打一个标记，然后在 JS 中直接拿到它的引用，从而操作 DOM 或调用子组件的方法。

---

### 作用

1. **获取 DOM 元素** — 直接操作 DOM（获取宽高、设置焦点、播放视频等）
2. **获取子组件实例** — 访问子组件暴露的数据和方法

> Vue 提倡"声明式渲染"，但有些场景必须手动操作 DOM（如表单自动获取焦点、第三方库初始化）。

---

### 用法

#### 1. 获取 DOM 元素

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 1. 定义一个 ref 变量，变量名与模板中的 ref 属性名一致
const inputRef = ref(null)

onMounted(() => {
  // 3. 挂载完成后，可以获取 DOM 元素
  console.log(inputRef.value)            // <input> 元素
  inputRef.value.focus()                 // ✅ 让输入框自动获取焦点
  console.log(inputRef.value.clientHeight) // ✅ 获取元素高度
})
</script>

<template>
  <!-- 2. 通过 ref 属性绑定 -->
  <input ref="inputRef" type="text" />
</template>
```

#### 2. 获取子组件实例

```vue
<!-- 父组件 -->
<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = ref(null)

onMounted(() => {
  console.log(childRef.value)         // 子组件实例
  console.log(childRef.value.count)   // 访问子组件暴露的数据
  childRef.value.sayHello()           // 调用子组件暴露的方法
})
</script>

<template>
  <Child ref="childRef" />
</template>
```

```vue
<!-- 子组件 Child.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
function sayHello() {
  console.log('Hello from Child')
}

// 必须 expose 暴露给父组件，否则父组件拿不到
defineExpose({
  count,
  sayHello
})
</script>
```

---

### v-for 中使用 ref

```vue
<script setup>
import { ref, onMounted } from 'vue'

const itemRefs = ref([])

onMounted(() => {
  console.log(itemRefs.value)  // 所有 <li> 元素的数组
})
</script>

<template>
  <ul>
    <li v-for="(item, index) in ['A', 'B', 'C']" :key="index" :ref="el => itemRefs[index] = el">
      {{ item }}
    </li>
  </ul>
</template>
```

> `v-for` 中不能直接用字符串 ref，需要用函数 ref 把每个元素存到数组中。

---

### defineExpose — 子组件主动暴露

#### 为什么需要它

在 `<script setup>` 中，组件默认是**关闭**的——父组件通过 `ref` 拿到子组件实例后，**什么都访问不到**。

```vue
<!-- 子组件 -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
function sayHello() { console.log('Hello') }
</script>
```

```vue
<!-- 父组件拿不到任何东西 -->
onMounted(() => {
  console.log(childRef.value)           // {}
  console.log(childRef.value.count)     // undefined
  childRef.value.sayHello()             // ❌ 报错
})
```

必须用 `defineExpose` **显式暴露**，父组件才能访问：

```vue
<!-- 子组件 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
function sayHello() {
  console.log('Hello from Child')
}

// 显式暴露给父组件
defineExpose({
  count,
  sayHello
})
</script>
```

```vue
<!-- 父组件 ✅ 现在可以访问了 -->
onMounted(() => {
  console.log(childRef.value.count)     // 0
  childRef.value.sayHello()             // 'Hello from Child'
})
```

#### 语法

```js
defineExpose({
  变量名,      // 暴露响应式数据
  方法名,      // 暴露方法
  // 也可以暴露计算属性、常量等
})
```

- 不需要 `import`，它是编译宏，直接在 `<script setup>` 中用
- 可以暴露：`ref`、`reactive`、`computed`、函数、普通变量
- 建议**只暴露必须的**，不要一股脑全暴露出去（封装性更好）

#### 常见误区

```js
// ❌ 写在 export default 里（选项式API写法）
export default {
  expose: ['count']
}

// ✅ <script setup> 中用 defineExpose
defineExpose({ count })
```

---

### ref 用在 v-for 的简化写法

```vue
<script setup>
import { ref, onMounted } from 'vue'

const list = ref(['苹果', '香蕉', '橘子'])
const liRefs = ref([])

onMounted(() => {
  liRefs.value.forEach((el, i) => {
    console.log(i, el.textContent)
  })
})
</script>

<template>
  <ul>
    <li v-for="(item, index) in list" :key="index" :ref="el => liRefs[index] = el">
      {{ item }}
    </li>
  </ul>
</template>
```

---

### 注意事项

1. **只能在 `onMounted` 之后访问** — `ref` 在组件挂载后才会赋值，`setup` 阶段是 `null`
2. **`<script setup>` 中子组件必须用 `defineExpose` 暴露**，默认是关闭的（安全考虑）
3. **`v-for` 中不能用字符串 ref**，需要用函数 ref `<div :ref="el => ...">`
4. **`ref` 变量名必须和模板中的属性名一致**

---

### 常见使用场景

| 场景 | 代码 |
|------|------|
| **输入框自动获取焦点** | `inputRef.value.focus()` |
| **获取元素宽高** | `divRef.value.clientHeight` |
| **播放视频** | `videoRef.value.play()` |
| **滚动到指定位置** | `scrollRef.value.scrollTop = 0` |
| **调用子组件方法** | `childRef.value.someMethod()` |

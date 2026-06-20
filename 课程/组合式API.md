## 组合式API

### setup选项的写法和执行时机

```js
<script>
import {ref} from 'vue'
export default {
    setup(){
        console.log("先执行")
    },
    beforeCreated(){
        console.log("后执行") 
    }
}
</script>

```

比 beforeCreate 还早，是组件生命周期中最早执行的钩子。

### setup的语法糖

```js
<script setup>
// 直接写，不需要 export default
</script>
```

#### 组合式API-reactive和ref函数

**为什么要用 ref 和 reactive？**

普通的 JavaScript 变量没有"通知机制"：

```js
let count = 0
count++   // Vue 不知道 count 变了，界面不会更新
```

`ref` 和 `reactive` 让数据变成**响应式**的——数据变了，用到这个数据的地方（模板、计算属性、侦听器等）会自动更新。你只需要修改数据，不用手动操作 DOM。

---

**ref 和 reactive 各自的好处**：

| | ref | reactive |
|---|---|---|
| **适合存什么** | 任意类型（数字、字符串、布尔、对象、数组） | 仅对象 / 数组 |
| **最大好处** | 统一用法，支持重新赋值，解构安全 | 直接读写属性，无需 `.value`，分组管理关联数据直观 |
| **推荐场景** | 日常开发**优先用**，绝大多数情况 | 多个关联值要分组管理时（如表单、坐标） |

---

##### reactive

**作用**：接受一个**对象类型**的参数，返回一个响应式的代理对象（Proxy）。

**用法**：

```js
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Alice'
})

console.log(state.count)   // 0
state.count++              // ✅ 直接修改属性
state.name = 'Bob'         // ✅ 直接修改
```

**特点与注意事项**：

- ✅ 直接读写属性，**无需 `.value`**
- ✅ 支持深层嵌套对象的响应式
- ❌ **不能传基本类型**（`number`、`string`、`boolean`），会丢失响应式
- ❌ **不能直接重新赋值整个对象**，否则丢失响应式
  ```js
  let state = reactive({ count: 0 })
  // ❌ 这样会丢失响应式
  state = reactive({ count: 1 })
  ```
- ❌ **解构会丢失响应式**
  ```js
  const { count } = state   // count 变成普通变量
  ```

---

##### ref

**作用**：接受**任意类型**的参数，返回一个带有 `.value` 属性的响应式引用对象。

**用法**：

```js
import { ref } from 'vue'

const count = ref(0)                // 基本类型
const obj = ref({ name: 'Alice' })  // 对象类型

console.log(count.value)  // 0
count.value++             // ✅ 通过 .value 修改
obj.value.name = 'Bob'    // ✅ 对象内部属性直接改
```

**特点**：

- ✅ 支持**任意类型**（基本类型和对象都可以）
- ✅ **可以重新赋值**，不会丢失响应式
- ✅ **可以解构**（配合 `toRefs`）
- **❌ 在 JS 中读写需要 `.value`**
- ✔ **模板中自动解包**，不用写 `.value`

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
function add() { count.value++ }
</script>

<template>
  <p>{{ count }}</p>              <!-- 模板里不需要 .value -->
  <button @click="add">+1</button>
</template>
```

---

##### ref 的底层原理

当 `ref` 接收**基本类型**时，通过 **getter/setter** 实现依赖追踪。

当 `ref` 接收**对象**时，内部会自动调用 `reactive()` 来包装，所以对象属性的修改也是响应式的。

---

##### reactive vs ref 对比


|              | reactive  | ref                              |
| ------------ | --------- | -------------------------------- |
| **适用类型**     | 仅对象/数组/集合 | 任意类型                             |
| **读写方式**     | 直接 `.属性名` | 需要 `.value`                      |
| **模板中使用**    | 直接使用      | 自动解包，无需 `.value`                 |
| **重新赋值整个变量** | ❌ 丢失响应式   | ✅ 安全                             |
| **解构**       | ❌ 丢失响应式   | ✅ 配合 `toRefs` 安全                 |
| **底层实现**     | Proxy     | 基本类型用 getter/setter，对象用 reactive |


---

##### 推荐用法

**优先使用 `ref`**，原因：

1. 基本类型和对象的写法统一，心智负担小
2. 重新赋值和解构都安全
3. Vue 官方也推荐优先用 `ref`

```js
// ✅ 推荐：统一用 ref
const count = ref(0)
const user = ref({ name: 'Alice', age: 20 })
const list = ref([1, 2, 3])
```

只有当你确实需要一个纯对象且不会整体替换或解构时，才考虑 `reactive`。

---

#### 组合式API-computed计算属性

##### 作用

1. **缓存结果** — 只有依赖的响应式数据变化时才重新计算，不会每次渲染都重跑
2. **派生数据** — 根据现有响应式数据自动算出新数据

---

##### 用法

**基本用法**：

```js
import { ref, computed } from 'vue'

const price = ref(10)
const quantity = ref(3)

const total = computed(() => {
  return price.value * quantity.value
})

console.log(total.value)  // 30
```

只有 `price` 或 `quantity` 变化时，`total` 才会重新计算。

**可读可写（get + set）**：

```js
const firstName = ref('Alice')
const lastName = ref('Wang')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value  // 读
  },
  set(newValue) {
    const parts = newValue.split(' ')
    firstName.value = parts[0]
    lastName.value = parts[1]
  }
})

// 读
console.log(fullName.value)  // 'Alice Wang'

// 写（会自动更新 firstName 和 lastName）
fullName.value = 'Bob Li'
console.log(firstName.value)  // 'Bob'
console.log(lastName.value)   // 'Li'
```

**配合模板使用**：

```vue
<script setup>
import { ref, computed } from 'vue'

const list = ref([1, 2, 3, 4, 5])

const bigList = computed(() => {
  return list.value.filter(item => item > 2)
})
</script>

<template>
  <ul>
    <li v-for="(item, index) in bigList" :key="index">{{ item }}</li>
  </ul>
</template>
```

模板里直接用 `bigList`，**不需要 `.value`**。

---

##### computed 与 method 的区别

| | computed | method |
|---|----------|--------|
| **缓存** | ✅ 有缓存，依赖没变就返回上次结果 | ❌ 每次渲染都重新执行 |
| **性能** | ✅ 响应式数据没变时不重复计算 | ❌ 渲染 10 次就跑 10 次 |
| **依赖追踪** | ✅ 自动追踪响应式依赖 | ❌ 无依赖追踪 |

```js
// ❌ 方法：每次渲染都跑
function calc() {
  return price.value * quantity.value
}

// ✅ computed：只在 price 或 quantity 变了才重算
const total = computed(() => {
  return price.value * quantity.value
})
```

---

##### 常见使用场景

```js
// 过滤列表
const filteredList = computed(() => list.value.filter(item => item.done))

// 拼接字符串
const fullName = computed(() => firstName.value + ' ' + lastName.value)

// 排序
const sortedList = computed(() => [...list.value].sort((a, b) => a - b))

// 条件判断
const statusText = computed(() => count.value > 0 ? '有数据' : '空')
```

---

##### 总结

> **`computed` = 依赖有变化才重新算**，是性能优化的重要手段，凡是需要根据现有响应式数据派生新数据的场景，都应该优先用 `computed`。除了计算意外不应该做其他的事：修改异步请求、修改DOM，避免直接修改计算属性`computed`的值

---

#### 组合式API-watch监听器

##### 作用

**监听**一个或多个响应式数据的变化，数据变化时执行回调函数（副作用），比如发请求、操作 DOM、写日志等。

> `computed` 是"数据变了我重新算"，`watch` 是"数据变了我去做别的事"。

---

##### 用法

**监听单个 ref**：

```js
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log('新值：', newVal)   // 变化后的值
  console.log('旧值：', oldVal)   // 变化前的值
})

count.value = 1   // 触发回调，打印：新值 1，旧值 0
```

**监听多个 ref**：

```js
const firstName = ref('Alice')
const lastName = ref('Wang')

watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log('姓名变化：', oldFirst + ' ' + oldLast, '→', newFirst + ' ' + newLast)
})

firstName.value = 'Bob'   // 触发回调
```

**监听 reactive 的某个属性**：

```js
import { reactive, watch } from 'vue'

const state = reactive({ count: 0 })

// 监听 reactive 的某个属性，需要写成函数形式
watch(
  () => state.count,   // 数据源（getter 函数）
  (newVal, oldVal) => {
    console.log('count 变了：', oldVal, '→', newVal)
  }
)

state.count = 1   // 触发回调
```

**immediate：立即执行**：

```js
watch(count, (newVal, oldVal) => {
  console.log('count：', newVal)
}, { immediate: true })   // 创建时立即执行一次，oldVal 为 undefined
```

**deep：深度监听嵌套对象**：

```js
const user = ref({ name: 'Alice', info: { age: 20 } })

watch(user, (newVal, oldVal) => {
  console.log('user 变了')
}, { deep: true })   // 嵌套属性变化也能触发
```

---

##### watch vs computed 对比

| | watch | computed |
|---|-------|----------|
| **用途** | 执行副作用（请求、DOM 操作等） | 派生新数据 |
| **返回值** | 无（void） | 返回一个 ref |
| **缓存** | 无缓存 | 有缓存 |
| **能发请求/操作DOM** | ✅ 可以 | ❌ 不应该 |

```js
// ✅ computed：适合数据派生
const fullName = computed(() => firstName.value + ' ' + lastName.value)

// ✅ watch：适合做副作用
watch(count, (val) => {
  console.log('count 变了')     // 可以打日志
  // 也可以发请求、操作 DOM 等
})
```
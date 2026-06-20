## 组合式API-provide 和 inject

### 什么是 provide / inject

一种**跨层级传递数据**的方式——祖先组件用 `provide` 提供数据，后代组件用 `inject` 注入使用。

```
祖先组件（provide）  ──→  子组件  ──→  孙组件  ──→  曾孙组件（inject）
                                                         ↑
                                               中间层不用逐层传 props
```

> 解决了 **props 逐层传递（prop drilling）** 的痛点。

---

### 作用

| | props | provide / inject |
|---|-------|-----------------|
| **传递方向** | 父 → 子（一层） | 祖先 → 任意后代（跨多层） |
| **中间层** | 必须逐层传递 | 中间层无需关心 |
| **适用场景** | 父子直接传参 | 深层嵌套组件共享数据 |

---

### 用法

#### 1. 基本用法

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)

// 提供数据
provide('count', count)
</script>
```

```vue
<!-- 孙组件（中间层不用管） -->
<script setup>
import { inject } from 'vue'

// 注入数据
const count = inject('count')

console.log(count.value)  // 0
</script>
```

#### 2. 传递响应式数据

```vue
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)

// 传 ref 对象，后代修改 count 祖先也能感知
provide('count', count)
</script>
```

```vue
<script setup>
import { inject } from 'vue'

const count = inject('count')

function add() {
  count.value++   // ✅ 修改祖先的数据，所有用到的地方都会更新
}
</script>
```

> **建议传递 ref / reactive**，不要传普通值，否则后代无法响应祖先的变化。

#### 3. 传递修改方法（推荐做法）

把 **修改数据的方法** 也传下去，让后代按规范修改，而不是直接改数据：

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// 传数据和修改方法
provide('count', count)
provide('increment', increment)
</script>
```

```vue
<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const count = inject('count')
const increment = inject('increment')
</script>

<template>
  <p>{{ count }}</p>
  <button @click="increment">+1</button>
</template>
```

#### 4. 默认值

```js
// 如果找不到 'theme' 这个 key，就用 'light' 作为默认值
const theme = inject('theme', 'light')
```

#### 5. inject 的 key 用 Symbol （推荐）

避免 key 名冲突：

```js
// 在一个共享文件中定义
// keys.js
export const COUNT_KEY = Symbol('count')
export const USER_KEY = Symbol('user')
```

```vue
<script setup>
import { provide } from 'vue'
import { COUNT_KEY } from './keys'

const count = ref(0)
provide(COUNT_KEY, count)
</script>
```

```vue
<script setup>
import { inject } from 'vue'
import { COUNT_KEY } from './keys'

const count = inject(COUNT_KEY)
</script>
```

---

### 完整示例

```vue
<!-- App.vue（祖先） -->
<script setup>
import { provide, ref } from 'vue'
import Child from './Child.vue'

const user = ref({ name: 'Alice', age: 20 })

function updateName(newName) {
  user.value.name = newName
}

provide('user', user)
provide('updateName', updateName)
</script>

<template>
  <Child />
</template>
```

```vue
<!-- Child.vue（中间层，啥也不用做） -->
<script setup>
import Grandchild from './Grandchild.vue'
</script>

<template>
  <Grandchild />
</template>
```

```vue
<!-- Grandchild.vue（后代，直接注入使用） -->
<script setup>
import { inject } from 'vue'

const user = inject('user')
const updateName = inject('updateName')
</script>

<template>
  <p>姓名：{{ user.name }}</p>
  <p>年龄：{{ user.age }}</p>
  <button @click="updateName('Bob')">改名为 Bob</button>
</template>
```

---

### 注意事项

1. **尽量传 ref / reactive** — 传普通值的话，后代只能读到初始值，不会响应更新
2. **最好把修改方法也传下去** — 后代调用方法修改，而不是直接改数据，数据流向更清晰
3. **避免滥用** — 不是所有跨层级通信都用 provide/inject。能传 props 的层级就传 props，provide/inject 适合**深层嵌套且多个后代都需要**的场景
4. **key 建议用 Symbol** — 避免字符串 key 冲突

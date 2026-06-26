import './assets/main.css'


import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { lazyplugin } from './directives'
import App from './App.vue'
import router from './router'

// 引入初始化的样式文件
import '@/styles/common.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(lazyplugin)

// 挂载操作
app.mount('#app')

//定义全局指令
// app.directive('img-lazy',{
//     mounted(el,binding){
//         // el：代表指令绑定的元素
//         // binding:代表指令对象 最常用的是binding.value 指令等于后面绑定的表达式的值
//         console.log();
//         useIntersectionObserver(
//             el,
//             ([{isIntersecting}]) =>{
//                 console.log(isIntersecting);
//                 if(isIntersecting){
//                     //进入视口区域
//                     el.src = binding.value
//                 }
//             },
//         )
//     }
// })
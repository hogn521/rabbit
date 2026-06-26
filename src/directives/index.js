//定义懒加载插件
import { useIntersectionObserver } from '@vueuse/core'
export const lazyplugin = {
    install(app){
        //懒加载指令逻辑
        app.directive('img-lazy',{
            mounted(el,binding){
                // el：代表指令绑定的元素
                // binding:代表指令对象 最常用的是binding.value 指令等于后面绑定的表达式的值
                console.log();
                const {stop} =  useIntersectionObserver(
                    el,
                    ([{isIntersecting}]) =>{
                        console.log(isIntersecting);
                        if(isIntersecting){
                            //进入视口区域
                            el.src = binding.value
                            stop()
                        }
                    },
                )
            }
        })
    }
}
import httpInstance from '@/utils/http'

//获取banner 
export function getBannerApi(){
   return httpInstance({
        url: '/home/banner'
    })

}

export function findNewAPI () {
    return httpInstance({
        url: '/home/new'
    })
}

export function getHotAPI(){
    return httpInstance({
        url: '/home/hot'
    })
}
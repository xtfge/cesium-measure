/*
 * @Author: zhangbo
 * @E-mail: zhangb@geovis.com.cn
 * @Date: 2019-12-13 15:01:34
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-05 16:04:08
 * @Desc: 
 */
import "@/assets/css/iconfont.css";
import cesiumMeasure from './core/measurePanel'

// 为组件添加 install 方法，用于按需引入
cesiumMeasure.install = function (Vue) {

    Vue.component(cesiumMeasure.name, cesiumMeasure)

}

export default cesiumMeasure
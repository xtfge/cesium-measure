import cesiumMeasure from './core/measurePanel'

// 为组件添加 install 方法，用于按需引入
cesiumMeasure.install = function (Vue) {


    Vue.component(cesiumMeasure.name, cesiumMeasure)


}

export default cesiumMeasure
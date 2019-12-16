#### cesium-mearure
The project is a mearure tool for Cesium.

#### Install
`npm i cesium-measure`
#### Usage
1. import cesium-measure
```js
//main.js
import Vue from 'vue'
import cesiumMeasure from 'cesium-measure'
Vue.use(cesiumMeasure)
```
2.use it in your component
```js
//you-component
<template>
  <div>
    ...
    <cesiumMeasure ref="measure"></cesiumMeasure>
    ...
  </div>
</template>
<script>
    data(){return{}},
    mounted(){
        const viewer=new Cesium.Viewer('container')
        this.$refs.measure.init(viewer);
    }
</script>
```
#### Development
1. `npm install`
2. `npm start`
#### Build
- `npm run build`

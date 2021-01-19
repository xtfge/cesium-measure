<template>
  <div id="map">
    <measureViewer ref="measure" ></measureViewer>
    <!-- <cesiumMeasure ref="measure"></cesiumMeasure> -->
  </div>
</template>
<script>
import measureViewer from "../core/measurePanel";
export default {
  data() {
    return {
      viewer:''
    };
  },
  components: {
    measureViewer
  },
  mounted() {
    window.Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MWI5NTY0Mi1iOGE3LTQ3ZTMtOGQ4OC03NThiN2VkZGI4NTYiLCJpZCI6NzY2Niwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU1MDIyNTM5OX0.2Abc9p46PA9kJ3E-BaKMXiyb0rvgo7AFUR1nR78VF7c";
    const options = {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      shouldAnimate: false,
      infoBox: false,
      selectionIndicator: false,
      sceneModePicker: false,
      skyAtmosphere: false,
      contextOptions: {
        webgl: {
          preserveDrawingBuffer: true
        }
      }
    };
    const viewer = new window.Cesium.Viewer("map", options);
    viewer.imageryLayers.removeAll();
    const credits = document.getElementsByClassName("cesium-widget-credits");
    credits[0].parentElement.removeChild(credits[0]);
    window.cesiumViewer = viewer;
    this.viewer=viewer;
    this.$refs.measure.init(viewer);
    const model=viewer.entities.add({
      position:window.Cesium.Cartesian3.fromDegrees(106.5,28),
      model:{
        uri:'static/Cesium_Man.glb'
      }
    })
    viewer.flyTo(model)

  }
};
</script>
<style scoped>
#map {
  margin: 0px;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
}
</style>

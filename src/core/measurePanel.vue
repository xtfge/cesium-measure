<!--
 @Author:zhangbo
 @Date:2019-12-12
 @E-mail:zhangb@geovie.com.cn
 @Desc:量算工具面板
-->
<template>
  <div id="measurePanel" v-show="measurePanelShow">
    <el-header>
      地图量算
      <!-- <span class="clostbtn" @click="measurePanelShow=false"></span> -->
    </el-header>
    <el-main>
      <el-radio v-model="mode" label="distance">距离量算</el-radio>
      <el-radio v-model="mode" label="area">面积量算</el-radio>
      <el-radio v-model="mode" label="height">高度量算</el-radio>
      <img
        :src="controlImage"
        :title="curMeasureStatus"
        @click="toggleClick"
        style="margin-left: 20px;position: absolute;width:24px;cursor: pointer;"
      />
      <img
        :src="removeImage"
        title="一键删除"
        @click="removeAll"
        style="margin-left: 60px;position: absolute;width:24px;cursor: pointer;"
      />
    </el-main>
  </div>
</template>

<script>
import { PolylineGraphic, PolygonGraphic, HeightGraphic } from "./graphic";
const Cesium = window.Cesium;
const graphics = [];
export default {
  name: "cesiumMeasure",
  data() {
    return {
      mode: "distance",
      curMeasureStatus: "开始测量",
      controlImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABpklEQVRYR+2VsS5EQRSGv/81PMKi0ngEhdYiEhKFYmtRCavTKEWvELEvQNTIBokCjUIiGo2IRnlkNkPuDrs7c++Vu4Upb2bm++afc+aKiocq5vMvUGoCZtYERiStxF5taQIevunBs5KOYiRKEQjg85IOY+BuTmGBAN6WNBkLLywQwI+BKaAlqR4rkTuBAL4MtAF376MpErkEAvgVsC7pxMxqqRLJAgH8GpgA3oBpSWepEkkCAbwhac/MdoEG8ADUJd1kJB79t49eNREtEMBPgXNJ7uHBzLZdAh5277+563iX9NyvIKMEAvg+sOg33cpI1CR14CljoEAAX5W0Y2Yuche9G98SKeCvuX0FAvgl8AIsSXo1szWfhLv35JMPFAjgO/6RcT1+AcxJenLFVgTe8yUM4AeSFoL2ussWXJ7oeyYQwG+BMQ9rZSQKxZ4V/lEDGYENYByY8QsctCNRNPa+Ar6Hm5n2cu97l0SRyMO1A9vQC/2ZRJRARoKUX21MUtECMZvlmTN8AmZmeU4Su0ZS16F/a8NqBWJPUta84auBsk4Wu0/lCXwCe0a9IfDJPoUAAAAASUVORK5CYII=",
      removeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABG0lEQVRYR+2XvUoDQRRGz3kdW0FDQDCVja2vYIp0dr6BlZWNeQR7CytTCCZg7etcGYmwanZnsgaWyEy1w96fw3fv7NyVgZcD56cYICLegMNC4Fd1XGJbBBARR8CqJGDD5kR9yfmUAsyAO2CuTruCRsQ9cAlcqze7AngALoCpOs8ApOQJ4lE93xogIp6B05xjz/cLddL0/VWCwQG+6CIi0rNa1CdtiuTitAbPOZaWIBenAuyXAusTkhrz8yjl9mubzmbeSoGfDZXbV4CqQFXgXyqQZoXhPkSlN2DTrt6Ge63AEjgGJuqiZ/3TcJsad6WONsXoug1T8gSxizVSN/7YdA6cEXEA3AJnPSmegCv1vc3/TxNvT6hvboMDfACFKk0wxySHNgAAAABJRU5ErkJggg==",
      measurePanelShow: true,
      areaManager: null,
      distanceManager: null,
      heightManager: null,
      entities: [],
      positions: []
    };
  },
  props: {},
  computed: {},
  mounted() {
    const self = this;
    self.name = "";
    window.distanceManagers = [];
    window.areaManagers = [];
    window.heightManagers = [];
    // const viewer = window.viewer;
    //const scene=viewer.scene
  },
  methods: {
    createTip() {
      const tooltip = document.createElement("div");
      tooltip.id = "measure_tip";
      tooltip.className = "tip-class";
      tooltip.innerHTML = "单击添加节点，右击结束量算.";
      document.body.appendChild(tooltip);
      return tooltip;
    },
    updateTipText(text) {
      const tip = document.getElementById("measure_tip");
      if (!tip) {
        return;
      }
      tip.innerHTML = text;
    },
    tipVisible(status) {
      const tip = document.getElementById("measure_tip");
      if (!tip) {
        return;
      }
      if (status) {
        tip.style.display = "block";
      } else {
        tip.style.display = "none";
      }
    },
    init(viewer) {
      const self = this;
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      const tooltip=this.createTip();
      this.tipVisible(false);
      handler.setInputAction(e => {
        const pixel = e.position;
        const ray = viewer.camera.getPickRay(pixel);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // const cartesian = viewer.camera.pickEllipsoid(
        //   pixel,
        //   viewer.scene.globe.ellipsoid
        // );
        // const cartesian=viewer.scene.pickPosition(pixel)
        if (self.mode === "height") {
          this.updateTipText('请单击地图添加终点.')
          self.positions.pop()
          self.heightMeasureHandler(pixel);

          if (this.positions.length === 2) {
            
            this.stopDraw();
          }
          return;
        }
        if (cartesian) {
          self.positions.push(cartesian);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(e => {
        const pixel = e.endPosition;
        tooltip.style.left = pixel.x + 10 + 'px';
        tooltip.style.top = pixel.y + 10 + 'px';
        const ray = viewer.camera.getPickRay(pixel);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // const cartesian = viewer.camera.pickEllipsoid(
        //   pixel,
        //   viewer.scene.globe.ellipsoid
        // );
        //const cartesian=viewer.scene.pickPosition(pixel)
        if (!cartesian) {
          return;
        }
        // if (self.mode === "height") {
        //   return;
        // }
        if (self.positions.length > 1) {
          self.positions.pop();
        }
        if (self.positions.length > 0) {
          self.positions.push(cartesian);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(() => {
        //const pixel=e.position
        self.stopDraw();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    heightMeasureHandler(pixel) {
      const viewer = window.viewer;
      const position = viewer.scene.pickPosition(pixel);
      this.positions.push(position);
    },
    stopDraw() {
      if(window.graphicManager===undefined){
        return
      }
      window.graphicManager.stopEdit();
      graphics.push(window.graphicManager.entity);
      window.graphicManager.destory();
      this.tipVisible(false);
      this.positions = [];
      this.curMeasureStatus = "开始测量";
      window.graphicManager = null;
    },
    removeAll() {
      const viewer = window.viewer;
      for (let e of graphics) {
        viewer.entities.remove(e);
      }
    },
    toggleClick() {
      const viewer = window.viewer;
      if (window.graphicManager) {
        this.stopDraw();
        return;
      }
      this.tipVisible(true);
      this.curMeasureStatus = "结束测量";

      switch (this.mode) {
        case "distance":
          window.graphicManager = new PolylineGraphic(viewer, {
            positions: this.positions,
            material: Cesium.Color.RED,
            width: 3,
            clampToGround: true
          });
          this.updateTipText("单击添加节点，右击结束量算.");
          break;
        case "area":
          window.graphicManager = new PolygonGraphic(viewer, {
            hierarchy: this.positions,
            material: Cesium.Color.RED,
            width: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          });
          this.updateTipText("单击添加节点，右击结束量算.");
          break;
        case "height":
          window.graphicManager = new HeightGraphic(viewer, {
            positions: this.positions,
            material: Cesium.Color.RED,
            width: 3
          });
          this.updateTipText("请单击地图确定起点.");
          break;
      }
    }
  },
  watch: {}
};
</script>

<style scoped>
#measurePanel {
  position: fixed;
  width: 400px;
  height: 85px;
  color: #fff;
  right: 7px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #01c5fd;
  box-shadow: 0 0 5px rgba(1, 197, 253, 0.75);
  z-index: 10;
}

.clostbtn {
  font-family: element-icons !important;
  float: right;
  margin-right: -10px;
}

.clostbtn:after {
  content: "\E6DB";
}

.el-header {
  height: 40% !important;
}

.el-main {
  height: 60% !important;
  padding: 5px 0px 0px 20px;
  line-height: 60%;
  vertical-align: middle;
}

.el-main img {
  display: inline-block;
}

.el-main .el-radio {
  display: inline-block;
  margin: 5px;
}
</style>
<style>
#measurePanel .el-radio {
  color: #fff;
}
.tip-class {
  position: fixed;
  border: 1px #b6aeae solid;
  width: 250px;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  background-color: #b6aeae;
  color: #fff;
  border-radius: 6px 6px 6px 0px;
  pointer-events: none;
}
</style>



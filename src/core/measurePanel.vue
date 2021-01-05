<!--
 @Author:zhangbo
 @Date:2019-12-12
 @E-mail:zhangb@geovie.com.cn
 @Desc:量算工具面板
-->
<template>
  <div id="measurePanel" v-show="measurePanelShow">
    <el-container>
      <el-header>
        <span>地图量算</span>
        <span class="closebtn iconfont icon-guanbi" @click="measurePanelShow=false"></span>
        <!-- <span class="clostbtn" @click="measurePanelShow=false"></span> -->
      </el-header>
      <el-main class="graphic-draw-main">
        <ul>
          <li>
            <i
              class="iconfont icon-ceju icon-class"
              title="距离测量"
              :class="{'selected-graphic':menuSelected['distance']}"
              @click="toggleClick('distance')"
            ></i>
            <span
              @click="toggleClick('distance')"
              :class="{'selected-graphic':menuSelected['area']}"
            >距离</span>
          </li>
          <li>
            <i
              class="iconfont icon-cemian icon-class"
              title="面积测量"
              :class="{'selected-graphic':menuSelected['area']}"
               @click="toggleClick('area')"
            ></i>
            <span
              @click="toggleClick('area')"
              :class="{'selected-graphic':menuSelected['area']}"
            >面积</span>
          </li>
          <li>
            <i
              class="iconfont icon-cegao icon-class"
              title="添加多边形"
              :class="{'selected-graphic':menuSelected['height']}"
             @click="toggleClick('height')"
            ></i>
            <span
              :class="{'selected-graphic':menuSelected['height']}"
             @click="toggleClick('height')"
            >高度</span>
          </li>
          <li>
            <i
              class="iconfont icon-shanchu icon-class"
              title="清除全部"
              @click="removeAll"
            ></i>
            <span
              @click="removeAll"
            >清除</span>
          </li>
  
        </ul>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { PolylineGraphic, PolygonGraphic, HeightGraphic } from "./graphic";
const Cesium = window.Cesium;
const graphics = [];
const measureManager=[]
let viewer=undefined
export default {
  name: "cesiumMeasure",
  data() {
    return {
      mode: "distance",
      curMeasureStatus: "开始测量",
      controlImage:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABpklEQVRYR+2VsS5EQRSGv/81PMKi0ngEhdYiEhKFYmtRCavTKEWvELEvQNTIBokCjUIiGo2IRnlkNkPuDrs7c++Vu4Upb2bm++afc+aKiocq5vMvUGoCZtYERiStxF5taQIevunBs5KOYiRKEQjg85IOY+BuTmGBAN6WNBkLLywQwI+BKaAlqR4rkTuBAL4MtAF376MpErkEAvgVsC7pxMxqqRLJAgH8GpgA3oBpSWepEkkCAbwhac/MdoEG8ADUJd1kJB79t49eNREtEMBPgXNJ7uHBzLZdAh5277+563iX9NyvIKMEAvg+sOg33cpI1CR14CljoEAAX5W0Y2Yuche9G98SKeCvuX0FAvgl8AIsSXo1szWfhLv35JMPFAjgO/6RcT1+AcxJenLFVgTe8yUM4AeSFoL2ussWXJ7oeyYQwG+BMQ9rZSQKxZ4V/lEDGYENYByY8QsctCNRNPa+Ar6Hm5n2cu97l0SRyMO1A9vQC/2ZRJRARoKUX21MUtECMZvlmTN8AmZmeU4Su0ZS16F/a8NqBWJPUta84auBsk4Wu0/lCXwCe0a9IfDJPoUAAAAASUVORK5CYII=",
      removeImage:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABG0lEQVRYR+2XvUoDQRRGz3kdW0FDQDCVja2vYIp0dr6BlZWNeQR7CytTCCZg7etcGYmwanZnsgaWyEy1w96fw3fv7NyVgZcD56cYICLegMNC4Fd1XGJbBBARR8CqJGDD5kR9yfmUAsyAO2CuTruCRsQ9cAlcqze7AngALoCpOs8ApOQJ4lE93xogIp6B05xjz/cLddL0/VWCwQG+6CIi0rNa1CdtiuTitAbPOZaWIBenAuyXAusTkhrz8yjl9mubzmbeSoGfDZXbV4CqQFXgXyqQZoXhPkSlN2DTrt6Ge63AEjgGJuqiZ/3TcJsad6WONsXoug1T8gSxizVSN/7YdA6cEXEA3AJnPSmegCv1vc3/TxNvT6hvboMDfACFKk0wxySHNgAAAABJRU5ErkJggg==",
      measurePanelShow: true,
      areaManager: null,
      distanceManager: null,
      heightManager: null,
      entities: [],
      positions: [],
      menuSelected:{}
    };
  },
  props: {
    viewer:null
  },
  computed: {},
  mounted() {
    const self = this;
    self.name = "";
    window.distanceManagers = [];
    window.areaManagers = [];
    window.heightManagers = [];
    if(this.viewer){
      this.init(this.viewer);
    }
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
    init(cesiumViewer) {
      const self = this;
      viewer=cesiumViewer;
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      const tooltip = this.createTip();
      this.tipVisible(false);
      handler.setInputAction(e => {
        if (!Cesium.defined(window.graphicManager)) {
          return;
        }
        const pixel = e.position;
        const ray = viewer.camera.getPickRay(pixel);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (self.mode === "height") {
          this.updateTipText("请单击地图添加终点.");
          window.graphicManager.popNode();
          self.heightMeasureHandler(pixel);

          if (window.graphicManager.positions.length === 2) {
            this.stopDraw();
          }
          return;
        }
        if (cartesian) {
          window.graphicManager.pushNode(cartesian);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(e => {
        if (!Cesium.defined(window.graphicManager)) {
          return;
        }
        const pixel = e.endPosition;
        tooltip.style.left = pixel.x + 10 + "px";
        tooltip.style.top = pixel.y + 10 + "px";
        const ray = viewer.camera.getPickRay(pixel);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) {
          return;
        }
        // if (self.mode === "height") {
        //   return;
        // }
        if (window.graphicManager.positions.length > 1) {
          window.graphicManager.popNode();
        }
        if (window.graphicManager.positions.length > 0) {
          window.graphicManager.pushNode(cartesian);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(() => {
        //const pixel=e.position
        self.stopDraw();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    heightMeasureHandler(pixel) {
      if (!Cesium.defined(window.graphicManager)) {
        return;
      }
      const position = viewer.scene.pickPosition(pixel);
      window.graphicManager.pushNode(position);
    },
    stopDraw() {
      if (window.graphicManager === undefined) {
        return;
      }
      window.graphicManager.stopEdit();
      graphics.push(window.graphicManager.entity);
      // window.graphicManager.destory();
      this.tipVisible(false);
      this.positions = [];
      this.curMeasureStatus = "开始测量";
      measureManager.push(window.graphicManager)
      window.graphicManager = null;
    },
    removeAll() {
      for(let m of measureManager){
        m.remove()
        m.destroy()
      }
      measureManager.splice(0)
    },
    toggleClick(mode) {
      this.mode=mode
      if (window.graphicManager) {
        this.stopDraw();
        return;
      }
      this.tipVisible(true);
      this.curMeasureStatus = "结束测量";
      const color = Cesium.Color.fromCssColorString("rgba(247,224,32,1)");

      switch (mode) {
        case "distance":
          window.graphicManager = new PolylineGraphic(viewer, {
            positions: this.positions,
            material: color,
            width: 3,
            clampToGround: true
          });
          this.updateTipText("左键测量，右键结束.");
          break;
        case "area":
          window.graphicManager = new PolygonGraphic(viewer, {
            hierarchy: this.positions,
            material: color,
            width: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          });
          this.updateTipText("左键测量，右键结束");
          break;
        case "height":
          window.graphicManager = new HeightGraphic(viewer, {
            positions: this.positions,
            material: color,
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

<style lang='scss' scoped>
#measurePanel {
  position: absolute;
  background: rgba(23, 30, 38, 1);
  border-radius: 4px;
  z-index: 2;
  right: 10px;
  top: 10px;
  color: $color;
}
.icon-class {
  margin: $item-margin;
}
.el-header {
  height: $title-height !important;
  line-height: $title-height !important;
  border-bottom: 1px solid $border-color;
  padding: $padding;
  span {
    margin: $item-margin;
  }
}
.graphic-draw-main {
  height: 52px;
  padding: $padding;
  background-color: $bg-color;
  color:$color;
  // line-height: 60%;
  vertical-align: middle;
  color: $color;
  border-bottom: 1px solid $border-color;
  ul {
    cursor: default;
    padding: 0;
    overflow: hidden;
    // border-bottom: 1px solid $border-color;
    height: 48px;
    margin: 0;
    // margin-top: 0 0 5px 0;
    li {
      cursor: pointer;
      float: left;
      padding: 0 0 0;
      width: 65px;
      height: 100%;
      box-sizing: border-box;
      list-style: none;
      &:hover {
        i{
          color:#FFFFFF;
        }
        span{
          color:#FFFFFF;
        }
      }
      i {
        display: block;
        height: 16px;
        width: 16px;
        background-size: contain;
        // vertical-align: middle;
        margin: 0 auto;
        margin-top: 8px;
      }
      span {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        display: block;
        text-align: center;
        vertical-align: middle;
        font-size: 12px;
        color: $color;
        line-height: 22px;
      }
    }
  }
}
@import "~@/assets/css/iconfont.css";
</style>
<style>
.tip-class {
  position: fixed;
  border: 1px #b6aeae solid;
  width: 250px;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  background-color: #00000088;
  color: #fff;
  border-radius: 6px 6px 6px 0px;
  pointer-events: none;
}
</style>



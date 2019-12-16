/**
 * @Author:zhangbo
 * @Date:2019-12-12
 * @E-mail:zhangb@geovie.com.cn
 * @Desc:基本图形类
 */
const Cesium = window.Cesium
const radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad) 
const degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度
const PolylineGraphic = (function () {
    function _(viewer, options = {}) {
        this.viewer = viewer
        this.options = {
            polyline: options
        }
        this.positions = options.positions || [];
        this.entity = this._init();
        this.distance = this.getDistance
        this.idDestroyed=false
    }
    _.prototype._init = function () {
        const _self = this;
        const _update = function () {
            return _self.positions;
        };
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
        const entity = this.viewer.entities.add(this.options);
        return entity
    }
    _.prototype.remove = function () {
        this.viewer.entities.remove(this.entity)
    }
    _.prototype.destory=function(){
        this.options={}
        this.positions=[]
        this.entity=undefined
        this.viewer=undefined
        this.idDestroyed=true
    }
    _.prototype.stopEdit = function () {
        this.options.label = this.createLabel()
        this.options.polyline.positions=this.positions
        this.options.position=this.positions[this.positions.length-1]
        this.remove()
        this.entity=this.viewer.entities.add(this.options)
    }
    _.prototype.createLabel = function () {
        const length=this.getDistance()>10*1000?
        '长'+(this.getDistance()/1000).toFixed(2)+'km':
        this.getDistance().toFixed(2)+'m'
        const label = {
            text: length,
            font: '18px sans-serif',
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20, -20),
            heightReference: Cesium.HeightReference.NONE
        }
        return label
    }
    _.prototype.getDistance = function () {
        let distance = 0;
        const positions = this.positions
        for (let i = 0; i < positions.length - 1; i++) {

            let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            /**根据经纬度计算出距离**/
            let geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            let s = geodesic.surfaceDistance;
            //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = distance + s;
        }
        return distance;
    }
    return _
})();
const HeightGraphic=(function(){
    function _(viewer,options){
        this.viewer = viewer
        this.options = {
            polyline: options
        }
        this.positions = options.positions || [];
        this.entity = this._init();
        this.idDestroyed=false
        this._depthTestAgainstTerrain=this.viewer.scene.globe.depthTestAgainstTerrain
    }
    _.prototype._init = function () {
        this.viewer.scene.globe.depthTestAgainstTerrain=true
        const _self = this;
        const _update = function () {
            return _self.positions;
        };
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
        const entity = this.viewer.entities.add(this.options);
        return entity
    }
    _.prototype.remove = function () {
        this.viewer.entities.remove(this.entity)
        if(this.tmpPolyline){
            this.viewer.entities.remove(this.tmpPolyline)
        }
    }
    _.prototype.destory=function(){
        this.options={}
        this.positions=[]
        this.entity=undefined
        this.viewer=undefined
        this.idDestroyed=true
        this.tmpPolyline=undefined
    }
    _.prototype.stopEdit=function(){
        this.viewer.scene.globe.depthTestAgainstTerrain=this._depthTestAgainstTerrain
        this.options.label = this.createLabel()
        this.options.polyline.positions=this.positions
        this.options.position=this.positions[this.positions.length-1]
        this.remove()
        this.tmpPolyline=this.createAssitGraphic()        
        this.entity=this.viewer.entities.add(this.options)
    }
    /**
     * 创建辅助线
     */
    _.prototype.createAssitGraphic=function(){
        if(this.positions.length!==2){
            return
        }
        const startC=Cesium.Cartographic.fromCartesian(this.positions[0])
        const endC=Cesium.Cartographic.fromCartesian(this.positions[1])
        const tmp=Cesium.Cartesian3.fromRadians(
            endC.longitude,
            endC.latitude,
            startC.height
        )
        const pts=[this.positions[0],tmp,this.positions[1]]
        return this.viewer.entities.add({
            polyline:{
                positions:pts,
                material:new Cesium.PolylineDashMaterialProperty({color:Cesium.Color.RED}),
                width:3
            }
        })

    }
    _.prototype.createLabel = function () {
        const label = {
            text: '高'+this.getHeight()+'m',
            font: '18px sans-serif',
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20, -20),
            heightReference: Cesium.HeightReference.NONE
        }
        return label
    }
    _.prototype.getHeight=function(){
        if(this.positions.length!==2){
            return 'Nan'
        }
        const startC=Cesium.Cartographic.fromCartesian(this.positions[0])
        const endC=Cesium.Cartographic.fromCartesian(this.positions[1])
        if(startC&&endC){
            return (endC.height-startC.height).toFixed(2)
        }else{
            return 'NaN'
        }
    }
    return _
})()
const PolygonGraphic = (function () {
    function _(viewer, options = {}) {
        this.viewer = viewer
        this.options = {
            polygon: options
        }
        this.positions = options.hierarchy || [];
        this.entity = this._init();
        this.area = this.getArea()
        this.idDestroyed=false
    }
    _.prototype._init = function () {
        const _self = this;
        const _update = function () {
            return new Cesium.PolygonHierarchy(_self.positions);
        };
        //实时更新polyline.positions
        this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
        const entity = this.viewer.entities.add(this.options);
        return entity
    }
    _.prototype.remove = function () {
        this.viewer.entities.remove(this.entity)
    }
    _.prototype.destory=function(){
        this.options={}
        this.positions=[]
        this.entity=undefined
        this.viewer=undefined
        this.idDestroyed=true
    }
    _.prototype.stopEdit = function () {
        this.options.label = this.createLabel()
        this.options.polygon.hierarchy=new Cesium.PolygonHierarchy(this.positions)
        this.options.position=this.positions[this.positions.length-1]
        this.remove()
        this.entity=this.viewer.entities.add(this.options)
    }

    _.prototype.createLabel = function () {
        const area=this.getArea()<0.1?
        (this.getArea()*1000*1000).toFixed(2)+'m²':
        this.getArea().toFixed(2)+'km²'
        const label = {
            text: area,
            font: '18px sans-serif',
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20, -20),
            heightReference: Cesium.HeightReference.NONE
        }
        return label
    }
    _.prototype.getDistance = function () {
        let distance = 0;
        const positions = this.positions
        for (let i = 0; i < positions.length - 1; i++) {

            let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            /**根据经纬度计算出距离**/
            let geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            let s = geodesic.surfaceDistance;
            //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = distance + s;
        }
        return distance.toFixed(2);
    }
    //计算多边形面积
    function getArea() {
        const positions=this.positions
        const points = this.positions.map(_=>{
            const cartographic=Cesium.Cartographic.fromCartesian(_);
            return{
                lon:Cesium.Math.toDegrees(cartographic.longitude),
                lat:Cesium.Math.toDegrees(cartographic.latitude),
                height:cartographic.height
            }
        })

        let res = 0;
        //拆分三角曲面

        for (let i = 0; i < points.length - 2; i++) {
            let j = (i + 1) % points.length;
            let k = (i + 2) % points.length;
            let totalAngle = Angle(points[i], points[j], points[k]);


            let dis_temp1 = distance(positions[i], positions[j]);
            let dis_temp2 = distance(positions[j], positions[k]);
            // let dis_temp1 = distance(points[i], points[j]);
            // let dis_temp2 = distance(points[j], points[k]);
            res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
        }


        return res/1000/1000
    }
    function distance(point1, point2) {
        let point1cartographic = Cesium.Cartographic.fromCartesian(point1);
        let point2cartographic = Cesium.Cartographic.fromCartesian(point2);
        /**根据经纬度计算出距离**/
        let geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        let s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
        return s;
    }

    /*角度*/
    function Angle(p1, p2, p3) {
        let bearing21 = Bearing(p2, p1);
        let bearing23 = Bearing(p2, p3);
        let angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    /*方向*/
    function Bearing(from, to) {
        let lat1 = from.lat * radiansPerDegree;
        let lon1 = from.lon * radiansPerDegree;
        let lat2 = to.lat * radiansPerDegree;
        let lon2 = to.lon * radiansPerDegree;
        let angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian;//角度
        return angle;
    }
    _.prototype.getArea = getArea
    return _
})();
export { PolylineGraphic, PolygonGraphic,HeightGraphic }
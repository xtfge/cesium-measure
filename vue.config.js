/*
 * @Author: zhangbo
 * @E-mail: zhangb@geovis.com.cn
 * @Date: 2019-12-13 15:04:57
 * @LastEditors: zhangbo
 * @LastEditTime: 2019-12-26 19:08:13
 * @Desc: 
 */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./node_modules/cesium/Build/Cesium",
            to: "Cesium",
          },
        ],
      }),
    ],
  },
  publicPath: process.env.NODE_ENV==='development'? './':'../dist',
  assetsDir: 'static',
  lintOnSave: true,
  // 强制内联CSS
  productionSourceMap: false,
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/css/global.scss";
        `
      }
    },
    // 启用 CSS modules
    requireModuleExtension: false,
    // 是否使用css分离插件
    extract: false,
    // 开启 CSS source maps，一般不建议开启
    sourceMap: false
    // css预设器配置项

  },
  devServer: {
    host: '0.0.0.0',
    hot: true,
    disableHostCheck: true,
  },
  chainWebpack: (config) => {
    config.module
      .rule('fonts')
      .use('url-loader')
        .loader('url-loader')
        .tap(options => {
          // 修改它的选项...
          options.limit=100000
          options.name='static/fonts/[name].[ext]'
          return options
        })
    config.resolve.alias
      .set('@', resolve('src'))
  }
};
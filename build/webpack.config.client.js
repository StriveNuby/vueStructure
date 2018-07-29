const path = require('path')
const webpack = require('webpack')
// webpack-merge配置合并 区分开发环境以及生产环境 与公用配置
const merge = require('webpack-merge')
const VueClientPlugin = require('vue-server-renderer/client-plugin')

const baseConfig = require('./webpack.config.base')
const proConfig = require('../config')
const { HOST, POST, PROXY } = proConfig.devServer
const isProd = process.env.NODE_ENV === 'production'
const resolve = file => path.resolve(__dirname, file)
let config

const defaultPluins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: isProd ? '"production"' : '"development"'
    }
  }),
  new VueClientPlugin()
]

if (isProd) {
  config = merge(baseConfig, {
    mode: 'production',
    entry: {
      app: resolve('../client/entry-client.js'),
      vendor: ['vue']
    },
    output: {
      filename: '[name].[chunkhash:8].js',
      publicPath: '/public/'
    },
    plugins: defaultPluins
  })
} else {
  const devServer = {
    port: POST,
    host: HOST,
    noInfo: true,
    overlay: {
      errors: true
    },
    // 允许跨域
    headers: { 'Access-Control-Allow-Origin': '*' },
    // 处理未搭建服务器端出现的路由映射问题
    historyApiFallback: {
      index: '/public/index.html'
    },
    proxy: PROXY,
    hot: true
  }
  config = merge(baseConfig, {
    mode: 'development',
    devtool: '#cheap-module-eval-source-map',
    devServer,
    plugins: defaultPluins.concat([
      // 热替换模块
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NodeEnvironmentPlugin()
    ])
  })
}

module.exports = config

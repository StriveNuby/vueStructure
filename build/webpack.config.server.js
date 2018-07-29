const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const VueServerPlugin = require('vue-server-renderer/server-plugin')

const isProd = process.env.NODE_ENV === 'production'
const resolve = file => path.resolve(__dirname, file)

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VUE_ENV': 'server',
  })
]

if (!isProd) {
  plugins.push(new VueServerPlugin())
}

const config = merge(baseConfig, {
  // 告知 webpack 为目标(target)指定一个环境 默认web
  target: 'node',
  devtool: 'source-map',
  // 起点或是应用程序的起点入口。从这个起点开始，应用程序启动执行。如果传递一个数组，那么数组的每一项都会执行
  entry: resolve('../client/entry-server.js'),
  // 位于对象最顶级键(key)，包括了一组选项，指示 webpack 如何去输出、以及在哪里输出你的「bundle、asset 和其他你所打包或使用 webpack 载入的任何内容」
  output: {
    libraryTarget: 'commonjs2',
    filename: 'entry-server.js',
    path: resolve('../server-build')
  },
  externals: Object.keys(require('../package.json').dependencies),
  // 决定了如何处理项目中的不同类型的模块
  plugins
})

module.exports = config

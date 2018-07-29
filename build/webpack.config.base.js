const path = require('path')
const proConfig = require('../config')
const resolve = file => path.resolve(__dirname, file)
const { HOST, POST } = proConfig.devServer

const config = {
  // 告知 webpack 为目标(target)指定一个环境 默认web
  target: 'web',
  // 提供 mode 配置选项，告知 webpack 使用相应模式的内置优化
  mode: process.env.NODE_ENV || 'development',
  // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
  // 起点或是应用程序的起点入口。从这个起点开始，应用程序启动执行。如果传递一个数组，那么数组的每一项都会执行
  entry: resolve('../client/entry-client.js'),
  // 位于对象最顶级键(key)，包括了一组选项，指示 webpack 如何去输出、以及在哪里输出你的「bundle、asset 和其他你所打包或使用 webpack 载入的任何内容」
  output: {
    // 此选项决定了每个输出 bundle 的名称
    filename: 'bundle.[hash:8].js',
    // output 目录对应一个绝对路径
    path: resolve('../public'),
    publicPath: `http://${HOST}:${POST}/public/`
  },
  // 决定了如何处理项目中的不同类型的模块
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}

module.exports = config

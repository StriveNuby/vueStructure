const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const resolve = file => path.resolve(__dirname, file)

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: '#cheap-module-source-map',
  output: {
    path: resolve('../dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

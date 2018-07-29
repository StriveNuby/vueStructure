module.exports = {
  app: {
    POST: process.env.PORT || 4000,
    HOST: process.env.HOST || '127.0.0.1'
  },
  devServer: {
    POST: 8000,
    HOST: '127.0.0.1',
    PROXY: {}
  }
}

const Koa = require('koa')
const path = require('path')
const Router = require('koa-router')
const Logger = require('koa-logger')
const Static = require('koa-static')
const Favicon = require('koa-favicon')
const Onerror = require('koa-onerror')
const proConfig = require('../config')
const middleware = require('./middleware')
const BodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()
const isProd = process.env.NODE_ENV === 'production'
const resolve = file => path.resolve(__dirname, file)
const { POST, HOST } = proConfig.app

/**
 * 中间件 middleware
 */
Onerror(app)
app.use(Logger())
app.use(BodyParser())
app.use(middleware.serverErrorHandler)
app.use(middleware.setResponseTime)

/**
 * 开发环境 服务器渲染(热更新)
 */
if (!isProd) {
  const { devMiddleware, hotMiddleware } = require('./middleware/webpackMiddleware')
  app.use(devMiddleware)
  app.use(hotMiddleware)
  app.use(Static(resolve('../')))
  app.use(Static(resolve('../dist')))
  app.use(Favicon(resolve('../favicon.ico')))
}

// vue-server-renderer
router.get('*', middleware.serverRender())

app.use(router.routes()).use(router.allowedMethods())

app.listen(POST, HOST, () => {
  console.log(`server is listening on ${HOST}:${POST}`)
})

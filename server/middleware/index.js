
const serverRender = require('./render')
const isProd = process.env.NODE_ENV === 'production'

// 505 server error
const serverErrorHandler = async (ctx, next) => {
  try {
    ctx.error = (code, message) => {
      if (typeof code === 'string') {
        message = code
        code = 500
      }
      ctx.throw(code || 500, message || 'server error')
    }
    await next()
  } catch (err) {
    ctx.status = 500
    if (isProd) {
      ctx.body = 'server error'
    } else {
      ctx.body = err.message
    }
  }
}

// x-response-time
const setResponseTime = async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
}

module.exports = {
  serverErrorHandler,
  setResponseTime,
  serverRender
}

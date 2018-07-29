const path = require('path')
const MFS = require('memory-fs')
const webpack = require('webpack')
const { PassThrough } = require('stream')
const { createRenderer } = require('./serverRender')
const serverBundleFileName = 'vue-ssr-server-bundle.json'
const clientManifestFileName = 'vue-ssr-client-manifest.json'
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackDevMiddleware = require('webpack-dev-middleware')
const clientConfig = require('../../build/webpack.client.config')
const serverConfig = require('../../build/webpack.server.config')

const mfs = new MFS()
let expressDevMiddleware
let serverBundleComplete = false
const serverBundleFilePath = path.join(serverConfig.output.path, serverBundleFileName)
const clientManifestFilePath = path.join(clientConfig.output.path, clientManifestFileName)

const updateRenderer = () => {
  if (!serverBundleComplete) return;
  try {
    const options = {
      clientManifest: JSON.parse(expressDevMiddleware.fileSystem.readFileSync(clientManifestFilePath, 'utf-8'))
    }
    createRenderer(JSON.parse(mfs.readFileSync(serverBundleFilePath, 'utf-8')), options)
  } catch (e) {
    createRenderer(JSON.parse(mfs.readFileSync(serverBundleFilePath, 'utf-8')))
  }
}

const koaWebpackDevMiddleware = (compiler, opts) => {
  expressDevMiddleware = webpackDevMiddleware(compiler, opts)
  return async (ctx, next) => {
    await new Promise(resolve =>
      expressDevMiddleware(ctx.req, {
        end: (content) => {
          ctx.body = content
          resolve()
        },
        setHeader: ctx.set.bind(ctx)
      }, () => resolve(next()))
    )
  }
}

const koaWebpackHotMiddleware = (compiler, opts) => {
  const expressMiddleware = webpackHotMiddleware(compiler, opts)
  return async (ctx, next) => {
    let stream = new PassThrough()
    ctx.body = stream
    await expressMiddleware(ctx.req, {
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        ctx.state = state
        ctx.set(headers)
      }
    }, next)
  }
}

const serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = mfs
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  stats = stats.toJson()
  stats.errors.forEach(err => console.error(err))
  stats.warnings.forEach(err => console.warn(err))
  if (!serverBundleComplete) serverBundleComplete = true
  setImmediate(updateRenderer)
})

const clientCompiler = webpack(clientConfig)
const devMiddleware = koaWebpackDevMiddleware(clientCompiler, {
  noInfo: false,
  stats: {
    colors: true,
    cached: false
  },
  contentBase: clientConfig.output.path,
  publicPath: clientConfig.output.publicPath
})

clientCompiler.plugin('done', updateRenderer)
const hotMiddleware = koaWebpackHotMiddleware(clientCompiler, {})

module.exports = { devMiddleware, hotMiddleware }

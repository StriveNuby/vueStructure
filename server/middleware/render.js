const ejs = require('ejs')
const path = require('path')
const axios = require('axios')
const MemoryFS = require('memory-fs')
const webpack = require('webpack')
const VueServerRenderer = require('vue-server-renderer')
const serverConfig = require('../../build/webpack.config.server')
const proConfig = require('../../config')
const { HOST, POST } = proConfig.devServer
const isProd = process.env.NODE_ENV === 'production'
const serverCompiler = webpack(serverConfig)
const mfs = new MemoryFS()
serverCompiler.outputFileSystem = mfs

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <%- title %>
  <%- style %>
</head>
<body>
  <div id="app">
    <%- appString %>
  </div>
  <%- initalState %>
  <%- scripts %>
</body>
</html>
`

const serverRender = async (ctx, renderer, template, bundle) => {
  ctx.headers['Content-Type'] = 'text/html'
  const context = { url: ctx.path }
  let appString = null
  try {
    if (isProd) {
      const app = await bundle(context)
      appString = await renderer.renderToString(app, context)
    } else {
      appString = await renderer.renderToString(context)
    }

    const { title } = context.meta.inject()
    const html = ejs.render(template, {
      appString,
      style: context.renderStyles(),
      scripts: context.renderScripts(),
      title: title.text(),
      initalState: context.renderState()
    })
    ctx.body = html
  } catch (err) {
    console.log(`render error`, err)
    throw err
  }
}

const devSsr = () => {
  let bundle
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.log(err))
    stats.warnings.forEach(err => console.warn(err))

    const bundlePath = path.join(
      serverConfig.output.path,
      'vue-ssr-server-bundle.json'
    )

    bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  })

  return async (ctx, next) => {
    if (!bundle) return ctx.body = 'wait...'

    const clientManifestResp = await axios.get(
      `http://${HOST}:${POST}/public/vue-ssr-client-manifest.json`
    )

    const clientManifest = clientManifestResp.data

    const renderer = VueServerRenderer
      .createBundleRenderer(bundle, {
        inject: false,
        clientManifest
      })
    console.log(renderer)

    await serverRender(ctx, renderer, template)
  }
}

const ssr = () => {
  const bundle = require('../../server-build/entry-server.js').default
  const clientManifest = require('../../public/vue-ssr-client-manifest.json')
  const renderer = VueServerRenderer.createRenderer(
    {
      inject: false,
      clientManifest
    }
  )

  return async (ctx, next) => {
    await serverRender(ctx, renderer, template, bundle)
  }
}

module.exports = isProd ? ssr : devSsr

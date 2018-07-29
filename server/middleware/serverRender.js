const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')

let renderer
const isProd = process.env.NODE_ENV === 'production'
const serverBundleFileName = 'vue-ssr-server-bundle.json'
const clientManifestFileName = 'vue-ssr-client-manifest.json'
const serverConfing = require('../../build/webpack.server.config')

const templatePath = path.resolve(__dirname, '../../client/index.template.html')
const template = fs.readFileSync(templatePath, 'utf-8')
const proConfig = require('../../config')
const { title } = proConfig.html

const createRenderer = (bundle, options = {}) => {
  renderer = createBundleRenderer(bundle, Object.assign({
    template,
    cache: LRU({
      max: 1000
    }),
    runInNewContext: false
  }, options))
}

const serverRender = () => {
  return async (ctx, next) => {
    if (isProd) {
      const serverBundlePath = path.join(serverConfing.output.path, serverBundleFileName)
      createRenderer(require(serverBundlePath), {
        clientManifest: require(`${serverConfing.output.path}/${clientManifestFileName}`)
      })
    }
    let req = ctx.req
    ctx.type = 'html'
    const context = { url: req.url, title }
    function renderToStringPromise() {
      return new Promise((resolve, reject) => {
        renderer.renderToString(context, (err, html) => {
          if (err) {
            console.log(err)
          }
          resolve(html)
        })
      })
    }
    ctx.body = await renderToStringPromise()
  }
}

module.exports = { createRenderer, serverRender }

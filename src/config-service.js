const Koa = require('koa')
const Router = require('koa-router')
const {parse} = require('url')
const {config} = require('./class')

module.exports = class ConfigService {
  constructor ({
    pollingTimeout
  }) {
    this._options = {
      pollingTimeout
    }

    this._config = config

    this._app = new Koa()
    const router = this._router = new Router()

    router.get('/configs/:appId/:cluster/:namespaceName', ctx => {
      const {
        appId,
        cluster,
        namespaceName
      } = ctx.params

      const namespace = this._config
      .app(appId)
      .cluster(cluster)
      .namespace(namespaceName)

      if (!namespace.published()) {
        ctx.status = 404
        return
      }

      const {
        query: {
          releaseKey: rk
        }
      } = parse(ctx.url, true)

      if (namespace.match(rk)) {
        ctx.status = 304
        return
      }

      const {
        configurations,
        releaseKey
      } = namespace

      ctx.body = {
        appId,
        cluster,
        namespaceName,
        configurations,
        releaseKey
      }
    })

    router.get('/configfiles/json/:appId/:cluster/:namespaceName', ctx => {
      const {
        appId,
        cluster,
        namespaceName
      } = ctx.params

      const namespace = this._config
      .app(appId)
      .cluster(cluster)
      .namespace(namespaceName)

      if (!namespace.published()) {
        ctx.status = 404
        return
      }

      ctx.body = namespace.configurations
    })
  }
}

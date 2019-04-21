const Koa = require('koa')
const Router = require('koa-router')
const {parse} = require('url')

const {config} = require('./class')

module.exports = class ConfigService {
  constructor ({
    pollingTimeout = 60000
  }) {
    this._options = {
      pollingTimeout
    }

    this._config = config

    const app = this._app = new Koa()
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

    router.get('/notifications/v2', async ctx => {
      const {
        query: {
          appId,
          cluster,
          notifications: n
        }
      } = parse(ctx.url, true)

      const c = this._config
      .app(appId)
      .cluster(cluster)

      const notifications = JSON.parse(n)

      if (!c.match(notifications)) {
        ctx.body = c.notifications
        return
      }

      return new Promise(resolve => {
        const onNotification = n11s => {
          /* eslint-disable no-use-before-define */
          clearTimeout(timer)

          ctx.body = n11s
          resolve()
        }

        const timer = setTimeout(() => {
          c.off('notification', onNotification)
          ctx.status = 304
          resolve()
        }, this._options.pollingTimeout)

        c.on('notification', onNotification)
      })
    })

    app.use(router.routes())
    app.use(router.allowedMethods())
  }

  callback () {
    return this._app.callback()
  }
}

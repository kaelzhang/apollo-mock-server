const {parse} = require('url')
const {BaseService} = require('./class')

module.exports = class ConfigService extends BaseService {
  constructor ({
    pollingTimeout = 60000
  }) {
    super({
      pollingTimeout
    })

    this._fetchDisabled = false
    this._notificationDisabled = false
    this._fetchError = false
  }

  enableFetchError (enable) {
    this._fetchError = enable
  }

  enableFetch (enable) {
    this._fetchDisabled = !enable
  }

  enableUpdateNotification (enable) {
    this._notificationDisabled = !enable
  }

  _route (router) {
    router.get('/configs/:appId/:cluster/:namespaceName', ctx => {
      if (this._fetchError) {
        ctx.body = '{boooooooooooooom!}'
        return
      }

      if (this._fetchDisabled) {
        ctx.status = 404
        return
      }

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
      if (this._fetchError) {
        ctx.body = '{boooooooooooooom!}'
        return
      }

      if (this._fetchDisabled) {
        ctx.status = 404
        return
      }

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
      if (this._notificationDisabled) {
        ctx.status = 404
        return
      }

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
  }
}

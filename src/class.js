// const Koa = require('koa')
const EventEmitter = require('events')

const Koa = require('koa')
const Router = require('koa-router')
const getPort = require('get-port')

const uuid = require('uuid/v4')

const NOOP = () => {}

class Base extends EventEmitter {
  constructor (options, Child, key) {
    super()

    this._options = options
    this._Child = Child
    this._children = Object.create(null)
    this._key = key
  }

  _child (name, init = NOOP) {
    if (name in this._children) {
      return this._children[name]
    }

    const child = this._children[name] = new this._Child({
      ...this._options,
      [this._key]: name
    })

    init(child)
    return child
  }
}

class Namespace extends Base {
  constructor (options) {
    super(options)

    this._configs = Object.create(null)
    this._notificationId = 0
    this._releaseKey = null
  }

  setNotificationId (id) {
    this._notificationId = id
    this.emit('notification', id)
    return this
  }

  set (key, value) {
    this._configs[key] = value
    return this
  }

  publish () {
    this.setNotificationId(++ this._notificationId)
    this._releaseKey = uuid()
    return this
  }

  published () {
    return !!this._releaseKey
  }

  match (key) {
    return this._releaseKey = key
  }

  get releaseKey () {
    return this._releaseKey
  }

  get configurations () {
    return {
      ...this._configs
    }
  }

  has (key) {
    return key in this._configs
  }

  get (key) {
    return this._configs[key]
  }
}

const REGEX_REPLACE_JSON = /\.json$/i

class Cluster extends Base {
  constructor (options) {
    super(options, Namespace, 'namespace')
    this._notificationIds = Object.create(null)
  }

  namespace (namespace) {
    return this._child(namespace, child => {
      this._notificationIds[namespace] = 0
      child.on('notification', id => {
        this._notificationIds[namespace] = id
        this.emit('notification', this.notifications)
      })
    })
  }

  match (notifications) {
    return notifications.every(({
      namespaceName,
      notificationId
    // TODO: about application.json
    }) => {
      const namespace = namespaceName.replace(REGEX_REPLACE_JSON, '')
      return this._notificationIds[namespace] === notificationId
    })
  }

  get notifications () {
    return Object.keys(this._notificationIds).map(namespaceName => ({
      namespaceName,
      notificationId: this._notificationIds[namespaceName]
    }))
  }
}

class App extends Base {
  constructor (options) {
    super(options, Cluster, 'cluster')
  }

  cluster (cluster) {
    return this._child(cluster)
  }
}

class Config extends Base {
  constructor () {
    super({}, App, 'appId')
  }

  app (appId) {
    return this._child(appId)
  }
}

const config = new Config()

class BaseService {
  constructor (options) {
    this._options = options
    this._config = config

    const app = this._app = new Koa()
    const router = this._router = new Router()

    this._route(router)

    app.use(router.routes())
    app.use(router.allowedMethods())
  }

  _route () {
    throw new Error('_route should be implemented')
  }

  async listen (port) {
    port = port || await getPort()

    return new Promise(resolve => {
      this._app.listen(port, () => {
        resolve(port)
      })
    })
  }

  callback () {
    return this._app.callback()
  }
}

module.exports = {
  config,
  Config,
  BaseService
}

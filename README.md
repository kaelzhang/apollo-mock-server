[![Build Status](https://travis-ci.org/kaelzhang/apollo-mock-server.svg?branch=master)](https://travis-ci.org/kaelzhang/apollo-mock-server)
[![Coverage](https://codecov.io/gh/kaelzhang/apollo-mock-server/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/apollo-mock-server)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/apollo-mock-server?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/apollo-mock-server)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/apollo-mock-server.svg)](http://badge.fury.io/js/apollo-mock-server)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/apollo-mock-server.svg)](https://www.npmjs.org/package/apollo-mock-server)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/apollo-mock-server.svg)](https://david-dm.org/kaelzhang/apollo-mock-server)
-->

# apollo-mock-server

A mock server of Ctrip's apollo configuration service.

This is a mock server only for testing, so it barely has any argument type checking and fault tolerance.

## Install

```sh
$ npm i apollo-mock-server
```

## Usage

```js
const {ConfigService} = require('apollo-mock-server')

require('http').createServer(
  new ConfigService({
    pollingTimeout: 3000
  }).callback()
)
.listen(8888)
```

## new ConfigService(options)

- **options** `Object`
  - **pollingTimeout** `number=60000` If there is no update notifications in `options.pollingTimeout` milliseconds, then config service will tell the client with status `304`
  - **configDelay** `number=0` The APIs to get the configuration will be delayed in `configDelay`. This option is to mimic the timeout scenarios.

### config.callback(): Function

Return a callback function suitable for the http.createServer() method to handle a request.

### config.listen(port?): Promise&lt;port&gt;

- **port?** `number` port to listen

Listen to a port. If `port` is not specified, it will get an available port by using [`get-port`](https://npmjs.org/package/get-port)

Returns a promise of the `port` used

```js
config.listen()
.then(port => {
  console.log(`server started at http://127.0.0.1:${port}`)
})
```

### config.enableFetch(enable)

Enable or disable the API of get configurations, including both:

- `/configs`
- `/configfiles`

If disabled, the two APIs will both response with status 404

### config.enableFetchError(enable)

If enabled, the two APIs above will response a bad JSON string

### config.enableUpdateNotification(enable)

If disabled, the API `/notifications/v2` will response with status 404

## superAdmin

The admin client for super user

```js
const {superAdmin} = require('apollo-mock-server')

superAdmin
.app('my-application')
.cluster('default')
.namespace('application')

// Changes the config value
.set('portal.elastic.cluster.name', 'hermes-es-jp')

// Emit update notifications
.publish()
```

## License

[MIT](LICENSE)

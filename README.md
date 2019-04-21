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

A mock server of Ctrip's apollo configuration service

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

## License

[MIT](LICENSE)

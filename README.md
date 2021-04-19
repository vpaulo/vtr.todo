# Rminder
Keep track of your tasks


## Plugins
http://karma-runner.github.io/6.3/dev/plugins.html
https://cdn.jsdelivr.net/npm/karma-testdouble@1.0.2/index.js

var path = require('path')

var pattern = function (file) {
  return {
    pattern: file,
    included: true,
    served: true,
    watched: false
  }
}

var framework = function (files) {
  files.unshift(pattern(path.resolve(require.resolve('testdouble'), '../../dist/testdouble.js')))
}

framework.$inject = ['config.files']

module.exports = {
  'framework:testdouble': ['factory', framework]
}

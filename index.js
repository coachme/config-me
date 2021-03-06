/**
 * Config-Me simple configuration module for node.js
 *
 * Parts of this are taken directly from Express with some modifications.
 *
 * It can read a config directory, load all .js files in there and attach the objects found to the main config module.
 * It doesn't enforce a configuration format for the files, but it's expected that these are objects or arrays. Base
 * properties can be retrieved with the get method and changed with the set method.
 *
 * @author Ricardo Graça <ricardo@devius.net>
 * @copyright MeApps Corporation, 2013
 */
var path = require('path')
var fs = require('fs')
var currentEnvironment = process.env.NODE_ENV || 'development'

function toArray(values) {
  var args = new Array(values.length)

  for (var i = 0; i < args.length; ++i) {
    args[i] = values[i]
  }

  return args
}

function camelCase(filename) {
  var basename = path.basename(filename, '.js')

  return basename.replace(/[-_](\S)/g, function(match, substring) {
    return substring.toUpperCase()
  })
}

function mergeObjects(base, source) {
  for (var key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!base[key]) base[key] = {}
      mergeObjects(base[key], source[key])
    }
    else {
      base[key] = source[key]
    }
  }
}

function load(settings) {
  var isArray = Array.isArray(settings)
  var hasCommonSettings = Object.keys(settings).indexOf('common') > -1
  var hasEnvSettings = Object.keys(settings).indexOf(currentEnvironment) > -1
  var compositeSettings = {}

  if (isArray || !(hasCommonSettings || hasEnvSettings)) return settings
  if (hasCommonSettings) mergeObjects(compositeSettings, settings.common)
  if (hasEnvSettings) mergeObjects(compositeSettings, settings[currentEnvironment])

  return compositeSettings
}

module.exports = {
  settings: {},

  // Read all the files from path and add any configuration files to the config object
  loadDir: function(targetPath) {
    if (typeof targetPath !== 'string')
      throw new TypeError('ConfigMe loadDir function requires a string as first argument')

    fs.readdirSync(targetPath).forEach(function(filename) {
      if (!/\.js$/.test(filename)) return false
      this.loadFile(path.join(targetPath, filename))
    }, this)

    return this
  },

  loadFile: function loadFile(targetPath) {
    if (typeof targetPath !== 'string')
      throw new TypeError('loadFile function requires a string as first argument')
    if (!/\.js$/.test(targetPath))
      throw new Error('loadFile can only load .js files')

    var name = camelCase(targetPath)
    var settings = require(targetPath)
    this.settings[name] = load(settings)

    return this
  },

  push: function(setting) {
    if (!Array.isArray(this.settings[setting])) this.settings[setting] = []
    this.settings[setting] = this.settings[setting].concat(toArray(arguments).slice(1))
  },

  set: function(setting, val) {
    this.settings[setting] = val
  },

  get: function(setting) {
    return this.settings[setting]
  }
}

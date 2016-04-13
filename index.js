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

function camelCase(filename) {
  var basename = path.basename(filename, '.js')

  return basename.replace(/[-_](\S)/g, function(match, substring) {
    return substring.toUpperCase()
  })
}

function mergeObjects(base, source) {
  for (var key in source) {
    base[key] = source
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

      var name = camelCase(filename)
      var filePath = path.join(targetPath, filename)
      var settings = require(filePath)
      this.settings[name] = load(settings)
    }, this)

    return this
  },

  set: function(setting, val) {
    this.settings[setting] = val
  },

  get: function(setting) {
    return this.settings[setting]
  }
}

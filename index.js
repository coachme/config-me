/**
 * Config-Me simple configuration module for node.js
 *
 * Parts of this are taken directly from Express with some modifications.
 *
 * It can read a config directory, load all .js files in there and attach the objects found to the main config module.
 * It doesn't enforce a configuration format for the files, but it's expected that these are objects or arrays. Base
 * properties can be retrieved with the get method and changed with the set method.
 *
 * @module config-me
 * @author Ricardo Graça <ricardo@devius.net>
 */
var basename = require('path').basename
var fs = require('fs')
var currentEnvironment = process.env.NODE_ENV || 'development'

module.exports = {
  settings: {},

  // Read all the files from path and add any configuration files to the config object
  loadDir: function(path) {
    if (typeof path !== 'string')
      throw new Error('Config-Me loadDir function requires a string as first argument')

    fs.readdirSync(path).forEach(function(filename) {
      if (!/\.js$/.test(filename)) return false

      var name = basename(filename, '.js')
      this.settings[name] = require(path + '/' + filename)
    }, this)

    return this
  },

  configure: function(env, fn) {
    var envs = 'all'
    var args = [].slice.call(arguments) // Convert the arguments variable into a true array

    fn = args.pop()

    if (args.length) envs = args
    if (envs === 'all' || ~envs.indexOf(currentEnvironment)) fn.call(this)

    return this
  },

  set: function(setting, val) {
    this.settings[setting] = val
    return this
  },

  get: function(setting) {
    return this.settings[setting]
  }
}


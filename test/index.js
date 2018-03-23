var assert = require('assert')
var configMe = require('../index')
var fs = require('fs')
var path = require('path')
var util = require('util')

function reload() {
  delete require.cache[require.resolve('../index')]
  configMe = require('../index')
}

describe('ConfigMe', function() {
  beforeEach(function() {
    configMe.settings = {}
  })

  it('has a settings key', function() {
    assert(Object.keys(configMe).indexOf('settings') > -1, 'Expected the ConfigMe object to have a "settings" key')
  })

  it('has a settings key that is an object', function() {
    assert.strictEqual(typeof configMe.settings, 'object')
  })

  describe('.set()', function() {
    it('sets a key in the "settings" object', function() {
      var keyName = 'test'
      var errorMessage = 'Expected "settings" object to have a key named "%s"'

      configMe.set(keyName)
      assert(Object.keys(configMe.settings).indexOf(keyName) > -1, util.format(errorMessage, keyName))
    })

    it('stores a value in the associated key', function() {
      var keyName = 'test'
      var testValue = 'just a test'

      configMe.set(keyName, testValue)
      assert.strictEqual(configMe.settings[keyName], testValue)
    })
  })

  describe('.get()', function() {
    it('retrieves an existing value from the "settings" object', function() {
      var keyName = 'test'
      var testValue = 'just a test'
      configMe.settings[keyName] = testValue

      assert.strictEqual(configMe.get(keyName), testValue)
    })

    it('returns "undefined" if the specified key can\'t be found', function() {
      assert.strictEqual(typeof configMe.get('test'), 'undefined')
    })
  })

  describe('.loadDir()', function() {
    var envOptions = require('./data/env_options')
    var settingsPath = path.join(__dirname, 'data')

    it('throws an error if argument is not a string', function() {
      function badLoad() {
        configMe.loadDir(true)
      }

      assert.throws(badLoad, /ConfigMe loadDir function requires a string as first argument/)
    })

    it('throws an error if the path is invalid', function() {
      function badLoad() {
        configMe.loadDir('baddir')
      }

      assert.throws(badLoad, function(error) {
        return error instanceof Error && error.code === 'ENOENT'
      })
    })

    it('doesn\'t throw an error if there are any non .js files in the target directory', function() {
      var badFile = path.join(settingsPath, 'wrong-file.json')
      assert.doesNotThrow(function() { fs.statSync(badFile) })
      assert.doesNotThrow(function() { configMe.loadDir(settingsPath) })
    })

    it('loads .js files that are present in the target directory', function() {
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings).length > 0, 'Expected the "settings" object to have at least one key')
    })

    it('adds a new key to "settings" based on the filename', function() {
      var errorMessage = 'Expected the "settings" object to have the "options" key'
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings).indexOf('options') > -1, errorMessage)
    })

    it('stores the settings values found in files', function() {
      var data = require('./data/options')
      configMe.loadDir(settingsPath)
      assert.strictEqual(configMe.settings.options.option, data.option)
    })

    it('converts filenames with dashes to camel case', function() {
      var errorMessage = 'Expected the "settings" object to have the "arrayOptions" key'
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings).indexOf('arrayOptions') > -1, errorMessage)
    })

    it('converts filenames with underscores to camel case', function() {
      var errorMessage = 'Expected the "settings" object to have the "envOptions" key'
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings).indexOf('envOptions') > -1, errorMessage)
    })

    it('stores array values', function() {
      configMe.loadDir(settingsPath)
      assert(Array.isArray(configMe.settings.arrayOptions), 'Expected the "arrayOptions" key to be an array')
      assert(configMe.settings.arrayOptions.length > 0, 'Expected the array to contain some values')
    })

    it('sets the correct setting keys for the current environment', function() {
      var noRootMessage = 'Expected the "settings" object to have the "envOptions" key'
      var errorMessage = 'Expected the "envOption" key to be present'
      var unexpectedKeyMessage = 'Expected the "unique" key to not be present in the settings object'
      process.env.NODE_ENV = 'test-env'

      reload()
      configMe.loadDir(settingsPath)

      assert(Object.keys(configMe.settings).indexOf('envOptions') > -1, noRootMessage)
      assert(Object.keys(configMe.settings.envOptions).indexOf('envOption') > -1, errorMessage)
      assert(Object.keys(configMe.settings.envOptions).indexOf('unique') === -1, unexpectedKeyMessage)
    })

    it('stores the correct setting values for the current environment', function() {
      configMe.loadDir(settingsPath)
      assert.strictEqual(configMe.settings.envOptions.shared, envOptions.common.shared)
      assert.strictEqual(configMe.settings.envOptions.envOption, envOptions[process.env.NODE_ENV].envOption)
    })

    it('loads settings present in the "common" section of files', function() {
      var errorMessage = 'Expected the "shared" key to be present'
      process.env.NODE_ENV = 'test'

      reload()
      configMe.loadDir(settingsPath)

      assert(Object.keys(configMe.settings.envOptions).indexOf('shared') > -1, errorMessage)
      assert.strictEqual(configMe.settings.envOptions.shared, envOptions.common.shared)
    })

    it('overrides common settings with more specific environment settings', function() {
      var errorMessage = 'Expected the "common.option" setting to have been overrided'
      configMe.loadDir(settingsPath)
      assert.notStrictEqual(configMe.settings.envOptions.option, envOptions.common.option, errorMessage)
    })

    it('maintains common keys that don\'t exist in an environment when the values are objects', function() {
      var errorMessage = 'Expected the "testing" key to be present'
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings.envOptions.deep).indexOf('testing') > -1, errorMessage)
    })

    it('keeps arrays intact when they appear inside objects', function() {
      var errorMessage = 'Expected the "deep.things" value to be an array'
      configMe.loadDir(settingsPath)
      assert(Array.isArray(configMe.settings.envOptions.deep.things), errorMessage)
    })

    it('overrides common keys with more specific environment settings when values are objects', function() {
      var originalValue = envOptions.common.deep.something
      var errorMessage = 'Expected the "common.deep.something" setting to have been overrided'

      configMe.loadDir(settingsPath)

      assert.notStrictEqual(configMe.settings.envOptions.deep.something, originalValue, errorMessage)
    })

    it('overrides an object value inside a common key with a different type value', function() {
      var originalValue = envOptions.common.deep.extra
      var errorMessage = 'Expected the "common.deep.extra" setting to have been overrided'

      configMe.loadDir(settingsPath)

      assert.strictEqual(typeof originalValue, 'object')
      assert.notStrictEqual(configMe.settings.envOptions.deep.extra, originalValue, errorMessage)
    })

    it('loads settings from the environment matching key even without a "common" section', function() {
      var errorMessage = 'Expected the "shared" key to be present'
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings.envOptions).indexOf('option') > -1, errorMessage)
    })
  })

  describe('.loadFile()', function() {
    var settingsPath = path.join(__dirname, 'data', 'options.js')

    it('throws an error if trying to load a non .js file', function() {
      var badFile = path.join(settingsPath, '..', 'wrong-file.json')
      assert.doesNotThrow(function() { fs.statSync(badFile) })
      assert.throws(function() { configMe.loadFile(badFile) })
    })

    it('throws an error if argument is not a string', function() {
      function badLoad() {
        configMe.loadFile(true)
      }

      assert.throws(badLoad, /loadFile function requires a string as first argument/)
    })

    it('throws an error if the path is invalid', function() {
      function badLoad() {
        configMe.loadFile('badfile.js')
      }

      assert.throws(badLoad, function(error) {
        return error instanceof Error && error.code === 'MODULE_NOT_FOUND'
      })
    })

    it('loads the specified .js file', function() {
      configMe.loadFile(settingsPath)
      assert(Object.keys(configMe.settings).length > 0, 'Expected the "settings" object to have at least one key')
    })

    it('returns the config object', function() {
      var config = configMe.loadFile(settingsPath)
      assert(typeof config !== 'undefined', 'Expected config to not be undefined')
      assert.strictEqual(typeof config.get, 'function', 'Expected .get to be a function')
    })
  })

  describe('.push()', function() {
    it('creates a new key to store multiple settings if it doesn\'t exist already', function() {
      var errorMessage = 'Expected the "multipleSettings" key to be present'
      configMe.push('multipleSettings', 'value')
      assert(Object.keys(configMe.settings).indexOf('multipleSettings') > -1, errorMessage)
    })

    it('creates an array to store multiple settings if it doesn\' exist already', function() {
      var errorMessage = 'Expected the "multipleSettings" value to be an array'
      configMe.push('multipleSettings', 'value')
      assert(Array.isArray(configMe.settings.multipleSettings), errorMessage)
    })

    it('returns an array when recalled with the get method', function() {
      var errorMessage = 'Expected the "multipleSettings" value to be an array'
      configMe.push('multipleSettings', 'value')
      assert(Array.isArray(configMe.get('multipleSettings')), errorMessage)
    })

    it('pushes multiple values to the same key', function() {
      configMe.push('multipleSettings', 'value1')
      configMe.push('multipleSettings', 'value2')
      assert.strictEqual(configMe.settings.multipleSettings.length, 2)
    })

    it('stores multiple values in the same key', function() {
      var errorMessage = 'Expected value %s to be present'

      configMe.push('multipleSettings', 'value1')
      configMe.push('multipleSettings', 'value2')

      assert(configMe.settings.multipleSettings.indexOf('value1') > -1, util.format(errorMessage, 'value1'))
      assert(configMe.settings.multipleSettings.indexOf('value2') > -1, util.format(errorMessage, 'value2'))
    })

    it('accepts multiple arguments at once', function() {
      configMe.push('multipleSettings', 'value1', 'value2')
      assert.strictEqual(configMe.settings.multipleSettings.length, 2)
    })
  })
})

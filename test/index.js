var assert = require('assert')
var configMe = require('../index')
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

    it('loads the correct set of settings for the current environment', function() {
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

    it('loads settings present in the "common" section of files', function() {
      var errorMessage = 'Expected the "shared" key to be present'
      process.env.NODE_ENV = 'test'

      reload()
      configMe.loadDir(settingsPath)

      assert(Object.keys(configMe.settings.envOptions).indexOf('shared') > -1, errorMessage)
    })

    it('overrides common settings with more specific environment settings', function() {
      var envOptions = require('./data/env_options')
      var errorMessage = 'Expected the "common.option" setting to have been overrided'

      configMe.loadDir(settingsPath)
      assert.notStrictEqual(configMe.settings.envOptions.option, envOptions.common.option, errorMessage)
    })

    it('loads settings from the environment matching key even without a "common" section', function() {
      var errorMessage = 'Expected the "shared" key to be present'
      configMe.loadDir(settingsPath)
      assert(Object.keys(configMe.settings.envOptions).indexOf('option') > -1, errorMessage)
    })
  })
})

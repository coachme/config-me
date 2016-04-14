Config-Me
=========
Simple configuration module for node.js

[![Build Status](https://travis-ci.org/coachme/config-me.svg?branch=master)](https://travis-ci.org/coachme/config-me)

## Objectives

The main objective of this project is to be extremely simple. It will never have as many functionalities as other
more complex configuration modules. As part of this philosophy external dependencies are always kept at a minimum.

## Usage

```js
var config = require('config-me');

config.set('setting', 'on');
config.get('setting'); // 'on'

```
or

```js
// your_app_root/config/db.js
module.exports = {
  user: 'dbUser',
  password: 'safePassword',
  database: 'your_app_db',
  host: 'localhost',
  port: 5432
}

// your_app_root/index.js
var config = require('config-me').loadDir(__dirname + '/config');
var dbConfig = config.get('db');
var dbPort = dbConfig.port; // 5432
```

**Note:** You can use both of these approaches in the same app, but setting a previously set option will override its
value with the new one.

Currently there's no support for getting nested values using a dot notation, e.g. `config.get('db.port')`, but this will
be added in the future. For now base properties can be retrieved with the `get` method and changed with the `set`
method.

### Configuration files

There's no overly strict configuration format for the files, but it's expected that these are javascript modules that
return objects or arrays when required.

Only javascript files with a `.js` extension are currently supported.

If there is a key whose name matches the current app's environment name, or a key named "common", then the file is
treated as having environment specific settings and only the values inside the aforementioned key will be added to the
global settings object. This is explained below.

### Environment specific settings

It's possible to have different settings for different environments in the same file, and only the settings relevant to
the current app's environment will be loaded:

```js
// NODE_ENV=test
// your_app_root/config/db.js
module.exports = {
  common: {
    user: 'dbUser',
    password: 'safePassword',
    connection: {
      host: 'localhost',
      port: 5432
    }
  },
  test: {
    database: 'test_db',
    connection: {
      host: '192.168.1.10'
    }
  },
  development: {
    database: 'dev_db',
  }
}

// your_app_root/index.js
var config = require('config-me').loadDir(__dirname + '/config');
var dbConfig = config.get('db');
var dbName = dbConfig.database; // test_db
var dbHost = dbConfig.connection.host; // 192.168.1.10
var dbPort = dbConfig.connection.port; // 5432
```
Settings in a specific environment will override those defined in the "common" section. It's even possible to override
only some settings inside deep setting trees and the rest of the defaults from the common section will still be
accessible.

## About

This is inspired by the simple `set` and `get` methods of Express, but the similarities end there. There are some
additional features like the ability to read configuration files from a directory. It can read a configuration
directory, load all .js files in there and attach the objects found to the main configuration object.

## Old config-me npm module

If you are looking for version 0.1.0 of config-me that was previously published on npm you can find more info
[in this wiki page](https://github.com/coachme/config-me/wiki/Old-config-me-module). The current version of this module
is not compatible in any way with version 0.1.0.

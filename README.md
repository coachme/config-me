Config-Me
=========
Simple configuration module for node.js

---
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
## About
Parts of this are taken directly from Express, since I'm lazy and Express is beautifully written.  All I wanted was a
simple central configuration module. I did some modifications to the code so that it fits my use case better, e.g.
reading config files from a directory.

It can read a config directory, load all .js files in there and attach the objects found to the main config module.
It doesn't enforce a configuration format for the files, but it's expected that these are objects or arrays. Base
properties can be retrieved with the get method and changed with the set method.

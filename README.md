<br/>
<img src="https://github.com/hubbleio/hubble.io/raw/master/logo.png">

## Synopsis
Hubble is a simplified presentation layer on top of github.

## Motivation
Socially-centric open source documentation.

## Features

 - Uses post recieve hooks to refresh its repos
 - Uses github as the central system of record, so each artcile has
  - Watchers
  - Forks
  - Commit history
  - Contributers
  - Pull requests
 - SEO friendly
 - Easy to customize


## Installation

On the root dir of your project:

```bash
$ npm install hubble.io
```

And create a start script:

```javascript
var HubbleIO = require('hubble.io');
var options = {
  "orgname": "nodeguides",
  "title": "Node Guides",
  "tagline": "Documentation powered by GitHub and Node.js",
  "description": "Hubble.IO makes guides publications easier",
  "content": {
    "home": {
      "beginner": "Beginner Intro",
      "intermediate": "Intermediate Intro",
      "expert": "Expert Intro"
    }
  },
  "auth": {
    "github": {
      "callback_uri": "http://localhost:8080/auth/github/callback", 
      "client_id": "----client id----",
      "secret": "----secret-----"
    }
  },
  "db": {
    "url": "http://localhost:5984"
  },
  "email": {
    "sendgrid": {
      "user": "me@me.com",
      "key": "some secret key"
    }
  },
  "session": {
    "store": "memory"
  }
}

console.log('options:', options); 

var server = HubbleIO(options);

server.start(function() {
  console.log('Hubble.IO started');
});
```

Run your startup script.

Access via browser to [http://localhost:8080](http://localhost:8080).

## Options

### Overriding templates

Inside directory `server/templates` you can find a bunch of templates that are used for rendering all the pages.

You can choose to override these if you want, by supplying your own template base dir when providing the `override.templates` option like this:

```javascript
var options = {
  // ...
  override: {
    templates: __dirname + '/templates'
  }
}
```

### Overriding static file serving

Hubble.IO serves static files in the `server/public directory`.

You can override some of these and serve additional static files by supplying the `override.static` option like this:

```javascript
var options = {
  // ...
  override: {
    templates: __dirname + '/public'
  }
}
```

### CouchDB

Hubble.IO uses CouchDB for storing article requests and comments. By default it tries to connect to localhost port 5984, but you can override it by setting the `db.url` option:

```javascript
var options = {
  // ...
  db: {
    url: "http://my.couch.server.com:8081"
  }
}
```

### Session Stores

You can use a memory session store or a redis session store.

For changing that you can setup in conf:

```javascript
var options = {
  // ...
  "session": {
    "store": "redis"
  }
}
```

You can also specify timeout, hostname, port and password in session.options:

```javascript
var options = {
  // ...
  "session": {
    "store": "redis",
    "options": {
      "pass": "mypasswordforaccessingredis",
      "host": "hostname.redis.com",
      "port": 9162
    }
  }
}
```
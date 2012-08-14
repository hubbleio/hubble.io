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

### Session Stores

You can use a memory session store or a redis session store.

For changing that you can setup in conf:

```javascript
{
  // ...
  "session": {
    "store": "redis"
  }
}
```

You can also specify timeout, hostname, port and password in session.options:

```javascript
{
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
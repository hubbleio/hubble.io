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

```bash
  $ git clone git://github.com/hubbleio/hubble.io.git
  $ cd hubble.io
```

## Usage

### Setup configuration

Copy the `config/conf.json.example' into `config/conf.json` and edit at will.

    $ cp config/conf.json.example config/conf.json
    $ edit config/conf.json

You can specify an environment-specific configuration by creating file `config/conf.<env>.json` with just the differences.

For instance, you can create the file `config/conf.production.json` for when NODE_ENV is `production`.

### Start the server

Starting up the server but downloading the repos first:

```bash
  $ bin/launch
```

If you don't want this to download the repos, you can use the "-c" flag:

```bash
  $ bin/launch -c
```

Access via browser to [http://localhost:8080](http://localhost:8080).

## Session Stores

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
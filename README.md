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
  $npm install hubbleio
```

## Usage

### Setup configuration

Copy the `server/conf.json.example' into `server/conf.json` and edit at will.

    $ cp server/conf.json.example server/conf.json
    $ edit server/conf.json

### Start the server

Starting up the server but downloading the repos first:

```bash
  $ bin/launch -d
```

If you don't want this to download the repos, you can omit the "-d" flag:

```bash
  $ bin/launch
```

Access via browser to [http://localhost:8080](http://localhost:8080).
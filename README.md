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
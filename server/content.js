/*
 *
 * content.js
 * merges the content from github into the html templates 
 * and creates a repos for it in memory if one does not exist.
 *
 */

var fs = require('fs'),
    async = require('async'),
    zlib = require('zlib'),
    tar = require('tar'),
    marked = require('marked'),
    request = require('request'),
    Plates = require('plates');

var Content = module.exports = function(conf, callback) {

  var that = this;
  conf = conf || {};

  this.repos = {
    'repository-index': { 
      composed: ''
    }
  };

  this.apihost = conf.apihost || 'https://api.github.com';
  this.orgname = conf.orgname || 'hubbleio';

  this.assets = {};
};

Content.prototype.getArticle = function(name) {
  console.log('composed:', this.repos[name].composed);
  return this.repos[name].composed;
};

Content.prototype.getIndex = function() {
  return this.repos['repository-index'].composed;
};

//
// function compose()
//
// compose everything once when we start the server.
//
Content.prototype.compose = function (assets, repos) {
  var that = this;

  //
  // Compose for all items in the repos.
  //
  Object.keys(that.repos).forEach(function (name) {
    var repo = that.repos[name];
    console.log('composing', name);
    console.log('repo.files', repo.files);
    assets['article.html'].compose(repo);
  });

  //
  // if there are any updates, refresh the index.
  //
  assets['index.html'].compose(that.repos);
};

//
// function downloadAll(callback)
// @option callback {Function} what do once all done.
//
Content.prototype.downloadAll = function (callback) {

  var that = this;
  var url = this.apihost + '/orgs/' + this.orgname + '/repos';

  console.log('[hubble] Putting hubble in orbit around `' + url + '`.');

  request(url, function (err, res, body) {
    if (err) {
      return callback(err);
    }
    
    var cfg = JSON.parse(body);

    async.forEach(cfg, function (repo, next) {
      if (!that.repos[repo.name]) {
        that.repos[repo.name] = {};
      }
      
      that.repos[repo.name] = repo;
      that.download(repo.name, function() {
        next();
      });

    }, function (err) {
      return err ? callback(err) : callback();
    });
  });
};

//
// function download(repo, callback)
// @param repo {String} the name of the repo to get the zipball from
// @param callback {Function} what do once all done.
//
// grabbing the entire zipball will allow us to pull down images and other
// stuff that we might want to allow the article to include when served.
//
Content.prototype.download = function (repo, callback) {

  var that = this;

  var url = 'https://github.com/' + this.orgname + '/' + repo + '/tarball/master';
  var dir = __dirname + '/tmp';
  var queue = [];

  console.log('[hubble] Attempting to download `' + url + '`.');

  function getfiles() {

    request(url)
      .pipe(zlib.Gunzip())
      .pipe(tar.Extract({ path: dir + '/' + repo }))
      .on('entry', function(entry) {
        //
        // tell the op that we've found a file and that we are unpacking it.
        // we dont care about directories or other assets because everything
        // is hosted on github.
        //
        if (entry.type === 'File') {
          console.log('[hubble] Unpacking `' + entry.path + '`.');
          queue.push(entry.path);
        }
      })
      .on('close', function() {

        //
        // iterate over all of the files that were found in the
        // archive and then pull their contents into the repos.
        //
        async.forEach(queue, function (path, next) {
          if (~path.indexOf('article.md')) {
            that.getMarkup(repo, dir + '/' + repo + '/' + path, next);
          }
          else if (~path.indexOf('article.json')) {
            that.getMETA(repo, dir + '/' + repo + '/' + path, next);
          }
          else {
            next();
          }
        }, function (err) {
          return err ? callback(err) : callback(null, that.assets);
        });
      });
  }

  fs.stat(dir, function (err, d) {
    if (d && d.isDirectory()) {
      return getfiles();
    }

    fs.mkdir(dir, function (err) {
      if (err && err.code !== 'EEXIST') {
        return callback(err);
      }
      
      getfiles();
    });
  });
};

//
// function getMETA(repo, filename, next)
// @param repo {String} the name of the repo to get the zipball from
// @param filename {String} the name of the file that has been downloaded and extracted.
// @param next {Function} what do when done.
//
// get the configuration from the directory.
//
Content.prototype.getMETA = function (repo, filename, next) {
  var that = this;
  fs.readFile(filename, 'utf8', function (err, data) {
    var meta;

    if (err) {
      return next(err);
    }

    console.log('[hubble] Caching meta data from `' + filename + '`.');
    that.repos[repo].files = that.repos[repo].files || {};
  
    if (!that.repos[repo].files[filename]) {
      that.repos[repo].files[filename] = {};
    }

    meta = JSON.parse(data);
    that.repos[repo].meta = meta;    
    that.repos[repo].files[filename].meta = meta;

    next();
  }); 

};

//
// function getMarkup(name, filename, next)
// @param repo {String} the name of the repo to get the zipball from
// @param filename {String} the name of the file that has been downloaded and extracted.
// @param next {Function} what do when done.
//
// get the content from the directory.
//
Content.prototype.getMarkup = function (repoName, filename, next) {
  var repo = this.repos[repoName];
  var that = this;
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
      return next(err);
    }

    console.log('[hubble] Transforming markdown from `' + filename + '`.');
    repo.files = repo.files || {};
  
    if (!repo.files[filename]) {
      repo.files[filename] = {};
    }
    
    repo.files[filename].markup = data;
    repo.markup = data;
    next();
  });
};
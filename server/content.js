/*
 *
 * content.js
 * merges the content from github into the html templates 
 * and creates a cache for it in memory if one does not exist.
 *
 */

var fs = require('fs'),
    async = require('async'),
    zlib = require('zlib'),
    tar = require('tar'),
    marked = require('marked'),
    request = require('request'),
    Plates = require('plates');

var Content = function(conf, callback) {

  var that = this;
  conf = conf || {};

  this.cache = {
    'repository-index': { 
      composed: ''
    }
  };

  this.apihost = conf.apihost || 'https://api.github.com';
  this.orgname = conf.orgname || 'hubbleio';

  this.assets = {};

};

Content.prototype.getArticle = function(name) {
  return this.cache[name].composed;
};

Content.prototype.getIndex = function() {
  return this.cache['repository-index'].composed;
};

//
// function compose()
//
// compose everything once when we start the server.
//
Content.prototype.compose = function (assets, cache, name) {

  var that = this;

  //
  // if there is a name provided, compose only for that item
  // if there is no name compose for all items in the cache.
  //
  if (name) {

    assets['article.html'].compose(that.cache[name]);
  }
  else {

    Object.keys(that.cache).forEach(function(name) {

      //
      // re/build the index page that lists the repos.
      //
      assets['article.html'].compose(that.cache[name]);
    });
  }

  //
  // if there are any updates, refresh the index.
  //
  assets['index.html'].compose(that.cache);
};

//
// function downloadAll(callback)
// @option callback {Function} what do once all done.
//
Content.prototype.downloadAll = function (callback) {

  var that = this;
  var url = this.apihost + '/orgs/' + this.orgname + '/repos';

  console.log('[hubble] Putting hubble in orbit around `' + url + '`.');

  request(
    url, 
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        
        var cfg = JSON.parse(body);

        async.forEach(
          cfg,
          function(val, next) {

            if (!that.cache[val.name]) {
              that.cache[val.name] = {};
            }
            that.cache[name].meta = JSON.parse(data);

            that.download(val.name, function() {
              next();
            });

          },
          function(err) {
            if (err) {
              throw new Error(err);
            }
            return callback.call(that);
          }
        );

      }
    }
  );

};

//
// function download(name, callback)
// @param name {String} the name of the repo to get the zipball from
// @param callback {Function} what do once all done.
//
// grabbing the entire zipball will allow us to pull down images and other
// stuff that we might want to allow the article to include when served.
//
Content.prototype.download = function (name, callback) {

  var that = this;

  var url = 'https://github.com/' + 
    this.orgname + '/' + name + '/tarball/master';

  console.log('[hubble] Attempting to download `' + url + '`.');

  var dir = __dirname + '/tmp';
  var queue = [];

  fs.stat(dir, function(err, d) {

    if (d && d.isDirectory()) {
      getfiles();
    }
    else {
      fs.mkdir(dir, function(err) {
        if (err) {
          throw new Error(err);
        }
        getfiles();
      });
    }
  });

  function getfiles() {

    request(url)
      .pipe(zlib.Gunzip())
      .pipe(tar.Extract({ path: dir + '/' + name }))
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
        // archive and then pull their contents into the cache.
        //
        async.forEach(
          queue,
          function(path, next) {

            if (~path.indexOf('article.md')) {
              that.getMarkup(name, dir + '/' + name + '/' + path, next);
            }
            else if (~path.indexOf('article.json')) {
              that.getMETA(name, dir + '/' + name + '/' + path, next);
            }
            else {
              next();
            }
          },
          function(err) {

            if (err) {
              throw new Error(err);
            }
            return callback(that.assets);
          }
        );

      });
  } 
};

//
// function getMETA(name, filename, next)
// @param name {String} the name of the repo to get the zipball from
// @param filename {String} the name of the file that has been downloaded and extracted.
// @param next {Function} what do when done.
//
// get the configuration from the directory.
//
Content.prototype.getMETA = function (name, filename, next) {
  
  var that = this;
  fs.readFile(filename, function (err, data) {
    
    if (err) {
      throw err;
    }

    console.log('[hubble] Caching meta data from `' + filename + '`.');

    that.cache[name].meta = JSON.parse(data);
    next();
  }); 

};

//
// function getMarkup(name, filename, next)
// @param name {String} the name of the repo to get the zipball from
// @param filename {String} the name of the file that has been downloaded and extracted.
// @param next {Function} what do when done.
//
// get the content from the directory.
//
Content.prototype.getMarkup = function (name, filename, next) {

  var that = this;
  fs.readFile(filename, function (err, data) {

    console.log('[hubble] Transforming markdown from `' + filename + '`.');

    if (err) {
      throw new Error(err);
    }
    
    that.cache[name].markup = marked(data.toString());
    next();
  });
};

module.exports = Content;

// var url = that.apihost + '/repos/' + that.orgname + '/' + name;
// request(url, function(err, response, body) {
  
//   that.cache[name].meta.repo = JSON.parse(body);
//   callback();

// });


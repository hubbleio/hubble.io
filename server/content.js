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

Content.prototype.uses = function(assets) {

  var that = this;

  Object.keys(assets).forEach(function(assetname) {

    var asset = that.assets[assetname] = {};

    asset.raw = fs.readFileSync(__dirname + '/..' + assets[assetname].raw).toString();
    asset.composed = '';
    asset.compose = function(cachedasset) {
      cachedasset.composed = assets[assetname].compose.call(asset, cachedasset);
    }

  });
};

//
// function compose()
//
// compose everything once when we start the server.
//
Content.prototype.compose = function (name) {

  var that = this;
  var assets = this.assets;

  //
  // if there is a name provided, compose only for that item
  // if there is no name compose for all items in the cache.
  //
  if (name) {

    assets['article.html'].compose(that.cache[name]);
  }
  else {

    Object.keys(this.cache).forEach(function(name) {

      //
      // re/build the index page that lists the repos.
      //
      assets['article.html'].compose(that.cache[name]);

    });    
  }

  //
  // if there are any updates, refresh the index.
  //
  assets['index.html'].compose(this.cache);

};

//
// function downloadAll(callback)
// @option callback {Function} what do once all done.
//
Content.prototype.downloadAll = function (callback) {

  var that = this;
  var url = this.apihost + '/orgs/' + this.orgname + '/repos';

  request(
    url, 
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        
        var cfg = JSON.parse(body);

        async.forEach(
          cfg,
          function(val, next) {

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
// @option name {String} the name of the repo to get the zipball from
// @option callback {Function} what do once all done.
//
// grabbing the entire zipball will allow us to pull down images and other
// stuff that we might want to allow the article to include when served.
//
Content.prototype.download = function (name, callback) {

  var that = this;

  var url = 'https://github.com/' + 
    this.orgname + '/' + name + '/tarball/master';

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

        if (entry.type === 'File') {
          queue.push(entry.path);
        }
        
      })
      .on('close', function() {

        async.forEach(
          queue,
          function(path, next) {

            if (path.slice(-3) === '.md') {
              that.getMarkup(name, dir + '/' + name + '/' + path, next);
            }
            else if (path.slice(-5) === '.json') {
              that.getJSON(name, dir + '/' + name + '/' + path, next);
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
// function getJSON(name, callback)
// @option name {String} the name of the repo to get the zipball from
// @option callback {Function} what do once all done.
//
// get the configuration from the directory.
//
Content.prototype.getJSON = function (name, filename, callback) {
  
  var that = this;
  fs.readFile(filename, function (err, data) {
    
    if (err) {
      throw err;
    }

    if (!that.cache[name]) {
      that.cache[name] = { json: JSON.parse(data) };
    }
    else {
      that.cache[name].json = JSON.parse(data);
    }
    
    var url = that.apihost + '/repos/' + that.orgname + '/' + name;

    //
    // add the repo meta data to the json for the repo.
    //
    request(url, function(err, response, body) {
      
      that.cache[name].json.meta = JSON.parse(body);
      callback();

    });

  }); 

};

//
// function getMarkup()
// @option name {String} the name of the repo to get the zipball from
// @conf 
// @option callback {Function} what do once all done.
//
// get the content from the directory.
//
Content.prototype.getMarkup = function (name, filename, callback) {

  var that = this;
  fs.readFile(filename, function (err, data) {

    if (err) {
      throw new Error(err);
    }
    
    if (!that.cache[name]) {
      that.cache[name] = { markup: marked(data.toString()) };
    }
    else {
      that.cache[name].markup = marked(data.toString());
    }
    
    callback();
  });
};

module.exports = Content;


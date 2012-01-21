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

  this.cache = {};
  this.apihost = conf.apihost || 'https://api.github.com/orgs/';
  this.orgname = 'hubbleio';

  //
  // each asset is represented by a filename, and has three associated members.
  // @member raw {String} A string version of the untouched file.
  // @member compiled {Variant} A container for the result of the composition.
  // @member compose {Function} A function that will merge the data into the string.
  //
  this.assets = {};

};

Content.prototype.getRepo = function(reponame) {
  return this.cache[reponame].compiled;
};

Content.prototype.getIndex = function() {
  return this.cache['repository-index'].compiled;
};

Content.prototype.use = function(assets) {
  this.assets = assets;
};

//
// function composeAll()
//
// compose everything once when we start the server.
//
Content.prototype.composeAll = function () {

  var that = this;
  this.assets = assets;

  assets['index.html'].clear(that.cache[reponame]);

  Object.keys(this.cache).forEach(function(reponame) {
    
    //
    // re/build the index page that lists the repos.
    //
    assets['index.html'].compose(that.cache[reponame]);

    //
    // re/build each individual repo (article).
    //
    assets['article.html'].clear(that.cache[reponame]);
    assets['article.html'].compose(that.cache[reponame]);

  });

};

//
// function compose(reponame)
// @option reponame {String} the name of the individual repo to compose.
//
// if the postrecieve hook gets something sent to it, we'll call this
// code to recompose a specific repository.
//
Content.prototype.compose = function (reponame) {

  var that = this;
  this.assets = assets;

  assets['index.html'].clear(that.cache[reponame]);

  Object.keys(this.cache).forEach(function(reponame) {
    
    //
    // re/build the index page that lists the repos.
    //
    assets['index.html'].compose(that.cache[reponame]);

  });

  //
  // re/build the individual repo (article).
  //
  assets['article.html'].compose(that.cache[reponame]);

};

//
// function downloadAll(callback)
// @option callback {Function} what do once all done.
//
Content.prototype.downloadAll = function (callback) {

  var that = this;
  var url = this.apihost + this.orgname + '/repos';

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
// function download(reponame, callback)
// @option reponame {String} the name of the repo to get the zipball from
// @option callback {Function} what do once all done.
//
// grabbing the entire zipball will allow us to pull down images and other
// stuff that we might want to allow the article to include when served.
//
Content.prototype.download = function (reponame, callback) {

  var that = this;

  var url = 'https://github.com/' + 
    this.orgname + '/' + reponame + '/tarball/master';

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
        .pipe(tar.Extract({ path: dir + '/' + reponame }))
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
                that.getMarkup(reponame, dir + '/' + reponame + '/' + path, next);
              }
              else if (path.slice(-5) === '.json') {
                that.getJSON(reponame, dir + '/' + reponame + '/' + path, next);
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
// function getJSON(reponame, callback)
// @option reponame {String} the name of the repo to get the zipball from
// @option callback {Function} what do once all done.
//
// get the configuration from the directory.
//
Content.prototype.getJSON = function (reponame, filename, callback) {
  
  var that = this;
  fs.readFile(filename, function (err, data) {
    
    if (err) {
      throw err;
    }

    if (!that.cache[reponame]) {
      that.cache[reponame] = { json: JSON.parse(data) };
    }
    else {
      that.cache[reponame].json = JSON.parse(data);
    }
    
    callback();
  }); 

};

//
// function getMarkup()
// @option reponame {String} the name of the repo to get the zipball from
// @conf 
// @option callback {Function} what do once all done.
//
// get the content from the directory.
//
Content.prototype.getMarkup = function (reponame, filename, callback) {

  var that = this;
  fs.readFile(filename, function (err, data) {

    if (err) {
      throw new Error(err);
    }
    
    if (!that.cache[reponame]) {
      that.cache[reponame] = { markup: marked(data.toString()) };
    }
    else {
      that.cache[reponame].markup = marked(data.toString());
    }
    
    callback();
  });
};

module.exports = Content;


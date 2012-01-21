/*
 *
 * github.js
 * A simple github API abstraction for requesting raw files 
 * and getting general information about a repository.
 *
 */

var request = require('request'),
    zlib = require('zlib'),
    tar = require("tar");

var Github = function Github (conf) {

  if (!conf) {
    throw new Error('No configuration provided.');
  }

  this.cache = {};
  this.apihost = conf.apihost || 'https://api.github.com/orgs/';
  this.orgname = 'hubbleio';
};

//
// function downloadAll(callback)
//
Github.prototype.downloadAll = function (reponame, callback) {

  var that = this;
  var url = this.apihost + this.orgname + '/repos';

  request(
    url, 
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var cfg = JSON.parse(body);
        console.log(cfg.length);
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
Github.prototype.download = function (reponame, callback) {
  
  var that = this;

  var url = 'https://github.com/' + 
    this.orgname + '/' + reponame + '/zipball/master';

    request(url)
    .pipe(zlib.Gunzip())
    .pipe(
      tar.Extract({ path: __dirname + '/tmp' })
    )
    .on('end', function() {
      that.conf(callback);
    });
};

//
// function conf(reponame, callback)
// @option reponame {String} the name of the repo to get the zipball from
// @option callback {Function} what do once all done.
//
// get the configuration from the directory.
//
Github.prototype.conf = function (callback) {
  
  var that = this;

  fs.readFile(__dirname + '/tmp/artcile.json', function (err, data) {
    if (err) {
      throw err;
    }
    that.content(data, callback);
  }); 

};

//
// function content()
// @option reponame {String} the name of the repo to get the zipball from
// @option callback {Function} what do once all done.
//
// get the content from the directory.
//
Github.prototype.content = function (conf, callback) {

  var that = this;

  fs.readFile(__dirname + '/tmp/artcile.md', function (err, data) {
    if (err) {
      throw err;
    }
    
    that.cache[reponame] = {
      md: data,
      json: conf
    };

    fs.rmdir(__dirname + '/tmp', function() {
      if (err) {
        throw err;
      }
      callback(that.cache);
    });
  });
};

module.exports = Github;


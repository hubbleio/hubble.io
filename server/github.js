/*
 *
 * github.js
 * A simple github API abstraction for requesting raw files 
 * and getting general information about a repository.
 *
 */

var request = require('request');

var Github = function Github (conf) {

  if (!conf) {
    throw new Error('No configuration provided.');
  }

  this.apihost = conf.apihost || 'https://api.github.com/orgs/';
  this.orgname = 'hubbleio';
};

Github.prototype.request = function (url, callback) {

  request(
    url, 
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(JSON.parse(body));
      }
    }
  );
};

Github.prototype.repos = function (callback) {

  var url = this.apihost + this.orgname + '/repos';
  this.request(url, callback);
};

Github.prototype.repo = function (reponame, callback) {

  var url = this.apihost + this.orgname + '/repo' + reponame;
  this.request(url, callback);
};

Github.prototype.content = function (reponame, callback) {

  var url = 'https://raw.github.com/' + 
        this.orgname + '/' + reponame + '/master/content.md';

  this.request(url, callback);
};

Github.prototype.conf = function (reponame, callback) {
  
  var url = 'https://raw.github.com/' + 
        this.orgname + '/' + reponame + '/master/conf.json';
  
  this.request(url, callback);
};

module.exports = Github;


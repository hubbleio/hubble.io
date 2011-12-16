/*
 * Github API abstraction.
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
  var uri = this.apihost + this.orgname + url;
  request(
    uri, 
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body) // Print the google web page.
      }
    }
  );
};

Github.prototype.repos = function (callback) {
  this.request('/repos', callback);
};

Github.prototype.repo = function (callback) {
  this.request('/repo', callback);
};

module.exports = Github;
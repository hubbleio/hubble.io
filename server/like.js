var request = require('request');

var escape = encodeURIComponent;

var GITHUB_BASE_URL = 'https://github.com/api/v2/json';

function Like(conf) {

  return function like(repo) {
    var that = this;

    if (! this.req.session.user || ! this.req.session.user.login) {
      this.res.writeHead(403);
      return this.res.end('Please login first');
    }

    var url = GITHUB_BASE_URL + '/repos/watch/' + escape(repo.github.owner.login || repo.owner) + '/' + escape(repo.github.name) +
      '?access_token=' + escape(this.req.session.github.accessToken);

    console.log(url);

    function error(err) {
      console.error(err);
      that.res.writeHead(500);
      that.res.end(err.message);
    }

    console.log('1', repo.github);

    request.post(url, function(err, response) {
      console.log('github replied');
      if (err) { return error(err); }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (response.statusCode === 404) {
          return error(new Error('You already watch this repo'));
        }
        return error(new Error('Reply to github watch was status code:' + response.statusCode));
      }

      var url = GITHUB_BASE_URL + '/repos/show/' + escape(repo.github.owner.login || repo.github.owner) + '/' + escape(repo.github.name);
      console.log(url);
      request.get(url, function(err, resp, body) {
        console.log('github replied 2');
        if (err) { return error(err); }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return error(new Error('Reply from github repo get:' + response.statusCode));
        }

        try {
          repo.github = JSON.parse(body).repository;
        } catch(err) {
          return error(err);
        }

        console.log('2', repo.github);

        that.res.writeHead(201);
        that.res.end(repo.github.watchers.toString());

      });

    });

  }

}


module.exports = Like;
var githubAuth = require('../github_auth');

module.exports = function(options) {
  return {
    '/logout': {
      get: options.respond(function() {
        githubAuth(options.conf.auth.github, this.req, this.res).logout();
      })
    },
    '/github/callback': {
      get: options.respond(function() {
        githubAuth(options.conf.auth.github, this.req, this.res).end();
      }),
      post: options.respond(function() {
        githubAuth(options.conf.auth.github, this.req, this.res).end();
      })
    },
    '/github': {
      get: options.respond(function() {
        githubAuth(options.conf.auth.github, this.req, this.res).begin();
      })
    }
  };
};